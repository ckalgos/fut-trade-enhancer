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
        priceValCb &&
          futbinLessPrice &&
          priceValCb(futbinLessPrice, definitionId);
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

export const fetchConsumablesPricesFromFutBin = async (
  consumablesRequestMap,
  category,
  priceValCb
) => {
  const res = await networkCallWithRetry(
    fetchConsumablesPrices.bind(null, category.split(" ")[0]),
    0.5,
    5
  );

  if (res.status !== 200) {
    return;
  }
  const consumablesPrices = JSON.parse(res.responseText);
  const consumablesPriceLookUp = consumablesPrices.data.reduce((acc, curr) => {
    acc.set(curr.SubType.toUpperCase(), curr.LCPrice);
    return acc;
  }, new Map());
  for (let value of consumablesRequestMap) {
    let {
      name,
      definitionId,
      buyNowPrice,
      bidPrice,
      auctionElement,
      rootElement,
    } = value;

    let futbinLessPrice = consumablesPriceLookUp.get(name);
    priceValCb && futbinLessPrice && priceValCb(futbinLessPrice);
    const cacheValue = {
      expiryTimeStamp: new Date(Date.now() + 15 * 60 * 1000),
      price: futbinLessPrice,
    };

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

export const getAllSBCSForChallenge = async (challengeId) => {
  const futBinUrl = `https://futbin.org/futbin/api/getStcSquads?challenge=${challengeId}`;
  return new Promise((resolve) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: futBinUrl,
      onload: (res) => {
        if (res.status !== 200) {
          return resolve(null);
        }

        const { squads } = JSON.parse(res.response);
        resolve(squads);
      },
    });
  });
};

export const getSbcPlayersInfoFromFUTBin = async (squadId) => {
  const platform = getUserPlatform();
  const futBinPlatform =
    platform === "ps" ? "PS" : platform === "xbox" ? "XB" : "PC";
  const futBinUrl = `https://futbin.org/futbin/api/getSquadByID?squadId=${squadId}&platform=${futBinPlatform}`;
  return new Promise((resolve) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: futBinUrl,
      onload: (res) => {
        if (res.status !== 200) {
          return resolve(null);
        }

        const { squad_data } = JSON.parse(res.response);
        const playerIds = [];
        for (let index = 1; index <= 11; index++) {
          const playerData = squad_data[`cardlid${index}`];
          if (!playerData) {
            playerIds.push(null);
            continue;
          }

          const definitionId = parseInt(
            playerData.Player_Resource || playerData.playerid,
            10
          );
          const position = playerData.cardPosition;
          const price = playerData.price;
          playerIds.push({
            definitionId,
            position,
            price,
          });
        }
        resolve(playerIds.reverse());
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

const fetchConsumablesPrices = (category) => {
  const platform = getUserPlatform();
  const futBinPlatform =
    platform === "ps" ? "PS" : platform === "xbox" ? "XB" : "PC";
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: `https://www.futbin.org/futbin/api/fetchConsumables?category=${category}&platformtype=${futBinPlatform}`,
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
