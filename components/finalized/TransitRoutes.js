import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { GOOGLE_MAPS_API_KEY } from "react-native-dotenv";
import Route from "./Route";

const TransitRoute = ({ routes }) => {
    const [allRoutes, setRoutes] = React.useState([]);
    const [isRoutesLoading, setRoutesLoading] = React.useState(true);

    const routeFormatter = async (obj) => {
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
                "(" +
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

    const routesArray = async (allRoutes) => {
        let result = [];
        for (let i = 0; i < allRoutes.length - 1; i++) {
            let obj = [];
            let origin =
                typeof allRoutes[i] === "object"
                    ? allRoutes[i].lat + "," + allRoutes[i].long
                    : allRoutes[i];
            let destination = allRoutes[i + 1];
            try {
                let resp = await fetch(
                    "https://maps.googleapis.com/maps/api/directions/json?origin=" +
                        origin +
                        "&destination=" +
                        destination +
                        "&key=" +
                        GOOGLE_MAPS_API_KEY +
                        "&mode=transit&region=sg"
                );
                //console.log(JSON.stringify(await resp.json()));
                let response = (await resp.json())["routes"][0]["legs"][0][
                    "steps"
                ];
                for (let j = 0; j < response.length; j++) {
                    obj.push(await routeFormatter(await response[j]));
                }
            } catch (err) {
                console.log(err);
            }
            result.push(obj);
        }
        //}
        setRoutes(result);
        setRoutesLoading(false);
    };

    React.useEffect(() => {
        console.log(routes);
        routesArray(routes);
    }, [routes]);
    if (isRoutesLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    alignContent: "center",
                    justifyContent: "center",
                }}
            >
                <ActivityIndicator
                    style={{ alignSelf: "center" }}
                    size="large"
                />
            </View>
        );
    } else {
        return <Route data={allRoutes[0]} />;
    }
};
export default TransitRoute;
