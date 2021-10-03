import { idFutBinPercent, idResetFutBin } from "../app.constants";
import {
  fetchPricesFromFutBin,
  fetchPricesFromFutBinBulk,
} from "../services/futbin";
import { getValue, setValue } from "../services/repository";
import { getUserPlatform } from "../services/user";
import { createElementFromHTML } from "../utils/commonUtil";
import { sendUINotification } from "../utils/notificationUtil";
import { listForPrice } from "../utils/sellUtil";
import { generateButton } from "../utils/uiUtils/generateButton";
import { showFUTBINPercentPopUp } from "../view/futBinView";
import { appendFutBinPrice } from "./common-override/appendFutBinPrice";

export const transferListOverride = () => {
  UTSectionedTableHeaderView.prototype._generate = function _generate() {
    if (!this._generated) {
      var e = document.createElement("header");
      e.classList.add("ut-section-header-view");
      this.__text = document.createElement("h2");
      this.__text.classList.add("title");
      e.appendChild(this.__text);
      this._optionButton = new UTStandardButtonControl();
      this._optionButton.getRootElement().classList.add("section-header-btn");
      this._optionButton.getRootElement().classList.add("mini");
      this._optionButton.getRootElement().classList.add("call-to-action");
      this._optionRelist = createElementFromHTML(
        generateButton(
          idResetFutBin,
          "Re-list FUTBIN",
          () => {},
          "button-spinner section-header-btn mini call-to-action relistFut"
        )
      );
      e.appendChild(this._optionRelist);
      e.appendChild(this._optionButton.getRootElement());
      this.__root = e;
      this._generated = !0;
    }
  };

  UTSectionedTableHeaderView.prototype.setButtonText = function (header) {
    this._optionButton.setText(header);
    if (this._optionRelist) {
      if (
        !new Set([
          services.Localization.localize("infopanel.label.addplayer"),
          services.Localization.localize("tradepile.button.relistall"),
        ]).has(header)
      ) {
        this._optionRelist.classList.add("hide");
        return;
      }
      this._optionRelist.addEventListener("click", () => {
        onrelistFutBin(header);
      });
    }
  };

  UTSectionedTableHeaderView.prototype.showButton = function () {
    this._optionButton.show();
    this._optionRelist &&
      !this._optionRelist.classList.contains("hide") &&
      this._optionRelist.classList.add("show");
  };

  const onrelistFutBin = function (sectionHeader) {
    services.Item.requestTransferItems().observe(
      this,
      async function (t, response) {
        if (
          sectionHeader ===
          services.Localization.localize("tradepile.button.relistall")
        ) {
          let unSoldItems = response.data.items.filter(function (item) {
            var t = item.getAuctionData();
            return (
              item.type === "player" &&
              (t.isExpired() || (t.isValid() && t.isInactive()))
            );
          });

          listCardForFutBIN(unSoldItems);
        } else if (
          sectionHeader ===
          services.Localization.localize("infopanel.label.addplayer")
        ) {
          const availableItems = response.data.items.filter(function (item) {
            return item.type === "player" && !item.getAuctionData().isValid();
          });
          listCardForFutBIN(availableItems);
        }
      }
    );
  };

  const listCardForFutBIN = async (players) => {
    if (!players.length) {
      sendUINotification(
        "No players found to be listed",
        UINotificationType.NEGATIVE
      );
      return;
    }

    showFUTBINPercentPopUp(() => {
      const futBinPercent = parseInt($(`#${idFutBinPercent}`).val());
      listCardConfirm(players, futBinPercent);
    });
  };

  const listCardConfirm = async (players, futBinPercent) => {
    const platform = getUserPlatform();
    sendUINotification("Listing the players for FUTBIN price");
    const playerIds = new Set();
    const playersLookup = [];
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const existingValue = getValue(player.definitionId);
      if (existingValue) {
        await listForPrice(existingValue.price, player, futBinPercent);
      } else {
        playerIds.add(player.definitionId);
        playersLookup.push({
          players,
        });
      }
    }
    if (playerIds.size) {
      const playersIdArray = Array.from(playersId);
      const playerId = playersIdArray.shift();
      const refIds = playersIdArray.join(",");
      try {
        const futBinResponse = await fetchPricesFromFutBin(playerId, refIds, 3);
        if (futBinResponse.status === 200) {
          const futBinPrices = JSON.parse(futBinResponse.responseText);
          for (let player of playersLookup) {
            if (futBinPrices[player.definitionId]) {
              const futbinLessPrice =
                futBinPrices[definitionId].prices[platform].LCPrice;
              const cacheValue = {
                expiryTimeStamp: new Date(Date.now() + 15 * 60 * 1000),
                price: futbinLessPrice,
              };
              setValue(player.definitionId, cacheValue);
              await listForPrice(futbinLessPrice, player, futBinPercent);
            }
          }
        }
      } catch (err) {}
    }
    sendUINotification("Listing the players completed");
  };

  UTSectionedItemList.prototype.render = function () {
    const t = this;
    const platform = getUserPlatform();
    const playersRequestMap = [];
    const playersId = new Set();
    this.listRows.length === 0
      ? this.showEmptyMessage()
      : (this.removeEmptyMessage(),
        this.listRows.forEach(function (e) {
          e.render();
          const rootElement = $(e.getRootElement());
          const {
            definitionId,
            _auction: { buyNowPrice, currentBid, startingBid },
            type,
          } = e.getData();
          const auctionElement = rootElement.find(".auction");
          if (auctionElement.attr("style")) {
            auctionElement.removeAttr("style");
            auctionElement.addClass("hideauction");
          }
          const bidPrice = currentBid || startingBid;
          if (auctionElement && type === "player") {
            const existingValue = getValue(definitionId);
            if (existingValue) {
              appendFutBinPrice(
                existingValue.price,
                buyNowPrice,
                bidPrice,
                auctionElement,
                rootElement
              );
            } else {
              playersRequestMap.push({
                definitionId,
                buyNowPrice,
                bidPrice,
                auctionElement,
                rootElement,
              });
              playersId.add(definitionId);
            }
          }
          t.__list.appendChild(e.getRootElement());
        }));

    if (playersId.size) {
      const playersIdArray = Array.from(playersId);
      while (playersIdArray.length) {
        fetchPricesFromFutBinBulk(
          playersRequestMap,
          playersIdArray.splice(0, 30),
          platform
        );
      }
    }
  };
};
