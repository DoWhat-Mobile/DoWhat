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

    const finalize = (values) => {
        props.navigation.navigate("Genre");
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
        //console.log(props.currTimeFocus.startTime.toLocaleTimeString());
        // Call Redux action, reset date for next input
        props.addFriend({
            startTime: new Date(),
            endTime: new Date(),
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
                <Text style={styles.title}>Available timings</Text>
            </View>

            <View style={styles.body}>
                <View
                    style={{
                        flexDirection: "row",
                        alignSelf: "flex-start",
                        flex: 1,
                        marginTop: "30%",
                    }}
                >
                    <Button title="+ Add Friend" onPress={addFriend} />
                </View>

                <View
                    style={{
                        flexDirection: "column",
                        flex: 4,
                        justifyContent: "space-evenly",
                    }}
                >
                    <View style={styles.timeSelection}>
                        <Text style={styles.time}>From:</Text>
                        <TouchableOpacity onPress={modifyStartTime}>
                            <Text
                                style={{
                                    textDecorationLine: "underline",
                                    fontSize: 20,
                                }}
                            >
                                {props.currTimeFocus.startTime.toLocaleTimeString()}
                                hrs
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.timeSelection}>
                        <Text style={styles.time}>To:</Text>
                        <TouchableOpacity onPress={modifyEndTime}>
                            <Text
                                style={{
                                    textDecorationLine: "underline",
                                    fontSize: 20,
                                }}
                            >
                                {props.currTimeFocus.endTime.toLocaleTimeString()}
                                hrs
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.arrows}>
                    <TouchableOpacity onPress={previousFriend}>
                        <FontAwesomeIcon icon={faArrowLeft} size={30} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={nextFriend}>
                        <FontAwesomeIcon icon={faArrowRight} size={30} />
                    </TouchableOpacity>
                </View>
                <View style={{ marginTop: 20 }}>
                    <Text>
                        You are adding for friend number {props.currFocus + 1}
                    </Text>
                </View>
            </View>

            <View
                style={{
                    alignSelf: "flex-end",
                    bottom: 0,
                    position: "absolute",
                }}
            >
                <Button
                    style={{ position: "fixed" }}
                    title="Finalize"
                    onPress={() =>
                        finalize([props.values_start, props.values_end])
                    }
                />
            </View>

            {show && (
                <RNDateTimePicker
                    testID="dateTimePicker"
                    timeZoneOffsetInMinutes={0}
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
    },
    header: {
        flex: 1,
    },
    body: {
        flex: 6,
        marginRight: 15,
        flexDirection: "row-reverse",
    },
    footer: {
        flex: 2,
    },
    time: {
        fontSize: 15,
    },
    text: {
        alignSelf: "center",
        paddingVertical: 20,
    },
    title: {
        fontSize: 30,

        marginTop: "10%",
        marginLeft: 15,
    },
    arrows: {
        marginTop: 20,
        flexDirection: "row",
        padding: 20,
        justifyContent: "space-between",
    },
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
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Timeline);
