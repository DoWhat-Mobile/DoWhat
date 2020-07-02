import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { connect } from "react-redux";
import { WEATHER_API_KEY } from "react-native-dotenv";
const Loading = (props) => {
    const [weather, setWeather] = React.useState("");
    const [isLoading, setLoading] = React.useState(true);
    const route = props.route.params.route;
    React.useEffect(() => {
        const diff = props.difference;
        fetch(
            "https://api.openweathermap.org/data/2.5/onecall?lat=1.290270&lon=103.851959&%20exclude=hourly,daily&appid=" +
                WEATHER_API_KEY
        )
            .then((response) => response.json())
            .then((data) => {
                setWeather(data["daily"][diff]["weather"][0]["main"]);
                setLoading(false);
                console.log(weather);
            });
    }, []);

    const onComplete = () =>
        props.navigation.navigate("Finalized", {
            route: route,
            access: "host",
            weather: weather,
        });

    if (isLoading) {
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
        onComplete();
        return null;
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },
});

const mapStateToProps = (state) => {
    return {
        difference: state.date_select.difference,
    };
};

export default connect(mapStateToProps, null)(Loading);
