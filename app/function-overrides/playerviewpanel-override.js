import { getValue, setValue } from "../services/repository";
import { t } from "../services/translate";

import {
  generateAfterTaxInfo,
  generateCalcMinBin,
  generateListForFutBinBtn,
  generateViewOnFutBinBtn,
} from "../utils/uiUtils/generateElements";

export const playerViewPanelOverride = () => {
  const calcTaxPrice = (buyPrice) => {
    const priceAfterTax = (buyPrice * 0.95).toLocaleString();
    $("#saleAfterTax").html(`${t("price")} ${priceAfterTax}`);
  };

  const buyPriceChanged = UTQuickListPanelView.prototype.onBuyPriceChanged;
  const quickListPanelGenerate = UTQuickListPanelView.prototype._generate;
  const defaultActionPanelGenerate =
    UTDefaultActionPanelView.prototype._generate;
  const auctionActionPanelGenerate =
    UTAuctionActionPanelView.prototype._generate;
  const quickPanelRenderView =
    UTQuickListPanelViewController.prototype.renderView;

  UTQuickListPanelView.prototype.onBuyPriceChanged = function (e, t, i) {
    buyPriceChanged.call(this, e, t, i);
    calcTaxPrice(this._buyNowNumericStepper.getValue());
  };

  UTQuickListPanelView.prototype.initFutBinEvent = function (e) {
    if (e.type !== "player") {
      $(this._futbinListFor.__root).css("display", "none");
      setTimeout(() => {
        $(".viewon").css("display", "none");
      });
      setValue("selectedPlayer", undefined);
      setValue("selectedNonPlayer", e);
      return;
    }
    $(this._futbinListFor.__root).css("display", "");
    setTimeout(() => {
      $(".viewon").css("display", "");
    });
    setValue("selectedPlayer", e);
    setValue("selectedNonPlayer", undefined);
  };

  UTQuickListPanelView.prototype._generate = function (...args) {
    if (!this._generated) {
      quickListPanelGenerate.call(this, ...args);
      this._futbinListFor = generateListForFutBinBtn();
      this.__root.children[0].appendChild(this._futbinListFor.__root);
      generateAfterTaxInfo().insertAfter($(this._buyNowNumericStepper.__root));
    }
  };

  UTQuickListPanelViewController.prototype.renderView = function () {
    quickPanelRenderView.call(this);
    let e = this.getView();
    e.initFutBinEvent(this.item);
  };

  UTDefaultActionPanelView.prototype._generate = function (...args) {
    if (!this._generated) {
      defaultActionPanelGenerate.call(this, ...args);
      insertActionButtons.call(this);
    }
  };

  UTAuctionActionPanelView.prototype._generate = function (...args) {
    if (!this._generated) {
      auctionActionPanelGenerate.call(this, ...args);
      insertActionButtons.call(this);
    }
  };

  const insertActionButtons = function () {
    $(generateViewOnFutBinBtn().__root).insertAfter(
      $(this._playerBioButton.__root)
    );
    const showCalcMinBin = getValue("EnhancerSettings")["idShowCalcMinBin"];
    if (showCalcMinBin) {
      this._calcMinBin = generateCalcMinBin();
      const childrenCount = this.__root.children.length;
      this.__root.children[childrenCount - 1].appendChild(
        this._calcMinBin.__root
      );
    }
  };
};
