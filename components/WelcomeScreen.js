/**
 * Welcome screen, without FB authentication anymore.
 */
import React from "react";
import { View, Text, Button } from "react-native";
import { connect } from "react-redux";
import Slides from "./Slides";
import firebase from 'firebase';

const findOverlappingIntervals = (allAvailabilities) => {
    for (var attendee in allAvailabilities) {
        console.log(attendee);
    }
}

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