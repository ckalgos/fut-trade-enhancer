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
    futbinLessPrice = futbinLessPrice.toString().replace(/[,.]/g, "") * 0.95;
    if (buyNowPrice) {
      futbinLessPrice > buyNowPrice && rootElement.addClass("futbinLessPrice");
    }
    if (bidPrice) {
      futbinLessPrice > bidPrice && rootElement.addClass("futbinLessPrice");
    }
  }
};
