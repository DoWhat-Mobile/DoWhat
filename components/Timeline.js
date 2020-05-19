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
          maxY={this.props.end_Y_Coord - 100} // - 100 because the timeline nav bar takes up 100 pixels, and the props of Draggable library doesnt account for it
          renderColor='black' renderText='S'
          isCircle // Make the object a circle
          onShortPressRelease={() => alert('Start time is ' + (Math.floor(this.props.startTime)) + '00 hrs')}
          onDrag={this.props.change_start_time}
        />

        <Draggable x={20} y={560} renderSize={30}
          maxX={20} minX={20}
          minY={this.props.start_Y_Coord - 100}
          maxY={560}
          renderColor='black' renderText='E'
          isCircle
          onShortPressRelease={() => alert('End time is ' + (Math.floor(this.props.endTime)) + '00hrs')}
          onDrag={this.props.change_end_time}
        />

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
  return {
    startTime: state.timeline.initial_time,
    endTime: state.timeline.end_time,
    timeInterval: state.timeline.time_interval,
    end_Y_Coord: state.timeline.end_Y_Coord,
    start_Y_Coord: state.timeline.start_Y_Coord,

  }
}

export default connect(mapStateToProps, actions)(Timeline);
