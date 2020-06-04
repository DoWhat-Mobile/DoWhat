import React from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';

/**
 * This component is a page for user to determine how many friends will be added to find the 
 * common overlapping intervals of available timings.
 * User will only come to this page if and after snycing their Google Calendar.
 */
class FriendInput extends React.Component {
    shareWithTelegram = (url) => {
        // Deep linking
        Linking.openURL('https://t.me/share/url?url=' + url + '&text=Here is the link to input your' +
            'calendar availability!');
    }

    shareWithWhatsapp = (url) => {
        Linking.openURL('whatsapp://send?' +
            'text=Here is the link to input your calendar availability!' +
            '')
    }

    render() {
        return (
            <View style={styles.container}>
                <Text>
                    Invite some friends
                </Text>

                <Button title='Share with Telegram'
                    onPress={() => this.shareWithTelegram(Linking.makeUrl())} />
                <Button title='Share with Whatsapp'
                    onPress={() => this.shareWithWhatsapp(Linking.makeUrl())} />
                <Button title='Know their schedule?'
                    onPress={() => this.props.navigation.navigate('Timeline')} />
            </View>
        );
    }
}

export default FriendInput

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})