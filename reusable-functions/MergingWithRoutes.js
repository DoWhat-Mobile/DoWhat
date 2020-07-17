import { GOOGLE_MAPS_API_KEY } from "react-native-dotenv";
export const routeFormatter = async (obj) => {
    let format = {
        key: "",
        distance: "",
        duration: "",
        instructions: "",
        mode: "",
        start: "",
    };
    let instructions = "";
    if (obj.travel_mode === "TRANSIT") {
        let arrival_stop = obj.transit_details.arrival_stop.name;
        let departure_stop = obj.transit_details.departure_stop.name;
        let name = obj.transit_details.line.name.includes("Line")
            ? obj.transit_details.line.name
            : "Bus " + obj.transit_details.line.name;
        let num_stops = obj.transit_details.num_stops;
        instructions =
            "Take " +
            name +
            " (" +
            num_stops +
            " stops" +
            ")" +
            " from " +
            departure_stop +
            " to " +
            arrival_stop;
    } else {
        instructions = obj.html_instructions;
    }
    let lat = obj.start_location.lat;
    let long = obj.start_location.lng;
    let resp = await fetch(
        "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
            lat +
            "," +
            long +
            "&key=" +
            GOOGLE_MAPS_API_KEY
    );
    let start = (await resp.json()).results[0].formatted_address;
    //console.log(JSON.stringify(await resp.json()));
    format.distance = obj.distance.text;
    format.duration = obj.duration.text;
    format.instructions = instructions;
    format.mode = obj.travel_mode;
    format.start = start;
    format.key = instructions;

    return format;
};

export const eventsWithDirections = (timingsArray, events, directions) => {
    let result = [];
    for (let i = 0; i < timingsArray.length; i++) {
        let j = i % 2 == 0 ? i / 2 : (i - 1) / 2;
        if (timingsArray[i].start == events[j].time) {
            result.push(events[j]);
        } else {
            let obj = {
                title: "Directions",
                time: "",
                lineColor: "black",
                description: "",
                genre: "directions",
            };

            obj.time = timingsArray[i].start;
            obj.description = directions[j].steps;

            result.push(obj);
        }
    }
    return result;
};