import { SIGN_IN, SIGN_OUT, INVALIDATE_TOKEN } from '../actions/actionTypes';

const initialState = {
  token: localStorage.getItem('token'),
}

const loginReducer = (state = initialState, action) => {
  switch (action.type) {
    case SIGN_IN:
      return { token: action.payload.token };
    case SIGN_OUT:
    case INVALIDATE_TOKEN:
      return { token: null };
    default:
      return state;
  }
}

export default loginReducer;