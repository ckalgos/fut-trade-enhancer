import { getValue } from "../services/repository";
import { getUserPlatform } from "../services/user";
import { fetchPricesFromFutBinBulk } from "../services/futbin";
import { appendFutBinPrice } from "./common-override/appendFutBinPrice";
import { trackMarketPrices, trackPlayers } from "../services/analytics";

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

const formRequestPayLoad = (e, platform) => {
  const {
    id,
    definitionId,
    _auction: { buyNowPrice, tradeId: auctionId, expires: expiresOn },
    _metaData: { id: assetId, skillMoves, weakFoot } = {},
    _attributes,
    _staticData: { firstName, knownAs, lastName, name } = {},
    nationId,
    leagueId,
    rareflag,
    playStyle,
  } = e.getData();

  const expireDate = new Date();
  expireDate.setSeconds(expireDate.getSeconds() + expiresOn);
  const trackPayLoad = {
    definitionId,
    price: buyNowPrice,
    expiresOn: expireDate,
    id: id + "",
    assetId: assetId + "_" + platform + "_" + rareflag,
    auctionId,
    year: 22,
    updatedOn: new Date(),
    playStyle,
  };
  const playerPayLoad = {
    _id: definitionId,
    nationId,
    leagueId,
    staticData: { firstName, knownAs, lastName, name },
    skillMoves,
    weakFoot,
    assetId,
    attributes: _attributes,
    year: 21,
    rareflag,
  };

  return { trackPayLoad, playerPayLoad };
};

export const transferResultOverride = () => {
  UTPaginatedItemListView.prototype._renderItems = function (o) {
    const n = this;
    const platform = getUserPlatform();
    const auctionPrices = [];
    const players = new Map();
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
          const { trackPayLoad, playerPayLoad } = formRequestPayLoad(
            e,
            platform
          );
          const bidPrice = enhancerSetting["idBidBargain"]
            ? currentBid || startingBid
            : null;
          if (trackPayLoad.price) auctionPrices.push(trackPayLoad);
          players.set(definitionId, playerPayLoad);
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

    if (auctionPrices.length) {
      trackMarketPrices(auctionPrices);
      trackPlayers(Array.from(players.values()));
    }

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
