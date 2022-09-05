import { trackMarketPrices } from "../services/analytics";
import { getUserPlatform } from "../services/user";
import { appendCardPrice, appendSectionPrices } from "../utils/priceAppendUtil";

const formRequestPayLoad = async (listRows) => {
  const platform = getUserPlatform();
  const trackPayLoad = [];
  listRows.forEach(({ data }) => {
    const {
      id,
      definitionId,
      _auction: {
        buyNowPrice,
        tradeId: auctionId,
        expires: expiresOn,
        _tradeState: tradeState,
      },
      resourceId,
      type,
    } = data;

    const expireDate = new Date();
    expireDate.setSeconds(expireDate.getSeconds() + expiresOn);
    tradeState === "active" &&
      type === "player" &&
      trackPayLoad.push({
        definitionId,
        price: buyNowPrice,
        expiresOn: expireDate,
        id: id + "",
        auctionId,
        platform,
        resourceId,
      });
  });

  if (trackPayLoad.length && trackPayLoad.length < 12) {
    trackMarketPrices(trackPayLoad);
  }
};

export const paginatedResultOverride = () => {
  const paginatedRenderList = UTPaginatedItemListView.prototype._renderItems;
  const setSectionHeader = UTSectionedItemListView.prototype.setHeader;

  const relistSupportedSections = new Set();

  UTPaginatedItemListView.prototype._renderItems = function (...args) {
    const result = paginatedRenderList.call(this, args);
    appendCardPrice(
      this.listRows.map(({ __root, __auction, data }) => ({
        __root,
        __auction,
        data,
      }))
    );
    formRequestPayLoad(this.listRows);
    return result;
  };

  UTSectionedItemListView.prototype.setHeader = function (
    section,
    text,
    ...args
  ) {
    const result = setSectionHeader.call(this, section, text, ...args);
    if (!relistSupportedSections.size) {
      populateRelistSupportedSection();
    }
    appendSectionPrices({
      listRows: this.listRows.map(({ __root, __auction, data }) => ({
        __root,
        __auction,
        data,
      })),
      headerElement: $(this._header.__root),
      isRelistSupported: relistSupportedSections.has(text),
      sectionHeader: text,
    });
    return result;
  };

  const populateRelistSupportedSection = () => {
    [
      services.Localization.localize("infopanel.label.addplayer"),
      services.Localization.localize("tradepile.button.relistall"),
      services.Localization.localize("infopanel.label.alltoclub"),
      services.Localization.localize("infopanel.label.storeAllInClub"),
    ].forEach((section) => relistSupportedSections.add(section));
  };
};
