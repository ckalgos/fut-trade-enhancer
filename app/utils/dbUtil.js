import webDBUtil from "./webDBUtil";
import phoneDBUtil from "./phoneDBUtil";

export const initDatabase = () =>
  isPhone() ? phoneDBUtil.initDatabase() : webDBUtil.initDatabase();

export const deletePlayers = () =>
  isPhone() ? phoneDBUtil.deletePlayers() : webDBUtil.deletePlayers();

export const getPlayers = () =>
  isPhone() ? phoneDBUtil.getPlayers() : webDBUtil.getPlayers();

export const getSettings = () =>
  isPhone() ? phoneDBUtil.getSettings() : webDBUtil.getSettings();

export const insertPlayers = (playerInfo) =>
  isPhone()
    ? phoneDBUtil.insertPlayers(playerInfo)
    : webDBUtil.insertPlayers(playerInfo);

export const insertSettings = (settingName, jsonData) =>
  isPhone()
    ? phoneDBUtil.insertSettings(settingName, jsonData)
    : webDBUtil.insertSettings(settingName, jsonData);
