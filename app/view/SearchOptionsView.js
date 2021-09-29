import { generateToggleInput } from "../utils/uiUtils/generateToggleInput";
import { idFutBinPrice, idBidBargain, idHideBinPop } from "../app.constants";
import { getValue } from "../services/repository";

export const initSearchOptionView = () => {
  const filterViewGenerate = UTMarketSearchFiltersView.prototype._generate;

  UTMarketSearchFiltersView.prototype._generate = function () {
    filterViewGenerate.call(this);
    if (this.__root) {
      const searchPrices = $(this.__root).find(".search-prices").first();
      if (!$(".enhancer-option-header").length && searchPrices.length) {
        const enhancerSetting = getValue("EnhancerSettings") || {};
        searchPrices.append(`<div> 
        <div class="enhancer-option-header"> 
               <h1>Enhancer Options:</h1>
        </div>
        ${generateToggleInput(
          "Show FutBin Price",
          { idFutBinPrice },
          "Shows Futbin Price and marks Bargains",
          "idFutBinPrice" in enhancerSetting
            ? enhancerSetting["idFutBinPrice"]
            : true,
          "enhancer-toggle"
        )}
        ${generateToggleInput(
          "Mark Bid Bargains",
          { idBidBargain },
          "Highlights Bargains based on current bid",
          "idBidBargain" in enhancerSetting
            ? enhancerSetting["idBidBargain"]
            : false,
          "enhancer-toggle"
        )}
        ${generateToggleInput(
          "Hide Bin Popup",
          { idHideBinPop },
          "Automatically confirms the Bin popup",
          "idHideBinPop" in enhancerSetting
            ? enhancerSetting["idHideBinPop"]
            : false,
          "enhancer-toggle"
        )}
      </div>`);
      }
    }
  };
};
