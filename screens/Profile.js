import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const CircularProgressBar = ({ total, current, label, color }) => {
 const radius = 60;
 const strokeWidth = 10;
 const circumference = 2 * Math.PI * radius;
 const progress = (current / total) * circumference;


 return (
   <View style={styles.progressContainer}>
     <Svg width={140} height={140}>
       <Circle
         cx={70}
         cy={70}
         r={radius}
         fill="transparent"
         stroke="#E0E0E0"
         strokeWidth={strokeWidth}
       />
       <Circle
         cx={70}
         cy={70}
         r={radius}
         fill="transparent"
         stroke={color}
         strokeWidth={strokeWidth}
         strokeDasharray={`${circumference} ${circumference}`}
         strokeDashoffset={circumference - progress}
         strokeLinecap="round"
       />
     </Svg>
     <View style={styles.progressTextContainer}>
       <Text style={styles.progressText}>{current}</Text>
       <Text style={styles.progressLabel}>{label}</Text>
     </View>
   </View>
 );
};


const AllianceMeter = ({ redMatches, blueMatches }) => {
 const totalMatches = redMatches + blueMatches;
 const redPercentage = (redMatches / totalMatches) * 100;
 const bluePercentage = (blueMatches / totalMatches) * 100;


 return (
   <View style={styles.allianceMeterContainer}>
     <View style={styles.allianceMeterLabels}>
       <Text style={styles.allianceMeterLabel}>Red Alliance</Text>
       <Text style={styles.allianceMeterLabel}>Blue Alliance</Text>
     </View>
     <View style={styles.meterBackground}>
       <View
         style={[
           styles.meterForeground,
           {
             width: `${redPercentage}%`,
             backgroundColor: '#ff3030',
           },
         ]}
       />
       <View
         style={[
           styles.meterForeground,
           {
             width: `${bluePercentage}%`,
             backgroundColor: '#3078ff',
             left: `${redPercentage}%`,
           },
         ]}
       />
     </View>
     <View style={styles.allianceMeterStats}>
       <Text style={styles.allianceMeterStatsText}>{redMatches} Matches</Text>
       <Text style={styles.allianceMeterStatsText}>{blueMatches} Matches</Text>
     </View>
   </View>
 );
};


const Profile = ({ route }) => {
 const navigation = useNavigation();
 const [firstName, setFirstName] = useState('');
 const totalMatches = 4; // Total matches (arbitrary value)
 const redMatches = 50; // Red Alliance matches (arbitrary value)
 const blueMatches = 100; // Blue Alliance matches (arbitrary value)
 const currentMinutes = (redMatches + blueMatches) * 2.5; // Current minutes as a fraction of totalMatches


 // Ensure redMatches + blueMatches equals totalMatches
 const totalMatchesScouted = redMatches + blueMatches;


 // Determine the color of the progress bar based on the dominant alliance
 const progressBarColor = redMatches >= blueMatches ? '#ff3030' : '#3078ff';


 let scoutingLevel;


 useEffect(() => {
   const fetchUserData = async () => {
     try {
       const accessToken = await AsyncStorage.getItem('ACCESS_TOKEN');
       if (accessToken) {
         const response = await fetch('http://localhost:5001/who_am_i', {
           method: 'GET',
           headers: {
             'Authorization': `Bearer ${accessToken}`
           }
         });

         if (response.ok) {
           const userData = await response.json();
           setFirstName(userData.first_name);
         } else {
           console.error('Failed to fetch user data');
         }
       }
     } catch (error) {
       console.error('Error fetching user data:', error);
     }
   };

   fetchUserData();
 }, []);


 if (currentMinutes <= 60) {
   scoutingLevel = "Clapped Scouter";
 } else if (currentMinutes >= 60 && currentMinutes <= 120) {
   scoutingLevel = "Experienced Scouter";
 } else if (currentMinutes > 180 && currentMinutes <= 240) {
   scoutingLevel = "Professional Scouter";
 } else {
   scoutingLevel = "Legendary Scouter";
 }


 return (
   <View style={styles.container}>
     <View style={styles.headerContainer}>
       <Text style={styles.boldGreeting}>Hi, {firstName}</Text>
       <Text style={styles.statsText}>Your Scouting Stats:</Text>
     </View>
     <View style={styles.progressBarContainer}>
       <CircularProgressBar
         total={100}
         current={100}
         label="Minutes"
         color="#ff3030"
       />
       <CircularProgressBar
         total={redMatches+blueMatches}
         current={redMatches+blueMatches}
         label="Matches"
         color={progressBarColor}
       />
     </View>
     <View style={styles.rankContainer}>
       <Text style={styles.rankText}>
         You are <Text style={styles.highlightedRank}>Rank 1</Text> out of 234 Scouters on Team 75!
       </Text>
     </View>
     <View style={styles.allianceMeterWrapper}>
       <AllianceMeter redMatches={redMatches} blueMatches={blueMatches} />
     </View>
     <View style={styles.scoutingLevelContainer}>
       <Text style={styles.scoutingLevelText}>Your Scouting Level: {scoutingLevel}</Text>
     </View>
     <TouchableOpacity 
       style={styles.backButton}
       onPress={() => navigation.goBack()}
     >
       <Text style={styles.backButtonText}>Back</Text>
     </TouchableOpacity>
   </View>
 );
};


