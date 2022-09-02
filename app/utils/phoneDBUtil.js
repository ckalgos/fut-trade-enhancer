let db;

const initDatabase = () => {
  return new Promise((resolve) => {
    let indexedDB =
      window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB ||
      window.shimIndexedDB;

    let request = indexedDB.open("userSettings", 1);

    request.onupgradeneeded = function () {
      db = request.result;
      db.createObjectStore("UserSettings", { keyPath: "settingName" });
      db.createObjectStore("Players", { keyPath: "id" });
    };

    request.onsuccess = function () {
      db = request.result;
      resolve();
    };
  });
};

const getSettings = () => {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("UserSettings", "readonly");
    const store = tx.objectStore("UserSettings");
    const request = store.getAll();
    request.onsuccess = function () {
      let settings = null;
      if (request.result.length) {
        settings = request.result[0].jsonData;
      }
      resolve(settings);
    };
    request.onerror = function () {
      reject();
    };
  });
};

const getPlayers = () => {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("Players", "readonly");
    const store = tx.objectStore("Players");
    const request = store.getAll();
    request.onsuccess = function () {
      let settings = [];
      if (request.result.length) {
        for (let row of request.result) {
          settings.push(row);
        }
      }
      resolve(settings);
    };
    request.onerror = function () {
      reject();
    };
  });
};

const insertPlayers = (playerInfo) => {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("Players", "readwrite");
    const store = tx.objectStore("Players");
    store.put({
      id: playerInfo.id,
      nationid: playerInfo.nationid,
      leagueid: playerInfo.leagueid,
      teamid: playerInfo.teamid,
    });

    tx.oncomplete = function () {
      resolve();
    };
    tx.onerror = function () {
      reject();
    };
  });
};

const insertSettings = (settingName, jsonData) => {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("UserSettings", "readwrite");
    const store = tx.objectStore("UserSettings");
    store.put({ settingName, jsonData });

    tx.oncomplete = function () {
      resolve();
    };
    tx.onerror = function () {
      reject();
    };
  });
};

const deletePlayers = () => {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("Players", "readwrite");
    const store = tx.objectStore("Players");
    store.clear();
    tx.oncomplete = function () {
      resolve();
    };
    tx.onerror = function () {
      reject();
    };
  });
};
export default {
  initDatabase,
  deletePlayers,
  insertSettings,
  getPlayers,
  getSettings,
  insertPlayers,
};
