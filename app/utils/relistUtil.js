import { idFixedPrice } from "../app.constants";
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
    `<input id=${idFixedPrice} type="number" class="ut-text-input-control fut-bin-buy" placeholder="Price" />
    <br/>
    <br/>
    <label>Card's will be ignored, if the price range doesn't fall in the provided price.</label>
    `,
    (text) => {
      const price = parseInt($(`#${idFixedPrice}`).val());
      if (text === 2 && (isNaN(price) || !price)) {
        sendUINotification(`Price not given`, UINotificationType.NEGATIVE);
        return;
      }
      text === 2 && relistCards(sectionHeader, price);
    }
  );
};

export const relistCards = function (sectionHeader, price) {
  if (
    [
      services.Localization.localize("infopanel.label.alltoclub"),
      services.Localization.localize("infopanel.label.storeAllInClub"),
    ].indexOf(sectionHeader) >= 0
  ) {
    handleWatchListOrUnAssignedItems(sectionHeader, price);
    return;
  }
  handleTransferListItems(sectionHeader, price);
};

const handleWatchListOrUnAssignedItems = (sectionHeader, price) => {
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
    listCards(boughtItems, price);
  });
};

const handleTransferListItems = (sectionHeader, price) => {
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

        listCards(unSoldItems, price);
      } else if (
        sectionHeader ===
        services.Localization.localize("infopanel.label.addplayer")
      ) {
        const availableItems = response.data.items.filter(function (item) {
          return !item.getAuctionData().isValid();
        });
        listCards(availableItems, price);
      }
    }
  );
};

export const listCards = async (cards, price) => {
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
    await listCardsForFixedPrice(cards, price);
  } else {
    sendUINotification("Listing cards for FUTBIN price");
    await listCardsForFutBIN(cards);
  }
  hideLoader();
  sendUINotification("Listing the cards completed");
};

const listCardsForFixedPrice = async (cards, price) => {
  for (const card of cards) {
    await listCard(price, card, true);
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

const listCard = async (price, card, isFixedPrice) => {
  const [isListed, lisitedPrice] = await listForPrice(
    price,
    card,
    isFixedPrice
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
