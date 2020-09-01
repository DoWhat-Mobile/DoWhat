import React, { useCallback, useState } from 'react';
import {
	View,
	Text,
	StatusBar,
	StyleSheet,
	ActivityIndicator,
	TouchableOpacity,
	SectionList,
	Modal,
	Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../assets/colors';
import { useFocusEffect } from '@react-navigation/native';
import { connect } from 'react-redux';
import { removeFriend, findFriends } from '../../actions/friends_actions';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import firebase from '../../database/firebase';
import FriendRequestModal from './FriendRequestModal';
import SuggestedFriends from './SuggestedFriends';
import AllSuggestedFriendsModal from './AllSuggestedFriendsModal';
import { Badge, Avatar, Overlay } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';

const AllFriends = ({ userProfilePicture, userID }) => {
	useFocusEffect(
		useCallback(() => {
			findFriendsFromFirebase();
			return () => firebase.database().ref('users').off();
		}, [])
	);

	const [allAcceptedFriends, setAllAcceptedFriends] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [suggestedFriends, setSuggestedFriends] = useState([]);
	const [allSuggestedFriends, setAllSuggestedFriends] = useState([]);
	const [overlayVisible, setOverlayVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [noOfFriendRequests, setNoOfFriendRequests] = useState(0);

	// Subscribe to DB changes
	const findFriendsFromFirebase = () => {
		firebase
			.database()
			.ref('users')
			.on('value', (snapshot) => {
				const allAppUsers = snapshot.val();
				const currUserDetails = allAppUsers[userID];
				showAllMyFriends(currUserDetails); // All accepted friends
				getSuggestedFriends(allAppUsers, currUserDetails);
			});
	};

	// Check if requests has been sent before, prevents spamming from a user.
	const friendRequestAlreadySent = (user) => {
		// Check if there is even a user node
		if (user.hasOwnProperty('friends')) {
			if (user.friends.hasOwnProperty('requests')) {
				const allFriendRequests = user.friends.requests;

				for (var requestee in allFriendRequests) {
					if (userID == allFriendRequests[requestee].firebase_id) {
						return true;
					}
				}
				return false; // If friend request not sent before.
			}
			return false; // No requests node, means not sent before
		}
		return false; // No friend node, means not sent before
	};

	// Check if request has been rejected by the requetee before
	const friendRequestAlreadyAccepted = (user) => {
		// Check if there is even a user node
		if (user.hasOwnProperty('friends')) {
			if (user.friends.hasOwnProperty('accepted')) {
				const allFriendRequestsAccepts = user.friends.accepted;

				for (var requestee in allFriendRequestsAccepts) {
					if (userID == allFriendRequestsAccepts[requestee].firebase_id) {
						return true;
					}
				}
				return false; // If friend request not sent before.
			}
			return false; // No requests node, means not sent before
		}
		return false; // No friend node, means not sent before
	};

	// Check if request has been rejected by the requetee before
	const friendRequestAlreadyRejected = (user) => {
		// Check if there is even a user node
		if (user.hasOwnProperty('friends')) {
			if (user.friends.hasOwnProperty('rejected')) {
				const allFriendRequestsRejects = user.friends.rejected;

				for (var requestee in allFriendRequestsRejects) {
					if (userID == allFriendRequestsRejects[requestee]) {
						return true;
					}
				}
				return false; // If friend request not sent before.
			}
			return false; // No requests node, means not sent before
		}
		return false; // No friend node, means not sent before
	};

	// Check if the person has already sent a friend request to this current user
	const hasPendingFriendRequest = (currRequesteeID, currUserDetails) => {
		if (currUserDetails.hasOwnProperty('friends')) {
			const currUserFriends = currUserDetails.friends;
			if (currUserFriends.hasOwnProperty('requests')) {
				const currUserFriendRequests = currUserFriends.requests;
				const noOfRequests = Object.keys(currUserFriendRequests).length;
				setNoOfFriendRequests(noOfRequests);
				for (var name in currUserFriendRequests) {
					const requesteeID = currUserFriendRequests[name].firebase_id;
					if (currRequesteeID == requesteeID) {
						return true;
					}
				}
				return false;
			} else {
				// No pending friend requests
				setNoOfFriendRequests(0);
				return false;
			}
		} else {
			setNoOfFriendRequests(0);
			return false;
		}
	};

	// Filter out suggested friends from all DoWhat users in Firebase
	const getSuggestedFriends = (allAppUsers, currUserDetails) => {
		var moreUsers = [];
		for (var id in allAppUsers) {
			// Find all users in database (This doesnt scale well with size...)
			const user = allAppUsers[id];

			if (userID == id) continue; // Dont display yourself as a friend to be added

			if (
				friendRequestAlreadyRejected(user) ||
				friendRequestAlreadyAccepted(user) ||
				hasPendingFriendRequest(id, currUserDetails)
			)
				continue;

			if (friendRequestAlreadySent(user)) {
				moreUsers.push([user, id, true]); // Show an already requested friend
			} else {
				moreUsers.push([user, id, false]); // Last boolean flag is to see if friend request is already sent
			}
		}

		if (moreUsers.length == 0) {
			// no more friends found
			return;
		}
		setSuggestedFriends([...moreUsers.slice(0, 3)]); // Limited friends shown
		setAllSuggestedFriends([...moreUsers]);
		setIsLoading(false); // Render screen once data loads
	};

	// Render all the friends that this current user has (accepted)
	const showAllMyFriends = (user) => {
		if (user.hasOwnProperty('friends')) {
			if (user.friends.hasOwnProperty('accepted')) {
				const allAcceptedFriends = user.friends.accepted;
				addToState(allAcceptedFriends);
			}
		} else {
			return;
		}
	};

	const addToState = (allFriends) => {
		var friends = [];
		for (var user in allFriends) {
			const formattedUser = [
				user,
				allFriends[user].firebase_id,
				allFriends[user].picture_url,
			];
			friends.push(formattedUser);
		}
		setAllAcceptedFriends([...friends]);
	};

	const renderFriends = (name, userID, pictureURL) => {
		return (
			<View>
				<View style={styles.friendCard}>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<Image
							source={{ uri: pictureURL }}
							style={{
								height: 50,
								width: 50,
								borderRadius: 100,
								marginRight: 20,
							}}
						/>
						<Text style={{ marginLeft: '2%' }}>{name.replace(/_/g, ' ')}</Text>
					</View>
					<TouchableOpacity
						onPress={() => alert('More details about user (future enhancement)')}
					>
						<Feather name='info' size={24} color='black' />
					</TouchableOpacity>
				</View>
				<View
					style={{
						marginTop: 15,
						marginLeft: 70,
						borderBottomColor: '#d9d9d9',
						borderBottomWidth: 1,
					}}
				/>
			</View>
		);
	};

	const closeModal = () => {
		setModalVisible(false);
	};

	const openOverlay = () => {
		setOverlayVisible(true);
	};

	const closeOverlay = () => {
		setOverlayVisible(false);
	};

	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center' }}>
				<ActivityIndicator size='large' />
			</View>
		);
	}

	const ListHeaderComponent = () => {
		return (
			<View style={styles.header}>
				<Image
					style={{
						borderRadius: 100,
						height: 30,
						width: 30,
						borderWidth: 1,
						borderColor: 'white',
						marginLeft: 16,
					}}
					source={{
						uri: userProfilePicture,
					}}
				/>

				<Text style={styles.headerText}>Friends</Text>
				<TouchableOpacity
					style={{
						color: 'white',
						textDecorationLine: 'underline',
						marginTop: 4,
						marginRight: 16,
					}}
					onPress={() => setModalVisible(true)}
				>
					<MaterialCommunityIcons name='account-plus' color={'white'} size={20} />
					{noOfFriendRequests == 0 ? null : (
						<Badge
							value={noOfFriendRequests.toString()}
							status='primary'
							containerStyle={{
								position: 'absolute',
								top: -4,
								right: -4,
							}}
						/>
					)}
				</TouchableOpacity>
			</View>
		);
	};

	const HeaderCategoryButtons = () => {
		return (
			<View
				style={{
					flex: 1,
					flexDirection: 'row',
					justifyContent: 'space-around',
					marginTop: 10,
					backgroundColor: 'white',
				}}
			>
				<View style={styles.sectionHeader}>
					<SuggestedFriends
						friends={suggestedFriends}
						seeMore={openOverlay}
						fullView={false}
					/>
				</View>
			</View>
			// </View>
		);
	};

	const renderAllAcceptedFriends = () => {
		if (allAcceptedFriends.length == 0) {
			// No accepted friends, show empty state screen
			return (
				<View>
					<Text
						style={{
							margin: 5,
							fontSize: 14,
							color: 'grey',
							textAlign: 'center',
						}}
					>
						No friends yet, your added friends will appear here
					</Text>
				</View>
			);
		}
		return (
			<View style={{ marginHorizontal: 15, marginBottom: 15 }}>
				<Text style={{ fontWeight: 'bold', fontSize: 20 }}>My Friends</Text>
				<SectionList
					progressViewOffset={100}
					sections={[{ title: '', data: allAcceptedFriends }]}
					// Item is [name, firebaseUID, pictureURL]
					renderItem={({ item }) => renderFriends(item[0], item[1], item[2])}
					keyExtractor={(item, index) => index}
				/>
			</View>
		);
	};

	return (
		<View style={{ flex: 1 }}>
			<View style={{ flex: 1 }}>
				<ListHeaderComponent />
			</View>

			<View style={styles.sectionHeader}>
				<SuggestedFriends
					friends={suggestedFriends}
					seeMore={openOverlay}
					fullView={false}
				/>
			</View>

			<View style={styles.body}>
				<Modal
					animationType='fade'
					transparent={false}
					visible={modalVisible}
					onRequestClose={() => {
						Alert.alert('Modal has been closed.');
					}}
				>
					<FriendRequestModal onClose={closeModal} />
				</Modal>
				{renderAllAcceptedFriends()}
			</View>
		</View>
	);
};

const mapStateToProps = (state) => {
	return {
		userID: state.add_events.userID,
		userProfilePicture: state.add_events.profilePicture,
	};
};

const mapDispatchToProps = {
	removeFriend,
	findFriends,
};

export default connect(mapStateToProps, mapDispatchToProps)(AllFriends);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: '10%',
	},

	suggestedFriends: {
		fontWeight: 'bold',
		fontSize: 22,
	},

	header: {
		flex: 1,
		elevation: 1,
		paddingTop: StatusBar.currentHeight,
		paddingBottom: '10%',
		flexDirection: 'row',
		backgroundColor: COLORS.orange,
		justifyContent: 'space-between',
	},
	sectionHeader: {
		flex: 3,
		borderWidth: 0.1,
		marginTop: 30,
		margin: 5,
	},
	headerText: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	body: {
		flex: 5,
	},
	addFriendButton: {
		borderWidth: 1,
		justifyContent: 'flex-end',
	},
	friendCard: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingBottom: '2%',
		paddingTop: '2%',
		marginTop: 10,
		borderRadius: 8,
		alignItems: 'center',
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
