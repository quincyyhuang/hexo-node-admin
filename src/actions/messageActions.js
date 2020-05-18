/*
  Message Action Creators
 */

import { SHOW_MESSAGE, DISMISS_MESSAGE } from '../actions/actionTypes';

export const showMessage = (error, code) => {
  return {
    type: SHOW_MESSAGE,
    payload: { error, code }
  }
}

export const dismissMessage = () => {
  return { type: DISMISS_MESSAGE };
}