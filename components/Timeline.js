import React from "react";
import {
    addFriend,
    updateCurrFocusTime,
    goForward,
    goBack,
} from "../actions/timeline_actions";
import { StyleSheet, View, Text, Button, TouchableOpacity } from "react-native";
import { connect } from "react-redux";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import moment from "moment-timezone";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * This component allows users to input their available timings as well as their friends. The global state will keep track of
 * the common overlapping intervals of time as the user inputs more and more timings.
 */
const Timeline = (props) => {
    const [mode, setMode] = React.useState("date");
    const [show, setShow] = React.useState(false);
    const [modifyingStartTime, setModifyingStartTime] = React.useState(false);

    const onChange = (event, selectedDate) => {
        const currentDate =
            selectedDate ||
            (modifyingStartTime
                ? props.currTimeFocus.startTime
                : props.currTimeFocus.endTime);
        setShow(Platform.OS === "ios");

        if (modifyingStartTime) {
            props.updateCurrFocusTime(props.currFocus, {
                startTime: moment(currentDate).tz("Asia/Singapore"),
                endTime: props.currTimeFocus.endTime,
            });
        } else {
            props.updateCurrFocusTime(props.currFocus, {
                startTime: props.currTimeFocus.startTime,
                endTime: moment(currentDate).tz("Asia/Singapore"),
            });
        }
    };

    const showMode = (currentMode) => {
        setShow(!show);
        setMode(currentMode);
    };

    const showTimepicker = () => {
        showMode("time");
    };

    const modifyStartTime = () => {
        setModifyingStartTime(true);
        showTimepicker();
    };

    const modifyEndTime = () => {
        setModifyingStartTime(false);
        showTimepicker();
    };

    const addFriend = () => {
        const date = new Date();
        props.addFriend({
            startTime: moment(date).tz("Asia/Singapore"),
            endTime: moment(date).tz("Asia/Singapore"),
        });
    };

    const previousFriend = () => {
        props.goBack();
    };

    const nextFriend = () => {
        props.goForward();
    };

    return (
        <View style={styles.container}>
            <View style={props.route == 'manual' ? styles.timeSelectionMultiple
                : styles.timeSelectionSolo}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.fromToText}>From:</Text>
                    <TouchableOpacity onPress={modifyStartTime}>
                        <Text style={styles.time}>
                            {moment(props.currTimeFocus.startTime)
                                .tz("Asia/Singapore")
                                .format("HH:mm")}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.fromToText}>To:</Text>
                    <TouchableOpacity onPress={modifyEndTime}>
                        <Text style={styles.time}>
                            {moment(props.currTimeFocus.endTime)
                                .tz("Asia/Singapore")
                                .format("HH:mm")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={{
                textAlign: 'center', fontSize: 12, fontWeight: '500',
                color: 'grey'
            }}>
                {props.currFocus == 0
                    ? 'You are adding your own availabilities'
                    : 'You are adding for friend number ' + (props.currFocus)}

            </Text>

            <View style={styles.footer}>
                {props.route == 'manual'
                    ?
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={{
                            backgroundColor: '#E86380',
                            borderTopLeftRadius: 15, borderBottomLeftRadius: 15,
                            padding: 5
                        }}
                            onPress={previousFriend}>
                            <Text style={[styles.AddFriendText, { color: 'white' }]}>
                                BACK
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ borderWidth: 1, padding: 5, borderColor: '#E86380' }}
                            onPress={addFriend}>
                            <Text style={styles.AddFriendText}>ADD FRIEND</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{
                            backgroundColor: '#E86380',
                            borderTopRightRadius: 15, borderBottomRightRadius: 15,
                            padding: 5
                        }}
                            onPress={nextFriend}>
                            <Text style={[styles.AddFriendText, { color: 'white' }]}>
                                NEXT
                            </Text>
                        </TouchableOpacity>
                    </View>
                    : null}


                {show && (
                    <RNDateTimePicker
                        testID="dateTimePicker"
                        timeZoneOffsetInMinutes={480}
                        value={
                            modifyingStartTime
                                ? new Date(props.currTimeFocus.startTime)
                                : new Date(props.currTimeFocus.endTime)
                        }
                        mode={mode}
                        is24Hour={true}
                        display="default"
                        onChange={onChange}
                        style={{
                            marginBottom: 110,
                        }}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: "2%",
    },
    timeSelectionSolo: {
        marginTop: '10%',
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    timeSelectionMultiple: {
        marginTop: '4%',
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    footer: {
        flexDirection: "row",
        marginTop: 10,
        justifyContent: 'center'
    },
    fromToText: {
        fontFamily: 'serif',
        fontSize: 16,
        fontWeight: '800',
        marginRight: '10%'
    },
    AddFriendText: {
        fontFamily: 'serif', color: '#E86830', fontWeight: 'bold',
        fontSize: 12
    },
    time: {
        borderWidth: 0.2, padding: 2, backgroundColor: '#E86830',
        borderColor: 'grey', borderRadius: 5, textAlign: 'center',
        paddingLeft: 5, paddingRight: 5, color: '#FEFBFA', marginBottom: 15
    }
});

const mapDispatchToProps = {
    addFriend,
    goForward,
    goBack,
    updateCurrFocusTime,
};

const mapStateToProps = (state) => {
    const selectedFriendIndex = state.timeline.currFocus;
    const selectedFriendTime =
        state.timeline.availableTimings[selectedFriendIndex];
    return {
        currTimeFocus: selectedFriendTime,
        currFocus: selectedFriendIndex,
        allTimings: state.timeline.availableTimings,
        finalTiming: state.timeline.finalTiming,
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Timeline);
