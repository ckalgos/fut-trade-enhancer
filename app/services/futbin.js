import { appendFutBinPrice } from "../function-overrides/common-override/appendFutBinPrice";
import { networkCallWithRetry } from "../utils/commonUtil";
import { setValue } from "./repository";

export const fetchPricesFromFutBinBulk = (
  playersRequestMap,
  playersId,
  platform
) => {
  const playersIdArray = Array.from(playersId);
  const playerId = playersIdArray.shift();
  const refIds = playersIdArray.join(",");
  fetchPricesFromFutBin(playerId, refIds, 5).then((res) => {
    if (res.status === 200) {
      const futBinPrices = JSON.parse(res.responseText);
      for (let value of playersRequestMap.values()) {
        let {
          definitionId,
          buyNowPrice,
          bidPrice,
          auctionElement,
          rootElement,
        } = value;
        const futbinLessPrice =
          futBinPrices[definitionId] &&
          futBinPrices[definitionId].prices[platform].LCPrice;
        const cacheValue = {
          expiryTimeStamp: new Date(Date.now() + 15 * 60 * 1000),
          price: futbinLessPrice,
        };
        setValue(definitionId, cacheValue);
        appendFutBinPrice(
          futbinLessPrice,
          buyNowPrice,
          bidPrice,
          auctionElement,
          rootElement
        );
      }
    }
  });
};

export const fetchPricesFromFutBin = (definitionId, refIds, retries) => {
  return networkCallWithRetry(
    fetchPrices.bind(null, definitionId, refIds),
    0.5,
    retries
  );
};

export const getSbcPlayersInfoFromFUTBin = async (squadId) => {
  const futBinUrl = `https://www.futbin.com/22/squad/${squadId}/sbc`;
  return new Promise((resolve) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: futBinUrl,
      onload: (res) => {
        if (res.status !== 200) {
          return resolve(null);
        }

        const playersDetail = jQuery(res.response).find(".cardetails");

        const playerIds = {};
        playersDetail.each((_, player) => {
          if (jQuery(player).hasClass("hide")) {
            return;
          }
          const playerDetail = jQuery(player).find("a > div");

          if (playerDetail.length) {
            const definitionId = parseInt(
              playerDetail[0].dataset.resourceId,
              10
            );
            const playerPos = playerDetail[0].dataset.formposOriginal;
            playerIds[definitionId] = playerPos;
          }
        });
        resolve(playerIds);
      },
    });
  });
};

const fetchPrices = (definitionId, refIds) => {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: `https://www.futbin.com/22/playerPrices?player=${definitionId}&rids=${refIds}`,
      onload: (res) => {
        if (res.status === 200) {
          resolve(res);
        } else {
          reject(res);
        }
      },
    });
  });
};
