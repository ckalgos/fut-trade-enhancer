import { getValue } from "../../services/repository";

export const appendFutBinPrice = (
  futbinLessPrice,
  buyNowPrice,
  bidPrice,
  auctionElement,
  rootElement
) => {
  if (!auctionElement.find(".futbinprice").length) {
    auctionElement.prepend(`
        <div class="auctionValue futbinprice">
          <span class="label">FUT Bin</span>
          <span class="currency-coins value">${futbinLessPrice || "---"}</span>
        </div>`);
  }
  if (futbinLessPrice) {
    const enhancerSetting = getValue("EnhancerSettings") || {};
    futbinLessPrice =
      futbinLessPrice.toString().replace(/[,.]/g, "") *
      ((enhancerSetting["idBarginThreshold"] || 95) / 100);

    if (buyNowPrice && futbinLessPrice > buyNowPrice) {
      rootElement.addClass("futbinLessPrice");
    } else if (bidPrice && futbinLessPrice > bidPrice) {
      rootElement.addClass("futbinLessPrice");
    } else if (enhancerSetting["idOnlyBargain"]) {
      rootElement.addClass("hideResult");
    }
  }
};
