// screens/BlankScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import Picker from the correct package
import DropDownPicker from 'react-native-dropdown-picker';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from 'expo-checkbox';
import * as ImagePicker from 'expo-image-picker';
import placeholder from '../assets/placeholder.jpg'; // Make sure to add this image to your assets


const PitScouting = () => {
 const navigation = useNavigation();
 const [teamNumber, setTeamNumber] = useState(''); // State for Team Number
 const [scouterID, setScouterID] = useState(''); // State for Scouter ID
 const [height, setHeight] = useState('42'); // State for Height
 const [length, setLength] = useState('30'); // State for Length
 const [width, setWidth] = useState('30'); // State for Width
 const [cycleTime, setCycleTime] = useState(0); // State for Cycle Time (now a slider)
 const [driverExperience, setDriverExperience] = useState(0); // State for Driver Experience
 const [shallowHang, setShallowHang] = useState(false);
 const [deepHang, setDeepHang] = useState(false);
 const [hpPickup, setHpPickup] = useState(false);
 const [groundPickup, setGroundPickup] = useState(false);
 const [coral, setCoral] = useState(false);
 const [algae, setAlgae] = useState(false);
 const [shooting, setShooting] = useState(false);


 // Drive Train Dropdown
 const [openDriveTrain, setOpenDriveTrain] = useState(false);
 const [driveTrainValue, setDriveTrainValue] = useState(null);
 const [driveTrainItems, setDriveTrainItems] = useState([
   { label: 'Select drive train...', value: null },
   { label: 'Swerve', value: 'swerve' },
   { label: 'Tank', value: 'tank' },
   { label: 'Other', value: 'other' },
 ]);


 // Add state for L1, L2, L3, L4
 const [L1, setL1] = useState(false);
 const [L2, setL2] = useState(false);
 const [L3, setL3] = useState(false);
 const [L4, setL4] = useState(false);
 // Remove the Autonomous Start dropdown state and add notes state
 const [notes, setNotes] = useState('');
 const [image, setImage] = useState(null); // Changed from images array to single image


 const handleTeamNumberChange = (text) => {
   const cleanedText = text.replace(/[^0-9]/g, '');
   setTeamNumber(cleanedText);
 };


 const handleScouterIDChange = (text) => {
   const cleanedText = text.replace(/[^0-9]/g, '');
   setScouterID(cleanedText);
 };


 const handleCycleTimeChange = (text) => {
   const cleanedText = text.replace(/[^0-9]/g, ''); // Allow only integers
   setCycleTime(cleanedText);
 };


 const handleDriverExperienceChange = (text) => {
   setDriverExperience(text); // Allow any text input
 };


 // Generate an array of numbers for the picker (e.g., 0 to 99)
 const generateNumbers = (start, end) => {
   const numbers = [];
   for (let i = start; i <= end; i++) {
     numbers.push(i.toString());
   }
   return numbers;
 };


 // Generate numbers for height (0 to 42), length (0 to 30), and width (0 to 30)
 const heightNumbers = generateNumbers(0, 42); // Height range: 0 to 42
 const lengthNumbers = generateNumbers(0, 30); // Length range: 0 to 30
 const widthNumbers = generateNumbers(0, 30); // Width range: 0 to 30


 // Function to dismiss the keyboard
 const dismissKeyboard = () => {
   Keyboard.dismiss();
 };


 const handleImageUpload = async (source) => {
   try {
     let result;
     if (source === 'camera') {
       const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
       if (!cameraPermission.granted) {
         alert('Camera permission is required to take photos');
         return;
       }
       result = await ImagePicker.launchCameraAsync({
         mediaTypes: ImagePicker.MediaTypeOptions.Images,
         allowsEditing: true,
         aspect: [4, 3],
         quality: 1,
       });
     } else if (source === 'gallery') {
       const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
       if (!galleryPermission.granted) {
         alert('Gallery permission is required to select photos');
         return;
       }
       result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: ImagePicker.MediaTypeOptions.Images,
         allowsEditing: true,
         aspect: [4, 3],
         quality: 1,
       });
     } else if (source === 'remove') {
       setImage(null);
       return;
     }

     if (!result.canceled) {
       const newImage = {
         uri: result.assets[0].uri,
         name: result.assets[0].uri.split('/').pop(),
         type: 'image/jpeg'
       };
       setImage(newImage);
     }
   } catch (error) {
     console.error('Error uploading image:', error);
     alert('Error uploading image. Please try again.');
   }
 };

 const showImageOptions = () => {
   Alert.alert(
     'Upload Image',
     'Choose an option',
     [
       {
         text: 'Use Camera',
         onPress: () => handleImageUpload('camera'),
       },
       {
         text: 'Choose from Gallery',
         onPress: () => handleImageUpload('gallery'),
       },
       {
         text: 'Remove Image',
         onPress: () => handleImageUpload('remove'),
         style: 'destructive',
       },
       {
         text: 'Cancel',
         style: 'cancel',
       },
     ]
   );
 };

 const handleSubmit = async () => {
   // Validate all fields
   if (!teamNumber || !scouterID || !height || !length || !width ||
       cycleTime === null || cycleTime === 0 || driverExperience === null ||
       !driveTrainValue) {
     alert('Please fill out all fields before submitting.');
     return;
   }

   try {
     const pitData = {
       team_number: parseInt(teamNumber, 10),
       event_code: "TEST",
       robot_height: parseInt(height, 10),
       robot_dimensions: `${length} x ${width}`,
       cycle_time: cycleTime,
       driver_experience: driverExperience,
       drive_train: driveTrainValue,
       can_shallow_hang: shallowHang,
       can_deep_hang: deepHang,
       pickup_HP: hpPickup,
       pickup_ground: groundPickup,
       can_coral: coral,
       can_algae: algae,
       can_shoot_in_net: shooting,
       can_L1: L1,
       can_L2: L2, 
       can_L3: L3, 
       can_L4: L4,
       auto_notes: notes
     };

     const formData = new FormData();
     formData.append('data', JSON.stringify(pitData));
     
     if (image) {
       formData.append('file', {
         uri: image.uri,
         name: image.name,
         type: image.type
       });
     }

     await console.log(formData)

    // console.log(JSON.stringify(formData))
     const response = await fetch('http://localhost:5001/pit_scout', {
       method: 'POST',
       body: formData,
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('ACCESS_TOKEN')}`,
        },
     });

     if (!response.ok) {
       throw new Error('Network response was not ok');
     }

     navigation.popToTop();
   } catch (error) {
     console.error('Error saving pit scouting data:', error);
     alert('Error saving data. Please try again.');
   }
 };

 // When loading the component, retrieve images from AsyncStorage
 useEffect(() => {
   const loadImages = async () => {
     try {
       const storedData = await AsyncStorage.getItem('PIT_DATA');
       if (storedData) {
         const parsedData = JSON.parse(storedData);
         if (parsedData.image) {
           setImage(parsedData.image);
         }
       }
     } catch (error) {
       console.error('Error loading images:', error);
     }
   };
   loadImages();
 }, []);

 const renderContent = () => (
   <View style={styles.contentContainer}>
     <TouchableOpacity 
       style={styles.backButton}
       onPress={() => navigation.goBack()}
     >
       <Text style={styles.backButtonText}>← Back</Text>
     </TouchableOpacity>
     <View style={[styles.centeredInputContainer, { marginTop: 20 }]}>
       <Text style={styles.centeredTitle}>Team Number</Text>
       <TextInput
         style={styles.centeredInput}
         keyboardType="numeric"
         placeholder="Enter team number"
         value={teamNumber}
         onChangeText={handleTeamNumberChange}
         maxLength={5}
       />
     </View>
     <View style={styles.centeredInputContainer}>
       <Text style={styles.centeredTitle}>Scouter ID</Text>
       <TextInput
         style={styles.centeredInput}
         keyboardType="numeric"
         placeholder="Enter scouter ID"
         value={scouterID}
         onChangeText={handleScouterIDChange}
         maxLength={5}
       />
     </View>
     <View style={styles.rowContainer}>
       <View style={styles.pickerColumn}>
         <Text style={styles.pickerTitle}>Length</Text>
         <Picker
           selectedValue={length}
           style={styles.picker}
           onValueChange={(itemValue) => setLength(itemValue)}
           itemStyle={styles.pickerItem}
           zIndex={1000}
         >
           {lengthNumbers.map((num) => (
             <Picker.Item key={num} label={num} value={num} />
           ))}
         </Picker>
       </View>
       <View style={styles.pickerColumn}>
         <Text style={styles.pickerTitle}>Width</Text>
         <Picker
           selectedValue={width}
           style={styles.picker}
           onValueChange={(itemValue) => setWidth(itemValue)}
           itemStyle={styles.pickerItem}
           zIndex={1000}
         >
           {widthNumbers.map((num) => (
             <Picker.Item key={num} label={num} value={num} />
           ))}
         </Picker>
       </View>
       <View style={styles.pickerColumn}>
         <Text style={styles.pickerTitle}>Height</Text>
         <Picker
           selectedValue={height}
           style={styles.picker}
           onValueChange={(itemValue) => setHeight(itemValue)}
           itemStyle={styles.pickerItem}
           zIndex={1000}
         >
           {heightNumbers.map((num) => (
             <Picker.Item key={num} label={num} value={num} />
           ))}
         </Picker>
       </View>
     </View>
     <View style={[styles.centeredInputContainer, { marginTop: 60 }]}>
       <Text style={styles.dropdownTitle}>Drive Train</Text>
       <DropDownPicker
         open={openDriveTrain}
         value={driveTrainValue}
         items={driveTrainItems}
         setOpen={setOpenDriveTrain}
         setValue={setDriveTrainValue}
         setItems={setDriveTrainItems}
         placeholder="Select Drive Train"
         style={styles.dropdown}
         containerStyle={styles.dropdownContainer}
         zIndex={3000}
       />
     </View>
     <View style={styles.centeredInputContainer}>
       <Text style={styles.dropdownTitle}>Autonomous Notes</Text>
       <TextInput
         style={[styles.centeredInput, { height: 100 }]}
         placeholder="Enter notes here"
         value={notes}
         onChangeText={setNotes}
         multiline={true}
       />
     </View>
     <View style={styles.centeredInputContainer}>
       <Text style={styles.centeredTitle}>Cycle Time: {cycleTime}</Text>
       <View style={styles.sliderContainer}>
         <Slider
           style={styles.slider}
           minimumValue={0}
           maximumValue={25}
           step={1}
           value={cycleTime}
           onValueChange={(value) => setCycleTime(value)}
           minimumTrackTintColor="#ff0000"
           maximumTrackTintColor="#CCCCCC"
           thumbTintColor="#ff0000"
         />
       </View>
     </View>
     <View style={styles.centeredInputContainer}>
       <Text style={styles.centeredTitle}>Driver Experience: {driverExperience}</Text>
       <View style={styles.sliderContainer}>
         <Slider
           style={styles.slider}
           minimumValue={0}
           maximumValue={3}
           step={1}
           value={driverExperience}
           onValueChange={(value) => setDriverExperience(value)}
           minimumTrackTintColor="#ff0000"
           maximumTrackTintColor="#CCCCCC"
           thumbTintColor="#ff0000"
         />
       </View>
     </View>
     <View style={styles.hangContainer}>
       <Text style={styles.hangTitle}>Hang</Text>
       <View style={styles.checkboxContainer}>
         <View style={styles.checkboxWrapper}>
           <CheckBox
             value={shallowHang}
             onValueChange={setShallowHang}
             color={shallowHang ? '#ff0000' : undefined}
             style={{ width: 24, height: 24 }}
           />
           <Text style={styles.checkboxLabel}>Shallow</Text>
         </View>
         <View style={styles.checkboxWrapper}>
           <CheckBox
             value={deepHang}
             onValueChange={setDeepHang}
             color={deepHang ? '#ff0000' : undefined}
             style={{ width: 24, height: 24 }}
           />
           <Text style={styles.checkboxLabel}>Deep</Text>
         </View>
       </View>
     </View>
     <View style={styles.hangContainer}>
       <Text style={styles.hangTitle}>Pickup</Text>
       <View style={styles.checkboxContainer}>
         <View style={styles.checkboxWrapper}>
           <CheckBox
             value={hpPickup}
             onValueChange={setHpPickup}
             color={hpPickup ? '#ff0000' : undefined}
             style={{ width: 24, height: 24 }}
           />
           <Text style={styles.checkboxLabel}>HP</Text>
         </View>
         <View style={styles.checkboxWrapper}>
           <CheckBox
             value={groundPickup}
             onValueChange={setGroundPickup}
             color={groundPickup ? '#ff0000' : undefined}
             style={{ width: 24, height: 24 }}
           />
           <Text style={styles.checkboxLabel}>Ground</Text>
         </View>
       </View>
     </View>
     <View style={styles.hangContainer}>
       <Text style={styles.hangTitle}>Gameplay</Text>
       <View style={styles.checkboxContainer}>
         <View style={styles.checkboxWrapper}>
           <CheckBox
             value={coral}
             onValueChange={setCoral}
             color={coral ? '#ff0000' : undefined}
             style={{ width: 24, height: 24 }}
           />
           <Text style={styles.checkboxLabel}>Coral</Text>
         </View>
         <View style={styles.checkboxWrapper}>
           <CheckBox
             value={algae}
             onValueChange={setAlgae}
             color={algae ? '#ff0000' : undefined}
             style={{ width: 24, height: 24 }}
           />
           <Text style={styles.checkboxLabel}>Algae</Text>
         </View>
       </View>
       <View style={[styles.checkboxContainer, { justifyContent: 'center', marginTop: 30 }]}>
         <View style={styles.checkboxWrapper}>
           <CheckBox
             value={shooting}
             onValueChange={setShooting}
             color={shooting ? '#ff0000' : undefined}
             style={{ width: 24, height: 24 }}
           />
           <Text style={styles.checkboxLabel}>Shooting</Text>
         </View>
       </View>
     </View>
     <View style={styles.coralLevelContainer}>
       <Text style={styles.coralLevelTitle}>Coral Level</Text>
       <View style={styles.checkboxGrid}>
         <View style={styles.checkboxRow}>
           <View style={styles.checkboxContainer}>
             <Text style={styles.checkboxLabel}>L1</Text>
             <CheckBox
               value={L1}
               onValueChange={setL1}
               color={L1 ? '#ff0000' : undefined}
               style={styles.checkbox}
             />
           </View>
           <View style={styles.checkboxContainer}>
             <Text style={styles.checkboxLabel}>L2</Text>
             <CheckBox
               value={L2}
               onValueChange={setL2}
               color={L2 ? '#ff0000' : undefined}
               style={styles.checkbox}
             />
           </View>
         </View>
         <View style={styles.checkboxRow}>
           <View style={[styles.checkboxContainer, styles.alignL3]}>
             <Text style={styles.checkboxLabel}>L3</Text>
             <CheckBox
               value={L3}
               onValueChange={setL3}
               color={L3 ? '#ff0000' : undefined}
               style={styles.checkbox}
             />
           </View>
           <View style={styles.checkboxContainer}>
             <Text style={styles.checkboxLabel}>L4</Text>
             <CheckBox
               value={L4}
               onValueChange={setL4}
               color={L4 ? '#ff0000' : undefined}
               style={styles.checkbox}
             />
           </View>
         </View>
       </View>
     </View>
     <TouchableOpacity
       style={styles.imageUploadButton}
       onPress={showImageOptions}
     >
       <Text style={styles.imageUploadButtonText}>
         {image ? 'Change Image' : 'Upload Image'}
       </Text>
     </TouchableOpacity>
     {image && (
       <View style={styles.imageContainer}>
         <Image
           source={{ uri: image.uri }}
           style={styles.imagePreview}
         />
         <TouchableOpacity
           style={styles.removeImageButton}
           onPress={() => setImage(null)}
         >
           <Text style={styles.removeImageButtonText}>×</Text>
         </TouchableOpacity>
       </View>
     )}
     <TouchableOpacity
       style={styles.submitButton}
       onPress={handleSubmit}
     >
       <Text style={styles.submitButtonText}>Submit</Text>
     </TouchableOpacity>
   </View>
 );


 return (
   <TouchableWithoutFeedback onPress={dismissKeyboard}>
     <KeyboardAvoidingView
       style={styles.container}
       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
     >
       <FlatList
         data={[1]}
         renderItem={renderContent}
         keyExtractor={(item) => item.toString()}
         contentContainerStyle={styles.scrollContainer}
         keyboardShouldPersistTaps="handled"
         showsVerticalScrollIndicator={true}
         scrollEnabled={true}
         alwaysBounceVertical={true}
         style={styles.scrollView}
       />
     </KeyboardAvoidingView>
   </TouchableWithoutFeedback>
 );
};


const styles = StyleSheet.create({
 container: {
   flex: 1,
   backgroundColor: '#000000',
 },
 scrollContainer: {
   alignItems: 'center',
   paddingBottom: 20, // Add padding to ensure content is not cut off
 },
 centeredInputContainer: {
   alignItems: 'center',
   marginTop: 50,
 },
 centeredTitle: {
   alignSelf: 'center',
   marginBottom: 8,
   color: '#ffffff',
 },
 centeredInput: {
   height: 40,
   borderColor: '#ccc',
   borderWidth: 1,
   width: 300,
   paddingLeft: 8,
   textAlign: 'center',
   backgroundColor: '#ffffff',
   color: '#000000',
 },
 rowContainer: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   marginTop: 20,
   width: '100%',
 },
 pickerColumn: {
   alignItems: 'center',
   width: '30%',
 },
 pickerTitle: {
   alignSelf: 'center',
   marginBottom: 8,
   color: '#ffffff',
 },
 picker: {
   height: 150,
   width: '100%',
   backgroundColor: '#ffffff',
 },
 pickerItem: {
   fontSize: 24,
   textAlign: 'center',
   color: '#000000',
 },
 dropdownTitle: {
   fontSize: 20,
   fontWeight: '600',
   alignSelf: 'center',
   marginBottom: 5,
   color: '#ffffff',
 },
 dropdown: {
   borderColor: 'gray',
 },
 dropdownContainer: {
   width: '80%',
 },
 sliderContainer: {
   width: '100%',
   paddingHorizontal: 20,
 },
 slider: {
   width: '100%',
   height: 40,
 },
 submitButton: {
   backgroundColor: '#ff0000',
   padding: 15,
   borderRadius: 10,
   width: '80%',
   alignItems: 'center',
   marginTop: 20,
   marginBottom: 40,
   alignSelf: 'center',
 },
 submitButtonText: {
   color: '#ffffff',
   fontSize: 18,
   fontWeight: 'bold',
 },
 hangContainer: {
   marginTop: 20,
   width: '80%',
   alignSelf: 'center',
 },
 hangTitle: {
   fontSize: 20,
   fontWeight: '600',
   color: '#ffffff',
   marginBottom: 20,
   textAlign: 'center',
 },
 checkboxContainer: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   paddingHorizontal: 30,
 },
 checkboxWrapper: {
   flexDirection: 'row',
   alignItems: 'center',
   marginHorizontal: 20,
 },
 checkboxLabel: {
   marginLeft: 12,
   fontSize: 18,
   color: '#ffffff',
 },
 checkboxRow: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   width: '80%',
   marginTop: 20,
   alignSelf: 'center',
 },
 checkboxContainer: {
   flexDirection: 'row',
   alignItems: 'center',
   gap: 10,
 },
 checkbox: {
   width: 24,
   height: 24,
   tintColor: '#ff0000',
 },
 coralLevelContainer: {
   width: '80%',
   alignSelf: 'center',
   marginTop: 20,
 },
 coralLevelTitle: {
   fontSize: 20,
   fontWeight: '600',
   color: '#ffffff',
   marginBottom: 10,
   textAlign: 'center',
 },
 checkboxGrid: {
   width: '100%',
 },
 checkboxRow: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   marginBottom: 20,
 },
 checkboxContainer: {
   flexDirection: 'row',
   alignItems: 'center',
   gap: 10,
 },
 alignL3: {
   marginLeft: 0,
 },
 checkbox: {
   width: 24,
   height: 24,
   tintColor: '#ff0000',
 },
 checkboxLabel: {
   fontSize: 20,
   color: '#ffffff',
 },
 backButton: {
   marginTop: 75,
   alignSelf: 'center',
   padding: 10,
   backgroundColor: '#ff0000',
   borderRadius: 5,
   zIndex: 1000,
 },
 backButtonText: {
   color: '#ffffff',
   fontSize: 16,
   fontWeight: 'bold',
 },
 scrollView: {
   width: '100%',
 },
 imageUploadButton: {
   backgroundColor: '#007AFF',
   padding: 15,
   borderRadius: 10,
   width: '80%',
   alignItems: 'center',
   marginTop: 20,
   marginBottom: 20,
   alignSelf: 'center',
 },
 imageUploadButtonText: {
   color: '#ffffff',
   fontSize: 16,
   fontWeight: 'bold',
 },
 imageContainer: {
   position: 'relative',
   margin: 5,
 },
 imagePreview: {
   width: 100,
   height: 100,
   borderRadius: 10,
 },
 removeImageButton: {
   position: 'absolute',
   top: 5,
   right: 5,
   backgroundColor: 'rgba(255, 0, 0, 0.8)',
   width: 20,
   height: 20,
   borderRadius: 10,
   justifyContent: 'center',
   alignItems: 'center',
 },
 removeImageButtonText: {
   color: '#ffffff',
   fontSize: 16,
   fontWeight: 'bold',
   lineHeight: 18,
 },
});


export default PitScouting;

