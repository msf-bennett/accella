// Debug helper for Firestore writes
import { db } from './scr/config/firebase.config';
import { Platform } from 'react-native';

export const debugFirestoreWrite = async () => {
  try {
    console.log('🔍 Testing Firestore write capability...');
    
    if (!db) {
      console.error('❌ Firestore not initialized');
      return { success: false, error: 'Firestore not initialized' };
    }

    const testData = {
      message: 'Test write from app',
      timestamp: new Date(),
      platform: Platform.OS,
      createdAt: new Date().toISOString()
    };

    if (Platform.OS === 'web') {
      // Web SDK
      const { collection, addDoc, doc, setDoc } = require('firebase/firestore');
      
      console.log('📝 Attempting Firestore write (Web SDK)...');
      
      // Try adding to test-writes collection
      const docRef = await addDoc(collection(db, 'test-writes'), testData);
      console.log('✅ Document written with ID: ', docRef.id);
      
      // Also try writing to users collection like your hardcoded data
      const userDocRef = doc(db, 'users', 'app-test-user');
      await setDoc(userDocRef, {
        customRole: 'app-generated',
        createdAt: new Date(),
        source: 'mobile-app'
      });
      console.log('✅ User document created');
      
      return { success: true, docId: docRef.id };
      
    } else {
      // React Native SDK
      console.log('📝 Attempting Firestore write (React Native SDK)...');
      
      const docRef = await db.collection('test-writes').add(testData);
      console.log('✅ Document written with ID: ', docRef.id);
      
      await db.collection('users').doc('app-test-user').set({
        customRole: 'app-generated',
        createdAt: new Date(),
        source: 'mobile-app'
      });
      console.log('✅ User document created');
      
      return { success: true, docId: docRef.id };
    }
    
  } catch (error) {
    console.error('❌ Firestore write failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Common error codes and solutions
    if (error.code === 'permission-denied') {
      console.log('💡 Solution: Update your Firestore security rules');
      console.log('💡 Or ensure user is authenticated if rules require auth');
    } else if (error.code === 'unavailable') {
      console.log('💡 Solution: Check internet connection or Firebase project status');
    } else if (error.code === 'not-found') {
      console.log('💡 Solution: Verify Firebase project ID and configuration');
    }
    
    return { success: false, error: error.message, code: error.code };
  }
};

// Function to check current Firestore rules
export const checkFirestoreRules = () => {
  console.log('🔒 Check your Firestore Rules in Firebase Console:');
  console.log('1. Go to Firestore Database → Rules tab');
  console.log('2. For development, temporarily use:');
  console.log(`
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if true;
        }
      }
    }
  `);
  console.log('3. Remember to secure rules before production!');
};

// Function to test authentication state
export const checkAuthState = () => {
  try {
    if (Platform.OS === 'web') {
      const { getAuth } = require('firebase/auth');
      const auth = getAuth();
      console.log('👤 Current user:', auth.currentUser ? 'Authenticated' : 'Anonymous');
      console.log('👤 User ID:', auth.currentUser?.uid || 'None');
    } else {
      const auth = require('@react-native-firebase/auth').default;
      const currentUser = auth().currentUser;
      console.log('👤 Current user:', currentUser ? 'Authenticated' : 'Anonymous');
      console.log('👤 User ID:', currentUser?.uid || 'None');
    }
  } catch (error) {
    console.error('❌ Auth check failed:', error);
  }
};

// All-in-one debug function
export const debugFirestoreIssues = async () => {
  console.log('🚀 Starting Firestore debugging...');
  
  // Check auth state
  checkAuthState();
  
  // Check rules reminder
  checkFirestoreRules();
  
  // Test write capability
  const result = await debugFirestoreWrite();
  
  if (result.success) {
    console.log('🎉 Firestore is working! Check your Firebase Console for new documents.');
  } else {
    console.log('❌ Firestore write failed. Check the errors above for solutions.');
  }
  
  return result;
};