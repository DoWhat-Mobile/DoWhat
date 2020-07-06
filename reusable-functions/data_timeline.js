import React from "react";
import { Text } from "react-native";
import ReadMore from "react-native-read-more-text";
import { parse } from "expo-linking";

/**
 * handles filter for food to be added in data array. Returns array of data that is formatted to be passed as props into
 * timeline library, and timings array of start time and end time of each array, and location of each event
 * @param {*} filters in array of area price and cuisine the user selected
 * @param {*} events are all the events
 */
export const filterHelper = (filters, events) => {
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
        if (genre === "hawker" && filters.area.some(areaFilter)) {
            temp.push(event);
        } else if (
            genre === "cafes" &&
            filters.area.some(areaFilter) &&
            event.price_level == filters.price
        ) {
            temp.push(event);
        } else if (
            genre === "restaurants" &&
            filters.area.some(areaFilter) &&
            event.price_level == filters.price &&
            filters.cuisine.some(cuisineFilter)
        ) {
            temp.push(event);
        }
    }
    if (temp.length == 0) {
        for (i = 0; i < eventList.length; i++) {
            const event = eventList[i];
            const cuisineFilter = (element) =>
                event.cuisine.toString().includes(element);
            const areaFilter = (element) => event.tags.includes(element);
            if (genre === "hawker" && filters.area.some(areaFilter)) {
                temp.push(event);
            } else if (
                genre === "cafes" &&
                filters.area.some(areaFilter) &&
                event.price_level < filters.price
            ) {
                temp.push(event);
            } else if (
                genre === "restaurants" &&
                filters.area.some(areaFilter) &&
                event.price_level < filters.price &&
                filters.cuisine.some(cuisineFilter)
            ) {
                temp.push(event);
            }
        }
    }
    if (temp.length == 0) {
        temp.push(eventList[0]);
    }

    let rand = Math.floor(Math.random() * temp.length);
    return { [genre]: temp[rand] };
};

export const genreEventObjectArray = (userGenres, events, filters, weather) => {
    let currentEvents = [];

    if (userGenres.includes("food")) {
        const filterObject = filterHelper(filters, events);
        currentEvents.push(filterObject);
    }
    if (weather === "Rain" || weather === "Thunderstorm") {
        for (i = 0; i < userGenres.length; i++) {
            const genre = userGenres[i] === "food" ? "food" : "indoors";
            if (genre !== "food") {
                const eventObject = events[genre]["list"];
                const rand = Math.floor(Math.random() * eventObject.length);
                const event = events[genre]["list"][rand];
                currentEvents.push({ [genre]: event });
            }
        }
    } else {
        for (i = 0; i < userGenres.length; i++) {
            const genre = userGenres[i];
            if (genre !== "food") {
                const eventObject = events[genre]["list"];
                const rand = Math.floor(Math.random() * eventObject.length);
                currentEvents.push({ [genre]: events[genre]["list"][rand] });
            }
        }
    }
    return currentEvents;
};

/**
 * Returns data needed for the timeline library, a timings array to be used to schedule the calendar and a location array with
 * long lat objects of the events scheduled for the user
 * @param {*} timeline is the array that stores the user's available time range
 * @param {*} userGenres is the genres the user picked
 * @param {*} events is the database of all events
 * @param {*} filters is the food filters the user selected
 */
