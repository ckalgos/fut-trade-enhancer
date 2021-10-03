import { idFutBinPercent } from "../app.constants";
import { showPopUp } from "../function-overrides/popup-override";

export const showFUTBINPercentPopUp = (callBack) => {
  showPopUp(
    [
      { labelEnum: enums.UIDialogOptions.OK },
      { labelEnum: enums.UIDialogOptions.CANCEL },
    ],
    "FUTBIN Price Percent",
    `<input type='number' id=${idFutBinPercent} value="95" placeholder='Sale Price Percent' />`,
    async (text) => {
      text === 2 && callBack();
    }
  );
};
