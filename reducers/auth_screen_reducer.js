
import { ADD_EVENTS, ADD_UID } from '../actions/types';

const initState = {
    events: {},
    userID: '',
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

        default:
            return state;
    }
}