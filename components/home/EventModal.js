import React from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  Image,
  Text,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AntDesign } from "@expo/vector-icons";

const EventModal = (props) => {
  console.log(props);
  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <AntDesign
          name="close"
          size={26}
          onPress={() => props.onClose()}
          style={{
            position: "absolute",
            left: 330,
            right: 0,
            top: 15,
            bottom: 0,
            zIndex: 1,
            color: "white",
          }}
        />
        <Image source={{ uri: props.event.imageUrl }} style={styles.image} />
        <ScrollView style={styles.textContainer}>
          <View style={styles.header}>
            <Text style={{ fontSize: 22, fontWeight: "bold" }}>
              {props.event.title}
            </Text>
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <MaterialCommunityIcons name="thumb-up" size={24} color="black" />
              <Text
                style={{
                  fontSize: 18,
                  marginLeft: 5,
                  fontWeight: "bold",
                }}
              >
                {props.event.ratings}
              </Text>
            </View>
          </View>
          <View style={styles.descriptionContainer}>
            <Text
              style={{
                marginBottom: 20,
                fontWeight: "600",
              }}
            >
              {props.event.description}
            </Text>
          </View>
        </ScrollView>
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
    //padding: 20,
    borderRadius: 10,
  },
  image: {
    width: "100%",
    height: "40%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    opacity: 0.85,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  descriptionContainer: {
    marginTop: 10,
  },
});
export default EventModal;
