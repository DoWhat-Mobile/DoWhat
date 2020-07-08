import React, { useState, useEffect } from "react";
import {
    TouchableOpacity, View, Text, StyleSheet,
    Modal, ActivityIndicator,
} from "react-native";
import { connect } from "react-redux";
import { selectDate } from "../actions/date_select_action";
import { extractCalendarEvents } from "../actions/auth_screen_actions"
import AvailabilityInputModal from "./AvailabilityInputModal";
import firebase from "../database/firebase";
import Genre from "../components/genre/Genre";
import { getBusyPeriodFromGoogleCal, checkIfTokenExpired } from "../reusable-functions/GoogleCalendarGetBusyPeriods";
import { OAuthConfig } from "../reusable-functions/GoogleAuthentication";
import { AntDesign } from "@expo/vector-icons";
import * as Location from "expo-location";
import Calendar from './Calendar';
import * as AppAuth from "expo-app-auth";
import { REACT_APP_GOOGLE_API_KEY } from 'react-native-dotenv';

export const formatDate = (day, month, date) => {
    const possibleDays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wenesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    const possibleMonths = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const curDay = possibleDays[day];
    const curMonth = possibleMonths[month];
    return curDay + ", " + curMonth + " " + date;
};

/**
 * DateSelection Page is where user inputs availablilities, selected date, as well as outing
 * preferences. 
 */
