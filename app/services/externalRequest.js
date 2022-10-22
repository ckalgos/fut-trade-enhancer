import { idSession, isMarketAlertApp } from "../app.constants";
import { getValue, setValue } from "./repository";

export const initListeners = () => {
  window.addEventListener(
    "message",
    (payload) => {
      const data = JSON.parse(payload.data);
      switch (data.type) {
        case "dataFromExternal": {
          const { res, identifier } = data.response;
          const callBack = getValue(identifier);
          callBack && callBack(res);
          return setValue(identifier, null);
        }
      }
    },
    true
  );
};

export const sendExternalRequest = async (options) => {
  if (isMarketAlertApp || isPhone()) {
    sendPhoneRequest(options);
  } else {
    sendWebRequest(options);
  }
};

const sendPhoneRequest = (options) => {
  setValue(options.identifier, options.onload);
  delete options["onload"];
  window.ReactNativeWebView.postMessage(
    JSON.stringify({ type: "fetchFromExternal", payload: { options } })
  );
};

const sendWebRequest = (options) => {
  GM_xmlhttpRequest({
    method: options.method,
    url: options.url,
    onload: options.onload,
    data: options.data,
    headers: { "User-Agent": idSession },
  });
};
