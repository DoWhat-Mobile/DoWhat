import React from 'react';
import { View, Text, StyleSheet, Button } from "react-native";
import { SearchBar } from 'react-native-elements';
import * as Linking from "expo-linking";

const Explore = (props) => {
    const [search, updateSearch] = React.useState('');
    const [URL, setURL] = React.useState('');
    const [path, setPath] = React.useState('');

    const _handleUrl = () => {
        Linking.getInitialURL() // Promise resolved to the url used to open this app
            .then(url => {
                setURL({ url });
                let { path, queryParams } = Linking.parse(url);
                let newUrl = Linking.parse(url);
                alert(`path: ${path} and data: ${JSON.stringify(queryParams)}` + '\n\n URL Is: ' +
                    url + "\n\n properties: " + JSON.stringify(newUrl.queryParams));
            })
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <SearchBar
                    placeholder="Find more events!"
                    onChangeText={input => updateSearch(input)}
                    value={search}
                />
            </View>

            <View style={styles.body}>
                <Text style={{ textAlign: "center" }}>This will be the search portion of app</Text>
            </View>

            <View style={styles.footer}>
                <Button title="Get Details from URLsss" onPress={() => _handleUrl()} />
                <Button title="Plan activities for me" onPress={() => props.navigation.navigate("DateSelection")} />
            </View>

        </View >
    );
}

export default Explore;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flex: 1,
    },
    body: {
        flex: 7,
        justifyContent: 'center',
    },
    footer: {
        flex: 1,
    },
});