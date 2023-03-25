import {
  downloadCsv,
  wait,
  hideLoader,
  showLoader,
  formatDataSource,
} from "../utils/commonUtil";
import { MAX_CLUB_SEARCH } from "../app.constants";
import { getDataSource, getValue } from "./repository";
import { t } from "../services/translate";
import { sendUINotification } from "../utils/notificationUtil";
import { fetchPrices } from "./datasource";

export const getSquadPlayerIds = () => {
  return new Promise((resolve) => {
    const squadPlayerIds = new Set();
    getAllClubPlayers(true, null).then(([squadMembers]) => {
      squadMembers.forEach((member) => {
        squadPlayerIds.add(member.definitionId);
      });
      resolve(squadPlayerIds);
    });
  });
};

export const getSquadPlayersForSbc = ({ level, sort, rarity }) => {
  return new Promise((resolve) => {
    const squadPlayers = [];
    getAllClubPlayers(true, null, { level, sort, rarity }).then(
      ([squadMembers, isFromCache]) => {
        squadMembers.forEach((member) => {
          squadPlayers.push({
            definitionId: member.definitionId,
            databaseId: member.databaseId,
            rating: member.rating,
            quality: member.isBronzeRating()
              ? 1
              : member.isSilverRating()
              ? 2
              : 3,
            rareflag: member.rareflag,
            nationId: member.nationId,
            teamId: member.teamId,
            preferredPosition: member.preferredPosition,
            leagueId: member.leagueId,
            isSpecial: member.isSpecial(),
            groups: member.groups,
          });
        });
        resolve({
          squadPlayers: squadPlayers.sort((a, b) => a.rating - b.rating),
          isFromCache,
        });
      }
    );
  });
};

export const getSquadPlayerLookup = () => {
  return new Promise((resolve, reject) => {
    const squadPlayersLookup = new Map();
    getAllClubPlayers(true).then(([squadMembers]) => {
      squadMembers.forEach((member) => {
        squadPlayersLookup.set(member.definitionId, member);
      });
      resolve(squadPlayersLookup);
    });
  });
};

export const getNonActiveSquadPlayers = async function (isTradable) {
  return new Promise(async (resolve) => {
    const searchModel = new UTBucketedItemSearchViewModel();
    const currentSquadIds = await getActiveSquadIds(searchModel);
    if (!currentSquadIds) {
      sendUINotification(
        t("activeSquadMemberErr"),
        UINotificationType.NEGATIVE
      );
      return resolve();
    }
    const searchCriteria = searchModel.searchCriteria;
    searchCriteria.excludeDefIds = currentSquadIds;
    if (isTradable) {
      searchCriteria._untradeables = "false";
    }
    searchCriteria.count = MAX_CLUB_SEARCH;
    getClubSquad(searchCriteria).observe(
      this,
      async function (sender, response) {
        resolve(response.response.items);
      }
    );
  });
};

export const getAllClubPlayers = function (
  filterLoaned,
  playerId,
  { level, sort, rarity } = {}
) {
  return new Promise((resolve) => {
    services.Club.clubDao.resetStatsCache();
    services.Club.getStats();
    const searchCriteria = new UTBucketedItemSearchViewModel().searchCriteria;
    if (playerId) {
      searchCriteria.defId = [playerId];
    }
    if (level) {
      searchCriteria.level = level;
    }
    if (sort) {
      searchCriteria._sort = sort;
    }
    if (rarity) {
      searchCriteria.rarities = [rarity];
    }
    searchCriteria.count = MAX_CLUB_SEARCH;
    let gatheredSquad = [];

    const getAllSquadMembers = () => {
      getClubSquad(searchCriteria).observe(
        this,
        async function (sender, response) {
          gatheredSquad = [
            ...response.response.items.filter(
              (item) => !filterLoaned || item.loans < 0
            ),
          ];
          if (response.status !== 400 && !response.response.retrievedAll) {
            searchCriteria.offset += searchCriteria.count;
            await wait(1);
            getAllSquadMembers();
          } else {
            resolve([gatheredSquad, response.status === 304]);
          }
        }
      );
    };
    getAllSquadMembers();
  });
};

const getClubSquad = (searchCriteria) => {
  return services.Club.search(searchCriteria);
};

const getActiveSquadIds = (searchModel) => {
  return new Promise((resolve) => {
    searchModel
      .requestActiveSquadDefIds()
      .observe(this, async function (sender, response) {
        if (response.data && response.success) {
          resolve(response.data.defIds);
        } else {
          resolve();
        }
      });
  });
};

export const downloadClub = async () => {
  showLoader();
  let [squadMembers] = await getAllClubPlayers();
  squadMembers = squadMembers.sort((a, b) => b.rating - a.rating);

  await fetchPrices(squadMembers);
  const dataSource = getDataSource();

  let csvContent = "";
  const headers = formatDataSource(
    t("csvFileHeader"),
    dataSource.toUpperCase()
  );
  csvContent += headers + "\r\n";
  for (const squadMember of squadMembers) {
    let rowRecord = "";
    rowRecord += squadMember._staticData.name + ",";
    rowRecord += squadMember.rating + ",";
    rowRecord += getCardQuality(squadMember) + ",";
    if (ItemRarity[squadMember.rareflag]) {
      rowRecord += !squadMember.rareflag
        ? `${services.Localization.localize("item.raretype0")},`
        : ItemRarity[squadMember.rareflag] + ",";
    } else if (squadMember.isSpecial()) {
      rowRecord +=
        services.Localization.localize("search.cardLevels.cardLevel4") + ",";
    } else {
      rowRecord += ",";
    }
    rowRecord +=
      UTLocalizationUtil.positionIdToName(
        squadMember.preferredPosition,
        services.Localization
      ) + ",";
    rowRecord +=
      UTLocalizationUtil.nationIdToName(
        squadMember.nationId,
        services.Localization
      ) + ",";
    rowRecord +=
      UTLocalizationUtil.leagueIdToName(
        squadMember.leagueId,
        services.Localization
      ) + ",";
    rowRecord +=
      UTLocalizationUtil.teamIdToAbbr15(
        squadMember.teamId,
        services.Localization
      ) + ",";
    if (squadMember._itemPriceLimits) {
      rowRecord +=
        `${services.Localization.localize("abbr.minimum")}` +
        squadMember._itemPriceLimits.minimum +
        ` ${services.Localization.localize("abbr.maximum")}` +
        squadMember._itemPriceLimits.maximum +
        ",";
    } else {
      rowRecord += "--NA--,";
    }
    const existingValue = getValue(
      `${squadMember.definitionId}_${dataSource}_price`
    );
    if (existingValue && existingValue.price) {
      rowRecord += existingValue.price + ",";
    } else {
      rowRecord += "--NA--,";
    }
    rowRecord += squadMember.lastSalePrice + ",";
    rowRecord += squadMember.discardValue + ",";
    rowRecord += squadMember.contract + ",";
    rowRecord += squadMember.untradeable + ",";
    rowRecord += (squadMember.loans >= 0) + ",";

    csvContent += rowRecord + "\r\n";
  }
  const club = services.User.getUser().getSelectedPersona().getCurrentClub();
  downloadCsv(csvContent, club.name);

  hideLoader();
};

const getCardQuality = (card) => {
  if (card.isGoldRating()) {
    return services.Localization.localize("search.cardLevels.cardLevel3");
  } else if (card.isSilverRating()) {
    return services.Localization.localize("search.cardLevels.cardLevel2");
  } else if (card.isBronzeRating()) {
    return services.Localization.localize("search.cardLevels.cardLevel1");
  }
  return "";
};
