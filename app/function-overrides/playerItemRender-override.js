import { getValue } from "../services/repository";

export const playerItemRenderOverride = () => {
  const playerRenderItem = UTPlayerItemView.prototype.renderItem;

  UTPlayerItemView.prototype.renderItem = function (player, t) {
    const response = playerRenderItem.call(this, player, t);
    const { idShowAlternatePosition } = getValue("EnhancerSettings") || {};
    if (idShowAlternatePosition) {
      setTimeout(() => {
        const mainViewDiv = $(this.__mainViewDiv).find(".playerOverview");
        if ($(this.__mainViewDiv).find(".preferredPositionWrapper")[0]) {
          return;
        }
        const positions = player.possiblePositions || [];
        $(
          `<div class='playerOverview preferredPositionWrapper' style="color: rgb(70, 57, 12);right:0;left:unset">${positions.reduce(
            (acc, position) => {
              player.preferredPosition !== position &&
                (acc += `<div class='preferredPosition'>${PlayerPosition[position]}</div>`);
              return acc;
            },
            ""
          )}</div>`
        ).insertBefore(mainViewDiv);
      }, 10);
    }
    return response;
  };
};
