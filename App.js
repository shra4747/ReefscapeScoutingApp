import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Image, Animated, Easing } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterPage from './screens/RegisterPage';
import LoginPage from './screens/LoginPage';
import StartPage from './screens/StartPage';
import AdminConsole from './screens/AdminConsole';
import AlliancePicklistScreen from './screens/AlliancePicklistScreen';
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
import { Video } from 'expo-av';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('RegisterPage');
  const [dotAnimations] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('ACCESS_TOKEN');
        console.log(accessToken)
        
        if (accessToken) {
          // Try to validate the token with your API
          const response = await fetch('http://10.75.226.156:5002/who_am_i', {
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
      }
    };

    // Create promises for both auth check and minimum loading time
    const authCheckPromise = checkAuth();
    const loadingDelayPromise = new Promise(resolve => setTimeout(resolve, 5000));

    Promise.all([authCheckPromise, loadingDelayPromise])
      .catch(error => console.error('Error:', error))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (isLoading) {
      const animateDots = () => {
        const animations = dotAnimations.map((dot) => {
          return Animated.loop(
            Animated.sequence([
              Animated.timing(dot, {
                toValue: 1,
                duration: 500,
                easing: Easing.linear,
                useNativeDriver: true,
              }),
              Animated.timing(dot, {
                toValue: 0,
                duration: 500,
                easing: Easing.linear,
                useNativeDriver: true,
              }),
            ])
          );
        });

        // Stagger the animations
        animations.forEach((anim, index) => {
          setTimeout(() => anim.start(), index * 300);
        });
      };

      animateDots();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Video
          source={require('./assets/assembly.mp4')}
          style={styles.video}
          useNativeControls={false}
          isLooping={true}
          shouldPlay={true}
          resizeMode="contain"
          isMuted={true}
          rate={1.9}
          shouldCorrectPitch={true}
        />
        
        <View style={styles.dotsContainer}>
          {dotAnimations.map((animation, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  transform: [
                    {
                      translateY: animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -10],
                      }),
                    },
                    {
                      scale: animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.3],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
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
            name="AlliancePicklistScreen" 
            component={AlliancePicklistScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AdminConsole" 
            component={AdminConsole} 
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
    backgroundColor: '#323238',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 0,
    margin: 0,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    marginHorizontal: 5,
  },
});

export default App;