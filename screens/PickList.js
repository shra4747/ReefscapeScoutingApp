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

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PickList = () => {
  const [teamInput, setTeamInput] = useState('');
  const [pickListTeams, setPickListTeams] = useState([]);

  // Load teams from local storage on mount
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const savedTeams = await AsyncStorage.getItem('pickListTeams');
        if (savedTeams) {
          setPickListTeams(JSON.parse(savedTeams));
        }
      } catch (error) {
        console.error('Failed to load pick list teams', error);
      }
    };
    loadTeams();
  }, []);

  // Save teams to local storage whenever they change
  useEffect(() => {
    const saveTeams = async () => {
      try {
        await AsyncStorage.setItem('pickListTeams', JSON.stringify(pickListTeams));
      } catch (error) {
        console.error('Failed to save pick list teams', error);
      }
    };
    saveTeams();
  }, [pickListTeams]);

  const handleAddTeam = () => {
    if (!teamInput.trim()) return;

    const teamNumber = parseInt(teamInput.trim());
    
    // Check if team is already in the list
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
  };

  const handleResetTeams = () => {
    setPickListTeams([]);
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
  };

  const handleRemoveTeam = (teamNumber) => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setPickListTeams(pickListTeams.filter(team => team.number !== teamNumber));
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