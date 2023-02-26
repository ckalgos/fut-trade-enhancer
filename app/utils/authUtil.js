import { Auth } from "../external/amplify";
import { setValue } from "../services/repository";

export const setUserData = async () => {
  const token = await fetchAndSetData();
  if (token) {
    const interval = setInterval(async () => {
      const refreshedToken = await fetchAndSetData();
      if (!refreshedToken) {
        clearInterval(interval);
      }
    }, 1800000);
  }
};

const fetchAndSetData = async () => {
  const token = await getUserAccessToken();
  if (token) {
    const userData = formUserData(await getCurrentUser());
    userData.token = token;
    setValue("loggedInUser", userData);
  }
  return token;
};

const getUserAccessToken = async () => {
  try {
    const session = await Auth.currentSession();
    const token = session.getAccessToken().getJwtToken();
    return token;
  } catch (err) {
    return null;
  }
};

export const getCurrentUser = async () => {
  return Auth.currentAuthenticatedUser();
};

export const formUserData = (user) => {
  const userName = getUserName(user);
  return {
    userName,
    email: user.attributes ? user.attributes.email : "",
  };
};

const getUserName = (user) => {
  let userName = "";
  if (user.attributes) {
    userName = user.attributes.preferred_username || user.attributes.name;
  }
  if (!userName) {
    userName = user.username;
  }

  if (/signinwith/.test(userName) && user.attributes.email) {
    userName = user.attributes.email;
  }

  return userName;
};
