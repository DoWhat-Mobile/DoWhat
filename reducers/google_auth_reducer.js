import { SET_ACCESS_TOKEN } from '../actions/types';

export default function (state = {}, action) {
    switch (action.type) {
        case SET_ACCESS_TOKEN:
            return Object.assign({}, state, {
                access_token: action.payload.access_token,
                id_token: action.payload.id_token,
                refresh_token: action.payload.refresh_token
            });

        default:
            return state;
    }
}