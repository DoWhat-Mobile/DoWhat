import { DATE_SELECT } from '../actions/types';

const initState = {
    date: new Date() // Start inital date with current date
}

export default function (state = initState, action) {
    switch (action.type) {
        case DATE_SELECT:
            return { date: action.payload };

        default:
            return state;
    }
}

