import { initOverrides } from "./function-overrides";
import { setValue } from "./services/repository";
import { getPlayers, getSettings } from "./utils/dbUtil";

const initScript = function () {
  let isAllLoaded = false;
  if (services.Localization) {
    getSettings().then((data) => {
      if (data) {
        setValue("EnhancerSettings", JSON.parse(data));
      }
    });
    getPlayers().then((data) => {
      if (data) {
        setValue("PlayersRatingRange", data);
      }
    });
    setValue("EnhancerSettings", {});
    setValue("PlayersRatingRange", []);
    isAllLoaded = true;
  }

  if (isAllLoaded) {
    initOverrides();
  } else {
    setTimeout(initScript, 1000);
  }
};

initScript();
