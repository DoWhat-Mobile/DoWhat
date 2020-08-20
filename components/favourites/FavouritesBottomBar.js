import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Badge } from 'react-native-elements';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../assets/colors';
import SelectedFavouritesSummaryModal from './SelectedFavouritesSummaryModal';

/**
 * Bottom tab dynamic tab of favourites list, shown when user is adding favourites for planning
 */
const FavouritesBottomBar = ({
	anyFavouritesClicked,
	favouriteSummaryModalVisible,
	setFavouriteSummaryModalVisible,
	numberOfFavouritesClicked,
	handleDoneSelectingFavourites,
	favourites,
}) => {
	const renderTextAndButton = () => {
		if (favouriteSummaryModalVisible) {
			return (
				<SelectedFavouritesSummaryModal
					numberOfFavouritesClicked={numberOfFavouritesClicked}
					onClose={() => setFavouriteSummaryModalVisible(false)}
					allEvents={favourites}
				/>
			);
		}

		return (
			<View
				style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 20 }}
			>
				<Text style={styles.numberSelected}>
					{numberOfFavouritesClicked} activities selected
				</Text>

				<Badge
					value={
						<MaterialCommunityIcons name='chevron-up' color={COLORS.orange} size={28} />
					}
					badgeStyle={{
						backgroundColor: 'white',
					}}
					onPress={() => setFavouriteSummaryModalVisible(true)}
					containerStyle={{ marginRight: '5%', marginTop: '3%' }}
				/>
			</View>
		);
	};

	if (!anyFavouritesClicked) return null;

	return (
		<View style={styles.container}>
			{renderTextAndButton()}

			<TouchableOpacity
				style={styles.summaryCartButton}
				disabled={true}
				onPress={handleDoneSelectingFavourites}
			>
				<Text
					style={{
						textAlign: 'center',
						color: 'white',
						justifyContent: 'center',
						fontWeight: 'bold',
						fontSize: 14,
					}}
				>
					Plan outing with favourites{' '}
				</Text>

				<MaterialCommunityIcons name='greater-than' color={'white'} size={20} />
			</TouchableOpacity>
		</View>
	);
};

export default FavouritesBottomBar;

const styles = StyleSheet.create({
	container: {
		opacity: 100,
		borderRadius: 8,
		backgroundColor: 'white',
	},
	summaryCartButton: {
		flexDirection: 'row',
		justifyContent: 'center',
		padding: 12,
		borderRadius: 5,
		marginLeft: '5%',
		marginRight: '5%',
		marginBottom: '3%',
		backgroundColor: '#D3D3D3',
	},
	numberSelected: {
		fontSize: 16,
		fontWeight: 'bold',
		marginLeft: '5%',
		marginTop: '2.5%',
	},
});
