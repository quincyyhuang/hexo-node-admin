import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const initialState = {};

const middleware = [thunk];

let store;
if (process.env.NODE_ENV === 'production') {
  store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middleware)
  );
}
else {
  const composeEnhancers = (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ trace: true, traceLimit: 25 })) || compose;
  store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(
      applyMiddleware(...middleware)
    )
  );
}

export default store;