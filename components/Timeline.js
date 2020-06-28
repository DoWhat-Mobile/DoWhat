import React from "react";
import {
    addFriend,
    updateCurrFocusTime,
    goForward,
    goBack,
    finalizeTimeline,
} from "../actions/timeline_actions";
import {
    StyleSheet,
    View,
    Text,
    Button,
    TouchableOpacity,
} from "react-native";
import { connect } from "react-redux";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import moment from "moment-timezone";
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
                startTime: currentDate,
                endTime: props.currTimeFocus.endTime,
            });
        } else {
            props.updateCurrFocusTime(props.currFocus, {
                startTime: props.currTimeFocus.startTime,
                endTime: currentDate,
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

    const setfinalTime = () => {
        let finalTiming = [0, 24];
        for (i = 0; i < props.allTimings.length; i++) {
            let startState = props.allTimings[i].startTime;
            let start = parseInt(
                moment(startState)
                    .tz("Asia/Singapore")
                    .format("HH:mm")
                    .substring(0, 2)
            );
            if (finalTiming[0] < start) {
                finalTiming[0] = start;
            }
        }
        for (i = 0; i < props.allTimings.length; i++) {
            let endState = props.allTimings[i].endTime;
            let val = parseInt(
                moment(endState)
                    .tz("Asia/Singapore")
                    .format("HH:mm")
                    .substring(0, 2)
            );
            end = val === 0 ? 24 : val;
            if (finalTiming[1] > end) {
                finalTiming[1] = end;
            }
        }
        props.finalizeTimeline(finalTiming);
    };

    const finalize = (values) => {
        setfinalTime();
        props.navigation.navigate("Genre", { route: "manual" });
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
            <View style={styles.header}>
                <View style={styles.startTime}>
                    <Text style={styles.time}>From:</Text>
                    <TouchableOpacity onPress={modifyStartTime}>
                        <Text
                            style={{
                                textDecorationLine: "underline",
                                fontSize: 18,
                            }}
                        >
                            {moment(props.currTimeFocus.startTime)
                                .tz("Asia/Singapore")
                                .format("HH:mm")}
                        </Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.addFriendButton}
                    onPress={addFriend}>
                    <MaterialCommunityIcons name="account-plus" color={'black'} size={20} />
                </TouchableOpacity>
            </View>

            <View style={styles.timeSelection}>
                <Text style={styles.time}>To:</Text>
                <TouchableOpacity onPress={modifyEndTime}>
                    <Text
                        style={{
                            textDecorationLine: "underline",
                            fontSize: 18,
                        }}
                    >
                        {moment(props.currTimeFocus.endTime)
                            .tz("Asia/Singapore")
                            .format("HH:mm")}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity onPress={previousFriend}>
                    <FontAwesomeIcon icon={faArrowLeft} size={25} />
                </TouchableOpacity>
                <View>
                    <Text>
                        You are adding for friend number{" "}
                        {props.currFocus + 1}
                    </Text>
                </View>
                <TouchableOpacity onPress={nextFriend}>
                    <FontAwesomeIcon icon={faArrowRight} size={25} />
                </TouchableOpacity>
            </View>

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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: '2%'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10

    },
    timeSelection: {
        marginTop: 10,
    },
    footer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    addFriendButton: {
        borderWidth: 1,
        borderRadius: 50,
        padding: 8,
        marginRight: '2%',


    }
});

const mapDispatchToProps = {
    addFriend,
    goForward,
    goBack,
    updateCurrFocusTime,
    finalizeTimeline,
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
