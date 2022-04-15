import { fetchPricesFromFutBinBulk } from "../services/futbin";
import { getValue } from "../services/repository";
import { getUserPlatform } from "../services/user";

function addFutBinPriceToSlot(rootElement, price) {
  rootElement.prepend(`
    <div style="position: absolute;top: -10px;width: 100%;">
      <span class="currency-coins value squad-fut-bin">${price || "---"}</span>
    </div>`);
}

export const playerSlotOverride = () => {
  const playerSlot = UTSquadPitchView.prototype.setSlots;

  UTSquadPitchView.prototype.setSlots = async function (...args) {
    playerSlot.call(this, ...args);
    const enhancerSetting = getValue("EnhancerSettings") || {};
    if (!enhancerSetting["idShowSquadPrice"]) {
      return;
    }
    const platform = getUserPlatform();
    const slots = this.getSlotViews();
    let total = 0;
    const playersRequestMap = [];
    const playersId = new Map();
    slots.forEach((slot, index) => {
      const item = args[0][index];
      const definitionId = item._item.definitionId;
      const existingValue = getValue(definitionId);
      const rootElement = $(slot.getRootElement());
      if (existingValue && existingValue.price) {
        total += parseInt(existingValue.price.replace(/[,.]/g, ""));
        addFutBinPriceToSlot(rootElement, existingValue.price);
      } else {
        playersRequestMap.push({
          definitionId,
          rootElement,
        });
        playersId.set(definitionId, rootElement);
      }
    });

    if (playersId.size) {
      const playersIdArray = Array.from(playersId.keys());
      while (playersIdArray.length) {
        fetchPricesFromFutBinBulk(
          playersRequestMap,
          playersIdArray.splice(0, 30),
          platform,
          (value, definitionId) => {
            total += parseInt(value.replace(/[,.]/g, ""));
            const rootElement = playersId.get(definitionId);
            addFutBinPriceToSlot(rootElement, value);
            appendSquadTotal(total.toLocaleString());
          }
        );
      }
    }

    appendSquadTotal(total.toLocaleString());
  };
};

const appendSquadTotal = (total) => {
  if ($(".squadTotal").length) {
    $(".squadTotal").text(total);
  } else {
    $(
      `<div class="rating">
          <span class="ut-squad-summary-label">FUTBIN Squad Price</span>
          <div>
            <span class="ratingValue squadTotal currency-coins">${total}</span>
          </div> 
        </div>
        `
    ).insertAfter($(".chemistry"));
  }
};
