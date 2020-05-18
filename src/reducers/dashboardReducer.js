import { RECEIVE_ALL_POSTS, RECEIVE_ALL_PAGES, RECEIVE_ALL_STATS, FILTER_ITEMS } from '../actions/actionTypes';

const initialState = {
  posts: [],
  pages: [],
  stats: {},
  query: ''
}

const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_ALL_POSTS:
      return {
        ...state,
        posts: action.payload.posts
      }
    case RECEIVE_ALL_PAGES:
      return {
        ...state,
        pages: action.payload.pages
      }
    case RECEIVE_ALL_STATS:
      return {
        ...state,
        stats: action.payload.stats
      }
    case FILTER_ITEMS:
      return {
        ...state,
        query: action.payload.query
      }
    default:
      return state;
  }
}

export default dashboardReducer;