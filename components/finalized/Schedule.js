import React from "react";
import ActionOptions from "./ActionOptions";
import Timeline from "react-native-timeline-flatlist";
import moment from "moment-timezone";
import firebase from "../../database/firebase";
import { connect } from "react-redux";
import { addFavouritesToPlan } from "../../actions/favourite_event_actions";
import { GOOGLE_MAPS_API_KEY } from "react-native-dotenv";
import {
  Text,
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import {
  handleProcess,
  formatEventsData,
  handleBoardRouteProcess,
} from "../../reusable-functions/GoogleCalendarInvite";
import { renderDetail } from "../../reusable-functions/DataTimeline";
import {
  eventsWithDirections,
  routeFormatter,
} from "../../reusable-functions/MergingWithRoutes";
import {
  handleRipple,
  mergeTimings,
  timeAddition,
} from "../../reusable-functions/TimeRelatedFunctions";
import { COLORS } from "../../assets/colors";
import DirectionsModal from "./DirectionsModal";

const Schedule = (props) => {
  const [events, setEvents] = React.useState([]);
  const [directionDetails, setDirectionDetails] = React.useState([]);
  const [visible, setVisible] = React.useState(false);
  const [unsatisfied, setUnsatisfied] = React.useState("");
  const [isDirectionsVisible, setDirectionsVisible] = React.useState(false);
  const [isLoading, setLoading] = React.useState(true);

  React.useEffect(() => {
    directionsArray(props.initRoutes, props.timings, props.data);
  }, [props.data]);

  /**
   * Fetches all direction routes between each event and then combines routes with events into one array. Creates a new timings
   * array that takes into account travel time as well
   *
   * @param {array of all locations including the user's current location} allRoutes
   * @param {timings array that has each event's allocated timing} timings
   * @param {array of events that are generated for the user} data
   */
  const directionsArray = async (allRoutes, timings, data) => {
    const result = await Promise.all(
      allRoutes.map(async (route, index, element) => {
        let obj = {
          distance: "",
          duration: "",
          steps: [],
          origin: "",
          destination: "",
        };
        let steps = [];
        let distance = "";
        let duration = "";
        let origin =
          typeof route === "object" ? route.lat + "," + route.long : route;
        let destination = element[index + 1];
        try {
          let resp = await fetch(
            "https://maps.googleapis.com/maps/api/directions/json?origin=" +
              origin +
              "&destination=" +
              destination +
              "&key=" +
              GOOGLE_MAPS_API_KEY +
              "&mode=transit&region=sg"
          );
          //console.log(JSON.stringify(await resp.json()));
          let data = (await resp.json())["routes"][0]["legs"][0];
          let response = data["steps"];
          distance = data["distance"]["text"];
          duration = data["duration"]["text"];

          for (let j = 0; j < response.length; j++) {
            steps.push(await routeFormatter(await response[j]));
          }
        } catch (err) {
          console.log(err);
        }

        obj.steps = steps;
        obj.distance = distance;
        obj.duration = timeAddition(steps);
        console.log(route);
        return obj;
      })
    );
    let updatedTimings = mergeTimings(timings, result);
    let combinedData = eventsWithDirections(updatedTimings, data, result);
    setEvents(combinedData);
    setLoading(false);
  };

  /**
   * Edits the event array prop and also the updates the coordinates with the new event swapped in
   * @param {*event that the user picked to swap with the unsatisfied event} selected
   */
  const onReselect = (selected) => {
    const updatedData = props.data.map((item) => {
      if (item === unsatisfied) {
        return selected;
      } else {
        return item;
      }
    });
    const updatedCoord = updatedData.map((item) => {
      return { coord: item.coord, name: item.title };
    });
    props.eventsUpdate(updatedData);
    props.mapUpdate(updatedCoord);
    props.routeUpdate(selected, unsatisfied);
  };

  const onClose = () => {
    setVisible(false);
  };

  const onDirectionsClose = () => {
    setDirectionsVisible(false);
  };
  /**
   * Only the host is allowed to edit events. Directions cannot be editted
   * @param {unsatisfied event that will be swapped out} event
   */
  const onEventPress = (event) => {
    if (event.genre == "directions") {
      setDirectionsVisible(true);
      setDirectionDetails(event.description);
      console.log(event.description);
    } else if (props.accessRights === "host" && event.genre !== "directions") {
      setUnsatisfied(event);
      setVisible(true);
    } else {
      alert("Only the host can edit events");
    }
  };

  /**
   * Edits the timing array prop from and the the timing of each event of the event array prop
   * @param {updated timing the user picked} selectedDate
   */
  const newTimeChange = (selectedDate) => {
    const currentDate = selectedDate || newTime;
    let newStartTime = moment(currentDate).tz("Asia/Singapore").format("HH:mm");
    let i = 0;
    const temp = props.timings;

    const indexFinder = props.data.map((item, index) => {
      if (item === unsatisfied) {
        i = index;
        return { ...item, time: newStartTime };
      } else {
        return item;
      }
    });
    const newTimingsArray = handleRipple(temp, newStartTime, i);

    let updatedData = indexFinder.map((item, index) => {
      return { ...item, time: newTimingsArray[index].start };
    });

    setUnsatisfied({ ...unsatisfied, time: newStartTime });
    props.eventsUpdate(updatedData);
    setVisible(false);
  };

  // Renders proceed button only for the host of the event
  const renderProceedButton = () => {
    if (props.accessRights != "host") {
      return;
    } else {
      return (
        <TouchableOpacity onPress={sendGcalInviteAndResetAttendeeData}>
          <Text style={styles.proceed}>Proceed</Text>
        </TouchableOpacity>
      );
    }
  };

  /**
   * Sends invite to all attendees of the finalized event, also reset all_attendee
   * in the case of repeated use of app. (if never reset data, might use it for wrong
   * date)
   */
  const sendGcalInviteAndResetAttendeeData = async () => {
    const formattedData = formatEventsData(props.data); // Formatted data contains event title
    if (props.route == "board") {
      // collab board route
      // Create calendar event and send calendar invite to invitees
      await handleBoardRouteProcess(formattedData, props.timings, props.board);
    } else {
      // handleProcess function and all other logic is in GoogleCalendarInvite.js
      await handleProcess(formattedData, props.timings);
    }
    let updates = {};
    updates["/users/" + props.userID + "/busy_periods"] = null;
    props.addFavouritesToPlan([]);
    firebase.database().ref().update(updates);
    props.navigation.navigate("Home"); // navigate back once done
    alert(
      "A calendar event has been created for you, and calendar invite sent to your friends."
    );
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignContent: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator style={{ alignSelf: "center" }} size="large" />
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <Modal
          transparent={true}
          animated
          visible={isDirectionsVisible}
          animationType="fade"
        >
          <DirectionsModal
            onClose={onDirectionsClose}
            details={directionDetails}
          />
        </Modal>
        <Modal animated visible={visible} animationType="fade">
          <ActionOptions
            onReselect={onReselect}
            onClose={onClose}
            unsatisfied={unsatisfied}
            events={props.allEvents}
            genres={props.genres}
            newTimeChange={newTimeChange}
            filters={props.filters}
          />
        </Modal>
        <View style={styles.body}>
          <Timeline
            onEventPress={(event) => onEventPress(event)}
            data={events}
            timeStyle={{
              textAlign: "center",
              color: "black",
              padding: 5,
              borderRadius: 16,
              fontSize: 18,
            }}
            innerCircle={"dot"}
            dotColor={COLORS.orange}
            dotSize={8}
            timeContainerStyle={{
              minWidth: 59,
              marginRight: -10,
            }}
            renderDetail={renderDetail}
            circleColor={COLORS.lightOrange}
          />
        </View>
        <View style={styles.footer}>{renderProceedButton()}</View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 10,
    marginHorizontal: 15,
    marginTop: 20,
  },
  footer: {
    flex: 1,
    alignItems: "center",
    marginVertical: 30,
    marginLeft: 200,
  },
  proceed: {
    paddingTop: "3%",
    paddingBottom: "3%",
    paddingLeft: "15%",
    paddingRight: "15%",
    borderRadius: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#fcf5f2",
    backgroundColor: COLORS.orange,
  },
});
const mapDispatchToProps = {
  addFavouritesToPlan,
};

export default connect(null, mapDispatchToProps)(Schedule);
