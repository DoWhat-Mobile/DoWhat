import React from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

const DirectionsModal = ({ details, onClose }) => {
  const CloseButton = () => {
    return (
      <AntDesign
        name="close"
        size={26}
        onPress={() => onClose()}
        style={{
          position: "absolute",
          left: 330,
          right: 0,
          top: 15,
          bottom: 0,
          color: "black",
          zIndex: 1,
        }}
      />
    );
  };
  const StartEndDescription = () => {
    return (
      <View>
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.descriptionText}>Start: </Text>
          <Text>{details.origin}</Text>
        </View>
        <View style={{ flexDirection: "row", marginTop: 5 }}>
          <Text style={styles.descriptionText}>End:</Text>
          <Text style={{ marginLeft: 10 }}>{details.destination}</Text>
        </View>
      </View>
    );
  };

  const DistanceDurationDescription = () => {
    return (
      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <View style={{ flexDirection: "row", marginRight: 60 }}>
          <Text style={styles.descriptionText}>Distance: </Text>
          <Text>{details.distance}</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.descriptionText}>Duration: </Text>
          <Text>{details.duration}</Text>
        </View>
      </View>
    );
  };

  const DirectionDescription = (item) => {
    return (
      <View>
        <FontAwesome5 name="walking" size={24} color="black" />
        <Text>{item.start}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <CloseButton />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Directions</Text>
          <View style={styles.header}>
            <StartEndDescription />
            <DistanceDurationDescription />
          </View>
          <View style={styles.descriptionContainer}>
            {DirectionDescription(details.steps[0])}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00000080",
  },
  textContainer: {
    marginRight: 10,
    padding: 20,
    marginBottom: 15,
  },
  modal: {
    marginTop: 30,
    marginHorizontal: 10,
    height: Dimensions.get("window").height - 100,
    backgroundColor: "white",
    borderRadius: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginTop: "5%",
  },
  descriptionContainer: {
    marginTop: 10,
  },
  descriptionText: {
    color: "#737373",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
});

export default DirectionsModal;
