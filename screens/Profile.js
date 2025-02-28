import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';


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


const getScoutingLevel = (matches) => {
  if (matches >= 150) return { level: 'Locked In', emoji: '🔥', color: '#E5E4E2' };
  if (matches >= 100) return { level: 'Diamond', emoji: '💎', color: '#40BFFF' };
  if (matches >= 70) return { level: 'Gold', emoji: '🏆', color: '#FFD700' };
  if (matches >= 40) return { level: 'Silver', emoji: '🥈', color: '#C0C0C0' };
  if (matches >= 10) return { level: 'Bronze', emoji: '🥉', color: '#CD7F32' };
  return { level: 'Geeked', emoji: '🚀', color: '#FFFFFF' };
};


const Profile = ({ route }) => {
 const navigation = useNavigation();
 const [firstName, setFirstName] = useState('');
 const [redMatches, setRedMatches] = useState(0);
 const [blueMatches, setBlueMatches] = useState(0);
 const currentMinutes = (redMatches + blueMatches) * 2.5; // Current minutes as a fraction of totalMatches
 const [rank, setRank] = useState(0);
 const [isTied, setIsTied] = useState(false);
 const [totalScouters, setTotalScouters] = useState(0);


 // Ensure redMatches + blueMatches equals totalMatches
 const totalMatchesScouted = redMatches + blueMatches;


 // Determine the color of the progress bar based on the dominant alliance
 const progressBarColor = redMatches >= blueMatches ? '#ff3030' : '#3078ff';


 const scoutingLevel = getScoutingLevel(totalMatchesScouted);


 useEffect(() => {
   const fetchUserData = async () => {
     try {
       const accessToken = await AsyncStorage.getItem('ACCESS_TOKEN');
       if (accessToken) {
         const response = await fetch('http://10.0.0.215:5002/user_stats', {
           method: 'GET',
           headers: {
             'Authorization': `Bearer ${accessToken}`
           }
         });
         const data = await response.json();
         setFirstName(data.user_info.first_name);
         setRedMatches(data.red_matches);
         setBlueMatches(data.blue_matches);
         setRank(data.rank);
         setIsTied(data.is_tied); 
         setTotalScouters(data.total_scouters)
       }
     } catch (error) {
       console.error('Error fetching user data:', error);
     }
   };

   fetchUserData();
 }, []);


 return (
   <View style={styles.container}>
     <View style={styles.headerContainer}>
       <Text style={styles.boldGreeting}>Hi, {firstName}</Text>
       <Text style={styles.statsText}>Your Scouting Stats:</Text>
     </View>
     <View style={styles.progressBarContainer}>
       <CircularProgressBar
         total={currentMinutes}
         current={currentMinutes}
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
         You are {isTied ? "tied for " : ""}<Text style={styles.highlightedRank}>Rank {rank ?? totalScouters}</Text> out of <Text style={{fontWeight: 'bold'}}>{totalScouters}</Text> RoboScouters!
       </Text>
     </View>
     <View style={styles.allianceMeterWrapper}>
       <AllianceMeter redMatches={redMatches} blueMatches={blueMatches} />
     </View>
     <View style={[styles.scoutingLevelContainer, { borderColor: scoutingLevel.color }]}>
       <LinearGradient 
         colors={[scoutingLevel.color, darkenColor(scoutingLevel.color, 0.3)]}
         style={styles.gradientBackground}
         start={{ x: 0, y: 0 }}
         end={{ x: 1, y: 1 }}
       >
         <View style={styles.emojiContainer}>
           <Text style={styles.scoutingLevelEmoji}>{scoutingLevel.emoji}</Text>
           {/* Particle effects */}
           <View style={[styles.particle, styles.particle1]} />
           <View style={[styles.particle, styles.particle2]} />
           <View style={[styles.particle, styles.particle3]} />
         </View>
         
         <View style={styles.scoutingLevelTextContainer}>
           <Text style={styles.scoutingLevelTitle}>SCOUTING LEVEL</Text>
           <Text style={[styles.scoutingLevelText, { textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }]}>
             {scoutingLevel.level} TIER
           </Text>
         </View>
         
         {/* Progress bar */}
         <View style={styles.progressBarBackground}>
           <View style={[styles.progressBarFill, { width: `${(totalMatchesScouted/275)*100}%` }]} />
         </View>
         
         <Text style={styles.matchesCount}>{totalMatchesScouted} matches scouted</Text>
       </LinearGradient>
       <View style={styles.shineOverlay} />
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


const darkenColor = (color, amount = 0.4) => {
  let col = color.replace('#', '');
  let r = parseInt(col.substring(0, 2), 16);
  let g = parseInt(col.substring(2, 4), 16);
  let b = parseInt(col.substring(4, 6), 16);
  
  r = Math.max(0, r - (r * amount));
  g = Math.max(0, g - (g * amount));
  b = Math.max(0, b - (b * amount));
  
  return `#${[r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('')}`;
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
   marginTop: 30,
   borderRadius: 20,
   width: '100%',
   height: 140,
   overflow: 'hidden',
   borderWidth: 2,
   position: 'relative',
   elevation: 5,
   shadowColor: '#000',
   shadowOffset: { width: 0, height: 4 },
   shadowOpacity: 0.3,
   shadowRadius: 6,
 },
 gradientBackground: {
   flex: 1,
   padding: 20,
 },
 emojiContainer: {
   position: 'absolute',
   right: 20,
   top: 0,
 },
 scoutingLevelEmoji: {
   fontSize: 80,
   textShadowColor: 'rgba(0,0,0,0.2)',
   textShadowOffset: { width: 2, height: 2 },
   textShadowRadius: 4,
 },
 scoutingLevelTextContainer: {
   flex: 1,
 },
 scoutingLevelTitle: {
   fontSize: 12,
   fontWeight: 'bold',
   letterSpacing: 1,
   color: '#666',
 },
 scoutingLevelText: {
   fontSize: 24,
   fontWeight: 'bold',
   marginTop: 4,
 },
 progressBarBackground: {
   position: 'absolute',
   bottom: 0,
   left: 0,
   right: 0,
   height: 6,
   backgroundColor: 'rgba(0,0,0,0.1)',
 },
 progressBarFill: {
   height: '100%',
   backgroundColor: 'rgba(255,255,255,0.5)',
 },
 particle: {
   position: 'absolute',
   backgroundColor: 'rgba(255,255,255,0.3)',
   borderRadius: 50,
 },
 particle1: { width: 8, height: 8, top: 30, left: -10 },
 particle2: { width: 12, height: 12, top: 50, left: -20 },
 particle3: { width: 6, height: 6, top: 10, left: 20 },
 matchesCount: {
   position: 'absolute',
   bottom: 12,
   right: 12,
   fontSize: 16,
   fontWeight: '900',
   color: 'rgba(0,0,0,0.7)',
   fontStyle: 'italic',
 },
 shineOverlay: {
   ...StyleSheet.absoluteFillObject,
   backgroundColor: 'rgba(255,255,255,0.15)',
   transform: [{ rotate: '20deg' }, { skewY: '30deg' }],
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

