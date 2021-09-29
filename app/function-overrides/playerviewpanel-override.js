import { addBtnListner } from "../utils/commonUtil";
import { sendUINotification } from "../utils/notificationUtil";

export const playerViewPanelOverride = () => {
  const calcTaxPrice = (buyPrice) => {
    const priceAfterTax = (buyPrice * 0.95).toLocaleString();
    $("#saleAfterTax").html(`Price: ${priceAfterTax}`);
  };

  const panelViewFunc =
    controllers.items.ItemDetails.prototype._getPanelViewInstanceFromData;

  const buyPriceChanged = UTQuickListPanelView.prototype.onBuyPriceChanged;

  UTQuickListPanelView.prototype.onBuyPriceChanged = function (e, t, i) {
    buyPriceChanged.call(this);
    calcTaxPrice(this._buyNowNumericStepper.getValue());
  };

  controllers.items.ItemDetails.prototype._getPanelViewInstanceFromData =
    function _getPanelViewInstanceFromData(e, t) {
      panelViewFunc.call(this, e, t);
      setTimeout(() => {
        const binControl = $(".ut-numeric-input-spinner-control").last();
        const binInput = binControl.find(".numericInput");
        if ($(".more").length) {
          if (!$("#btnSbcApplicable").length) {
            $(
              `<button
            id="btnSbcApplicable">
            <span class="btn-text">Find Sbcs</span><span class="btn-subtext"></span>
            </button>`
            ).insertAfter($(".more"));
          }
          if ($(".panelActions").length && !$("#saleAfterTax").length) {
            $(
              `<div  class="buttonInfoLabel hasPriceBanding">
                    <span class="spinnerLabel">After Tax:</span>
                    <span id="saleAfterTax" class="currency-coins bandingLabel">Price: 10,000</span>
                </div>`
            ).insertAfter(binControl);
          }
        }
        binInput.val() &&
          calcTaxPrice(parseInt(binInput.val().replace(/[,.]/g, "")));
      });
    };

  addBtnListner("#btnSbcApplicable", () => {
    sendUINotification("Not implemented yet !!!", UINotificationType.NEGATIVE);
  });
};
