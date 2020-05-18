import { combineReducers } from 'redux';
import loginReducer from './loginReducer';
import messageReducer from './messageReducer';
import dashboardReducer from './dashboardReducer';
import editorReducer from './editorReducer';

export default combineReducers({
  auth: loginReducer,
  message: messageReducer,
  dashboard: dashboardReducer,
  editor: editorReducer
});