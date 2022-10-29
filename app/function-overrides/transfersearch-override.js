import { MAX_CLUB_SEARCH, MAX_MARKET_SEARCH } from "../app.constants";
import { trackMarketPrices } from "../services/analytics";
import { getValue } from "../services/repository";
import { getRandNum } from "../utils/commonUtil";
import { resetKeyToDefault } from "../utils/uiUtils/generateToggleInput";

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
    updateSearchCriteria(...params);
    const { idAutoBuyMin, idIncreaseSearchResult } =
      getValue("EnhancerSettings");
    resetKeyToDefault("idAutoBuyMin");
    getAppMain().getConfigRepository().configs.itemsPerPage = {
      club: MAX_CLUB_SEARCH,
      transferMarket: idIncreaseSearchResult ? 49 : MAX_MARKET_SEARCH,
    };
    const searchResponse = transferSearch.call(this, ...params);
    searchResponse.observe(this, function (sender, response) {
      if (response.success) {
        const items = [...(response.data.items || [])];
        if (items.length) {
          items.sort((a, b) => a._auction.buyNowPrice - b._auction.buyNowPrice);
          const minCard = items[0];

          if (idAutoBuyMin) {
            services.Item.bid(minCard, minCard._auction.buyNowPrice);
          }
        }
        trackMarketPrices(items);
      }
    });
    return searchResponse;
  };
};
