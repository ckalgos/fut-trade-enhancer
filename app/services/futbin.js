import { appendFutBinPrice } from "../function-overrides/common-override/appendFutBinPrice";
import { networkCallWithRetry } from "../utils/commonUtil";
import { setValue } from "./repository";

export const fetchPricesFromFutBinBulk = (
  playersRequestMap,
  playersIdArray,
  platform,
  priceValCb
) => {
  const playerIdLookup = new Set(playersIdArray);
  const playerId = playersIdArray.shift();
  const refIds = playersIdArray.join(",");
  fetchPricesFromFutBin(playerId, refIds, 5).then((res) => {
    if (res.status === 200) {
      console.log(playersIdArray);
      const futBinPrices = JSON.parse(res.responseText);
      for (let value of playersRequestMap) {
        let {
          definitionId,
          buyNowPrice,
          bidPrice,
          auctionElement,
          rootElement,
        } = value;
        if (!playerIdLookup.has(definitionId)) {
          continue;
        }
        let futbinLessPrice =
          futBinPrices[definitionId] &&
          futBinPrices[definitionId].prices[platform].LCPrice;
        const cacheValue = {
          expiryTimeStamp: new Date(Date.now() + 15 * 60 * 1000),
          price: futbinLessPrice,
        };
        priceValCb && futbinLessPrice && priceValCb(futbinLessPrice);
        setValue(definitionId, cacheValue);
        auctionElement &&
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

        const playersDetail = $(res.response).find(".cardetails");

        const playerIds = {};
        playersDetail.each((_, player) => {
          if ($(player).hasClass("hide")) {
            return;
          }
          const playerDetail = $(player).find("a > div");

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
