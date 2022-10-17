import { isMarketAlertApp } from "./app.constants";
import { initOverrides } from "./function-overrides";
import { initListeners } from "./services/externalRequest";
import { setValue } from "./services/repository";
import { getPlayers, getSettings, initDatabase } from "./utils/dbUtil";
import { setMaxUnassignedCount } from "./utils/pileUtil";

const initScript = function () {
  let isAllLoaded = false;
  if (services.Localization) {
    initDatabase().then(() => {
      getSettings().then((data) => {
        if (data) {
          setValue("EnhancerSettings", JSON.parse(data));
          setMaxUnassignedCount();
        }
      });
      getPlayers().then((data) => {
        if (data) {
          setValue("PlayersRatingRange", data);
        }
      });
    });
    setValue("EnhancerSettings", {});
    setValue("PlayersRatingRange", []);
    isAllLoaded = true;
  }

  if (isAllLoaded) {
    initOverrides();
    isMarketAlertApp && initListeners();
  } else {
    setTimeout(initScript, 1000);
  }
};

initScript();
