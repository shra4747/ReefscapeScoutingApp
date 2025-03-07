// screens/AdminConsole.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ... existing imports ...
// import AlliancePicklistScreen from './screens/AlliancePicklistScreen';

const AdminCons = () => {
  const navigation = useNavigation();
  const [eventCode, setEventCode] = useState('');

  // Load saved event code on mount
  useEffect(() => {
    const loadEventCode = async () => {
      const storedCode = await AsyncStorage.getItem('EVENT_CODE');
      if (storedCode) {
        setEventCode(storedCode);
      }
    };
    loadEventCode();
  }, []);

  const getEventCode = async () => {
    const storedCode = await AsyncStorage.getItem('EVENT_CODE');
    if (!storedCode) {
      Alert.alert('Error', 'Event code not found. Please set it first.');
      return null;
    }
    return storedCode;
  };

  const getMaxMatchNumber = async () => {
    try {
      const access_token = await AsyncStorage.getItem('ACCESS_TOKEN');
      
      // Get max match from schedule
      const scheduleResponse = await fetch(`http://97.107.134.214:5002/schedule`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const scheduleData = await scheduleResponse.json();
      const maxScheduleMatch = scheduleData.length > 0 ? 
        Math.max(...scheduleData.map(match => match.match_number)) : 0;

      // Get max match from robots_in_match
      const robotsResponse = await fetch(`http://97.107.134.214:5002/robots_in_match`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const robotsData = await robotsResponse.json();
      const maxRobotsMatch = robotsData.length > 0 ? 
        Math.max(...robotsData.map(match => match.match_number)) : 0;

      // Return the higher of the two
      return Math.max(maxScheduleMatch, maxRobotsMatch);
    } catch (error) {
      console.error('Error getting max match number:', error);
      throw error;
    }
  };

  const uploadSchedule = async (tournamentLevel = 'qualification') => {
    const EVENT_CODE = await getEventCode();
    if (!EVENT_CODE) return;

    try {
      // Get max match number
      const maxMatchNumber = await getMaxMatchNumber();
      
      const url = `https://frc-api.firstinspires.org/v3.0/2025/schedule/${EVENT_CODE}?tournamentLevel=${tournamentLevel}`;

      // Fetch schedule data
      const response = await fetch(url, {
        headers: {
          'If-Modified-Since': '',
          'Authorization': 'Basic c2hyYXZhbnA6MjVhZWQzNjMtZWY0Yi00NTljLTg3MjYtZmY4MzlhNzgxNWMy'
        }
      });
      
      const data = await response.json();
      
      // Filter out matches with numbers less than or equal to maxMatchNumber
      const newMatches = data.Schedule
        .filter(match => {
          const matchNumber = tournamentLevel === 'playoff' ? parseInt(match.matchNumber) + 1000 : parseInt(match.matchNumber)
          return matchNumber > maxMatchNumber && match.startTime !== null;
        });

      if (newMatches.length === 0) {
        Alert.alert("Info", "No new matches to upload");
        return;
      }

      const teams_in_matches = newMatches.map(match => 
        match.teams.map(team => ({
          team_number: parseInt(team.teamNumber),
          match_number: tournamentLevel === 'playoff' ? parseInt(match.matchNumber) + 1000 : parseInt(match.matchNumber),
          drive_station: parseInt(team.station.slice(-1)),
          alliance_color: team.station.slice(0, -1).toLowerCase(),
          event_code: EVENT_CODE,
          date: match.startTime
        }))
      ).flat();

      const access_token = await AsyncStorage.getItem('ACCESS_TOKEN');

      // Post schedule data
      const postResponse = await fetch(`http://97.107.134.214:5002/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'schedule': teams_in_matches })
      });

      if (postResponse.ok) {
        // Get match numbers range
        const matchNumbers = newMatches.map(match => parseInt(match.matchNumber));
        const minMatch = Math.min(...matchNumbers);
        const maxMatch = Math.max(...matchNumbers);
        
        const rangeMessage = matchNumbers.length === 1 ? 
          `Match ${minMatch} uploaded` :
          `Matches ${minMatch} to ${maxMatch} uploaded`;

        Alert.alert(
          "Success", 
          `Schedule (${tournamentLevel}) uploaded successfully!\n${rangeMessage}`
        );
      } else {
        throw new Error('Failed to upload schedule');
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const clearTables = async () => {
    // Add confirmation dialog
    Alert.alert(
      "Confirm Clear",
      "Are you sure you want to clear all tables? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Clear", 
          onPress: async () => {
            try {
              const access_token = await AsyncStorage.getItem('ACCESS_TOKEN');
              if (!access_token) {
                throw new Error('No access token found');
              }

              const response = await fetch("http://97.107.134.214:5002/clear_tables", {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${access_token}`,
                  'Content-Type': 'application/json',
                }
              });

              if (response.ok) {
                Alert.alert("Success", "Tables cleared successfully!");
              } else {
                throw new Error('Failed to clear tables');
              }
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          }
        }
      ]
    );
  };

  // Function to save event code to AsyncStorage
  const saveEventCode = async () => {
    if (!eventCode.trim()) {
      Alert.alert('Error', 'Please enter an event code');
      return;
    }

    try {
      await AsyncStorage.setItem('EVENT_CODE', eventCode.toUpperCase());
      Alert.alert('Success', 'Event code saved successfully');
    } catch (error) {
      console.error('Error saving event code:', error);
      Alert.alert('Error', 'Failed to save event code');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Admin Console</Text>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Event Code</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Enter event code"
            value={eventCode}
            onChangeText={setEventCode}
            autoCapitalize="characters"
            maxLength={10}
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveEventCode}
          >
            <Text style={styles.saveButtonText}>Save Event Code</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Admin Actions</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={clearTables}
          >
            <Text style={styles.actionButtonText}>Clear Tables</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => uploadSchedule('qualification')}
          >
            <Text style={styles.actionButtonText}>Upload Qualification Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => uploadSchedule('playoff')}
          >
            <Text style={styles.actionButtonText}>Upload Playoff Schedule</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.rankingsButton}
            onPress={() => navigation.navigate('AlliancePicklistScreen')}
          >
            <Text style={styles.rankingsButtonText}>Rankings & Picklist</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  scrollContainer: {
    marginTop: 50,
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionContainer: {
    width: '90%',
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    alignSelf: 'center',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    
    marginBottom: 15,
    textAlign: 'center',
  },
  inputField: {
    backgroundColor: '#333333',
    borderRadius: 10,
    padding: 15,
    color: '#FFF',
    fontSize: 16,
    marginVertical: 8,
  },
  saveButton: {
    backgroundColor: '#FF4444',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#444444',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  rankingsButton: {
    backgroundColor: '#007AFF', // Blue color matching other pages
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
  },
  rankingsButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminCons;