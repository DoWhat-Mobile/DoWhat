import { REACT_APP_GOOGLE_API_KEY } from 'react-native-dotenv';
import { checkIfTokenExpired } from '../reusable-functions/OAuthConfig';
import { OAuthConfig } from "../reusable-functions/OAuthConfig";
import { extractCalendarEvents } from '../actions/auth_screen_actions';
import * as AppAuth from "expo-app-auth";
import store from "../store";
const firebase = require('firebase');

/**
 * Events that are already in the current user's Google calendar
 * For non-first time signed in users
 */
export const addGcalEventsToRedux = async (userID) => {
    firebase
        .database()
        .ref("users/" + userID)
        .once("value")
        .then((snapshot) => {
            const userData = snapshot.val();
            const token = {
                accessToken: userData.access_token,
                refreshToken: userData.refresh_token,
                accessTokenExpirationDate: userData.access_token_expiration,
            };
            makeGcalAPICall(token);
        });
};

// For first time sign-in users, no Firebase data yet
export const addGcalEventsToReduxFirstTimeUser = async (accessToken,
    refreshToken, accessTokenExpirationDate) => {
    const token = {
        accessToken: accessToken,
        refreshToken: refreshToken,
        accessTokenExpirationDate: accessTokenExpirationDate
    };
    makeGcalAPICall(token)
}

// Get user's added calendar events within a one week period, add to Redux state
const makeGcalAPICall = async (token) => {
    // Ensure access token validity
    var accessToken = token.accessToken;
    accessToken = (
        await AppAuth.refreshAsync(OAuthConfig, token.refreshToken)
    ).accessToken;
    if (checkIfTokenExpired(token.accessTokenExpirationDate)) {
        // Use refresh token to generate new access token if access token has expired
        accessToken = (
            await AppAuth.refreshAsync(OAuthConfig, token.refreshToken)
        ).accessToken;
    }

    // Get the time range to extract events from
    const todayDate = new Date().toISOString().substring(0, 10);
    var oneWeekFromToday = new Date();
    oneWeekFromToday.setDate(oneWeekFromToday.getDate() + 7);
    const weekLater = oneWeekFromToday.toISOString().substring(0, 10);

    try {
        fetch(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events?" + // Fetch from primary calendar
            "timeMax=" +
            weekLater +
            "T23%3A59%3A00%2B08%3A00&" + //23:59hrs
            "timeMin=" +
            todayDate +
            "T00%3A00%3A00%2B08%3A00&" + // 00:00hrs
            "prettyPrint=true&" +
            "orderBy=startTime&" +
            "singleEvents=true&key=" +
            REACT_APP_GOOGLE_API_KEY,
            {
                method: "GET",
                headers: new Headers({
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + accessToken,
                }),
            }
        )
            .then((response) => response.json())
            .then((data) => {
                const allEventsArr = data.items;
                // console.log("Event extraction API call successful: ", allEventsArr);
                store.dispatch(extractCalendarEvents(data.items)); // Add events to redux state
            });
    } catch (e) {
        console.log(e);
    }
};