import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { connect } from "react-redux";
import { WEATHER_API_KEY } from "react-native-dotenv";
import firebase from "../database/firebase";
import { findOverlappingIntervals } from "../reusable-functions/OverlappingIntervals";
import {
    data_timeline,
    genreEventObjectArray,
} from "../reusable-functions/DataTimeline";

const Loading = (props) => {
    const [freeTime, setFreeTime] = React.useState([]);
    const [weather, setWeather] = React.useState("");
    const [isWeatherLoading, setWeatherLoading] = React.useState(true);
    const [isTimingsLoading, setTimingsLoading] = React.useState(true);

    const route = props.route.params.route;
    const synced = props.route.params.synced;
    const userGenres =
        route === "board" ? props.route.params.genres : props.finalGenres[0];

    const filters =
        route === "board" ? props.route.params.filters : props.finalGenres[2];
    const accessRights = props.route.params.access;
    // Finalized time availability array to schedule events
    const timeline =
        route === "board"
            ? props.route.params.timeInterval // From collab board
            : props.route.params.synced === "synced"
                ? props.route.params.time
                : props.finalGenres[1]; // From Redux state

    console.log(timeline)

    React.useEffect(() => {
        const diff = props.difference;
        const userId = firebase.auth().currentUser.uid; //Firebase UID of current user
        firebase
            .database()
            .ref("users/" + userId)
            .once("value")
            .then((snapshot) => {
                const userData = snapshot.val();
                const allAttendees = userData.all_attendees; // Undefined if no friends synced their Gcal
                const mainUserBusyPeriod =
                    userData.busy_periods == undefined
                        ? props.finalTiming
                        : userData.busy_periods;
                const finalizedTimeRange = findOverlappingIntervals(
                    allAttendees,
                    mainUserBusyPeriod
                );
                // Returns finalized available range [20,24]
                return finalizedTimeRange;
            })
            .then((resultRange) => {
                // resultRange is undefined if no friends synced their Gcal
                setFreeTime(resultRange); // Set state
                setTimingsLoading(false);
            })
            .catch((err) => {
                // Error occurs when no friends synced their Gcal, then we will use the route input timings
                setFreeTime(props.finalTiming);
                setTimingsLoading(false);
            });
        fetch(
            "https://api.openweathermap.org/data/2.5/onecall?lat=1.290270&lon=103.851959&%20exclude=hourly,daily&appid=" +
            WEATHER_API_KEY
        )
            .then((response) => response.json())
            .then((data) => {
                const value = data["daily"][diff]["weather"][0]["main"];
                setWeather(value);
                setWeatherLoading(false);
            });
    }, []);

    const favFormatter = (fav) => {
        return fav.map((item) => {
            let {
                ["title"]: name,
                ["favourited"]: fav,
                ["selected"]: selected,
                ["votes"]: votes,
                ["imageURL"]: image,
                ["genre"]: genre,
                ...rest
            } = item[0];
            rest.name = name;
            rest.image = image;
            rest.fav = 1;
            return { [genre]: rest };
        });
    };

    // Generates all events for the user taking into account which route the user came from
    const allData = () => {
        if (props.allEvents) {
            const time = route === "link" ? freeTime : timeline;
            let currentEvents = genreEventObjectArray(
                userGenres,
                props.allEvents,
                filters,
                weather,
                time[1]
            );
            console.log(time);
            if (props.fav.length !== 0) {
                currentEvents = favFormatter(props.fav).concat(currentEvents);
            } else if (
                route === "board" &&
                Object.keys(props.route.params.topVotedEvent).length != 0
            ) {
                currentEvents = favFormatter([
                    props.route.params.topVotedEvent,
                ]).concat(currentEvents);
            }
            const allEvents =
                props.route.params.currentEvents == undefined
                    ? data_timeline(time, props.allEvents, currentEvents)
                    : props.route.params.currentEvents;

            storeFinalizedEventsInCollabBoard(allEvents);
            return allEvents;
        }
    };

    // Add to firebase so all collaboration board invitees see the same finalized timeline
    const storeFinalizedEventsInCollabBoard = (currentEvents) => {
        if (route !== "board") return;
        var updates = {};
        updates["finalized_timeline"] = currentEvents;

        // Only get finalized timeline ONCE, if timeline alr exists, dont update
        if (props.route.params.board.hasOwnProperty("finalized_timeline")) {
            return;
        }

        firebase
            .database()
            .ref("collab_boards/" + props.route.params.boardID) // Board ID passed from ListOfPlans.js
            .update(updates);
    };

    const onComplete = () => {
        props.navigation.navigate("Finalized", {
            route: route, // 'board' | 'manual'
            access: accessRights, // 'host
            weather: weather,
            synced: synced,
            data: allData(),
            userGenres: userGenres,
            filters: filters,
            board: props.route.params.board,
        });
    };
    if (isWeatherLoading || isTimingsLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    alignContent: "center",
                    justifyContent: "center",
                }}
            >
                <ActivityIndicator
                    style={{ alignSelf: "center" }}
                    size="large"
                />
            </View>
        );
    } else {
        onComplete();
        return null;
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },
});

const mapStateToProps = (state) => {
    return {
        finalGenres: state.genre.genres,
        finalTiming: state.timeline.finalTiming,
        allEvents: state.add_events.events,
        difference: state.date_select.difference,
        fav: state.favourite_events.favouriteEvents,
    };
};

export default connect(mapStateToProps, null)(Loading);
