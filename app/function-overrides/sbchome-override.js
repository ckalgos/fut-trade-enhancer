export const sbcHomeOverride = () => {
  const hubViewGenerate = UTSBCHubView.prototype._generate;
  const populateTiles = UTSBCHubView.prototype.populateTiles;
  const dealloc = UTSBCHubView.prototype.dealloc;

  UTSBCHubView.prototype.dealloc = function (...args) {
    if (this.searchInput) {
      this.searchInput.dealloc();
    }
    dealloc.call(this, ...args);
  };

  UTSBCHubView.prototype.populateTiles = function (...args) {
    populateTiles.call(this, ...args);

    if (this.searchInput) {
      const value = this.searchInput.getValue();
      if (value) {
        filterSbcs(value, $(this.__sbcSetTiles).children());
      }
    }
  };

  UTSBCHubView.prototype._generate = function (...args) {
    const response = hubViewGenerate.call(this, ...args);
    const sbcsContainer = this.__root.children[1];
    const div = document.createElement("div");
    div.classList.add("layout-hub", "grid");
    this.searchInput = new UTTextInputControl();
    this.searchInput.init();
    this.searchInput.setPlaceholder(
      services.Localization.localize("button.search")
    );
    this.searchInput.addTarget(
      this,
      (_, _1, { value }) => {
        filterSbcs(value.toLowerCase(), $(this.__sbcSetTiles).children());
      },
      EventType.INPUT
    );
    div.appendChild(this.searchInput.getRootElement());
    sbcsContainer.prepend(div);
    return response;
  };
};

const filterSbcs = (sbcName, tiles) => {
  for (const tile of tiles) {
    if (
      sbcName.length &&
      $(tile).find(".tileHeader").text().toLowerCase().indexOf(sbcName) < 0
    ) {
      tile.classList.add("hide");
    } else {
      tile.classList.remove("hide");
    }
  }
};
