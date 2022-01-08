import { getValue } from "../services/repository";
import { convertToSeconds, getRandWaitTime, wait, getRandNumberInRange } from "./commonUtil";
import { getBuyBidPrice, getSellBidPrice, roundOffPrice } from "./priceUtil";

export const listForPrice = async (sellPrice, player, futBinPercent) => {
  sellPrice = parseInt(sellPrice.replace(/[,.]/g, ""));
  await getPriceLimits(player);
  if (sellPrice) {
    futBinPercent = getRandNumberInRange(futBinPercent) || 100;
    const duration = getValue("EnhancerSettings")["idFutBinDuration"] || "1H";
    let calculatedPrice = (sellPrice * futBinPercent) / 100;
    if (player.hasPriceLimits()) {
      calculatedPrice = roundOffPrice(
        Math.min(
          player._itemPriceLimits.maximum,
          Math.max(player._itemPriceLimits.minimum, calculatedPrice)
        )
      );

      if (calculatedPrice === player._itemPriceLimits.minimum) {
        calculatedPrice = getBuyBidPrice(calculatedPrice);
      }
    }
    calculatedPrice = roundOffPrice(calculatedPrice, 200);
    services.Item.list(
      player,
      getSellBidPrice(calculatedPrice),
      calculatedPrice,
      convertToSeconds(duration) || 3600
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
