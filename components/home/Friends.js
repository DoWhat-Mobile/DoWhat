import React, { useEffect } from 'react';
import {
    View, Text, StyleSheet, Button, TouchableOpacity,
    Dimensions, SectionList, Image, Modal, TouchableHighlight
} from "react-native";
import { connect } from 'react-redux';
import { removeFriend, findFriends } from '../../actions/friends_actions';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import firebase from '../../database/firebase';
import FriendRequestModal from './FriendRequestModal';

const AllFriends = ({ userID }) => {
    useEffect(() => {
        showAllMyFriends(); // All accepted friends
    })

    const [allAcceptedFriends, setAllAcceptedFriends] = React.useState([]);
    const [modalVisible, setModalVisible] = React.useState(false);

    const showAllMyFriends = () => {
        firebase.database()
            .ref("users/" + userID)
            .once("value")
            .then((snapshot) => {
                const user = snapshot.val();
                if (user.hasOwnProperty('friends')) {
                    if (user.friends.hasOwnProperty('accepted')) {
                        const allAcceptedFriends = user.friends.accepted;
                        addToState(allAcceptedFriends);
                    }
                }
            })
    }

    const addToState = (allFriends) => {
        var friends = [];
        for (var user in allFriends) {
            // [name, userID]
            const formattedUser = [user, allFriends[user]];
            friends.push(formattedUser);

        }
        setAllAcceptedFriends([...friends]);
    }

    const renderFriends = (name, userID) => {
        return (
            <View style={styles.friend}>
                <Text style={{ marginLeft: '2%' }}>{name.replace('_', ' ')}</Text>
                <View style={styles.buttonGroup}>
                    <TouchableOpacity style={{ borderWidth: 1, borderRadius: 10, padding: 5 }}
                        onPress={() => alert("Invite for collab")}>
                        <Text>More details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const closeModal = () => {
        setModalVisible(false);
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style>
                    <Text style={styles.headerText}>Your Friends</Text>
                </View>

                <TouchableOpacity style={styles.headerButton}
                    onPress={() => setModalVisible(true)}>
                    <MaterialCommunityIcons name="account-plus" color={'black'} size={20} />
                </TouchableOpacity>
            </View>

            <View style={styles.body}>
                <Modal
                    animationType="fade"
                    transparent={false}
                    visible={modalVisible}
                    onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                    }}>
                    <FriendRequestModal onClose={closeModal} />
                </Modal>

                <SectionList
                    progressViewOffset={100}
                    sections={[
                        { title: "", data: allAcceptedFriends },
                    ]}
                    renderItem={({ item }) => renderFriends(item[0], item[1])} // Each item is [userDetails, UserID]
                    renderSectionHeader={({ section }) =>
                        <View style={styles.sectionHeader}>
                            <TouchableOpacity
                                onPress={() => handleTitlePress(section.title)}>
                                <Text style={styles.sectionHeaderText}>{section.title}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    keyExtractor={(item, index) => index}
                />

            </View>
        </View>
    );
}

const mapStateToProps = (state) => {
    return {
        userID: state.add_events.userID,
        allFriends: state.add_friends.allFriends
    };
};

const mapDispatchToProps = {
    removeFriend, findFriends
};

export default connect(mapStateToProps, mapDispatchToProps)(AllFriends);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flex: 1,
        flexDirection: "column",
        justifyContent: 'space-around',
    },
    headerText: {
        fontWeight: '800',
        fontSize: 20,
        marginTop: '15%',
        marginLeft: '8%',
        fontFamily: 'serif'

    },
    headerButton: {
        flex: 1,
        justifyContent: 'center',
        alignSelf: 'flex-end',
        borderRadius: 100,
        paddingRight: 15,
        paddingLeft: 15,
        paddingBottom: 25,
        paddingTop: 25,
        marginBottom: 10,
        marginRight: '5%',
        borderWidth: 1,
    },
    body: {
        flex: 8,
        justifyContent: 'center',
    },
    addFriendButton: {
        borderWidth: 1,
        justifyContent: 'flex-end'

    },
    friend: {
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: '5%',
        marginRight: '10%',
        paddingBottom: '2%',
        paddingTop: '2%',
        borderRadius: 8,

    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'space-between',
        padding: 5,

    },
    footer: {
        flex: 1,
    },
});