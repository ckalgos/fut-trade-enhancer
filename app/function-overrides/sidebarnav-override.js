import { t } from "../services/translate";
import { EnhancerSettingsController } from "../view/EnhancerSettingsController";

export const sideBarNavOverride = () => {
  const navViewInit = UTGameTabBarController.prototype.initWithViewControllers;
  UTGameTabBarController.prototype.initWithViewControllers = function (tabs) {
    const enhancerNav = new UTGameFlowNavigationController();
    enhancerNav.initWithRootController(new EnhancerSettingsController());
    enhancerNav.tabBarItem = generateEnhancerTab();
    tabs.push(enhancerNav);
    navViewInit.call(this, tabs);
  };
};

const generateEnhancerTab = () => {
  const enhancerTab = new UTTabBarItemView();
  enhancerTab.init();
  enhancerTab.setTag(6);
  enhancerTab.setText(t("enhancer"));
  enhancerTab.addClass("icon-transfer");
  return enhancerTab;
};
