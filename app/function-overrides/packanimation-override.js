import { getValue } from "../services/repository";

export const packAnimationOverride = () => {
  const runPackAnimation = UTPackAnimationViewController.prototype.runAnimation;
  const presentController = UTPresentationController.prototype.present;

  UTPackAnimationViewController.prototype.runAnimation = function (...args) {
    const enhancerSetting = getValue("EnhancerSettings") || {};

    if (enhancerSetting["idDisablePackAnimation"]) {
      return this.runCallback();
    }

    return runPackAnimation.call(this, ...args);
  };

  UTPresentationController.prototype.present = function (t, ...args) {
    const enhancerSetting = getValue("EnhancerSettings") || {};

    if (
      enhancerSetting["idDisablePackAnimation"] &&
      this.presentedViewController instanceof UTPackAnimationViewController
    ) {
      t = false;
    }

    return presentController.call(this, t, ...args);
  };
};
