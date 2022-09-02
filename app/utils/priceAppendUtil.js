import { fetchPrices } from "../services/futbin";
import { getValue } from "../services/repository";
import { relistCards, relistForFixedPrice } from "./reListUtil";
import {
  appendContractInfo,
  appendDuplicateTag,
  appendPackPrice,
  appendPrice,
  appendPriceToSlot,
  appendRelistExternal,
  appendSectionTotalPrices,
  appendSquadTotal,
} from "./uiUtils/appendItems";

export const appendCardPrice = async (listRows, isFromPacks) => {
  const enhancerSetting = getValue("EnhancerSettings") || {};
  if (!listRows.length || enhancerSetting["idFutBinPrice"] === false) {
    return;
  }
  const cards = [];
  for (const { data } of listRows) {
    cards.push(data);
  }
  const prices = await fetchPrices(cards);
  let totalExternalPrice = 0;
  let totalBid = 0;
  let totalBin = 0;
  const clubSquadIds = getValue("squadMemberIds") || new Set();
  for (const { __auction, data, __root } of listRows) {
    const auctionElement = $(__auction);
    const rootElement = $(__root);
    const { definitionId, contract, _auction: auctionData } = data;
    const cardPrice = prices.get(definitionId);
    appendContractInfo(rootElement, contract);
    if (clubSquadIds.has(definitionId)) {
      appendDuplicateTag(rootElement);
    }
    if (cardPrice === undefined) {
      continue;
    }
    if (auctionElement.attr("style")) {
      auctionElement.removeAttr("style");
      auctionElement.addClass("hideauction");
    }
    const bidPrice = auctionData.currentBid || auctionData.startingBid;
    totalBid += bidPrice;
    totalBin += auctionData.buyNowPrice;
    totalExternalPrice += cardPrice || 0;
    appendPrice("FutBin", auctionElement, cardPrice);
    checkAndAppendBarginIndicator(
      rootElement,
      auctionData.buyNowPrice,
      bidPrice,
      cardPrice
    );
  }
  isFromPacks && appendPackPrice(totalExternalPrice);
  return { totalBid, totalBin, totalExternalPrice };
};

const checkAndAppendBarginIndicator = (
  rootElement,
  binPrice,
  bidPrice,
  futBinPrice
) => {
  const enhancerSetting = getValue("EnhancerSettings") || {};
  const markBidBargain = enhancerSetting["idBidBargain"];
  futBinPrice =
    futBinPrice * ((enhancerSetting["idBarginThreshold"] || 95) / 100);
  if (
    (binPrice && futBinPrice > binPrice) ||
    (markBidBargain && bidPrice && futBinPrice > bidPrice)
  ) {
    rootElement.addClass("futbinLessPrice");
  }
};

export const appendSlotPrice = async (squadSlots) => {
  if (!squadSlots.length) {
    return;
  }
  const cards = [];
  for (const { item } of squadSlots) {
    cards.push(item);
  }
  const prices = await fetchPrices(cards);
  let total = 0;
  for (const { rootElement, item } of squadSlots) {
    const cardPrice = prices.get(item.definitionId);
    total += cardPrice || 0;

    if (cardPrice) {
      const element = $(rootElement);
      appendPriceToSlot(element, cardPrice);
    }
  }
  appendSquadTotal("FutBin", total);
};

export const appendSectionPrices = async (sectionData) => {
  if (sectionData.listRows.length) {
    sectionData.isRelistSupported &&
      appendRelistExternal(
        sectionData.sectionHeader,
        sectionData.headerElement,
        "FutBin",
        () => {
          relistCards(sectionData.sectionHeader);
        },
        () => {
          relistForFixedPrice(sectionData.sectionHeader);
        }
      );
    appendCardPrice(sectionData.listRows).then((prices) => {
      setTimeout(() => {
        appendSectionTotalPrices(sectionData.headerElement, "FutBin", prices);
      }, 100);
    });
  }
};
