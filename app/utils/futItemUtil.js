export const getCardQuality = (card) => {
  if (card.isGoldRating()) {
    return "Gold";
  } else if (card.isSilverRating()) {
    return "Silver";
  } else if (card.isBronzeRating()) {
    return "Bronze";
  }
  return "";
};

export const getCardRarity = (card) => {
  if (ItemRarity[card.rareflag]) {
    if (!card.rareflag) {
      return "COMMON";
    }
    return ItemRarity[card.rareflag];
  } else if (card.isSpecial()) {
    return "SPECIAL";
  }
  return "";
};

export const getCardName = (card) => {
  const translationService = services.Localization;
  if (!translationService) {
    return "";
  }
  if (card.isManagerContract()) {
    return translationService.localize("card.title.managercontracts");
  } else if (card.isPlayerContract()) {
    return translationService.localize("card.title.playercontracts");
  } else if (card.isStyleModifier()) {
    return UTLocalizationUtil.playStyleIdToName(
      card.subtype,
      translationService
    );
  } else if (card.isPlayerPositionModifier()) {
    return "ALTERNATIVE POSITIONS";
  }
  return card._staticData.name;
};
