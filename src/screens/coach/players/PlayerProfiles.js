import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Switch
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';

const PlayerProfile = ({ visible, player, onClose, onUpdatePlayer, onDeletePlayer, isEditable = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    id: '',
    name: '',
    email: '',
    phoneNumber: '',
    position: '',
    jerseyNumber: '',
    dateOfBirth: '',
    height: '',
    weight: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalNotes: '',
    isActive: true,
    profileImage: null,
    joinedDate: '',
    stats: {
      gamesPlayed: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0
    }
  });

  const positions = [
    { label: 'Goalkeeper', value: 'Goalkeeper' },
    { label: 'Defender', value: 'Defender' },
    { label: 'Midfielder', value: 'Midfielder' },
    { label: 'Forward', value: 'Forward' },
    { label: 'Utility Player', value: 'Utility Player' }
  ];

  useEffect(() => {
    if (player) {
      setProfileData({
        ...player,
        stats: player.stats || {
          gamesPlayed: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0
        }
      });
    }
  }, [player]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 300,
      maxHeight: 300
    };

    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        setProfileData(prev => ({
          ...prev,
          profileImage: response.assets[0].uri
        }));
      }
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onUpdatePlayer(profileData);
      setIsEditing(false);
      
      Alert.alert(
        'Success',
        'Player profile updated successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to update player:', error);
      Alert.alert(
        'Error',
        'Failed to update player profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Player',
      `Are you sure you want to remove ${profileData.name} from the team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDeletePlayer(profileData.id);
            onClose();
          }
        }
      ]
    );
  };

  const handleClose = () => {
    if (isEditing) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to close?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setIsEditing(false);
              onClose();
            }
          }
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.headerButton}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Player Profile</Text>
          {isEditable && (
            <TouchableOpacity 
              onPress={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={isLoading}
            >
              <Text style={[styles.headerButton, styles.primaryButton]}>
                {isLoading ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Image and Basic Info */}
          <View style={styles.profileSection}>
            <TouchableOpacity 
              style={styles.imageContainer}
              onPress={isEditing ? handleImagePicker : null}
              disabled={!isEditing}
            >
              {profileData.profileImage ? (
                <Image 
                  source={{ uri: profileData.profileImage }} 
                  style={styles.profileImage} 
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>
                    {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'P'}
                  </Text>
                </View>
              )}
              {isEditing && (
                <View style={styles.editImageOverlay}>
                  <Text style={styles.editImageText}>Edit</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.basicInfo}>
              <Text style={styles.playerName}>{profileData.name}</Text>
              <Text style={styles.playerPosition}>
                {profileData.position} • #{profileData.jerseyNumber}
              </Text>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: profileData.isActive ? '#10B981' : '#EF4444' }
                ]} />
                <Text style={styles.statusText}>
                  {profileData.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={profileData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                editable={isEditing}
                placeholder="Enter full name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={profileData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                editable={isEditing}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Enter email"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={profileData.phoneNumber}
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                editable={isEditing}
                keyboardType="phone-pad"
                placeholder="Enter phone number"
              />
            </View>
          </View>

          {/* Team Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Information</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Position</Text>
              {isEditing ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={profileData.position}
                    onValueChange={(value) => handleInputChange('position', value)}
                    style={styles.picker}
                  >
                    {positions.map(position => (
                      <Picker.Item
                        key={position.value}
                        label={position.label}
                        value={position.value}
                      />
                    ))}
                  </Picker>
                </View>
              ) : (
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={profileData.position}
                  editable={false}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Jersey Number</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={profileData.jerseyNumber}
                onChangeText={(value) => handleInputChange('jerseyNumber', value)}
                editable={isEditing}
                keyboardType="number-pad"
                placeholder="Enter jersey number"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Active Player</Text>
                <Switch
                  value={profileData.isActive}
                  onValueChange={(value) => handleInputChange('isActive', value)}
                  disabled={!isEditing}
                />
              </View>
            </View>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={profileData.dateOfBirth}
                onChangeText={(value) => handleInputChange('dateOfBirth', value)}
                editable={isEditing}
                placeholder="MM/DD/YYYY"
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Height</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={profileData.height}
                  onChangeText={(value) => handleInputChange('height', value)}
                  editable={isEditing}
                  placeholder="5'10&quot;"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Weight</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={profileData.weight}
                  onChangeText={(value) => handleInputChange('weight', value)}
                  editable={isEditing}
                  placeholder="160 lbs"
                />
              </View>
            </View>
          </View>

          {/* Emergency Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Contact Name</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={profileData.emergencyContact}
                onChangeText={(value) => handleInputChange('emergencyContact', value)}
                editable={isEditing}
                placeholder="Enter emergency contact name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contact Phone</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={profileData.emergencyPhone}
                onChangeText={(value) => handleInputChange('emergencyPhone', value)}
                editable={isEditing}
                keyboardType="phone-pad"
                placeholder="Enter emergency contact phone"
              />
            </View>
          </View>

          {/* Medical Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medical Notes</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                !isEditing && styles.inputDisabled
              ]}
              value={profileData.medicalNotes}
              onChangeText={(value) => handleInputChange('medicalNotes', value)}
              editable={isEditing}
              multiline={true}
              numberOfLines={4}
              placeholder="Any medical conditions, allergies, or notes..."
              textAlignVertical="top"
            />
          </View>

          {/* Player Statistics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Season Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profileData.stats.gamesPlayed}</Text>
                <Text style={styles.statLabel}>Games</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profileData.stats.goals}</Text>
                <Text style={styles.statLabel}>Goals</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profileData.stats.assists}</Text>
                <Text style={styles.statLabel}>Assists</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profileData.stats.yellowCards}</Text>
                <Text style={styles.statLabel}>Yellow Cards</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profileData.stats.redCards}</Text>
                <Text style={styles.statLabel}>Red Cards</Text>
              </View>
            </View>
          </View>

          {/* Delete Button */}
          {isEditable && (
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>Remove Player</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Saving...</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerButton: {
    fontSize: 16,
    color: '#6B7280',
  },
  primaryButton: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#F9FAFB',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 36,
    fontWeight: '500',
    color: '#6B7280',
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editImageText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  basicInfo: {
    alignItems: 'center',
  },
  playerName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  playerPosition: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputDisabled: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
  },
  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 45,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: '18%',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default PlayerProfile;