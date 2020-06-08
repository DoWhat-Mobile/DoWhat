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
      startTime: new Date(),
      endTime: new Date()
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

        <View style={styles.header}>
          <Text style={styles.title}>Available timings</Text>
        </View>

        <View style={styles.body}>
          <View style={{ flexDirection: 'row', alignSelf: 'flex-start', flex: 1, marginTop: '30%' }}>
            <Button title="+ Add Friend" onPress={this.addFriend} />
          </View>

          <View style={{ flexDirection: 'column', flex: 4, justifyContent: 'space-evenly' }}>
            <View style={styles.timeSelection}>
              <Text style={styles.time}>
                From:
              </Text>
              <TouchableOpacity onPress={this.modifyStartTime}>
                <Text style={{ textDecorationLine: 'underline', fontSize: 20 }}>
                  {this.props.currTimeFocus.startTime.toLocaleTimeString()}hrs
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeSelection}>
              <Text style={styles.time}>
                To:
              </Text>
              <TouchableOpacity onPress={this.modifyEndTime}>
                <Text style={{ textDecorationLine: 'underline', fontSize: 20 }}>
                  {this.props.currTimeFocus.endTime.toLocaleTimeString()}hrs
              </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.footer}>

          <View style={styles.arrows}>

            <TouchableOpacity onPress={this.previousFriend}>
              <FontAwesomeIcon icon={faArrowLeft} size={30} />
            </TouchableOpacity>

            <TouchableOpacity onPress={this.nextFriend}>
              <FontAwesomeIcon icon={faArrowRight} size={30} />
            </TouchableOpacity>

          </View>
          <View style={{ marginTop: 20 }}>
            <Text>
              You are adding for friend number {this.props.currFocus + 1}
            </Text>
          </View>

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
  },
  header: {
    flex: 1,
  },
  body: {
    flex: 6,
    marginRight: 15,
    flexDirection: 'row-reverse'
  },
  footer: {
    flex: 2,
  },
  time: {
    fontFamily: 'serif',
    fontSize: 15
  },
  text: {
    alignSelf: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 30,
    fontFamily: 'serif',
    marginTop: '10%',
    marginLeft: 15
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