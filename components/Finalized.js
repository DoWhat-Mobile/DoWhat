import React from "react";
import { View, Text } from "react-native";
import { connect } from "react-redux";
import * as actions from "../actions";

// might use tab navigator and define a static property
const Finalized = (props) => {
  return (
    <View>
      <Text>{props.finalGenres}</Text>
    </View>
  );
};

const mapStateToProps = (state) => {
  return {
    finalGenres: state.genre.genres,
  };
};

export default connect(mapStateToProps, actions)(Finalized);
