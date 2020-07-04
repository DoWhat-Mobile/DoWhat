import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { connect } from "react-redux";
import { WEATHER_API_KEY } from "react-native-dotenv";
import firebase from "../database/firebase";
import { findOverlappingIntervals } from "../reusable-functions/OverlappingIntervals";
import {
    data_timeline,
    genreEventObjectArray,
} from "../reusable-functions/data_timeline";
import * as Location from "expo-location";

const Loading = (props) => {
    const [freeTime, setFreeTime] = React.useState([]);
    const [weather, setWeather] = React.useState("");
    const [isWeatherLoading, setWeatherLoading] = React.useState(true);
    const [isTimingsLoading, setTimingsLoading] = React.useState(true);
    const [location, setLocation] = React.useState(null);
    const [isLocationLoading, setLocationLoading] = React.useState(true);
    const route = props.route.params.route;
    const synced = props.route.params.synced;

    const userGenres =
        route === "board" ? props.route.params.genres : props.finalGenres[0];

    const filters =
        route === "board" ? props.route.params.filters : props.finalGenres[2];

    const manual = genreEventObjectArray(
        userGenres,
        props.allEvents,
        filters,
        weather
    );

    const timeline =
        route === "board"
            ? props.route.params.timeInterval
            : props.route.params.synced === "synced"
            ? props.route.params.time
            : props.finalGenres[1];

    const currentEvents =
        route === "board" ? props.route.params.currentEvents : manual;

    const data = data_timeline(
        timeline,
        userGenres,
        props.allEvents,
        currentEvents
    );

    // const data = data_timeline(
    //     timeline,
    //     userGenres,
    //     props.allEvents,
    //     currentEvents
    // );

    const routesArray = (userLocation, arr) => {
        let temp = [];
        temp.push(userLocation);
        return temp.concat(arr);
    };
    React.useEffect(() => {
        const diff = props.difference;
        const userId = firebase.auth().currentUser.uid; //Firebase UID of current user
        (async () => {
            let { status } = await Location.requestPermissionsAsync();
            if (status !== "granted") {
                console.log("denied");
                // setErrorMsg("Permission to access location was denied");
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
            setLocationLoading(false);
        })();
        firebase
            .database()
            .ref("users/" + userId)
            .once("value")
            .then((snapshot) => {
                const userData = snapshot.val();
                const allAttendees = userData.all_attendees; // Undefined if no friends synced their Gcal
                const mainUserBusyPeriod = userData.busy_periods;
                const finalizedTimeRange = findOverlappingIntervals(
                    allAttendees,
                    mainUserBusyPeriod
                );
                // Returns finalized available range [20,24]
                return finalizedTimeRange;
            })
            .then((resultRange) => {
                // resultRange is undefined if no friends synced their Gcal
                //console.log(resultRange);
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
                setWeather(data["daily"][diff]["weather"][0]["main"]);
                setWeatherLoading(false);
            });
    }, []);

    const onComplete = () =>
        props.navigation.navigate("Finalized", {
            route: route, //set manual for now
            access: "host", // set host for now
            weather: weather,
            synced: synced,
            time: freeTime,
            data: data,
            userGenres: userGenres,
            userLocation: routesArray(
                {
                    lat: location.coords.latitude,
                    long: location.coords.longitude,
                },
                data[3]
            ),
        });

    if (isWeatherLoading || isTimingsLoading || isLocationLoading) {
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
    };
};

export default connect(mapStateToProps, null)(Loading);
