import React from "react";
import Timeline from "react-native-timeline-flatlist";
import { data_timeline } from "../reusable-functions/data_timeline";

const Schedule = ({ timeline, testEvents, events }) => {
    const [data, setData] = React.useState([]);

    React.useEffect(() => {
        setData(data_timeline(timeline, testEvents, events));
    }, []);

    const onEventPress = (event) => {
        const updatedData = data.map((item) => {
            if (item === event)
                return Object.assign({}, item, { title: "changed" });
            return item;
        });
        setData(updatedData);
    };

    return (
        <Timeline
            onEventPress={(event) => onEventPress(event)}
            data={data}
            timeStyle={{
                textAlign: "center",
                backgroundColor: "#ff9797",
                color: "white",
                padding: 5,
                borderRadius: 13,
            }}
        />
    );
};

export default Schedule;
