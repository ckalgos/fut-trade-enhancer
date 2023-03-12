import { saveSolution } from "../services/analytics";

export const sbcSubmitChallengeOverride = () => {
  const submitChallenge = services.SBC.submitChallenge;
  services.SBC.submitChallenge = function (challenge, set, i) {
    const players = challenge.squad.getFieldPlayers().map(function (t) {
      return t.item.definitionId;
    });

    const challengeRequirements = challenge.eligibilityRequirements.map(
      (eligibility) => ({
        scope: eligibility.scope,
        requirements: eligibility.kvPairs._collection,
      })
    );

    saveSolution({
      sbcId: challenge.id,
      players,
      expiresOn: challenge.endTime,
      challengeName: challenge.name,
      setName: set.name,
      requirements: challengeRequirements,
    });
    return submitChallenge.call(this, challenge, set, i);
  };
};
