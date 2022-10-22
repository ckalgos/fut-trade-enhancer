import { showPopUp } from "../function-overrides/popup-override";
import { t } from "../services/translate";
import { sendUINotification } from "./notificationUtil";

export const moveToTransferList = (items) => {
  const itemsToMove =
    repositories.Item.getPileSize(ItemPile.TRANSFER) -
    repositories.Item.numItemsInCache(ItemPile.TRANSFER);
  items = items.slice(0, itemsToMove + 1);
  if (items.length) {
    services.Item.move(items, ItemPile.TRANSFER).observe(
      this,
      function (sender, data) {
        sendUINotification(
          services.Localization.localize("notification.item.allToTradePile", [
            items.length,
          ]),
          UINotificationType.NEUTRAL
        );
      }
    );
  }
};

export const showMoveToTransferListPopup = (cb) => {
  showPopUp(
    [
      { labelEnum: enums.UIDialogOptions.OK },
      { labelEnum: enums.UIDialogOptions.CANCEL },
    ],
    services.Localization.localize("infopanel.label.sendTradePile"),
    t("sendToTransferListInfo"),
    (text) => {
      text === 2 && cb();
    }
  );
};
