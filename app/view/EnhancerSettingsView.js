import { getDataSource, getValue, setValue } from "../services/repository";
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
  idShowCalcMinBin,
  idIncreaseActiveListing,
  idDisablePackAnimation,
  idExternalDataSource,
  idAutoBuyMinGlobal,
  idIncreaseSearchResult,
  idAutoSelectMin,
  isMarketAlertApp,
  idOnlyBargain,
} from "../app.constants";
import { generateToggleInput } from "../utils/uiUtils/generateToggleInput";
import { insertSettings } from "../utils/dbUtil";
import { generateButton } from "../utils/uiUtils/generateButton";
import { sendUINotification } from "../utils/notificationUtil";
import { generateTextInput } from "../utils/uiUtils/generateTextInput";
import { hideLoader, showLoader, formatDataSource } from "../utils/commonUtil";
import { savePlayersWithInRatingRange } from "../utils/ratingFilterUtil";
import { setMaxUnassignedCount } from "../utils/pileUtil";
import { t } from "../services/translate";

export const EnhancerSettingsView = function (t) {
  UTView.call(this);
};

JSUtils.inherits(EnhancerSettingsView, UTView);

$(document).on(
  {
    change: function () {
      const dataSource = $(`#${idExternalDataSource} option`)
        .filter(":selected")
        .val();
      const enhancerSetting = getValue("EnhancerSettings") || {};
      enhancerSetting["idExternalDataSource"] = dataSource;
      setValue("EnhancerSettings", enhancerSetting);
    },
  },
  `#${idExternalDataSource}`
);

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
    const dataSource = getDataSource();
    const enhancerSetting = getValue("EnhancerSettings") || {};
    let currentRating = enhancerSetting["idMinRating"];
    if (dataSource) {
      setTimeout(() => {
        $(`#${idExternalDataSource}`)
          .find(`option[value=${dataSource}]`)
          .attr("selected", "selected");
      });
    }
    wrapper.appendChild(
      $(` <div class='enhancer-settings-wrapper ut-pinned-list'>
          <div class="enhancer-settings-header"> 
          <h1 class="secondary">Enhancer Settings</h1>
          </div>
          <div class="price-filter  settings-field">
            <select id="${idExternalDataSource}" class="sbc-players-list" style="align-self: center;border: 1px solid;">
                 <option selected="true" disabled value='-1'>DataSource</option>
                 <option value='futbin'>FUTBIN</option>
                 <option value='futwiz'>FUTWIZ</option>                     
            </select>
          </div>
          ${generateToggleInput(
            formatDataSource(t("showFutBinPrice"), dataSource),
            { idFutBinPrice },
            formatDataSource(t("showFutBinPriceInfo"), dataSource),
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
            formatDataSource(t("futBinSalePercent"), dataSource),
            "95-100",
            { idFutBinPercent },
            formatDataSource(t("futBinSalePercentInfo"), dataSource),
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
            formatDataSource(t("futBinListDuration"), dataSource),
            "1H",
            { idFutBinDuration },
            formatDataSource(t("futBinListDurationInfo"), dataSource),
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
            t("showOnlyBargain"),
            { idOnlyBargain },
            t("showOnlyBargainInfo"),
            "idOnlyBargain" in enhancerSetting
              ? enhancerSetting["idOnlyBargain"]
              : false
          )}
          ${generateToggleInput(
            t("showSquadPrice"),
            { idShowSquadPrice },
            formatDataSource(t("showSquadPriceInfo"), dataSource),
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
            t("disablePackAnimation"),
            { idDisablePackAnimation },
            t("disablePackAnimationInfo"),
            "idDisablePackAnimation" in enhancerSetting
              ? enhancerSetting["idDisablePackAnimation"]
              : false
          )}
          ${generateToggleInput(
            t("autoBuyLowest"),
            { idAutoBuyMinGlobal },
            t("autoBuyLowest"),
            "idAutoBuyMinGlobal" in enhancerSetting
              ? enhancerSetting["idAutoBuyMinGlobal"]
              : false
          )}
          ${generateToggleInput(
            t("increaseSearchResult"),
            { idIncreaseSearchResult },
            t("increaseSearchResultInfo"),
            "idIncreaseSearchResult" in enhancerSetting
              ? enhancerSetting["idIncreaseSearchResult"]
              : false
          )}
          ${
            !isMarketAlertApp
              ? generateToggleInput(
                  t("autoSelectLowest"),
                  { idAutoSelectMin },
                  t("autoSelectLowest"),
                  "idAutoSelectMin" in enhancerSetting
                    ? enhancerSetting["idAutoSelectMin"]
                    : false
                )
              : ""
          }              
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
