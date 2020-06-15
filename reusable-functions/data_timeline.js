import React from "react";
import { View, Text, Modal } from "react-native";
import ReadMore from "react-native-read-more-text";
import ShuffleModal from "../components/finalized/ShuffleModal";

export const data_timeline = (timeline, testEvents, events) => {
    const renderTruncatedFooter = (handlePress) => {
        return (
            <Text
                style={{ color: "#595959", marginTop: 5 }}
                onPress={handlePress}
            >
                Read more
            </Text>
        );
    };

    const renderRevealedFooter = (handlePress) => {
        return (
            <Text
                style={{ color: "#595959", marginTop: 5 }}
                onPress={handlePress}
            >
                Show less
            </Text>
        );
    };

    const data = [];
    const timingsArray = [];
    let startTime = timeline[0];
    let num = testEvents.length;

    // checks if user selected food so dinner will be included if user has time 6pm onwards
    let food =
        (testEvents.includes("hawker") ||
            testEvents.includes("restaurants") ||
            testEvents.includes("cafes")) &&
        startTime <= 13
            ? 1
            : 0;

    // formats data array to be passed into Timeline library
    while (testEvents.length !== 0) {
        for (i = 0; i < testEvents.length; i++) {
            const genre = testEvents[i];
            const eventObject = events[genre]["list"];
            const numEvents = eventObject.length;
            let randomNumber = Math.floor(Math.random() * numEvents);
            let event = eventObject[randomNumber];
            if (events[genre].slots.includes(startTime)) {
                let intervalObject = { start: 0, end: 0 };
                intervalObject.start = startTime;
                let activity = {
                    time: startTime + ":00",
                    title: `${event.name}`,
                    imageUrl:
                        "https://tih-api.stb.gov.sg/media/v1/download/uuid/10132baf126c20d4a988f0fd30b40a2680d?apikey=nmT0RwW609qcZImBPQY2cLEG6NcowaKW",
                    description: (
                        <ReadMore
                            numberOfLines={4}
                            renderTruncatedFooter={renderTruncatedFooter}
                            renderRevealedFooter={renderRevealedFooter}
                        >
                            <Text>
                                {event.location} {"\n\n"} {event.description}
                            </Text>
                        </ReadMore>
                    ),

                    id: genre,
                };
                data.push(activity);
                testEvents.splice(i, 1);
                console.log(testEvents);
                startTime += events[genre]["duration"];
                intervalObject.end =
                    startTime > timeline[1] ? timeline[1] : startTime;
                timingsArray.push(intervalObject);
            }
        }
        if (food === 1 && startTime >= 18 && startTime < 20) {
            testEvents.push("hawker");
            food = 0;
        }
        if (num === testEvents.length) {
            startTime++;
        }
        num = testEvents.length; // in case the start time is too early and there are no time slots to schedule

        if (startTime >= timeline[1]) break;
    }
    return data;
};