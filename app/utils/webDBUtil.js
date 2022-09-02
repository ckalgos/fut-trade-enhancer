let db;
const initDatabase = () => {
  return new Promise((resolve) => {
    db = openDatabase(
      "userSettings",
      "1.0",
      "FIFA TRADE ENHANCER DB",
      2 * 1024 * 1024
    );

    db.transaction(function (tx) {
      createSettingsTable(tx);
      createPlayersTable(tx);
    });
    resolve();
  });
};

const getSettings = () => {
  return new Promise((resolve, reject) => {
    db.transaction(function (tx) {
      tx.executeSql(
        "SELECT * FROM UserSettings",
        [],
        function (tx, results) {
          let settings = {};
          if (results.rows.length) {
            settings = results.rows[0].settings;
          }
          resolve(settings);
        },
        function (tx, results) {
          reject(results);
        }
      );
    });
  });
};

const getPlayers = () => {
  return new Promise((resolve, reject) => {
    db.transaction(function (tx) {
      tx.executeSql(
        "SELECT id, nationid,leagueid,teamid FROM Players",
        [],
        function (tx, results) {
          let settings = [];
          if (results.rows.length) {
            for (let row of results.rows) {
              settings.push(row);
            }
          }
          resolve(settings);
        },
        function (tx, results) {
          reject(results);
        }
      );
    });
  });
};

const insertPlayers = (playerInfo) => {
  return new Promise((resolve, reject) => {
    db.transaction(function (tx) {
      tx.executeSql(
        `INSERT INTO Players (id,nationid,leagueid,teamid) Values (?,?,?,?)`,
        [
          playerInfo.id,
          playerInfo.nationid,
          playerInfo.leagueid,
          playerInfo.teamid,
        ],
        function (tx, results) {
          resolve(true);
        },
        function (tx, results) {
          reject(results);
        }
      );
    });
  });
};

const insertSettings = (settingName, jsonData) => {
  return new Promise((resolve, reject) => {
    db.transaction(function (tx) {
      tx.executeSql(
        "REPLACE INTO UserSettings(settingName,settings) Values (?,?)",
        [settingName, jsonData],
        function (tx, results) {
          resolve(true);
        },
        function (tx, results) {
          reject(results);
        }
      );
    });
  });
};

const deletePlayers = () => {
  return new Promise((resolve, reject) => {
    db.transaction(function (tx) {
      tx.executeSql(
        "DELETE FROM Players",
        [],
        function (tx, results) {
          resolve(true);
        },
        function (tx, results) {
          reject(results);
        }
      );
    });
  });
};

const createSettingsTable = (tx) => {
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS UserSettings (settingName,settings);`,
    [],
    function (tx, results) {
      tx.executeSql(
        `CREATE UNIQUE INDEX idx_settings_settingName ON UserSettings (settingName);`
      );
    },
    function (tx, results) {
      console.log(results);
    }
  );
};

const createPlayersTable = (tx) => {
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS Players (id, nationid,leagueid,teamid);`,
    [],
    function (tx, results) {
      tx.executeSql(`CREATE UNIQUE INDEX idx_Players_id ON Players (id);`);
    },
    function (tx, results) {
      console.log(results);
    }
  );
};

export default {
  initDatabase,
  deletePlayers,
  insertSettings,
  getPlayers,
  getSettings,
  insertPlayers,
};
