/**
 * Functions required to extract attendees of the finalized timeline, and send them a Google
 * Calendar invite.
 */
const firebase = require('firebase');
import * as AppAuth from "expo-app-auth";
import {
    OAuthConfig,
} from "../reusable-functions/google_authentication_functions";
import { REACT_APP_GOOGLE_API_KEY } from 'react-native-dotenv';

export const handleProcess = async (formattedData, timingsArray) => {
    try {
        const userId = firebase.auth().currentUser.uid;
        firebase
            .database()
            .ref("users/" + userId)
            .once("value")
            .then((snapshot) => {
                const userData = snapshot.val();
                const attendees = userData.all_attendees; // Object with all attendees
                const selectedDate = userData.selected_date; // From date selection component
                const userEmail = userData.gmail;
                const accessToken = [userData.access_token,
                userData.access_token_expiration,
                userData.refresh_token];

                const formattedAttendeeEmails = formatAttendeeEmails(attendees);
                formatRequestAndMakeAPICall(formattedAttendeeEmails,
                    formattedData,
                    timingsArray,
                    selectedDate,
                    userEmail,
                    accessToken);
            })

    } catch (e) {
        console.log(e);
    }
}


const formatRequestAndMakeAPICall = async (allFormattedEmails, allEvents, timingsArray,
    selectedDate, userEmail, token) => {
    const date = formatDate(new Date(selectedDate));
    // Array consist of access token, expiry date, and refresh token
    const accessToken = await getValidAccessToken(token[0], token[1], token[2]);

    for (var i = 0; i < allEvents.length; i++) {
        const requestBody = {};

        // Get information required for request body
        const eventTitle = allEvents[i].eventTitle;
        const eventStartTime = formatTime(date, timingsArray[i].start);
        const eventEndTime = formatTime(date, timingsArray[i].end);

        requestBody['end'] = { // End time of event
            dateTime: eventEndTime,
            timeZone: 'Asia/Singapore'
        }

        requestBody['start'] = { // Start time of event
            dateTime: eventStartTime,
            timeZone: 'Asia/Singapore'
        }

        requestBody['attendees'] = allFormattedEmails; // Include all attendees in API request body
        requestBody['summary'] = eventTitle // Title of event
        requestBody['description'] = "Specially curated for you by DoWhat?"
        makeAPICall(requestBody, userEmail, accessToken); // AccessToken has been ensure to be valid
    }

    resetAllAttendeeData(); // Reset data after all API Calls made. Prevents interference for future calls
}

// Google Calendar Events insert API call
const makeAPICall = async (requestBody, userEmail, accessToken) => {
    try {
        console.log(JSON.stringify(requestBody));
        fetch(
            "https://www.googleapis.com/calendar/v3/calendars/" + encodeURI(userEmail) +
            "/events?sendNotifications=true&sendUpdates=all&key=" + REACT_APP_GOOGLE_API_KEY,
            {
                method: "POST",
                body: JSON.stringify(requestBody),
                headers: new Headers({
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + accessToken,
                }),
            }
        )
            .then((resp) => resp.json())
            .then((data) => {
                console.log("Successfully added event to calendar? ", data)
            })

    } catch (err) {
        console.log(err);
    }
}

const checkIfTokenExpired = (accessTokenExpirationDate) => {
    return new Date(accessTokenExpirationDate) < new Date();
};

// Ensure acess token is not expired 
const getValidAccessToken = async (token, tokenExpiryDate, refreshToken) => {
    var accessToken = token;
    if (checkIfTokenExpired(tokenExpiryDate)) {
        // Use refresh token to generate new access token if access token has expired
        accessToken = (
            await AppAuth.refreshAsync(OAuthConfig, refreshToken)
        ).accessToken;
    }
    return accessToken
}

// Change to format usable with Gcal Event insert API.
const formatAttendeeEmails = (attendees) => {
    if (attendees == undefined) { // No attendees joining
        return []; // Means no attendees are free to join the scheduled events
    }

    var allFormattedEmails = [];

    for (var email in attendees) {
        const modifiedEmail = email.replace(/\@/g, '.') + '@gmail.com';
        const formattedEmail = { 'email': modifiedEmail };
        allFormattedEmails.push(formattedEmail);
    }

    return allFormattedEmails;
}

// Format the selected_date string from firebase to a format usable with Google API calls
const formatDate = (date) => {
    const year = date.getFullYear().toString();
    var month = date.getMonth() + 1; // Offset by 1 due to Javascrip Date object format
    month = month >= 10 ? month.toString() : "0" + month.toString();
    const day = date.getDate().toString();
    const dateString = year + "-" + month.toString() + "-" + day;
    return dateString;
}

// Format date and hour to make it compatible with google API call
const formatTime = (date, hour) => {
    return date + 'T' + hour + ':00:00+08:00'
}

// Clean data so it wont intefere with future scheduling
const resetAllAttendeeData = () => {
    const userId = firebase.auth().currentUser.uid;
    firebase
        .database()
        .ref("users/" + userId)
        .child('all_attendees')
        .remove()
}

export const formatEventsData = (data) => {
    var allEventDetails = [];
    data.forEach(event => {
        const title = event.title;
        // const time = event.time; // Event time now gotten from timingsArray from finalized comp
        allEventDetails.push({ eventTitle: title });
    })
    return allEventDetails;
}