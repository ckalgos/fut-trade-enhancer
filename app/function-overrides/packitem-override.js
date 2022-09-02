import { appendCardPrice } from "../utils/priceAppendUtil";

export const packItemOverride = () => {
  const storeListView = UTStoreRevealModalListView.prototype.render;

  UTStoreRevealModalListView.prototype.render = function (...args) {
    storeListView.call(this, ...args);
    appendCardPrice(
      this.listRows.map(({ __root, __auction, data }) => ({
        __root,
        __auction,
        data,
      })),
      true
    );
  };
};
