import { idFixedBINPrice, idFixedStartPrice } from "../app.constants";
import { showPopUp } from "../function-overrides/popup-override";
import { fetchPrices } from "../services/futbin";
import { getValue } from "../services/repository";
import { getRandNumberInRange, hideLoader, showLoader } from "./commonUtil";
import { sendUINotification } from "./notificationUtil";
import { listForPrice } from "./sellUtil";

export const relistForFixedPrice = function (sectionHeader) {
  showPopUp(
    [
      { labelEnum: enums.UIDialogOptions.OK },
      { labelEnum: enums.UIDialogOptions.CANCEL },
    ],
    "List for fixed price",
    `<input id=${idFixedStartPrice} type="number" class="ut-text-input-control fut-bin-buy" placeholder="Start Price" />
    <br/>
    <input id=${idFixedBINPrice} type="number" class="ut-text-input-control fut-bin-buy" placeholder="BIN Price" />
    <br/>
    <br/>
    <label>Card's will be ignored, if the price range doesn't fall in the provided price.</label>
    `,
    (text) => {
      const price = parseInt($(`#${idFixedBINPrice}`).val());
      const startPrice = parseInt($(`#${idFixedStartPrice}`).val());
      if (text === 2 && (isNaN(price) || !price)) {
        sendUINotification(`BIN price not given`, UINotificationType.NEGATIVE);
        return;
      }

      if (startPrice && startPrice > price) {
        sendUINotification(
          `BIN price is lesser than start price`,
          UINotificationType.NEGATIVE
        );
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

const handleWatchListOrUnAssignedItems = (sectionHeader, price, startPrice) => {
  const isWatchList =
    services.Localization.localize("infopanel.label.alltoclub") ===
    sectionHeader;
  services.Item[
    isWatchList ? "requestWatchedItems" : "requestUnassignedItems"
  ]().observe(this, async function (t, response) {
    let boughtItems = response.data.items;
    if (isWatchList) {
      boughtItems = boughtItems.filter(function (item) {
        return item.getAuctionData().isWon();
      });
    }
    listCards(boughtItems, price, startPrice);
  });
};

const handleTransferListItems = (sectionHeader, price, startPrice) => {
  services.Item.requestTransferItems().observe(
    this,
    async function (t, response) {
      if (
        sectionHeader ===
        services.Localization.localize("tradepile.button.relistall")
      ) {
        let unSoldItems = response.data.items.filter(function (item) {
          var t = item.getAuctionData();
          return t.isExpired() || (t.isValid() && t.isInactive());
        });

        listCards(unSoldItems, price, startPrice);
      } else if (
        sectionHeader ===
        services.Localization.localize("infopanel.label.addplayer")
      ) {
        const availableItems = response.data.items.filter(function (item) {
          return !item.getAuctionData().isValid();
        });
        listCards(availableItems, price, startPrice);
      }
    }
  );
};

export const listCards = async (cards, price, startPrice) => {
  if (!cards.length) {
    sendUINotification(
      "No players found to be listed",
      UINotificationType.NEGATIVE
    );
    return;
  }
  showLoader();
  if (price) {
    sendUINotification(`Listing cards for ${price}`);
    await listCardsForFixedPrice(cards, price, startPrice);
  } else {
    sendUINotification("Listing cards for FUTBIN price");
    await listCardsForFutBIN(cards);
  }
  hideLoader();
  sendUINotification("Listing the cards completed");
};

const listCardsForFixedPrice = async (cards, price, startPrice) => {
  for (const card of cards) {
    await listCard(price, card, true, startPrice);
  }
};

const listCardsForFutBIN = async (cards) => {
  await fetchPrices(cards);

  for (const card of cards) {
    const existingValue = getValue(card.definitionId);
    if (existingValue && existingValue.price) {
      await listCard(computeSalePrice(existingValue.price), card);
    } else {
      sendUINotification(
        `Price missing for ${card._staticData.name}`,
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
      "Given price is not in card's price range",
      UINotificationType.NEGATIVE
    );
  }
  sendUINotification(`Listed ${card._staticData.name} for ${lisitedPrice}`);
};

const computeSalePrice = (cardPrice) => {
  const futBinPercent =
    getRandNumberInRange(getValue("EnhancerSettings")["idFutBinPercent"]) ||
    100;
  return (cardPrice * futBinPercent) / 100;
};
