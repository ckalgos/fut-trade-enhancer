import webDBUtil from "./webDBUtil";
import phoneDBUtil from "./phoneDBUtil";

export const initDatabase = () =>
  isPhone() ? phoneDBUtil.initDatabase() : phoneDBUtil.initDatabase();

export const deletePlayers = () =>
  isPhone() ? phoneDBUtil.deletePlayers() : phoneDBUtil.deletePlayers();

export const getPlayers = () =>
  isPhone() ? phoneDBUtil.getPlayers() : phoneDBUtil.getPlayers();

export const getSettings = () =>
  isPhone() ? phoneDBUtil.getSettings() : phoneDBUtil.getSettings();

export const insertPlayers = (playerInfo) =>
  isPhone()
    ? phoneDBUtil.insertPlayers(playerInfo)
    : phoneDBUtil.insertPlayers(playerInfo);

export const insertSettings = (settingName, jsonData) =>
  isPhone()
    ? phoneDBUtil.insertSettings(settingName, jsonData)
    : phoneDBUtil.insertSettings(settingName, jsonData);
