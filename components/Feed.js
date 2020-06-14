import React from 'react';
import { View, Text, Button, StyleSheet, SectionList } from "react-native";
import { Card, Icon } from 'react-native-elements';

const data =
    <Card
        title='HELLO WORLD'
        image={require('../assets/FriendsHangout.png')}>
        <Text style={{ marginBottom: 10 }}>
            The idea with React Native Elements is more about component structure than actual design.
  </Text>
        <Button
            icon={<Icon name='code' color='#ffffff' />}
            buttonStyle={{ borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0 }}
            title='VIEW NOW' />
    </Card>

const Feed = (props) => {
    return (
        <View style={styles.container}>
            <SectionList
                sections={[
                    { title: "What is currently popular", data: [data, data, data, data, data] }
                    // { title: 'D', data: [data, 'Dan', 'Dominic'] },
                    // { title: 'J', data: ['Jackson', 'James', 'Jillian', 'Jimmy', 'Joel', 'John', 'Julie'] },
                ]}
                renderItem={({ item }) => item}//<Text style={styles.item}>{item}</Text>}
                renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
                keyExtractor={(item, index) => index}
            />
        </View >
    );
}

export default Feed;

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