
import { ADD_EVENTS, ADD_UID, ADD_CURR_USER_NAME } from '../actions/types';

const initState = {
    events: {},
    userID: '',
    currUserName: ''
}

export default function (state = initState, action) {
    switch (action.type) {
        case ADD_EVENTS:
            return Object.assign({}, state, {
                events: action.payload,
            });
        case ADD_UID:
            return Object.assign({}, state, {
                userID: action.payload,
            });
        case ADD_CURR_USER_NAME:
            return Object.assign({}, state, {
                currUserName: action.payload,
            });
        default:
            return state;
    }
}