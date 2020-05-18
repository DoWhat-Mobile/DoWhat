import { createStore, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import reducers from "../reducers";

/**
 * Create a store object which holds the state of the whole application.6
 */
const store = createStore(reducers, {}, compose(applyMiddleware(thunk)));

export default store;
