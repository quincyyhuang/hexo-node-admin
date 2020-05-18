/*
  Login Action Creators
 */

import axios from 'axios';
import path from 'path';
import { SIGN_IN, SIGN_OUT, INVALIDATE_TOKEN } from './actionTypes';
import { showMessage } from './messageActions';
import Status from '../status';

// Login
export const login = (u, p) => dispatch => {
  const url = path.resolve(process.env.REACT_APP_ROOT, 'api', 'auth', 'login');
  return axios.post(url, {
    u, p
  })
    .then((res) => {
      const token = res.data.token;
      localStorage.setItem('token', token);
      dispatch({
        type: SIGN_IN,
        payload: { token }
      });
      dispatch(showMessage(false, Status.AUTH_LOGGED_IN));
    })
    .catch((err) => {
      const code = err.response.data.code || Status.NETWORK_FAILED;
      dispatch(showMessage(true, code));
    });
}

export const logout = () => dispatch => {
  localStorage.removeItem('token');
  dispatch({ type: SIGN_OUT });
  dispatch(showMessage(false, Status.AUTH_LOGGED_OUT));
}

export const invalidateToken = () => dispatch => {
  localStorage.removeItem('token');
  dispatch({ type: INVALIDATE_TOKEN });
}