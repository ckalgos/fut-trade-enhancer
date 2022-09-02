import { getFutbinPlayerUrl } from "../../services/futbin";
import { getValue } from "../../services/repository";
import { createButton } from "../../view/ButtonView";
import { sendUINotification } from "../notificationUtil";
import { listCards } from "../reListUtil";

export const generateListForFutBinBtn = () => {
  return createButton(
    "List for FUTBIN",
    () => {
      const selectedPlayer = getValue("selectedPlayer");
      selectedPlayer && listCards([selectedPlayer]);
    },
    "accordian"
  );
};

export const generateViewOnFutBinBtn = () => {
  return createButton(
    "View on FUTBIN",
    async () => {
      const selectedPlayer = getValue("selectedPlayer");
      const playerUrl = await getFutbinPlayerUrl(selectedPlayer);
      if (!playerUrl) {
        sendUINotification(
          "Unable to get futbin url",
          UINotificationType.NEGATIVE
        );
      }
      window.open(playerUrl, "_blank");
    },
    "accordian"
  );
};

export const generateSectionRelistBtn = (callBack, dataSource) => {
  return createButton(
    `List ${dataSource}`,
    callBack,
    "relist call-to-action mini"
  );
};
