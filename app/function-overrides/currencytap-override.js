import { updateUserCredits } from "../services/user";

import { Auth } from "../external/amplify";

import { getValue } from "../services/repository";
import { isMarketAlertApp } from "../app.constants";

export const currencyTapOverride = () => {
  const currentTap = UTCurrencyNavigationBarView.prototype._tapDetected;
  const currentBarGenerate = UTCurrencyNavigationBarView.prototype._generate;
  const setClubInfo = UTCurrencyNavigationBarView.prototype.setClubInfo;

  UTCurrencyNavigationBarView.prototype.setClubInfo = function (
    clubName,
    clubEst
  ) {
    const res = setClubInfo.call(this, clubName, clubEst);
    const loggedInUser = getValue("loggedInUser");
    loggedInUser && (this.__clubInfoEst.textContent = loggedInUser.userName);
    return res;
  };
  UTCurrencyNavigationBarView.prototype._tapDetected = function (e) {
    const res = currentTap.call(this, e);
    if (this.__currencyCoins.contains(e.target)) {
      updateUserCredits();
    }
    return res;
  };

  UTCurrencyNavigationBarView.prototype._generate = function () {
    const loggedInUser = getValue("loggedInUser");
    const res = currentBarGenerate.call(this);
    if (isMarketAlertApp) {
      return res;
    }
    this.__loginWrapper = document.createElement("div");
    this.__loginWrapper.classList.add("view-navbar-clubinfo");
    this.__loginWrapper.style.marginRight = "10px";
    this.__loginWrapperBtn = document.createElement("button");
    this.__loginWrapperBtn.innerHTML = loggedInUser
      ? "Logout"
      : "Login To AB Server";
    this.__loginWrapperBtn.classList.add(
      "btn-standard",
      "section-header-btn",
      "call-to-action",
      "btn-sign"
    );
    if (loggedInUser) {
      this.__loginWrapperBtn.style.backgroundColor = "#ff3434";
      this.__loginWrapperBtn.style.color = "#f6f6fe";
    }
    this.__loginWrapperBtn.onclick = function () {
      loggedInUser ? Auth.signOut() : Auth.federatedSignIn();
    };
    this.__loginWrapper.appendChild(this.__loginWrapperBtn);
    this.__currencies.parentNode.insertBefore(
      this.__loginWrapper,
      this.__currencies
    );
    return res;
  };
};
