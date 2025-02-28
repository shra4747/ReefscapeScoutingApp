// screens/BlankScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, FlatList, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import Picker from the correct package
import DropDownPicker from 'react-native-dropdown-picker';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from 'expo-checkbox';
import * as ImagePicker from 'expo-image-picker';


const PitScouting = () => {
 const navigation = useNavigation();
 const [teamNumber, setTeamNumber] = useState(''); // State for Team Number
 const [scouterID, setScouterID] = useState(''); // State for Scouter ID
 const [height, setHeight] = useState('42'); // State for Height
 const [length, setLength] = useState('30'); // State for Length
 const [width, setWidth] = useState('30'); // State for Width
 const [cycleTime, setCycleTime] = useState(10); // State for Cycle Time (now a slider)
 const [driverExperience, setDriverExperience] = useState(1); // State for Driver Experience
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
   { label: 'Mechanum', value: 'mechanum' },
   { label: 'Other', value: 'other' },
 ]);


 // Add state for L1, L2, L3, L4
 const [L1, setL1] = useState(false);
 const [L2, setL2] = useState(false);
 const [L3, setL3] = useState(false);
 const [L4, setL4] = useState(false);
 // Remove the Autonomous Start dropdown state and add auto_notes state
 const [auto_notes, setauto_notes] = useState('');
 const [notes, setnotes] = useState('');
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
   if (!teamNumber || !height || !length || !width ||
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
       robot_dimensions: `${length}x${width}`,
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
       auto_notes: auto_notes,
       other_notes: notes
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
     const response = await fetch('http://10.0.0.215:5002/pit_scout', {
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
   <ScrollView 
     contentContainerStyle={styles.scrollContainer}
     showsVerticalScrollIndicator={false}
     nestedScrollEnabled={true}
   >
     <TouchableOpacity 
       style={styles.backButton}
       onPress={() => navigation.goBack()}
     >
       <Text style={styles.backButtonText}>← Back</Text>
     </TouchableOpacity>
     <View style={styles.sectionContainer}>
       <Text style={styles.sectionTitle}>Team Info</Text>
       <TextInput
         style={styles.inputField}
         placeholder="Team Number"
         placeholderTextColor="#888"
         value={teamNumber}
         onChangeText={handleTeamNumberChange}
         maxLength={5}
       />
     </View>
     <View style={styles.sectionContainer}>
       <Text style={styles.sectionTitle}>Robot Dimensions (in)</Text>
       <View style={styles.dimensionsContainer}>
         
         <View style={styles.dimensionPicker}>
           <Text style={styles.dimensionLabel}>Length</Text>
           <Picker
             selectedValue={length}
             style={styles.picker}
             onValueChange={setLength}
             itemStyle={styles.pickerItem}
           >
             {lengthNumbers.map((num) => (
               <Picker.Item key={num} label={num} value={num} />
             ))}
           </Picker>
         </View>
         <View style={styles.dimensionPicker}>
           <Text style={styles.dimensionLabel}>Width</Text>
           <Picker
             selectedValue={width}
             style={styles.picker}
             onValueChange={setWidth}
             itemStyle={styles.pickerItem}
           >
             {widthNumbers.map((num) => (
               <Picker.Item key={num} label={num} value={num} />
             ))}
           </Picker>
         </View>
         <View style={styles.dimensionPicker}>
           <Text style={styles.dimensionLabel}>Height</Text>
           <Picker
             selectedValue={height}
             style={styles.picker}
             onValueChange={setHeight}
             itemStyle={styles.pickerItem}
           >
             {heightNumbers.map((num) => (
               <Picker.Item key={num} label={num} value={num} />
             ))}
           </Picker>
         </View>
       </View>
     </View>
     <View style={styles.sectionContainer}>
       <Text style={styles.sectionTitle}>Drive Train</Text>
       <DropDownPicker
         open={openDriveTrain}
         value={driveTrainValue}
         items={driveTrainItems}
         setOpen={setOpenDriveTrain}
         setValue={setDriveTrainValue}
         setItems={setDriveTrainItems}
         placeholder="Select Drive Train"
         style={styles.dropdown}
         containerStyle={[styles.dropdownContainer, { zIndex: 5000 }]}
         listMode="SCROLLVIEW"
         scrollViewProps={{
           nestedScrollEnabled: true,
         }}
         zIndex={5000}
         zIndexInverse={6000}
       />
     </View>
     <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Scoring Elements</Text>
      <View style={styles.checkboxRow}>
          <CheckboxItem label="Coral" value={coral} setValue={setCoral} />
      </View>
      <View style={styles.checkboxRow}>
          <CheckboxItem label="Algae" value={algae} setValue={setAlgae} />
      </View>
      <View style={styles.checkboxRow}>
           <CheckboxItem label="Shoot into Net" value={shooting} setValue={setShooting} />
        </View>
     </View>
     <View style={styles.sectionContainer}>
       <Text style={styles.sectionTitle}>Coral Scoring</Text>
       <View style={styles.branchContainer}>
         <Image 
           source={require('../assets/branch.png')}
           style={styles.branchImage}
         />
         <View style={styles.verticalCheckboxes}>
           <CheckboxItem label="L4" value={L4} setValue={setL4} />
           <CheckboxItem label="L3" value={L3} setValue={setL3} />
           <CheckboxItem label="L2" value={L2} setValue={setL2} />
         </View>
       </View>
       <CheckboxItem label="L1" value={L1} setValue={setL1} />
     </View>
     <View style={styles.sectionContainer}>
       <Text style={styles.sectionTitle}>Intake</Text>
       <View style={styles.checkboxGrid}>
         
         <View style={styles.checkboxRow}>
           <CheckboxItem label="HP Pickup" value={hpPickup} setValue={setHpPickup} />
           
         </View>

         <View style={styles.checkboxRow}>
           <CheckboxItem label="Ground Pickup" value={groundPickup} setValue={setGroundPickup} />
         </View>
         
       </View>
     </View>

     <View style={styles.sectionContainer}>
       <Text style={styles.sectionTitle}>Endgame</Text>
       <View style={styles.checkboxGrid}>
         
         <View style={styles.checkboxRow}>
         <CheckboxItem label="Shallow Hang" value={shallowHang} setValue={setShallowHang} />
           
         </View>

         <View style={styles.checkboxRow}>
         <CheckboxItem label="Deep Hang" value={deepHang} setValue={setDeepHang} />
         </View>
         
       </View>
     </View>
     
     <View style={styles.sectionContainer}>
       <Text style={styles.sectionTitle}>Cycle Time: {cycleTime} seconds</Text>
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
     <View style={styles.sectionContainer}>
       <Text style={styles.sectionTitle}>Driver Experience: {driverExperience} year(s)</Text>
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
     
     <View style={styles.sectionContainer}>
       <Text style={styles.sectionTitle}>Autonomous Paths</Text>
       <TextInput
         style={[styles.inputField, { height: 100 }]}
         placeholder="Enter auto paths"
         placeholderTextColor="#888"
         value={auto_notes}
         onChangeText={setauto_notes}
         multiline={true}
       />
     </View>

     <View style={styles.sectionContainer}>
       <Text style={styles.sectionTitle}>Vision Notes</Text>
       <TextInput
         style={[styles.inputField, { height: 100 }]}
         placeholder="Enter vision notes here"
         placeholderTextColor="#888"
         value={notes}
         onChangeText={setnotes}
         multiline={true}
       />
     </View>
     <TouchableOpacity
       style={styles.imageUploadButton}
       onPress={showImageOptions}
     >
       <Text style={styles.imageUploadButtonText}>
         {image ? 'Change Image' : 'Upload Robot Photo'}
       </Text>
     </TouchableOpacity>
     {image && (
       <View style={styles.imageContainer}>
         <Image
           source={{ uri: image.uri }}
           style={styles.imagePreview}
         />
       </View>
     )}
     <TouchableOpacity
       style={styles.submitButton}
       onPress={handleSubmit}
     >
       <Text style={styles.submitButtonText}>Submit</Text>
     </TouchableOpacity>
   </ScrollView>
 );


 return (
   <KeyboardAvoidingView
     style={styles.container}
     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
   >
     <ScrollView
       contentContainerStyle={styles.scrollContainer}
       keyboardShouldPersistTaps="handled"
       showsVerticalScrollIndicator={true}
       scrollEnabled={true}
       nestedScrollEnabled={true}
     >
       <TouchableWithoutFeedback onPress={dismissKeyboard}>
         <View style={{ flex: 1 }}>
           {renderContent()}
         </View>
       </TouchableWithoutFeedback>
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
   flexGrow: 1,  // Changed from paddingBottom
   paddingBottom: 40,
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
 dimensionsContainer: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   marginTop: 10,
 },
 dimensionPicker: {
   width: '30%',
   backgroundColor: '#333333',
   borderRadius: 10,
   overflow: 'hidden',
 },
 dimensionLabel: {
   color: '#FFF',
   textAlign: 'center',
   paddingVertical: 5,
   backgroundColor: '#404040',
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
 dropdown: {
 },
 dropdownContainer: {
   width: '100%',
 },
 sliderContainer: {
   width: '100%',
   paddingHorizontal: 20,
 },
 slider: {
   width: '100%',
   height: 40,
 },
 checkboxGrid: {
   flexDirection: 'row',
   flexWrap: 'wrap',
   justifyContent: 'space-between',
   marginTop: 10,
 },
 checkboxRow: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   width: '100%',
   marginVertical: 8,
 },
 checkboxContainer: {
   flexDirection: 'row',
   alignItems: 'center',
   backgroundColor: '#333333',
   padding: 8,
   borderRadius: 6,
   marginVertical: 4,
   width: '100%',
 },
 checkbox: {
   width: 28,
   height: 28,
   borderRadius: 6,
   marginRight: 10,
 },
 checkboxLabel: {
   color: '#FFF',
   fontSize: 14,
 },
 imageUploadButton: {
   backgroundColor: '#444444',
   padding: 15,
   borderRadius: 10,
   width: '90%',
   alignSelf: 'center',
   marginVertical: 20,
 },
 imageUploadButtonText: {
   color: '#FFF',
   fontSize: 16,
   fontWeight: '600',
   textAlign: 'center',
 },
 imageContainer: {
   position: 'relative',
   margin: 5,
 },
 imagePreview: {
   width: 200,
   height: 200,
   borderRadius: 15,
   alignSelf: 'center',
 },
 submitButton: {
   backgroundColor: '#FF4444',
   padding: 20,
   borderRadius: 15,
   width: '90%',
   alignSelf: 'center',
   marginVertical: 20,
 },
 submitButtonText: {
   color: '#FFF',
   fontSize: 18,
   fontWeight: '600',
   textAlign: 'center',
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
 branchContainer: {
   flexDirection: 'row',
   alignItems: 'flex-start',
   marginBottom: 15,
 },
 branchImage: {
   width: 80,
   height: 150,
   resizeMode: 'contain',
   marginRight: 15,
 },
 verticalCheckboxes: {
   flex: 1,
   justifyContent: 'space-between',
   height: 150, // Match branchImage height
 },
});

// Helper component for checkboxes
const CheckboxItem = ({ label, value, setValue }) => (
  <TouchableOpacity 
    style={styles.checkboxContainer}
    onPress={() => setValue(!value)}
    activeOpacity={0.7}
  >
    <CheckBox
      value={value}
      onValueChange={setValue}
      color={value ? '#FF4444' : undefined}
      style={styles.checkbox}
    />
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);


export default PitScouting;

