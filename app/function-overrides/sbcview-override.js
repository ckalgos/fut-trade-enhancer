import {
  getRandNum,
  getRandWaitTime,
  hideLoader,
  showLoader,
  wait,
} from "../utils/commonUtil";
import { getSbcPlayersInfoFromFUTBin } from "../services/futbin";
import { sendPinEvents, sendUINotification } from "../utils/notificationUtil";
import { getSquadPlayerLookup } from "../services/club";
import { generateButton } from "../utils/uiUtils/generateButton";
import {
  idBuySBCPlayers,
  idFillSBC,
  idSBCBuyFutBinPercent,
  idSBCPlayersToBuy,
} from "../app.constants";
import { showPopUp } from "./popup-override";
import { addFutbinCachePrice } from "../utils/futbinUtil";
import { getValue, setValue } from "../services/repository";
import { getSellBidPrice, roundOffPrice } from "../utils/priceUtil";

export const sbcViewOverride = () => {
  const squladDetailPanelView = UTSBCSquadDetailPanelView.prototype.render;

  UTSBCService.prototype.loadChallengeData = function (r) {
    var s = this,
      a = new EAObservable();
    return (
      this.sbcDAO
        .loadChallenge(r.id, r.isInProgress())
        .observe(this, function (t, e) {
          t.unobserve(s);
          a.notify(e);
        }),
      a
    );
  };

  UTSBCSquadDetailPanelView.prototype.render = function (...params) {
    squladDetailPanelView.call(this, ...params);
    const sbcId = params.length ? params[0].id : "";
    setValue("squadId", sbcId);
    setTimeout(() => {
      if (!$(".futBinFill").length) {
        $(".challenge-content").append(
          $(
            `<div class="futBinFill" >
              <input id="squadId" type="text" class="ut-text-input-control futBinId" placeholder="FutBin Id" />
              ${generateButton(
                idFillSBC,
                "Auto Fill",
                async () => {
                  await fillSquad(getValue("squadId"));
                },
                "call-to-action"
              )}
            </div>            
            ${generateButton(
              idBuySBCPlayers,
              "Buy Missing Players",
              () => {
                buyPlayersPopUp();
              },
              "call-to-action"
            )}
          `
          )
        );
      }
      if (getValue(sbcId)) {
        appendSquadTotal(getValue(sbcId).value);
      }
    });
  };
};

const buyPlayersPopUp = () => {
  const { _squad } = getAppMain()
    .getRootViewController()
    .getPresentedViewController()
    .getCurrentViewController()
    .getCurrentController()._leftController;

  const sbcPlayers = _squad.getFieldPlayers();
  const conceptPlayers = sbcPlayers.filter(({ _item }) => _item.concept);

  if (!conceptPlayers.length) {
    sendUINotification(
      "No concept players found !!!",
      UINotificationType.NEGATIVE
    );
    return;
  }

  const playerNames = conceptPlayers.map(({ _item }) => _item._staticData.name);

  let filterMessage = `Bot will try to buy the following players <br /> <br />
  <select  multiple="multiple" class="sbc-players-list" id="${idSBCPlayersToBuy}"
      style="overflow-y : scroll">
      ${playerNames.map(
        (value) => `<option value='${value}'>${value}</option>`
      )}
   </select> 
   <br />
   <br />
   FUTBIN Buy Percent
   <input placeholder="100" id=${idSBCBuyFutBinPercent} type="number" class="ut-text-input-control fut-bin-buy" placeholder="FUTBIN Sale Percent" />
   <br /> <br />
   `;

  showPopUp(
    [
      { labelEnum: enums.UIDialogOptions.OK },
      { labelEnum: enums.UIDialogOptions.CANCEL },
    ],
    "Buy Missing Players",
    filterMessage,
    (text) => {
      const futBinPercent =
        parseInt($(`#${idSBCBuyFutBinPercent}`).val()) || 100;
      text === 2 &&
        buyMissingPlayers(
          conceptPlayers.map(({ _item }) => _item),
          futBinPercent
        );
    }
  );
};

const buyMissingPlayers = async (conceptPlayers, futBinPercent) => {
  showLoader();
  sendUINotification("Trying the buy the message players");
  await addFutbinCachePrice(conceptPlayers);
  for (const player of conceptPlayers) {
    const existingValue = getValue(player.definitionId);
    if (existingValue && existingValue.price) {
      let parsedPrice = parseInt(existingValue.price.replace(/[,.]/g, ""));
      let calculatedPrice = roundOffPrice(
        (parsedPrice * futBinPercent) / 100,
        200
      );
      await buyPlayer(player, calculatedPrice);
      await wait(getRandWaitTime("3-5"));
    } else {
      sendUINotification(
        `Error fetching futbin Price for ${player._staticData.name}`,
        UINotificationType.NEGATIVE
      );
    }
  }
  sendUINotification("Operation completed");
  hideLoader();
};

