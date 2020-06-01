import React from 'react';
import * as actions from '../actions';
import { StyleSheet, View, Text, Button, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux'
import DateTimePicker from '@react-native-community/datetimepicker';

/**
 * This component allows users to input their available timings as well as their friends. The global state will keep track of
 * the common overlapping intervals of time as the user inputs more and more timings.
 */
class Timeline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startTime: new Date(),
      endTime: new Date(),
      mode: 'date',
      show: false,
      modifyingStartTime: false
    };
  }

  onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    this.setState({ show: Platform.OS === 'ios' });
    if (this.state.modifyingStartTime) {
      this.setState({ startTime: currentDate });
    } else {
      this.setState({ endTime: currentDate });
    }
  };

  showMode = currentMode => {
    this.setState({ show: true });
    this.setState({ mode: currentMode });
  };

  showTimepicker = () => {
    this.showMode('time');
  };

  finalize = (values) => {
    this.props.change_interval(values)
    this.props.navigation.navigate("Genre");
  }

  modifyStartTime = () => {
    this.setState({ modifyingStartTime: true });
    this.showTimepicker();
  }

  modifyEndTime = () => {
    this.setState({ modifyingStartTime: false });
    this.showTimepicker();
  }

  addFriend = () => {

  }

  render() {
    return (
      <View style={styles.container} >
        <Text style={styles.title}>Timeline</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center' }}>
          <Button title="Add Friend" onPress={this.addFriend()} />
        </View>

        <View style={{ marginTop: 20 }}>
          <TouchableOpacity onPress={this.modifyStartTime}>
            <Text>
              Start Time is {this.state.startTime.toString()}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 20 }}>
          <TouchableOpacity onPress={this.modifyEndTime}>
            <Text>
              End Time is {this.state.endTime.toString()}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text>
            You are adding for friend number
          </Text>
        </View>

        <View
          style={{ alignSelf: 'flex-end', bottom: 0, position: 'absolute' }}>
          <Button title="Finalize"
            onPress={() => this.finalize([this.props.values_start, this.props.values_end])} />
        </View>

        {this.state.show && (
          <DateTimePicker
            testID="dateTimePicker"
            timeZoneOffsetInMinutes={0}
            value={this.state.modifyingStartTime ? this.state.startTime : this.state.endTime}
            mode={this.state.mode}
            is24Hour={true}
            display="default"
            onChange={this.onChange}
          />
        )}
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
  text: {
    alignSelf: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 30,
  },
});

const mapStateToProps = (state) => {
  return {
    values_start: state.timeline.values[0],
    values_end: state.timeline.values[1],
    time_interval_start: state.timeline.time_interval[0],
    time_interval_end: state.timeline.time_interval[1],
    errorMessage: state.timeline.errorMessage
  }
}

export default connect(mapStateToProps, actions)(Timeline)