import { getValue } from "../services/repository";
import {
  idFutBinPrice,
  idBidBargain,
  idHideBinPop,
  idSaveSettingsBtn,
  idFutBinPercent,
  idBarginThreshold,
  idMinRating,
  idFutBinDuration,
} from "../app.constants";
import { generateToggleInput } from "../utils/uiUtils/generateToggleInput";
import { insertSettings } from "../utils/dbUtil";
import { generateButton } from "../utils/uiUtils/generateButton";
import { sendUINotification } from "../utils/notificationUtil";
import { generateTextInput } from "../utils/uiUtils/generateTextInput";
import { hideLoader, showLoader } from "../utils/commonUtil";
import { savePlayersWithInRatingRange } from "../utils/ratingFilterUtil";

export const EnhancerSettingsView = function (t) {
  UTView.call(this);
};

JSUtils.inherits(EnhancerSettingsView, UTView);

EnhancerSettingsView.prototype._generate = function _generate() {
  if (!this._generated) {
    let container = document.createElement("div");
    container.classList.add("ut-market-search-filters-view");
    container.classList.add("floating");
    container.style["overflow-y"] = "scroll";
    container.style["display"] = "flex";
    container.style["align-items"] = "center";
    let wrapper = document.createElement("div");
    wrapper.style["height"] = "100%";
    const enhancerSetting = getValue("EnhancerSettings") || {};
    let currentRating = enhancerSetting["idMinRating"];
    wrapper.appendChild(
      $(` <div class='enhancer-settings-wrapper ut-pinned-list'>
          <div class="enhancer-settings-header"> 
          <h1 class="secondary">Enhancer Settings</h1>
          </div>
          ${generateToggleInput(
            "Show FutBin Price",
            { idFutBinPrice },
            "Shows Futbin Price and marks Bargains in searches",
            "idFutBinPrice" in enhancerSetting
              ? enhancerSetting["idFutBinPrice"]
              : true
          )}
          ${generateToggleInput(
            "Mark Bid Bargains",
            { idBidBargain },
            "Highlights Bargains based on current bid",
            "idBidBargain" in enhancerSetting
              ? enhancerSetting["idBidBargain"]
              : false
          )}
          ${generateTextInput(
            "Bargains Threshold Percent",
            95,
            { idBarginThreshold },
            "Highlight items if price below or equal to this percent of FUTBIN price",
            enhancerSetting["idBarginThreshold"]
          )}         
          ${generateTextInput(
            "FUTBIN Sale Percent",
            95,
            { idFutBinPercent },
            "Sale Price percent for Relist FUTBIN",
            enhancerSetting["idFutBinPercent"]
          )}
          ${generateTextInput(
            "Rating",
            "",
            { idMinRating },
            "Will only show players with rating as this value in searches",
            enhancerSetting["idMinRating"]
          )}
          ${generateTextInput(
            "FUTBIN List Duration",
            "1H",
            { idFutBinDuration },
            "List Duration when listing using Re-list FUTBIN",
            enhancerSetting["idFutBinDuration"],
            null,
            "text"
          )}
          ${generateToggleInput(
            "Hide Bin Popup",
            { idHideBinPop },
            "Automatically confirms the Bin popup",
            "idHideBinPop" in enhancerSetting
              ? enhancerSetting["idHideBinPop"]
              : false
          )}
          <div class="enhancer-save-btn">
            ${generateButton(
              idSaveSettingsBtn,
              "Save",
              async () => {
                showLoader();
                await insertSettings(
                  "enhancerSettings",
                  JSON.stringify(enhancerSetting)
                );
                if (currentRating !== enhancerSetting["idMinRating"]) {
                  await savePlayersWithInRatingRange(
                    enhancerSetting["idMinRating"]
                  );
                  currentRating = enhancerSetting["idMinRating"];
                }
                hideLoader();
                sendUINotification("Saved settings successfully");
              },
              "call-to-action flex-half"
            )}
          </div>
          </div>`)[0]
    );
    container.appendChild(wrapper);
    this.__root = container;
    this._generated = !0;
  }
};
