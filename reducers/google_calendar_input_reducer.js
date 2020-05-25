/**
 * All the reducers involved in the google calendar input feature. Including login to google feature.
 */
import { GOOGLE_LOGIN_SUCCESS, GOOGLE_LOGIN_FAIL } from '../actions/types';

export default function (state = {}, action) {
    switch (action.type) {
        case GOOGLE_LOGIN_SUCCESS:
            console.log("Login Success case")
            return { token: action.payload };

        case GOOGLE_LOGIN_FAIL:
            return { token: null };

        default:
            return state;

    }
}