const styles = StyleSheet.create({
 container: {
   flex: 1,
   backgroundColor: 'black',
   paddingTop: 30,
   paddingHorizontal: 30,
 },
 headerContainer: {
   alignItems: 'flex-start',
   marginTop: 50,
   marginBottom: 30,
 },
 boldGreeting: {
   color: 'white',
   fontSize: 50,
   fontWeight: 'bold',
 },
 statsText: {
   color: 'white',
   fontSize: 22,
 },
 progressBarContainer: {
   flexDirection: 'row',
   justifyContent: 'space-around',
   width: '100%',
 },
 progressContainer: {
   alignItems: 'center',
   position: 'relative',
 },
 progressTextContainer: {
   position: 'absolute',
   top: 0,
   left: 0,
   right: 0,
   bottom: 0,
   justifyContent: 'center',
   alignItems: 'center',
 },
 progressText: {
   color: 'white',
   fontSize: 30,
   fontWeight: 'bold',
 },
 progressLabel: {
   color: 'white',
   fontSize: 18,
   marginTop: 5,
 },
 rankContainer: {
   marginTop: 30,
   alignItems: 'center',
 },
 rankText: {
   color: 'white',
   fontSize: 30,
   textAlign: 'center',
 },
 highlightedRank: {
   color: '#ff3030',
   fontSize: 35,
   fontWeight: 'bold',
   textAlign: 'center',
 },
 allianceMeterWrapper: {
   marginTop: 30,
   width: '100%',
 },
 allianceMeterContainer: {
   width: '100%',
 },
 allianceMeterLabels: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   marginBottom: 10,
 },
 allianceMeterLabel: {
   color: 'white',
   fontSize: 14,
 },
 meterBackground: {
   height: 20,
   backgroundColor: '#444',
   borderRadius: 10,
   overflow: 'hidden',
   position: 'relative',
 },
 meterForeground: {
   height: '100%',
   position: 'absolute',
   top: 0,
 },
 allianceMeterStats: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   marginTop: 10,
 },
 allianceMeterStatsText: {
   color: 'white',
   fontSize: 18,
 },
 scoutingLevelContainer: {
   marginTop: 20,
   alignItems: 'center',
 },
 scoutingLevelText: {
   color: 'white',
   fontSize: 20,
   fontWeight: 'bold',
 },
 backButton: {
   position: 'absolute',
   bottom: 50,
   alignSelf: 'center',
   backgroundColor: '#ff3030',
   paddingVertical: 15,
   paddingHorizontal: 40,
   borderRadius: 10,
 },
 backButtonText: {
   color: 'white',
   fontSize: 18,
   fontWeight: 'bold',
 },
});


export default Profile;

