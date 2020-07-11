import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from "react-native";

import { connect } from "react-redux";
import { finalizeTimeline } from "../actions/timeline_actions";
import { AntDesign } from "@expo/vector-icons";
import Timeline from "./Timeline";
import moment from "moment";

/**
 * The modal that shows when user selects each of the individual upcoming plans
 */
const AvailabilityInputModal = ({
    onClose,
    styledDate,
    onFinalize,
    finalizeTimeline,
    allTimings,
    route,
}) => {
    const [boardIsFinalized, setBoardIsFinalized] = useState(false);

    const setfinalTime = () => {
        if (route !== "manual") {
            return finalizeBoard();
        } else {
            // If manual route, account for all additions
            let finalTiming = [0, 24];
            for (let i = 0; i < allTimings.length; i++) {
                let startState = allTimings[i].startTime;
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
            for (let i = 0; i < allTimings.length; i++) {
                let endState = allTimings[i].endTime;
                let val = parseInt(
                    moment(endState)
                        .tz("Asia/Singapore")
                        .format("HH:mm")
                        .substring(0, 2)
                );
                let end = val === 0 ? 24 : val;
                if (finalTiming[1] > end) {
                    finalTiming[1] = end;
                }
            }
            console.log("Final manual input timing is : ", finalTiming);
            finalizeTimeline(finalTiming); // Set Redux state
            onFinalize();
            onClose();
        }
    };

    // For non-manual route calculation of manual input
    const finalizeBoard = () => {
        let finalTiming = [0, 24];
        let startState = allTimings[0].startTime;
        let start = parseInt(
            moment(startState)
                .tz("Asia/Singapore")
                .format("HH:mm")
                .substring(0, 2)
        );
        finalTiming[0] = start;
        let endState = allTimings[0].endTime;
        let val = parseInt(
            moment(endState)
                .tz("Asia/Singapore")
                .format("HH:mm")
                .substring(0, 2)
        );
        let end = val === 0 ? 24 : val;
        finalTiming[1] = end;
        console.log("Final timing is: ", finalTiming);
        finalizeTimeline(finalTiming);
        onFinalize();
        onClose();
    };

    const renderDoneButton = () => {
        if (boardIsFinalized) {
            return (
                <TouchableOpacity
                    style={[
                        styles.finalizeButton,
                        {
                            borderRadius: 20,
                            backgroundColor: "#e63946",
                            borderWidth: 0.2,
                        },
                    ]}
                    disabled={true}
                    onPress={() => setfinalTime()}
                >
                    <AntDesign
                        name="check"
                        size={20}
                        style={{ color: "white" }}
                    />
                </TouchableOpacity>
            );
        }
        return (
            <TouchableOpacity
                style={styles.finalizeButton}
                onPress={() => setfinalTime()}
            >
                <Text>Done</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.modal}>
            <Text style={styles.headerText}>
                Availabilities input for {styledDate}
            </Text>
            <AntDesign
                name="close"
                size={24}
                onPress={() => onClose()}
                style={styles.close}
            />

            <View style={styles.body}>
                <Timeline route={route} />
            </View>

            <View style={styles.buttonGroup}>
                {/* {renderInputAvailabilitiesButton()} */}
                {renderDoneButton()}
            </View>
        </View>
    );
};

const mapDispatchToProps = {
    finalizeTimeline,
};

const mapStateToProps = (state) => {
    // Main user's timing
    return {
        userID: state.add_events.userID,
        currUserName: state.add_events.currUserName,
        allTimings: state.timeline.availableTimings,
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AvailabilityInputModal);

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        marginBottom: "20%",
        marginTop: "10%",
        marginLeft: "5%",
        marginRight: "5%",
        backgroundColor: "white",
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 10,
            height: 20,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 10,
    },
    header: {
        flex: 1,
    },
    headerText: {
        fontWeight: "800",
        fontSize: 17,
        marginTop: "15%",
        marginLeft: "4%",
        fontFamily: "serif",
    },
    body: {
        flex: 9,
        margin: 10,
    },
    footer: {
        flex: 1,
        margin: 10,
        marginTop: 0,
        borderWidth: 1,
    },
    buttonGroup: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    finalizeButton: {
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: "center",
        flexDirection: "row",
        alignSelf: "flex-end",
        padding: 5,
        marginRight: 10,
        marginLeft: 10,
    },
    close: {
        position: "absolute",
        left: 330,
        right: 0,
        top: 25,
        bottom: 0,
    },
});
