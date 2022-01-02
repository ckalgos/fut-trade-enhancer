import { appendFutBinPrice } from "../function-overrides/common-override/appendFutBinPrice";
import { networkCallWithRetry } from "../utils/commonUtil";
import { getValue, setValue } from "./repository";
import { getUserPlatform } from "./user";

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

export const getFutbinPlayerUrl = (player) => {
  return new Promise((resolve, reject) => {
    const existingValue = getValue(`${player.definitionId}_url`);
    if (existingValue) {
      resolve(existingValue);
      return;
    }
    const playerName =
      `${player._staticData.firstName} ${player._staticData.lastName}`.replace(
        " ",
        "+"
      );
    GM_xmlhttpRequest({
      method: "GET",
      url: `https://www.futbin.com/search?year=22&term=${playerName}`,
      onload: (res) => {
        if (res.status !== 200) {
          return resolve();
        }
        const players = JSON.parse(res.response);

        if (players.error) {
          return resolve("");
        }
        let filteredPlayer = players.filter(
          (p) => parseInt(p.rating) === parseInt(player.rating)
        );
        if (filteredPlayer.length > 1) {
          filteredPlayer = filteredPlayer.filter(
            (p) =>
              p.rare_type === player.rareflag.toString() &&
              p.club_image.endsWith(`/${player.teamId}.png`)
          );
        }
        const url = `https://www.futbin.com/22/player/${filteredPlayer[0].id}`;
        setValue(`${player.definitionId}_url`, url);
        return resolve(url);
      },
    });
  });
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

        const playersDetail = $(res.response).find(".card.cardnum");

        const platform = getUserPlatform();
        const futBinPlatform =
          platform === "ps" ? "Ps3" : platform === "xbox" ? "Xbl" : "Pc";
        const playerIds = [];
        playersDetail.each((_, playerWrapper) => {
          const { dataset: cardDataSet } = playerWrapper;
          const player = $(playerWrapper).find(".cardetails");
          if ($(player).hasClass("hide")) {
            return;
          }
          const playerDetail = $(player).find("a > div");

          if (playerDetail.length) {
            const { dataset } = playerDetail[0];
            const definitionId = parseInt(dataset.resourceId, 10);
            const positionId = parseInt(cardDataSet.cardid, 10);
            const playerPos = dataset.formposOriginal;
            const price = dataset[`price${futBinPlatform}`];
            playerIds.push({
              definitionId,
              position: playerPos,
              price,
              positionId,
            });
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
