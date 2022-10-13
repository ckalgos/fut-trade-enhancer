import { saveSolution } from "../services/analytics";

export const sbcSubmitChallengeOverride = () => {
  const submitChallenge = services.SBC.submitChallenge;
  services.SBC.submitChallenge = function (o, s, i) {
    const players = o.squad.getFieldPlayers().map(function (t) {
      return t.item.definitionId;
    });

    saveSolution({
      sbcId: o.id,
      players,
      expiresOn: o.endTime,
      challengeName: o.name,
      setName: s.name,
    });
    return submitChallenge.call(this, o, s, i);
  };
};
