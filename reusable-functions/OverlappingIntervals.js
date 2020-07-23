/**
 * Algorithm for finding overlapping interval from data from firebase.
 */

import moment from "moment-timezone";

/**
 * 1) Loop through all the attendees and get their busy period. (Date Object)
 * 2) getTime() from busy period start and end. Round off to the hours. EG 11:15 & 11:45 will round off to 11.
 * 3) Convert the busy period to the corresponding availble periods, just look at the flip side. ([0 0 0 1 1 1 0 0 0 0 1 1 0 0 0])
 * 4) Mark out overlapping timings amongst all the attendees
 * 5) Find the longest sequence of free timings found in 4).
 * 6) Have a minimum overlapping time cut off at 2h. This prevents time intervals from being too small. **NOT IMPLEMENTED**
 * 7) Omit anyone who can not be included in the min 2h time interval **NOT IMPLEMENTED**
 * @param {*} allAttendees from firebase user node, user.attendees 
 * @param {*} mainUserBusyPeriod from firebase user node, user.busy_periods 
 */
export const findOverlappingIntervals = (allAttendees, mainUserBusyPeriod) => {
    var allAvailabilities = [];

    if (mainUserBusyPeriod == undefined && allAttendees == undefined) {
        // Everyone is available
        return [8, 24]; // Start from 0800hrs
    } else if (mainUserBusyPeriod == undefined) {
        // Main user is available
        const allAttendeeAvails = handleAllAttendeesData(allAttendees);
        allAttendeeAvails.forEach((attendeeAvailData) => {
            allAvailabilities.push(attendeeAvailData);
        });
    } else if (allAttendees == undefined) {
        // Attendees are available
        allAvailabilities.push(handleMainUserData(mainUserBusyPeriod));
    } else {
        // Add formatted avails to the array of all availabilities
        allAvailabilities.push(handleMainUserData(mainUserBusyPeriod));
        const allAttendeeAvails = handleAllAttendeesData(allAttendees);
        allAttendeeAvails.forEach((attendeeAvailData) => {
            allAvailabilities.push(attendeeAvailData);
        });
    }
    const timeline = markFreeBlocksOfTime(allAvailabilities);
    const finalizedAvailRange = takeLargestBlockOfTimeFrom(timeline);
    return finalizedAvailRange; // Array [11, 16], supposed to be [12, 17]
};

const takeLargestBlockOfTimeFrom = (timeline) => {
    var longestCount = 0;
    var currCount = 0;
    var endHour = 0; // This hour corresponds to the 24 hour clock. So we count from 1 instead of 0.

    for (var i = 0; i < timeline.length; i++) {
        if (i == 23 && timeline[i] == 5) { // Last entry, corner case
            currCount++;
            if (currCount > longestCount) {
                // Update longestCount, start & end indexes
                longestCount = currCount;
                endHour = 24;
            }
        } else if (timeline[i] == 0) { // End of the continuous sequence
            if (currCount == longestCount) {
                if (i <= 19 && i >= 12) { //Prioritize afternoon time slots
                    endHour = i;
                }
            }

            if (currCount > longestCount) {
                longestCount = currCount; // Update longestCount, start & end indexes
                endHour = i; // When arr[i] == 0, means the (i-1)th hour is available
            }
            currCount = 0; // Reset curr count once hit a busy period. No longer continuous availability
        } else {
            // If entry is '5' and its not last entry, meaning its a free hour slot for scheduling
            currCount++;
        }
    }
    return [endHour - longestCount + 1, endHour];
};

/**
 * Mark a free hour block with a value '5' in an array with 24 entries, each entry representing one hour.
 */
const markFreeBlocksOfTime = (allAvailabilities) => {
    var timeline = [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
    ];
    for (var i = 7; i < 24; i++) {
        // Pointer for the timeline array, starting at 0800-0900hrs (8th position in arr)
        var shouldMarkAsAvail = true;

        allAvailabilities.forEach((obj) => {
            for (var attendee in obj) {
                const availArray = obj[attendee].split(",");
                // Look at hour of the day of the attendee's availabilities, if *ALL* the attendees are available at that hour, mark it.
                shouldMarkAsAvail = shouldMarkAsAvail && availArray[i] == 0;
                break;
            }
        });

        if (shouldMarkAsAvail) {
            timeline[i] = 5; // Rando number 5 to mark that this hour slot is good for scheduling
        }
    }
    return timeline;
};

// Returns object with array representing availability of the main user
const handleMainUserData = (mainUserBusyPeriod) => {
    var mainUserAvails = [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
    ];
    // Handle data for main user and insert into allAvailabilities array
    for (var i = 0; i < mainUserBusyPeriod.length; i++) {
        const timeRange = mainUserBusyPeriod[i];

        const startTime = timeRange.start;
        const endTime = timeRange.end;

        // Time format in array is the beginning of the hour. EG a '1' at the 13th position in the array means 1300-1400hrs is BUSY.
        const formattedStartTime = formatTime(startTime);
        const formattedEndTime = formatTime(endTime);

        mainUserAvails.fill(1, formattedStartTime, formattedEndTime);
    }

    const mainUserData = {};
    mainUserData["main"] = mainUserAvails.toString();
    return mainUserData;
};

// Returns an array consisting of objects with attendee email and array representing availability of each attendee
const handleAllAttendeesData = (allAttendees) => {
    var allAvailabilities = [];

    // Handle data for all the other attendees and insert into allAvailabilities array
    for (var attendee in allAttendees) {
        var busyPeriodsOfAttendee = allAttendees[attendee].busy_periods == undefined
            ? allAttendees[attendee]  // If route comes from collab board
            : allAttendees[attendee].busy_periods; // Object with > 1 start&end busy periods

        if (Array.isArray(busyPeriodsOfAttendee)) { // Change to object for compatibility
            busyPeriodsOfAttendee = Object.assign({}, busyPeriodsOfAttendee);
        }

        var currAttendeeAvails = [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
        ];

        for (var timeRange in busyPeriodsOfAttendee) {
            const startTime = busyPeriodsOfAttendee[timeRange].start;
            const endTime = busyPeriodsOfAttendee[timeRange].end;

            // Time format in array is the beginning of the hour. EG a '1' at the 13th position in the array means 1300-1400hrs is BUSY.
            const formattedStartTime = formatTime(startTime);
            const formattedEndTime = formatTime(endTime);
            currAttendeeAvails.fill(1, formattedStartTime, formattedEndTime);
        }
        const availsAndAttendee = {};
        availsAndAttendee[attendee] = currAttendeeAvails.toString();

        allAvailabilities.push(availsAndAttendee);
    }
    return allAvailabilities;
};

// Format time to an integer from 1 - 24. Only the hours are taken. ***NOTE: ALL ROUNDED TO THE HOUR.***
const formatTime = (time) => {
    return parseInt(
        moment(time).tz("Asia/Singapore").format("HH:mm").substring(0, 2)
    );
};
