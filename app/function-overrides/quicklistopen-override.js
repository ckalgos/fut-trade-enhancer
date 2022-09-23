import { getValue } from "../services/repository";

export const quickListOpenOverride = () => {
  const quickListOpen = UTQuickListPanelViewController.prototype._onOpen;
  UTQuickListPanelViewController.prototype._onOpen = function (...args) {
    const enhancerSetting = getValue("EnhancerSettings") || {};

    services.User.maxAllowedAuctions = enhancerSetting[
      "idIncreaseActiveListing"
    ]
      ? 100
      : 30;

    return quickListOpen.call(this, ...args);
  };
};
