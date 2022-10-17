import { MessageTileView } from "../view/MessageTileView";
import { imageLogos } from "../image.constants";
import { formMessage } from "../utils/homeMessageUtil";
import { showPopUp } from "./popup-override";
import { atou } from "../utils/commonUtil";
import { isMarketAlertApp } from "../app.constants";

const getScriptMessages = () => {
  const persona = services.User.getUser().getSelectedPersona();
  const messages = [];

  const message1 = formMessage(
    p("am9pbkRpc2NvcmQ="),
    p("ZnJlZVNjcmlwdA=="),
    atob("aW1hZ2VzL3RpbGVGRVREZWZhdWx0LnBuZw=="),
    atob("d2VsY29tZWh1Yg==")
  );

  const message2 = formMessage(
    p("ZG9uYXRvck1zZw=="),
    p("ZG9uYXRvckJlbmVmaXRz"),
    imageLogos,
    atob("c3VwcG9ydGh1Yg==")
  );

  const message3 = formMessage(
    p("YXV0b2J1eWVyTW9i"),
    p("YXV0b2J1eWVyTW9iQ2xpY2s="),
    imageLogos,
    atob("bmF0aXZlSHVi")
  );
  !isMarketAlertApp &&
    messages.push(new UTArubaMessageEntity(message3, persona));
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
    p("ZG9uYXRpb25Nc2c="),
    p("ZG9uYXRpb25PcHRpb24="),
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

const clickNativeOption = () => {
  showPopUp(
    [{ labelEnum: atob("QW5kcm9pZA==") }, { labelEnum: atob("aW9z") }],
    p("aW5zdGFsbGF0aW9uTXNn"),
    p("aW5zdGFsbGF0aW9uT3B0aW9u"),
    (t) => {
      if (t === atob("QW5kcm9pZA==")) {
        window.open(
          atob(
            "aHR0cHM6Ly9wbGF5Lmdvb2dsZS5jb20vc3RvcmUvYXBwcy9kZXRhaWxzP2lkPWNvbS5mdXQubWFya2V0LmFsZXJ0"
          ),
          atob("X2JsYW5r")
        );
      } else if (t === atob("aW9z")) {
        window.open(
          atob("aHR0cHM6Ly9hcHBzLmFwcGxlLmNvbS9tbC9hcHAvaWQxNTkwNTA1MTc5"),
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
      if (t.screen === atob("c3VwcG9ydGh1Yg==")) {
        clickOption();
        return;
      } else if (t.screen === atob("bmF0aXZlSHVi")) {
        clickNativeOption();
        return;
      } else if (t.screen === atob("d2VsY29tZWh1Yg==")) {
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

const values = {
  ar: {
    "am9pbkRpc2NvcmQ=":
      "2KPYqNit2Ksg2LnZhiDYp9mE2YXYs9in2LnYr9ipINiMINin2YbZgtixINmE2YTYp9mG2LbZhdin2YUg2KXZhNmJINiu2KfYr9mFIERpc2NvcmQg2KfZhNiu2KfYtSDYqNmG2Kc=",
    "ZnJlZVNjcmlwdA==":
      "2YfYsNinINio2LHZhtin2YXYrCDZhti12Yog2YXYrNin2YbZiiDZhNmE2KfYs9iq2K7Yr9in2YUgISEhINiMINin2LPYqti52K8g2KPZhdmI2KfZhNmDINil2LDYpyDYqNin2LnZh9inINi02K7YtSDZhdinINmE2YM=",
    "ZG9uYXRvck1zZw==":
      "2KfZhtmC2LEg2YTYqti12KjYrSDZhdiq2KjYsdi52YvYpyDYp9mE2KLZhg==",
    ZG9uYXRvckJlbmVmaXRz:
      "2YPZhiDZhdiq2KjYsdi52YvYpyDYjCDZhNiq2K3YtdmEINi52YTZiSDZhdix2LTYrdin2Kog2YXYsdio2K3YqSDZiNmG2LXYp9im2K0g2KrYr9in2YjZhA==",
    YXV0b2J1eWVyTW9i:
      "2YfZhCDYqtix2YrYryDYp9iz2KrYrtiv2KfZhSBBdXRvYnV5ZXIg2KPYq9mG2KfYoSDYp9mE2KrZhtmC2YTYnw==",
    "YXV0b2J1eWVyTW9iQ2xpY2s=":
      "2KfZhtmC2LEg2YTYqtir2KjZitiqINin2YTYqti32KjZitmCINin2YTZhdit2YXZiNmE",
    "ZG9uYXRpb25Nc2c=": "2K7Zitin2LEg2KfZhNiq2KjYsdi5",
    "ZG9uYXRpb25PcHRpb24=":
      "2YHZitmF2Kcg2YrZhNmKINmC2KfYptmF2Kkg2KjYt9ix2YIg2KfZhNmF2LPYp9mH2YXYqSDZgdmKINin2YTZhdi02LHZiNi5INiMINin2YbZgtixINmB2YjZgiDYo9mKINmF2YYg2KfZhNiu2YrYp9ix2KfYqiDYo9iv2YbYp9mHINmE2KXYuNmH2KfYsSDYr9i52YXZgw==",
    aW5zdGFsbGF0aW9uTXNn: "2K7Zitin2LEg2KfZhNiq2KvYqNmK2Ko=",
    aW5zdGFsbGF0aW9uT3B0aW9u:
      "2KfZhtmC2LEg2YHZiNmCINmG2LjYp9mFINin2YTYqti02LrZitmEINin2YTZhdmG2KfYs9ioINmE2KrYq9io2YrYqiDYp9mE2KrYt9io2YrZgg==",
  },
  de: {
    "am9pbkRpc2NvcmQ=":
      "V2VubiBTaWUgSGlsZmUgc3VjaGVuLCBrbGlja2VuIFNpZSBoaWVyLCB1bSB1bnNlcmVtIERpc2NvcmQtU2VydmVyIGJlaXp1dHJldGVu",
    "ZnJlZVNjcmlwdA==":
      "RGllcyBpc3QgZWluIGtvc3Rlbmxvc2VzIFNrcmlwdCAhISEsIGVyaGFsdGVuIFNpZSBJaHIgR2VsZCB6dXL8Y2ssIHdlbm4gamVtYW5kIGVzIElobmVuIHZlcmthdWZ0IGhhdA==",
    "ZG9uYXRvck1zZw==":
      "S2xpY2tlbiBTaWUgaGllciwgdW0gamV0enQgU3BlbmRlciB6dSB3ZXJkZW4=",
    ZG9uYXRvckJlbmVmaXRz:
      "V2VyZGVuIFNpZSBTcGVuZGVyLCB1bSBwcm9maXRhYmxlIEZpbHRlciB1bmQgSGFuZGVsc3RpcHBzIHp1IGVyaGFsdGVu",
    YXV0b2J1eWVyTW9i: "TfZjaHRlbiBTaWUgQXV0b2J1eWVyIHVudGVyd2VncyBudXR6ZW4/",
    "YXV0b2J1eWVyTW9iQ2xpY2s=":
      "S2xpY2tlbiBTaWUgaGllciwgdW0gZGllIG1vYmlsZSBBcHAgenUgaW5zdGFsbGllcmVu",
    "ZG9uYXRpb25Nc2c=": "U3BlbmRlbm9wdGlvbg==",
    "ZG9uYXRpb25PcHRpb24=":
      "TmFjaGZvbGdlbmQgZmluZGVuIFNpZSBlaW5lIExpc3RlIG1pdCBN9mdsaWNoa2VpdGVuLCB6dW0gUHJvamVrdCBiZWl6dXRyYWdlbi4gS2xpY2tlbiBTaWUgYXVmIGVpbmUgZGVyIGZvbGdlbmRlbiBPcHRpb25lbiwgdW0gSWhyZSBVbnRlcnN0/HR6dW5nIHp1IHplaWdlbg==",
    aW5zdGFsbGF0aW9uTXNn: "SW5zdGFsbGF0aW9uc29wdGlvbg==",
    aW5zdGFsbGF0aW9uT3B0aW9u:
      "S2xpY2tlbiBTaWUgYXVmIGRhcyBlbnRzcHJlY2hlbmRlIEJldHJpZWJzc3lzdGVtLCB1bSBkaWUgQXBwIHp1IGluc3RhbGxpZXJlbg==",
  },
  en: {
    "am9pbkRpc2NvcmQ=":
      "TG9va2luZyBmb3IgaGVscCwgQ2xpY2sgdG8gam9pbiBvdXIgRGlzY29yZCBzZXJ2ZXI=",
    "ZnJlZVNjcmlwdA==":
      "VGhpcyBpcyBhIGZyZWUgdG8gdXNlIHNjcmlwdCAhISEsIGdldCB5b3VyIG1vbmV5IGJhY2sgaWYgc29tZW9uZSBzb2xkIGl0IHRvIHlvdQ==",
    "ZG9uYXRvck1zZw==": "Q2xpY2sgdG8gYmVjb21lIGEgRG9uYXRvciBub3c=",
    ZG9uYXRvckJlbmVmaXRz:
      "QmVjb21lIGEgZG9uYXRvciwgdG8gZ2V0IHByb2ZpdGFibGUgZmlsdGVycyBhbmQgdHJhZGluZyB0aXBz",
    YXV0b2J1eWVyTW9i: "V2FudCB0byB1c2UgQXV0b2J1eWVyIG9uIHRoZSBnbz8=",
    "YXV0b2J1eWVyTW9iQ2xpY2s=": "Q2xpY2sgdG8gaW5zdGFsbCB0aGUgbW9iaWxlIGFwcA==",
    "ZG9uYXRpb25Nc2c=": "RG9uYXRpb24gb3B0aW9u",
    "ZG9uYXRpb25PcHRpb24=":
      "QmVsb3cgYXJlIHRoZSBsaXN0IG9mIHdheXMgdG8gY29udHJpYnV0ZSB0byB0aGUgcHJvamVjdCwgY2xpY2sgb24gYW55IG9mIHRoZSBiZWxvdyBvcHRpb25zIHRvIHNob3cgeW91ciBzdXBwb3J0",
    aW5zdGFsbGF0aW9uTXNn: "SW5zdGFsbGF0aW9uIG9wdGlvbg==",
    aW5zdGFsbGF0aW9uT3B0aW9u:
      "Q2xpY2sgdGhlIHJlc3BlY3RpdmUgT1MgdG8gaW5zdGFsbCB0aGUgYXBw",
  },
  es: {
    "am9pbkRpc2NvcmQ=":
      "QnVzY2FuZG8gYXl1ZGEsIGhhZ2EgY2xpYyBwYXJhIHVuaXJzZSBhIG51ZXN0cm8gc2Vydmlkb3IgRGlzY29yZA==",
    "ZnJlZVNjcmlwdA==":
      "oaGhRXN0ZWVzIHVuIHNjcmlwdCBkZSB1c28gZ3JhdHVpdG8gISEhLCByZWN1cGVyYSB0dSBkaW5lcm8gc2kgYWxndWllbiB0ZSBsbyB2ZW5kafM=",
    "ZG9uYXRvck1zZw==":
      "SGFnYSBjbGljIHBhcmEgY29udmVydGlyc2UgZW4gZG9uYW50ZSBhaG9yYQ==",
    ZG9uYXRvckJlbmVmaXRz:
      "Q29udmnpcnRhc2UgZW4gZG9uYW50ZSwgcGFyYSBvYnRlbmVyIGZpbHRyb3MgcmVudGFibGVzIHkgY29uc2Vqb3Njb21lcmNpYWxlcw==",
    YXV0b2J1eWVyTW9i:
      "v1F1aWVyZXMgdXNhciBBdXRvYnV5ZXIgc29icmUgbGEgbWFyY2hhPw==",
    "YXV0b2J1eWVyTW9iQ2xpY2s=":
      "SGFnYSBjbGljIGVuIGluc3RhbGFyIGxhIGFwbGljYWNp824gbfN2aWw=",
    "ZG9uYXRpb25Nc2c=": "T3BjafNuIGRlIGRvbmFjafNu",
    "ZG9uYXRpb25PcHRpb24=":
      "QSBjb250aW51YWNp824gc2UgbXVlc3RyYSBsYSBsaXN0YSBkZWZvcm1hcyBkZSBjb250cmlidWlyIGFsIHByb3llY3RvLCBoYWdhIGNsaWMgZW4gY3VhbHF1aWVyYSBkZSBsYXMgc2lndWllbnRlcyBvcGNpb25lcyBwYXJhIG1vc3RyYXIgc3VhcG95bw==",
    aW5zdGFsbGF0aW9uTXNn: "T3BjafNuIGRlIGluc3RhbGFjafNu",
    aW5zdGFsbGF0aW9uT3B0aW9u:
      "SGFnYSBjbGljIGVuIGVsIHNpc3RlbWFvcGVyYXRpdm8gcmVzcGVjdGl2byBwYXJhIGluc3RhbGFyIGxhIGFwbGljYWNp824=",
  },
  fr: {
    "am9pbkRpc2NvcmQ=":
      "Vm91cyBjaGVyY2hleiBkZSBsJ2FpZGUsIGNsaXF1ZXogcG91ciByZWpvaW5kcmUgbm90cmUgc2VydmV1ciBEaXNjb3Jk",
    "ZnJlZVNjcmlwdA==":
      "Q2VjaSBlc3QgdW4gc2NyaXB0IGdyYXR1aXQgISEhLCBy6WN1cOlyZXogdm90cmUgYXJnZW50IHNpIHF1ZWxxdSd1biB2b3VzIGwnYSB2ZW5kdQ==",
    "ZG9uYXRvck1zZw==":
      "Q2xpcXVleiBwb3VyIGRldmVuaXIgdW4gZG9uYXRldXIgbWFpbnRlbmFudA==",
    ZG9uYXRvckJlbmVmaXRz:
      "RGV2ZW5leiBkb25hdGV1ciwgcG91ciBvYnRlbmlyIGRlcyBmaWx0cmVzIHJlbnRhYmxlcyBldCBkZXMgYXN0dWNlcyBkZSB0cmFkaW5n",
    YXV0b2J1eWVyTW9i:
      "Vm91cyB2b3VsZXogdXRpbGlzZXIgQXV0b2J1eWVyIGxvcnMgZGUgdm9zIGTpcGxhY2VtZW50c6A/",
    "YXV0b2J1eWVyTW9iQ2xpY2s=":
      "Q2xpcXVleiBwb3VyIGluc3RhbGxlciBsJ2FwcGxpY2F0aW9uIG1vYmlsZQ==",
    "ZG9uYXRpb25Nc2c=": "T3B0aW9uIGRlIGRvbg==",
    "ZG9uYXRpb25PcHRpb24=":
      "Vm91cyB0cm91dmVyZXogY2ktZGVzc291cyBsYSBsaXN0ZSBkZXMgZmHnb25zIGRlIGNvbnRyaWJ1ZXIgYXUgcHJvamV0LCBjbGlxdWV6IHN1ciBsJ3VuZSBkZXMgb3B0aW9ucyBjaS1kZXNzb3VzIHBvdXIgbW9udHJlciB2b3RyZSBzb3V0aWVu",
    aW5zdGFsbGF0aW9uTXNn: "T3B0aW9uIGQnaW5zdGFsbGF0aW9u",
    aW5zdGFsbGF0aW9uT3B0aW9u:
      "Q2xpcXVleiBzdXIgbGUgc3lzdOhtZSBkJ2V4cGxvaXRhdGlvbiByZXNwZWN0aWYgcG91ciBpbnN0YWxsZXIgbCdhcHBsaWNhdGlvbg==",
  },
  it: {
    "am9pbkRpc2NvcmQ=":
      "SW4gY2VyY2EgZGkgYWl1dG8sIGZhaSBjbGljIHBlciB1bmlydGkgYWwgbm9zdHJvIHNlcnZlciBEaXNjb3Jk",
    "ZnJlZVNjcmlwdA==":
      "UXVlc3RvIOggdW5vIHNjcmlwdCBncmF0dWl0byAhISEsIHJlY3VwZXJhIGkgdHVvaSBzb2xkaSBzZSBxdWFsY3VubyB0ZSBsbyB2ZW5kZQ==",
    "ZG9uYXRvck1zZw==": "RmFpIGNsaWMgcGVyIGRpdmVudGFyZSB1biBkb25hdG9yZSBvcmE=",
    ZG9uYXRvckJlbmVmaXRz:
      "RGl2ZW50YSB1biBkb25hdG9yZSwgcGVyIG90dGVuZXJlIGZpbHRyaSBlIGNvbnNpZ2xpIGRpIHRyYWRpbmcgcmVkZGl0aXpp",
    YXV0b2J1eWVyTW9i: "VnVvaSB1c2FyZSBBdXRvYnV5ZXIgaW4gbW92aW1lbnRvPw==",
    "YXV0b2J1eWVyTW9iQ2xpY2s=":
      "RmFpIGNsaWMgcGVyIGluc3RhbGxhcmUgbCdhcHAgbW9iaWxl",
    "ZG9uYXRpb25Nc2c=": "T3B6aW9uZSBkb25hemlvbmU=",
    "ZG9uYXRpb25PcHRpb24=":
      "RGkgc2VndWl0byDoIHJpcG9ydGF0byBsJyBlbGVuY28gZGVpIG1vZGkgcGVyIGNvbnRyaWJ1aXJlIGFsIHByb2dldHRvLCBmYWkgY2xpYyBzdSB1bmEgZGVsbGUgb3B6aW9uaSBzZWd1ZW50aSBwZXIgbW9zdHJhcmUgaWwgdHVvIHNvc3RlZ25v",
    aW5zdGFsbGF0aW9uTXNn: "T3B6aW9uZSBkaSBpbnN0YWxsYXppb25l",
    aW5zdGFsbGF0aW9uT3B0aW9u:
      "RmFpIGNsaWMgc3VsIHJpc3BldHRpdm8gc2lzdGVtYSBvcGVyYXRpdm8gcGVyIGluc3RhbGxhcmUgbCdhcHA=",
  },
  nl: {
    "am9pbkRpc2NvcmQ=":
      "T3Agem9layBuYWFyIGh1bHAsIGtsaWsgb20gbGlkIHRlIHdvcmRlbiB2YW4gb256ZSBEaXNjb3JkLXNlcnZlcg==",
    "ZnJlZVNjcmlwdA==":
      "RGl0IGlzIGVlbiBncmF0aXMgdGUgZ2VicnVpa2VuIHNjcmlwdCAhISEsIGtyaWpnIGplIGdlbGQgdGVydWcgYWxzIGllbWFuZCBoZXQgYWFuIGplIGhlZWZ0IHZlcmtvY2h0",
    "ZG9uYXRvck1zZw==": "S2xpayBvbSBudSBkb25hdGV1ciB0ZSB3b3JkZW4=",
    ZG9uYXRvckJlbmVmaXRz:
      "V29yZCBkb25hdGV1ciBvbSB3aW5zdGdldmVuZGUgZmlsdGVycyBlbiBoYW5kZWxzdGlwcyB0ZSBrcmlqZ2Vu",
    YXV0b2J1eWVyTW9i: "V2lsIGplIEF1dG9idXllciBvbmRlcndlZyBnZWJydWlrZW4/",
    "YXV0b2J1eWVyTW9iQ2xpY2s=":
      "S2xpayBvbSBkZSBtb2JpZWxlIGFwcCB0ZSBpbnN0YWxsZXJlbg==",
    "ZG9uYXRpb25Nc2c=": "RG9uYXRpZSBvcHRpZQ==",
    "ZG9uYXRpb25PcHRpb24=":
      "SGllcm9uZGVyIHZpbmR0IHUgZGUgbGlqc3QgbWV0IG1hbmllcmVuIG9tIGJpaiB0ZSBkcmFnZW4gYWFuIGhldCBwcm9qZWN0LCBrbGlrIG9wIGVlbiB2YW4gZGUgb25kZXJzdGFhbmRlIG9wdGllcyBvbSB1dyBzdGV1biB0ZSBiZXR1aWdlbg==",
    aW5zdGFsbGF0aW9uTXNn: "SW5zdGFsbGF0aWUgb3B0aWU=",
    aW5zdGFsbGF0aW9uT3B0aW9u:
      "S2xpayBvcCBoZXQgYmV0cmVmZmVuZGUgYmVzdHVyaW5nc3N5c3RlZW0gb20gZGUgYXBwIHRlIGluc3RhbGxlcmVu",
  },
};

const p = (k) => {
  const u = eval(atob("c2VydmljZXMuTG9jYWxpemF0aW9uLmxvY2FsZS5sYW5ndWFnZQ=="));

  const l = values[u] || values["en"];

  const value = l[k] || k;

  return u === "ar" ? atou(value) : atob(value);
};
