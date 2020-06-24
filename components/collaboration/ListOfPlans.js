
import React, { useState } from 'react';
import { Button, View, StyleSheet, Text, TouchableOpacity, SectionList, Dimensions, Modal } from 'react-native';
import IndividualPlanModal from './IndividualPlanModal';

/**
 * The <SectionList> Component within the AllPlans component. This is the component
 * which shows all the plans that the user is part of.
 */
const ListOfPlans = ({ plans, refreshList, navigation }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [modalVisibility, setModalVisibility] = useState(false);
    const [boardDetails, setBoardDetails] = useState({})

    // Not functional yet
    const refreshPage = () => {
        setIsRefreshing(true);
        refreshList();
        setIsRefreshing(false);
    }

    // To open each individual collaboration board modal
    const viewMoreDetails = (board) => {
        setBoardDetails(board); // Pass in the details of the clicked board to the modal
        setModalVisibility(true)

    }

    const goToFinalized = () => {
        navigation.navigate("Finalized", {
            route: "board",
            genres: ["adventure", "food"],
            timeInterval: [12, 18],
            filters: {
                area: ["North", "East"],
                cuisine: ["Western", "Asian"],
                price: 2
            }
        });
    }

    const renderCollaborationBoard = (board) => {
        return (
            <Button title="test" onPress={goToFinalized} />
        )
        // return (
        //     <TouchableOpacity onPress={() => viewMoreDetails(board)}>
        //         <View style={{ borderWidth: 1, borderRadius: 10, marginLeft: 10, marginRight: 10, padding: 10, marginTop: 10 }}>
        //             <Text>
        //                 Outing on: {board.selected_date}
        //             </Text>
        //             <Text>
        //                 Invited by: {board.host.replace("_", " ")}
        //             </Text>
        //         </View>
        //     </TouchableOpacity>
        // )
    }

    /* navigation.navigate("Finalized", { 
        route: "board"
        genres: [adventure, food],
        timeInterval:[12,23],
        filters: {area: [North, East],
                  cuisine: [Western, Asian],
                  price: 2} });
     */

    const closeModal = () => {
        setModalVisibility(false);
    }

    return (
        <View style={styles.container}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisibility}
                onRequestClose={() => {
                    closeModal()
                }}>
                <IndividualPlanModal onClose={closeModal} board={boardDetails} />
            </Modal>

            <SectionList
                onRefresh={() => refreshPage()}
                progressViewOffset={100}
                refreshing={isRefreshing}
                sections={[
                    { title: "", data: plans },
                ]}
                renderItem={({ item }) => renderCollaborationBoard(item)}
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
        </View >
    );
}

export default ListOfPlans;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerText: {
        textAlign: 'center',
        fontWeight: '800',
        fontSize: 20,
    },
    footer: {
        flex: 1,
    },
})