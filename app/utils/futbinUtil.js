import { fetchPricesFromFutBin } from "../services/futbin";
import { getValue, setValue } from "../services/repository";
import { getUserPlatform } from "../services/user";

export const addFutbinCachePrice = async (players) => {
  const platform = getUserPlatform();
  const playerIds = new Set();
  const playersLookup = [];
  for (const player of players) {
    const existingValue = getValue(player.definitionId);
    if (!existingValue) {
      playerIds.add(player.definitionId);
      playersLookup.push(player);
    }
  }
  if (playerIds.size) {
    const playersArray = Array.from(playerIds);
    while (playersArray.length) {
      const playersIdArray = playersArray.splice(0, 30);
      const playerId = playersIdArray.shift();
      const refIds = playersIdArray.join(",");
      try {
        const futBinResponse = await fetchPricesFromFutBin(playerId, refIds, 3);
        if (futBinResponse.status === 200) {
          const futBinPrices = JSON.parse(futBinResponse.responseText);
          for (let player of playersLookup) {
            if (futBinPrices[player.definitionId]) {
              const futbinLessPrice =
                futBinPrices[player.definitionId].prices[platform].LCPrice;
              const cacheValue = {
                expiryTimeStamp: new Date(Date.now() + 15 * 60 * 1000),
                price: futbinLessPrice,
              };
              setValue(player.definitionId, cacheValue);
            }
          }
        }
      } catch (err) {}
    }
  }
};
