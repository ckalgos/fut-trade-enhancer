import {
  idBidTotal,
  idBinTotal,
  idFutBinTotal,
  idResetFutBin,
} from "../app.constants";
import { fetchPricesFromFutBinBulk } from "../services/futbin";
import { getValue } from "../services/repository";
import { getUserPlatform } from "../services/user";
import { createElementFromHTML } from "../utils/commonUtil";
import { addFutbinCachePrice } from "../utils/futbinUtil";
import { sendUINotification } from "../utils/notificationUtil";
import { listForPrice } from "../utils/sellUtil";
import { generateButton } from "../utils/uiUtils/generateButton";
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
      this._total = $(
        `<div class="ut-button-group">
            <h3 class="ut-group-button cta price-totals ut-store-reveal-modal-list-view--wallet">
            <span id=${idFutBinTotal} class="ut-store-reveal-modal-list-view--coins"></span>
            <span id=${idBinTotal} class="ut-store-reveal-modal-list-view--coins"></span>
            <span id=${idBidTotal} class="ut-store-reveal-modal-list-view--coins"></span>
            </h3>
          </div>`
      );
      setTimeout(() => {
        this._total.insertAfter($(e));
      });
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
          services.Localization.localize("infopanel.label.alltoclub"),
          services.Localization.localize("infopanel.label.storeAllInClub"),
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
    if (
      [
        services.Localization.localize("infopanel.label.alltoclub"),
        services.Localization.localize("infopanel.label.storeAllInClub"),
      ].indexOf(sectionHeader) >= 0
    ) {
      const isWatchList =
        services.Localization.localize("infopanel.label.alltoclub") ===
        sectionHeader;
      services.Item[
        isWatchList ? "requestWatchedItems" : "requestUnassignedItems"
      ]().observe(this, async function (t, response) {
        let boughtItems = response.data.items;
        if (isWatchList) {
          boughtItems = boughtItems.filter(function (item) {
            return item.getAuctionData().isWon();
          });
        }
        listCardForFutBIN(boughtItems);
      });
      return;
    }
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

    const futBinPercent = getValue("EnhancerSettings")["idFutBinPercent"];
    listCardConfirm(players, futBinPercent);
  };

  const listCardConfirm = async (players, futBinPercent) => {
    sendUINotification("Listing the players for FUTBIN price");

    await addFutbinCachePrice(players);

    for (const player of players) {
      const existingValue = getValue(player.definitionId);
      if (existingValue && existingValue.price) {
        await listForPrice(existingValue.price, player, futBinPercent);
      } else {
        sendUINotification(
          `Error fetch fetching Price for ${player._staticData.name}`,
          UINotificationType.NEGATIVE
        );
      }
    }
    sendUINotification("Listing the players completed");
  };

  UTSectionedItemListView.prototype.render = function () {
    const t = this;
    const platform = getUserPlatform();
    const selectElement = $(this.getRootElement());
    const playersRequestMap = [];
    const playersId = new Set();
    let totalFutBIN = 0;
    let totalBid = 0;
    let totalBin = 0;
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
          totalBid += bidPrice;
          totalBin += buyNowPrice;
          if (auctionElement && type === "player") {
            const existingValue = getValue(definitionId);
            if (existingValue) {
              totalFutBIN +=
                parseInt(existingValue.price.toString().replace(/[,.]/g, "")) ||
                0;
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

    if (this.listRows.length) {
      setTimeout(() => {
        selectElement.find(".price-totals").css("display", "flex");
        selectElement
          .find(`#${idFutBinTotal}`)
          .html(`FUTBIN Total ${totalFutBIN}`);
        selectElement.find(`#${idBidTotal}`).html(`  BID Total ${totalBid}`);
        selectElement.find(`#${idBinTotal}`).html(`  BIN Total ${totalBin}`);
      });
    } else {
      setTimeout(() => {
        selectElement.find(".price-totals").css("display", "none");
      });
    }

    if (playersId.size) {
      const playersIdArray = Array.from(playersId);
      while (playersIdArray.length) {
        fetchPricesFromFutBinBulk(
          playersRequestMap,
          playersIdArray.splice(0, 30),
          platform,
          (value) => {
            totalFutBIN += parseInt(value.toString().replace(/[,.]/g, ""));
            selectElement
              .find(`#${idFutBinTotal}`)
              .html(`FUTBIN Total ${totalFutBIN}`);
          }
        );
      }
    }
  };
};
