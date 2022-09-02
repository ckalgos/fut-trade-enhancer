import { MessageTileView } from "../view/MessageTileView";
import { imageLogos } from "../image.constants";
import { formMessage } from "../utils/homeMessageUtil";
import { showPopUp } from "./popup-override";

const getScriptMessages = () => {
  const persona = services.User.getUser().getSelectedPersona();
  const messages = [];

  const message1 = formMessage(
    atob(
      "TG9va2luZyBmb3IgaGVscCwgQ2xpY2sgdG8gam9pbiBvdXIgRGlzY29yZCBzZXJ2ZXI="
    ),
    atob(
      "VGhpcyBpcyBhIGZyZWUgdG8gdXNlIHNjcmlwdCAhISEsIGdldCB5b3VyIG1vbmV5IGJhY2sgaWYgc29tZW9uZSBzb2xkIGl0IHRvIHlvdQ=="
    ),
    atob("aW1hZ2VzL3RpbGVGRVREZWZhdWx0LnBuZw=="),
    atob("d2VsY29tZWh1Yg==")
  );

  const message2 = formMessage(
    atob("Q2xpY2sgdG8gYmVjb21lIGEgRG9uYXRvciBub3chISE"),
    atob(
      "QmVjb21lIGEgZG9uYXRvciwgdG8gZ2V0IHByb2ZpdGFibGUgZmlsdGVycyBhbmQgdHJhZGluZyB0aXBz"
    ),
    imageLogos,
    atob("c3VwcG9ydGh1Yg==")
  );
  messages.push(new UTArubaMessageEntity(message1, persona));
  messages.push(new UTArubaMessageEntity(message2, persona));
  return messages;
};

const clickOption = () => {
  showPopUp(
    [
      { labelEnum: atob("UGF5cGFs") },
      { labelEnum: atob("WW91dHViZSBTdWJzY3JpcHRpb24=") },
      { labelEnum: atob("UGF0cmVvbg==") },
    ],
    atob("RG9uYXRpb24gb3B0aW9u"),
    atob(
      "QmVsb3cgYXJlIHRoZSBsaXN0IG9mIHdheXMgdG8gY29udHJpYnV0ZSB0byB0aGUgcHJvamVjdCwgY2xpY2sgb24gYW55IG9mIHRoZSBiZWxvdyBvcHRpb25zIHRvIHNob3cgeW91ciBzdXBwb3J0"
    ),
    (t) => {
      if (t === atob("UGF5cGFs")) {
        window.open(
          atob("aHR0cHM6Ly91cGdyYWRlLmNoYXQvY2thbGdvcw=="),
          atob("X2JsYW5r")
        );
      } else if (t === atob("WW91dHViZSBTdWJzY3JpcHRpb24=")) {
        window.open(
          atob("aHR0cHM6Ly95b3V0dWJlLmNvbS9ja2FsZ29zL2pvaW4="),
          atob("X2JsYW5r")
        );
      } else if (t === atob("UGF0cmVvbg==")) {
        window.open(
          atob("aHR0cHM6Ly93d3cucGF0cmVvbi5jb20vY2thbGdvcw=="),
          atob("X2JsYW5r")
        );
      }
    }
  );
};

export const futHomeOverride = () => {
  const homeHubInit = UTHomeHubView.prototype.init;
  const generate = UTHomeHubView.prototype._generate;
  const renderHubMessagesTile = UTHomeHubView.prototype.renderHubMessagesTile;

  UTHomeHubView.prototype.init = function () {
    homeHubInit.call(this);
    this._scriptMessageTile.init();
  };

  MessageTileView.prototype._tapDetected = function (e) {
    if (this._isTouchTargetValid(e.target)) {
      var t = this._data[this._tnsCarousel.getCurrentSlide()];
      if (t.screen === "supporthub") {
        clickOption();
        return;
      } else if (t.screen === "welcomehub") {
        window.open(
          atob("aHR0cHM6Ly9kaXNjb3JkLmNvbS9pbnZpdGUvY2t0SFltcA=="),
          atob("X2JsYW5r")
        );
        return;
      }
      JSUtils.isEmpty(t.goToLink) || this._handleLink(t);
    }
  };

  MessageTileView.prototype._imageLoad = function _imageLoad(e, t, i) {
    if (
      (e.unobserve(this),
      t ||
        i.setLocalResource(
          i.src.startsWith("data:image")
            ? i.src
            : atob("aW1hZ2VzL3RpbGVGRVREZWZhdWx0LnBuZw==")
        ),
      ++this._loadedImages >= this._data.length &&
        (this.removeClass("loading-images"), !this._tnsCarousel.isOn()))
    ) {
      var o = new TNSPropertiesDTO();
      (o.nav = !0),
        (o.controls = !1),
        (o.loop = !0),
        (o.autoplay = !0),
        (o.autoplaySpeed = 4e3),
        (o.container = this._tnsCarousel.getRootElement()),
        this._tnsCarousel.setup(o),
        1 < this._data.length &&
          this._tnsCarousel.afterChange(this._onSlideFadeOut.bind(this));
    }
  };

  UTHomeHubView.prototype.renderHubMessagesTile = function (...args) {
    renderHubMessagesTile.call(this, ...args);
    this._scriptMessageTile.setData(getScriptMessages());
  };

  UTHomeHubView.prototype._generate = function () {
    if (!this._generated) {
      generate.call(this);
      this._scriptMessageTile = new MessageTileView(this);
      this._scriptMessageTile.getRootElement().classList.add("col-1-1");
      setTimeout(() => {
        $(".layout-hub")[0].prepend(this._scriptMessageTile.getRootElement());
      });
    }
  };
};
