import { isMarketAlertApp } from "../app.constants";

export const addBtnListner = (selector, callback) => {
  $(document).on(
    {
      mouseenter: function () {
        $(selector).addClass("hover");
      },
      mouseleave: function () {
        $(selector).removeClass("hover");
      },
      click: callback,
      touchend: callback,
    },
    selector
  );
};

export const downloadCsv = (csvContent, fileName) => {
  isMarketAlertApp
    ? downloadCsvPhone(csvContent, fileName)
    : downloadCsvWeb(csvContent, fileName);
};

const downloadCsvWeb = (csvContent, fileName) => {
  const encodedUri =
    "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadCsvPhone = (csvContent, fileName) => {
  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      type: "downloadFile",
      payload: { data: csvContent, fileName: `${fileName}.csv` },
    })
  );
};

export const wait = async (seconds = 1) => {
  const rndFactor = Math.floor(Math.random());
  await new Promise((resolve) =>
    setTimeout(resolve, (rndFactor + seconds) * 1000)
  );
};

export const getCurrentViewController = () => {
  return getAppMain()
    .getRootViewController()
    .getPresentedViewController()
    .getCurrentViewController();
};

export const getRandWaitTime = (range) => {
  if (range) {
    const [start, end] = range.split("-").map((a) => parseInt(a));
    return Math.round(Math.random() * (end - start) + start);
  }
  return 0;
};

export const convertToSeconds = (val) => {
  if (val) {
    let valInterval = val[val.length - 1].toUpperCase();
    let valInTime = parseInt(val.substring(0, val.length - 1));
    let multipler = valInterval === "M" ? 60 : valInterval === "H" ? 3600 : 1;
    if (valInTime) {
      valInTime = valInTime * multipler;
    }
    return valInTime;
  }
  return 0;
};

export const utoa = (data) => {
  return btoa(unescape(encodeURIComponent(data)));
};

export const atou = (b64) => {
  return decodeURIComponent(escape(atob(b64)));
};

export const getRandNumberInRange = (range) => {
  const rangeVal = getRangeValue(range);
  if (rangeVal.length >= 2) {
    return getRandNum(rangeVal[0], rangeVal[1]);
  }
  return rangeVal[0] || 0;
};

export const getRandNum = (min, max) =>
  Math.round(Math.random() * (max - min) + min);

export const getRangeValue = (range) => {
  if (range) {
    return (range + "").split("-").map((a) => parseInt(a));
  }
  return [];
};

export const showLoader = () => {
  $(".ut-click-shield").addClass("showing");
  $(".loaderIcon ").css("display", "block");
};

export const hideLoader = () => {
  $(".ut-click-shield").removeClass("showing");
  $(".loaderIcon ").css("display", "none");
};

export const networkCallWithRetry = (execution, delay, retries) =>
  new Promise((resolve, reject) => {
    return execution()
      .then(resolve)
      .catch((reason) => {
        if (retries > 0) {
          return wait(delay)
            .then(
              networkCallWithRetry.bind(null, execution, delay, retries - 1)
            )
            .then(resolve)
            .catch(reject);
        }
        return reject(reason);
      });
  });

export const generateId = (length) => {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const createElementFromHTML = (htmlString) => {
  var div = document.createElement("div");
  div.innerHTML = htmlString.trim();
  return div.firstChild;
};

export const formatDataSource = function (string) {
  var args = arguments;
  return string.replace(/{dataSource}/g, (args[1] || "").toUpperCase());
};

export const getPercentDiff = (number1, number2) =>
  ((number1 - number2) / ((number1 + number2) / 2)) * 100;
