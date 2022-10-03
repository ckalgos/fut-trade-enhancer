import { getValue } from "../services/repository";

export const quickListOpenOverride = () => {
  const quickListOpen = UTQuickListPanelViewController.prototype._onOpen;
  const defaultMaxAllowedAuctions = services.User.maxAllowedAuctions;
  UTQuickListPanelViewController.prototype._onOpen = function (...args) {
    const enhancerSetting = getValue("EnhancerSettings") || {};

    services.User.maxAllowedAuctions = enhancerSetting[
      "idIncreaseActiveListing"
    ]
      ? 100
      : defaultMaxAllowedAuctions;

    return quickListOpen.call(this, ...args);
  };
};
