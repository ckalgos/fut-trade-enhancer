import { getCardName } from "../../utils/futItemUtil";
import { sendRequest } from "../../utils/networkUtil";
import { sendExternalRequest } from "../externalRequest";
import { getValue, setValue } from "../repository";
import { getUserPlatform } from "../user";

const supportedConsumables = new Set(["Position", "Chemistry Style"]);

const fetchPrices = async (items) => {
  const result = new Map();

  const missingPlayerIds = new Set();
  const missingConsumables = new Map();

  for (const item of items) {
    if (!item.definitionId) {
      continue;
    }

    const priceDetail = getValue(`${item.definitionId}_futbin_price`);
    if (priceDetail) {
      result.set(`${item.definitionId}_futbin_price`, priceDetail.price);
    } else if (item.isPlayer()) {
      missingPlayerIds.add(item.definitionId);
    } else if (
      item.isTraining() &&
      supportedConsumables.has(item._staticData.name)
    ) {
      if (!missingConsumables.has(item._staticData.name)) {
        missingConsumables.set(item._staticData.name, []);
      }
      missingConsumables.get(item._staticData.name).push({
        definitionId: item.definitionId,
        subType: getCardName(item),
      });
    }
  }

  const pendingPromises = [];

  if (missingPlayerIds.size) {
    pendingPromises.push(fetchPlayerPrices(missingPlayerIds, result));
  }

  if (missingConsumables.size) {
    pendingPromises.push(fetchConsumablesPrices(missingConsumables, result));
  }
  await Promise.all(pendingPromises);

  return result;
};

const getPlayerUrl = (player) => {
  return new Promise((resolve, reject) => {
    const existingValue = getValue(`${player.definitionId}_futbin_url`);
    if (existingValue) {
      resolve(existingValue);
      return;
    }
    const playerName =
      `${player._staticData.firstName} ${player._staticData.lastName}`.replace(
        " ",
        "+"
      );
    sendExternalRequest({
      method: "GET",
      identifier: `${Math.floor(+new Date())}_getFutbinPlayerUrl`,
      url: `https://www.futbin.com/search?year=23&term=${playerName}`,
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
        const url = `https://www.futbin.com/23/player/${filteredPlayer[0].id}`;
        setValue(`${player.definitionId}_futbin_url`, url);
        return resolve(url);
      },
    });
  });
};

export const getAllChallanges = async () => {
  const futBinUrl = `https://futbin.org/futbin/api/getALLSBCChallenges`;
  return new Promise((resolve) => {
    sendExternalRequest({
      method: "GET",
      identifier: `${Math.floor(+new Date())}getAllChallanges`,
      url: futBinUrl,
      onload: (res) => {
        if (res.status !== 200) {
          return resolve(new Map());
        }

        const { data } = JSON.parse(res.response);
        const lookUp = data.reduce((acc, curr) => {
          acc.set(curr.ChallengeID, curr.chal_name);
          return acc;
        }, new Map());
        resolve(lookUp);
      },
    });
  });
};

export const getAllSBCSForChallenge = async (challengeId) => {
  const futBinUrl = `https://futbin.org/futbin/api/getStcSquads?challenge=${challengeId}`;
  return new Promise((resolve) => {
    sendExternalRequest({
      method: "GET",
      identifier: `${Math.floor(+new Date())}_getAllSBCSForChallenge`,
      url: futBinUrl,
      onload: (res) => {
        if (res.status !== 200) {
          return resolve(null);
        }

        const { squads } = JSON.parse(res.response);
        resolve(
          squads.sort(
            ({ ps_price: aPrice }, { ps_price: bPrice }) => aPrice - bPrice
          )
        );
      },
    });
  });
};

export const getSbcPlayersInfo = async (squadId) => {
  const platform = getUserPlatform();
  const futBinPlatform =
    platform === "ps" ? "PS" : platform === "xbox" ? "XB" : "PC";
  const futBinUrl = `https://futbin.org/futbin/api/getSquadByID?squadId=${squadId}&platform=${futBinPlatform}`;
  return new Promise((resolve) => {
    sendExternalRequest({
      method: "GET",
      identifier: `${Math.floor(+new Date())}_getPlayersInfoFromFUTBin`,
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

const fetchPlayerPrices = async (playerIds, result) => {
  const idsArray = Array.from(playerIds);
  const platform = getUserPlatform();
  while (idsArray.length) {
    const playersIdArray = idsArray.splice(0, 30);
    const primaryId = playersIdArray.shift();
    if (!primaryId) {
      continue;
    }
    const refIds = playersIdArray.join(",");
    try {
      const futBinResponse = await sendRequest(
        `https://www.futbin.com/23/playerPrices?player=${primaryId}&rids=${refIds}`,
        "GET",
        `${Math.floor(+new Date())}_fetchPlayerPrices`
      );

      const priceResponse = JSON.parse(futBinResponse);

      for (const id of [primaryId, ...playersIdArray]) {
        const prices = priceResponse[id].prices[platform];
        const lcPrice = prices.LCPrice;
        if (!lcPrice) {
          continue;
        }
        const cardPrice = parseInt(lcPrice.replace(/[,.]/g, ""));

        const cacheKey = `${id}_futbin_price`;
        const cacheValue = {
          expiryTimeStamp: new Date(Date.now() + 15 * 60 * 1000),
          price: cardPrice,
        };

        setValue(cacheKey, cacheValue);
        result.set(cacheKey, cardPrice);
      }
    } catch (err) {
      console.log(err);
    }
  }
};

const fetchConsumablesPrices = async (missingConsumables, result) => {
  const platform = getUserPlatform();
  const futBinPlatform =
    platform === "ps" ? "PS" : platform === "xbox" ? "XB" : "PC";
  const consumableTypes = Array.from(missingConsumables.keys());
  for (const consumableType of consumableTypes) {
    try {
      const category = consumableType.split(" ")[0];
      const futBinResponse = await sendRequest(
        `https://www.futbin.org/futbin/api/fetchConsumables?category=${category}&platformtype=${futBinPlatform}`,
        "GET",
        `${Math.floor(+new Date())}_fetchConsumablesPrices`
      );

      const priceResponse = JSON.parse(futBinResponse);
      const consumablesPriceLookUp = priceResponse.data.reduce((acc, curr) => {
        acc.set(curr.SubType.toUpperCase(), curr.LCPrice);
        return acc;
      }, new Map());
      const consumableCards = missingConsumables.get(consumableType) || [];
      for (const { definitionId, subType } of consumableCards) {
        let cardPrice = consumablesPriceLookUp.get(subType);
        const cacheKey = `${definitionId}_futbin_price`;
        if (cardPrice) {
          const cacheValue = {
            expiryTimeStamp: new Date(Date.now() + 15 * 60 * 1000),
            price: cardPrice,
          };
          setValue(cacheKey, cacheValue);
          result.set(cacheKey, cardPrice);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
};

export default {
  getPlayerUrl,
  fetchPrices,
};
