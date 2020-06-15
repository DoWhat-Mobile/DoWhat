import React from 'react';
import { View, Text, StyleSheet, Button } from "react-native";
import { SearchBar } from 'react-native-elements';

const Explore = (props) => {
    const [search, updateSearch] = React.useState('');

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