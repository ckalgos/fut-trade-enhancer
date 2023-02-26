import { generateTextInput } from "../utils/uiUtils/generateTextInput";
import {
  idSquadBuildPlayerRating,
  idSquadBuildIgnorePosition,
} from "../app.constants";
import { createElementFromHTML, getRangeValue } from "../utils/commonUtil";
import { generateToggleInput } from "../utils/uiUtils/generateToggleInput";
import { getValue } from "../services/repository";

export const squadBuilderOverride = () => {
  const builderViewGenerate = UTSquadBuilderView.prototype._generate;
  const onSearchComplete =
    UTSquadBuilderViewController.prototype.onClubSearchComplete;
  const playersGenerate =
    UTSquadBuilderViewModel.prototype.generatePlayerCollection;

  UTSquadBuilderView.prototype._generate = function () {
    const enhancerSetting = getValue("EnhancerSettings") || {};
    const res = builderViewGenerate.call(this);
    this.__sortContainer.append(
      createElementFromHTML(
        `<div>
        ${generateTextInput(
          "Rating",
          "10-99",
          { idSquadBuildPlayerRating },
          "(Filter players by rating range)",
          enhancerSetting.idSquadBuildPlayerRating,
          "text",
          "sb-setting",
          "\\d+-\\d+$"
        )}
        ${generateToggleInput(
          "Ignore Position",
          { idSquadBuildIgnorePosition },
          "",
          enhancerSetting.idSquadBuildIgnorePosition,
          "sb-setting"
        )}
        </div>`
      )
    );
    return res;
  };

  UTSquadBuilderViewModel.prototype.generatePlayerCollection = function (
    slots,
    players,
    sbcEntity
  ) {
    const enhancerSetting = getValue("EnhancerSettings") || {};
    if (!enhancerSetting.idSquadBuildIgnorePosition) {
      return playersGenerate.call(this, slots, players, sbcEntity);
    }

    let currentIndex = 0;
    return slots.map(function (_, currentSlot) {
      var slot = sbcEntity ? sbcEntity.getSlot(currentSlot) : null;
      return slot && (slot.isValid() || slot.isBrick())
        ? slot.getItem()
        : players[currentIndex++];
    });
  };

  UTSquadBuilderViewController.prototype.onClubSearchComplete = function (
    observer,
    response
  ) {
    const enhancerSetting = getValue("EnhancerSettings") || {};
    const ratingVal = getRangeValue(
      enhancerSetting.idSquadBuildPlayerRating || ""
    );
    if (ratingVal.length === 2) {
      response.response.items = response.response.items.filter((x) => {
        if (x.rating < ratingVal[0] || x.rating > ratingVal[1]) {
          return false;
        }
        return true;
      });
    }

    onSearchComplete.call(this, observer, response);
  };
};
