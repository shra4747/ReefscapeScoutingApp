import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

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
  const percentage = (redMatches / totalMatches) * 100;
  
  let dominantColor, dominantPercentage, dominantSide;
  
  if (redMatches >= blueMatches) {
    dominantColor = '#ff3030';
    dominantPercentage = percentage;
    dominantSide = 'left';
  } else {
    dominantColor = '#3078ff';
    dominantPercentage = (blueMatches / totalMatches) * 100;
    dominantSide = 'right';
  }

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
              width: `${dominantPercentage}%`, 
              backgroundColor: dominantColor,
              ...(dominantSide === 'right' ? { right: 0, left: 'auto' } : {})
            }
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

const Profile = () => {
  const currentHours = 0; // This should be dynamically set based on your app's logic
  let scoutingLevel;

  if (currentHours <= 5) {
    scoutingLevel = "Clapped Scouter";
  } else if (currentHours > 5 && currentHours <= 10) {
    scoutingLevel = "Experienced Scouter";
  } else if (currentHours > 10 && currentHours <= 25) {
    scoutingLevel = "Professional Scouter";
  } else {
    scoutingLevel = "Legendary Scouter";
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.boldGreeting}>Hi, Neel</Text>
        <Text style={styles.statsText}>Your Scouting Stats:</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <CircularProgressBar 
          total={100} 
          current={currentHours} 
          label="Hours" 
          color="#ff3030"
        />
        <CircularProgressBar 
          total={50} 
          current={22} 
          label="Matches" 
          color="#ff3030"
        />
      </View>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>
          You are <Text style={styles.highlightedRank}>Rank 1</Text> out of 234 Scouters on Team 75!
        </Text>
      </View>
      <View style={styles.allianceMeterWrapper}>
        <AllianceMeter redMatches={17} blueMatches={7} />
      </View>
      <View style={styles.scoutingLevelContainer}>
        <Text style={styles.scoutingLevelText}>Your Scouting Level: {scoutingLevel}</Text>
      </View>
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
    backgroundColor: '#3078ff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  meterForeground: {
    height: '100%',
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
  meterDivider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    backgroundColor: 'black',
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
});

export default Profile;