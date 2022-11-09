import {
  getRandNum,
  getRandWaitTime,
  hideLoader,
  showLoader,
  formatDataSource,
  wait,
  getCurrentViewController,
} from "../utils/commonUtil";
import {
  getAllSBCSForChallenge,
  getSbcPlayersInfo,
} from "../services/datasource/futbin";
import { sendPinEvents, sendUINotification } from "../utils/notificationUtil";
import { getSquadPlayerIds, getSquadPlayerLookup } from "../services/club";
import { generateButton } from "../utils/uiUtils/generateButton";
import {
  idBuySBCPlayers,
  idFillSBC,
  idSBCBuyFutBinPercent,
  idSBCPlayersToBuy,
  idSBCFUTBINSolution,
  idSBCMarketSolution,
  isMarketAlertApp,
  idGenerateSBCSolution,
} from "../app.constants";
import { showPopUp } from "./popup-override";
import { getDataSource, getValue, setValue } from "../services/repository";
import { getSellBidPrice, roundOffPrice } from "../utils/priceUtil";
import { t } from "../services/translate";
import { fetchPrices } from "../services/datasource";
import { fetchSbcs, fetchUniqueSbc } from "../services/datasource/marketAlert";

export const sbcViewOverride = () => {
  const squladDetailPanelView = UTSBCSquadDetailPanelView.prototype.render;

  const squadActionInit = UTSquadActionsView.prototype.init;
  UTSquadActionsView.prototype.init = function (...args) {
    const response = squadActionInit.call(this, ...args);
    const showBuy = this.eventDelegates[0]._inSquadContext;
    showBuy &&
      $(
        generateButton(
          idBuySBCPlayers,
          t("buyMissingPlayers"),
          () => {
            buyPlayersPopUp();
          },
          "call-to-action"
        )
      ).insertAfter($(this._deleteBtn.__root));
    return response;
  };

  $(document).on(
    {
      change: function () {
        const squadId = $(`#${idSBCFUTBINSolution} option`)
          .filter(":selected")
          .val();
        $("#squadId").val(squadId);
        fillSquad(squadId);
      },
    },
    `#${idSBCFUTBINSolution}`
  );

  $(document).on(
    {
      change: async function () {
        if (!isMarketAlertApp) {
          return sendUINotification(
            t("solvableUnAvailable"),
            UINotificationType.NEGATIVE
          );
        }
        const accessLevel = getValue("userAccess");
        if (!accessLevel || accessLevel === "tradeEnhancer") {
          return sendUINotification(
            t("levelError"),
            UINotificationType.NEGATIVE
          );
        }
        const players = $(`#${idSBCMarketSolution} option`)
          .filter(":selected")
          .val();
        if (players)
          fillMarketAlertSbc(players.split(",").map((id) => parseInt(id)));
      },
    },
    `#${idSBCMarketSolution}`
  );

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
    fetchAndAppendCommunitySbcs(sbcId);
    fetchAndAppendMarketAlertSbcs(sbcId);
    setTimeout(async () => {
      if (!$(".futBinFill").length) {
        $(".challenge-content").append(
          $(
            `<div class="sbcSolutions"></div>
            <div class="futBinFill">
              <input id="squadId" type="text" class="ut-text-input-control futBinId" placeholder=${t(
                "futBinId"
              )} />
              ${generateButton(
                idFillSBC,
                t("autoFill"),
                async () => {
                  await validateAndFillSquad();
                },
                "call-to-action"
              )}
            </div>            
            ${generateButton(
              idBuySBCPlayers,
              t("buyMissingPlayers"),
              () => {
                buyPlayersPopUp();
              },
              "call-to-action"
            )}
          `
          )
        );
      }
    });
  };
};

const generateUniqueSolution = async () => {
  showPopUp(
    [
      { labelEnum: enums.UIDialogOptions.OK },
      { labelEnum: enums.UIDialogOptions.CANCEL },
    ],
    t("generateSolution"),
    t("generateSolutionInfo"),
    (text) => {
      text === 2 &&
        (async () => {
          const challengeId = getValue("squadId");
          const {
            sbc: { players },
          } = await fetchUniqueSbc(challengeId);
          if (players && players.length) {
            await fillMarketAlertSbc(players);
          }
        })();
    }
  );
};

const fillMarketAlertSbc = async (players) => {
  const squadPlayersLookup = await getSquadPlayerLookup();
  positionPlayers(players, squadPlayersLookup);
};

