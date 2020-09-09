import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { TIH_API_KEY } from "react-native-dotenv";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../assets/colors";

/**
 * Home feed event card
 */
const FeedEventCard = ({
  event,
  isEventFood,
  sectionTitle,
  index,
  foodIndex,
  favourites,
  handleAddToFavourites,
  handleCardPress,
}) => {
  const checkIfEventIsFavourited = (event) => {
    var isEventFavourited = false;
    favourites.forEach((selectedEvent) => {
      const favouritedEventID = selectedEvent[0].id;
      if (favouritedEventID == event[0].id) {
        isEventFavourited = true;
      }
    });

    return event[0].favourited || isEventFavourited;
  };

  var isEventFavourited = false; // Separate variable as .favourited property dont exist
  if (checkIfEventIsFavourited(event)) {
    isEventFavourited = true;
  }

  var imageURI = event[0].imageUrl;
  const eventRatings = event[1];
  console.log("bad coding", imageURI);

  // If imageURI is a code, convert it to URI using TIH API
  if (imageURI.substring(0, 5) != "https") {
    imageURI =
      "https://tih-api.stb.gov.sg/media/v1/download/uuid/" +
      imageURI +
      "?apikey=" +
      TIH_API_KEY;
  }

  return (
    <TouchableOpacity
      onPress={() =>
        handleCardPress({
          ...event[0],
          imageUrl: imageURI,
          ratings: event[1],
        })
      }
    >
      <ImageBackground
        source={{ uri: imageURI }}
        style={{
          height: Dimensions.get("window").height / 3.5,
          margin: 10,
        }}
        imageStyle={{ borderRadius: 10 }}
      >
        <View
          style={[
            styles.container,
            {
              width: isEventFood
                ? Dimensions.get("window").width * 0.9
                : Dimensions.get("window").width * 0.95,
            },
          ]}
        >
          <View style={styles.body}>
            <View style={styles.titleContainer}>
              <Text
                numberOfLines={1}
                ellipsizeMode={"tail"}
                style={[styles.title, { width: isEventFood ? 200 : 250 }]}
              >
                {event[0].title}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: 10,
                }}
              >
                <MaterialCommunityIcons
                  name="thumb-up"
                  size={24}
                  color="white"
                />
                <Text
                  style={{
                    fontSize: 19,
                    color: "white",
                    fontWeight: "bold",
                    marginHorizontal: 5,
                  }}
                >
                  {" "}
                  {eventRatings}
                </Text>
              </View>
              <TouchableOpacity
                disabled={sectionTitle == "favourites"}
                onPress={() =>
                  handleAddToFavourites(event, sectionTitle, index, foodIndex)
                }
              >
                {isEventFavourited ? (
                  <MaterialCommunityIcons
                    name="heart"
                    color={COLORS.orange}
                    size={24}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="heart-outline"
                    color={"white"}
                    size={24}
                  />
                )}
              </TouchableOpacity>
            </View>
            <Text
              style={{
                color: "white",
                fontSize: 13,
                width: isEventFood ? 300 : 350,
              }}
              numberOfLines={1}
              ellipsizeMode={"tail"}
            >
              {event[0].description}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "flex-end",
    borderRadius: 10,
  },
  body: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "flex-end",
    borderRadius: 10,
    padding: 15,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
});

export default FeedEventCard;
