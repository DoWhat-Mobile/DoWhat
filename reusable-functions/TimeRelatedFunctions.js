/**
 * Helper function to deal with addition and subtraction of time
 */
const minuteHandler = (hour, min) => {
    let finalHour = hour;
    let finalMin = min;
    if (min >= 60) {
        finalMin = min - 60;
        finalHour += 1;
    }
    if (finalHour >= 24) {
        finalHour -= 24;
    }
    if (min < 0) {
        finalMin = 60 + min;
    }
    finalMin = finalMin < 10 ? "0" + finalMin : "" + finalMin;
    finalHour = finalHour < 10 ? "0" + finalHour : "" + finalHour;
    return finalHour + ":" + finalMin;
};

/**
 * Helper function to edit the start and end time of a time object in the timings array
 */
const startEndChange = (newTimeObject, hourDifference, minuteDifference) => {
    const newStartHour =
        parseInt(newTimeObject.start.substring(0, 2)) + hourDifference;

    const newStartMin =
        parseInt(newTimeObject.start.substring(3, 5)) + minuteDifference;

    const newStartTime = minuteHandler(newStartHour, newStartMin);

    const newEndHour =
        parseInt(newTimeObject.end.substring(0, 2)) + hourDifference;

    const newEndMin =
        parseInt(newTimeObject.end.substring(3, 5)) + minuteDifference;

    const newEndTime = minuteHandler(newEndHour, newEndMin);
    return { start: newStartTime, end: newEndTime };
};

/**
 * Lets the user increases/decreases the timing of an event without overshooting into the next/previous event
 * @param {*} newTimingsArray
 * @param {the editted time the user picked} newStartTime
 * @param {position of the event in timeline that the user modified} index
 */
export const handleRipple = (newTimingsArray, newStartTime, index) => {
    const hourDifference =
        parseInt(newStartTime.substring(0, 2)) -
        parseInt(newTimingsArray[index].start.substring(0, 2));

    // in case user inputs wrong extreme time
    if (Math.abs(hourDifference) >= 5) return newTimingsArray;
    const minuteDifference =
        (parseInt(newStartTime.substring(3, 5)) == 0
            ? 60
            : parseInt(newStartTime.substring(3, 5))) -
        parseInt(newTimingsArray[index].start.substring(3, 5));

    // case when user changes start time from {start: 12, end: 15} to {start: >= 15, end: 15} that causes ripple. (Overshoots)
    if (
        hourDifference > 0 &&
        parseInt(newStartTime.substring(0, 2)) >=
            parseInt(newTimingsArray[index].end.substring(0, 2))
    ) {
        for (let i = index; i < newTimingsArray.length; i++) {
            newTimingsArray[i] = startEndChange(
                newTimingsArray[i],
                hourDifference,
                minuteDifference
            );
        }
    }
    // case when user changes start time from {start: 12, end: 15} to {start: 13 or 14, end: 15};
    else if ((hourDifference > 0 || minuteDifference > 0) && index != 0) {
        newTimingsArray[index].start = newStartTime;
        newTimingsArray[index - 1].end = newStartTime;
    }

    // case when user increases the first event's timings that does not affect the others
    else if ((hourDifference > 0 || minuteDifference > 0) && index == 0) {
        newTimingsArray[index].start = newStartTime;
    }

    // case when user decreases the first event's timing
    else if ((hourDifference < 0 || minuteDifference < 0) && index == 0) {
        newTimingsArray[index].start = newStartTime;
    }

    // case when user changes start time from {start: 15, end: 19} to {start: 13 or 14, end: 19}
    // and the previous timing is {start: 12, end: 15} (eats into previous end time)
    else if (
        hourDifference < 0 &&
        index != 0 &&
        parseInt(newStartTime.substring(0, 2)) >
            parseInt(newTimingsArray[index - 1].start.substring(0, 2))
    ) {
        newTimingsArray[index].start = newStartTime;
        newTimingsArray[index - 1].end = newStartTime;
    }

    // case when user changes start time from {start: 15, end: 19} to {start: 12, end: 19}
    // and previous timings is {start: 12, end: 15} (eats into previous start time)
    else if (
        hourDifference < 0 &&
        index != 0 &&
        parseInt(newStartTime.substring(0, 2)) <=
            parseInt(newTimingsArray[index - 1].start.substring(0, 2))
    ) {
        for (let i = index; i >= 0; i--) {
            newTimingsArray[i] = startEndChange(
                newTimingsArray[i],
                hourDifference,
                minuteDifference
            );
        }
    }
    return newTimingsArray;
};

/**
 * converts minutes into the 24 hour hours minutes format
 */
const timeConvert = (n) => {
    let num = n;
    let hours = num / 60;
    let rhours =
        Math.floor(hours) < 10 ? "0" + Math.floor(hours) : Math.floor(hours);
    let minutes = (hours - rhours) * 60;
    let rminutes =
        Math.round(minutes) < 10
            ? "0" + Math.round(minutes)
            : Math.round(minutes);
    return rhours + ":" + rminutes;
};

/**
 *
 * @param {the time formatted with colon eg. 16:30} colon
 * @param {time formatted with hours and minutes eg 1 hour 23 mins} hr
 * @param {*} minus
 */
const parseTime = (colon, hr, minus) => {
    let hour = parseInt(hr.substring(0, 1));
    let minute = parseInt(hr.substring(6, 9));
    let minuteDifference =
        hr.length > 8 ? hour * 60 + minute : parseInt(hr.substring(0, 2));
    let c = colon.split(":");
    let t = parseInt(c[0]) * 60 + parseInt(c[1]);
    let final = minus !== "minus" ? t + minuteDifference : t - minuteDifference;
    return timeConvert(final);
};

/**
 * combines the timings allocated to each event  with time taken to travel into an array with objects
 * having start and end timing keys
 * @param {timings array of the events generated} timings
 * @param {timings array time taken from one event to another} direction
 */
export const mergeTimings = (timings, direction) => {
    let temp = [];

    for (let i = 0; i < timings.length; i++) {
        if (i == 0) {
            let newStart = parseTime(
                timings[i].start,
                direction[i].duration,
                "minus"
            );
            temp.push({ start: newStart, end: timings[i].start });
        }
        if (i == timings.length - 1) {
            temp.push(timings[i]);
        } else {
            let first = { start: "", end: "" };
            let second = { start: "", end: "" };

            let mid = parseTime(
                timings[i].end,
                direction[i + 1].duration,
                "minus"
            );
            if (isNaN(mid) && typeof mid !== "string") {
                console.log(mid);
                temp.push(timings[i]);
            } else {
                first.start = timings[i].start;
                first.end = mid;
                second.start = mid;
                second.end = timings[i].end;
                temp.push(first);
                temp.push(second);
            }
        }
    }
    return temp;
};
