import React, { useCallback, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	SectionList,
	ActivityIndicator,
	Image,
	FlatList,
	TouchableOpacity,
	Dimensions,
	Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card, Badge } from 'react-native-elements';
import firebase from '../../database/firebase';
import { handleEventsOf } from '../../reusable-functions/HomeFeedLogic';
import { TIH_API_KEY } from 'react-native-dotenv';
import { connect } from 'react-redux';
import ReadMore from 'react-native-read-more-text';
import {
	setAddingFavourites,
	addFavouritesToPlan,
	setAddingFavouritesToExistsingBoard,
} from '../../actions/favourite_event_actions';
import SelectedFavouritesSummaryModal from './SelectedFavouritesSummaryModal';
import HomeFavouritesHeader from './HomeFavouritesHeader';
import FavouritesEventCard from './FavouritesEventCard';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../assets/colors';
import { FontAwesome5 } from '@expo/vector-icons';

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
	const [favouriteSummaryModalVisible, setFavouriteSummaryModalVisibile] = useState(false); // Summary of all events in cart

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

	// Add entire event into user's firebase node under favourites
	const handleAddToFavourites = (event, sectionTitle, index, foodIndex) => {
		var updates = {};
		var eventWithRating = event[0];
		eventWithRating.rating = event[1];
		eventWithRating.votes = 0; // For use in collaboration board

		// Visual cue to users, add heart to card
		if (sectionTitle == 'Hungry?') {
			var newData = hungryData[index][foodIndex];
			newData[0].favourited = !newData[0].favourited; // Mark as favourited
			var finalData = [...hungryData[index]];
			finalData[foodIndex] = newData;
			setHungryData([[...finalData]]);
			eventWithRating.favourited = newData[0].favourited; // For Firebase update
		} else if (sectionTitle == 'Find something new') {
			var newData = somethingNewData[index];
			newData[0].favourited = !newData[0].favourited; // Mark as favourited
			var finalData = [...somethingNewData];
			finalData[index] = newData;
			setSomethingNewData([...finalData]);
			eventWithRating.favourited = newData[0].favourited; // For Firebase update
		} else {
			// What is popular
			var newData = [...whatsPopularData[index]];
			newData[0].favourited = !newData[0].favourited; // Mark as favourited
			var finalData = [...whatsPopularData];
			finalData[index] = newData;
			setWhatsPopularData([...finalData]);
			eventWithRating.favourited = newData[0].favourited; // For Firebase update
		}

		if (eventWithRating.favourited) {
			updates['/favourites/' + event[0].id] = eventWithRating; // add

			// Add to component state, so no need to pull data from Firebase
			var additionalEvent = [];
			additionalEvent[0] = eventWithRating; // Entire event object
			additionalEvent[1] = event[1]; // Rating of event
			additionalEvent[2] = false; // Selected or not
			setFavourites([...favourites, additionalEvent]);
		} else {
			updates['/favourites/' + event[0].id] = null; // remove
			var newState = [...favourites];
			newState = newState.filter((currEvent) => currEvent[0].id != event[0].id);
			setFavourites(newState);
		}
		// Update Firebase
		firebase
			.database()
			.ref('/users/' + props.userID)
			.update(updates);
	};

	const handleDoneSelectingFavourites = () => {
		var allEvents = [];
		favourites.forEach((event) => {
			// Include all events selected
			const shouldEventBeAdded = event[2];
			if (shouldEventBeAdded) {
				allEvents.push(event);
			}
		});

		Alert.alert(
			'Add to plan',
			'Where would you like to include all the selected favourite events?',
			[
				{
					text: 'Cancel',
					onPress: () => console.log('Cancel Pressed'),
					style: 'cancel',
				},
				{
					text: 'Ongoing collaboration',
					onPress: () => handleAddFavouriteToCollab(allEvents),
				},
				{
					text: 'Start a new plan',
					onPress: () => handleAddFavouriteToPersonal(allEvents),
				},
			],
			{ cancelable: true }
		);
	};

	const resetAddingFavourites = () => {
		// If any favourites selected, unselect them.
		var newState = [...favourites];
		newState.forEach((event) => {
			event[2] = false; // Unselect
		});
		setNumberOfFavouritesClicked(0);
		setAnyFavouritesClicked(false);
		setFavouriteSummaryModalVisibile(false);
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
		setAnyFavouritesClicked(anyEventSelected);
	};

	// Toggle for whether or not event will be included in planning when adding to plan
	const handleFavouriteEventPress = (event, index) => {
		var newState = [...favourites];
		// Maximum number clicked and attempting to add a fourth event
		if (numberOfFavouritesClicked == 3 && newState[index][2] == false) return;

		newState[index][2] = !newState[index][2];
		addToSummaryCart(event, newState[index][2]);
		setFavourites(newState);
	};

	// Functionality of remove button in summary cart
	const removeSelectedFavourite = (eventID) => {
		var newState = [...favourites];
		for (var i = 0; i < newState.length; i++) {
			const currEventID = newState[i][0].id;
			if (currEventID == eventID) {
				newState[i][2] = false; // Unselect
			}
		}
		setFavourites(newState);
		if (numberOfFavouritesClicked - 1 == 0) {
			// No more favourites clicked, close modals
			setFavouriteSummaryModalVisibile(false);
			setAnyFavouritesClicked(false);
		}
		setNumberOfFavouritesClicked(numberOfFavouritesClicked - 1);
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
						onPress={() => alert('Plan with friends')}
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

	return (
		<View style={styles.container}>
			<View style={{ flex: 1, backgroundColor: COLORS.orange }}>
				<ListHeaderComponent />
			</View>

			<View style={{ flex: 9, marginTop: 16 }}>
				<SectionList
					onRefresh={() => refreshPage()}
					ref={(ref) => (sectionListRef = ref)}
					progressViewOffset={100}
					refreshing={isRefreshing}
					sections={[{ title: 'My favourites', data: favourites }]}
					renderItem={({ item, section, index }) => (
						<FavouritesEventCard
							event={item}
							isEventFood={false}
							sectionTitle={'favourites'}
							index={index}
							foodIndex={0}
							favourites={favourites}
							addingFavouritesToPlan={addingFavouritesToPlan}
						/>
					)}
					keyExtractor={(item, index) => index}
				/>

				{favouriteSummaryModalVisible ? ( // Modal of cart sumamry
					<SelectedFavouritesSummaryModal
						onClose={() => setFavouriteSummaryModalVisibile(false)}
						allEvents={favourites}
						removeSelectedFavourite={removeSelectedFavourite}
					/>
				) : null}

				{anyFavouritesClicked ? (
					<View style={{ opacity: 100 }}>
						{favouriteSummaryModalVisible ? null : ( // Show opening arrow when modal is not visible
							<Badge
								value={
									<MaterialCommunityIcons
										name='chevron-up'
										color={'white'}
										size={28}
									/>
								}
								badgeStyle={{
									backgroundColor: '#cc5237',
									paddingTop: 15,
									paddingBottom: 15,
									borderTopLeftRadius: 10,
									borderTopRightRadius: 10,
									borderWidth: 0,
								}}
								onPress={() => setFavouriteSummaryModalVisibile(true)}
								containerStyle={{
									position: 'relative',
									top: 5,
									right: -100,
								}}
							/>
						)}

						{numberOfFavouritesClicked == 3 ? ( // error message when max number of events clicked
							<Text
								style={{
									position: 'absolute',
									marginTop: 5,
									marginLeft: 20,
									color: 'red',
									fontWeight: '600',
								}}
							>
								Maximum number of events added
							</Text>
						) : null}

						<View
							style={[
								styles.summaryCartBottomContainer,
								favouriteSummaryModalVisible
									? {
											borderTopLeftRadius: 0,
											borderTopRightRadius: 0,
											borderTopWidth: 0.2,
											borderTopColor: 'white',
									  }
									: {},
							]}
						>
							<Text
								style={{
									textAlign: 'center',
									color: 'white',
									justifyContent: 'center',
									fontWeight: 'bold',
									fontSize: 14,
									marginTop: 3,
									marginLeft: 10,
								}}
							>
								{numberOfFavouritesClicked} | Use events for plan
							</Text>

							<TouchableOpacity
								onPress={handleDoneSelectingFavourites}
								style={{
									padding: 5,
									backgroundColor: 'white',
									borderRadius: 5,
								}}
							>
								<MaterialCommunityIcons
									name='greater-than'
									color={'black'}
									size={16}
								/>
							</TouchableOpacity>
						</View>
					</View>
				) : null}

				{
					// Render empty state favourites screen
					favourites.length == 0 ? (
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
								Add an event to favourites by clicking on the heart in the event in
								the home feed.
							</Text>
						</View>
					) : null
				}
			</View>
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
	},
	headerText: {
		color: 'white',
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 4,
		textAlign: 'center',
	},
	headerCategory: {
		flexDirection: 'row',
		borderWidth: 0.2,
		borderColor: 'grey',
		paddingLeft: 14,
		paddingRight: 14,
		borderRadius: 30,
		alignSelf: 'center',
		backgroundColor: 'white',
		elevation: 1,
	},
	header: {
		flex: 1,
		elevation: 1,
		paddingTop: '10%',
		paddingBottom: '10%',
		flexDirection: 'row',
		backgroundColor: COLORS.orange,
		justifyContent: 'space-between',
	},
	CategoryTitleText: {
		color: 'black',
		textAlign: 'center',
		fontSize: 13,
		fontWeight: 'bold',
		marginTop: 10,
	},
	sectionHeaderText: {
		fontSize: 22,
		fontWeight: 'bold',
		marginLeft: 10,
		marginBottom: 5,
		marginTop: 10,
	},
	cardButton: {
		borderRadius: 5,
		marginLeft: '1%',
		marginRight: '1%',
		borderWidth: 0.2,
		borderColor: 'black',
		backgroundColor: '#457b9d',
	},
	moreDetailsButtonText: {
		color: '#f1faee',
		fontWeight: '300',
		textAlign: 'center',
	},
	favouritesButton: {
		borderWidth: 0.1,
		padding: 5,
	},
	favouritesButtonText: {
		fontSize: 12,
		fontWeight: 'bold',
		textAlign: 'center',
		color: 'black',
	},
	modalContainer: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-end',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 10,
	},
	summaryCartBottomContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding: 10,
		borderRadius: 5,
		marginLeft: '5%',
		marginRight: '5%',
		backgroundColor: '#cc5237',
	},
	planWithFavouritesButton: {
		flex: 1,
		borderRightWidth: 1,
		marginLeft: 5,
	},
});
