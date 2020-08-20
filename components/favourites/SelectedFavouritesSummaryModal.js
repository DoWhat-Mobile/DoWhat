import React from 'react';
import {
	View,
	StyleSheet,
	Text,
	TouchableOpacity,
	FlatList,
	Dimensions,
	Image,
} from 'react-native';
import { Badge } from 'react-native-elements';
import { TIH_API_KEY } from 'react-native-dotenv';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { COLORS } from '../../assets/colors';

/**
 * More details of events that user has selected from favourites list for planning.
 * This is an extension from the FavouritesBottomBar
 */
const SelectedFavouritesSummaryModal = ({ numberOfFavouritesClicked, onClose, allEvents }) => {
	const renderSummaryItem = (activity, index) => {
		return (
			<View style={styles.summaryItem}>
				<Entypo name='check' size={20} color={COLORS.orange} />
				<Text
					style={{
						fontSize: 14,
						fontWeight: '800',
						textAlign: 'left',
						marginLeft: 4,
					}}
				>
					{activity.title}
				</Text>
			</View>
		);
	};

	const cleanedEvents = allEvents.filter((event) => {
		// Remove all non-selected favourite events
		return event[2]; // True is selected
	});

	return (
		<View style={styles.modalContainer}>
			<View
				style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 12 }}
			>
				<Text style={styles.numberSelected}>
					{numberOfFavouritesClicked} activities selected
				</Text>

				<Badge
					value={
						<MaterialCommunityIcons
							name='chevron-down'
							color={COLORS.orange}
							size={28}
						/>
					}
					badgeStyle={{
						backgroundColor: 'white',
					}}
					onPress={onClose}
					containerStyle={{ marginRight: '5%', marginTop: '3%' }}
				/>
			</View>

			<View style={{ marginBottom: 16 }}>
				<FlatList
					data={cleanedEvents}
					horizontal={false}
					numColumns={2}
					renderItem={({ item, index }) => renderSummaryItem(item[0], index)}
					keyExtractor={(item, index) => item + index}
				/>
			</View>
		</View>
	);
};

export default SelectedFavouritesSummaryModal;

const styles = StyleSheet.create({
	modalContainer: {
		marginLeft: '5%',
	},
	summaryItem: {
		padding: 6,
		margin: 5,
		alignSelf: 'center',
		flexDirection: 'row',
		backgroundColor: 'white',
		borderRadius: 16,
		elevation: 3,
	},
	numberSelected: {
		fontSize: 16,
		fontWeight: 'bold',
		marginTop: '2.5%',
	},
});
