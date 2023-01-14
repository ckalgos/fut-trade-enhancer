import { Auth } from "../external/amplify";

export const getUserAccessToken = async () => {
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
