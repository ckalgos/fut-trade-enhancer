import {
  purchasePopUpMessage,
  validateFormAndOpenPack,
} from "../utils/openPacksUtil";
import { sendUINotification } from "../utils/notificationUtil";
import { showPopUp } from "./popup-override";
import { t } from "../services/translate";

export const storeOverride = () => {
  const setupBuyCoinsButton =
    UTStorePackDetailsView.prototype.setupBuyCoinsButton;

  const autoOpenPacks = function () {
    let isHandled = false;
    services.Store.getPacks().observe(this, function (sender, data) {
      if (isHandled) return;
      isHandled = true;
      const pack = data.response.packs.find(
        (item) => item.id === this.articleId
      );
      if (!pack) {
        sendUINotification(t("packMissing"), UINotificationType.NEGATIVE);
        return;
      }

      showPopUp(
        [
          { labelEnum: enums.UIDialogOptions.OK },
          { labelEnum: enums.UIDialogOptions.CANCEL },
        ],
        t("autoOpenPacks"),
        purchasePopUpMessage(),
        (text) => {
          text === 2 && validateFormAndOpenPack(pack);
        }
      );
    });
  };
  UTStorePackDetailsView.prototype.setupBuyCoinsButton = function (...params) {
    setupBuyCoinsButton.call(this, ...params);
    this._btnOpenPacks && this.removeActionButton(this._btnOpenPacks);
    this._btnOpenPacks = new UTCurrencyButtonControl();
    this._btnOpenPacks.init();
    this._btnOpenPacks.setText(t("openPack"));
    this._btnOpenPacks.setSubText(t("automatically"));
    this._btnOpenPacks.addClass("call-to-action packOpen");
    this._btnOpenPacks.addTarget(this, autoOpenPacks, EventType.TAP);
    this.appendActionButton(this._btnOpenPacks);
  };
};
