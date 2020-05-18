import React, { Component } from "react";
import { connect } from 'react-redux'
import { View, Text, StyleSheet } from "react-native";
import Draggable from 'react-native-draggable'; // Library to allow draggable objects, for better UI

// might use tab navigator and define a static property
class Timeline extends React.Component {

  /**
   * Handles when the object is dragged to change the time.
   */
  changeTime = (event, gestureState) => {
    alert(gestureState.moveX)
  }

  render() {
    return (
      <View>
        <Draggable x={75} y={100} renderSize={56}
          renderColor='black' renderText='T'
          isCircle
          onShortPressRelease={() => alert('touched!!')}
          onDrag={this.changeTime}
        />

        <View style={styles.timing}>
          <Text style={{ textAlign: "center", fontSize: 15 }}>Current Time Period</Text>
        </View>
      </View >
    );
  }
}

const styles = StyleSheet.create({
  timing: {
    borderWidth: 1,
    borderColor: "lightblue",
    marginTop: 400,

  }
})

export default connect()(Timeline);