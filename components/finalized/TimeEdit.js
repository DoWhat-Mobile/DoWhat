import React from "react";
import { View, Button, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const TimeEdit = (props) => {
    const [mode, setMode] = React.useState("date");
    const [show, setShow] = React.useState(false);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || props.newTime;
        setShow(Platform.OS === "ios");
        props.newTimeChange(currentDate);
    };

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    };

    const showTimepicker = () => {
        showMode("time");
    };

    return (
        <View>
            <View>
                <Button onPress={showTimepicker} title="Show time picker!" />
            </View>
            {show && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={props.newTime}
                    mode={mode}
                    is24Hour={true}
                    display="default"
                    onChange={onChange}
                />
            )}
        </View>
    );
};
export default TimeEdit;
