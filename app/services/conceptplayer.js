import { wait } from "../utils/commonUtil";

export const getConceptPlayers = function (searchCriteria, oneSearch = true) {
  return new Promise((resolve, reject) => {
    const gatheredPlayers = [];

    const getAllConceptPlayers = () => {
      searchConceptPlayers(searchCriteria).observe(
        this,
        async function (sender, response) {
          gatheredPlayers.push(...response.response.items);
          if (
            !oneSearch &&
            response.status !== 400 &&
            !response.response.endOfList
          ) {
            searchCriteria.offset += searchCriteria.count;
            await wait(1);
            getAllConceptPlayers();
          } else {
            resolve(gatheredPlayers);
          }
        }
      );
    };
    getAllConceptPlayers();
  });
};

const searchConceptPlayers = (searchCriteria) => {
  return services.Item.searchConceptItems(searchCriteria);
};
