export const playerItemRenderOverride = () => {
  const playerRenderItem = UTPlayerItemView.prototype.renderItem;

  UTPlayerItemView.prototype.renderItem = function (player, t) {
    const response = playerRenderItem.call(this, player, t);
    const mainViewDiv = $(this.__mainViewDiv).find(".playerOverview");
    const positions = player.possiblePositions || [];
    $(
      `<div class='playerOverview' style="color: rgb(70, 57, 12);right:0;left:unset">${positions.reduce(
        (acc, position) => {
          player.preferredPosition !== position &&
            (acc += `<div class='preferredPosition'>${PlayerPosition[position]}</div>`);
          return acc;
        },
        ""
      )}</div>`
    ).insertBefore(mainViewDiv);
    return response;
  };
};
