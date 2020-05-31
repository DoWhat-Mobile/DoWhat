const calendar = {
    "calendars": {
        "hansybastian@gmail.com": {
            "busy": [
                {
                    "end": "2020-06-06T10:30:00+08:00",
                    "start": "2020-06-06T10:00:00+08:00",
                },
                {
                    "end": "2020-06-06T13:15:00+08:00",
                    "start": "2020-06-06T12:30:00+08:00",
                },
            ],
        },
    },
    "kind": "calendar#freeBusy",
    "timeMax": "2020-06-06T15:59:00.000Z",
    "timeMin": "2020-06-06T00:00:00.000Z",
}

const findOverlaps = (dateTime) => {

}

/**
 * Convert the datetime input to pointers for timeline array
 */
const convertTo15MinuteInterval = (hours, minutes) => {
    if (minutes % 15 != 0) {
        throw new Error("Minutes must be in multiples of 15")
    }
    const hoursToArrayIndex = hours * 4;
    const minutesToArrayIndex = minutes / 15;
    const timelineArrayIndex = (hoursToArrayIndex + minutesToArrayIndex);
    return timelineArrayIndex;
}

/**
 * 
 * @param {*} startTime is an integer from 0 to 96 representing 15min intervals in 24h 
 * @param {*} endTime is an integer from 0 to 96 representing 15min intervals in 24h 
 */
const markTimelineArray = (startIndex, endIndex, timelineArray) => {
    for (i = startIndex; i < endIndex; i++) {
        timelineArray[i] = 1; // Mark as busy
    }
    return timelineArray;
}

const mapBusyPeriodToTimeline = (calendar) => {
    const userID = 'hansybastian@gmail.com'
    // 24h timeline with 15min intervals, start from 0000hrs, 0 --> no event, 1 --> has event
    var timeline = Array(96).fill(0);
    calendar.calendars[userID].busy
        .map(event => {
            const startHour = new Date(event.start).getHours();
            const endHour = new Date(event.end).getHours();
            const startMinute = new Date(event.start).getMinutes();
            const endMinute = new Date(event.end).getMinutes();

            const startTime = convertTo15MinuteInterval(startHour, startMinute);
            const endTime = convertTo15MinuteInterval(endHour, endMinute);
            timeline = markTimelineArray(startTime, endTime, timeline);
        })
    return timeline;
}

getStringRepresentationForBusyTimings = (calendar, userID) => {
    calendar.calendars[userID].busy
        .
}

// mapBusyPeriodToTimeline(calendar);

console.log('2020-06-06T12:30:00+08:00'.toString());