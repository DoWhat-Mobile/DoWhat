import React from "react";
import { Text } from "react-native";
import ReadMore from "react-native-read-more-text";

const filterHelper = (filters) => {
    if (testEvents[i] === "food") {
        const genre = filters.cuisine.includes("Local")
            ? "hawker"
            : filters.cuisine.includes("Cafe")
            ? "cafes"
            : "restaurants";
        if (events[genre].slots.includes(startTime)) {
            const eventList = events[genre]["list"];
            for (j = 0; j < eventList.length; j++) {
                if (
                    eventList[j].tags.includes(filters.area) &&
                    genre === "hawker"
                ) {
                    let intervalObject = { start: 0, end: 0 };
                    intervalObject.start = startTime;
                    data.push(objectFormatter(startTime, eventList[j], genre));
                    testEvents.splice(i, 1);
                    startTime += events[genre]["duration"];
                    intervalObject.end =
                        startTime > timeline[1] ? timeline[1] : startTime;
                    timingsArray.push(intervalObject);
                    break;
                }
            }
        }
    }
};

export const data_timeline = (timeline, testEvents, events, filters) => {
    const data = [];
    const timingsArray = [];
    let startTime = timeline[0];
    let num = testEvents.length;
    let eventArray = [];
    // filters.cuisine.includes("Local")
    // ? events["hawker"]["list"]
    // : filters.cuisine.includes("Cafe")
    // ? events["cafes"]["list"]
    // : events["restaurants"]["list"];
    for (i = 0; i < testEvents.length; i++) {
        const genre = testEvents[i];
        if (genre !== "food") {
            const eventObject = events[genre]["list"];
            const rand = Math.floor(Math.random() * eventObject.length);
            eventArray.push({ [genre]: events[genre]["list"][rand] });
        }
    }

    // checks if user selected food so dinner will be included if user has time 6pm onwards
    let food = testEvents.includes("food") && startTime <= 13 ? 1 : 0;

    // formats data array to be passed into Timeline library
    while (eventArray.length !== 0) {
        for (i = 0; i < eventArray.length; i++) {
            const genre = eventArray.map((x) => Object.keys(x)[0])[i];
            const event = eventArray[i][genre];
            if (events[genre].slots.includes(startTime)) {
                let intervalObject = { start: 0, end: 0 };
                intervalObject.start = startTime;

                data.push(objectFormatter(startTime, event, genre));
                eventArray.splice(i, 1);
                startTime += events[genre]["duration"];
                intervalObject.end =
                    startTime > timeline[1] ? timeline[1] : startTime;
                timingsArray.push(intervalObject);
            }
        }
        if (food === 1 && startTime >= 18 && startTime < 20) {
            eventArray.push("hawker");
            food = 0;
        }
        if (num === eventArray.length) {
            startTime++;
        }
        num = eventArray.length; // in case the start time is too early and there are no time slots to schedule

        if (startTime >= timeline[1]) break;
    }

    return [data, timingsArray];
};

/**
 * formats data array for three random events to be shown on reshuffle
 */
export const data_shuffle = (events, unsatisfied, time) => {
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
    data = [];
    for (i = 0; i < 3; i++) {
        const eventObject = events[unsatisfied]["list"];

        let randomNumber = Math.floor(Math.random() * eventObject.length);
        let event = eventObject[randomNumber];
        let obj = {
            title: event.name,
            time: time,

            description: (
                <ReadMore
                    numberOfLines={3}
                    renderTruncatedFooter={renderTruncatedFooter}
                    renderRevealedFooter={renderRevealedFooter}
                >
                    <Text>
                        {event.location} {"\n\n"} {event.description}
                    </Text>
                </ReadMore>
            ),
            id: unsatisfied,
        };
        data.push(obj);
    }
    return data;
};

const objectFormatter = (startTime, event, genre) => {
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
    return {
        time: startTime + ":00",
        title: `${event.name}`,
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
};
