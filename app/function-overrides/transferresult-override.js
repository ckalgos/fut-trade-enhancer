import { getValue } from "../services/repository";
import { getUserPlatform } from "../services/user";
import { fetchPricesFromFutBinBulk } from "../services/futbin";
import { appendFutBinPrice } from "./common-override/appendFutBinPrice";

const appendDuplicateTag = (definitionId, rootElement) => {
  const squadMemberIds = getValue("SquadMemberIds");
  if (squadMemberIds && squadMemberIds.has(definitionId)) {
    rootElement.find(".rowContent").append(
      `<div class="show-duplicate active-tag">
            <div class="label-container">
              <span class="fut_icon icon_squad">
              </span>
              <span class="label">
              </span>
            </div>
        </div>`
    );
  }
};

export const transferResultOverride = () => {
  UTPaginatedItemListView.prototype._renderItems = function (o) {
    const n = this;
    const platform = getUserPlatform();
    const playersRequestMap = [];
    const playersId = new Set();
    const enhancerSetting = getValue("EnhancerSettings");
    void 0 === o && (o = 0),
      this.listRows.forEach(function (e) {
        let t;
        const i =
          o === ((t = e.getData()) === null || void 0 === t ? void 0 : t.id);
        e.render(i);
        const rootElement = $(e.getRootElement());
        const {
          type,
          contract,
          definitionId,
          _auction: { buyNowPrice, currentBid, startingBid },
        } = e.getData();
        const auctionElement = rootElement.find(".auction");
        let addFutBinPrice = enhancerSetting["idFutBinPrice"];
        if (auctionElement.attr("style")) {
          auctionElement.removeAttr("style");
          auctionElement.addClass("hideauction");
          addFutBinPrice = true;
        }
        if (auctionElement && type === "player") {
          rootElement.find(".ut-item-player-status--loan").text(contract);
          const bidPrice = enhancerSetting["idBidBargain"]
            ? currentBid || startingBid
            : null;
          appendDuplicateTag(definitionId, rootElement);
          if (addFutBinPrice) {
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
        }
        n.__itemList.appendChild(e.getRootElement());
      }),
      this.noResultsView &&
        this.listRows.length > 0 &&
        (this.noResultsView.dealloc(), (this.noResultsView = null));

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
