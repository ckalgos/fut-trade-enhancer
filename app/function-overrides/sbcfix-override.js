import { getValue } from "../services/repository";

export const sbcFixOverride = () => {
  const isRequirementMet = UTSBCChallengeEntity.prototype.isRequirementMet;
  UTSBCChallengeEntity.prototype.isRequirementMet = function (t) {
    const enhancerSetting = getValue("EnhancerSettings") || {};
    if (
      enhancerSetting["idFixSbcs"] &&
      t.getFirstKey() === SBCEligibilityKey.ALL_PLAYERS_CHEMISTRY_POINTS
    ) {
      t.scope = SBCEligibilityScope.GREATER;
    }
    return isRequirementMet.call(this, t);
  };
};
