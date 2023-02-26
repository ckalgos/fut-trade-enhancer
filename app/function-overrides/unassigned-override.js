import { getValue } from "../services/repository";

export const unassignedOverride = () => {
  const setUnassignedItems =
    UTItemDomainRepository.prototype.setUnassignedItems;

  UTItemDomainRepository.prototype.setUnassignedItems = function (...params) {
    setUnassignedItems.call(this, ...params);
  };

  UTHomeHubViewController.prototype._onUnassignedItemsRequested = function (
    observer,
    response
  ) {
    observer.unobserve(this);
    if (response.success) {
      let unassigned = response.response.items.length;
      if (unassigned === 50) {
        unassigned = getValue("unassigned") || 50;
      }
      this.getView().renderUnassignedTile(unassigned);
    } else {
      NetworkErrorManager.checkCriticalStatus(t.status) &&
        NetworkErrorManager.handleStatus(t.status);
    }
  };
};
