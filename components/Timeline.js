import React from 'react';
import { addFriend, updateCurrFocusTime, goForward, goBack } from '../actions/timeline_actions';
import { StyleSheet, View, Text, Button, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux'
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

/**
 * This component allows users to input their available timings as well as their friends. The global state will keep track of
 * the common overlapping intervals of time as the user inputs more and more timings.
 */
class Timeline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'date',
      show: false,
      modifyingStartTime: false
    };
  }

  onChange = (event, selectedDate) => {
    const currentDate = selectedDate || (this.state.modifyingStartTime ? this.props.currTimeFocus.startTime : this.props.currTimeFocus.endTime);
    this.setState({ show: Platform.OS === 'ios' });
    if (this.state.modifyingStartTime) {
      this.setState({
        startTime: currentDate,
        endTime: this.props.currTimeFocus.endTime
      });

    } else {
      this.setState({
        endTime: currentDate,
        startTime: this.props.currTimeFocus.startTime
      });
    }
    // Update Redux state
    this.props.updateCurrFocusTime(this.props.currFocus,
      {
        startTime: this.state.startTime,
        endTime: this.state.endTime
      });
  };

  showMode = currentMode => {
    this.setState({ show: true });
    this.setState({ mode: currentMode });
  };

  showTimepicker = () => {
    this.showMode('time');
  };

  finalize = (values) => {
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
    // Call Redux action, reset date for next input
    this.props.addFriend({
      startTime: new Date().toJSON(),
      endTime: new Date().toJSON()
    });
  }

  previousFriend = () => {
    this.props.goBack()
  }

  nextFriend = () => {
    this.props.goForward()
  }

  render() {
    return (
      <View style={styles.container} >
        <Text style={styles.title}>Timeline</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center' }}>
          <Button title="Add Friend" onPress={this.addFriend} />
        </View>

        <View style={{ marginTop: 20 }}>
          <TouchableOpacity onPress={this.modifyStartTime}>
            <Text>
              Start Time is {this.props.currTimeFocus.startTime.toString()}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 20 }}>
          <TouchableOpacity onPress={this.modifyEndTime}>
            <Text>
              End Time is {this.props.currTimeFocus.endTime.toString()}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text>
            You are adding for friend number
          </Text>
        </View>

        <View style={styles.arrows}>

          <TouchableOpacity onPress={this.previousFriend}>
            <FontAwesomeIcon icon={faArrowLeft} size={30} />
          </TouchableOpacity>

          <TouchableOpacity onPress={this.nextFriend}>
            <FontAwesomeIcon icon={faArrowRight} size={30} />
          </TouchableOpacity>

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
            value={this.state.modifyingStartTime ? new Date(this.props.currTimeFocus.startTime) : new Date(this.props.currTimeFocus.endTime)}
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
  arrows: {
    marginTop: 20,
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  }
});

const mapDispatchToProps = {
  addFriend, goForward, goBack, updateCurrFocusTime
}

const mapStateToProps = (state) => {
  const selectedFriendIndex = state.timeline.currFocus;
  const selectedFriendTime = state.timeline.availableTimings[selectedFriendIndex];
  return {
    currTimeFocus: selectedFriendTime,
    currFocus: selectedFriendIndex
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Timeline)