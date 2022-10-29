export const overrideStyle = () => {
  const style = document.createElement("style");
  style.innerText = `
    .player-stats-data-component ul { 
      display: grid;   
      grid-template-columns: 1fr 1fr 1fr; 
      grid-template-rows: 1fr; 
      width: 78px; 
    }
    .SearchResults.ui-layout-left>.paginated-item-list>ul{
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: repeat(25,1fr);
    }
    .SearchResults.ui-layout-left .player .ut-item-player-status--loan,
    .phone .SearchResults .player .ut-item-player-status--loan{
      display: block;
      background: #4d42f5;
    }
    .ut-split-view {
      padding: 0;
    }
    .ui-layout-left .listFUTItem .auction{
      top: 3% !important;      
      width: 37% !important;
      right: .5rem;
    }
    .auction.show {
      display: block !important;
    }
    .auction.show .auctionValue,
    .auction.show .auction-state{
      display: none !important;
    }
    .auction.show .futbinprice{
      display: block !important;
    }
    .SearchResults.ui-layout-left .listFUTItem.futbinLessPrice .rowContent,
    .phone .SearchResults .listFUTItem.futbinLessPrice .rowContent{
      background-color: blue;
      animation: 4s infinite glow;
    }
    .SearchResults.ui-layout-left .listFUTItem.hideResult,
    .phone .SearchResults .listFUTItem.hideResult{
     display :none;
    }
    .SearchResults.ui-layout-left .listFUTItem.expired .rowContent, 
    .phone .SearchResults .listFUTItem.expired .rowContent,
    .SearchResults.ui-layout-left .listFUTItem.highest-bid .rowContent, 
    .phone .SearchResults .listFUTItem.highest-bid .rowContent,
    .SearchResults.ui-layout-left .listFUTItem.outbid .rowContent, 
    .phone .SearchResults .listFUTItem.outbid .rowContent,
    .SearchResults.ui-layout-left .listFUTItem.won .rowContent
    .phone .SearchResults .listFUTItem.won .rowContent{
      background-color: #0d0f26;
      animation: none !important;
    }
    @keyframes glow {
      33% {
        background-color: red;
      }
      66% {
        background-color: blue;
      }
      100% {
        background-color: purple;
      }
    }
    @media (min-width: 1281px) {
      .ut-split-view .ut-content {
        max-width: 100%;
        max-height: 100%;
      }
    }
    @media (min-width: 1600px) {
      .SearchResults.ui-layout-left>.paginated-item-list>ul {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: repeat(17,1fr);
      }
    }
    .downloadClub {
      background-color: #7e42f5;
      border-color: transparent;
      color: #29ffc9;
      margin-right: 10px;      
      margin-left: 10px;
    }
    .ut-list-header-action {
      display: flex
    }
    .SearchResults.ui-layout-left .listFUTItem .show-duplicate,
    .phone .SearchResults .listFUTItem .show-duplicate {
      right: auto !important;
      left: 15px!important;
      display: block;
    }
    .ui-layout-right .futbinprice{
      display:none;
    }
    .futBinFill { 
      display: flex; 
      justify-content: space-evenly;
    }
    .futBinId {
      flex-basis: 50%;
    }
    .phone .listFUTItem .auction>.auction-state, 
    .phone .listFUTItem .auction>.auctionStartPrice, 
    .phone .listFUTItem .auction>.auctionValue {
      flex: 1 1 28%;
      overflow: hidden;
    }
    html[dir=ltr]
    .phone .listFUTItem .auction {
      right: 0px;
    }
    html[dir=ltr] 
    .listFUTItem .auction.show {
      left: auto
    }
    .phone .auction.show {
      right: 2rem !important;
    }
    .enhancer-option-header {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    } 
    .phone .settings-field  {
      width: 100% !important;
      padding: 0px 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }
    .settings-field .ut-toggle-cell-view {
      justify-content: space-between;
      margin: 0px 10px;
    }
    .hide {
      display: none;
    }
    .hideauction .auctionValue,
    .hideauction .auction-state {
      display: none;
    } 
    .hideauction .futbinprice,
    .auction.hideauction,
    .show {
      display: unset !important;
      float: right;
    }
    .relistFut {
      margin-right: 10px;
      display: none;
    }
    .button--loading .button__text {
      visibility: hidden;
      opacity: 0;
    }
    .button-spinner {
      position: relative;
    }
    .button--loading::after {
      content: "";
      position: absolute;
      width: 16px;
      height: 16px;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      border: 4px solid transparent;
      border-top-color: #29ffc9;
      border-radius: 50%;
      animation: button-loading-spinner 1s ease infinite;
    }
    .ui-layout-right .enhancer-option-header,
    .ui-layout-right .settings-field {
      display: none;
    }
    
    @keyframes button-loading-spinner {
      from {
        transform: rotate(0turn);
      }
    
      to {
        transform: rotate(1turn);
      }
    }
    .enhancer-settings-wrapper {
      display: flex; 
      flex-wrap: wrap; 
      margin-top: 20px;
      box-shadow: 0 1rem 3em rgb(0 0 0 / 40%);
      background-color: #2a323d;
      max-width: 1200px;
    }
    .enhancer-settings-header {
      display: flex;
      justify-content: center;
      margin: 20px;
      width: 100%;
    }
    .enhancer-save-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      margin: 15px;
    }
    .flex-half{
      flex: 0.5;
    }
    .settings-field {
      margin-top: 15px;
      margin-bottom: 15px;
      width: 50% !important;
      padding: 10px;
    }
    .settings-field .info{
      text-align: center;
    }
    .phone .settings-field .info,
    .phone .settings-field .buttonInfo{ 
      width:85%
    }
    .numericInput:invalid {
      color: red;
      border: 1px solid;
    }
    input[type="number"]{
      padding: 0 .5em;
      border-radius: 0;
      background-color: #262c38;
      border: 1px solid #4ee6eb;
      box-sizing: border-box;
      color: #4ee6eb;
      font-family: UltimateTeam,sans-serif;
      font-size: 1em;
      height: 2.8em;
      opacity: 1;
      width: 100%;
    }
    input[type=number] {
      -moz-appearance: textfield;
    }
    .phone .ut-store-reveal-modal-list-view--wallet {
      flex: unset;
    }
    .price-totals {
      border-top: 1px solid #4ee6eb;
      display: flex;
      justify-content: flex-end;
      height: 35px;
      align-items: center;
    }
    .phone .hideauction .futbinprice{
      float: right; 
      margin-right: 2rem;
    }
    .fut-bin-buy {
      margin-top: 15px;
      margin-bottom: 15px;
    }
    .sbc-players-list {
      width: 100%;
      padding: 10px;
      font-family: UltimateTeamCondensed, sans-serif;
      font-size: 1.6em;
      color: #e2dde2;
      text-transform: uppercase;
      background-color: #171826;
    }
    .packOpen {
      margin-left: 0.5rem;
      flex-basis: 50% !important;
    }
    .phone .packOpen {
      flex-basis: 100% !important;
    }
    .squad-fut-bin {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .sbcSolutions {
      margin-bottom: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      gap: 10px;
    }
    .relist {
      margin-left: 10px;
    }
    .phone .clubAction {
      font-family: UltimateTeam-Icons,sans-serif;
      padding: 0 0.5rem 0 1rem;
      font-size: 0;
    }
    .phone .downloadClub::before {
      font-size: 1.3rem;
      content: '\\E001'
    }
    .phone .transferpile::before {
      font-size: 1.3rem;
      content: '\\E073'
    }
    small {
      white-space: break-spaces;
    }
    .ut-navigation-bar-view .view-navbar-currency-coins {
      cursor: pointer;
      position: relative;
    }
    .ut-navigation-bar-view .view-navbar-currency-coins::before {
      font-family: UltimateTeam-Icons,sans-serif;
      font-style: normal;
      font-variant: normal;
      font-weight: 400;
      text-decoration: none;
      text-transform: none;
      background-color: #f8eede;
      color: #243962;
      display: block;
      font-size: .5rem;
      line-height: .5rem;
      padding: 0.2rem;
      order: 1;
    }
    .ut-navigation-bar-view .view-navbar-currency-coins:before {
      margin-left: 3px;
      content: "\\E06A";
    }
    .price-filter .ut-toggle-cell-view--label{
      font-size: 19px;
    }
    .autoBuyMin {
      width: 100% !important;
    }
    .autoBuyMin .ut-toggle-cell-view {
      justify-content: flex-start;
    }
    .player-select {
     position: absolute;
      z-index: 20;
    }
    div.player-select {
      width:75px;
      height:75px;
     }
     .boughtFor.futbinprice{
      margin-right: 15px;
     }
     .phone .priceholder{
       display: flex !important;
       flex-direction: column-reverse;
    }
    .phone .ut-section-header-view.relistsection {
      flex-direction: row;
      flex-wrap: wrap;
    }
    .relistwrapper{
      display: flex;
    }
    .phone .relistwrapper{
      width: 100%;
      justify-content: flex-end;
      margin-top: 8px;
    }
    .btnAverage {
      height: unset !important;
      align-items: flex-start !important;
      line-height: unset !important;
    }
    `;
  document.head.appendChild(style);
};
