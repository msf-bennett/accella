// FIRESTORE DATABASE STRUCTURE
// Copy this structure to your Firebase Console > Firestore Database

/*
📊 COLLECTION: users/{uid}
Document Structure:
{
  // Firebase Auth Data
  uid: "firebase-generated-uid",
  email: "user@example.com",
  emailVerified: false,
  
  // Profile Information  
  firstName: "John",
  lastName: "Doe", 
  username: "SwiftTiger123",
  phone: "+254712345678",
  sport: "Football",
  userType: "PLAYER", // PLAYER, COACH, TRAINER, PARENT, OTHER
  customRole: "", // If userType is OTHER
  
  // Security & Recovery
  securityQuestion: "What city were you born in?",
  securityAnswer: "nairobi", // Store hashed in production
  
  // Profile Media
  profileImage: "https://storage.googleapis.com/...", // Firebase Storage URL
  
  // App-specific Data
  dateOfBirth: "", // Will be added later
  emailOptIn: true,
  
  // Sync Metadata
  syncedToServer: true,
  lastSyncAt: "2025-01-15T10:30:00Z",
  createdAt: FirebaseTimestamp,
  updatedAt: FirebaseTimestamp,
  
  // Local App ID (for reference)
  localId: "1736849400123-4567"
}

📊 COLLECTION: sync_queue/{uid}/operations/{operationId}
For queued offline operations:
{
  operationId: "1736849400123",
  type: "user_registration" | "profile_update" | "image_upload",
  data: {...}, // Operation-specific data
  priority: "high" | "medium" | "low",
  retryCount: 0,
  timestamp: FirebaseTimestamp,
  processed: false,
  error: null
}

📊 COLLECTION: app_metadata/config
App configuration and settings:
{
  version: "1.0.0",
  minSupportedVersion: "1.0.0",
  maintenanceMode: false,
  features: {
    offlineSync: true,
    profileImages: true,
    multipleAccounts: true
  }
}
*/

// FIRESTORE SECURITY RULES
// Copy these rules to Firebase Console > Firestore Database > Rules tab

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow email existence checks (for registration)
      allow read: if request.auth == null && 
                     resource == null && 
                     request.query.limit <= 1;
    }
    
    // Sync queue - users can manage their own sync operations
    match /sync_queue/{userId}/operations/{operationId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // App metadata - read-only for all authenticated users
    match /app_metadata/{document} {
      allow read: if request.auth != null;
    }
    
    // Default deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

// STORAGE SECURITY RULES
// Copy these rules to Firebase Console > Storage > Rules tab

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Profile images - users can upload/read their own images
    match /profile_images/profile_{userId}_{timestamp}.jpg {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.auth.uid == userId &&
                      resource.size < 5 * 1024 * 1024; // Max 5MB
    }
    
    // Default deny
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}


















/*

firstName: "John" (string)
lastName: "Doe" (string)  
email: "test@example.com" (string)
username: "TestUser123" (string)
phone: "+254712345678" (string)
sport: "Football" (string)
userType: "PLAYER" (string)
customRole: "" (string)
securityQuestion: "What city were you born in?" (string)
securityAnswer: "nairobi" (string)
profileImage: "" (string)
dateOfBirth: "" (string)
emailOptIn: true (boolean)
syncedToServer: true (boolean)
lastSyncAt: "2025-01-15T10:30:00Z" (string)
createdAt: [Click "Add field" → "Timestamp" → "Server timestamp"]
updatedAt: [Click "Add field" → "Timestamp" → "Server timestamp"]
localId: "1736849400123-4567" (string)
uid: "firebase-generated-uid" (string)
emailVerified: false (boolean)

*/