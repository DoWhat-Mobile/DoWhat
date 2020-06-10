/**
 * Welcome screen, without FB authentication anymore.
 */
import React from "react";
import { View, Text, Button } from "react-native";
import { connect } from "react-redux";
import Slides from "./Slides";
import { YellowBox } from "react-native";
import moment from "moment-timezone";
import firebase from "../database/firebase";

/**
 * 1) Loop through all the attendees and get their busy period. (Date Object)
 * 2) getTime() from busy period start and end. Round off to the hours. EG 11:15 & 11:45 will round off to 11.
 * 3) Convert the busy period to the corresponding availble periods, just look at the flip side. ([0 0 0 1 1 1 0 0 0 0 1 1 0 0 0])
 * 4) Mark out overlapping timings amongst all the attendees 
 * 5) Find the longest sequence of free timings found in 4). 
 * 6) Have a minimum overlapping time cut off at 2h. This prevents time intervals from being too small. **NOT IMPLEMENTED**
 * 7) Omit anyone who can not be included in the min 2h time interval **NOT IMPLEMENTED**
 */
const findOverlappingIntervals = (allAttendees, mainUserBusyPeriod) => {
    var allAvailabilities = [];

    // Add formatted avails to the array of all availabilities
    allAvailabilities.push(handleMainUserData(mainUserBusyPeriod));
    const allAttendeeAvails = handleAllAttendeesData(allAttendees);
    allAttendeeAvails.forEach(attendeeAvailData => {
        allAvailabilities.push(attendeeAvailData);
    })

    const timeline = markFreeBlocksOfTime(allAvailabilities);
    const finalizedAvailRange = takeLargestBlockOfTimeFrom(timeline);
    console.log(finalizedAvailRange);
    return finalizedAvailRange;
}

const takeLargestBlockOfTimeFrom = (timeline) => {
    var longestCount = 0;
    var currCount = 0;
    var endIndex = 0;

    for (var i = 0; i < timeline.length; i++) {
        if (i == 23 && timeline[i] == 5) { // Last entry, corner case
            currCount++;
            if (currCount > longestCount) {
                // Update longestCount, start & end indexes
                longestCount = currCount;
                endIndex = 23;
            }

        } else if (timeline[i] == 0) { // End of the continuous sequence
            if (currCount > longestCount) {
                // Update longestCount, start & end indexes
                longestCount = currCount;
                endIndex = i - 1;
            }
            currCount = 0; // Reset curr count once hit a busy period. No longer continuous availability

        } else {
            // If entry is '5' and its not last entry, meaning its a free hour slot for scheduling
            currCount++;
        }
    }
    return [endIndex - longestCount, endIndex];
}

/**
 * Mark a free hour block with a value '5' in an array with 24 entries, each entry representing one hour.
 */
const markFreeBlocksOfTime = (allAvailabilities) => {
    var timeline = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 7; i < 24; i++) { // Pointer for the timeline array, starting at 0800-0900hrs (8th position in arr)
        var shouldMarkAsAvail = true;

        allAvailabilities.forEach(obj => {
            for (var attendee in obj) {
                const availArray = obj[attendee].split(',');
                // Look at hour of the day of the attendee's availabilities, if *ALL* the attendees are available at that hour, mark it.
                shouldMarkAsAvail = shouldMarkAsAvail && (availArray[i] == 0)
                break;
            }
        })

        if (shouldMarkAsAvail) {
            timeline[i] = 5; // Rando number 5 to mark that this hour slot is good for scheduling
        }
    }
    return timeline;
}

// Returns object with array representing availability of the main user 
const handleMainUserData = (mainUserBusyPeriod) => {
    var mainUserAvails = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    // Handle data for main user and insert into allAvailabilities array
    for (var i = 0; i < mainUserBusyPeriod.length; i++) {
        const timeRange = mainUserBusyPeriod[i];

        const startTime = timeRange.start;
        const endTime = timeRange.end

        // Time format in array is the beginning of the hour. EG a '1' at the 13th position in the array means 1300-1400hrs is BUSY.
        const formattedStartTime = formatTime(startTime) - 1;
        const formattedEndTime = formatTime(endTime) - 1;

        mainUserAvails.fill(1, formattedStartTime, formattedEndTime);
    }

    const mainUserData = {};
    mainUserData['main'] = mainUserAvails.toString();
    return mainUserData;
}

// Returns an array consisting of objects with attendee email and array representing availability of each attendee
const handleAllAttendeesData = (allAttendees) => {
    var allAvailabilities = [];

    // Handle data for all the other attendees and insert into allAvailabilities array
    for (var attendee in allAttendees) {
        const busyPeriodsOfAttendee = allAttendees[attendee].busy_periods; // Object with > 1 start&end busy periods
        var currAttendeeAvails = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

        for (var timeRange in busyPeriodsOfAttendee) {
            const startTime = busyPeriodsOfAttendee[timeRange].start;
            const endTime = busyPeriodsOfAttendee[timeRange].end

            // Time format in array is the beginning of the hour. EG a '1' at the 13th position in the array means 1300-1400hrs is BUSY.
            const formattedStartTime = formatTime(startTime) - 1;
            const formattedEndTime = formatTime(endTime) - 1;

            currAttendeeAvails.fill(1, formattedStartTime, formattedEndTime);
        }
        const availsAndAttendee = {};
        availsAndAttendee[attendee] = currAttendeeAvails.toString();

        allAvailabilities.push(availsAndAttendee);
    }
    return allAvailabilities;
}

// Format time to an integer from 1 - 24. Only the hours are taken. ***NOTE: ALL ROUNDED TO THE HOUR.***
const formatTime = (time) => {
    return parseInt(
        moment(time)
            .tz("Asia/Singapore")
            .format("HH:mm")
            .substring(0, 2)
    );

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
                const mainUserBusyPeriod = userData.busy_periods;
                findOverlappingIntervals(allAttendees, mainUserBusyPeriod);
            })
    }

    return (
        <View>
            <Text>Hello</Text>
            <Button onPress={testData} title='testData' />
            <Button onPress={() => props.navigation.navigate("Auth")} title='Navigate' />
        </View>
    );
}

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