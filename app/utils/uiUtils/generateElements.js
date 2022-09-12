import { getFutbinPlayerUrl } from "../../services/futbin";
import { getValue } from "../../services/repository";
import { createButton } from "../../view/ButtonView";
import { sendUINotification } from "../notificationUtil";
import { listCards } from "../reListUtil";
import { t } from "../../services/translate";

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

export const generateViewOnFutBinBtn = () => {
  return createButton(
    t("viewFutBin"),
    async () => {
      const selectedPlayer = getValue("selectedPlayer");
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
