import React from "react";
import { Text } from "react-native";
import ReadMore from "react-native-read-more-text";

/**
 * handles filter for food to be added in data array. Returns array of data that is formatted to be passed as props into
 * timeline library, and timings array of start time and end time of each array, and location of each event
 * @param {*} filters in array of area price and cuisine the user selected
 * @param {*} events are all the events
 */
const filterHelper = (filters, events) => {
    const genre = filters.cuisine.includes("Hawker")
        ? "hawker"
        : filters.cuisine.includes("Cafe")
        ? "cafes"
        : "restaurants";

    const eventList = events[genre]["list"];
    // so there will be a variety of places to choose from
    let temp = [];
    for (i = 0; i < eventList.length; i++) {
        const event = eventList[i];
        const cuisineFilter = (element) =>
            event.cuisine.toString().includes(element);
        const areaFilter = (element) => event.tags.includes(element);
        if (genre === "hawker" && filters.area.some(areaFilter))
            temp.push(event);

        if (
            genre === "cafes" &&
            filters.area.some(areaFilter) &&
            event.price_level <= filters.price
        )
            temp.push(event);

        if (
            genre === "restaurants" &&
            filters.area.some(areaFilter) &&
            event.price_level <= filters.price &&
            filters.cuisine.some(cuisineFilter)
        )
            temp.push(event);

        if (event.price_level > filters.price) temp.push(event);
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

/**
 * Returns data needed for the timeline library, a timings array to be used to schedule the calendar and a location array with
 * long lat objects of the events scheduled for the user
 * @param {*} timeline is the array that stores the user's available time range
 * @param {*} testEvents is the genres the user picked
 * @param {*} events is the database of all events
 * @param {*} filters is the food filters the user selected
 */
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
                let intervalObject = { start: "", end: "" };
                intervalObject.start = startTime.toString() + ":00";

                locationArray.push({ coord: event.coord, name: event.name });

                data.push(objectFormatter(startTime, event, genre));
                eventArray.splice(i, 1);
                startTime += events[genre]["duration"];

                intervalObject.end =
                    startTime > timeline[1]
                        ? timeline[1].toString() + ":00"
                        : startTime + ":00";
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
 * Formats the object to be shown in the reshuffle modal
 * @param {*} events are all the events stored in the database
 * @param {*} genres is the array of genres that the user selected
 * @param {*} time is the time interval free period of the user
 * @param {*} unsatisfied is the genre of the event that the user is reselecting
 */
export const data_shuffle = (events, genres, time, unsatisfied) => {
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
    let data = [];
    let selectable = [];
    for (i = 0; i < genres.length; i++) {
        let type = genres[i].toString();
        if (type === "food") {
            Array.prototype.push.apply(selectable, events["hawker"]["list"]);
            Array.prototype.push.apply(selectable, events["cafes"]["list"]);
            Array.prototype.push.apply(
                selectable,
                events["restaurants"]["list"]
            );
        } else {
            Array.prototype.push.apply(selectable, events[type]["list"]);
        }
    }
    for (i = 0; i < 3; i++) {
        let randomNumber = Math.floor(Math.random() * selectable.length);
        let event = selectable[randomNumber];
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
                        {event.location} {"\n\n"}
                        {event.description}
                    </Text>
                </ReadMore>
            ),
            genre: unsatisfied,
            coord: event.coord,
        };
        // ensure no duplicate objects
        const checkName = (obj) => obj.title === event.name;
        if (!data.some(checkName)) data.push(obj);
    }
    return data;
};

/**
 * Creates the object with keys (time, title description) that the timeline library accepts
 */
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
        time: <Text>{startTime}:00</Text>,
        title: <Text>{event.name}</Text>,

        description: (
            <ReadMore
                numberOfLines={4}
                renderTruncatedFooter={renderTruncatedFooter}
                renderRevealedFooter={renderRevealedFooter}
            >
                <Text>
                    🔁
                    {"\n\n"}
                    {event.description}
                </Text>
            </ReadMore>
        ),

        genre: genre,
        coord: event.coord,
    };
};
