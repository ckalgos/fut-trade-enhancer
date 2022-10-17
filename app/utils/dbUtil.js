import phoneDBUtil from "./phoneDBUtil";

export const initDatabase = () => phoneDBUtil.initDatabase();

export const deletePlayers = () => phoneDBUtil.deletePlayers();

export const getPlayers = () => phoneDBUtil.getPlayers();

export const getSettings = () => phoneDBUtil.getSettings();

export const insertPlayers = (playerInfo) =>
  phoneDBUtil.insertPlayers(playerInfo);

export const insertSettings = (settingName, jsonData) =>
  phoneDBUtil.insertSettings(settingName, jsonData);
