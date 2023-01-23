import {
  idPackCommonPlayersAction,
  idPackDuplicatesAction,
  idPackNonPlayersAction,
  idPackOpenCredits,
  idPackRarePlayersAction,
  idPacksCount,
} from "../app.constants";
import { formatDataSource, hideLoader, showLoader, wait } from "./commonUtil";
import { sendPinEvents, sendUINotification } from "./notificationUtil";
import { t } from "../services/translate";
import { updateUserCredits } from "../services/user";
import { getDataSource } from "../services/repository";
import { listCards } from "./reListUtil";

export const validateFormAndOpenPack = async (pack) => {
  const popUpValues = getPopUpValues();
  await buyRequiredNoOfPacks(pack, popUpValues);
};

const setUpType = () => {
  const defaultOptions = [
    {
      value: "moveClub",
      label: t("moveToClub"),
    },
    {
      value: "moveTransfers",
      label: t("moveToTransferList"),
    },
    {
      value: "quickSell",
      label: t("quickSell"),
    },
    {
      value: "listExternal",
      label: formatDataSource(t("listFutBin"), getDataSource()),
    },
  ];
  return [
    { id: idPackCommonPlayersAction, label: t("commonPlayers"), actions: defaultOptions },
	{
	  id: idPackRarePlayersAction, 
	  label: t("rarePlayers"), 
	  actions: defaultOptions },
    {
      id: idPackNonPlayersAction,
      label: t("nonPlayers"),
      actions: defaultOptions.slice(0, 3),
    },
    {
      id: idPackDuplicatesAction,
      label: t("duplicates"),
      actions: defaultOptions.slice(1),
    },
  ];
};

export const purchasePopUpMessage = () => {
  const handlerForEachType = setUpType();
  return `
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
 ${t("noOfPacks")}
 <input placeholder="3" id=${idPacksCount} type="number" class="ut-text-input-control fut-bin-buy" />
 <br /> <br />
 ${GameCurrency.COINS}/${GameCurrency.POINTS}
 <select class="sbc-players-list" id="${idPackOpenCredits}"
    style="overflow-y : scroll">
    <option value=${GameCurrency.COINS}>${services.Localization.localize(
    "currency.coins"
  )}</option>
    <option value=${GameCurrency.POINTS}>${services.Localization.localize(
    "currency.points"
  )}</option>
 </select>
 <br /> <br />
 `;
};

const getPopUpValues = () => {
  const noOfPacks = parseInt($(`#${idPacksCount}`).val()) || 3;
  const credits = $(`#${idPackOpenCredits}`).val() || GameCurrency.COINS;
  const commonplayersHandler = $(`#${idPackCommonPlayersAction}`).val();
  const rareplayersHandler = $((`#${idPackRarePlayersAction}`).val();
  const nonPlayersHandler = $(`#${idPackNonPlayersAction}`).val();
  const duplicateHandler = $(`#${idPackDuplicatesAction}`).val();
  return {
    noOfPacks,
    commonplayersHandler,
	rareplayersHandler,
    nonPlayersHandler,
    duplicateHandler,
    credits,
  };
};

const buyRequiredNoOfPacks = async (pack, popUpValues) => {
  showLoader();
  while (popUpValues.noOfPacks > 0) {
    const response = await buyPack(pack, popUpValues);
    if (!response.success) {
      hideLoader();
      return sendUINotification(
        response.message || t("packOpeningErr"),
        UINotificationType.NEGATIVE
      );
    }
    await wait(3);
    popUpValues.noOfPacks--;
    sendUINotification(`${popUpValues.noOfPacks} ${t("packsRemaining")}`);
  }
  hideLoader();
};

const handleNonDuplicateCommonPlayers = (items, action) => {
  const nonDuplicateCommonPlayersItems = items.filter(
    (item) => !item.isDuplicate() && item.isPlayer() && item.isCommon()
  );
  sendUINotification(t("handlingNonDuplicateCommonPlayers"));
  return handleItems(nonDuplicateCommonPlayersItems, action);
};

const handleNonDuplicateRarePlayers = (items, action) => {
  const nonDuplicateRarePlayersItems = items.filter(
    (item) => !item.isDuplicate() && item.isPlayer() && item.isRare()
  );
  sendUINotification(t("handlingNonDuplicateRarePlayers"));
  return handleItems(nonDuplicateRarePlayersItems, action);
};

const handleNonDuplicateNonPlayers = (items, action) => {
  const nonDuplicateNonPlayersItems = items.filter(
    (item) => !item.isDuplicate() && !item.isPlayer()
  );
  sendUINotification(t("handlingNonDuplicateNonPlayers"));
  return handleItems(nonDuplicateNonPlayersItems, action);
};

const handleDuplicates = (items, action) => {
  const duplicateItems = items.filter((item) => item.isDuplicate());
  sendUINotification(t("handlingDuplicates"));
  return handleItems(duplicateItems, action);
};

const handleMiscItems = (items) => {
  return new Promise(async (resolve) => {
    const miscItems = items.filter((item) => item.isMiscItem());
    if (miscItems.length) {
      sendUINotification(t("handlingCredits"));
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
    if (action === "moveTransfers" || action === "listExternal") {
      if (repositories.Item.isPileFull(ItemPile.TRANSFER)) {
        return resolve(t("transferListFull"));
      }
      if (action === "listExternal") {
        await listCards(items);
        showLoader();
        resolve("");
      } else {
        services.Item.move(items, ItemPile.TRANSFER).observe(
          this,
          function (sender, data) {
            resolve("");
          }
        );
      }
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

const buyPack = (pack, popUpValues) => {
  if (repositories.Item.numItemsInCache(ItemPile.PURCHASED)) {
    return {
      success: false,
      message: services.Localization.localize(
        "popup.error.unassignedItemsEntitlementTitle"
      ),
    };
  }

  if (
    !pack.prices._collection[popUpValues.credits] ||
    pack.prices._collection[popUpValues.credits].amount >
      services.User.getUser()[popUpValues.credits.toLowerCase()].amount
  ) {
    return {
      success: false,
      message: t("errInsufficientCredits"),
    };
  }
  return new Promise((resolve) => {
    pack.purchase(popUpValues.credits).observe(this, function (sender, data) {
      if (data.success) {
        repositories.Item.setDirty(ItemPile.PURCHASED);
        sendPinEvents("Unassigned Items - List View");
        services.Item.requestUnassignedItems().observe(
          this,
          async function (sender, { response: { items } }) {
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