const buyPlayer = (player, buyPrice) => {
  let numberOfAttempts = 3;
  let buySuccess = false;
  const searchCriteria = new UTSearchCriteriaDTO();
  const searchModel = new UTBucketedItemSearchViewModel();
  return new Promise(async (resolve) => {
    while (numberOfAttempts-- > 0) {
      sendPinEvents("Transfer Market Search");
      searchCriteria.type = SearchType.PLAYER;
      searchCriteria.defId = [player.definitionId];
      searchCriteria.category = SearchCategory.ANY;
      searchCriteria.minBid = roundOffPrice(
        getRandNum(0, getSellBidPrice(Math.min(buyPrice, 250)))
      );
      searchCriteria.maxBuy = buyPrice;

      searchModel.searchFeature = enums.ItemSearchFeature.MARKET;
      searchModel.defaultSearchCriteria.type = searchCriteria.type;
      searchModel.defaultSearchCriteria.category = searchCriteria.category;
      searchModel.updateSearchCriteria(searchCriteria);

      services.Item.clearTransferMarketCache();
      services.Item.searchTransferMarket(searchModel.searchCriteria, 1).observe(
        this,
        async function (sender, response) {
          if (response.success) {
            sendPinEvents("Transfer Market Results - List View");
            if (!response.data.items.length) {
              sendUINotification(
                `No card found for ${player._staticData.name}`,
                UINotificationType.NEGATIVE
              );
              return;
            }
            let currPlayer =
              response.data.items[response.data.items.length - 1];

            sendPinEvents("Item - Detail View");
            services.Item.bid(
              currPlayer,
              currPlayer._auction.buyNowPrice
            ).observe(this, async function (sender, data) {
              if (data.success) {
                sendUINotification(
                  `Buy success for ${player._staticData.name}`
                );
                numberOfAttempts = 0;
                buySuccess = true;
                services.Item.move(currPlayer, ItemPile.CLUB);
              } else {
                let status = (data.error?.code || data.status) + "";
                sendUINotification(
                  `Buy failed for ${player._staticData.name} -- reattempting ${
                    status == 461 ? "(Others won)" : ""
                  }`,
                  UINotificationType.NEGATIVE
                );
              }
            });
          } else {
            sendUINotification(
              `Search failed for ${player._staticData.name}`,
              UINotificationType.NEGATIVE
            );
          }
        }
      );
      await wait(getRandWaitTime("3-5"));
    }
    if (!buySuccess) {
      sendUINotification(
        `Buy failed for ${player._staticData.name}`,
        UINotificationType.NEGATIVE
      );
    }
    resolve();
  });
};

const fillSquad = async (sbcId) => {
  const squadId = $("#squadId").val();
  if (!squadId) {
    sendUINotification("Squad Id is missing !!!", UINotificationType.NEGATIVE);
    return;
  }

  showLoader();

  const squadPlayersLookupPromise = getSquadPlayerLookup();
  const futBinSquadPlayersInfoPromise = getSbcPlayersInfoFromFUTBin(squadId);
  const [squadPlayersLookup, futBinSquadPlayersInfo] = await Promise.all([
    squadPlayersLookupPromise,
    futBinSquadPlayersInfoPromise,
  ]);
  const squadPlayers = futBinSquadPlayersInfo
    .sort((a, b) => b.positionId - a.positionId)
    .map((currItem) => {
      const key = currItem.definitionId;
      const clubPlayerInfo = squadPlayersLookup.get(key);
      const playerEntity = new UTItemEntity();
      playerEntity.id = clubPlayerInfo ? clubPlayerInfo.id : key;
      playerEntity.definitionId = key;
      playerEntity.concept = !clubPlayerInfo;
      playerEntity.stackCount = 1;
      return playerEntity;
    });
  let squadTotal = 0;

  const { _squad, _challenge } = getAppMain()
    .getRootViewController()
    .getPresentedViewController()
    .getCurrentViewController()
    .getCurrentController()._leftController;

  _squad.setPlayers(squadPlayers, true);

  services.SBC.saveChallenge(_challenge).observe(
    this,
    async function (sender, data) {
      services.SBC.loadChallengeData(_challenge).observe(
        this,
        async function (sender, { response: { squad } }) {
          hideLoader();

          setValue(sbcId, {
            expiryTimeStamp: new Date(Date.now() + 15 * 60 * 1000),
            value: squadTotal.toLocaleString(),
          });
          appendSquadTotal(squadTotal.toLocaleString());
          const players = squad._players.map((player) => player._item);
          _squad.setPlayers(players, true);
          _challenge.onDataChange.notify({ squad });
        }
      );
    }
  );
};

const appendSquadTotal = (total) => {
  if ($(".squadTotal").length) {
    $(".squadTotal").text(total);
  } else {
    $(
      `<div class="rating">
        <span class="ut-squad-summary-label">FUTBIN Squad Price</span>
        <div>
          <span class="ratingValue squadTotal currency-coins">${total}</span>
        </div> 
      </div>
      `
    ).insertAfter($(".chemistry"));
  }
};
