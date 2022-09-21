import { getValue, setValue } from "../services/repository";
import { getRandWaitTime, wait } from "./commonUtil";
import { deletePlayers, insertPlayers } from "./dbUtil";
import { sendUINotification } from "./notificationUtil";

export const savePlayersWithInRatingRange = async (rating) => {
  const playerFilteredIds = [];
  setValue("PlayersRatingRange", []);
  await deletePlayers();

  if (!rating) {
    return;
  }
  let [minRating, maxRating] = rating.split("-").map((a) => a && parseInt(a));
  const res = await $.getJSON(
    `${fut_resourceRoot}${fut_resourceBase}${fut_guid}/${fut_year}/fut/items/web/players.json`
  );

  maxRating = maxRating || minRating;

  res.LegendsPlayers.reduce(function (filtered, option) {
    if (
      (!minRating || option.r >= minRating) &&
      (!maxRating || option.r <= maxRating)
    ) {
      filtered.push(option.id);
    }
    return filtered;
  }, playerFilteredIds);

  res.Players.reduce(function (filtered, option) {
    if (
      (!minRating || option.r >= minRating) &&
      (!maxRating || option.r <= maxRating)
    ) {
      filtered.push(option.id);
    }
    return filtered;
  }, playerFilteredIds);

  for (let i = 0; i < playerFilteredIds.length; i++) {
    const isLast = i === playerFilteredIds.length - 1;
    services.Item.requestItemByDefId(playerFilteredIds[i]).observe(
      this,
      async function (sender, response) {
        let item = response.response.item;
        const playerPayLoad = {
          id: playerFilteredIds[i],
          nationid: item.nationId,
          leagueid: item.leagueId,
          teamid: item.teamId,
        };
        await insertPlayers(playerPayLoad);
        const existingPlayers = getValue("PlayersRatingRange");
        existingPlayers.push(playerPayLoad);
        setValue("PlayersRatingRange", existingPlayers);
        if (i && i % 5 === 0) {
          sendUINotification(
            `Imported ${i} of ${playerFilteredIds.length} players`
          );
        }
      }
    );

    if (!isLast) {
      await wait(getRandWaitTime("0-1"));
    }
  }
};
