import { idPlayerPack } from "../app.constants";
import { fetchPricesFromFutBinBulk } from "../services/futbin";
import { getValue } from "../services/repository";
import { getUserPlatform } from "../services/user";
import { appendFutBinPrice } from "./common-override/appendFutBinPrice";

export const packItemOverride = () => {
  const appendPackPlayerPrice = (userWallet, currentPackValue) => {
    userWallet.find(`#${idPlayerPack}`).remove();
    userWallet.append(
      `<span id=${idPlayerPack} class="ut-store-reveal-modal-list-view--coins">Pack players value ${currentPackValue}</span>`
    );
  };

  UTStoreRevealModalListView.prototype.render = function () {
    var t = this;
    const platform = getUserPlatform();
    const playersRequestMap = [];
    const playersId = new Set();
    const userWallet = $(".ut-store-reveal-modal-list-view--wallet");
    let currentPackValue = 0;
    0 === this.listRows.length
      ? (this.showEmptyMessage(), this.removeFooter())
      : (this.removeEmptyMessage(),
        this.listRows.forEach(function (e) {
          e.render();
          const rootElement = $(e.getRootElement());
          const { definitionId, type } = e.getData();
          const auctionElement = rootElement.find(".auction");
          if (auctionElement.attr("style")) {
            auctionElement.removeAttr("style");
            auctionElement.addClass("hideauction");
          }
          if (auctionElement && type === "player") {
            const existingValue = getValue(definitionId);
            if (existingValue) {
              appendFutBinPrice(
                existingValue.price,
                null,
                null,
                auctionElement,
                rootElement
              );
              currentPackValue +=
                parseInt(existingValue.price.toString().replace(/[,.]/g, "")) ||
                0;
              appendPackPlayerPrice(userWallet, currentPackValue);
            } else {
              playersRequestMap.push({
                definitionId,
                buyNowPrice: null,
                bidPrice: null,
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
          platform,
          (value) => {
            currentPackValue += parseInt(value.toString().replace(/[,.]/g, ""));
            appendPackPlayerPrice(userWallet, currentPackValue);
          }
        );
      }
    }
  };
};
