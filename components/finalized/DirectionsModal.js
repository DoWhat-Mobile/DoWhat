import React from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "../../assets/colors";
import { FlatList } from "react-native-gesture-handler";

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

  const transitIcon = (info) => {
    if (info.mode == "WALKING") {
      return <FontAwesome5 name="walking" size={24} color="black" />;
    } else {
      if (info.key.includes("Bus")) {
        return <FontAwesome5 name="bus" size={24} color="black" />;
      } else {
        return <FontAwesome5 name="train" size={24} color="black" />;
      }
    }
  };
  const directionDescriptionCard = (item) => {
    return (
      <View>
        <View style={styles.directionCard}>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            {transitIcon(item)}
          </View>

          <View style={{ marginLeft: 25 }}>
            <Text style={{ fontWeight: "bold", color: "black" }}>
              {item.start.split(",")[0]}
            </Text>
            <View style={{ marginTop: 10 }}>
              <Text style={{ marginLeft: 20, width: 230, fontSize: 13 }}>
                {item.instructions}
              </Text>
              <View style={styles.cardFooterContainer}>
                <Text style={styles.descriptionText}>{item.distance} </Text>
                <View style={styles.longDash} />
                <Text style={styles.descriptionText}> {item.duration}</Text>
              </View>
            </View>
          </View>
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 10,
          }}
        >
          <AntDesign name="down" size={24} color={COLORS.orange} />
        </View>
      </View>
    );
  };

  const InstructionsList = () => {
    return (
      <FlatList
        data={details.steps}
        renderItem={({ item }) => directionDescriptionCard(item)}
        keyExtractor={(item) => item.key}
        style={{
          marginTop: 20,
          height: ((Dimensions.get("window").height - 100) * 3) / 4,
        }}
      />
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
          <InstructionsList />
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
  descriptionText: {
    color: "#737373",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  directionCard: {
    marginTop: 0,
    borderWidth: 0.5,
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
  },
  longDash: {
    backgroundColor: "#737373",
    height: 1,
    width: 40,
  },
  cardFooterContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 20,
  },
});

export default DirectionsModal;
