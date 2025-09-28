// src/components/firebase/FirebaseTest.tsx
import React from 'react';
import { View, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import FirebaseService from '../../services/FirebaseService';

const FirebaseTest: React.FC = () => {
  const testFirebaseFeatures = async () => {
    console.log('🧪 Testing Firebase features...');
    
    try {
      // Test connection
      const connectionTest = await FirebaseService.testConnection();
      
      // Test network
      const isOnline = await FirebaseService.checkInternetConnection();
      
      // Show results
      const message = `
🔥 Firebase: ${connectionTest ? 'Connected' : 'Error'}
📱 Network: ${isOnline ? 'Online' : 'Offline'}
      `;
      
      Alert.alert('Firebase Status', message);
      console.log('Firebase test completed:', { connectionTest, isOnline });
      
      // Test Firestore write (will show auth error, which is expected)
      if (connectionTest && isOnline) {
        try {
          await FirebaseService.syncUserToFirebase({
            testData: 'Hello Firebase',
            timestamp: new Date().toISOString()
          });
        } catch (error: any) {
          console.log('Firestore test (expected auth error):', error.message);
        }
      }
    } catch (error: any) {
      console.error('Firebase test error:', error);
      Alert.alert('Test Error', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button 
        mode="contained" 
        onPress={testFirebaseFeatures}
        style={{ marginVertical: 10 }}
      >
        Test Firebase Connection
      </Button>
    </View>
  );
};

export default FirebaseTest;