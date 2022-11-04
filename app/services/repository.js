const lookUp = new Map();

export const setValue = (key, value) => {
  lookUp.set(key, value);
};

export const getValue = (key) => {
  const value = lookUp.get(key);
  if (value && value.expiryTimeStamp && value.expiryTimeStamp < Date.now()) {
    lookUp.delete(key);
    return null;
  }
  return value;
};

export const getDataSource = () => {
  const enhancerSetting = getValue("EnhancerSettings") || {};
  return enhancerSetting["idExternalDataSource"] || "futbin";
};

export const getSelectedPlayersBySection = (section) => {
  const selectedPlayersBySection = getValue("selectedPlayers") || {};
  if (!selectedPlayersBySection[section]) {
    selectedPlayersBySection[section] = new Map();
    setValue("selectedPlayers", selectedPlayersBySection);
  }
  return selectedPlayersBySection[section];
};

export const getCheckedSection = (section) => {
  const checkedSection = getValue("checkedSection") || new Map();
  if (!checkedSection.has(section)) {
    checkedSection.set(section, true);
    setValue("checkedSection", checkedSection);
  }
  return checkedSection;
};

export const clearSelectedPlayersBySection = (section) => {
  const selectedPlayersBySection = getValue("selectedPlayers") || {};
  selectedPlayersBySection[section].clear();
  return selectedPlayersBySection[section];
};
