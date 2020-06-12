/**
 * Functions required to extract attendees of the finalized timeline, and send them a Google
 * Calendar invite.
 */
const firebase = require('firebase');

export const handleProcess = (formattedData) => {
    try {
        const userId = firebase.auth().currentUser.uid;
        firebase
            .database()
            .ref("users/" + userId)
            .once("value")
            .then((snapshot) => {
                const userData = snapshot.val();
                const attendees = userData.all_attendees; // Object with all attendees
                return formatAttendeeEmails(attendees);
            })
            .then(formattedAttendeeEmails => {
                formatRequestAndMakeAPICall(formattedAttendeeEmails, formattedData);
            });

    } catch (e) {
        console.log(e);
    }
}

// Change to format usable with Gcal Event insert API.
const formatAttendeeEmails = (attendees) => {
    if (attendees == undefined) { // No attendees joining
        return { attendees: [] }; // Means no attendees are free to join the scheduled events
    }

    var allFormattedEmails = [];

    for (var email in attendees) {
        const modifiedEmail = email.replace(/\@/g, '.') + '@gmail.com';
        const formattedEmail = { 'email': modifiedEmail }
        allFormattedEmails.push(formattedEmail);
    }

    return { attendees: allFormattedEmails };
}

const formatRequestAndMakeAPICall = (allFormattedEmails, allEvents) => {
    // const startTime =
    // const endTime = 
}

const resetAllAttendeeData = () => {

}

export const formatEventsData = (data) => {
    var allEventDetails = [];
    data.forEach(event => {
        const title = event.title;
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