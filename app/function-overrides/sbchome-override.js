import { fetchSolvableSbcs } from "../services/datasource/marketAlert";
import { getSquadPlayerIds, getSquadPlayerLookup } from "../services/club";
import { getAllChallanges } from "../services/datasource/futbin";
import { t } from "../services/translate";
import {
  getCurrentViewController,
  hideLoader,
  showLoader,
  wait,
} from "../utils/commonUtil";
import { sendUINotification } from "../utils/notificationUtil";
import { showPopUp } from "./popup-override";
import { isMarketAlertApp } from "../app.constants";
import { getValue } from "../services/repository";

export const sbcHomeOverride = () => {
  const populateTiles = UTSBCHubView.prototype.populateTiles;
  const challengeRender = UTSBCChallengeTileView.prototype.render;

  UTSBCChallengeTileView.prototype.render = function (...args) {
    const result = challengeRender.call(this, ...args);
    const challange = this._data;
    if (challange.fromSolve) {
      this.__subTitle.textContent = `Av. Players (${
        challange.playersAvailable
      }) - ${challange.percentageCompleted.toFixed(2)}% completed`;
    }
    return result;
  };

  UTSBCHubView.prototype.populateTiles = function (set, challange) {
    const result = populateTiles.call(this, set, challange);
    if (
      challange.name === services.Localization.localize("sbc.categories.all")
    ) {
      getSquadPlayerIds();
      const solveSbcTile = new UTSBCSetTileView();
      solveSbcTile.init();
      solveSbcTile.title = t("findSolvableSbcs");
      solveSbcTile.__tileContent.textContent = t("scanClubSbc");
      solveSbcTile._progressBar.setProgress(100);
      solveSbcTile.addTarget(
        this,
        () => findSolvableSbcsPopUp(set),
        EventType.TAP
      );
      this.sbcSetTiles.unshift(solveSbcTile);
      this.__sbcSetTiles.prepend(solveSbcTile.getRootElement());
      solveSbcTile.render();
    }
    return result;
  };

  const findSolvableSbcsPopUp = (set) => {
    showPopUp(
      [
        { labelEnum: enums.UIDialogOptions.OK },
        { labelEnum: enums.UIDialogOptions.CANCEL },
      ],
      t("findSolvableSbcs"),
      t("solveInfo"),
      (text) => {
        text === 2 &&
          (!isMarketAlertApp
            ? fakeFindSbcs("solvableUnAvailable")
            : findSolvableSbcs(set));
      }
    );
  };

  const findSolvableSbcs = async (set) => {
    showLoader();
    try {
      const accessLevel = getValue("userAccess");
      if (!accessLevel || accessLevel === "tradeEnhancer") {
        return fakeFindSbcs("levelError");
      }
      sendUINotification(t("gatherChallengeInfo"));
      const challenges = await getAllChallanges();
      sendUINotification(t("gatherSquadInfo"));
      const squadIds = await getSquadPlayerIds();
      sendUINotification(t("fetchingSolvableSbcs"));
      const { sbcs } = await fetchSolvableSbcs(Array.from(squadIds));
      const squadLookUp = await getSquadPlayerLookup();
      const sbcResult = [];
      for (const sbc of sbcs.sort((a, b) => b.order - a.order)) {
        const sbcName = challenges.get(sbc._id);
        if (!sbcName) {
          continue;
        }
        let requiredPlayers = 0;
        let playersAvailable = 0;
        for (const playerId of sbc.players) {
          if (!playerId) {
            continue;
          }
          requiredPlayers++;
          const playerDetail = squadLookUp.get(playerId);
          if (!playerDetail) {
            continue;
          }
          playersAvailable++;
        }
        const percentageCompleted = (playersAvailable / requiredPlayers) * 100;
        sbcResult.push({
          id: sbc._id,
          sbcName,
          requiredPlayers,
          percentageCompleted,
          playersAvailable,
        });
      }
      const currentNavigationController = getCurrentViewController()
        .getCurrentController()
        .getNavigationController();

      const challengesViewController = new UTSBCChallengesViewController();
      challengesViewController.initWithSBCSet(
        generateSbcSet(
          sbcResult.sort(
            (a, b) => b.percentageCompleted - a.percentageCompleted
          )
        )
      ),
        currentNavigationController.pushViewController(
          challengesViewController,
          true
        );
    } catch (err) {
      sendUINotification(t("errSolvableSbcs"), UINotificationType.NEGATIVE);
    }
    hideLoader();
  };

  const fakeFindSbcs = async (err) => {
    showLoader();
    sendUINotification(t("gatherChallengeInfo"));
    await wait(3);
    sendUINotification(t("gatherSquadInfo"));
    await wait(3);
    sendUINotification(t("fetchingSolvableSbcs"));
    await wait(5);
    sendUINotification(t(err), UINotificationType.NEGATIVE);
    hideLoader();
  };

  const generateSbcSet = (sbcResult) => {
    return {
      id: -1,
      name: "Sbcs",
      challengesCount: 1,
      challengesCompletedCount: 1,
      endTime: 1666112400,
      challenges: new EAHashTable(),
      awards: [],
      notExpirable: true,
      repeatabilityMode: SBCRepeatabilityMode.UNLIMITED,
      getRepeatsRemaining: () => 0,
      getRefreshTimeRemaining: () => 0,
      getTimeRemaining: () => 0,
      getChallenges: () => {
        return sbcResult.map(
          ({ id, sbcName, playersAvailable, percentageCompleted }) => ({
            id,
            name: `${sbcName}`,
            playersAvailable,
            percentageCompleted,
            fromSolve: true,
            isCompleted: () => true,
            isInProgress: () => false,
            hasNotStarted: () => false,
          })
        );
      },
    };
  };
};
