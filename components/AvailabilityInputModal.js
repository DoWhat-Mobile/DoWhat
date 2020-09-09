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
import { COLORS } from "../assets/colors";

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
  const [errorMessage, setErrorMessage] = useState("");

  const setfinalTime = () => {
    // Check if input is valid
    for (let i = 0; i < allTimings.length; i++) {
      const endTime = moment(allTimings[i].endTime);
      const startTime = moment(allTimings[i].startTime);

      if (startTime.isBefore(endTime)) continue; // Valid
      setErrorMessage(
        "Please input a start time that is earlier than the end time"
      );
      return;
    }

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
          moment(endState).tz("Asia/Singapore").format("HH:mm").substring(0, 2)
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
      moment(startState).tz("Asia/Singapore").format("HH:mm").substring(0, 2)
    );
    finalTiming[0] = start;
    let endState = allTimings[0].endTime;
    let val = parseInt(
      moment(endState).tz("Asia/Singapore").format("HH:mm").substring(0, 2)
    );
    let end = val === 0 ? 24 : val;
    finalTiming[1] = end;
    console.log("Final timing is: ", finalTiming);
    finalizeTimeline(finalTiming);
    onFinalize();
    onClose();
  };

  return (
    <View style={styles.modal}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Input Availability</Text>
        <AntDesign
          name="close"
          size={20}
          onPress={() => onClose()}
          style={styles.close}
        />
      </View>

      <View style={styles.body}>
        <Timeline route={route} />
      </View>

      <Text
        style={{
          color: "red",
          fontSize: 12,
          fontWeight: "100",
          marginTop: "1.5%",
          textAlign: "center",
        }}
      >
        {errorMessage}
      </Text>

      <View>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => setfinalTime()}
        >
          <Text style={styles.doneButtonText}>DONE</Text>
        </TouchableOpacity>
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
  },
  header: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 20,
  },
  subHeaderText: {
    fontWeight: "500",
    fontSize: 12,
    color: "grey",
    width: "90%",
  },
  body: {
    flex: 1,
  },
  footer: {
    flex: 1,
    margin: 10,
    marginTop: 0,
    borderWidth: 1,
  },
  doneButton: {
    flexDirection: "row",
    alignSelf: "flex-end",
    marginRight: 10,
  },
  doneButtonText: {
    color: COLORS.orange,
    fontWeight: "bold",
    fontSize: 14,
  },
  close: {
    position: "relative",
    marginRight: "1%",
    marginTop: "0.5%",
  },
});
