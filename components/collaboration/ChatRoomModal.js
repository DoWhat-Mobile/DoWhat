import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { GiftedChat } from 'react-native-gifted-chat'
import { AntDesign } from "@expo/vector-icons";
import firebase from '../../database/firebase';
import Firebase from 'firebase'; // To get serverValue timestamp

const ChatRoomModal = ({ onClose, userID, board, currUserName, profilePicture }) => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        listenToChanges();

        // Unsubscribe to changes when component unmount
        return () => {
            firebase.database().
                ref('collab_boards/' + board.boardID + '/messages').off()
        }
    }, [])

    const listenToChanges = () => {
        // Add history of messages to the collab board
        firebase.database().ref('collab_boards/' + board.boardID + '/messages')
            .limitToLast(20)
            .on('child_added', snapshot => {
                const messagesFromFirebase = parse(snapshot);
                setMessages(previousMessages => GiftedChat.append(previousMessages, messagesFromFirebase));
            });
    }

    // Parse message from Firebase format for GiftedChat library
    const parse = snapshot => {
        const { timestamp: numberStamp, text, user } = snapshot.val();
        const { key: _id } = snapshot;
        const createdAt = new Date(numberStamp);
        const message = {
            _id,
            createdAt,
            text,
            user,
        };
        return message;
    };

    const getTimeStamp = () => {
        return Firebase.database.ServerValue.TIMESTAMP;
    }

    const append = (message) => {
        firebase.database().ref('collab_boards/' + board.boardID + '/messages').push(message);
    }

    // Convert message to format stored in Firebase
    const send = messages => {
        for (let i = 0; i < messages.length; i++) {
            const { text, user } = messages[i];
            const message = {
                text,
                user,
                timestamp: getTimeStamp(),
            };
            append(message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={{ alignSelf: "center" }}>Chat Room </Text>
            <TouchableOpacity onPress={() => onClose()}>
                <Text> </Text>
            </TouchableOpacity>
            <AntDesign
                name="close"
                size={24}
                onPress={() => onClose()}
                style={styles.close}
            />
            <GiftedChat messages={messages}
                onSend={send}
                user={{
                    _id: userID,
                    name: currUserName,
                    avatar: profilePicture
                }}
            />
        </View>
    )
}
const mapStateToProps = (state) => {
    return {
        userID: state.add_events.userID,
        currUserName: state.add_events.currUserName,
        profilePicture: state.add_events.profilePicture,
    };
};

export default connect(mapStateToProps, null)(ChatRoomModal);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    close: {
        position: "absolute",
        left: 350,
        right: 0,
        top: 15,
        bottom: 0,
    },
});