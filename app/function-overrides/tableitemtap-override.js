export const tableItemTapOverride = () => {
  const tapDetected = UTItemTableCellView.prototype._tapDetected;
  UTItemTableCellView.prototype._tapDetected = function (evt) {
    if (!$(evt.target).hasClass("player-select")) {
      return tapDetected.call(this, evt);
    }
  };
};
