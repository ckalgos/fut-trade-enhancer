import { getValue, setValue } from "./repository";

export const getUserPlatform = () => {
  let platform = getValue("userPlatform");
  if (platform) return platform;

  if (services.User.getUser().getSelectedPersona().isPC) {
    setValue("userPlatform", "pc");
    return "pc";
  }

  setValue("userPlatform", "ps");
  return "ps";
};
