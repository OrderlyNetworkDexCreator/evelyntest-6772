import { MarketsHomePage } from "@orderly.network/markets";
import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { getRuntimeConfig, getRuntimeConfigBoolean } from "@/utils/runtime-config";
import { renderSEOTags } from "@/utils/seo-tags";
import { useNavigate } from "react-router-dom";
import { withBasePath } from "@/utils/base-path";

export default function MarketsIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Markets");
  const navigate = useNavigate();

  return (
    <>
      {renderSEOTags(pageMeta, pageTitle)}
      <MarketsHomePage
        comparisonProps={{
          exchangesIconSrc:
            getRuntimeConfigBoolean("VITE_HAS_SECONDARY_LOGO")
              ? "/logo-secondary.webp"
              : undefined,
          exchangesName:
            getRuntimeConfig("VITE_ORDERLY_BROKER_NAME"),
        }}
        onSymbolChange={(symbol) => {
          navigate(withBasePath(`/perp/${symbol.symbol}`));
        }}
      />
    </>
  );
}

