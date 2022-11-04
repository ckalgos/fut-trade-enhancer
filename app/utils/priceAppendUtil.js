import { fetchPrices } from "../services/datasource";
import { getDataSource, getValue } from "../services/repository";
import {
  moveCardsToClub,
  relistCards,
  relistForFixedPrice,
} from "./reListUtil";
import { showMoveToTransferListPopup } from "./transferListUtil";
import {
  appendCheckBox,
  appendContractInfo,
  appendDuplicateTag,
  appendPackPrice,
  appendPrice,
  appendPriceToSlot,
  appendRelistExternal,
  appendSectionTotalPrices,
  appendSquadTotal,
} from "./uiUtils/appendItems";
import {
  generateSendToClub,
  generateSendToTransferList,
} from "./uiUtils/generateElements";
import { moveUnassignedToTransferList } from "./unassignedutil";

export const appendCardPrice = async (listRows, section) => {
  const enhancerSetting = getValue("EnhancerSettings") || {};
  if (!listRows.length || enhancerSetting["idFutBinPrice"] === false) {
    return;
  }
  const cards = [];
  const isFromPacks = section === "packs";
  const sectionAuctionData = listRows[0].data.getAuctionData();

  const isSelectable =
    !isFromPacks &&
    section !== "club" &&
    !sectionAuctionData.isSold() &&
    !sectionAuctionData.isActiveTrade() &&
    !sectionAuctionData.isOutbid();

  for (const { data } of listRows) {
    cards.push(data);
  }
  const dataSource = getDataSource();
  const prices = await fetchPrices(cards);
  let totalExternalPrice = 0;
  let totalBid = 0;
  let totalBin = 0;
  const clubSquadIds = getValue("squadMemberIds") || new Set();
  for (const { __auction, data, __root } of listRows) {
    const auctionElement = $(__auction);
    const rootElement = $(__root);
    const {
      definitionId,
      contract,
      _auction: auctionData,
      lastSalePrice,
    } = data;
    const cardPrice = prices.get(`${definitionId}_${dataSource}_price`);
    appendContractInfo(rootElement, contract);
    isSelectable && appendCheckBox(rootElement, section, data);
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
    appendPrice(
      dataSource.toUpperCase(),
      auctionElement,
      cardPrice,
      auctionData._tradeState === "inactive" &&
        !rootElement.hasClass("has-action")
        ? lastSalePrice
        : 0
    );
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
  } else if (enhancerSetting["idOnlyBargain"]) {
    rootElement.addClass("hideResult");
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
  const dataSource = getDataSource();
  const prices = await fetchPrices(cards);
  let total = 0;
  for (const { rootElement, item } of squadSlots) {
    const cardPrice = prices.get(`${item.definitionId}_${dataSource}_price`);
    total += cardPrice || 0;

    if (cardPrice) {
      const element = $(rootElement);
      appendPriceToSlot(element, cardPrice);
    }
  }
  appendSquadTotal(dataSource.toUpperCase(), total);
};

export const appendSectionPrices = async (sectionData) => {
  const dataSource = getDataSource();
  if (sectionData.listRows.length) {
    const isUnassigned =
      services.Localization.localize("infopanel.label.storeAllInClub") ===
      sectionData.sectionHeader;
    if (isUnassigned) {
      sectionData.headerElement.append(
        generateSendToTransferList(
          () => showMoveToTransferListPopup(moveUnassignedToTransferList),
          "relist"
        ).__root
      );
    }
    if (sectionData.isRelistSupported) {
      const wrapperElement = appendRelistExternal(
        sectionData.sectionHeader,
        sectionData.headerElement,
        dataSource.toUpperCase(),
        () => {
          relistCards(sectionData.sectionHeader);
        },
        () => {
          relistForFixedPrice(sectionData.sectionHeader);
        }
      );
      if (
        [
          services.Localization.localize("tradepile.button.relistall"),
          services.Localization.localize("infopanel.label.addplayer"),
        ].indexOf(sectionData.sectionHeader) >= 0
      ) {
        wrapperElement &&
          wrapperElement.append(
            generateSendToClub(
              () => moveCardsToClub(sectionData.sectionHeader),
              "relist"
            ).__root
          );
      }
    }
    appendCardPrice(sectionData.listRows, sectionData.sectionHeader).then(
      (prices) => {
        setTimeout(() => {
          appendSectionTotalPrices(
            sectionData.headerElement,
            dataSource.toUpperCase(),
            prices,
            sectionData.isRelistSupported,
            sectionData.sectionHeader
          );
        }, 100);
      }
    );
  }
};
