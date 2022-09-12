import { getValue, setValue } from "./repository";
const sendRequest = (url, payload, token = null) => {
  return fetch(url, {
    headers: {
      Accept: "'application/json'",
      "Content-Type": "'application/json'",
      Authorization: token ? "Bearer " + token : null,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });
};

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

export const trackMarketPrices = async (playerPrices) => {
  return sendRequest(atob("aHR0cHM6Ly9hcGkuZnV0aGVscGVycy5jb20vYXVjdGlvbg=="), {
    playerPrices,
  });
};
