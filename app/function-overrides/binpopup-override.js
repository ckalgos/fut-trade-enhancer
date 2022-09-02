import { getValue } from "../services/repository";

export const binPopUpOverride = () => {
  const popupConfirm = utils.PopupManager.showConfirmation;
  const popupAlert = utils.PopupManager.showAlert;

  utils.PopupManager.showConfirmation = function (e, t, i, o) {
    const autoConfirm = getValue("EnhancerSettings")["idHideBinPop"];
    if (
      e.title === utils.PopupManager.Confirmations.CONFIRM_BUY_NOW.title &&
      autoConfirm
    ) {
      i();
      return;
    }

    popupConfirm.call(this, e, t, i, o);
  };

  utils.PopupManager.showAlert = function (e, t, i) {
    const autoConfirm = getValue("EnhancerSettings")["idTransferFullPop"];
    if (
      e.title === utils.PopupManager.Alerts.TRANSFER_LIST_FULL.title &&
      autoConfirm
    ) {
      return;
    }

    popupAlert.call(this, e, t, i);
  };
};
