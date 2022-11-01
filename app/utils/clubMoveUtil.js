import { sendUINotification } from "./notificationUtil";

export const moveToClub = (items) => {
  items = items.filter((item) => !item.isDuplicate());
  if (items.length) {
    services.Item.move(items, ItemPile.CLUB).observe(
      this,
      function (sender, data) {
        sendUINotification(
          services.Localization.localize("notification.item.allToClub", [
            items.length,
          ]),
          UINotificationType.NEUTRAL
        );
      }
    );
  }
};
