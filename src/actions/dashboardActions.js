/*
  Dashboard Action Creators
 */

import axios from 'axios';
import path from 'path';
import { REQUEST_ALL_POSTS, REQUEST_ALL_PAGES, REQUEST_ALL_STATS, RECEIVE_ALL_POSTS, RECEIVE_ALL_PAGES, RECEIVE_ALL_STATS, NEW_FILE, DONE_NEW_FILE, REQUEST_GENERATE, DONE_GENERATE, REQUEST_DEPLOY, DONE_DEPLOY, REQUEST_CLEAN, DONE_CLEAN, FILTER_ITEMS } from './actionTypes';

import { invalidateToken } from './loginActions';
import { showMessage } from './messageActions';
import Status from '../status';

const ENTRY_POINT = path.resolve(process.env.REACT_APP_ROOT, 'api', 'hexo');

// Get all posts
export const getAllPosts = () => (dispatch, getState) => {
  const token = getState().auth.token;
  dispatch({ type: REQUEST_ALL_POSTS });
  const url = path.resolve(ENTRY_POINT, 'posts', 'all');
  // Setup header
  const axiosConfig = {
    headers: {
      'Authorization': ['Bearer', token].join(' ')
    }
  }
  return axios.get(url, axiosConfig)
    .then((res) => {
      dispatch({
        type: RECEIVE_ALL_POSTS,
        payload: { posts: res.data }
      });
    })
    .catch((err) => {
      if (err.response.status === 401)
        dispatch(invalidateToken());
      const code = err.response.data.code || Status.NETWORK_FAILED;
      dispatch(showMessage(true, code));
    });
}

// Get all pages
export const getAllPages = () => (dispatch, getState) => {
  const token = getState().auth.token;
  dispatch({ type: REQUEST_ALL_PAGES });
  const url = path.resolve(ENTRY_POINT, 'pages', 'all');
  // Setup header
  const axiosConfig = {
    headers: {
      'Authorization': ['Bearer', token].join(' ')
    }
  }
  return axios.get(url, axiosConfig)
    .then((res) => {
      dispatch({
        type: RECEIVE_ALL_PAGES,
        payload: { pages: res.data }
      });
    })
    .catch((err) => {
      if (err.response.status === 401)
        dispatch(invalidateToken());
      const code = err.response.data.code || Status.NETWORK_FAILED;
      dispatch(showMessage(true, code));
    });
}

// Get all pages
export const getAllStats = () => (dispatch, getState) => {
  const token = getState().auth.token;
  dispatch({ type: REQUEST_ALL_STATS });
  const url = path.resolve(ENTRY_POINT, 'stats');
  // Setup header
  const axiosConfig = {
    headers: {
      'Authorization': ['Bearer', token].join(' ')
    }
  }
  return axios.get(url, axiosConfig)
    .then((res) => {
      dispatch({
        type: RECEIVE_ALL_STATS,
        payload: { stats: res.data }
      });
    })
    .catch((err) => {
      if (err.response.status === 401)
        dispatch(invalidateToken());
      const code = err.response.data.code || Status.NETWORK_FAILED;
      dispatch(showMessage(true, code));
    });
}

// New file
export const newFile = (fileType, fileName) => (dispatch, getState) => {
  const token = getState().auth.token;
  dispatch({ type: NEW_FILE });
  const url = path.resolve(ENTRY_POINT, 'new', fileType, encodeURIComponent(fileName));
  console.log(url);
  // Setup header
  const axiosConfig = {
    headers: {
      'Authorization': ['Bearer', token].join(' ')
    }
  }
  // return a new Promise so that the component can handle close modal
  return new Promise((resolve, reject) => {
    axios.get(url, axiosConfig)
    .then((res) => {
      const code = res.data.code;
      dispatch({
        type: DONE_NEW_FILE,
      });
      dispatch(showMessage(false, code));
      if (fileType === 'post')
        dispatch(getAllPosts());
      else if (fileType === 'page')
        dispatch(getAllPages());
      dispatch(getAllStats());
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

// Generate
export const generate = () => (dispatch, getState) => {
  const token = getState().auth.token;
  dispatch({ type: REQUEST_GENERATE });
  const url = path.resolve(ENTRY_POINT, 'generate');
  // Setup header
  const axiosConfig = {
    headers: {
      'Authorization': ['Bearer', token].join(' ')
    }
  }
  return axios.get(url, axiosConfig)
    .then((res) => {
      const code = res.data.code;
      dispatch({
        type: DONE_GENERATE,
      });
      dispatch(showMessage(false, code));
    })
    .catch((err) => {
      if (err.response.status === 401)
        dispatch(invalidateToken());
      const code = err.response.data.code || Status.NETWORK_FAILED;
      dispatch(showMessage(true, code));
    });
}

// Deploy
export const deploy = () => (dispatch, getState) => {
  const token = getState().auth.token;
  dispatch({ type: REQUEST_DEPLOY });
  const url = path.resolve(ENTRY_POINT, 'deploy');
  // Setup header
  const axiosConfig = {
    headers: {
      'Authorization': ['Bearer', token].join(' ')
    }
  }
  return axios.get(url, axiosConfig)
    .then((res) => {
      const code = res.data.code;
      dispatch({
        type: DONE_DEPLOY,
      });
      dispatch(showMessage(false, code));
    })
    .catch((err) => {
      if (err.response.status === 401)
        dispatch(invalidateToken());
      const code = err.response.data.code || Status.NETWORK_FAILED;
      dispatch(showMessage(true, code));
    });
}

// Clean
export const clean = () => (dispatch, getState) => {
  const token = getState().auth.token;
  dispatch({ type: REQUEST_CLEAN });
  const url = path.resolve(ENTRY_POINT, 'clean');
  // Setup header
  const axiosConfig = {
    headers: {
      'Authorization': ['Bearer', token].join(' ')
    }
  }
  return axios.get(url, axiosConfig)
    .then((res) => {
      const code = res.data.code;
      dispatch({
        type: DONE_CLEAN,
      });
      dispatch(showMessage(false, code));
    })
    .catch((err) => {
      if (err.response.status === 401)
        dispatch(invalidateToken());
      const code = err.response.data.code || Status.NETWORK_FAILED;
      dispatch(showMessage(true, code));
    });
}

// Filter items
export const filterItems = (query) => ({
  type: FILTER_ITEMS,
  payload: { query }
});