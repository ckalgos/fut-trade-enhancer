import { getPlayerUrl } from "../../services/datasource";
import { getDataSource, getValue } from "../../services/repository";
import { createButton } from "../../view/ButtonView";
import { sendUINotification } from "../notificationUtil";
import { listCards } from "../reListUtil";
import { calculatePlayerMinBin } from "../../services/minBinCalc";
import { t } from "../../services/translate";
import { downloadClub } from "../../services/club";
import { formatDataSource } from "../commonUtil";
import { showPopUp } from "../../function-overrides/popup-override";

export const generateListForFutBinBtn = () => {
  return createButton(
    formatDataSource(t("listFutBin"), getDataSource()),
    () => {
      const selectedPlayer = getValue("selectedPlayer");
      showPopUp(
        [
          { labelEnum: enums.UIDialogOptions.YES },
          { labelEnum: enums.UIDialogOptions.CANCEL },
        ],
        formatDataSource(t("listFutBin"), getDataSource()),
        formatDataSource(t("listFutBin"), getDataSource()),
        (text) => {
          text === 0 && selectedPlayer && listCards([selectedPlayer]);
        }
      );
    },
    "accordian"
  );
};

export const generateAfterTaxInfo = () => {
  return $(`<div  class="buttonInfoLabel hasPriceBanding">
  <span class="spinnerLabel">${t("afterTax")}</span>
  <span id="saleAfterTax" class="currency-coins bandingLabel">${t(
    "price"
  )} 10,000</span>
</div>`);
};

export const generateCalcMinBin = () => {
  return createButton(
    t("calcMinBin"),
    async function () {
      const selectedItem =
        getValue("selectedPlayer") || getValue("selectedNonPlayer");
      if (!selectedItem) {
        return;
      }
      const btnContext = $(this.getRootElement());
      btnContext.prop("disabled", true);
      btnContext.text(t("calcMinBin"));
      sendUINotification(t("calculatingMinBin"));
      const playerMin = await calculatePlayerMinBin(selectedItem);
      btnContext.prop("disabled", false);
      if (!playerMin) {
        sendUINotification(t("calcMinBinErr"), UINotificationType.NEGATIVE);
        return;
      }
      btnContext.addClass("btnAverage");
      btnContext.html(
        `<span class="btn-text">
          <ol>
            <li>${t("calcMin")}</li>
            <li>${t("calcAverage")}</li>
            <li>${t("topCalcMin")}</li>
          </ol>
        </span>
        <span class="btn-subtext">
          <ol>
            <li>${playerMin.min}</li>
            <li>${playerMin.avgMin}</li>
            ${playerMin.allPrices.reduce((acc, price) => {
              acc += `<li>${price}</li>`;
              return acc;
            }, "")}
          </ol>
        </span>`
      );
    },
    "accordian"
  );
};

export const generateViewOnFutBinBtn = () => {
  return createButton(
    formatDataSource(t("viewFutBin"), getDataSource()),
    async () => {
      const selectedPlayer = getValue("selectedPlayer");
      if (!selectedPlayer) {
        return;
      }
      const playerUrl = await getPlayerUrl(selectedPlayer);
      if (!playerUrl) {
        sendUINotification(
          formatDataSource(t("futBinUrlErr"), getDataSource()),
          UINotificationType.NEGATIVE
        );
      }
      window.open(playerUrl, "_blank");
    },
    "accordian viewon"
  );
};

export const generateSectionRelistBtn = (callBack, dataSource) => {
  return createButton(
    `${t("list")} ${dataSource}`,
    dataSource === t("fixed")
      ? callBack
      : () => {
          showPopUp(
            [
              { labelEnum: enums.UIDialogOptions.YES },
              { labelEnum: enums.UIDialogOptions.CANCEL },
            ],
            `${t("list")} ${dataSource}`,
            `${t("list")} ${dataSource}`,
            (text) => {
              text === 0 && callBack();
            }
          );
        },
    "relist call-to-action mini"
  );
};

export const generateDownloadClubCsv = () => {
  return createButton(
    `${t("downloadAsCsv")}`,
    downloadClub,
    "btn-standard mini downloadClub clubAction"
  );
};

export const generateSendToTransferList = (callBack, classes) => {
  return createButton(
    services.Localization.localize("infopanel.label.sendTradePile"),
    callBack,
    `btn-standard mini call-to-action ${classes || ""}`
  );
};

export const generateSendToClub = (callBack, classes) => {
  return createButton(
    services.Localization.localize("infopanel.label.club"),
    callBack,
    `btn-standard mini call-to-action ${classes || ""}`
  );
};
