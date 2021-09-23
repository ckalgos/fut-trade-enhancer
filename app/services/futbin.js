import { networkCallWithRetry } from "../utils/commonUtil";
import { getValue, setValue } from "./repository";

export const fetchPricesFromFutBin = (definitionId, retries) => {
  if (getValue(definitionId)) {
    return new Promise((resolve, reject) => {
      resolve(getValue(definitionId));
    });
  }
  return networkCallWithRetry(
    fetchPrices.bind(null, definitionId),
    0.5,
    retries
  );
};

export const getSbcPlayersInfoFromFUTBin = async (squadId) => {
  const futBinUrl = `https://www.futbin.com/21/squad/${squadId}/sbc`;
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
              playerDetail[0].dataset.definitionId,
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

const fetchPrices = (definitionId) => {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: `https://www.futbin.com/21/playerPrices?player=${definitionId}`,
      onload: (res) => {
        if (res.status === 200) {
          res.expiryTimeStamp = new Date(Date.now() + 15 * 60 * 1000);
          setValue(definitionId, res);
          resolve(res);
        } else {
          reject(res);
        }
      },
    });
  });
};