const DateSelection = (props) => {
    const [date, setDate] = useState(new Date()); // new Date() gives today's date
    const [modalVisible, setModalVisible] = useState(false);
    const [isFinalized, setIsFinalized] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false); // Input avails button
    const [location, setLocation] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [currUserCalendarEvents, setCurrUserCalendarEvents] = useState([]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestPermissionsAsync();
            if (status !== "granted") {
                console.log("denied");
                // setErrorMsg("Permission to access location was denied");
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })()
            .then(() => {
                addGcalEventsToRedux();
            });
    }, []);

    let synced = isButtonDisabled ? "synced" : "manual";

    // Events that are already in the current user's Google calendar
    const addGcalEventsToRedux = async () => {
        firebase.database().ref('users/' + props.userID)
            .once("value")
            .then((snapshot) => {
                const userData = snapshot.val();
                const token = {
                    accessToken: userData.access_token,
                    refreshToken: userData.refresh_token,
                    accessTokenExpirationDate:
                        userData.access_token_expiration,
                };
                makeGcalAPICall(token);

            })
    }

    const makeGcalAPICall = async (token) => {
        // Ensure access token validity
        var accessToken = token.accessToken;
        accessToken = (
            await AppAuth.refreshAsync(OAuthConfig, token.refreshToken)
        ).accessToken;
        if (checkIfTokenExpired(token.accessTokenExpirationDate)) {
            // Use refresh token to generate new access token if access token has expired
            accessToken = (
                await AppAuth.refreshAsync(OAuthConfig, token.refreshToken)
            ).accessToken;
        }

        // Get the time range to extract events from
        const todayDate = (new Date()).toISOString().substring(0, 10);
        var oneWeekFromToday = new Date();
        oneWeekFromToday.setDate(oneWeekFromToday.getDate() + 7);
        const weekLater = oneWeekFromToday.toISOString().substring(0, 10);

        try {
            fetch(
                "https://www.googleapis.com/calendar/v3/calendars/primary/events?" + // Fetch from primary calendar 
                "timeMax=" + weekLater + "T23%3A59%3A00%2B08%3A00&" + //23:59hrs
                "timeMin=" + todayDate + "T00%3A00%3A00%2B08%3A00&" + // 00:00hrs 
                "prettyPrint=true&key=" + REACT_APP_GOOGLE_API_KEY,
                {
                    method: "GET",
                    headers: new Headers({
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + accessToken,
                    }),
                }
            )
                .then((response) => response.json())
                .then((data) => {
                    const allEventsArr = data.items;
                    console.log("API call successful: ", allEventsArr)
                    props.extractCalendarEvents(data.items) // Add events to redux state
                    setCurrUserCalendarEvents(data.items);
                    console.log("Current User's events:", currUserCalendarEvents)
                    setLoading(false);
                });
        } catch (e) {
            console.log(e);
        }
    }

    const inputAvailabilities = () => {
        getBusyPeriodFromGoogleCal(props.userID, date); // User ID comes from Redux state
        setIsButtonDisabled(true); // Prevent syncing google calendar twice
    };

    const renderInputAvailabilitiesButton = () => {
        if (isButtonDisabled) {
            return (
                <View>
                    <TouchableOpacity
                        style={[
                            styles.finalizeButton,
                            {
                                borderRadius: 20,
                                backgroundColor: "#2a9d8f",
                                borderWidth: 0.2,
                            },
                        ]}
                        disabled={true}
                        onPress={() => finalizeBoard()}
                    >
                        <AntDesign
                            name="check"
                            size={20}
                            style={{ color: "white" }}
                        />
                        <Text style={{ color: "white", marginLeft: 5 }}>
                            Availabilities Inputted
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <TouchableOpacity
                    style={styles.finalizeButton}
                    onPress={() => inputAvailabilities()}
                    disabled={isButtonDisabled}
                >
                    <Text>Sync Google Calendar</Text>
                </TouchableOpacity>
            );
        }
    };

    // Passed to Calendar.js child component
    const onDateChange = (selectedDate) => {
        const tail = (new Date()).toISOString().substring(10);
        const formattedDateString = selectedDate + tail;
        const formattedDate = new Date(formattedDateString);
        setDate(formattedDate);
        props.selectDate(formattedDate); // Set date in redux state
    }

    const addSelectedDateToFirebase = () => {
        const userId = firebase.auth().currentUser.uid;
        firebase
            .database()
            .ref("users/" + userId)
            .child("selected_date")
            .set(date.toDateString()); // date comes from component's state
    };

    const syncWithFirebaseThenNavigate = () => {
        addSelectedDateToFirebase();
        if (props.route.params.route === "manual") {
            props.navigation.navigate("Loading", {
                route: "manual",
                access: "host",
                synced: synced,
                userLocation: location,
            });
        } else {
            props.navigation.navigate("FriendInput", {
                route: props.route.params.route,
            });
        }
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    const onFinalize = () => {
        setIsFinalized(true);
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator size='large' />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    closeModal();
                }}
            >
                <AvailabilityInputModal
                    onClose={closeModal}
                    date={date}
                    onFinalize={onFinalize}
                    styledDate={formatDate(
                        date.getDay(),
                        date.getMonth(),
                        date.getDate()
                    )}
                />
            </Modal>
            <View style={styles.dateInput}>
                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <Text style={styles.header}>Plan Event On: </Text>
                    <Text style={styles.date}>
                        {formatDate(
                            date.getDay(),
                            date.getMonth(),
                            date.getDate()
                        )}
                    </Text>
                </View>
            </View>
            <View style={styles.calendar}>
                <Calendar currDate={new Date()} onDateChange={onDateChange} userEvents={currUserCalendarEvents} />
            </View>


            <View style={styles.availsInput}>
                <Text style={[styles.header, { color: '#F9F0E6', textAlign: 'center' }]}>
                    Input your available timings
                </Text>
                <View style={{ flexDirection: "row", justifyContent: 'space-evenly' }}>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Text style={[styles.date, { color: '#F9F0E6' }]}>
                            {isFinalized
                                ? "Successfully inputted"
                                : "Input range"}
                        </Text>
                    </TouchableOpacity>
                    {renderInputAvailabilitiesButton()}
                </View>
            </View>

            <View style={styles.genreSelection}>
                <Genre
                    syncWithFirebaseThenNavigate={
                        syncWithFirebaseThenNavigate
                    }
                />
            </View>
        </View>
    );
};
const mapStateToProps = (state) => {
    console.log("Redux state events is : ", state.add_events.currUserCalendarEvents)
    return {
        userID: state.add_events.userID,
        currUserName: state.add_events.currUserName,
    };
};
const mapDispatchToProps = {
    selectDate, extractCalendarEvents
};

export default connect(mapStateToProps, mapDispatchToProps)(DateSelection);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        fontWeight: "bold",
        fontSize: 20,
        fontFamily: 'serif',
        borderTopEndRadius: 5,
        paddingRight: 10,
        paddingLeft: 10,
        color: 'black'
    },
    date: {
        fontWeight: "500",
        fontSize: 20,
        fontFamily: 'serif',
        paddingRight: 10,
        color: 'black',
        textDecorationLine: 'underline'
    },
    dateInput: {
        flex: 1,
        alignContent: "flex-start",
        alignItems: "flex-start",
    },
    availsInput: {
        flex: 2,
        borderRadius: 30,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        backgroundColor: '#F28333',
    },
    calendar: {
        flex: 7,
    },
    genreSelection: {
        flex: 5, backgroundColor: "#F28333"
    },
    button: {
        fontSize: 20,
        borderWidth: 0.2,
        textAlign: "center",
        borderRadius: 10,
        backgroundColor: "#cc5327",
        color: "#fcf5f2",
    },
    body: {
        flex: 5,
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
    },
    item: {
        backgroundColor: 'white',
        flex: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginTop: 17
    },
    emptyDate: {
        height: 15,
        flex: 1,
        paddingTop: 30
    }
});
