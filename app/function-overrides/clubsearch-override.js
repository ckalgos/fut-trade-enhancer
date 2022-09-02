export const clubSearchOverride = () => {
  const clubPageEntered =
    UTClubSearchResultsViewController.prototype.viewDidAppear;

  UTClubSearchResultsViewController.prototype.viewDidAppear = function () {
    clubPageEntered.call(this);
    setTimeout(() => {
      const pageView = this.getView();
      const headerAction = $(pageView.__root).find(".ut-list-header-action");
      if (!$("#downloadClub").length) {
        $(headerAction).prepend(
          '<button id="downloadClub" class="btn-standard mini downloadClub">Download as CSV</button>'
        );
      }
    }, 500);
  };
};
