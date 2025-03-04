import React, { useState, useEffect } from 'react';
import {
 View,
 Text,
 TouchableOpacity,
 ScrollView,
 StyleSheet,
 Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import PickList from './PickList';

// Minimal UI Components
const Card = ({ children, style, ...props }) => (
 <View style={[styles.card, style]} {...props}>
   {children}
 </View>
);


Card.Header = ({ children, style, ...props }) => (
 <View style={[styles.cardHeader, style]} {...props}>{children}</View>
);


Card.Title = ({ children, style, ...props }) => (
 <Text style={[styles.cardTitle, style]} {...props}>{children}</Text>
);


Card.Content = ({ children, style, ...props }) => (
 <View{...props}>{children}</View>
);


const Button = ({
 children,
 onPress,
 disabled,
 style,
 variant = 'outline',
 ...props
}) => {
 const variantStyles = {
   outline: styles.buttonOutline,
   secondary: styles.buttonSecondary
 };


 return (
   <TouchableOpacity
     onPress={onPress}
     disabled={disabled}
     style={[
       styles.button,
       variantStyles[variant],
       disabled && styles.buttonDisabled,
       style
     ]}
     {...props}
   >
     {children}
   </TouchableOpacity>
 );
};


const Alert = ({ children, variant = 'default', style, ...props }) => {
 const variantStyles = {
   destructive: styles.alertDestructive
 };


 return (
   <View
     style={[
       styles.alert,
       variantStyles[variant],
       style
     ]}
     {...props}
   >
     {children}
   </View>
 );
};


const AllianceSelection = () => {
 const [teams, setTeams] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [pickListTeams, setPickListTeams] = useState([]);
 const [competitionCode, setCompetitionCode] = useState('');

 // Move the async storage call into useEffect
 useEffect(() => {
   const loadCompetitionCode = async () => {
     const code = await AsyncStorage.getItem('EVENT_CODE');
     if (code) {
       setCompetitionCode(code.toLowerCase());
     }
   };
   loadCompetitionCode();
 }, []);

 // Load pick list teams from server when screen focuses
 useFocusEffect(
   React.useCallback(() => {
     const loadPickListTeams = async () => {
       try {
         const authToken = await AsyncStorage.getItem('ACCESS_TOKEN');
         const eventCode = await AsyncStorage.getItem('EVENT_CODE') || 'TEST';
         const response = await fetch(`http://97.107.134.214:5002/picklist/${eventCode}`, {
           headers: {
             'Authorization': `Bearer ${authToken}`
           }
         });
         
         if (response.ok) {
           const serverData = await response.json();
           const formattedTeams = serverData.map(team => ({
             id: team.team_number,
             name: `Team ${team.team_number}`,
             rank: team.picklist_rank
           }));
           setPickListTeams(formattedTeams);
         }
       } catch (error) {
         console.error('Failed to load pick list teams', error);
       }
     };
     
     // Reset alliance selection process
     setCurrentAllianceIndex(0);
     setIsReverse(false);
     setHistory([]);
     
     // Reload teams and initialize alliances
     const fetchTeams = async () => {
       try {
         const eventCode = await AsyncStorage.getItem('EVENT_CODE');
         if (!eventCode) {
           alert('Event code not found. Please set it in Admin Console.');
           return;
         }

         const response = await fetch(
           `https://frc-api.firstinspires.org/v3.0/2025/rankings/${eventCode}`,
           {
             headers: {
               'Authorization': 'Basic c2hyYXZhbnA6MjVhZWQzNjMtZWY0Yi00NTljLTg3MjYtZmY4MzlhNzgxNWMy'
             }
           }
         );
         
         if (!response.ok) throw new Error('Failed to fetch teams');
         
         const data = await response.json();
         const formattedTeams = data.Rankings.map(team => ({
           id: team.teamNumber,
           name: `Team ${team.teamNumber}`,
           rank: team.rank,
         })).sort((a, b) => a.rank - b.rank);
         
         setTeams(formattedTeams);
         setRemainingTeams(formattedTeams);
         
         // Reinitialize alliances with new teams
         const initialAlliances = Array.from({ length: 8 }, (_, i) => ({
           id: i + 1,
           captain: formattedTeams[i],
           members: [],
           hasPicked: false,
         }));
         setAlliances(initialAlliances);
       } catch (error) {
         setError('Failed to load team data');
         console.error(error);
       } finally {
         setLoading(false);
       }
     };
     
     setLoading(true);
     fetchTeams();
     loadPickListTeams();
     
   }, [competitionCode])
 );

 // Initialize states after teams are loaded
 const [alliances, setAlliances] = useState([]);
 const [remainingTeams, setRemainingTeams] = useState([]);
 const [currentAllianceIndex, setCurrentAllianceIndex] = useState(0);
 const [isReverse, setIsReverse] = useState(false);
 const [history, setHistory] = useState([]);

 // Add this useEffect to share competition teams
 useEffect(() => {
   const shareCompetitionTeams = async () => {
     try {
       const teamsToShare = teams.map(t => t.id);
       await AsyncStorage.setItem('competitionTeams', JSON.stringify(teamsToShare));
     } catch (error) {
       console.error('Failed to share competition teams', error);
     }
   };
   
   if (teams.length > 0) {
     shareCompetitionTeams();
   }
 }, [teams]);

 const saveToHistory = (currentState) => {
   // Create a deep copy of the current state before saving
   const stateCopy = {
     alliances: currentState.alliances.map(alliance => ({
       ...alliance,
       captain: { ...alliance.captain },
       members: [...alliance.members],
       hasPicked: alliance.hasPicked
     })),
     remainingTeams: [...currentState.remainingTeams],
     currentAllianceIndex: currentState.currentAllianceIndex,
     isReverse: currentState.isReverse
   };
   
   setHistory(prev => [...prev, stateCopy]);
 };


 const handleUndo = () => {
   if (history.length === 0) return;
   
   const previousState = history[history.length - 1];
   
   // Create a deep copy of the previous alliances state to ensure all properties are properly restored
   const restoredAlliances = previousState.alliances.map(alliance => ({
     ...alliance,
     captain: { ...alliance.captain },
     members: [...alliance.members],
     hasPicked: alliance.hasPicked // This will restore the correct hasPicked state
   }));

   setAlliances(restoredAlliances);
   setRemainingTeams(previousState.remainingTeams);
   setCurrentAllianceIndex(previousState.currentAllianceIndex);
   setIsReverse(previousState.isReverse);
   setHistory(prev => prev.slice(0, -1));
 };


 const handleSelection = (teamId) => {
   const selectedTeam = remainingTeams.find(team => team.id === teamId);
   if (!selectedTeam) return;

   const currentAlliance = alliances[currentAllianceIndex];

   // Handle self-selection
   if (currentAlliance.captain.id === teamId) {
     alert('Teams Cannot Select Themselves');
     return;
   }

   // Continue with normal selection process
   saveToHistory({
     alliances,
     remainingTeams,
     currentAllianceIndex,
     isReverse
   });

   setError('');

   if (selectedTeam.rank < currentAlliance.id) {
     setError('Alliance cannot select a higher-ranked team');
     return;
   }

   let updatedAlliances = [...alliances];
  
   updatedAlliances[currentAllianceIndex].hasPicked = true;

   const selectedCaptainIndex = alliances.findIndex(
     alliance => alliance.captain.id === selectedTeam.id
   );

   if (selectedCaptainIndex !== -1) {
     for (let i = selectedCaptainIndex; i < alliances.length - 1; i++) {
       updatedAlliances[i].captain = updatedAlliances[i + 1].captain;
       updatedAlliances[i].hasPicked = updatedAlliances[i + 1].hasPicked;
     }

     const highestRankingTeam = remainingTeams
       .filter(team =>
         team.id !== selectedTeam.id &&
         !updatedAlliances.some(a =>
           a.captain.id === team.id ||
           a.members.some(m => m.id === team.id)
         )
       )
       .sort((a, b) => a.rank - b.rank)[0];

     if (highestRankingTeam) {
       updatedAlliances[alliances.length - 1].captain = highestRankingTeam;
       updatedAlliances[alliances.length - 1].hasPicked = false;
     }
   }

   updatedAlliances[currentAllianceIndex].members.push(selectedTeam);

   setAlliances(updatedAlliances);

   // Update remaining teams
   const availableTeams = teams.filter(team => {
     if (team.id === selectedTeam.id) return false;
    
     if (updatedAlliances.some(alliance =>
       alliance.members.some(member => member.id === team.id)
     )) return false;
    
     const allianceAsCaptain = updatedAlliances.find(alliance =>
       alliance.captain.id === team.id
     );
     if (allianceAsCaptain && allianceAsCaptain.hasPicked) return false;
    
     return true;
   }).sort((a, b) => a.rank - b.rank);

   setRemainingTeams(availableTeams);

   // Update pickListTeams to remove the selected team
   setPickListTeams(prevPickListTeams => 
     prevPickListTeams.filter(team => team.id !== selectedTeam.id)
   );

   const allFull = updatedAlliances.every(alliance => alliance.members.length === 2);
   if (allFull) return;

   let nextIndex = currentAllianceIndex + (isReverse ? -1 : 1);

   if (nextIndex === alliances.length || nextIndex === -1) {
     setIsReverse(prev => !prev);
     nextIndex = isReverse ? 0 : alliances.length - 1;
   }

   setCurrentAllianceIndex(nextIndex);
 };


 const totalSelected = alliances.reduce((sum, alliance) => sum + alliance.members.length, 8);


 // Add reload function
 const handleReload = async () => {
   setLoading(true);
   setError('');
   try {
     // Reload competition teams
     const eventCode = await AsyncStorage.getItem('EVENT_CODE');
     if (!eventCode) {
       alert('Event code not found. Please set it in Admin Console.');
       return;
     }

     const response = await fetch(
       `https://frc-api.firstinspires.org/v3.0/2025/rankings/${eventCode}`,
       {
         headers: {
           'Authorization': 'Basic c2hyYXZhbnA6MjVhZWQzNjMtZWY0Yi00NTljLTg3MjYtZmY4MzlhNzgxNWMy'
         }
       }
     );
     
     if (!response.ok) throw new Error('Failed to fetch teams');
     
     const competitionData = await response.json();
     const formattedTeams = competitionData.Rankings.map(team => ({
       id: team.teamNumber,
       name: `Team ${team.teamNumber}`,
       rank: team.rank,
     })).sort((a, b) => a.rank - b.rank);
     
     setTeams(formattedTeams);
     setRemainingTeams(formattedTeams);

     // Reload picklist teams
     const authToken = await AsyncStorage.getItem('ACCESS_TOKEN');
     const picklistResponse = await fetch(`http://97.107.134.214:5002/picklist/${eventCode}`, {
       headers: {
         'Authorization': `Bearer ${authToken}`
       }
     });
     
     if (picklistResponse.ok) {
       const serverData = await picklistResponse.json();
       const formattedPicklist = (serverData || []).map(team => ({
         id: team.team_number || 0,
         name: `Team ${team.team_number || ''}`,
         rank: team.picklist_rank || 0
       }));
       setPickListTeams(formattedPicklist);
     }

   } catch (error) {
     setError('Failed to reload data');
     console.error(error);
   } finally {
     setLoading(false);
   }
 };


 if (loading) {
   return (
     <View style={styles.container}>
       <Text style={styles.cardTitle}>Loading teams...</Text>
     </View>
   );
 }

 if (error) {
   return (
     <View style={styles.container}>
       <Alert variant="destructive">
         <Text style={styles.errorText}>{error}</Text>
       </Alert>
     </View>
   );
 }

 if (totalSelected >= 24) {
   return (
     <ScrollView
       contentContainerStyle={styles.scrollContainer}
       keyboardShouldPersistTaps="handled"
       style={{ backgroundColor: '#000000' }}
     >
       <Card style={styles.container}>
         <Card.Header>
           <Card.Title>Finalized Alliances</Card.Title>
         </Card.Header>
         <Card.Content>
           <View style={styles.allianceGrid}>
             {alliances.map(alliance => (
               <Card key={alliance.id} style={styles.allianceCard}>
                 <Text style={styles.finalizedAllianceTitle}>Alliance {alliance.id}</Text>
                 <View style={styles.allianceDetails}>
                   <Text style={styles.finalizedCaptainText}>
                     Captain: {alliance.captain.name}
                     <Text style={styles.finalizedRankText}>(Rank {alliance.captain.rank})</Text>
                   </Text>
                   {alliance.members.map(member => (
                     <Text key={member.id} style={styles.finalizedMemberText}>
                       {member.name}
                       <Text style={styles.finalizedRankText}>(Rank {member.rank})</Text>
                     </Text>
                   ))}
                 </View>
               </Card>
             ))}
           </View>
         </Card.Content>
       </Card>
     </ScrollView>
   );
 }


 return (
   <ScrollView
     contentContainerStyle={styles.scrollContainer}
     keyboardShouldPersistTaps="handled"
     style={{ backgroundColor: '#000000' }}
   >
     <Card style={styles.container}>
       <Card.Header>
         <View style={styles.headerContainer}>
           <Card.Title>Alliance Selection</Card.Title>
           <View style={styles.buttonContainer}>
             <TouchableOpacity 
               style={styles.reloadButton}
               onPress={handleReload}
             >
               <Text style={styles.reloadButtonText}>🔄</Text>
             </TouchableOpacity>
             <TouchableOpacity 
               style={styles.undoButton}
               onPress={handleUndo}
               disabled={history.length === 0}
             >
               <Text style={[
                 styles.undoButtonText,
                 history.length === 0 && styles.undoButtonDisabled
               ]}>Undo</Text>
             </TouchableOpacity>
           </View>
         </View>
       </Card.Header>
       <Card.Content>
         {error ? (
           <Alert variant="destructive">
             <Text style={styles.errorText}>{error}</Text>
           </Alert>
         ) : null}
        
         <View style={styles.selectionContainer}>
           <View style={styles.halfWidth}>
             <Text style={styles.sectionTitle}>Current Alliances</Text>
             <ScrollView>
               {alliances.map((alliance, index) => (
                 <Card
                   key={alliance.id}
                   style={[
                     styles.allianceCard,
                     index === currentAllianceIndex && styles.currentAlliance
                   ]}
                 >
                   <Text style={styles.allianceTitle}>Alliance {alliance.id}</Text>
                   <View style={styles.allianceDetails}>
                     <Text style={styles.captainText}>
                       Captain: {alliance.captain.name}
                       <Text style={styles.rankText}>(Rank {alliance.captain.rank})</Text>
                       {alliance.hasPicked && (
                         <Text style={styles.pickedText}> (Has Picked)</Text>
                       )}
                     </Text>
                     {alliance.members.map(member => (
                       <Text key={member.id} style={styles.captainText}>
                         Member: {member.name}
                         <Text style={styles.rankText}>(Rank {member.rank})</Text>
                       </Text>
                     ))}
                   </View>
                 </Card>
               ))}
             </ScrollView>
           </View>


           <View style={styles.halfWidth}>
             <Card style={styles.pickListBox}>
               <Text style={styles.pickListTitle}>Pick List</Text>
               {pickListTeams.length > 0 && (
                 pickListTeams.slice(0, 3).map(team => (
                   <TouchableOpacity
                     key={team.id}
                     style={styles.pickListItem}
                     onPress={() => handleSelection(team.id)}
                   >
                     <Text style={styles.pickListTeamText}>
                       {team.name}
                       <Text style={styles.rankText}> Rank ({teams.find(t => t.id === team.id)?.rank || 'N/A'})</Text>
                     </Text>
                   </TouchableOpacity>
                 ))
               )}
             </Card>

             <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Available Teams</Text>
             <ScrollView>
               {remainingTeams.map(team => {
                 const isCaptain = alliances.some(alliance =>
                   alliance.captain.id === team.id && !alliance.hasPicked
                 );
                 const isAlliance1Captain = alliances[0]?.captain.id === team.id;
                 
                 return (
                   <Button
                     key={team.id}
                     onPress={() => handleSelection(team.id)}
                     disabled={team.rank === 1 || totalSelected >= 24}
                     variant={isCaptain ? "secondary" : "outline"}
                   >
                     <View style={styles.buttonContent}>
                       <Text style={[
                         styles.buttonText,
                         isCaptain && !isAlliance1Captain && styles.captainHighlight
                       ]}>
                         Team {team.id}
                       </Text>
                       <Text style={styles.rankText}>
                         Rank {team.rank}
                         {isCaptain && " (Captain)"}
                       </Text>
                     </View>
                   </Button>
                 );
               })}
             </ScrollView>
           </View>
         </View>
       </Card.Content>
     </Card>
   </ScrollView>
 );
};


const styles = StyleSheet.create({
 scrollContainer: {
   flexGrow: 1,
   minHeight: Dimensions.get('window').height,
   backgroundColor: '#000000',
 },
 container: {
   flex: 1,
   padding: 16,
   paddingTop: 50,
   backgroundColor: '#000000',
 },
 card: {
   backgroundColor: '#1a1a1a',
   borderRadius: 8,
   shadowColor: '#ff3030',
   shadowOffset: { width: 0, height: 2 },
   shadowOpacity: 0.3,
   shadowRadius: 4,
   elevation: 3,
 },
 cardHeader: {
   marginBottom: 16,
 },
 cardTitle: {
   fontSize: 20,
   fontWeight: 'bold',
   color: '#ffffff',
 },
 selectionContainer: {
   flexDirection: 'row',
   justifyContent: 'space-between',
 },
 halfWidth: {
   width: '48%',
 },
 sectionTitle: {
   fontSize: 18,
   fontWeight: 'bold',
   marginBottom: 16,
   color: '#ffffff',
 },
 allianceCard: {
   padding: 16,
   marginBottom: 12,
   borderWidth: 1,
   borderColor: '#ff3030',
   backgroundColor: '#1a1a1a',
 },
 currentAlliance: {
   borderColor: '#ff3030',
   borderWidth: 2,
   backgroundColor: '#2d0808',
 },
 allianceTitle: {
   fontSize: 16,
   fontWeight: 'bold',
   marginBottom: 8,
   color: '#ffffff',
 },
 allianceDetails: {
   marginTop: 8,
 },
 captainText: {
   fontWeight: 'bold',
   color: '#ffffff',
 },
 rankText: {
   color: '#ff3030',
   fontSize: 12,
 },
 pickedText: {
   color: '#66ff66',
 },
 button: {
   padding: 12,
   borderRadius: 8,
   marginBottom: 8,
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
 },
 buttonOutline: {
   borderWidth: 1,
   borderColor: '#ff3030',
   backgroundColor: '#1a1a1a',
 },
 buttonSecondary: {
   backgroundColor: '#2d0808',
 },
 buttonDisabled: {
   opacity: 0.5,
 },
 buttonContent: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   width: '100%',
   color: '#ffffff',
   flexWrap: 'wrap',
 },
 buttonText: {
   color: '#ffffff',
 },
 alert: {
   padding: 16,
   borderRadius: 8,
   marginBottom: 16,
 },
 alertDestructive: {
   backgroundColor: '#ffcdd2',
   borderColor: '#f44336',
 },
 errorText: {
   color: '#d32f2f',
 },
 allianceGrid: {
   flexDirection: 'row',
   flexWrap: 'wrap',
   justifyContent: 'space-between',
 },
 finalizedAllianceTitle: {
   fontSize: 22,
   fontWeight: 'bold',
   marginBottom: 12,
   textAlign: 'center',
   color: '#ffffff',
 },
 finalizedCaptainText: {
   fontSize: 18,
   fontWeight: 'bold',
   marginBottom: 8,
   color: '#ffffff',
 },
 finalizedMemberText: {
   fontSize: 16,
   marginBottom: 4,
   color: '#ffffff',
 },
 finalizedRankText: {
   fontSize: 14,
   color: '#ff3030',
 },
 pickListBox: {
   padding: 12,
   marginBottom: 16,
   backgroundColor: '#1a1a1a',
   borderWidth: 1,
   borderColor: '#ff3030',
 },
 pickListTitle: {
   fontSize: 16,
   fontWeight: 'bold',
   marginBottom: 8,
   color: '#ffffff',
 },
 pickListItem: {
   padding: 8,
   borderRadius: 4,
   marginBottom: 4,
   backgroundColor: '#2d0808',
   borderWidth: 1,
   borderColor: '#ff3030',
 },
 pickListTeamText: {
   fontSize: 14,
   fontWeight: '500',
   color: '#ffffff',
 },
 noTeamsText: {
   textAlign: 'center',
   color: '#ff3030',
   fontStyle: 'italic',
   padding: 8,
 },
 headerContainer: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
 },
 buttonContainer: {
   flexDirection: 'row',
   gap: 8,
 },
 reloadButton: {
   padding: 6,
   borderRadius: 4,
   backgroundColor: '#e0e0e0',
   width: 35,
   height: 35,
   justifyContent: 'center',
   alignItems: 'center',
 },
 reloadButtonText: {
   fontSize: 18,
 },
 undoButton: {
   padding: 8,
   borderRadius: 4,
   backgroundColor: '#e0e0e0',
 },
 undoButtonText: {
   fontSize: 14,
   fontWeight: 'bold',
 },
 undoButtonDisabled: {
   opacity: 0.5,
 },
 captainHighlight: {
   color: '#ff0000',
   fontWeight: 'bold'
 },
});


export default AllianceSelection;