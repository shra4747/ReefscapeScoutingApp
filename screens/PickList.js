import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PickList = () => {
  const [teamInput, setTeamInput] = useState('');
  const [pickListTeams, setPickListTeams] = useState({ pick1: [], pick2: [] });
  const [competitionTeams, setCompetitionTeams] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showPickModal, setShowPickModal] = useState(false);
  const [pendingTeam, setPendingTeam] = useState(null);

  // Remove the duplicate useEffect and keep only the useFocusEffect for loading pick list teams
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
            console.log('Server Data:', serverData); // Debugging log

            // Process the server data
            const formattedTeams = {
              pick1: serverData
                .filter(team => team.picklist_tag === "1") // Filter for pick1
                .map(team => ({
                  id: team.id,
                  number: team.team_number,
                  rank: team.picklist_rank
                }))
                .sort((a, b) => a.rank - b.rank),
              pick2: serverData
                .filter(team => team.picklist_tag === "2") // Filter for pick2
                .map(team => ({
                  id: team.id,
                  number: team.team_number,
                  rank: team.picklist_rank
                }))
                .sort((a, b) => a.rank - b.rank)
            };

            console.log('Formatted Teams:', formattedTeams); // Debugging log
            setPickListTeams(formattedTeams);
            setInitialLoad(false);
          }
        } catch (error) {
          console.error('Failed to load pick list teams', error);
        }
      };
      
      loadPickListTeams();
      
      // Return a cleanup function
      return () => {
        // Any cleanup if needed
      };
    }, []) // Empty dependency array since we want this to run only on focus
  );

  // Keep the competition teams loading effect
  useEffect(() => {
    const loadCompetitionTeams = async () => {
      try {
        const storedTeams = await AsyncStorage.getItem('competitionTeams');
        if (storedTeams) {
          setCompetitionTeams(JSON.parse(storedTeams));
        }
      } catch (error) {
        console.error('Failed to load competition teams', error);
      }
    };
    
    loadCompetitionTeams();
  }, []);

  // Update the saveTeams effect
  useEffect(() => {
    const saveTeams = async () => {
      if (initialLoad || (!pickListTeams.pick1.length && !pickListTeams.pick2.length)) {
        return;
      }
      
      try {
        const eventCode = await AsyncStorage.getItem('EVENT_CODE') || 'TEST';
        const authToken = await AsyncStorage.getItem('ACCESS_TOKEN');

        // Create the new team data with explicit picklist_tag values
        const picklistData = [
          ...pickListTeams.pick1.map((team, index) => ({
            team_number: team.number,
            picklist_rank: index + 1,
            picklist_name: eventCode,
            picklist_tag: 1 // Explicitly set to 1 for pick1
          })),
          ...pickListTeams.pick2.map((team, index) => ({
            team_number: team.number,
            picklist_rank: index + 1,
            picklist_name: eventCode,
            picklist_tag: 2 // Explicitly set to 2 for pick2
          }))
        ];

        // Send the complete updated list
        const response = await fetch('http://97.107.134.214:5002/picklist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(picklistData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response:', response.status, errorText);
          throw new Error(`Server error: ${response.status} ${errorText}`);
        }
      } catch (error) {
        console.error('Error saving teams:', error);
        // Reload the current server state on error
        const eventCode = await AsyncStorage.getItem('EVENT_CODE') || 'TEST';
        const authToken = await AsyncStorage.getItem('ACCESS_TOKEN');
        const reloadResponse = await fetch(`http://97.107.134.214:5002/picklist/${eventCode}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (reloadResponse.ok) {
          const serverData = await reloadResponse.json();
          const formattedTeams = {
            pick1: serverData.filter(team => team.picklist_tag === 1)
              .map(team => ({
                id: team.id,
                number: team.team_number,
                rank: team.picklist_rank
              }))
              .sort((a, b) => a.rank - b.rank),
            pick2: serverData.filter(team => team.picklist_tag === 2)
              .map(team => ({
                id: team.id,
                number: team.team_number,
                rank: team.picklist_rank
              }))
              .sort((a, b) => a.rank - b.rank)
          };
          setPickListTeams(formattedTeams);
        }
      }
    };
    
    // Add a small delay before saving to prevent rapid consecutive saves
    const timeoutId = setTimeout(() => {
      saveTeams();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [pickListTeams, initialLoad]);

  const handleAddTeam = () => {
    if (!teamInput.trim()) return;

    const teamNumber = parseInt(teamInput.trim());
    
    if (!competitionTeams.includes(teamNumber)) {
      alert('Team not in competition');
      return;
    }
    
    if (pickListTeams.pick1.some(team => team.number === teamNumber) || 
        pickListTeams.pick2.some(team => team.number === teamNumber)) {
      alert('Team already in pick list');
      return;
    }

    setPendingTeam({
      id: teamNumber,
      number: teamNumber,
    });
    setShowPickModal(true);
    setTeamInput('');
  };

  const handleAssignTeam = async (picklist_tag) => {
    if (!pendingTeam) return;

    const targetList = picklist_tag === 1 ? 'pick1' : 'pick2';
    const newTeam = {
      ...pendingTeam,
      rank: pickListTeams[targetList].length + 1
    };

    try {
      const eventCode = await AsyncStorage.getItem('EVENT_CODE') || 'TEST';
      const authToken = await AsyncStorage.getItem('ACCESS_TOKEN');
      
      // Update local state first
      const updatedPickListTeams = {
        ...pickListTeams,
        [targetList]: [...pickListTeams[targetList], newTeam]
      };
      setPickListTeams(updatedPickListTeams);

      // Prepare the complete updated list with explicit picklist_tag values
      const picklistData = [
        ...updatedPickListTeams.pick1.map((team, index) => ({
          team_number: team.number,
          picklist_rank: index + 1,
          picklist_name: eventCode,
          picklist_tag: 1 // Explicitly set to 1 for pick1
        })),
        ...updatedPickListTeams.pick2.map((team, index) => ({
          team_number: team.number,
          picklist_rank: index + 1,
          picklist_name: eventCode,
          picklist_tag: 2 // Explicitly set to 2 for pick2
        }))
      ];

      // Send the complete updated list
      const response = await fetch('http://97.107.134.214:5002/picklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(picklistData)
      });

      if (!response.ok) {
        throw new Error('Failed to save team');
      }

    } catch (error) {
      console.error('Error in handleAssignTeam:', error);
      // Revert local state if save failed
      setPickListTeams(prev => ({
        ...prev,
        [targetList]: prev[targetList].filter(team => team.number !== newTeam.number)
      }));
      alert(`Failed to save team: ${error.message}`);
    } finally {
      setShowPickModal(false);
      setPendingTeam(null);
      setInitialLoad(false);
    }
  };

  const handleResetTeams = async () => {
    try {
      const eventCode = await AsyncStorage.getItem('EVENT_CODE') || 'TEST';
      const authToken = await AsyncStorage.getItem('ACCESS_TOKEN');

      // Clear local state immediately
      setPickListTeams({ pick1: [], pick2: [] });
      setInitialLoad(true);

      // Send empty array to clear server data
      const response = await fetch('http://97.107.134.214:5002/picklistClear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify([]) // Send empty array to clear the picklist
      });

      if (!response.ok) {
        throw new Error('Failed to reset picklist on server');
      }
    } catch (error) {
      console.error('Error resetting teams:', error);
      alert('Failed to reset teams. Please try again.');
    }
  };

  const moveTeam = (index, direction, picklist_tag) => {
    const listKey = picklist_tag === 1 ? 'pick1' : 'pick2';
    const newTeams = [...pickListTeams[listKey]];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= newTeams.length) return;

    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }

    const [movedTeam] = newTeams.splice(index, 1);
    newTeams.splice(targetIndex, 0, movedTeam);

    // Update ranks for the moved list
    const updatedTeams = newTeams.map((team, idx) => ({ ...team, rank: idx + 1 }));

    setPickListTeams(prev => ({
      ...prev,
      [listKey]: updatedTeams
    }));
    setInitialLoad(false);
  };

  const handleRemoveTeam = (teamNumber, picklist_tag) => {
    const listKey = picklist_tag === 1 ? 'pick1' : 'pick2';

    if (Platform.OS !== 'web') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    
    const updatedTeams = pickListTeams[listKey]
        .filter(team => team.number !== teamNumber)
        .map((team, index) => ({ ...team, rank: index + 1 }));

    setPickListTeams(prev => ({
        ...prev,
        [listKey]: updatedTeams
    }));
    setInitialLoad(false);
  };

  const handleReload = async () => {
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
        const formattedTeams = {
          pick1: serverData.filter(team => team.picklist_tag === 1)
            .map(team => ({
              id: team.team_number,
              number: team.team_number,
              rank: team.picklist_rank
            }))
            .sort((a, b) => a.rank - b.rank),
          pick2: serverData.filter(team => team.picklist_tag === 2)
            .map(team => ({
              id: team.team_number,
              number: team.team_number,
              rank: team.picklist_rank
            }))
            .sort((a, b) => a.rank - b.rank)
        };
        setPickListTeams(formattedTeams);
      }
    } catch (error) {
      console.error('Failed to reload pick list', error);
    }
  };

  const renderTeamItem = (item, index, picklist_tag) => {
    return (
      <View key={item.number} style={styles.teamItem}>
        <Text style={styles.rankNumber}>{item.rank}</Text>
        <Text style={styles.teamNumber}>Team {item.number}</Text>
        <View style={styles.arrowContainer}>
          <TouchableOpacity onPress={() => moveTeam(index, -1, picklist_tag)}>
            <Text style={styles.arrow}>↑</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => moveTeam(index, 1, picklist_tag)}>
            <Text style={styles.arrow}>↓</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleRemoveTeam(item.number, picklist_tag)}>
            <Text style={styles.removeButton}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={teamInput}
          onChangeText={setTeamInput}
          placeholder="Enter team number"
          placeholderTextColor="#666666"
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={handleAddTeam}
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddTeam}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleResetTeams}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.reloadButton}
          onPress={handleReload}
        >
          <Text style={styles.reloadButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {showPickModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Select Pick Group</Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => handleAssignTeam(1)}
            >
              <Text style={styles.modalButtonText}>Alliance Pick 1</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => handleAssignTeam(2)}
            >
              <Text style={styles.modalButtonText}>Alliance Pick 2</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => {
                setShowPickModal(false);
                setPendingTeam(null);
              }}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView>
        {pickListTeams.pick1.length > 0 && (
          <View style={styles.pickListSection}>
            <Text style={styles.sectionTitle}>Alliance Pick 1</Text>
            {pickListTeams.pick1.map((item, index) => renderTeamItem(item, index, 1))}
          </View>
        )}

        {pickListTeams.pick2.length > 0 && (
          <View style={styles.pickListSection}>
            <Text style={styles.sectionTitle}>Alliance Pick 2</Text>
            {pickListTeams.pick2.map((item, index) => renderTeamItem(item, index, 2))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#000000',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ff3030',
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: '#ff3030',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    marginRight: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#2d0808',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ff3030',
  },
  resetButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  reloadButton: {
    backgroundColor: '#2d0808',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff3030',
    marginLeft: 8,
  },
  reloadButtonText: {
    color: '#ffffff',
    fontSize: 20,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#ff3030',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#ff3030',
  },
  rankNumber: {
    fontWeight: 'bold',
    marginRight: 16,
    width: 30,
    color: '#ffffff',
  },
  teamNumber: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  arrow: {
    fontSize: 18,
    color: '#ff3030',
    marginHorizontal: 8,
  },
  removeButton: {
    fontSize: 24,
    color: '#ff3030',
    marginLeft: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff3030',
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#ff3030',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  modalButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalCancelButton: {
    backgroundColor: '#2d0808',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ff3030',
  },
  pickListSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});

export default PickList;