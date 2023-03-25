export const showPopUp = (options, title, message, selectCallBack) => {
  const messagePopUp = new EADialogViewController({
    dialogOptions: options,
    message,
    title,
  });
  messagePopUp.init();
  messagePopUp.onExit.observe(this, function (e, t) {
    e.unobserve(this), selectCallBack.call(this, t);
  });
  gPopupClickShield.setActivePopup(messagePopUp);
};

export const popupOverride = () => {
  const localizedDialog = utils.PopupManager.getLocalizedDialogOption;

  utils.PopupManager.getLocalizedDialogOption =
    function getLocalizedDialogOption(message) {
      if (
        [
          atob("UGF5cGFs"),
          atob("WW91dHViZSBTdWJzY3JpcHRpb24="),
          atob("UGF0cmVvbg=="),
          atob("RGlzY29yZA=="),
          atob("VHdpdHRlcg=="),
          atob("R2l0aHVi"),
          atob("QW5kcm9pZA=="),
          atob("aW9z"),
          atob("R2l2ZSBmZWVkYmFjaw=="),
        ].includes(message)
      ) {
        return message;
      }

      return localizedDialog(message);
    };
};