export const data_timeline = (timeline, userGenres, events, currentEvents) => {
    const data = [];
    const timingsArray = [];
    let startTime = timeline[0];
    let num = userGenres.length;
    let locationArray = [];
    // checks if user selected food so dinner will be included if user has time 6pm onwards
    let food = userGenres.includes("food") && startTime <= 13 ? 1 : 0;
    let busRoutes = [];

    // formats data array to be passed into Timeline library
    while (currentEvents.length !== 0) {
        for (i = 0; i < currentEvents.length; i++) {
            const genre = currentEvents.map((x) => Object.keys(x)[0])[i];
            const event = currentEvents[i][genre];
            if (events[genre].slots.includes(startTime)) {
                if (startTime + events[genre]["duration"] >= timeline[1]) {
                    break;
                }
                let intervalObject = { start: "", end: "" };
                intervalObject.start = startTime.toString() + ":00";
                locationArray.push({ coord: event.coord, name: event.name });
                busRoutes.push(event.location);

                data.push({ startTime: startTime, event: event, genre: genre });
                //data.push(objectFormatter(startTime, event, genre));
                currentEvents.splice(i, 1);
                startTime += events[genre]["duration"];

                intervalObject.end =
                    startTime > timeline[1]
                        ? timeline[1].toString() + ":00"
                        : startTime + ":00";
                timingsArray.push(intervalObject);
            }
        }

        if (num === currentEvents.length) {
            startTime++;
        }
        num = currentEvents.length; // in case the start time is too early and there are no time slots to schedule

        if (food === 1 && startTime >= 18 && startTime < 20) {
            currentEvents.push({ hawker: events["hawker"]["list"][4] });
            food = 0;
        }

        if (startTime >= timeline[1] - 1) break;
    }
    console.log(timingsArray);
    return [data, timingsArray, locationArray, busRoutes];
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
        let text = event.tags.includes("Indoors")
            ? event.location + " " + "(Indoors)"
            : event.location;
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
                        {text} {"\n\n"}
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
export const objectFormatter = (startTime, event, genre) => {
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
    let text = event.tags.includes("Indoors")
        ? event.location + " " + "(Indoors)"
        : event.location;
    return {
        time: startTime + ":00",
        title: event.name,

        description: (
            <ReadMore
                numberOfLines={4}
                renderTruncatedFooter={renderTruncatedFooter}
                renderRevealedFooter={renderRevealedFooter}
            >
                <Text>
                    {text}
                    {"\n\n"}
                    {event.description}
                </Text>
            </ReadMore>
        ),

        genre: genre,
        coord: event.coord,
    };
};

const startEndChange = (newTimeObject, hourDifference, minuteDifference) => {
    const newStartHour =
        parseInt(newTimeObject.start.substring(0, 2)) + hourDifference >= 24
            ? "00"
            : parseInt(newTimeObject.start.substring(0, 2)) + hourDifference;

    const newStartTime = newStartHour + ":" + minuteDifference;

    const newEndHour =
        parseInt(newTimeObject.end.substring(0, 2)) + hourDifference >= 24
            ? "00"
            : parseInt(newTimeObject.end.substring(0, 2)) + hourDifference;

    const newEndTime = newEndHour + ":" + minuteDifference;
    return { start: newStartTime, end: newEndTime };
};

export const handleRipple = (newTimingsArray, newStartTime, index) => {
    const hourDifference =
        parseInt(newStartTime.substring(0, 2)) -
        parseInt(newTimingsArray[index].start.substring(0, 2));
    // in case user inputs wrong extreme time
    if (Math.abs(hourDifference) >= 5) return newTimingsArray;
    const minuteDifference = newStartTime.substring(3, 5);

    // case when user changes start time from {start: 12, end: 15} to {start: >= 15, end: 15};
    if (
        hourDifference > 0 &&
        parseInt(newStartTime.substring(0, 2)) >=
            parseInt(newTimingsArray[index].end.substring(0, 2))
    ) {
        for (i = index; i < newTimingsArray.length; i++) {
            newTimingsArray[i] = startEndChange(
                newTimingsArray[i],
                hourDifference,
                minuteDifference
            );
        }
    }

    // case when user changes start time from {start: 12, end: 15} to {start: 13 or 14, end: 15};
    else if (hourDifference > 0 && index != 0) {
        newTimingsArray[index].start = newStartTime;
        newTimingsArray[index - 1].end = newStartTime;
    } else if (hourDifference > 0 && index == 0) {
        newTimingsArray[index].start = newStartTime;
    }
    // case when user changes start time from {start: 15, end: 19} to {start: 13 or 14, end: 19}
    // and the previous timing is {start: 12, end: 15} (eats into previous end time)
    else if (
        hourDifference < 0 &&
        index != 0 &&
        parseInt(newStartTime.substring(0, 2)) >
            parseInt(newTimingsArray[index - 1].start.substring(0, 2))
    ) {
        newTimingsArray[index].start = newStartTime;
        newTimingsArray[index - 1].end = newStartTime;
    }

    // case when user changes start time from {start: 15, end: 19} to {start: 12, end: 19}
    // and previous timings is {start: 12, end: 15} (eats into previous start time)
    else if (
        hourDifference < 0 &&
        index != 0 &&
        parseInt(newStartTime.substring(0, 2)) <=
            parseInt(newTimingsArray[index - 1].start.substring(0, 2))
    ) {
        for (i = index; i >= 0; i--) {
            newTimingsArray[i] = startEndChange(
                newTimingsArray[i],
                hourDifference,
                minuteDifference
            );
        }
    } else if (hourDifference < 0 && index == 0) {
        newTimingsArray[index].start = newStartTime;
    } else {
        newTimingsArray[index].start = newStartTime;
    }
    return newTimingsArray;
};
