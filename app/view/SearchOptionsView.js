import { generateToggleInput } from "../utils/uiUtils/generateToggleInput";
import { idFutBinPrice, idBidBargain, idHideBinPop } from "../app.constants";

export const initSearchOptionView = () => {
  const filterViewGenerate = UTMarketSearchFiltersView.prototype._generate;

  UTMarketSearchFiltersView.prototype._generate = function () {
    filterViewGenerate.call(this);
    if (this.__root) {
      const searchPrices = jQuery(this.__root).find(".search-prices").first();
      if (!jQuery(".enhancer-option-header").length && searchPrices.length) {
        searchPrices.append(`<div> 
        <div class="enhancer-option-header"> 
               <h1>Enhancer Options:</h1>
        </div>
        ${generateToggleInput(
          "Show FutBin Price",
          { idFutBinPrice },
          "Shows Futbin Price and marks Bargains",
          true,
          "enhancer-toggle"
        )}
        ${generateToggleInput(
          "Mark Bid Bargains",
          { idBidBargain },
          "Highlights Bargains based on current bid",
          false,
          "enhancer-toggle"
        )}
        ${generateToggleInput(
          "Hide Bin Popup",
          { idHideBinPop },
          "Automatically confirms the Bin popup",
          false,
          "enhancer-toggle"
        )}
      </div>`);
      }
    }
  };
};
