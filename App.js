import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterPage from './screens/RegisterPage';
import LoginPage from './screens/LoginPage';
import StartPage from './screens/StartPage';
import Auto from './screens/Auto';
import AutoP1 from './screens/AutoP1';
import AutoP2 from './screens/AutoP2';
import PitScouting from './screens/PitScouting';
import Teleop from './screens/Teleop';
import EndGame from './screens/EndGame';
import PostGame from './screens/PostGame';
import Confirmation from './screens/Confirmation';
import Profile from './screens/Profile';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('RegisterPage');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('ACCESS_TOKEN');
        console.log(accessToken)
        
        if (accessToken) {
          // Try to validate the token with your API
          const response = await fetch('http://localhost:5001/who_am_i', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });

          if (response.ok) {
            setInitialRoute('StartPage');
            console.log("Startpage")
          } else {
            setInitialRoute('LoginPage');
            console.log("LoginPage")
          }
        } else {
          setInitialRoute('RegisterPage');
          console.log("Startpage")
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setInitialRoute('LoginPage');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar backgroundColor="#000000" barStyle="light-content" />
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen 
            name="RegisterPage" 
            component={RegisterPage} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="LoginPage" 
            component={LoginPage} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="StartPage" 
            component={StartPage} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PitScouting" 
            component={PitScouting} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Auto" 
            component={Auto} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Teleop" 
            component={Teleop} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="EndGame" 
            component={EndGame} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PostGame" 
            component={PostGame} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Confirmation" 
            component={Confirmation} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Profile" 
            component={Profile} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AutoP1" 
            component={AutoP1} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AutoP2" 
            component={AutoP2} 
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 0,
    margin: 0,
  },
});

export default App;