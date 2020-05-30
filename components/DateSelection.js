import React, { useState } from 'react';
import { View, Button, Platform, Text, StyleSheet, ImagePropTypes } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { connect } from 'react-redux';
import { selectDate } from '../actions/date_select_action';

const DateSelection = (props) => {
    const [date, setDate] = useState(new Date()); // new Date() gives today's date
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios');
        setDate(currentDate);
        props.selectDate(currentDate);
    };

    const showMode = currentMode => {
        setShow(true);
        setMode(currentMode);
    };

    const showDatepicker = () => {
        showMode('date');
    };

    return (
        <View style={styles.container}>
            <View>
                <Button onPress={showDatepicker} title="Select Date!" />
            </View>
            {show && (
                <DateTimePicker
                    testID="dateTimePicker"
                    timeZoneOffsetInMinutes={0}
                    value={date}
                    mode={mode}
                    is24Hour={true}
                    display="calendar"
                    minimumDate={new Date()}
                    onChange={onChange}
                />
            )}
            <View>
                <Text>
                    The date is  {date.getDate()} {date.getMonth()}  {date.getFullYear()}
                </Text>
            </View>
            <View style={styles.proceed}>
                <Button title="Proceed" onPress={() => props.navigation.navigate('GoogleCalendarInput')} />
            </View>
        </View>
    );
};

const mapStateToProps = (state, ownProps) => {
    console.log(state);
    return {
        currDate: state.date_select.date
    }
}

const mapDispatchToProps = {
    selectDate
}

export default connect(mapStateToProps, mapDispatchToProps)(DateSelection);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    proceed: {
        alignItems: 'flex-end',
        flexDirection: 'column'
    }
});