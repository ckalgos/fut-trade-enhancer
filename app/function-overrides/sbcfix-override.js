import { getValue } from "../services/repository";

export const sbcFixOverride = () => {
  const isRequirementMet = UTSBCChallengeEntity.prototype.isRequirementMet;
  const buildString = UTSBCEligibilityDTO.prototype.buildString;

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

  UTSBCEligibilityDTO.prototype.buildString = function (...args) {
    const enhancerSetting = getValue("EnhancerSettings") || {};
    if (
      enhancerSetting["idFixSbcs"] &&
      this.getFirstKey() === SBCEligibilityKey.ALL_PLAYERS_CHEMISTRY_POINTS
    ) {
      this.scope = SBCEligibilityScope.GREATER;
    }
    return buildString.call(this, ...args);
  };
};
