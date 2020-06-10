/**
 * Welcome screen, without FB authentication anymore.
 */
import React from "react";
import { View, Text, Button } from "react-native";
import { connect } from "react-redux";
import Slides from "./Slides";
import { YellowBox } from "react-native";
import moment from "moment-timezone";

/**
 * 1) Loop through all the attendees and get their busy period. (Date Object)
 * 2) getTime() from busy period start and end. Round up for start, and round down for end time. ([])
 * 3) Convert the busy period to the corresponding availble periods, just look at the flip side. ([0 0 0 1 1 1 0 0 0 0 1 1 0 0 0])
 * 4) Find biggest free time block for EACH individual
 * 5) Find the overlap amongst all the free time blocks found in step 4)
 * 6) Have a minimum overlapping time cut off at 2h. This prevents time intervals from being too small.
 * 7) Omit anyone who can not be included in the min 2h time interval
 */
const findOverlappingIntervals = (allAttendees) => {
    for (var attendee in allAttendees) {
        const availbilitiesOfAttendee = allAttendees[attendee]; // Object with > 1 start&end busy periods

    }
    // Format date object 
    let start = parseInt(
        moment(startState)
            .tz("Asia/Singapore")
            .format("HH:mm")
            .substring(0, 2)
    )

}

const WelcomeScreen = (props) => {
    YellowBox.ignoreWarnings(["Setting a timer"]);

    const testData = () => {
        firebase
            .database()
            .ref("users/" + 'F5ky8tjBTnOxagTDYGWZ6Rh9wDL2')
            .once("value")
            .then((snapshot) => {
                const userData = snapshot.val();
                const allAttendees = userData.all_attendees;
                findOverlappingIntervals(allAttendees);
            })
    }

    const WelcomeScreen = (props) => {
        return (
            <View>
                <Text>Hello</Text>
                <Button onPress={testData} title='testData' />
            </View>
        )
    };

    export default connect()(WelcomeScreen);
//     const WelcomeScreen = (props) => {
//         const data = [
//             { text: "Welcome to DoWhat" },
//             { text: "Choose your timings" },
//             { text: "Select your genre" },
//             { text: "Get your finalized timeline" },
//         ];
//     
//         /**
//          * after reaching the last slide, direct to Auth page
//          */
//         onSlidesComplete = () => {
//             props.navigation.navigate("Auth");
//         };
//     
//         return (
//             <View>
//                 <Slides data={data} onSlidesComplete={onSlidesComplete} />
//             </View>
//         );
//     };
//     
//     export default connect()(WelcomeScreen);