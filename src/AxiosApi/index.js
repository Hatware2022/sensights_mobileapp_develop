import Axios from 'axios';
import {AppConstants, StorageUtils} from '../utils';

const axiosinterceptor = () => {
  Axios.interceptors.request.use(
    async conf => {
      // you can add some information before send it.
      // conf.headers['Auth'] = 'some token'
      await authHeader(conf);
      return conf;
    },
    error => {
      return Promise.reject(error);
    },
  );
  Axios.interceptors.response.use(
    next => {
      return Promise.resolve(next);
    },
    error => {
      // You can handle error here and trigger warning message without get in the code inside
      // Do something with response error
      if (
        (error &&
          error.response &&
          error.response.data &&
          error.response.data.statusCode === 403) ||
        (error &&
          error.response &&
          error.response.data &&
          error.response.data.statusCode === 401)
      ) {
        //location.replace("http://localhost:3000")
        // window.location.href = 'https://dev-affiliate.aipartnershipscorp.com/';
        console.log(error);
      }
      // if(error.response.data.statusCode === 500){
      //   return 'Something went wrong';
      // }

      return Promise.reject(error?.response?.data?.errors[0]);
    },
  );
};

const authHeader = async conf => {
  // return authorization header with jwt token
  const token = await StorageUtils.getValue(AppConstants.SP.ACCESS_TOKEN);
  conf.headers['Accept'] = 'application/json';
  conf.headers['Content-Type'] = 'application/json';
  if (token != '') {
    conf.headers['Authorization'] = `Bearer ${token}`;
  }
};

export default axiosinterceptor;
