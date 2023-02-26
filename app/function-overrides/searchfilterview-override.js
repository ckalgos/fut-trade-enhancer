const contractDefIds = new Set([
  5001001, 5001004, 5001008, 5001011, 5001002, 5001005, 5001009, 5001012,
  5001003, 5001006, 5001010, 5001013,
]);

export const searchFilterViewOverride = () => {
  const uiSetFilters = UTItemSearchView.prototype.setFilters;
  const updateFromFilterChange =
    UTItemSearchViewModel.prototype.updateFromFilterChange;
  const getFilterTitle = UTItemSearchView.prototype.getFilterTitle;
  const getFilterImage = UTItemSearchView.prototype.generateFilterImage;

  UTItemSearchView.prototype.generateFilterImage = function (t, e, i) {
    if (t === "contract.type") {
      return `${fut_resourceRoot}${fut_resourceBase}${fut_guid}/${fut_year}/fut/items/images/mobile/type/list/3/5.png`;
    }
    return getFilterImage.call(this, t, e, i);
  };
  UTItemSearchView.prototype.getFilterTitle = function (t) {
    if (t === "contract.type") {
      return "CONTRACT TYPE";
    }
    return getFilterTitle.call(this, t);
  };

  UTItemSearchViewModel.prototype.updateFromFilterChange = function (...args) {
    const type = args.length ? args[0] : null;
    if (type === "contract.type") {
      this.searchCriteria.defId = args[1] != -1 ? [args[1]] : [];
    }
    return updateFromFilterChange.call(this, ...args);
  };

  UTItemSearchView.prototype.setFilters = function (t, e) {
    uiSetFilters.call(this, t, e);
    if (t.searchCriteria.category === SearchCategory.MANAGER_LEAGUE) {
      this.setFilterLock(enums.UISearchFilters.LEAGUE, false);
    } else if (t.searchCriteria.category === SearchCategory.CONTRACT) {
      this.generateFilter(
        "contract.type",
        [
          { id: -1, label: "Any", value: "any" },
          { id: 5001001, label: "Player Bronze Common", value: 5001001 },
          { id: 5001004, label: "Player Bronze Rare", value: 5001004 },
          { id: 5001008, label: "Manager Bronze Common", value: 5001008 },
          { id: 5001011, label: "Manager Bronze Rare", value: 5001011 },
          { id: 5001002, label: "Player Silver Common", value: 5001002 },
          { id: 5001005, label: "Player Silver Rare", value: 5001005 },
          { id: 5001009, label: "Manager Silver Common", value: 5001009 },
          { id: 5001012, label: "Manager Silver Rare", value: 5001012 },
          { id: 5001003, label: "Player Gold Common", value: 5001003 },
          { id: 5001006, label: "Player Gold Rare", value: 5001006 },
          { id: 5001010, label: "Manager Gold Common", value: 5001010 },
          { id: 5001013, label: "Manager Gold Rare", value: 5001013 },
        ],
        t.searchCriteria.defId.some((val) => contractDefIds.has(val))
          ? t.searchCriteria.defId[0]
          : "any"
      );
      const filter = this.filters[this.filters.length - 1];
      this.getRootElement().appendChild(filter.getRootElement());
    } else if (
      t.searchCriteria.defId.length &&
      contractDefIds.has(t.searchCriteria.defId[0])
    ) {
      t.searchCriteria.defId = [];
    }
  };
};
