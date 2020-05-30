import { DATE_SELECT } from '../actions/types';

export default function (state = {}, action) {
    switch (action.type) {
        case DATE_SELECT:
            return { date: action.payload };

        default:
            return state;
    }
}

