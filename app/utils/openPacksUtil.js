import {
  idPackDuplicatesAction,
  idPackNonPlayersAction,
  idPackPlayersAction,
  idPacksCount,
} from "../app.constants";
import { hideLoader, showLoader, wait } from "./commonUtil";
import { sendPinEvents, sendUINotification } from "./notificationUtil";

export const validateFormAndOpenPack = async (pack) => {
  const popUpValues = getPopUpValues();
  await buyRequiredNoOfPacks(pack, popUpValues);
};

const defaultOptions = [
  {
    value: "moveClub",
    label: "Move To Club",
  },
  {
    value: "moveTransfers",
    label: "Move To TransferList",
  },
  {
    value: "quickSell",
    label: "Quick Sell",
  },
];

const handlerForEachType = [
  { id: idPackPlayersAction, label: "Players", actions: defaultOptions },
  { id: idPackNonPlayersAction, label: "Non Players", actions: defaultOptions },
  {
    id: idPackDuplicatesAction,
    label: "Duplicates",
    actions: defaultOptions.slice(1),
  },
];

export const purchasePopUpMessage = `
${handlerForEachType
  .map(({ id, label, actions }) => {
    return `
${label}
<select class="sbc-players-list" id="${id}"
    style="overflow-y : scroll">
    ${actions.map(
      ({ value, label }) => `<option value='${value}'>${label}</option>`
    )}
 </select> 
 <br />
 <br />
`;
  })
  .join("")}
 <br />
 <br />
 Number of packs
 <input placeholder="3" id=${idPacksCount} type="number" class="ut-text-input-control fut-bin-buy" placeholder="Packs to Buy" />
 <br /> <br />
 `;

const getPopUpValues = () => {
  const noOfPacks = parseInt($(`#${idPacksCount}`).val()) || 3;
  const playersHandler = $(`#${idPackPlayersAction}`).val();
  const nonPlayersHandler = $(`#${idPackNonPlayersAction}`).val();
  const duplicateHandler = $(`#${idPackDuplicatesAction}`).val();
  return {
    noOfPacks,
    playersHandler,
    nonPlayersHandler,
    duplicateHandler,
  };
};

const buyRequiredNoOfPacks = async (pack, popUpValues) => {
  showLoader();
  while (popUpValues.noOfPacks > 0) {
    const response = await buyPack(pack, popUpValues);
    if (!response.success) {
      return sendUINotification(
        response.message || "Error occured when opening packs",
        UINotificationType.NEGATIVE
      );
    }
    await wait(3);
    popUpValues.noOfPacks--;
    sendUINotification(`${popUpValues.noOfPacks} pack(s) remaining`);
  }
  hideLoader();
};

const handleNonDuplicatePlayers = (items, action) => {
  const nonDuplicatePlayersItems = items.filter(
    (item) => !item.isDuplicate() && item.isPlayer()
  );
  sendUINotification("Handling non duplicate players");
  return handleItems(nonDuplicatePlayersItems, action);
};

const handleNonDuplicateNonPlayers = (items, action) => {
  const nonDuplicateNonPlayersItems = items.filter(
    (item) => !item.isDuplicate() && !item.isPlayer()
  );
  sendUINotification("Handling non duplicate non players");
  return handleItems(nonDuplicateNonPlayersItems, action);
};

const handleDuplicates = (items, action) => {
  const duplicateItems = items.filter((item) => item.isDuplicate());
  sendUINotification("Handling duplicate items");
  return handleItems(duplicateItems, action);
};

const handleMiscItems = (items) => {
  return new Promise(async (resolve) => {
    const miscItems = items.filter((item) => item.isMiscItem());
    if (miscItems.length) {
      sendUINotification("Handling free credits/ packs");
      await Promise.all(
        miscItems.map(async (credit) => {
          services.Item.redeem(credit);
          await wait(2);
        })
      );
      resolve("");
    } else {
      resolve("");
    }
  });
};

const handleItems = (items, action) => {
  return new Promise(async (resolve) => {
    if (!items.length) {
      resolve("");
    }
    if (action === "moveTransfers") {
      if (repositories.Item.isPileFull(ItemPile.TRANSFER)) {
        return resolve("Transfer List if Full");
      }
      services.Item.move(items, ItemPile.TRANSFER).observe(
        this,
        function (sender, data) {
          resolve("");
        }
      );
    } else if (action === "moveClub") {
      services.Item.move(items, ItemPile.CLUB).observe(
        this,
        function (sender, data) {
          resolve("");
        }
      );
    } else if (action === "quickSell") {
      services.Item.discard(items).observe(this, function (sender, data) {
        resolve("");
      });
    }
  });
};

const updateUserCredits = () => {
  return new Promise((resolve) => {
    services.User.requestCurrencies().observe(this, function (sender, data) {
      resolve();
    });
  });
};

const buyPack = (pack, popUpValues) => {
  return new Promise((resolve) => {
    pack.purchase(GameCurrency.COINS).observe(this, function (sender, data) {
      if (data.success) {
        repositories.Item.setDirty(ItemPile.PURCHASED);
        sendPinEvents("Unassigned Items - List View");
        services.Item.requestUnassignedItems().observe(
          this,
          async function (sender, { data: { items } }) {
            let response = "";
            response += await handleNonDuplicatePlayers(
              items,
              popUpValues.playersHandler
            );
            await wait(2);
            response += await handleNonDuplicateNonPlayers(
              items,
              popUpValues.nonPlayersHandler
            );
            await wait(2);
            response += await handleDuplicates(
              items,
              popUpValues.duplicateHandler
            );
            await wait(2);
            response += await handleMiscItems(items);
            await wait(1);
            await updateUserCredits();
            resolve({ success: !response.length, message: response });
          }
        );
      } else {
        resolve({ success: false });
      }
    });
  });
};
