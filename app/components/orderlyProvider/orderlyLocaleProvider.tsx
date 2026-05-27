import type { ReactNode } from "react";
import {
  LocaleCode,
  LocaleEnum,
  LocaleProvider,
  defaultLanguages,
  importLocaleJsonModule,
} from "@orderly.network/i18n";
import type { AsyncResources, LocaleJsonModule } from "@orderly.network/i18n";
import { getRuntimeConfigArray } from "@/utils/runtime-config";
import { getSEOConfig, getUserLanguage } from "@/utils/seo";
import extendEnLocale from "../../locales/en.json";

const baseLoaders = import.meta.glob<LocaleJsonModule>(
  "/node_modules/@orderly.network/i18n/dist/locales/*.json",
);

const extendLoaders = import.meta.glob<LocaleJsonModule>(
  "../../locales/*.json",
);

async function loadBase(lang: LocaleCode): Promise<Record<string, string>> {
  const key = `/node_modules/@orderly.network/i18n/dist/locales/${lang}.json`;
  return importLocaleJsonModule(baseLoaders[key]);
}

async function loadExtend(lang: LocaleCode): Promise<Record<string, string>> {
  const key = `../../locales/${lang}.json`;
  return importLocaleJsonModule(extendLoaders[key]);
}

const resources: AsyncResources = async (lang) => {
  if (lang === LocaleEnum.en) {
    return extendEnLocale;
  }

  const [base, extend] = await Promise.all([loadBase(lang), loadExtend(lang)]);
  return { ...base, ...extend };
};

const getAvailableLanguages = (): string[] => {
  const languages = getRuntimeConfigArray("VITE_AVAILABLE_LANGUAGES");

  return languages.length > 0 ? languages : ["en"];
};

const getDefaultLanguage = (): LocaleCode => {
  const seoConfig = getSEOConfig();
  const userLanguage = getUserLanguage();
  const availableLanguages = getAvailableLanguages();

  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get("lang");
    if (langParam && availableLanguages.includes(langParam)) {
      return langParam as LocaleCode;
    }
  }

  if (seoConfig.language && availableLanguages.includes(seoConfig.language)) {
    return seoConfig.language as LocaleCode;
  }

  if (availableLanguages.includes(userLanguage)) {
    return userLanguage as LocaleCode;
  }

  return (availableLanguages[0] || "en") as LocaleCode;
};

const onLanguageChanged = async (lang: LocaleCode) => {
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    if (lang === LocaleEnum.en) {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", lang);
    }
    window.history.replaceState({}, "", url.toString());
  }
};

type OrderlyLocaleProviderProps = {
  children: ReactNode;
};

export const OrderlyLocaleProvider = (props: OrderlyLocaleProviderProps) => {
  const defaultLanguage = getDefaultLanguage();
  const availableLanguages = getAvailableLanguages();
  const filteredLanguages = defaultLanguages.filter((lang) =>
    availableLanguages.includes(lang.localCode),
  );

  return (
    <LocaleProvider
      resources={resources}
      locale={defaultLanguage}
      languages={filteredLanguages}
      onLanguageChanged={onLanguageChanged}
    >
      {props.children}
    </LocaleProvider>
  );
};
