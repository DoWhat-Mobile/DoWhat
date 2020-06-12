/**
 * Functions required to extract attendees of the finalized timeline, and send them a Google
 * Calendar invite.
 */
const firebase = require('firebase');
<<<<<<< HEAD
import * as AppAuth from "expo-app-auth";
import {
    OAuthConfig,
} from "../reusable-functions/google_authentication_functions";

export const handleProcess = (formattedData, timingsArray) => {
=======

export const handleProcess = (formattedData) => {
>>>>>>> c6f344264467b10cd5bd20050e870090101e796f
    try {
        const userId = firebase.auth().currentUser.uid;
        firebase
            .database()
            .ref("users/" + userId)
            .once("value")
            .then((snapshot) => {
                const userData = snapshot.val();
                const attendees = userData.all_attendees; // Object with all attendees
<<<<<<< HEAD
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
=======
                return formatAttendeeEmails(attendees);
            })
            .then(formattedAttendeeEmails => {
                createGcalEventAndSendInvite(formattedAttendeeEmails, formattedData);
            });
>>>>>>> c6f344264467b10cd5bd20050e870090101e796f

    } catch (e) {
        console.log(e);
    }
}

<<<<<<< HEAD

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
}

// Google Calendar Events insert API call
const makeAPICall = async (requestBody, userEmail, accessToken) => {
    try {
        fetch(
            "https://www.googleapis.com/calendar/v3/calendars/" + encodeURI(userEmail) + //'hansybastian%40gmail.com' +
            "/events?sendNotifications=true&sendUpdates=all&key=AIzaSyA98MBxh0oZKqPJC6SvGspEz60ImpEaW9Q",
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
            .then((data) => console.log(data))

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
=======
// Change to format usable with Gcal Event insert API.
const formatAttendeeEmails = (attendees) => {
    if (attendees == undefined) { // No attendees joining
        return { attendees: [] }; // Means no attendees are free to join the scheduled events
>>>>>>> c6f344264467b10cd5bd20050e870090101e796f
    }

    var allFormattedEmails = [];

    for (var email in attendees) {
        const modifiedEmail = email.replace(/\@/g, '.') + '@gmail.com';
<<<<<<< HEAD
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
=======
        const formattedEmail = { 'email': modifiedEmail }
        allFormattedEmails.push(formattedEmail);
    }

    return { attendees: allFormattedEmails };
}

const createGcalEventAndSendInvite = (allFormattedEmails, allEvents) => {
>>>>>>> c6f344264467b10cd5bd20050e870090101e796f
}

const resetAllAttendeeData = () => {

}

export const formatEventsData = (data) => {
    var allEventDetails = [];
    data.forEach(event => {
        const title = event.title;
<<<<<<< HEAD
        // const time = event.time; // Event time now gotten from timingsArray from finalized comp
        allEventDetails.push({ eventTitle: title });
    })
    return allEventDetails;
}
=======
        const time = event.time;
        allEventDetails.push({ eventTitle: title, eventTime: time });
    })
    return allEventDetails;
}
/*
Array [
  Object {
    "description": Object {
      "$$typeof": Symbol(react.element),
      "_owner": FiberNode {
        "tag": 0,
        "key": null,
        "type": [Function Finalized],
      },
      "_store": Object {},
      "key": null,
      "props": Object {
        "children": Object {
          "$$typeof": Symbol(react.element),
          "_owner": FiberNode {
            "tag": 0,
            "key": null,
            "type": [Function Finalized],
          },
          "_store": Object {},
          "key": null,
          "props": Object {
            "children": Array [
              "1 Empress Place",
              " ",
              "

",
              " ",
              "The Asian Civilisations Museum is devoted to exploring the rich artistic heritage of Asia, especially the ancestral cultures of Singaporeans.",
            ],
          },
          "ref": null,
          "type": Object {
            "$$typeof": Symbol(react.forward_ref),
            "displayName": "Text",
            "propTypes": Object {
              "accessible": [Function bound checkType],
              "adjustsFontSizeToFit": [Function bound checkType],
              "allowFontScaling": [Function bound checkType],
              "dataDetectorType": [Function bound checkType],
              "disabled": [Function bound checkType],
              "ellipsizeMode": [Function bound checkType],
              "maxFontSizeMultiplier": [Function bound checkType],
              "minimumFontScale": [Function bound checkType],
              "nativeID": [Function bound checkType],
              "numberOfLines": [Function bound checkType],
              "onLayout": [Function bound checkType],
              "onLongPress": [Function bound checkType],
              "onPress": [Function bound checkType],
              "pressRetentionOffset": [Function bound checkType],
              "selectable": [Function bound checkType],
              "selectionColor": [Function bound colorPropType],
              "style": [Function anonymous],
              "suppressHighlighting": [Function bound checkType],
              "testID": [Function bound checkType],
              "textBreakStrategy": [Function bound checkType],
            },
            "render": [Function Text],
          },
        },
        "numberOfLines": 4,
        "renderRevealedFooter": [Function renderRevealedFooter],
        "renderTruncatedFooter": [Function renderTruncatedFooter],
      },
      "ref": null,
      "type": [Function ReadMore],
    },
    "time": "13:00",
    "title": "Asian Civilisations Museum",
  },
]
*/
>>>>>>> c6f344264467b10cd5bd20050e870090101e796f
