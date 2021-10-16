import { addBtnListner, hideLoader, showLoader } from "../utils/commonUtil";
import { getSbcPlayersInfoFromFUTBin } from "../services/futbin";
import { sendUINotification } from "../utils/notificationUtil";
import { getPlayersForSbc } from "../services/club";

export const sbcViewOverride = () => {
  const squladDetailPanelView = UTSBCSquadDetailPanelView.prototype.render;

  UTSBCSquadDetailPanelView.prototype.render = function (...params) {
    squladDetailPanelView.call(this, ...params);
    setTimeout(() => {
      if (!$(".futBinFill").length) {
        $(".challenge-content").append(
          $(
            `<div class="futBinFill" >
              <input id="squadId" type="text" class="ut-text-input-control futBinId" placeholder="FutBin Id">
                <button id="squadFillFutBin" class="btn-standard call-to-action">
                    Auto Fill
                </button>
            </div>
          `
          )
        );
      }
    });
  };

  addBtnListner("#squadFillFutBin", async () => {
    const squadId = $("#squadId").val();
    if (!squadId) {
      sendUINotification(
        "Squad Id is missing !!!",
        UINotificationType.NEGATIVE
      );
      return;
    }

    showLoader();

    const playerPositionIds = await getSbcPlayersInfoFromFUTBin(squadId);
    const squadPlayers = await getPlayersForSbc(playerPositionIds);
    let squadTotal = 0;

    const { _squad, _challenge } = getAppMain()
      .getRootViewController()
      .getPresentedViewController()
      .getCurrentViewController()
      .getCurrentController()._leftController;

    const sbcSlots = _squad.getSBCSlots();

    const positionIndexes = sbcSlots.reduce((acc, curr) => {
      if (!curr.position) return acc;

      if (!acc[curr.position.typeName]) {
        acc[curr.position.typeName] = [];
      }
      acc[curr.position.typeName].push(curr.index);
      return acc;
    }, {});

    const playersToAdd = [];

    const adjustPlayerPostion = (playerId, playerPosition) => {
      if (positionIndexes[playerPosition]) {
        if (positionIndexes[playerPosition].length) {
          const positions = positionIndexes[playerPosition];
          playersToAdd[parseInt(positions[0], 10)] = squadPlayers[playerId];
          positions.splice(0, 1);
        }
        if (!positionIndexes[playerPosition].length) {
          delete positionIndexes[playerPosition];
        }
        delete playerPositionIds[playerId];
      }
    };

    for (const playerId in playerPositionIds) {
      const playerPosition = playerPositionIds[playerId];
      squadTotal += parseInt(playerPosition.price, 10) || 0;
      adjustPlayerPostion(playerId, playerPosition.position);
    }

    for (const playerId in playerPositionIds) {
      const playerPosition = Object.keys(positionIndexes)[0];
      adjustPlayerPostion(playerId, playerPosition);
    }

    _squad.setPlayers(playersToAdd, true);

    services.SBC.saveChallenge(_challenge);

    hideLoader();

    $(
      `<div class="rating">
        <span class="ut-squad-summary-label">FUTBIN Squad Price</span>
        <div>
          <span class="ratingValue currency-coins">${squadTotal.toLocaleString()}</span>
        </div> 
      </div>
      `
    ).insertAfter($(".chemistry"));
  });
};
