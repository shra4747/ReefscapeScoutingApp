// screens/Confirmation.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Confirmation = () => {
  const navigation = useNavigation();

  const handleSubmit = () => {
    // Perform any confirmation logic here
    const onSubmit = async () => {
      try {
        // Parse all stored data
        const matchInfo = JSON.parse(await AsyncStorage.getItem('MATCH_INFO'));
        const autoPickups = JSON.parse(await AsyncStorage.getItem('AUTO_PICKUPS'));
        const teleopPickups = JSON.parse(await AsyncStorage.getItem('Teleop_PICKUPS'));
        const processorData = JSON.parse(await AsyncStorage.getItem('PROCESSOR_DATA'));
        const reefData = JSON.parse(await AsyncStorage.getItem('REEF_DATA'));
        const endgameData = JSON.parse(await AsyncStorage.getItem('ENDGAME_DATA'));
        const postgameData = JSON.parse(await AsyncStorage.getItem('POSTGAME_DATA'));

        // Compile data into SQLAlchemy model format
        const submissionData = {
          AutoPickupLocations: [
            // ...(autoPickups.groundCount || []).map((item, index) => {
            //   const baseTimestamp = new Date(item.timestamp.split('.')[0]);
            //   // Add random offset between -5 and +5 seconds
            //   const offset = (Math.random() * 10 - 5) * 1000; // Convert to milliseconds
            //   const adjustedTimestamp = new Date(baseTimestamp.getTime() + offset);
            //   return {
            //     team_number: parseInt(matchInfo.team_number),
            //     match_number: parseInt(matchInfo.match_number),
            //     pickup_ground: true,
            //     pickup_station: false,
            //     location: "NONE",
            //     timestamp: adjustedTimestamp.toISOString().split('.')[0]
            //   };
            // }),
            // ...(autoPickups.stationCount || []).map((item, index) => {
            //   const baseTimestamp = new Date(item.timestamp.split('.')[0]);
            //   // Add random offset between -5 and +5 seconds
            //   const offset = (Math.random() * 10 - 5) * 1000; // Convert to milliseconds
            //   const adjustedTimestamp = new Date(baseTimestamp.getTime() + offset);
            //   return {
            //     team_number: parseInt(matchInfo.team_number),
            //     match_number: parseInt(matchInfo.match_number),
            //     pickup_ground: false,
            //     pickup_station: true,
            //     location: "NONE",
            //     timestamp: adjustedTimestamp.toISOString().split('.')[0]
            //   };
            // })
          ],

          RobotsInMatch: {
            team_number: parseInt(matchInfo.team_number),
            match_number: parseInt(matchInfo.match_number),
            teleop_ground_pickups: teleopPickups.groundCount,
            teleop_HP_pickups: teleopPickups.stationCount,
            park: endgameData.hang == "Park",
            hang: (endgameData.hang.includes("Shallow Hang") ? "Shallow Hang" : (endgameData.hang.includes("Deep Hang")) ? "Deep Hang" : ""),
            hang_time: (endgameData.hang.includes("Shallow Hang") || endgameData.hang.includes("Deep Hang")) ? endgameData.hangTime : null,
            fail_park: endgameData.hang.includes("Failed"),

            was_coral: postgameData.robotType.includes("coral"),
            was_algae: postgameData.robotType.includes("algae"),
            was_shooter: postgameData.robotType.includes("shooter"),
            was_chassis: postgameData.robotType.includes("chassis"),
            was_defense: postgameData.robotType.includes("defense"),

            defense_notes: postgameData.defenseNotes,

            match_start_time: matchInfo.match_start_time.split('.')[0],

            start_position: matchInfo.start_position,

            event_code: matchInfo.event_code,
            

            cycles: (reefData || []).filter(item => item.phase === "teleop").length,
            avg_cycle_time: (() => {
              const teleopCycles = (reefData || []).filter(item => item.phase === "teleop");
              if (teleopCycles.length < 2) return 5000;
              
              const timestamps = teleopCycles.map(item => new Date(item.timestamp).getTime());
              const diffs = [];
              for (let i = 1; i < timestamps.length; i++) {
                diffs.push(timestamps[i] - timestamps[i - 1]);
              }
              const total = diffs.reduce((sum, diff) => sum + diff, 0);
              return (total / (diffs.length))/1000;
            })(),
          },

          Reef: [
            ...(reefData || []).map(item => ({
              team_number: parseInt(matchInfo.team_number),
              match_number: parseInt(matchInfo.match_number),
              game_phase: item.phase,
              make_miss: item.action == "dealgaefy_only" ? null : (item.action == "make" ? 1 : 0),
              is_dealgify: item.dealgaefy,
              level: item.level,
              reef_face: item.slice,
              event_code: matchInfo.event_code,
              score_occurence_time: item.timestamp.split('.')[0]
            })),
          ],

          Processor: [
            ...(processorData || []).map(item => ({
              team_number: parseInt(matchInfo.team_number),
              match_number: parseInt(matchInfo.match_number),
              game_phase: item.phase,
              make_miss: item.action == "make",
              event_code: matchInfo.event_code,
              score_occurence_time: item.timestamp.split('.')[0]
            })),
          ],
        };


        // // Get access token
        const accessToken = await AsyncStorage.getItem('ACCESS_TOKEN');

        // Make POST request
        const response = await fetch('http://97.107.134.214:5002/match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(submissionData)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Clear storage after successful submission
        await AsyncStorage.multiRemove([
          'MATCH_INFO',
          'AUTO_PICKUPS',
          'Teleop_PICKUPS',
          'PROCESSOR_DATA',
          'REEF_DATA',
          'ENDGAME_DATA',
          'POSTGAME_DATA'
        ]);

        // Navigate to StartPage
        navigation.popToTop();
      } catch (error) {
        console.error('Error submitting data:', error);
      }
    };

    onSubmit()
    // Navigate to StartPage
    // navigation.popToTop();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.successText}>
        You have successfully scouted this match. Click SUBMIT.
      </Text>

      <TouchableOpacity 
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  submitButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Confirmation;