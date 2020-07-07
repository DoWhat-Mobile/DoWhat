import React, { useState, useEffect } from "react";
import {
    TouchableOpacity, View, Button, Platform, Text, StyleSheet, Image, ImageBackground,
    Modal, ActivityIndicator, ScrollView, FlatList, SafeAreaView
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { connect } from "react-redux";
import { selectDate } from "../actions/date_select_action";
import AvailabilityInputModal from "./AvailabilityInputModal";
import firebase from "../database/firebase";
import Genre from "../components/genre/Genre";
import { getBusyPeriodFromGoogleCal } from "../reusable-functions/GoogleCalendarGetBusyPeriods";
import { AntDesign } from "@expo/vector-icons";
import * as Location from "expo-location";
import Calendar from './Calendar';

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
    const [mode, setMode] = useState("date");
    const [show, setShow] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isFinalized, setIsFinalized] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false); // Input avails button
    const [location, setLocation] = useState(null);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestPermissionsAsync();
            if (status !== "granted") {
                console.log("denied");
                // setErrorMsg("Permission to access location was denied");
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
            setLoading(false);
        })();
    }, []);

    let synced = isButtonDisabled ? "synced" : "manual";

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

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === "ios");
        setDate(currentDate);
        props.selectDate(currentDate); // Set date in redux state
    };

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    };

    const showDatepicker = () => {
        showMode("date");
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

    const upperContent = () => {
        return (
            <View>
                {show && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        timeZoneOffsetInMinutes={0}
                        value={date}
                        mode={mode}
                        is24Hour={true}
                        display="calendar"
                        minimumDate={new Date()}
                        onChange={onChange}
                    />
                )}

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
                    <Text style={styles.header}>Plan Event On</Text>

                    <TouchableOpacity
                        style={{ marginBottom: 5 }}
                        onPress={() => showDatepicker()}
                    >
                        <Text style={styles.date}>
                            {formatDate(
                                date.getDay(),
                                date.getMonth(),
                                date.getDate()
                            )}
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.availsInput}>
                        <Text style={styles.header}>Availabilities</Text>
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <Text style={styles.date}>
                                {isFinalized
                                    ? "Successfully inputted"
                                    : "Input range"}
                            </Text>
                        </TouchableOpacity>
                        {renderInputAvailabilitiesButton()}
                    </View>
                </View>

                <View style={{ flex: 1 }}>
                    <Calendar />
                </View>
            </View>
        )
    }

    const lowerContent = () => {
        return (
            <View style={{ flex: 0, marginBottom: 80 }}>
                <Genre
                    syncWithFirebaseThenNavigate={
                        syncWithFirebaseThenNavigate
                    }
                />
            </View>
        )
    }

    return (
        // <SafeAreaView style={{ flex: 1 }}>
        //     <FlatList
        //         data={['0', '1']}
        //         keyExtractor={(data) => data}
        //         renderItem={({ item, index }) => {
        //             switch (index) {
        //                 case 0:
        //                     return upperContent()
        //                 case 1:
        //                     return lowerContent()
        //                 default:
        //                     return null;
        //             }
        //         }}
        //     // ListHeaderComponent={upperContent}
        //     // ListFooterComponent={lowerContent} 
        //     />
        // </SafeAreaView>
        <ScrollView horizontal={false} style={styles.container}>
            {show && (
                <DateTimePicker
                    testID="dateTimePicker"
                    timeZoneOffsetInMinutes={0}
                    value={date}
                    mode={mode}
                    is24Hour={true}
                    display="calendar"
                    minimumDate={new Date()}
                    onChange={onChange}
                />
            )}

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
                <Text style={styles.header}>Plan Event On</Text>

                <TouchableOpacity
                    style={{ marginBottom: 5 }}
                    onPress={() => showDatepicker()}
                >
                    <Text style={styles.date}>
                        {formatDate(
                            date.getDay(),
                            date.getMonth(),
                            date.getDate()
                        )}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={{ flex: 3 }}>
                <Calendar />
            </View>

                <View style={styles.availsInput}>
                    <Text style={styles.header}>Availabilities</Text>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Text style={styles.date}>
                            {isFinalized
                                ? "Successfully inputted"
                                : "Input range"}
                        </Text>
                    </TouchableOpacity>
                    {renderInputAvailabilitiesButton()}
                </View>

            <View style={{ flex: 0, marginBottom: 80 }}>
                <Genre
                    syncWithFirebaseThenNavigate={
                        syncWithFirebaseThenNavigate
                    }
                />
            </View>
        </ScrollView>
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
};

export default connect(mapStateToProps, mapDispatchToProps)(DateSelection);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        fontWeight: "200",
        fontSize: 20,
        color: "black",
        borderTopEndRadius: 5,
        paddingRight: 10,
        paddingLeft: 10,
    },
    date: {
        textDecorationLine: "underline",
        fontSize: 18,
        color: "black",
        borderTopEndRadius: 5,
        paddingRight: 10,
        paddingLeft: 35,
    },
    dateInput: {
        flex: 1,
        alignContent: "flex-start",
        alignItems: "flex-start",
        marginTop: "20%",
        marginLeft: "5%",
    },
    availsInput: {
        marginLeft: "5%",
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
