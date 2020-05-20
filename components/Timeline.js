import React, { Component } from "react";
import { connect } from 'react-redux'
import { View, Text, StyleSheet, Button, Animated, PanResponder } from "react-native";
import Draggable from 'react-native-draggable'; // Library to allow draggable objects, for better UI
import * as actions from "../actions";

// might use tab navigator and define a static property
class Timeline extends React.Component {

  // finalize function has to add navigation.navigate to finalized page
  render() {
    return (
      <View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignContent: 'flex-end' }}>
          <Button title="add friend" onPress={this.props.add_friend} />
          <Button title="Finalize" onPress={() => alert('hello')} />
        </View>


        <Draggable x={20} y={this.props.start_y_coord - 100} renderSize={30}
          maxX={20} minX={20} // Fix the circles to only be able to move along x=20 axis
          minY={48}
          maxY={this.props.end_y_coord - 100} // - 100 because the timeline nav bar takes up 100 pixels, and the props of Draggable library doesnt account for it
          renderColor='black' renderText='S'
          isCircle // Make the object a circle
          onShortPressRelease={() => alert('Start time is ' + (Math.floor(this.props.startTime)) + '00 hrs')}
          onDrag={this.props.change_start_time}
        />

        <Draggable x={20} y={this.props.end_y_coord - 100} renderSize={30}
          maxX={20} minX={20}
          minY={this.props.start_y_coord - 100}
          maxY={580}
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

const CIRCLE_RADIUS = 20;
const styles = StyleSheet.create({
  timing: {
    borderWidth: 1,
    borderColor: "lightblue",
    marginTop: 400,
  },
  circle: {
    backgroundColor: "black",
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS
  }
})


const mapStateToProps = (state) => {
  console.log(state)
  return {
    init_start_y_coord: state.timeline.init_start_y_coord,
    init_end_y_coord: state.timeline.init_end_y_coord,
    startTime: state.timeline.initial_time,
    endTime: state.timeline.end_time,
    timeInterval: state.timeline.time_interval,
    end_y_coord: state.timeline.end_y_coord,
    start_y_coord: state.timeline.start_y_coord,
    final_initial_time: state.final_initial_time,
    final_end_time: state.final_end_time,
    final_time_interval: state.final_time_interval
  }
}

export default connect(mapStateToProps, actions)(Timeline);
