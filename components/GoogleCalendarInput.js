/**
 * Page for first step of application flow: Uploading of google calendar to get free timings
 * If a user does not want to upload google calendar, the user will skip and move on to manual
 * input of free timings instead.
 */
import React from 'react';
import { View, Text, AsyncStorage, Button, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import * as actions from '../actions';

class GoogleCalendarInput extends React.Component {
    onAuthComplete() {
        if (token) {
            props.navigation.navigate('Genre');
        }
    }

    loginToGoogle() {
        this.props.navigation.navigate('LoadingScreen');
        this.props.googleLogin();
        this.onAuthComplete(token);
    }

    render() {
        return (
            <View style={style.container}>
                <View style={style.calendar}>
                    <FontAwesomeIcon icon={faCalendarAlt} size={80} />
                </View>
                <View>
                    <Text style={style.header}>Sync Google Calendar</Text>
                    <Text style={style.subHeader}>
                        Upload your Google calendar for automated planning
                    </Text>
                    <Text>{this.props.token}</Text>
                </View>
                <Button title='Skip'
                    onPress={() => this.props.navigation.navigate('Timeline')} />
                <Button title='Continue'
                    onPress={() => this.loginToGoogle()} />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.token,
    }
}

export default connect(mapStateToProps, actions)(GoogleCalendarInput);

const style = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center'
    },
    calendar: {
        marginBottom: 50,
    },
    header: {
        fontSize: 32,
        color: '#7385d9',
        textAlign: 'center',
    },
    subHeader: {
        fontSize: 16,
        color: '#7385d9',
        textAlign: 'center',
    }

});