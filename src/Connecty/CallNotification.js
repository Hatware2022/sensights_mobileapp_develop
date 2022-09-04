import axios from 'axios';
import {api} from '../api';

export const CallNotification = async (callerId, callingByCallerId) => {
  let uri = String(api.callNotification)
    .replace('{callerId}', callerId)
    .replace('{callingByCallerId}', callingByCallerId);
  try {
    await axios
      .get(uri)
      .then(res => {})
      .catch(err => {});
  } catch (err) {}
};
