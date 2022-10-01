import { getDataSource, getValue } from "../repository";
import futwiz from "./futwiz";
import futbin from "./futbin";
import marketAlert from "./marketAlert";

export const getPlayerUrl = (player) => {
  const dataSource = getDataSource();

  if (dataSource === "futwiz") {
    return futwiz.getPlayerUrl(player);
  } else {
    return futbin.getPlayerUrl(player);
  }
};

export const fetchPrices = async (items) => {
  const dataSource = getDataSource();

  if (dataSource === "futwiz") {
    return futwiz.fetchPrices(items);
  } else if (dataSource === "futbin") {
    return futbin.fetchPrices(items);
  } else {
    return marketAlert.fetchPrices(items);
  }
};
