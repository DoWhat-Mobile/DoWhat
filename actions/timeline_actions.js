import { CHANGE_TIME, ADD_FRIEND } from "./types";

/**
 *  Action creator that changes the start and end time state
 */
export const changeTime = (values) => (dispatch) => {
  const newState = {
    type: CHANGE_TIME,
    payload: values,
  };
  dispatch(newState);
};

/**
 * Saves the state of the current user's startTime and endTime, before 
 * starting afresh for the new friend. 
 * @param {} values is a object which has the user's start and end time. 
 */
export const addFriend = (values) => dispatch => {
  const newState = {
    type: ADD_FRIEND,
    payload: values
  };
  dispatch(newState);
}