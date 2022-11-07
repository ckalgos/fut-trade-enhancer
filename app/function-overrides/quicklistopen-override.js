export const quickListOpenOverride = () => {
  const quickListOpen = UTQuickListPanelViewController.prototype._onOpen;
  UTQuickListPanelViewController.prototype._onOpen = function (...args) {
    return quickListOpen.call(this, ...args);
  };
};
