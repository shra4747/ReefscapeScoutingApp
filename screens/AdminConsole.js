// screens/AdminConsole.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ... existing imports ...
// import AlliancePicklistScreen from './screens/AlliancePicklistScreen';

const AdminCons = () => {
  const navigation = useNavigation();
  const [eventCode, setEventCode] = useState('');

  const getEventCode = async () => {
    const storedCode = await AsyncStorage.getItem('EVENT_CODE');
    if (!storedCode) {
      Alert.alert('Error', 'Event code not found. Please set it first.');
      return null;
    }
    return storedCode;
  };

  const uploadSchedule = async () => {
    const EVENT_CODE = await getEventCode();
    if (!EVENT_CODE) return;

    const url = `https://frc-api.firstinspires.org/v3.0/2025/schedule/${EVENT_CODE}?tournamentLevel=qualification`;

    try {
      // Fetch schedule data
      const response = await fetch(url, {
        headers: {
          'If-Modified-Since': '',
          'Authorization': 'Basic c2hyYXZhbnA6MjVhZWQzNjMtZWY0Yi00NTljLTg3MjYtZmY4MzlhNzgxNWMy'
        }
      });
      
      const data = await response.json();
      const teams_in_matches = data.Schedule.map(match => 
        match.teams.map(team => ({
          team_number: parseInt(team.teamNumber),
          match_number: parseInt(match.matchNumber),
          drive_station: parseInt(team.station.slice(-1)),
          alliance_color: team.station.slice(0, -1).toLowerCase(),
          event_code: EVENT_CODE,
          date: match.startTime
        }))
      ).flat();

      const access_token = await AsyncStorage.getItem('ACCESS_TOKEN');

      // Post schedule data
      const postResponse = await fetch("http://97.107.134.214:5002/schedule", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedule: teams_in_matches })
      });

      if (postResponse.ok) {
        Alert.alert("Success", "Schedule uploaded successfully!");
      } else {
        throw new Error('Failed to upload schedule');
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const clearTables = async () => {
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
      setEventCode('');
    } catch (error) {
      console.error('Error saving event code:', error);
      Alert.alert('Error', 'Failed to save event code');
    }
  };

  return (
    <View style={styles.container}>
      <Text>This is a blank page.</Text>
      
      {/* Event Code Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Event Code</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter event code"
          value={eventCode}
          onChangeText={setEventCode}
          autoCapitalize="characters"
          maxLength={10}
        />
      </View>

      {/* Save Event Code Button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveEventCode}
      >
        <Text style={styles.saveButtonText}>Save Event Code</Text>
      </TouchableOpacity>

      {/* Clear Tables Button */}
      <TouchableOpacity
        style={[styles.navButton, { bottom: 180 }]}
        onPress={clearTables}
      >
        <Text style={styles.navButtonText}>Clear Tables</Text>
      </TouchableOpacity>

      {/* Existing buttons */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('AlliancePicklistScreen')}
      >
        <Text style={styles.navButtonText}>Go to Alliance & Picklist</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navButton, { bottom: 100 }]}
        onPress={uploadSchedule}
      >
        <Text style={styles.navButtonText}>Upload Schedule</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    width: '80%',
    marginBottom: 20,
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  navButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AdminCons;