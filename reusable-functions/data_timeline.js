import React from "react";
import { Text } from "react-native";
import ReadMore from "react-native-read-more-text";

/**
 * handles filter for food to be added in data array. Returns array of data that is formatted to be passed as props into
 * timeline library, and timings array of start time and end time of each array, and location of each event
 */
const filterHelper = (filters, events) => {
    const genre = filters.cuisine.includes("Local")
        ? "hawker"
        : filters.cuisine.includes("Cafe")
        ? "cafes"
        : "restaurants";

    const eventList = events[genre]["list"];
    // so there will be a variety of places to choose from
    let temp = [];
    for (i = 0; i < eventList.length; i++) {
        if (genre === "hawker" && eventList[i].tags.includes(filters.area))
            temp.push(eventList[i]);

        if (
            genre === "cafes" &&
            eventList[i].tags.includes(filters.area) &&
            eventList[i].price_level <= filters.price
        )
            temp.push(eventList[i]);

        if (
            genre === "restaurants" &&
            eventList[i].tags.includes(filters.area) &&
            eventList[i].cuisine.includes(filters.cuisine)
        )
            temp.push(eventList[i]);
    }
    let rand = Math.floor(Math.random() * temp.length);
    return { [genre]: temp[rand] };
};

const genreEventObjectArray = (testEvents, events, filters) => {
    let eventArray = [];
    if (testEvents.includes("food")) {
        eventArray.push(filterHelper(filters, events));
    }
    for (i = 0; i < testEvents.length; i++) {
        const genre = testEvents[i];
        if (genre !== "food") {
            const eventObject = events[genre]["list"];
            const rand = Math.floor(Math.random() * eventObject.length);
            eventArray.push({ [genre]: events[genre]["list"][rand] });
        }
    }
    return eventArray;
};

export const data_timeline = (timeline, testEvents, events, filters) => {
    const data = [];
    const timingsArray = [];
    let startTime = timeline[0];
    let num = testEvents.length;
    let eventArray = genreEventObjectArray(testEvents, events, filters);
    let locationArray = [];

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

                locationArray.push(event.coord);

                data.push(objectFormatter(startTime, event, genre));
                eventArray.splice(i, 1);
                startTime += events[genre]["duration"];

                intervalObject.end =
                    startTime > timeline[1] ? timeline[1] : startTime;
                timingsArray.push(intervalObject);
            }
        }
        if (food === 1 && startTime >= 18 && startTime < 20) {
            eventArray.push({ hawker: events["hawker"]["list"][4] });
            food = 0;
        }
        if (num === eventArray.length) {
            startTime++;
        }
        num = eventArray.length; // in case the start time is too early and there are no time slots to schedule

        if (startTime >= timeline[1]) break;
    }

    return [data, timingsArray, locationArray];
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
        // ensure no duplicate objects
        const checkName = (obj) => obj.title === event.name;
        if (!data.some(checkName)) data.push(obj);
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
