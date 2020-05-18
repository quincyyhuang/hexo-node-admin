import { SHOW_MESSAGE, DISMISS_MESSAGE } from '../actions/actionTypes';

const initialState = {
  ifShowMessage: false,
  ifMessageIsError: false,
  messageCode: null
}

const messageReducer = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_MESSAGE:
      return {
        ifShowMessage: true,
        ifMessageIsError: action.payload.error,
        messageCode: action.payload.code
      }
    
    case DISMISS_MESSAGE:
      // can use immer.js here
      return {
        ...state,
        ifShowMessage: false
      }

    default:
      return state;
  }
}

export default messageReducer;