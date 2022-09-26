import { updateUserCredits } from "../services/user";

export const currencyTapOverride = () => {
  const currentTap = UTCurrencyNavigationBarView.prototype._tapDetected;
  UTCurrencyNavigationBarView.prototype._tapDetected = function (e) {
    const res = currentTap.call(this, e);
    if (this.__currencyCoins.contains(e.target)) {
      updateUserCredits();
    }
    return res;
  };
};
