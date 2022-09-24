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
  idUnassignedPileSize,
  idTransferFullPop,
  idShowSquadPrice,
  idWatchListPileSize,
  idShowCalcMinBin,
  idIncreaseActiveListing,
  idFixSbcs,
} from "../app.constants";
import { generateToggleInput } from "../utils/uiUtils/generateToggleInput";
import { insertSettings } from "../utils/dbUtil";
import { generateButton } from "../utils/uiUtils/generateButton";
import { sendUINotification } from "../utils/notificationUtil";
import { generateTextInput } from "../utils/uiUtils/generateTextInput";
import { hideLoader, showLoader } from "../utils/commonUtil";
import { savePlayersWithInRatingRange } from "../utils/ratingFilterUtil";
import { setMaxUnassignedCount } from "../utils/pileUtil";
import { t } from "../services/translate";

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
            t("showFutBinPrice"),
            { idFutBinPrice },
            t("showFutBinPriceInfo"),
            "idFutBinPrice" in enhancerSetting
              ? enhancerSetting["idFutBinPrice"]
              : true
          )}
          ${generateToggleInput(
            t("markBidBargins"),
            { idBidBargain },
            t("markBidBarginsInfo"),
            "idBidBargain" in enhancerSetting
              ? enhancerSetting["idBidBargain"]
              : false
          )}
          ${generateTextInput(
            t("barginThresholdPercent"),
            95,
            { idBarginThreshold },
            t("barginThresholdPercentInfo"),
            enhancerSetting["idBarginThreshold"]
          )}         
          ${generateTextInput(
            t("futBinSalePercent"),
            "95-100",
            { idFutBinPercent },
            t("futBinSalePercentInfo"),
            enhancerSetting["idFutBinPercent"],
            "text",
            "settings-field",
            "\\d+-\\d+$"
          )}
          ${generateTextInput(
            t("rating"),
            "",
            { idMinRating },
            t("ratingInfo"),
            enhancerSetting["idMinRating"],
            "text"
          )}
          ${generateTextInput(
            t("futBinListDuration"),
            "1H",
            { idFutBinDuration },
            t("futBinListDurationInfo"),
            enhancerSetting["idFutBinDuration"],
            "text"
          )}          
          ${generateTextInput(
            t("maxUnassignedItems"),
            5,
            { idUnassignedPileSize },
            t("maxUnassignedItemsInfo"),
            enhancerSetting["idUnassignedPileSize"]
          )}  
          ${generateTextInput(
            t("maxWatchListItems"),
            50,
            { idWatchListPileSize },
            t("maxWatchListItemsInfo"),
            enhancerSetting["idWatchListPileSize"]
          )}  
          ${generateToggleInput(
            t("hideBinPopUp"),
            { idHideBinPop },
            t("hideBinPopUpInfo"),
            "idHideBinPop" in enhancerSetting
              ? enhancerSetting["idHideBinPop"]
              : false
          )}
          ${generateToggleInput(
            t("hideTransferFull"),
            { idTransferFullPop },
            t("hideTransferFullInfo"),
            "idTransferFullPop" in enhancerSetting
              ? enhancerSetting["idTransferFullPop"]
              : false
          )}
          ${generateToggleInput(
            t("showSquadPrice"),
            { idShowSquadPrice },
            t("showSquadPriceInfo"),
            "idShowSquadPrice" in enhancerSetting
              ? enhancerSetting["idShowSquadPrice"]
              : true
          )}
          ${generateToggleInput(
            t("showCalcMinBin"),
            { idShowCalcMinBin },
            t("showCalcMinBinInfo"),
            "idShowCalcMinBin" in enhancerSetting
              ? enhancerSetting["idShowCalcMinBin"]
              : false
          )}
          ${generateToggleInput(
            t("increaseActiveList"),
            { idIncreaseActiveListing },
            t("increaseActiveListInfo"),
            "idIncreaseActiveListing" in enhancerSetting
              ? enhancerSetting["idIncreaseActiveListing"]
              : false
          )}
          ${generateToggleInput(
            t("fixSbc"),
            { idFixSbcs },
            t("fixSbcInfo"),
            "idFixSbcs" in enhancerSetting
              ? enhancerSetting["idFixSbcs"]
              : false
          )}
          <div class="enhancer-save-btn">
            ${generateButton(
              idSaveSettingsBtn,
              t("save"),
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
                setMaxUnassignedCount();
                hideLoader();
                sendUINotification(t("saveSuccess"));
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
