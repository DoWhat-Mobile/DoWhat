import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { connect } from "react-redux";
import * as actions from "../actions";
import Timeline from "react-native-timeline-flatlist";
import firebase from "firebase";

const Finalized = (props) => {
  const [events, setEvents] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const testEvents = ["arts", "leisure", "nightlife"];
  const testTime = [5, 11];

  React.useEffect(() => {
    firebase
      .database()
      .ref("events")
      .once("value")
      .then((snapshot) => {
        setEvents(snapshot.val());
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <Text>Loading..</Text>;
  }

  const data = [];
  let startTime = testTime[0];

  for (i = 0; i < testEvents.length; i++) {
    const genre = testEvents[i];
    const numEvents = events[genre].length;
    const randomNumber = Math.floor(Math.random() * numEvents);
    const event = events[genre][randomNumber];
    //console.log(randomNumber);
    data[i] = {
      time: startTime + ":00",
      title: `${event.name}`,
      description: `${event.description}`,
    };
    startTime += event.duration;
    if (startTime > testTime[1]) break;
  }

  return (
    <View style={styles.container}>
      <Timeline style={styles.list} data={data} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 65,
    backgroundColor: "white",
  },
  list: {
    flex: 1,
    marginTop: 20,
  },
});

const mapStateToProps = (state) => {
  return {
    finalGenres: state.genre.genres,
  };
};

export default connect(mapStateToProps, actions)(Finalized);
