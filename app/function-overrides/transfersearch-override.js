import { MAX_CLUB_SEARCH, MAX_MARKET_SEARCH } from "../app.constants";
import { getValue } from "../services/repository";
import { getRandNum } from "../utils/commonUtil";

export const transferSearchOverride = () => {
  const transferSearch = services.Item.searchTransferMarket;
  const requestItems =
    UTMarketSearchResultsViewController.prototype._requestItems;

  UTMarketSearchResultsViewController.prototype._requestItems =
    function _requestItems(l) {
      if (l === 1) {
        const ratingsRangePlayers = getValue("PlayersRatingRange") || [];
        if (ratingsRangePlayers.length) {
          const { nation, league, club } = this._searchCriteria;
          const filteredPlayers = ratingsRangePlayers
            .filter(
              (player) =>
                (nation === -1 || nation === player.nationid) &&
                (league === -1 || league === player.leagueid) &&
                (club === -1 || club === player.teamid)
            )
            .map((player) => player.id);

          if (filteredPlayers.length) {
            this._searchCriteria.maskedDefId =
              filteredPlayers[getRandNum(0, filteredPlayers.length - 1)];
          }
        }
      }
      requestItems.call(this, l);
    };

  services.Item.searchTransferMarket = function (...params) {
    getAppMain().getConfigRepository().configs.itemsPerPage = {
      club: MAX_CLUB_SEARCH,
      transferMarket: MAX_MARKET_SEARCH,
    };
    return transferSearch.call(this, ...params);
  };
};
