import React, { useState, useEffect, Component } from "react";
import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { connect } from 'react-redux'
import moment from 'moment';

const testIDs = require('./calendarTestIDs');

/**
 * Component for integrated calendar view
 */
const Calendar = ({ currDate, onDateChange, userEvents }) => {
    useEffect(() => {
        loadUserEvents()

    }, []);

    const [items, setItems] = useState({});

    const loadUserEvents = () => {
        console.log("User Events passed to child is: ", userEvents); //Sanity check
        if (userEvents == undefined) return;
        var formattedItems = {}; // For use with calendar library

        userEvents.forEach(event => {
            const startTime = event.start.dateTime.substring(11, 16);
            const endTime = event.end.dateTime.substring(11, 16);
            const date = event.start.dateTime.substring(0, 10);
            const name = event.summary;
            const startMoment = moment(date + ' ' + startTime)
            const endMoment = moment(date + ' ' + endTime)
            const duration = moment.duration(endMoment.diff(startMoment)).asHours();
            if (formattedItems.hasOwnProperty(date)) { // Add to the same date if it exists
                formattedItems[date].push({
                    name: name, start: startTime,
                    end: endTime, height: duration * 40
                })
            } else {
                // One hour is represented with 40px of height
                formattedItems[date] = [{
                    name: name, start: startTime,
                    end: endTime, height: duration * 40,
                    duration: duration
                }]
            }
        })
        setItems(formattedItems);
    }

    const renderItem = (item) => {
        return (
            <TouchableOpacity
                testID={testIDs.agenda.ITEM}
                style={[styles.item, { height: item.height }]}
                onPress={() => Alert.alert(item.name)}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{
                        fontWeight: 'bold',
                        fontSize: 13, color: '#241A3C'
                    }}>
                        {item.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#C1AEB1', fontWeight: '500' }}>
                        {item.duration} hrs
                </Text>
                </View>

                <Text style={{
                    fontSize: 12, color: '#C1AEB1', fontWeight: '500',
                    marginTop: 8
                }}>
                    {item.start}-{item.end}hrs
                </Text>
            </TouchableOpacity>
        );
    }

    // For case when item is empty array
    const renderEmptyDate = () => {
        return (
            <View style={styles.emptyDate}>
                <Text>This is empty date!</Text>
            </View>
        );
    }

    const renderEmptyData = () => {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={{
                    fontSize: 16, fontWeight: 'bold', fontFamily: 'serif',
                    textAlign: 'center'
                }}>
                    You have nothing planned on this day.
                    </Text>
                <Text style={{
                    fontSize: 13, fontWeight: '500', fontFamily: 'serif',
                    color: 'grey', textAlign: 'center'
                }}>
                    You could use this day to plan an outing with your friends!
                    </Text>
            </View>
        )
    }

    const rowHasChanged = (r1, r2) => {
        return r1.name !== r2.name;
    }

    const setMarkedDates = () => {
        var formattedMarkings = {}
        for (var date in items) {
            formattedMarkings[date] = { marked: true }
        }
        return formattedMarkings;
    }

    const currFormattedDate = currDate.toISOString().substring(0, 10);

    return (
        <Agenda
            testID={testIDs.agenda.CONTAINER}
            pastScrollRange={1}
            futureScrollRange={1}
            items={items}
            // loadItemsForMonth={(month) => loadItems(month)}
            selected={currFormattedDate}
            renderItem={(item, firstItemInDay) => renderItem(item)}
            renderEmptyDate={() => renderEmptyDate()}
            renderEmptyData={() => renderEmptyData()}
            rowHasChanged={(r1, r2) => rowHasChanged(r1, r2)}
            onDayPress={(day) => onDateChange(day.dateString)}
            markedDates={setMarkedDates()}
            minDate={currFormattedDate}
            theme={{
                // agendaDayNumColor: 'white', agendaDayTextColor: '#FEF0D5',
                agendaKnobColor: '#F28333', selectedDayBackgroundColor: '#F28333'
                // selectedDayBackgroundColor: '#244749',
                // backgroundColor: '#F4AC65', agendaTodayColor: '#3C58B9',
                // calendarBackground: '#F28333',
                // todayTextColor: '#3C58B9', textDisabledColor: '#C0B2B3',
                // dayTextColor: 'white', textSectionTitleColor: 'white',
                // monthTextColor: 'white',

            }}
            // Agenda container style
            style={{
                margin: 10, borderBottomLeftRadius: 25, borderBottomRightRadius: 25,
                borderRadius: 10,
                backgroundColor: '#F28333'
            }}
        />
    )
}

const mapStateToProps = (state) => {
    console.log(
        "Redux state events is : ",
        state.add_events.currUserCalendarEvents
    );
    return {
        userID: state.add_events.userID,
        currUserName: state.add_events.currUserName,
        userEvents: state.add_events.currUserCalendarEvents
    };
};

export default connect(mapStateToProps, null)(Calendar);

const styles = StyleSheet.create({
    item: {
        backgroundColor: 'white',
        flex: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginTop: 17
    },
    emptyDate: {
        height: 15,
        flex: 1,
        paddingTop: 30
    }
})