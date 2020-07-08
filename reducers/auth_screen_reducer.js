
import { ADD_EVENTS, ADD_UID, ADD_CURR_USER_NAME, ADD_PROFILE_PICTURE, EXTRACT_CALENDAR_EVENTS } from '../actions/types';

const initState = {
    events: {},
    userID: '',
    currUserName: '',
    profilePicture: '',
    currUserCalendarEvents: {}
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
        case ADD_PROFILE_PICTURE:
            return Object.assign({}, state, {
                profilePicture: action.payload,
            });
        case ADD_CURR_USER_NAME:
            return Object.assign({}, state, {
                currUserName: action.payload,
            });
        case ADD_CURR_USER_NAME:
            return Object.assign({}, state, {
                currUserCalendarEvents: action.payload,
            });
        default:
            return state;
    }
}