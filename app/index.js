import { isMarketAlertApp } from "./app.constants";
import { initOverrides } from "./function-overrides";
import { initListeners } from "./services/externalRequest";
import { setValue } from "./services/repository";
import { getPlayers, getSettings, initDatabase } from "./utils/dbUtil";
import { setMaxUnassignedCount } from "./utils/pileUtil";
import Amplify, { Auth } from "./external/amplify";

if (!isMarketAlertApp) {
  Amplify.configure(
    JSON.parse(
      atob(
        "eyJBdXRoIjp7InJlZ2lvbiI6InVzLWVhc3QtMSIsInVzZXJQb29sSWQiOiJldS13ZXN0LTFfS1RUY2VPaDRGIiwidXNlclBvb2xXZWJDbGllbnRJZCI6IjVpbHVmMGdkZ3IwdDUzcXYyZGhydWFoOTg1IiwibWFuZGF0b3J5U2lnbkluIjpmYWxzZSwiY29va2llU3RvcmFnZSI6eyJkb21haW4iOiJlYS5jb20iLCJwYXRoIjoiLyIsImV4cGlyZXMiOjM2NSwic2VjdXJlIjp0cnVlfSwicmVkaXJlY3RTaWduSW4iOiJodHRwczovL3d3dy5lYS5jb20vZmlmYS91bHRpbWF0ZS10ZWFtL3dlYi1hcHAvIiwicmVkaXJlY3RTaWduT3V0IjoiaHR0cHM6Ly93d3cuZWEuY29tL2ZpZmEvdWx0aW1hdGUtdGVhbS93ZWItYXBwLyJ9fQ=="
      )
    )
  );
  Auth.configure({
    oauth: JSON.parse(
      atob(
        "eyJkb21haW4iOiJsb2dpbi5mdXRoZWxwZXJzLmNvbSIsInNjb3BlIjpbInBob25lIiwiZW1haWwiLCJwcm9maWxlIiwib3BlbmlkIiwiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iXSwicmVkaXJlY3RTaWduSW4iOiJodHRwczovL3d3dy5lYS5jb20vZmlmYS91bHRpbWF0ZS10ZWFtL3dlYi1hcHAvIiwicmVkaXJlY3RTaWduT3V0IjoiaHR0cHM6Ly93d3cuZWEuY29tL2ZpZmEvdWx0aW1hdGUtdGVhbS93ZWItYXBwLyIsInJlc3BvbnNlVHlwZSI6InRva2VuIn0="
      )
    ),
  });
}

import {
  formUserData,
  getCurrentUser,
  getUserAccessToken,
} from "./utils/authUtil";
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
    if (!isMarketAlertApp) {
      getUserAccessToken().then(async (token) => {
        if (token) {
          const userData = formUserData(await getCurrentUser());
          userData.token = token;
          setValue("loggedInUser", userData);
        }
      });
    }
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
