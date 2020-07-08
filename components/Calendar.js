import React, { useState, Component } from "react";
import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Agenda } from 'react-native-calendars';

const testIDs = require('./calendarTestIDs');

/**
 * Component for integrated calendar view
 */
const Calendar = ({ currDate, onDateChange }) => {
    const [items, setItems] = useState({
        '2020-07-10': [{ name: 'item 1 - any js object' }],
        '2020-07-09': [{ name: 'item 2 - any js object', height: 80 }],
        '2020-07-08': [{ name: 'item 3 - any js object' }, { name: 'any js object' }, { name: 'item 3 - any js object' }, { name: 'any js object' }]
    });

    const loadItems = (day) => {
        setTimeout(() => {
            for (let i = -15; i < 85; i++) {
                const time = day.timestamp + i * 24 * 60 * 60 * 1000;
                const strTime = timeToString(time);
                if (!items[strTime]) {
                    items[strTime] = [];
                    const numItems = Math.floor(Math.random() * 3 + 1);
                    for (let j = 0; j < numItems; j++) {
                        items[strTime].push({
                            name: 'Item for ' + strTime + ' #' + j,
                            height: Math.max(50, Math.floor(Math.random() * 150))
                        });
                    }
                }
            }
            const newItems = {};
            Object.keys(items).forEach(key => { newItems[key] = items[key]; });
            setItems({ items: newItems });
        }, 1000);
    }

    const renderItem = (item) => {
        console.log(item)
        return (
            <TouchableOpacity
                testID={testIDs.agenda.ITEM}
                style={[styles.item, { height: item.height }]}
                onPress={() => Alert.alert(item.name)}
            >
                <Text>{item.name}</Text>
            </TouchableOpacity>
        );
    }

    const renderEmptyDate = () => {
        return (
            <View style={styles.emptyDate}>
                <Text>This is empty date!</Text>
            </View>
        );
    }

    const renderEmptyData = () => {
        return (
            <View>
                <Text>Nothing planned on this date</Text>
            </View>
        )
    }

    const rowHasChanged = (r1, r2) => {
        return r1.name !== r2.name;
    }

    const timeToString = (time) => {
        const date = new Date(time);
        return date.toISOString().split('T')[0];
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
            markedDates={{
                '2020-07-09': { marked: true },
            }}
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
            //renderDay={(day, item) => (<Text>{day ? day.day: 'item'}</Text>)}
            // hideExtraDays={false}
            // Agenda container style
            style={{
                margin: 10, borderBottomLeftRadius: 25, borderBottomRightRadius: 25,
                borderRadius: 10,
                backgroundColor: '#F28333'
            }}
        />
    )
}

export default Calendar;

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