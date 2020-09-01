import React, { useCallback, useState } from 'react';
import {
	View,
	Modal,
	Text,
	StyleSheet,
	SectionList,
	StatusBar,
	ActivityIndicator,
	Image,
	TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import firebase from '../../database/firebase';
import { handleEventsOf } from '../../reusable-functions/HomeFeedLogic';
import { connect } from 'react-redux';
import {
	setAddingFavourites,
	addFavouritesToPlan,
	setAddingFavouritesToExistsingBoard,
} from '../../actions/favourite_event_actions';
import FavouritesEventCard from './FavouritesEventCard';
import EventModal from '../home/EventModal';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../assets/colors';
import { FontAwesome5 } from '@expo/vector-icons';
import FavouritesBottomBar from './FavouritesBottomBar';

/**
 * User feed in home page. Has 3 divisions: Show whats popular, eateries, and activities
 * that the user does not normally engage in.
 * @param {*} props
 */
const Feed = (props) => {
	useFocusEffect(
		useCallback(() => {
			var isMounted = true;
			getDataFromFirebase();
			setAnyFavouritesClicked(false);
			return () => {
				isMounted = false;
			};
		}, [props.allEvents])
	);

	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const [favourites, setFavourites] = useState([]); // All the favourited events, and whether or not they are selected
	const [addingFavouritesToPlan, setAddingFavouritesToPlan] = useState(false); // Selecting which favourited events to use in plan
	const [anyFavouritesClicked, setAnyFavouritesClicked] = useState(false); // Show bottom summary cart when any clicked
	const [numberOfFavouritesClicked, setNumberOfFavouritesClicked] = useState(0);
	const [favouriteSummaryModalVisible, setFavouriteSummaryModalVisible] = useState(false); // Summary of all events in cart

	// For show more details of activities modal
	const [isVisible, setVisible] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState(null);

	const getDataFromFirebase = async () => {
		try {
			const database = firebase.database();
			const userId = firebase.auth().currentUser.uid;
			database
				.ref('users/' + userId)
				.once('value')
				.then((snapshot) => {
					const userData = snapshot.val();
					const allCategories = props.allEvents; // Get all events from redux state

					if (userData.hasOwnProperty('favourites')) {
						const userFavourites = userData.favourites;
						var favouritesArr = [];
						for (var event in userFavourites) {
							const formattedData = [
								userFavourites[event],
								userFavourites[event].rating,
								false,
							]; // Last boolean if is adding
							favouritesArr.push(formattedData);
						}
						setFavourites(favouritesArr);
					}
					setIsLoading(false);
				});
		} catch (err) {
			console.log('Error getting data from firebase: ', err);
			getDataForFirstTimeUsers();
		}
	};

	// First time users has no preference history, and no favourited events
	const getDataForFirstTimeUsers = async () => {
		try {
			const database = firebase.database();
			database
				.ref('events')
				.once('value')
				.then((snapshot) => {
					const allCategories = snapshot.val();

					// Check that event has already been loaded from redux state
					if (Object.keys(allCategories).length !== 0) {
						const data = handleEventsOf(
							allCategories,
							undefined // No preferences yet
						);
						setWhatsPopularData(data[0]);
						setHungryData(data[1]);
						setSomethingNewData(data[2]);
						setIsLoading(false);
					}
				});
		} catch (err) {
			console.log('Error getting data for first time users: ', err);
		}
	};

	const refreshPage = () => {
		setIsRefreshing(true);
		getDataFromFirebase();
		setIsRefreshing(false);
	};

	const handleDoneSelectingFavourites = (indicator) => {
		var allEvents = [];
		favourites.forEach((event) => {
			// Include all events selected
			const shouldEventBeAdded = event[2];
			if (shouldEventBeAdded) {
				allEvents.push(event);
			}
		});

		if (indicator == 0) {
			// Start new plan
			handleAddFavouriteToPersonal(allEvents);
		} else {
			// Add to ongoing collab
			handleAddFavouriteToCollab(allEvents);
		}
	};

	// When user stops planning with favourites
	const resetAddingFavourites = () => {
		// If any favourites selected, unselect them.
		var newState = [...favourites];
		newState.forEach((event) => {
			event[2] = false; // Unselect
		});
		setNumberOfFavouritesClicked(0);
		setAnyFavouritesClicked(false);
		setFavouriteSummaryModalVisible(false);
		setAddingFavouritesToPlan(false);
	};

	// Summary cart shows all the favourite events that have been selected to use in planning
	const addToSummaryCart = (event, isEventIncluded) => {
		var anyEventSelected = false;
		var noOfFavsClicked = 0;
		favourites.forEach((selectedEvent) => {
			const eventIsSelected = selectedEvent[2];
			if (eventIsSelected) {
				noOfFavsClicked += 1;
				anyEventSelected = true;
			}
		});
		setNumberOfFavouritesClicked(noOfFavsClicked);
	};

	// Toggle for whether or not event will be included in planning when adding to plan
	const selectFavouriteEventForPlan = (event, index) => {
		var newState = [...favourites];
		// Maximum number clicked and attempting to add a fourth event
		if (numberOfFavouritesClicked == 3 && newState[index][2] == false) return;

		newState[index][2] = !newState[index][2];
		addToSummaryCart(event, newState[index][2]);
		setFavourites(newState);
	};

	const handleAddFavouriteToCollab = (allEvents) => {
		props.setAddingFavouritesToExistsingBoard(true); // Mark redux state before navigating
		props.addFavouritesToPlan(allEvents);
		props.navigation.navigate('Plan');
		setAddingFavouritesToPlan(false);
	};

	const handleAddFavouriteToPersonal = (allEvents) => {
		props.setAddingFavourites(true); // Update redux state before navigating
		props.addFavouritesToPlan(allEvents);
		props.navigation.navigate('Plan');
		setAddingFavouritesToPlan(false);
	};

	const handleRemoveFavourites = (event, index) => {
		// Remove from Firebase
		firebase
			.database()
			.ref('/users/' + props.userID + '/favourites/' + event[0].id)
			.remove();

		// Remove from component state
		var newFavourites = [...favourites];
		newFavourites = newFavourites.filter((selectedEvent) => selectedEvent[0].id != event[0].id);
		setFavourites(newFavourites);
	};

	const handleCardPress = (selectedEvent) => {
		setSelectedEvent(selectedEvent);
		setVisible(true);
	};

	const onModalClose = () => {
		setVisible(false);
	};

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
						uri: props.userProfilePicture,
					}}
				/>

				<Text style={styles.headerText}>Favourites</Text>

				<View style={{ flexDirection: 'row' }}>
					<TouchableOpacity
						onPress={() => {
							if (addingFavouritesToPlan) {
								resetAddingFavourites();
								setAddingFavouritesToPlan(false);
							} else {
								setAnyFavouritesClicked(true); // Open bottom modal
								setAddingFavouritesToPlan(true);
							}
						}}
						style={{
							color: 'white',
							marginTop: 4,
							marginRight: 8,
						}}
					>
						<FontAwesome5 name='clipboard-list' size={20} color='white' />
					</TouchableOpacity>

					<TouchableOpacity
						onPress={signOut}
						style={{
							color: 'white',
							marginTop: 4,
							marginRight: 8,
						}}
					>
						<Feather name='more-horizontal' size={20} color='white' />
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	const signOut = () => {
		firebase.auth().signOut();
		props.navigation.navigate('Auth');
	};

	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center' }}>
				<ActivityIndicator size='large' />
			</View>
		);
	}

	if (favourites.length == 0) {
		// Empty state screen
		return (
			<View style={{ flex: 20, justifyContent: 'center' }}>
				<Text
					style={{
						fontSize: 20,
						fontWeight: 'bold',
						textAlign: 'center',
					}}
				>
					No favourites added yet.
				</Text>
				<Text
					style={{
						margin: 5,
						fontSize: 14,
						color: 'grey',
						textAlign: 'center',
					}}
				>
					Add an event to favourites by clicking on the heart in the event in the home
					feed.
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={{ flex: 1, backgroundColor: COLORS.orange }}>
				<ListHeaderComponent />
			</View>

			<View style={{ flex: 9, marginTop: 36 }}>
				<SectionList
					onRefresh={() => refreshPage()}
					progressViewOffset={100}
					refreshing={isRefreshing}
					sections={[{ title: 'My favourites', data: favourites }]}
					renderItem={({ item, index }) => (
						<FavouritesEventCard
							event={item}
							index={index}
							handleRemoveFromFavourites={handleRemoveFavourites}
							addingFavouritesToPlan={addingFavouritesToPlan}
							handleCardPress={handleCardPress}
							selectFavouriteEventForPlan={selectFavouriteEventForPlan}
						/>
					)}
					keyExtractor={(item, index) => index}
				/>

				<FavouritesBottomBar
					anyFavouritesClicked={anyFavouritesClicked}
					favouriteSummaryModalVisible={favouriteSummaryModalVisible}
					setFavouriteSummaryModalVisible={setFavouriteSummaryModalVisible}
					numberOfFavouritesClicked={numberOfFavouritesClicked}
					handleDoneSelectingFavourites={handleDoneSelectingFavourites}
					favourites={favourites}
					resetAddingFavourites={resetAddingFavourites}
				/>
			</View>

			<Modal transparent={true} animated visible={isVisible} animationType='fade'>
				<EventModal event={selectedEvent} onClose={onModalClose} />
			</Modal>
		</View>
	);
};

const mapDispatchToProps = {
	setAddingFavourites,
	addFavouritesToPlan,
	setAddingFavouritesToExistsingBoard,
};

const mapStateToProps = (state) => {
	return {
		allEvents: state.add_events.events,
		userID: state.add_events.userID,
		userProfilePicture: state.add_events.profilePicture,
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Feed);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F0F0F0',
	},
	headerText: {
		color: 'white',
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 4,
		textAlign: 'center',
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
});
