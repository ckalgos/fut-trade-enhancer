import { getSquadPlayerIds } from "../services/club";
import { setValue } from "../services/repository";

export const transferHubOverride = () => {
  const transferTile =
    UTTransfersHubViewController.prototype._requestTransferTargetData;

  UTTransfersHubViewController.prototype._requestTransferTargetData =
    function () {
      transferTile.call(this);
      getSquadPlayerIds().then((memberIds) => {
        setValue("squadMemberIds", memberIds);
      });
    };
};
