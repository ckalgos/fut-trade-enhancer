import { idAutoBuyMin, idPageNumber } from "../app.constants";
import { getValue, setValue } from "../services/repository";
import { t } from "../services/translate";
import { generateTextInput } from "../utils/uiUtils/generateTextInput";
import {
  generateToggleInput,
  resetKeyToDefault,
} from "../utils/uiUtils/generateToggleInput";

export const filterViewOverride = () => {
  const filterViewApper =
    UTMarketSearchFiltersViewController.prototype.viewDidAppear;
  const getPageIndex =
    UTTransferMarketPaginationViewModel.prototype.getCurrentPageIndex;
  const filterDealloc = UTMarketSearchFiltersViewController.prototype.dealloc;

  JSUtils.inherits(
    UTMarketSearchFiltersViewController,
    UTMarketSearchFiltersViewController
  );

  const resetPageSettings = (isResetAutoBuy) => {
    const enhancerSetting = getValue("EnhancerSettings") || {};
    isResetAutoBuy && (enhancerSetting["idAutoBuyMin"] = false);
    enhancerSetting["idPageNumber"] = 1;
    setValue("EnhancerSettings", enhancerSetting);
  };

  UTTransferMarketPaginationViewModel.prototype.getCurrentPageIndex = function (
    ...args
  ) {
    const { idPageNumber } = getValue("EnhancerSettings");
    if (idPageNumber !== 1 && this.pageIndex === 1) {
      this.pageIndex = idPageNumber;
      resetPageSettings();
    }
    return getPageIndex.call(this, ...args);
  };

  UTMarketSearchFiltersViewController.prototype.dealloc = function (...args) {
    resetPageSettings(true);
    return filterDealloc.call(this, ...args);
  };

  UTMarketSearchFiltersViewController.prototype.viewDidAppear = function (
    ...args
  ) {
    const result = filterViewApper.call(this, ...args);
    resetKeyToDefault("idAutoBuyMin");
    let view = this.getView();
    let root = $(view.__root);
    root.find(".settings-field").remove();
    root
      .find(".ut-item-search-view")
      .first()
      .prepend(
        `${generateToggleInput(
          t("autoBuyLowest"),
          { idAutoBuyMin },
          "",
          false,
          "settings-field autoBuyMin"
        )}`
      );
    root
      .find(".search-prices")
      .first()
      .append(
        `${generateTextInput(
          t("pageNumber"),
          1,
          { idPageNumber },
          t("pageNumberInfo"),
          "1"
        )}`
      );
    return result;
  };
};
