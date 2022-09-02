import { getValue } from "../services/repository";
import { appendSlotPrice } from "../utils/priceAppendUtil";

export const playerSlotOverride = () => {
  const playerSlot = UTSquadPitchView.prototype.setSlots;

  UTSquadPitchView.prototype.setSlots = async function (...args) {
    const result = playerSlot.call(this, ...args);
    const enhancerSetting = getValue("EnhancerSettings") || {};
    if (!enhancerSetting["idShowSquadPrice"]) {
      return;
    }
    const slots = this.getSlotViews();
    const squadSlots = [];
    slots.forEach((slot, index) => {
      const item = args[0][index];
      squadSlots.push({
        item: item._item,
        rootElement: slot.getRootElement(),
      });
    });

    appendSlotPrice(squadSlots);
    return result;
  };
};
