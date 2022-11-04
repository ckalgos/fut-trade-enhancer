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
  const trackPayLoad = [];
  listRows.forEach((row) => {
    const {
      id,
      definitionId,
      type,
      _auction: {
        buyNowPrice,
        tradeId: auctionId,
        expires: expiresOn,
        _tradeState: tradeState,
      },
    } = row;

    const expireDate = new Date();
    expireDate.setSeconds(expireDate.getSeconds() + expiresOn);
    tradeState === "active" &&
      type === "player" &&
      trackPayLoad.push({
        definitionId,
        price: buyNowPrice,
        expiresOn: expireDate,
        id: id + "",
        auctionId,
        platform,
      });
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
  const requestPayload = formRequestPayLoad(items);
  if (requestPayload.length && requestPayload.length <= 12) {
    return sendRequest(
      atob(
        "aHR0cHM6Ly9xenlhZnN0ZWR1N3N0cDV3NTU2NW54bWZtaTB2bWZvbi5sYW1iZGEtdXJsLmV1LXdlc3QtMS5vbi5hd3M="
      ),
      "POST",
      `${Math.floor(+new Date())}_trackMarketPrices`,
      JSON.stringify({
        prices: requestPayload,
      })
    );
  }
};
