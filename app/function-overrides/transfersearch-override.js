import { MAX_CLUB_SEARCH, MAX_MARKET_SEARCH } from "../app.constants";
import { getValue } from "../services/repository";
import { getRandNum } from "../utils/commonUtil";

export const transferSearchOverride = () => {
  const transferSearch = services.Item.searchTransferMarket;

  const updateSearchCriteria = (searchCriteria, page) => {
    if (page === 1 && searchCriteria.type === "player") {
      const ratingsRangePlayers = getValue("PlayersRatingRange") || [];
      if (ratingsRangePlayers.length) {
        const { nation, league, club } = searchCriteria;
        const filteredPlayers = ratingsRangePlayers
          .filter(
            (player) =>
              (nation === -1 || nation === player.nationid) &&
              (league === -1 || league === player.leagueid) &&
              (club === -1 || club === player.teamid)
          )
          .map((player) => player.id);

        if (filteredPlayers.length) {
          searchCriteria.maskedDefId =
            filteredPlayers[getRandNum(0, filteredPlayers.length - 1)];
        }
      }
    } else if (page == 1) {
      searchCriteria.maskedDefId = 0;
    }
  };

  services.Item.searchTransferMarket = function (...params) {
    getAppMain().getConfigRepository().configs.itemsPerPage = {
      club: MAX_CLUB_SEARCH,
      transferMarket: MAX_MARKET_SEARCH,
    };
    updateSearchCriteria(...params);
    return transferSearch.call(this, ...params);
  };
};
