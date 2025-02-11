// screens/BlankScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const WinRateCircle = ({ percentage }) => {
  const size = 30;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.circleContainer}>
      <Svg width={size} height={size}>
        <Circle
          stroke="#ddd"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke="#ff3030"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={styles.percentageText}>{percentage}%</Text>
    </View>
  );
};

const OPRDPR = () => {
  const [teamData, setTeamData] = useState(Array(40).fill(null).map(() => ({
    teamNumber: '',
    opr: '',
    dpr: '',
    winRate: ''
  })));

  const updateTeamData = (index, field, value) => {
    const newData = [...teamData];
    newData[index] = { ...newData[index], [field]: value };
    setTeamData(newData);
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, styles.teamColumn]}>Team Number</Text>
        <Text style={[styles.headerText, styles.dataColumn]}>OPR</Text>
        <Text style={[styles.headerText, styles.dataColumn]}>DPR</Text>
        <Text style={[styles.headerText, styles.dataColumn]}>Win Rate</Text>
      </View>

      {/* Scrollable Table Content */}
      <ScrollView>
        {teamData.map((team, index) => (
          <View key={index} style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
            <TextInput
              style={[styles.input, styles.teamColumn]}
              value={team.teamNumber}
              onChangeText={(value) => updateTeamData(index, 'teamNumber', value)}
              keyboardType="numeric"
              placeholder="Team #"
            />
            <TextInput
              style={[styles.input, styles.dataColumn]}
              value={team.opr}
              onChangeText={(value) => updateTeamData(index, 'opr', value)}
              keyboardType="numeric"
              placeholder="OPR"
            />
            <TextInput
              style={[styles.input, styles.dataColumn]}
              value={team.dpr}
              onChangeText={(value) => updateTeamData(index, 'dpr', value)}
              keyboardType="numeric"
              placeholder="DPR"
            />
            <View style={[styles.dataColumn, styles.winRateColumn]}>
              <TextInput
                style={[styles.input, styles.winRateInput]}
                value={team.winRate}
                onChangeText={(value) => {
                  const numValue = parseInt(value);
                  if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                    updateTeamData(index, 'winRate', value);
                  }
                }}
                keyboardType="numeric"
                placeholder="0-100"
                maxLength={3}
              />
              <WinRateCircle percentage={parseInt(team.winRate) || 0} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#ff3030',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
  },
  oddRow: {
    backgroundColor: '#ffffff',
  },
  input: {
    fontSize: 14,
    padding: 2,
  },
  teamColumn: {
    flex: 2,
    paddingHorizontal: 5,
  },
  dataColumn: {
    flex: 1,
    paddingHorizontal: 5,
    textAlign: 'center',
  },
  winRateColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  winRateInput: {
    width: 40,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    position: 'absolute',
    fontSize: 10,
  },
});

export default OPRDPR;