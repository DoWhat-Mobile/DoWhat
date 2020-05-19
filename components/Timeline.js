import React, { Component } from "react";
import { connect } from 'react-redux'
import { View, Text, StyleSheet } from "react-native";
import Draggable from 'react-native-draggable'; // Library to allow draggable objects, for better UI
import * as actions from "../actions";

// might use tab navigator and define a static property
class Timeline extends React.Component {

  render() {
    return (
      <View>
        <Draggable x={20} y={48} renderSize={30}
          maxX={20} minX={20} // Fix the circles to only be able to move along x=20 axis
          minY={48}
          maxY={560 - (this.props.endTime * 0.5)}
          renderColor='black' renderText='S'
          isCircle // Make the object a circle
          onShortPressRelease={() => alert(this.props.startTime)}
          onDrag={this.props.change_start_time}
        />

        <Draggable x={20} y={520} renderSize={30}
          maxX={20} minX={20}
          minY={48 + (this.props.startTime * 0.5)}
          maxY={560}
          renderColor='black' renderText='E'
          isCircle
          onShortPressRelease={() => alert('This is the end time')}
          onDrag={this.props.change_end_time}
        />

        <View style={{ marginStart: 100, marginTop: 48 }}>
          <Text style={{ fontSize: 12 }}> -- Starting time: 0800hrs</Text>
        </View>

        <View style={styles.timing}>
          <Text style={{ textAlign: "center", fontSize: 15 }}>Time Interval is {this.props.timeInterval} hours</Text>
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


const mapStateToProps = (state) => {
  console.log(state)
  return {
    startTime: state.timeline.initial_time,
    endTime: state.timeline.end_time,
    timeInterval: state.timeline.time_interval
  }
}

export default connect(mapStateToProps, actions)(Timeline);
