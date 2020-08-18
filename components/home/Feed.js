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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ReadMore from 'react-native-read-more-text';
import {
	setAddingFavourites,
	addFavouritesToPlan,
	setAddingFavouritesToExistsingBoard,
} from '../../actions/favourite_event_actions';
import SelectedFavouritesSummaryModal from '../favourites/SelectedFavouritesSummaryModal';
import HomeFavouritesHeader from '../favourites/HomeFavouritesHeader';
import FeedEventCard from './FeedEventCard';

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
	const [whatsPopularData, setWhatsPopularData] = useState([]);
	const [hungryData, setHungryData] = useState([]);
	const [somethingNewData, setSomethingNewData] = useState([]);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [favourites, setFavourites] = useState([]); // All the favourited events, and whether or not they are selected

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

					// So home feed knows which events are favorited
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

					if (Object.keys(allCategories).length !== 0) {
						// Check that event has already been loaded from redux state
						const data = handleEventsOf(allCategories, userData.preferences);
						setWhatsPopularData(data[0]);
						setHungryData(data[1]);
						setSomethingNewData(data[2]);
						setIsLoading(false);
					}
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
		// When user scrolls to reload
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

	const checkIfEventIsFavourited = (event) => {
		var isEventFavourited = false;
		favourites.forEach((selectedEvent) => {
			const favouritedEventID = selectedEvent[0].id;
			if (favouritedEventID == event[0].id) {
				isEventFavourited = true;
			}
		});

		return event[0].favourited || isEventFavourited;
	};

	/**
	 * Horizontal <FlatList> for food choices
	 * @param {*} event is a 2D array of [[{eventDetails}, ratings], ...]
	 */
	const formatFoodArray = (allEvents, sectionTitle, sectionIndex) => {
		return (
			<FlatList
				data={allEvents}
				horizontal={true}
				renderItem={({ item, index }) => (
					<FeedEventCard
						event={item}
						isEventFood={true}
						sectionTitle={sectionTitle}
						sectionIndex={sectionIndex}
						foodIndex={index}
						favourites={favourites}
					/>
				)}
				keyExtractor={(item, index) => item + index}
			/>
		);
	};

	const renderFeed = (item, section, index) => {
		if (section.title == 'Hungry?') {
			return formatFoodArray(item, section.title, index); // Render eateries
		}
		return (
			<FeedEventCard
				event={item}
				isEventFood={false}
				sectionTitle={section.title}
				sectionIndex={index}
				foodIndex={index}
				favourites={favourites}
			/>
		);
	};

	const scroll = (sectionIndex, itemIndex) => {
		sectionListRef.scrollToLocation({
			sectionIndex: sectionIndex,
			itemIndex: itemIndex,
			viewPosition: 0,
			viewOffSet: 10,
		});
	};

	const CategoryTitleText = ({ text }) => {
		return <Text style={styles.CategoryTitleText}>{text}</Text>;
	};

	const renderListHeaderComponent = (isFavouritesHeader) => {
		return (
			<View style={styles.header}>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
					}}
				>
					<Text style={styles.headerText}>
						{isFavouritesHeader ? 'Plan something!' : 'Welcome to DoWhat'}
					</Text>
					{isFavouritesHeader ? null : (
						<TouchableOpacity onPress={signOut}>
							<Text
								style={{
									color: 'grey',
									textDecorationLine: 'underline',
									marginRight: 5,
									marginTop: 50,
								}}
							>
								Sign out
							</Text>
						</TouchableOpacity>
					)}
				</View>
				<Text
					style={{
						marginTop: 0,
						marginBottom: 20,
						fontWeight: 'bold',
						marginLeft: 10,
						fontSize: 16,
						color: 'gray',
					}}
				>
					Browse Categories
				</Text>

				{isFavouritesHeader ? (
					<HomeFavouritesHeader
						addingFavouritesToPlan={addingFavouritesToPlan}
						resetAddingFavourites={resetAddingFavourites}
						setAddFavouritesToPlan={() => setAddingFavouritesToPlan(true)}
						viewAllEvents={() => setViewFavourites(false)}
						numOfFavouriteEvents={favourites.length}
					/>
				) : (
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
							justifyContent: 'space-around',
							marginTop: 5,
						}}
					>
						<View
							style={{
								flex: 2.5,
								flexDirection: 'row',
								justifyContent: 'space-around',
								marginLeft: -5,
								marginVertical: 15,
							}}
						>
							<View>
								<TouchableOpacity
									onPress={() => {
										setFavouriteSummaryModalVisibile(false);
										setAddingFavouritesToPlan(false);
										setAnyFavouritesClicked(false);
										setNumberOfFavouritesClicked(0);
										setViewFavourites(true);
									}}
									style={[styles.headerCategory, { backgroundColor: '#ffcccc' }]}
								>
									<MaterialCommunityIcons
										name='cards-heart'
										color={'#d00000'}
										size={25}
									/>
								</TouchableOpacity>
								<CategoryTitleText text='FAVOURITES' />
							</View>
							<View>
								<TouchableOpacity
									onPress={() => scroll(0, 0)}
									style={[styles.headerCategory, { backgroundColor: '#ffffb3' }]}
								>
									<MaterialCommunityIcons
										name='star'
										color={'#CCCC00'}
										size={25}
									/>
								</TouchableOpacity>
								<CategoryTitleText text='POPULAR' />
							</View>
							<View>
								<TouchableOpacity
									onPress={() => scroll(1, 0)}
									style={[styles.headerCategory, { backgroundColor: '#f2f2f2' }]}
								>
									<MaterialCommunityIcons
										name='silverware-variant'
										color={'#9d8189'}
										size={25}
									/>
								</TouchableOpacity>
								<CategoryTitleText text='EATERIES' />
							</View>
							<View>
								<TouchableOpacity
									onPress={() => scroll(2, 0)}
									style={[styles.headerCategory, { backgroundColor: '#cce0ff' }]}
								>
									<MaterialCommunityIcons
										name='city'
										color={'#3d5a80'}
										size={25}
									/>
								</TouchableOpacity>
								<CategoryTitleText text='DISCOVER' />
							</View>
						</View>
					</View>
				)}
			</View>
		);
	};

	const signOut = () => {
		firebase.auth().signOut();
		props.navigation.navigate('Auth');
	};

	var sectionListRef = {}; // For anchor tag use

	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center' }}>
				<ActivityIndicator size='large' />
			</View>
		);
	}

	// Normal view
	return (
		<View style={styles.container}>
			<SectionList
				onRefresh={() => refreshPage()}
				ref={(ref) => (sectionListRef = ref)}
				ListHeaderComponent={() => renderListHeaderComponent(false)}
				progressViewOffset={100}
				refreshing={isRefreshing}
				sections={[
					{
						title: 'Popular',
						data: whatsPopularData,
					}, // eventData[0] is an array of data items
					{ title: 'Hungry?', data: hungryData }, // eventData[1] is an array of one element: [data]
					{ title: 'Discover', data: somethingNewData }, // eventData[2] is an array data items
				]}
				renderItem={({ item, section, index }) => renderFeed(item, section, index)}
				renderSectionHeader={({ section }) => (
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionHeaderText}>{section.title}</Text>
					</View>
				)}
				keyExtractor={(item, index) => index}
			/>
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
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Feed);

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	headerText: {
		color: 'black',
		fontSize: 26,
		marginLeft: 10,
		textShadowColor: '#e85d04',
		fontWeight: 'bold',
		marginBottom: 20,
		marginTop: 80,
	},
	headerCategory: {
		//borderWidth: 0.5,
		padding: 15,
		borderRadius: 30,
		//elevation: 0.01,
		alignSelf: 'center',
	},
	header: {
		backgroundColor: 'white',
		elevation: 0.1,
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
	// sectionHeader: {
	//     marginRight: 15,
	//     marginTop: 5,
	//     borderRadius: 5,
	//     borderWidth: 0.5,
	//     borderColor: "black",
	//     //backgroundColor: "#e63946",
	// },
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
