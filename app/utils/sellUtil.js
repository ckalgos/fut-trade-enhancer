import { getRandWaitTime, wait } from "./commonUtil";
import { getSellBidPrice, roundOffPrice } from "./priceUtil";

export const listForPrice = async (sellPrice, player, futBinPercent) => {
  sellPrice = parseInt(sellPrice.replace(/[,.]/g, ""));
  await getPriceLimits(player);
  if (sellPrice) {
    futBinPercent = futBinPercent || 100;
    let calculatedPrice = roundOffPrice((sellPrice * futBinPercent) / 100);
    if (player.hasPriceLimits()) {
      calculatedPrice = Math.min(
        player._itemPriceLimits.maximum,
        Math.max(player._itemPriceLimits.minimum, calculatedPrice)
      );
    }
    services.Item.list(
      player,
      getSellBidPrice(calculatedPrice),
      calculatedPrice,
      3600
    );
    await wait(getRandWaitTime("3-8"));
  }
};

const getPriceLimits = async (player) => {
  return new Promise((resolve) => {
    if (player.hasPriceLimits()) {
      resolve();
      return;
    }
    services.Item.requestMarketData(player).observe(
      this,
      async function (sender, response) {
        resolve();
      }
    );
  });
};