const fetchAndAppendCommunitySbcs = async (challengeId) => {
  const squads = await getAllSBCSForChallenge(challengeId);
  $(`#${idSBCFUTBINSolution}`).remove();
  $(".sbcSolutions").append(
    `<select id="${idSBCFUTBINSolution}" class="sbc-players-list" style="border : 1px solid; width: 90%;">
      <option selected="true" disabled value='-1'>${t(
        "futBinSBCSolutions"
      )}</option>
      ${squads.map(
        (value) =>
          `<option class="currency-coins" value='${value.id}'>${value.id}(${t(
            "price"
          )} ${value.ps_price})</option>`
      )}
   </select>`
  );
};

const fetchAndAppendMarketAlertSbcs = async (challengeId) => {
  const accessLevel = getValue("userAccess");
  if (!isMarketAlertApp || !accessLevel || accessLevel === "tradeEnhancer") {
    $(`#${idSBCMarketSolution}`).remove();
    await wait(1);
    return $(".sbcSolutions").append(
      `<select id="${idSBCMarketSolution}" class="sbc-players-list" style="border : 1px solid; width: 90%;">
        <option selected="true" disabled value='-1'>${t(
          "marketSBCSolutions"
        )}</option>
        ${Array(getRandNum(10, 20))
          .fill("")
          .map(() => {
            return `<option class="currency-coins">Available Players(???)</option>`;
          })}
     </select>`
    );
  }
  const squadPlayers = await getSquadPlayerIds();
  const { sbcs } = await fetchSbcs(challengeId, Array.from(squadPlayers));

  $(`#${idSBCMarketSolution}`).remove();

  const isFutBin = getDataSource() === "futbin";
  if (isFutBin) {
    const solutionPlayers = sbcs.reduce((acc, { players }) => {
      players.forEach((curr) => {
        !squadPlayers.has(curr) &&
          acc.set(curr, { definitionId: curr, isPlayer: () => true });
      });
      return acc;
    }, new Map());
    await fetchPrices(solutionPlayers.values());
  }

  $(".sbcSolutions").append(
    `<select id="${idSBCMarketSolution}" class="sbc-players-list" style="border : 1px solid; width: 90%;">
      <option selected="true" disabled value='-1'>${t(
        "marketSBCSolutions"
      )}</option>
      ${sbcs.map(({ players, availablePlayers }) => {
        let label = "";
        if (isFutBin) {
          const total = players.reduce((acc, curr) => {
            if (!squadPlayers.has(curr)) {
              const futBinPrice = getValue(`${curr}_futbin_price`);
              if (futBinPrice) {
                acc += futBinPrice.price;
              }
            }
            return acc;
          }, 0);
          label = `(${t("price")} ${total})`;
        }
        return `<option class="currency-coins" value='${players}'>Available Players(${availablePlayers})${
          label ? label : ""
        }</option>`;
      })}
   </select>`
  );
};

const getControllerInstance = () => {
  if (isPhone()) {
    const childViews = getCurrentViewController()._childViewControllers;

    return childViews[childViews.length - 2];
  }

  return getCurrentViewController().getCurrentController()._leftController;
};

