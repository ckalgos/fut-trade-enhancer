import locales from "../locales";

export const t = (key) => {
  const userLanguage = services.Localization.locale.language;

  const userLocaleLookup = locales[userLanguage] || locales["en"];

  return userLocaleLookup[key] || key;
};
