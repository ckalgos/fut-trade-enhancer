import { getNonActiveSquadPlayers } from "../services/club";
import { t } from "../services/translate";
import { hideLoader, showLoader } from "../utils/commonUtil";
import { sendUINotification } from "../utils/notificationUtil";
import {
  generateDownloadClubCsv,
  generateSendToTransferList,
} from "../utils/uiUtils/generateElements";
import { showPopUp } from "./popup-override";

export const clubSearchOverride = () => {
  const clubPageGenerate = UTClubItemSearchHeaderView.prototype._generate;

  const sendClubPlayersToTradePile = async function () {
    if (repositories.Item.isPileFull(ItemPile.TRANSFER)) {
      return sendUINotification(
        t("transferListFull"),
        UINotificationType.NEGATIVE
      );
    }
    showLoader();
    let nonActiveSquadPlayers = await getNonActiveSquadPlayers(true);
    if (nonActiveSquadPlayers) {
      const itemsToMove =
        repositories.Item.getPileSize(ItemPile.TRANSFER) -
        repositories.Item.numItemsInCache(ItemPile.TRANSFER);
      nonActiveSquadPlayers = nonActiveSquadPlayers.slice(0, itemsToMove + 1);
      if (nonActiveSquadPlayers.length) {
        services.Item.move(nonActiveSquadPlayers, ItemPile.TRANSFER).observe(
          this,
          function (sender, data) {
            sendUINotification(
              services.Localization.localize(
                "notification.item.allToTradePile",
                [nonActiveSquadPlayers.length]
              ),
              UINotificationType.NEUTRAL
            );
          }
        );
      }
    }
    hideLoader();
  };

  const sendClubPlayersPopup = () => {
    showPopUp(
      [
        { labelEnum: enums.UIDialogOptions.OK },
        { labelEnum: enums.UIDialogOptions.CANCEL },
      ],
      services.Localization.localize("infopanel.label.sendTradePile"),
      t("clubToTransferListInfo"),
      (text) => {
        text === 2 && sendClubPlayersToTradePile();
      }
    );
  };

  UTClubItemSearchHeaderView.prototype._generate = function (...args) {
    if (!this._generated) {
      clubPageGenerate.call(this, ...args);
      const downloadClubBtn = generateDownloadClubCsv();
      const sendToTransferList =
        generateSendToTransferList(sendClubPlayersPopup);
      this.__searchContainer.prepend(downloadClubBtn.__root);
      this.__searchContainer.prepend(sendToTransferList.__root);
    }
  };
};
