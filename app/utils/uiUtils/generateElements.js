import { getFutbinPlayerUrl } from "../../services/futbin";
import { getValue } from "../../services/repository";
import { createButton } from "../../view/ButtonView";
import { sendUINotification } from "../notificationUtil";
import { listCards } from "../reListUtil";
import { calculatePlayerMinBin } from "../../services/minBinCalc";
import { t } from "../../services/translate";
import { downloadClub } from "../../services/club";

export const generateListForFutBinBtn = () => {
  return createButton(
    t("listFutBin"),
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
    t("viewFutBin"),
    async () => {
      const selectedPlayer = getValue("selectedPlayer");
      if (!selectedPlayer) {
        return;
      }
      const playerUrl = await getFutbinPlayerUrl(selectedPlayer);
      if (!playerUrl) {
        sendUINotification(t("futBinUrlErr"), UINotificationType.NEGATIVE);
      }
      window.open(playerUrl, "_blank");
    },
    "accordian"
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

export const generateSendToTransferList = (callBack) => {
  return createButton(
    services.Localization.localize("infopanel.label.sendTradePile"),
    callBack,
    "btn-standard mini transferpile clubAction"
  );
};
