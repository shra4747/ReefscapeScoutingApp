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
  const [pickListTeams, setPickListTeams] = useState([]);
  const [competitionTeams, setCompetitionTeams] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);

  // Load pick list teams from server when screen focuses
 useFocusEffect(
  React.useCallback(() => {
    const loadPickListTeams = async () => {
      try {
        const authToken = await AsyncStorage.getItem('ACCESS_TOKEN');
        const response = await fetch('http://10.0.0.215:5002/picklist/TEST', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (response.ok) {
          const serverData = await response.json();
          const formattedTeams = serverData.map(team => ({
            id: team.id,
            number: team.team_number,
            rank: team.picklist_rank
          }));
          setPickListTeams(formattedTeams);
        }
      } catch (error) {
        console.error('Failed to load pick list teams', error);
      }
    };
    
    loadPickListTeams();
  }, [])
);
  // Load teams from server on mount
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const authToken = await AsyncStorage.getItem('ACCESS_TOKEN');
        const response = await fetch('http://10.0.0.215:5002/picklist/TEST', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (response.ok) {
          const serverData = await response.json();
          setPickListTeams(serverData.map(team => ({
            id: team.id,
            number: team.team_number,
            rank: team.picklist_rank
          })));
        }
      } catch (error) {
        console.error('Failed to load teams', error);
      }
    };
    loadTeams();
  }, []);

  // Load competition teams from shared storage
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

  // Save teams to server only when modified
  useEffect(() => {
    const saveTeams = async () => {
      // Don't save on initial load
      if (initialLoad || pickListTeams.length === 0) return;
      
      try {
        const picklistData = pickListTeams.map(team => ({
          team_number: team.number,
          picklist_rank: team.rank,
          picklist_name: "TEST"
        }));

        const authToken = await AsyncStorage.getItem('ACCESS_TOKEN');
        const response = await fetch('http://10.0.0.215:5002/picklist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(picklistData)
        });

        if (!response.ok) throw new Error('Failed to save picklist to server');
        
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    saveTeams();
    setInitialLoad(false);
  }, [pickListTeams]);

  const handleAddTeam = () => {
    if (!teamInput.trim()) return;

    const teamNumber = parseInt(teamInput.trim());
    
    // Check if team exists in competition
    if (!competitionTeams.includes(teamNumber)) {
      alert('Team not in competition');
      return;
    }
    
    // Existing duplicate check
    if (pickListTeams.some(team => team.number === teamNumber)) {
      alert('Team already in pick list');
      return;
    }

    const newTeam = {
      id: teamNumber,
      number: teamNumber,
      rank: pickListTeams.length + 1
    };

    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }

    setPickListTeams([...pickListTeams, newTeam]);
    setTeamInput('');
    setInitialLoad(false);
  };

  const handleResetTeams = () => {
    setPickListTeams([]);
    setInitialLoad(true);
  };

  const moveTeam = (index, direction) => {
    const newTeams = [...pickListTeams];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= newTeams.length) return;

    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }

    const [movedTeam] = newTeams.splice(index, 1);
    newTeams.splice(targetIndex, 0, movedTeam);

    setPickListTeams(newTeams.map((team, idx) => ({ ...team, rank: idx + 1 })));
    setInitialLoad(false);
  };

  const handleRemoveTeam = (teamNumber) => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    
    // Recalculate ranks after removal
    const updatedTeams = pickListTeams
      .filter(team => team.number !== teamNumber)
      .map((team, index) => ({ ...team, rank: index + 1 }));

    setPickListTeams(updatedTeams);
    setInitialLoad(false);
  };

  const handleReload = async () => {
    try {
      const authToken = await AsyncStorage.getItem('ACCESS_TOKEN');
      const response = await fetch('http://10.0.0.215:5002/picklist/TEST', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const serverData = await response.json();
        setPickListTeams(serverData.map(team => ({
          id: team.team_number,
          number: team.team_number,
          rank: team.picklist_rank
        })));
      }
    } catch (error) {
      console.error('Failed to reload pick list', error);
    }
  };

  const renderTeamItem = (item, index) => {
    return (
      <View key={item.number} style={styles.teamItem}>
        <Text style={styles.rankNumber}>{item.rank}</Text>
        <Text style={styles.teamNumber}>Team {item.number}</Text>
        <View style={styles.arrowContainer}>
          <TouchableOpacity onPress={() => moveTeam(index, -1)}>
            <Text style={styles.arrow}>↑</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => moveTeam(index, 1)}>
            <Text style={styles.arrow}>↓</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleRemoveTeam(item.number)}>
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

      <ScrollView>
        {pickListTeams.map((item, index) => renderTeamItem(item, index))}
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
});

export default PickList;