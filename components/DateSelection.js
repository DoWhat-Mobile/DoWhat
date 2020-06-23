import React, { useState } from "react";
import {
    TouchableOpacity,
    View,
    Button,
    Platform,
    Text,
    StyleSheet,
    Image,
    ImageBackground,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { connect } from "react-redux";
import { selectDate } from "../actions/date_select_action";
import firebase from "../database/firebase";

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

const DateSelection = (props) => {
    const [date, setDate] = useState(new Date()); // new Date() gives today's date
    const [mode, setMode] = useState("date");
    const [show, setShow] = useState(false);

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
        props.navigation.navigate("GoogleCalendarInput");
    };

    return (
        <ImageBackground
            style={{ width: "100%", height: "100%", flex: 1, opacity: 0.8 }}
            source={require("../assets/Picnic.jpg")}
            resizeMode="cover"
        >
            <View style={styles.dateInput}>
                <Text style={styles.header}>Plan Event On</Text>

                <TouchableOpacity onPress={showDatepicker}>
                    <Text style={styles.date}>
                        {formatDate(
                            date.getDay(),
                            date.getMonth(),
                            date.getDate()
                        )}
                    </Text>
                </TouchableOpacity>
            </View>

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

            <TouchableOpacity
                style={styles.continue}
                onPress={syncWithFirebaseThenNavigate}
            >
                <Text style={styles.button}>Continue</Text>
            </TouchableOpacity>
        </ImageBackground>
    );
};

const mapDispatchToProps = {
    selectDate,
};

export default connect(null, mapDispatchToProps)(DateSelection);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    continue: {
        flex: 1,
        flexDirection: "column",
        alignSelf: "stretch",
        alignContent: "stretch",
        marginLeft: "5%",
        marginRight: "5%",
        marginTop: 400,
    },
    header: {
        fontWeight: "200",
        fontSize: 25,
        color: "#bfff00",
        borderTopEndRadius: 5,
        paddingRight: 10,
        paddingLeft: 10,
        backgroundColor: "grey",
    },
    date: {
        textDecorationLine: "underline",
        fontSize: 20,
        color: "#bfff00",
        borderTopEndRadius: 5,
        paddingRight: 10,
        paddingLeft: 35,
        backgroundColor: "grey",
    },
    dateInput: {
        flex: 1,
        alignContent: "flex-start",
        alignItems: "flex-start",
        marginTop: "20%",
        marginLeft: "10%",
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
});
