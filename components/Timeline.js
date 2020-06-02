import React from 'react';
import { addFriend, goForward, goBack } from '../actions/timeline_actions';
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
    // Call Redux action
    this.props.addFriend({
      startTime: this.state.startTime.toJSON(),
      endTime: this.state.endTime.toJSON()
    });
    this.setState({
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
        <Text style={styles.title}>Timeline</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center' }}>
          <Button title="Add Friend" onPress={this.addFriend} />
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

        <View style={styles.arrows}>

          <TouchableOpacity onPress={this.previousFriend()}>
            <FontAwesomeIcon icon={faArrowLeft} size={30} />
          </TouchableOpacity>

          <TouchableOpacity onPress={this.nextFriend()}>
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
  arrows: {
    marginTop: 20,
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  }
});

const mapDispatchToProps = {
  addFriend, goForward, goBack
}

const mapStateToProps = (state) => {
  console.log(state.timeline);
  return {

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Timeline)