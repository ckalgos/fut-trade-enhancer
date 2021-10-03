import { getRandWaitTime, wait } from "./commonUtil";
import { getSellBidPrice, roundOffPrice } from "./priceUtil";

export const listForPrice = async (sellPrice, player, futBinPercent) => {
  sellPrice = parseInt(sellPrice.replace(/[,.]/g, ""));
  if (sellPrice) {
    futBinPercent = futBinPercent || 100;
    const calculatedPrice = roundOffPrice((sellPrice * futBinPercent) / 100);
    services.Item.list(
      player,
      getSellBidPrice(calculatedPrice),
      calculatedPrice,
      3600
    );
    await wait(getRandWaitTime("3-8"));
  }
};
