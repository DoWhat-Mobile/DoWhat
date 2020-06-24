/**
 * Page for first step of application flow: Uploading of google calendar to get free timings
 * If a user does not want to upload google calendar, the user will skip and move on to manual
 * input of free timings instead.
 */
import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import firebase from "../database/firebase";
import { Button } from "react-native-elements";
import { getBusyPeriodFromGoogleCal, authenticateAndGetBusyPeriods } from "../reusable-functions/GoogleCalendarGetBusyPeriods";

const GoogleCalendarInput = (props) => {
    const userAlreadyLoggedIn = () => {
        var user = firebase.auth().currentUser;
        if (user) {
            return true;
        } else {
            return false;
        }
    };

    const getBusyPeriods = () => {
        props.navigation.navigate("FriendInput");
        if (userAlreadyLoggedIn()) {
            getBusyPeriodFromGoogleCal(props.userID, props.date); // User ID comes from Redux state
        } else {
            authenticateAndGetBusyPeriods(props.userID, props.date);
        }
    };

    return (
        <ImageBackground
            style={{ width: "100%", height: "100%", flex: 1 }}
            source={require("../assets/Time.jpeg")}
            resizeMode="cover"
        >
            {/* <View style={style.body}> */}
            {/* <View style={style.calendar}>
                        <FontAwesomeIcon icon={faCalendarAlt} size={80} />
                    </View> */}
            <View style={style.bodyText}>
                <Text style={style.header}>Sync Google Calendar</Text>
                <Text style={style.subHeader}>
                    Automated Planning For You
                    </Text>
            </View>
            {/* </View> */}

            <View style={style.footer}>
                <Button
                    title="Skip"
                    onPress={() =>
                        props.navigation.navigate("Timeline")
                    }
                />
                <Button
                    title="Continue"
                    onPress={() =>
                        getBusyPeriods()
                    }
                />
            </View>
        </ImageBackground>
    );
}


// Get previously inputted date from DateSelection for API call
const mapStateToProps = (state) => {
    return {
        date: state.date_select.date,
        userID: state.add_events.userID,
    };
};

export default connect(mapStateToProps, null)(GoogleCalendarInput);

const style = StyleSheet.create({
    container: {
        flex: 1,
    },
    body: {
        flex: 8,
        marginTop: "20%",
        marginBottom: "10%",
    },
    calendar: {
        borderRadius: 50,
        borderWidth: 0.5,
        padding: 30,
        alignSelf: "center",
    },
    bodyText: {
        marginTop: "10%",
    },
    header: {
        fontSize: 32,
        textAlign: "center",
    },
    subHeader: {
        fontSize: 16,
        textAlign: "center",
    },
    footer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        margin: "5%",
        marginTop: 500,
    },
});