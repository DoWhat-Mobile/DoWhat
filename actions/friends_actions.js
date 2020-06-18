
import { REMOVE_FRIEND, FIND_FRIENDS } from './types';

/**
 * 
 * @param {*} values is all app users from firebase 
 */
export const findFriends = (values) => dispatch => {
    const newState = {
        type: FIND_FRIENDS,
        payload: values,
    }
    dispatch(newState);
};

export const removeFriend = (values, allFriends) => dispatch => {
    const newState = {
        type: REMOVE_FRIEND,
        payload: values,
        allFriends: allFriends
    }
    dispatch(newState);
};