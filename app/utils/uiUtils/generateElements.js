import { getPlayerUrl } from "../../services/datasource";
import { getDataSource, getValue } from "../../services/repository";
import { createButton } from "../../view/ButtonView";
import { sendUINotification } from "../notificationUtil";
import { listCards } from "../reListUtil";
import { calculatePlayerMinBin } from "../../services/minBinCalc";
import { t } from "../../services/translate";
import { downloadClub } from "../../services/club";
import { formatDataSource } from "../commonUtil";

export const generateListForFutBinBtn = () => {
  return createButton(
    formatDataSource(t("listFutBin"), getDataSource()),
    () => {
      const selectedPlayer = getValue("selectedPlayer");
      selectedPlayer && listCards([selectedPlayer]);
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
      const selectedPlayer = getValue("selectedPlayer");
      if (!selectedPlayer) {
        return;
      }
      const btnContext = $(this.getRootElement());
      btnContext.prop("disabled", true);
      btnContext.text(t("calcMinBin"));
      sendUINotification(t("calculatingMinBin"));
      const playerMin = await calculatePlayerMinBin(selectedPlayer);
      btnContext.prop("disabled", false);
      if (!playerMin) {
        sendUINotification(t("calcMinBinErr"), UINotificationType.NEGATIVE);
        return;
      }
      btnContext.text(`${t("calcAverage")} - (${playerMin})`);
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
    callBack,
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
    `btn-standard mini transferpile ${classes || ""}`
  );
};
