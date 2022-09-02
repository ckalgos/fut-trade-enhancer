import { getValue } from "../services/repository";

export const setMaxUnassignedCount = () => {
  const enhancerSetting = getValue("EnhancerSettings") || {};
  if (enhancerSetting["idUnassignedPileSize"]) {
    MAX_NEW_ITEMS = enhancerSetting["idUnassignedPileSize"];
  }
};
