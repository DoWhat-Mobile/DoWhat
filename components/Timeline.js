import React, { Component } from 'react';
import * as actions from '../actions';
import { StyleSheet, View, Text, Button } from 'react-native';
import { connect } from 'react-redux'
import MultiSlider from '@ptomasroos/react-native-multi-slider';

/**
 * This component allows users to input their available timings as well as their friends. The global state will keep track of
 * the common overlapping intervals of time as the user inputs more and more timings.
 */
class Timeline extends React.Component {

  render() {
    return (
      <View style={styles.container} >
        <Text style={styles.title}>Timeline</Text>
        <View style={styles.sliders}>
          <View style={styles.sliderOne}>
            <Text style={styles.text}>{this.props.values_start < 10 ? "0" + this.props.values_start + '00hrs' : this.props.values_start + '00hrs'} </Text>
            <Text style={styles.text}>{this.props.values_end < 10 ? "0" + this.props.values_end + "00hrs" : this.props.values_end + '00hrs'}</Text>
          </View>
          <MultiSlider
            values={[this.props.values_start, this.props.values_end]}
            sliderLength={250}
            onValuesChange={this.props.change_time}
            min={8}
            max={24}
            step={1}
            allowOverlap
            snapped
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center' }}>
            <Button title="Finalize" />
            <Button title="Add Friend" onPress={() => this.props.add_friend([this.props.values_start, this.props.values_end])} />
          </View>
        </View>

        <View>
          <Text>Time interval is {this.props.errorMessage ? 'invalid for this friend :(' : this.props.time_interval}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliders: {
    margin: 20,
    width: 280,
  },
  text: {
    alignSelf: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 30,
  },
  sliderOne: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

const mapStateToProps = (state) => {
  console.log(state.timeline.time_interval)
  return {
    values_start: state.timeline.values[0],
    values_end: state.timeline.values[1],
    time_interval: state.timeline.time_interval,
    errorMessage: state.timeline.errorMessage
  }
}

export default connect(mapStateToProps, actions)(Timeline)