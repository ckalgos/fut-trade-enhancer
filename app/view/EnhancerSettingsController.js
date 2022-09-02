import { EnhancerSettingsView } from "./EnhancerSettingsView";

export const EnhancerSettingsController = function (t) {
  UTViewController.call(this);
};

JSUtils.inherits(EnhancerSettingsController, UTViewController);

EnhancerSettingsController.prototype._getViewInstanceFromData = function () {
  return new EnhancerSettingsView();
};

EnhancerSettingsController.prototype.viewDidAppear = function () {
  this.getNavigationController().setNavigationVisibility(true, true);
};

EnhancerSettingsController.prototype.getNavigationTitle = function () {
  return `Enhancer`;
};
