import { getSquadPlayerIds, getSquadPlayerLookup } from "../services/club";
import { getAllChallanges } from "../services/datasource/futbin";
import { fetchSolvableSbcs } from "../services/datasource/marketAlert";
import { t } from "../services/translate";
import { downloadCsv, hideLoader, showLoader } from "../utils/commonUtil";
import { getCardQuality } from "../utils/futItemUtil";
import { sendUINotification } from "../utils/notificationUtil";
import { showPopUp } from "./popup-override";

export const sbcHomeOverride = () => {
  const populateTiles = UTSBCHubView.prototype.populateTiles;

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
      !isPhone() ? t("solvableUnAvailable") : t("solveInfo"),
      (text) => {
        text === 2 && isPhone() && findSolvableSbcs(set);
      }
    );
  };

  const findSolvableSbcs = async (set) => {
    showLoader();
    try {
      sendUINotification(t("gatherChallengeInfo"));
      const challenges = await getAllChallanges();
      sendUINotification(t("gatherSquadInfo"));
      const squadIds = await getSquadPlayerIds();
      sendUINotification(t("fetchingSolvableSbcs"));
      const { sbcs } = await fetchSolvableSbcs(squadIds);
      const squadLookUp = await getSquadPlayerLookup();
      const sbcResult = [];
      for (const sbc of sbcs.sort((a, b) => b.order - a.order)) {
        const sbcName = challenges.get(sbc._id);
        if (!sbcName) {
          continue;
        }
        let requiredPlayers = 0;
        const playersNames = [];
        for (const playerId of sbc.players) {
          if (!playerId) {
            continue;
          }
          requiredPlayers++;
          const playerDetail = squadLookUp.get(playerId);
          if (!playerDetail) {
            continue;
          }
          playersNames.push(
            `${playerDetail._staticData.name} (${
              playerDetail.rating
            } ${getCardQuality(playerDetail)})`
          );
        }
        const percentageCompleted = (
          (playersNames.length / requiredPlayers) *
          100
        ).toFixed(2);
        sbcResult.push({
          sbcName,
          requiredPlayers,
          percentageCompleted,
          playersNames,
        });
      }

      downloadSolutionsAsSbc(sbcResult);
    } catch (err) {
      sendUINotification(t("errSolvableSbcs"), UINotificationType.NEGATIVE);
    }
    hideLoader();
  };

  const downloadSolutionsAsSbc = (sbcResult) => {
    const club = services.User.getUser().getSelectedPersona().getCurrentClub();

    const headers =
      "Challenge,Players Required, Players Available, Percentage Completed, Player1, Player2, Player3, Player4, Player5, Player6, Player7, Player8, Player9, Player10, PLayer11";
    let csvContent = "";
    csvContent += headers + "\r\n";
    for (const {
      sbcName,
      percentageCompleted,
      playersNames,
      requiredPlayers,
    } of sbcResult.sort(
      (a, b) => b.percentageCompleted - a.percentageCompleted
    )) {
      let rowRecord = sbcName + ",";
      rowRecord += requiredPlayers + ",";
      rowRecord += playersNames.length + ",";
      rowRecord += percentageCompleted + ",";
      rowRecord += playersNames.join(",");
      csvContent += rowRecord + "\r\n";
    }
    downloadCsv(csvContent, `${club.name}_Sbc_Solutions`);
  };
};
