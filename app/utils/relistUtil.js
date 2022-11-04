import { idFixedBINPrice, idFixedStartPrice } from "../app.constants";
import { showPopUp } from "../function-overrides/popup-override";
import {
  getDataSource,
  getSelectedPlayersBySection,
  getValue,
} from "../services/repository";
import {
  getRandNumberInRange,
  hideLoader,
  showLoader,
  formatDataSource,
} from "./commonUtil";
import { sendUINotification } from "./notificationUtil";
import { listForPrice } from "./sellUtil";
import { t } from "../services/translate";
import { fetchPrices } from "../services/datasource";
import { moveToClub } from "../utils/clubMoveUtil";

export const relistForFixedPrice = function (sectionHeader) {
  showPopUp(
    [
      { labelEnum: enums.UIDialogOptions.OK },
      { labelEnum: enums.UIDialogOptions.CANCEL },
    ],
    t("listFixed"),
    `<input id=${idFixedStartPrice} type="number" class="ut-text-input-control fut-bin-buy" placeholder=${t(
      "startPrice"
    )} />
    <br/>
    <input id=${idFixedBINPrice} type="number" class="ut-text-input-control fut-bin-buy" placeholder=${t(
      "binPrice"
    )} />
    <br/>
    <br/>
    <label>${t("cardsIgnoreInfo")}</label>
    `,
    (text) => {
      const price = parseInt($(`#${idFixedBINPrice}`).val());
      const startPrice = parseInt($(`#${idFixedStartPrice}`).val());
      if (text === 2 && (isNaN(price) || !price)) {
        sendUINotification(t("binNotGiven"), UINotificationType.NEGATIVE);
        return;
      }

      if (startPrice && startPrice > price) {
        sendUINotification(t("binLesser"), UINotificationType.NEGATIVE);
        return;
      }

      text === 2 && relistCards(sectionHeader, price, startPrice);
    }
  );
};

export const relistCards = function (sectionHeader, price, startPrice) {
  if (
    [
      services.Localization.localize("infopanel.label.alltoclub"),
      services.Localization.localize("infopanel.label.storeAllInClub"),
    ].indexOf(sectionHeader) >= 0
  ) {
    handleWatchListOrUnAssignedItems(sectionHeader, price, startPrice);
    return;
  }
  handleTransferListItems(sectionHeader, price, startPrice);
};

export const moveCardsToClub = function (sectionHeader) {
  if (
    [
      services.Localization.localize("tradepile.button.relistall"),
      services.Localization.localize("infopanel.label.addplayer"),
    ].indexOf(sectionHeader) >= 0
  ) {
    handleTransferListItems(sectionHeader, undefined, undefined, true);
    return;
  }
};

const getSelectedItems = (sectionHeader) => {
  const selectedPlayersBySection =
    getSelectedPlayersBySection(sectionHeader) || new Map();
  const result = new Set();
  for (const [key, { selected }] of selectedPlayersBySection) {
    selected && result.add(key);
  }
  return result;
};

const handleWatchListOrUnAssignedItems = (sectionHeader, price, startPrice) => {
  const selectedItems = getSelectedItems(sectionHeader, price, startPrice);

  const isWatchList =
    services.Localization.localize("infopanel.label.alltoclub") ===
    sectionHeader;
  services.Item[
    isWatchList ? "requestWatchedItems" : "requestUnassignedItems"
  ]().observe(this, async function (t, response) {
    let boughtItems = response.response.items;
    boughtItems = boughtItems.filter(function (item) {
      return selectedItems.has(item.id);
    });
    if (isWatchList) {
      boughtItems = boughtItems.filter(function (item) {
        return item.getAuctionData().isWon();
      });
    }
    listCards(boughtItems, price, startPrice, false);
  });
};

const handleTransferListItems = (
  sectionHeader,
  price,
  startPrice,
  isClubMove
) => {
  const selectedItems = getSelectedItems(sectionHeader, price, startPrice);

  services.Item.requestTransferItems().observe(
    this,
    async function (t, response) {
      if (
        sectionHeader ===
        services.Localization.localize("tradepile.button.relistall")
      ) {
        let unSoldItems = response.response.items.filter(function (item) {
          var t = item.getAuctionData();
          return (
            selectedItems.has(item.id) &&
            (t.isExpired() || (t.isValid() && t.isInactive()))
          );
        });

        isClubMove
          ? moveToClub(unSoldItems)
          : listCards(unSoldItems, price, startPrice, true);
      } else if (
        sectionHeader ===
        services.Localization.localize("infopanel.label.addplayer")
      ) {
        const availableItems = response.response.items.filter(function (item) {
          return selectedItems.has(item.id) && !item.getAuctionData().isValid();
        });
        isClubMove
          ? moveToClub(availableItems)
          : listCards(availableItems, price, startPrice, true);
      }
    }
  );
};

export const listCards = async (cards, price, startPrice, isRelist) => {
  cards = cards.filter((card) => !card.untradeable);
  const dataSource = getDataSource();
  if (!cards.length) {
    sendUINotification(t("noCardsToList"), UINotificationType.NEGATIVE);
    return;
  }
  showLoader();
  if (price) {
    sendUINotification(
      `${formatDataSource(t("listingCards"), dataSource)} ${price}`
    );
    await listCardsForFixedPrice(cards, price, startPrice, isRelist);
  } else {
    sendUINotification(formatDataSource(t("listingCardsFutBin"), dataSource));
    await listCardsForFutBIN(cards, isRelist);
  }
  hideLoader();
  sendUINotification(t("listingCardsCompleted"));
};

const listCardsForFixedPrice = async (cards, price, startPrice, isRelist) => {
  for (const card of cards) {
    await listCard(price, card, true, startPrice);
  }
};

const listCardsForFutBIN = async (cards, isRelist) => {
  const dataSource = getDataSource();
  await fetchPrices(cards);

  for (const card of cards) {
    const existingValue = getValue(`${card.definitionId}_${dataSource}_price`);
    if (existingValue && existingValue.price) {
      await listCard(computeSalePrice(existingValue.price), card);
    } else {
      sendUINotification(
        `${t("priceMissing")} ${card._staticData.name}`,
        UINotificationType.NEGATIVE
      );
    }
  }
};

const listCard = async (price, card, isFixedPrice, startPrice) => {
  const [isListed, lisitedPrice] = await listForPrice(
    price,
    card,
    isFixedPrice,
    startPrice
  );
  if (!isListed) {
    return sendUINotification(
      t("priceNotInRange"),
      UINotificationType.NEGATIVE
    );
  }
  sendUINotification(
    `${t("listed")} ${card._staticData.name} - ${lisitedPrice}`
  );
};

const computeSalePrice = (cardPrice) => {
  const futBinPercent =
    getRandNumberInRange(getValue("EnhancerSettings")["idFutBinPercent"]) ||
    100;
  return (cardPrice * futBinPercent) / 100;
};
