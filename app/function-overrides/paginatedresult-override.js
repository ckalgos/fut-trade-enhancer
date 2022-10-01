import { appendCardPrice, appendSectionPrices } from "../utils/priceAppendUtil";

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