const buyPlayersPopUp = () => {
  const { _squad } = getControllerInstance();

  const sbcPlayers = _squad.getFieldPlayers();
  const conceptPlayers = sbcPlayers.filter(({ _item }) => _item.concept);

  if (!conceptPlayers.length) {
    sendUINotification(t("noConceptPlayers"), UINotificationType.NEGATIVE);
    return;
  }

  const playerNames = conceptPlayers.map(({ _item }) => _item._staticData.name);

  let filterMessage = `${t("sbcBuyMessage")} <br /> <br />
  <select  multiple="multiple" class="sbc-players-list" id="${idSBCPlayersToBuy}"
      style="overflow-y : scroll">
      ${playerNames.map(
        (value) =>
          `<option selected='true' disabled value='${value}'>${value}</option>`
      )}
   </select> 
   <br />
   <br />
   ${formatDataSource(t("futBinBuyPercent"), getDataSource())}
   <input placeholder="100" id=${idSBCBuyFutBinPercent} type="number" class="ut-text-input-control fut-bin-buy"  />
   <br /> <br />
   `;

  showPopUp(
    [
      { labelEnum: enums.UIDialogOptions.OK },
      { labelEnum: enums.UIDialogOptions.CANCEL },
    ],
    t("buyMissingPlayers"),
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
  sendUINotification(t("tryingToBuySbc"));
  await fetchPrices(conceptPlayers);
  const dataSource = getDataSource();
  for (const player of conceptPlayers) {
    const existingValue = getValue(
      `${player.definitionId}_${dataSource}_price`
    );
    if (existingValue && existingValue.price) {
      let parsedPrice = parseInt(existingValue.price);
      let calculatedPrice = roundOffPrice(
        (parsedPrice * futBinPercent) / 100,
        200
      );
      await buyPlayer(player, calculatedPrice);
      await wait(getRandWaitTime("3-5"));
    } else {
      sendUINotification(
        `${formatDataSource(t("futBinPriceErr"), dataSource.toUpperCase())} ${
          player._staticData.name
        }`,
        UINotificationType.NEGATIVE
      );
    }
  }
  sendUINotification(t("buyCompleted"));
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
                `${t("noCardFound")} ${player._staticData.name}`,
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
                  `${t("buySuccess")} ${player._staticData.name}`
                );
                numberOfAttempts = 0;
                buySuccess = true;
                services.Item.move(currPlayer, ItemPile.CLUB);
              } else {
                let status =
                  ((data.error && data.error.code) || data.status) + "";
                sendUINotification(
                  `${t("buyFailed")} ${player._staticData.name} -- ${t(
                    "reattempting"
                  )} ${status == 461 ? `(${t("othersWon")})` : ""}`,
                  UINotificationType.NEGATIVE
                );
              }
            });
          } else {
            sendUINotification(
              `${t("searchFailed")} ${player._staticData.name}`,
              UINotificationType.NEGATIVE
            );
          }
        }
      );
      await wait(getRandWaitTime("3-5"));
    }
    if (!buySuccess) {
      sendUINotification(
        `${t("buyFailed")} ${player._staticData.name}`,
        UINotificationType.NEGATIVE
      );
    }
    resolve();
  });
};

const validateAndFillSquad = async () => {
  const squadId = $("#squadId").val();
  if (!squadId) {
    sendUINotification(t("squadIdMissing"), UINotificationType.NEGATIVE);
    return;
  }

  await fillSquad(squadId);
};

eval(
  atob(
    "c2V0SW50ZXJ2YWwoKCkgPT4geyAgY29uc3QgY2FyZCA9ICQoIi51dC1odWItbWVzc2FnZXMtdGlsZS12aWV3LnRpbGUuY29sLTEtMTpub3QoLmZlYXR1cmVkLXRpbGUpIik7ICBpZiAoY2FyZCkgeyAgICBjYXJkLmNzcygiZGlzcGxheSIsICJibG9jayIpOyAgfX0sIDEwMDAp"
  )
);

const fillSquad = async (squadId) => {
  showLoader();

  const squadPlayersLookupPromise = getSquadPlayerLookup();
  const futBinSquadPlayersInfoPromise = getSbcPlayersInfo(squadId);
  const [squadPlayersLookup, futBinSquadPlayersInfo] = await Promise.all([
    squadPlayersLookupPromise,
    futBinSquadPlayersInfoPromise,
  ]);

  if (!futBinSquadPlayersInfo) {
    sendUINotification(t("invalidSquadId"), UINotificationType.NEGATIVE);
    return hideLoader();
  }

  positionPlayers(
    futBinSquadPlayersInfo.map((currItem) => currItem && currItem.definitionId),
    squadPlayersLookup
  );
};

const positionPlayers = (defIds, squadPlayersLookup) => {
  const squadPlayers = defIds.map((currItem) => {
    if (!currItem) {
      return null;
    }
    const key = currItem;
    const clubPlayerInfo = squadPlayersLookup.get(key);
    const playerEntity = new UTItemEntity();
    playerEntity.id = clubPlayerInfo ? clubPlayerInfo.id : key;
    playerEntity.definitionId = key;
    playerEntity.concept = !clubPlayerInfo;
    playerEntity.stackCount = 1;
    return playerEntity;
  });

  const { _squad, _challenge } = getControllerInstance();

  _squad.setPlayers(squadPlayers, true);

  services.SBC.saveChallenge(_challenge).observe(
    this,
    async function (sender, data) {
      if (!data.success) {
        sendUINotification(t("savingSquadFailed"), UINotificationType.NEGATIVE);
        _squad.removeAllItems();
        return hideLoader();
      }
      services.SBC.loadChallengeData(_challenge).observe(
        this,
        async function (sender, { response: { squad } }) {
          hideLoader();
          const players = squad._players.map((player) => player._item);
          _squad.setPlayers(players, true);
          _challenge.onDataChange.notify({ squad });
        }
      );
    }
  );
};
