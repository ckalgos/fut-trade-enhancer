import { sendRequest } from "../utils/networkUtil";
import { getValue, setValue } from "./repository";
import { getUserPlatform } from "./user";

const generateToken = () => {
  const email = getValue("useremail");
  const { id: userId } = services.User.getUser();
  return sendRequest(
    atob(
      "aHR0cHM6Ly9scHA5dThlY2VmLmV4ZWN1dGUtYXBpLmV1LXdlc3QtMS5hbWF6b25hd3MuY29tL2Rldi90b2tlbg=="
    ),
    { email, userId }
  );
};

const getToken = () => {
  let authToken = getValue("authToken");
  if (!authToken) {
    authToken = localStorage.getItem("abAuthToken");
    if (authToken) {
      const payload = JSON.parse(atob(authToken.split(".")[1]));
      const expiration = new Date(payload.exp * 1000);
      if (expiration.getTime() > new Date().getTime()) {
        return { token: authToken };
      }
      return null;
    }
  }
  return authToken;
};

const formRequestPayLoad = (listRows) => {
  const platform = getUserPlatform();
  const trackPayLoad = listRows.map((row) => {
    const expireDate = new Date();
    expireDate.setSeconds(expireDate.getSeconds() + row._auction.expires);
    return {
      assetId:
        row._assetId || (row._metaData && row._metaData.id) || row.definitionId,
      resourceId: row.definitionId,
      auction: {
        buyNowPrice: row._auction.buyNowPrice,
        currentBid: row._auction.currentBid,
        resourceId: row.definitionId,
        expiresOn: expireDate,
        platform: platform.toUpperCase(),
        playStyle: row.playStyle,
        startingBid: row._auction.startingBid,
        tradeId: parseInt(row._auction.tradeId),
        tradeState: row._auction._tradeState,
      },
    };
  });

  return trackPayLoad;
};

export const saveSolution = (payload) => {
  return sendRequest(
    atob(
      "aHR0cHM6Ly9pamVwZ2pwNnUzM3dobDd2N3dkd2RjbWM1cTBuendjdy5sYW1iZGEtdXJsLmV1LXdlc3QtMS5vbi5hd3Mv"
    ),
    "POST",
    `${Math.floor(+new Date())}_saveSolution`,
    JSON.stringify({
      squad: payload,
    })
  );
};

export const trackMarketPrices = (items) => {
  const { id: userId } = services.User.getUser();
  const requestPayload = formRequestPayLoad(items);
  return sendRequest(
    "https://wxls53nz2plegcvsjhco3yqyke0hqrps.lambda-url.eu-west-1.on.aws/",
    "POST",
    `${Math.floor(+new Date())}_trackMarketPrices`,
    JSON.stringify({
      userId,
      marketData: requestPayload,
    })
  );
};
