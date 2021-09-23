export const appendFutBinPrice = (
  definitionId,
  buyNowPrice,
  bidPrice,
  platform,
  response,
  auctionElement,
  rootElement
) => {
  const futBinPrices = JSON.parse(response);
  let futbinLessPrice =
    futBinPrices[definitionId] &&
    futBinPrices[definitionId].prices[platform].LCPrice;
  if (!auctionElement.find(".futbinprice").length) {
    auctionElement.prepend(`
        <div class="auctionValue futbinprice">
          <span class="label">FUT Bin</span>
          <span class="currency-coins value">${futbinLessPrice || "---"}</span>
        </div>`);
  }
  if (futbinLessPrice) {
    futbinLessPrice = futbinLessPrice.toString().replace(/[,.]/g, "");
    if (buyNowPrice) {
      futbinLessPrice > buyNowPrice && rootElement.addClass("futbinLessPrice");
    }
    if (bidPrice) {
      futbinLessPrice > bidPrice && rootElement.addClass("futbinLessPrice");
    }
  }
};
