import { getValue } from "../services/repository";
import { convertToSeconds, getRandWaitTime, wait } from "./commonUtil";
import { getBuyBidPrice, getSellBidPrice, roundOffPrice } from "./priceUtil";

export const listForPrice = async (
  sellPrice,
  player,
  ignoreRoundOff,
  startPrice
) => {
  await getPriceLimits(player);
  if (sellPrice) {
    const duration = getValue("EnhancerSettings")["idFutBinDuration"] || "1H";
    if (player.hasPriceLimits()) {
      if (!ignoreRoundOff) {
        sellPrice = computeSellPrice(sellPrice, player);
      } else {
        if (
          sellPrice < player._itemPriceLimits.minimum ||
          sellPrice > player._itemPriceLimits.maximum
        ) {
          return [false];
        }
      }
    }
    sellPrice = roundOffPrice(sellPrice, 200);
    services.Item.list(
      player,
      startPrice || getSellBidPrice(sellPrice),
      sellPrice,
      convertToSeconds(duration) || 3600
    );
    await wait(getRandWaitTime("3-8"));
  }
  return [true, sellPrice];
};

const computeSellPrice = (sellPrice, player) => {
  sellPrice = roundOffPrice(
    Math.min(
      player._itemPriceLimits.maximum,
      Math.max(player._itemPriceLimits.minimum, sellPrice)
    )
  );

  if (sellPrice === player._itemPriceLimits.minimum) {
    sellPrice = getBuyBidPrice(sellPrice);
  }
  return sellPrice;
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
