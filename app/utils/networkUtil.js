import { sendExternalRequest } from "../services/externalRequest";
import { wait } from "./commonUtil";

export const sendRequest = (url, method, identifier, data) => {
  return new Promise((resolve, reject) => {
    sendExternalRequest({
      method,
      identifier,
      url,
      data,
      onload: (res) => {
        if (res.status !== 200 && res.status !== 201) {
          return reject(res.status);
        }
        return resolve(res.response);
      },
    });
  });
};

export const networkCallWithRetry = (execution, delay, retries) =>
  new Promise((resolve, reject) => {
    return execution()
      .then(resolve)
      .catch((reason) => {
        if (retries > 0) {
          return wait(delay)
            .then(
              networkCallWithRetry.bind(null, execution, delay, retries - 1)
            )
            .then(resolve)
            .catch(reject);
        }
        return reject(reason);
      });
  });
