import { RECEIVE_FILE_CONTENT, ONCHANGE_FILE_CONTENT, RECEIVE_ASSETS, DONE_SAVE_FILE_CONTENT } from '../actions/actionTypes';

const initialState = {
  ifChanged: false,
  content: '',
  lastSavedContent: '',
  assets: []
}

const editorReducer = (state = initialState, action) => {
  switch (action.type) {
    case ONCHANGE_FILE_CONTENT:
      return {
        ...state,
        content: action.payload.content,
        ifChanged: !(action.payload.content === state.lastSavedContent)
      }
    case RECEIVE_FILE_CONTENT:
      return {
        ...state,
        content: action.payload.content,
        lastSavedContent: action.payload.content
      }
    case RECEIVE_ASSETS:
      return {
        ...state,
        assets: action.payload.assets
      }
    case DONE_SAVE_FILE_CONTENT:
      return {
        ...state,
        ifChanged: false
      }
    default:
      return state;
  }
}

export default editorReducer;