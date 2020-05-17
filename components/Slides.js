import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Button,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

const Slides = (props) => {
  const { data, onSlidesComplete } = props;

  const lastSlideButton = (index) => {
    if (index === data.length - 1) {
      return (
        <Button title="Let's get started" onPress={() => onSlidesComplete()} />
      );
    }
  };

  const renderSlides = () =>
    data.map((slides, index) => (
      <View key={slides.text} style={styles.slide}>
        <Text style={styles.text}>{slides.text}</Text>
        {lastSlideButton(index)}
      </View>
    ));

  return (
    <View style={{ height: "100%", width: "100%" }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        {renderSlides()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    justifyContent: "center",
    alignItems: "center",
    width: SCREEN_WIDTH,
  },
  text: {
    fontSize: 30,
  },
});
export default Slides;
