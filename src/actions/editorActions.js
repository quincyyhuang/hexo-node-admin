/*
  Editor Action Creators
 */

import axios from 'axios';
import path from 'path';
import { REQUEST_FILE_CONTENT, RECEIVE_FILE_CONTENT, ONCHANGE_FILE_CONTENT, SAVE_FILE_CONTENT, DONE_SAVE_FILE_CONTENT, DELETE_FILE, DONE_DELETE_FILE, REQUEST_ASSETS, RECEIVE_ASSETS, DELETE_ASSET, DONE_DELETE_ASSET, UPLOAD_ASSET, DONE_UPLOAD_ASSET } from './actionTypes';
import { invalidateToken } from './loginActions';
import { showMessage } from './messageActions';

import { makeAxiosConfig } from './utils';
import Status from '../status';

const ENTRY_POINT = path.resolve(process.env.REACT_APP_ROOT, 'api', 'hexo');

// Get file content
export const getFile = (fileType, fileName) => (dispatch, getState) => {
  const token = getState().auth.token;
  dispatch({ type: REQUEST_FILE_CONTENT });
  let url;
  if (fileType === 'post')
    url = path.resolve(ENTRY_POINT, 'posts', encodeURIComponent(fileName));
  else if (fileType === 'page')
    url = path.resolve(ENTRY_POINT, 'pages', encodeURIComponent(fileName));
  else
    return;
  // Setup header
  const axiosConfig = makeAxiosConfig(token);
  return axios.get(url, axiosConfig)
    .then((res) => {
      dispatch({
        type: RECEIVE_FILE_CONTENT,
        payload: { content: res.data }
      });
    })
    .catch((err) => {
      if (err.response.status === 401)
        dispatch(invalidateToken());
      const code = err.response.data.code || Status.NETWORK_FAILED;
      dispatch(showMessage(true, code));
    });
}

// Save file content
export const saveFile = (fileType, fileName, content) => (dispatch, getState) => {
  const token = getState().auth.token;
  dispatch({ type: SAVE_FILE_CONTENT });
  let url;
  if (fileType === 'post')
    url = path.resolve(ENTRY_POINT, 'posts', encodeURIComponent(fileName));
  else if (fileType === 'page')
    url = path.resolve(ENTRY_POINT, 'pages', encodeURIComponent(fileName));
  else
    return;
  // Setup header
  const axiosConfig = makeAxiosConfig(token);
  return axios.post(url, { content }, axiosConfig)
    .then((res) => {
      const code = res.data.code;
      dispatch({ type: DONE_SAVE_FILE_CONTENT });
      dispatch(showMessage(false, code));
    })
    .catch((err) => {
      if (err.response.status === 401)
        dispatch(invalidateToken());
      const code = err.response.data.code || Status.NETWORK_FAILED;
      dispatch(showMessage(true, code));
    });
}

// File content on change
export const onChangeFile = (content) => ({
  type: ONCHANGE_FILE_CONTENT,
  payload: { content }
});

// Delete file and its asset folder
export const deleteFile = (fileType, fileName) => (dispatch, getState) => {
  const token = getState().auth.token;
  dispatch({ type: DELETE_FILE });
  const url = path.resolve(ENTRY_POINT, 'delete', fileType, encodeURIComponent(fileName));
  // Setup header
  const axiosConfig = makeAxiosConfig(token);
  // Return a promise so that UI knows to redirect
  return new Promise((resolve, reject) => {
    axios.get(url, axiosConfig)
    .then((res) => {
      const code = res.data.code;
      dispatch({ type: DONE_DELETE_FILE });
      dispatch(showMessage(false, code));
      resolve();
    })
    .catch((err) => {
      if (err.response.status === 401)
        dispatch(invalidateToken());
      const code = err.response.data.code || Status.NETWORK_FAILED;
      dispatch(showMessage(true, code));
      reject(err);
    });
  });
}

// Get assets
export const getAssets = (fileType, fileName) => (dispatch, getState) => {
  const token = getState().auth.token;
  dispatch({ type: REQUEST_ASSETS });
  const url = path.resolve(ENTRY_POINT, 'assets', fileType, encodeURIComponent(fileName));
  // Setup header
  const axiosConfig = makeAxiosConfig(token);
  return new Promise((resolve, reject) => {
    axios.get(url, axiosConfig)
    .then((res) => {
      dispatch({
        type: RECEIVE_ASSETS,
        payload: { assets: res.data }
      });
      resolve();
    })
    .catch((err) => {
      if (err.response.status === 401)
        dispatch(invalidateToken());
      const code = err.response.data.code || Status.NETWORK_FAILED;
      dispatch(showMessage(true, code));
      reject(err);
    });
  });
}

// Delete asset
export const deleteAsset = (fileType, fileName, assetName) => (dispatch, getState) => {
  const token = getState().auth.token;
  dispatch({ type: DELETE_ASSET });
  const url = path.resolve(ENTRY_POINT, 'delete', fileType, encodeURIComponent(fileName), encodeURIComponent(assetName));
  // Setup header
  const axiosConfig = makeAxiosConfig(token);
  return axios.get(url, axiosConfig)
    .then((res) => {
      const code = res.data.code;
      dispatch({ type: DONE_DELETE_ASSET });
      dispatch(showMessage(false, code));
      // Re-fetch assets data
      dispatch(getAssets(fileType, fileName));
    })
    .catch((err) => {
      if (err.response.status === 401)
        dispatch(invalidateToken());
      const code = err.response.data.code || Status.NETWORK_FAILED;
      dispatch(showMessage(true, code));
    });
}

// Upload asset
export const uploadAsset = (fileType, fileName, formData) => (dispatch, getState) => {
  const token = getState().auth.token;
  dispatch({ type: UPLOAD_ASSET });
  const url = path.resolve(ENTRY_POINT, 'upload', fileType, encodeURIComponent(fileName));
  // Setup header
  const axiosConfig = makeAxiosConfig(token, 'form');
  return new Promise((resolve, reject) => {
    axios.post(url, formData, axiosConfig)
    .then((res) => {
      const code = res.data.code;
      dispatch({ type: DONE_UPLOAD_ASSET });
      dispatch(showMessage(false, code));
      resolve();
    })
    .catch((err) => {
      if (err.response.status === 401)
        dispatch(invalidateToken());
      const code = err.response.data.code || Status.NETWORK_FAILED;
      dispatch(showMessage(true, code));
      reject(err);
    });
  });
}