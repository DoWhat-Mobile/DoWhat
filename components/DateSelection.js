import React, { useState, useEffect } from "react";
import {
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    Modal,
    ActivityIndicator,
} from "react-native";
import { connect } from "react-redux";
import { selectDate, setLocation } from "../actions/date_select_action";
import { extractCalendarEvents } from "../actions/auth_screen_actions";
import AvailabilityInputModal from "./AvailabilityInputModal";
import firebase from "../database/firebase";
import Genre from "../components/genre/Genre";
import {
    getBusyPeriodFromGoogleCal,
} from "../reusable-functions/GoogleCalendarGetBusyPeriods";
import { AntDesign } from "@expo/vector-icons";
import * as Location from "expo-location";
import Calendar from "./Calendar";

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

    let synced = isButtonDisabled ? "synced" : "manual";

    const inputAvailabilities = () => {
        getBusyPeriodFromGoogleCal(props.userID, date); // User ID comes from Redux state
        setIsButtonDisabled(true); // Prevent syncing google calendar twice
    };

    const renderSyncCalendarButton = () => {
        if (isButtonDisabled) {
            return (
                <View>
                    <TouchableOpacity
                        style={[
                            styles.manualInputButton,
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
                    style={styles.manualInputButton}
                    onPress={() => inputAvailabilities()}
                    disabled={isButtonDisabled}
                >
                    <Text style={{ color: 'white' }}>
                        Sync Google Calendar
                        </Text>
                </TouchableOpacity>
            );
        }
    };

    // Passed to Calendar.js child component
    const onDateChange = (selectedDate) => {
        const tail = new Date().toISOString().substring(10);
        const formattedDateString = selectedDate + tail;
        const formattedDate = new Date(formattedDateString);
        setDate(formattedDate);
        props.selectDate(formattedDate); // Set date in redux state
    };

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
                <View style={{ flexDirection: "row", marginTop: 10 }}>
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
                <Calendar
                    currDate={new Date()}
                    onDateChange={onDateChange}
                />
            </View>

            <View style={styles.availsInput}>
                <Text
                    style={[
                        styles.header,
                        { color: "#F9F0E6", textAlign: "center", marginTop: 10 },
                    ]}
                >
                    Input your available timings
                </Text>
                <View style={{
                    flex: 0.8, justifyContent: 'space-around', borderBottomWidth: 0.5,
                    borderColor: '#F9F0E6'
                }}>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-evenly",
                        }}
                    >
                        <TouchableOpacity style={styles.manualInputButton}
                            onPress={() => setModalVisible(true)}>
                            <Text style={[styles.inputAvailabilities, { color: "#F9F0E6" }]}>
                                {isFinalized
                                    ? "Successfully inputted"
                                    : "Manual Input"}
                            </Text>
                        </TouchableOpacity>
                        {renderSyncCalendarButton()}
                    </View>
                </View>
            </View>

            <View style={styles.genreSelection}>
                <Genre
                    syncWithFirebaseThenNavigate={syncWithFirebaseThenNavigate}
                />
            </View>
        </View>
    );
};
const mapStateToProps = (state) => {
    return {
        userID: state.add_events.userID,
        currUserName: state.add_events.currUserName,
    };
};

const mapDispatchToProps = {
    selectDate,
    extractCalendarEvents,
    setLocation
};

export default connect(mapStateToProps, mapDispatchToProps)(DateSelection);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        fontWeight: "bold",
        fontSize: 20,
        fontFamily: "serif",
        borderTopEndRadius: 5,
        paddingRight: 10,
        paddingLeft: 10,
        color: "black",
    },
    date: {
        fontWeight: "500",
        fontSize: 20,
        fontFamily: "serif",
        paddingRight: 10,
        color: "black",
        textDecorationLine: "underline",
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
        backgroundColor: "#F28333",
    },
    calendar: {
        flex: 7,
    },
    genreSelection: {
        flex: 5,
        backgroundColor: "#F28333",
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
        backgroundColor: "white",
        flex: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginTop: 17,
    },
    manualInputButton: {
        borderWidth: 0.5,
        borderRadius: 5,
        padding: 3,
        paddingLeft: 6,
        paddingRight: 6,
        backgroundColor: '#244749'

    },
    emptyDate: {
        height: 15,
        flex: 1,
        paddingTop: 30,
    },
});
