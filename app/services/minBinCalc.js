import { getRandWaitTime, wait } from "../utils/commonUtil";
import { sendPinEvents } from "../utils/notificationUtil";
import { getSellBidPrice, roundOffPrice } from "../utils/priceUtil";

export const calculatePlayerMinBin = async (player) => {
  const searchCriteria = new UTSearchCriteriaDTO();
  const searchModel = new UTBucketedItemSearchViewModel();
  searchCriteria.type = player.getSearchType() || SearchType.PLAYER;
  searchCriteria.defId = [player.definitionId];
  searchCriteria.category = SearchCategory.ANY;
  searchModel.searchFeature = ItemSearchFeature.MARKET;
  searchModel.defaultSearchCriteria.type = searchCriteria.type;
  searchModel.defaultSearchCriteria.category = searchCriteria.category;

  let allPrices = [];
  let itemsToConsider = 5;
  let isMinFound = false;
  let currentCount = 0;
  while (!isMinFound) {
    if (++currentCount === 10) {
      isMinFound = true;
    } else {
      sendPinEvents("Transfer Market Search");

      searchModel.updateSearchCriteria(searchCriteria);
      services.Item.clearTransferMarketCache();

      let items = await performSearch(searchModel.searchCriteria);
      if (items.length) {
        allPrices = allPrices.concat(items.map((i) => i._auction.buyNowPrice));
        const currentMin = Math.min(
          ...items.map((i) => i._auction.buyNowPrice)
        );

        if (items.length < 5) {
          isMinFound = true;
        }

        let currentCalcBin = roundOffPrice(getSellBidPrice(currentMin));

        if (currentCalcBin === searchCriteria.maxBuy) {
          isMinFound = true;
        } else {
          searchCriteria.maxBuy = roundOffPrice(getSellBidPrice(currentMin));
        }
        await wait(getRandWaitTime("3-5"));
      } else {
        isMinFound = true;
      }
    }
  }
  allPrices = allPrices.sort((a, b) => a - b).slice(0, itemsToConsider);

  if (allPrices.length) {
    const avgMin = roundOffPrice(
      allPrices.reduce((acc, curr) => acc + curr, 0) / allPrices.length
    );
    const min = allPrices[0];
    return {
      min,
      avgMin,
      allPrices,
    };
  }

  return null;
};

const performSearch = function (criteria) {
  return new Promise((resolve, reject) => {
    services.Item.searchTransferMarket(criteria, 1).observe(
      this,
      function (sender, response) {
        if (response.success) {
          sendPinEvents("Transfer Market Results - List View");
          sendPinEvents("Item - Detail View");
          resolve(response.data.items);
        } else {
          resolve([]);
        }
      }
    );
  });
};
