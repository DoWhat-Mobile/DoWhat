
import { ADD_EVENTS } from '../actions/types';

const initState = {
    events: {}
}

export default function (state = initState, action) {
    switch (action.type) {
        case ADD_EVENTS:
            return { events: action.payload };

        default:
            return state;
    }
}