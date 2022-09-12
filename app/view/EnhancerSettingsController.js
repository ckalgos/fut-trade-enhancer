import { EnhancerSettingsView } from "./EnhancerSettingsView";
import { t } from "../services/translate";

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
  return t("enhancer");
};
