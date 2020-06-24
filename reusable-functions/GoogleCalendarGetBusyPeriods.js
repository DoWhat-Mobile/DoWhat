import { onSignIn, OAuthConfig, } from "./GoogleAuthentication";
import firebase from "../database/firebase";
import * as AppAuth from "expo-app-auth";
import { REACT_APP_GOOGLE_API_KEY } from 'react-native-dotenv';

export const getBusyPeriodFromGoogleCal = async (userId, selectedDate) => {
    try {
        firebase
            .database()
            .ref("users/" + userId)
            .once("value")
            .then((snapshot) => {
                const userData = snapshot.val();
                // token is object for compatibility with findAndStoreBusyPeriod input
                const token = {
                    accessToken: userData.access_token,
                    refreshToken: userData.refresh_token,
                    accessTokenExpirationDate:
                        userData.access_token_expiration,
                };
                const userEmail = userData.gmail;
                findAndStoreBusyPeriod(token, userEmail, userId, selectedDate);
            });
    } catch (e) {
        console.log(e);
    }
}

/**
 * Google Calendar free/busy API call, user's free/busy period will be stored into firebase as well.
**/
const findAndStoreBusyPeriod = async (token, userEmail, userId, selectedDate) => {
    try {
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

        fetch(
            "https://www.googleapis.com/calendar/v3/freeBusy?key=" + REACT_APP_GOOGLE_API_KEY,
            {
                method: "POST",
                body: getData(userEmail, selectedDate),
                headers: new Headers({
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + accessToken,
                }),
            }
        )
            .then((response) => response.json())
            .then((data) => {
                // Store busy data into firebase
                firebase
                    .database()
                    .ref("users/" + userId)
                    .child("busy_periods")
                    .set(data.calendars[userEmail].busy);
            });
    } catch (e) {
        console.log(e);
    }
};

export const authenticateAndGetBusyPeriods = async (userID, selectedDate) => {
    try {
        // Get Oauth2 token
        const tokenResponse = await AppAuth.authAsync(OAuthConfig);
        getUserEmailThenBusyPeriod(tokenResponse, userID, selectedDate);
    } catch (e) {
        console.log(e);
    }
};

const getUserEmailThenBusyPeriod = async (token, userID, selectedDate) => {
    try {
        // Get user email
        fetch(
            "https://www.googleapis.com/oauth2/v1/userinfo?access_token=" +
            token.accessToken,
            {
                method: "GET",
                headers: new Headers({
                    Accept: "application/json",
                }),
            }
        )
            .then((response) => response.json())
            // Use the user's email to get the user's busy periods
            .then((data) => {
                data["accessToken"] = token.accessToken; // Append additional props for use in google sign in
                data["idToken"] = token.idToken;
                data["refreshToken"] = token.refreshToken;
                onSignIn(data); // Sign in to Google's firebase
                findAndStoreBusyPeriod(token, data.email, userID, selectedDate);
            });

    } catch (e) {
        console.log(e);
    }
};

const checkIfTokenExpired = (accessTokenExpirationDate) => {
    return new Date(accessTokenExpirationDate) < new Date();
};

// Extract free/busy timings from the selected date, and the extracted user email
const getData = (userEmail, selectedDate) => {
    const formattedDate = formatDateToString(selectedDate)
    return JSON.stringify({
        timeMin: formattedDate + "T08:00:00+08:00",
        timeMax: formattedDate + "T23:59:00+08:00",
        timeZone: "UTC+08:00",
        items: [
            {
                id: userEmail,
            },
        ],
    });
}

// Format for use with GAPI call
export const formatDateToString = (date) => {
    const year = date.getFullYear().toString();
    var month = date.getMonth() + 1; // Offset by 1 due to Javascrip Date object format
    month = month >= 10 ? month.toString() : "0" + month.toString();
    const day = date.getDate().toString();
    const dateString = year + "-" + month.toString() + "-" + day;
    return dateString;
};

/******************************************************/
/******THESE ARE USED IN THE COLLABORATIVE BOARD*******/
/******************************************************/
export const inputBusyPeriodFromGcal = async (userId, selectedDate, boardID) => {
    try {
        firebase
            .database()
            .ref("users/" + userId)
            .once("value")
            .then((snapshot) => {
                const userData = snapshot.val();
                // token is object for compatibility with findAndStoreBusyPeriod input
                const token = {
                    accessToken: userData.access_token,
                    refreshToken: userData.refresh_token,
                    accessTokenExpirationDate:
                        userData.access_token_expiration,
                };
                const userEmail = userData.gmail;
                addToCollaborativeBoard(token, userEmail, selectedDate, boardID);
            });
    } catch (e) {
        console.log(e);
    }
}

// Add busy periods to the collborative board node
const addToCollaborativeBoard = async (token, userEmail, selectedDate, boardID) => {
    try {
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

        fetch(
            "https://www.googleapis.com/calendar/v3/freeBusy?key=" + REACT_APP_GOOGLE_API_KEY,
            {
                method: "POST",
                body: getData(userEmail, selectedDate),
                headers: new Headers({
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + accessToken,
                }),
            }
        )
            .then((response) => response.json())
            .then((data) => {
                const formattedUserEmail = userEmail.replace(/\./g, '@').slice(0, -10); // Firebase cant have '@' 
                const formattedData = {};
                formattedData[formattedUserEmail] = data.calendars[userEmail].busy;
                // Store busy data into firebase
                firebase
                    .database()
                    .ref("collab_boards/" + boardID + '/availabilities')
                    .update(formattedData);
            });
    } catch (e) {
        console.log(e);
    }
};