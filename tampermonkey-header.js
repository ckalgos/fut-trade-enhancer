module.exports = {
  headers: {
    name: "FUT Trade Enhancer",
    namespace: "http://tampermonkey.net/",
    version: "1.3.1",
    description: "FUT Trade Enhancer",
    author: "CK Algos",
    match: [
      "https://www.ea.com/*/fifa/ultimate-team/web-app/*",
      "https://www.ea.com/fifa/ultimate-team/web-app/*",
    ],
    require: ["https://code.jquery.com/jquery-3.6.1.min.js"],
    grant: ["GM_xmlhttpRequest", "GM_download"],
    connect: ["ea.com", "ea2.com", "futbin.com", "amazonaws.com", "futbin.org"],
    updateURL:
      "https://github.com/ckalgos/fut-trade-enhancer/releases/latest/download/fut-trade-enhancer.user.js",
    downloadURL:
      "https://github.com/ckalgos/fut-trade-enhancer/releases/latest/download/fut-trade-enhancer.user.js",
  },
};
