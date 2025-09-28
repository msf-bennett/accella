import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const PlayerInvitation = ({ visible, onSendInvitation, onClose, teamName }) => {
  const [formData, setFormData] = useState({
    playerName: '',
    email: '',
    phoneNumber: '',
    position: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const positions = [
    { label: 'Select a position', value: '' },
    { label: 'Goalkeeper', value: 'Goalkeeper' },
    { label: 'Defender', value: 'Defender' },
    { label: 'Midfielder', value: 'Midfielder' },
    { label: 'Forward', value: 'Forward' },
    { label: 'Utility Player', value: 'Utility Player' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.playerName.trim()) {
      newErrors.playerName = 'Player name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.position) {
      newErrors.position = 'Position is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const invitationData = {
        ...formData,
        teamName,
        invitedAt: new Date().toISOString(),
        status: 'pending'
      };
      
      onSendInvitation(invitationData);
      
      Alert.alert(
        'Success!',
        `Invitation sent to ${formData.playerName} at ${formData.email}`,
        [{ text: 'OK', onPress: handleClose }]
      );
      
    } catch (error) {
      console.error('Failed to send invitation:', error);
      Alert.alert(
        'Error',
        'Failed to send invitation. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      playerName: '',
      email: '',
      phoneNumber: '',
      position: '',
      message: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Invite New Player</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleClose}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            {/* Player Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Player Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.playerName && styles.inputError
                ]}
                value={formData.playerName}
                onChangeText={(value) => handleInputChange('playerName', value)}
                placeholder="Enter player's full name"
                placeholderTextColor="#9CA3AF"
              />
              {errors.playerName && (
                <Text style={styles.errorText}>{errors.playerName}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.email && styles.inputError
                ]}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="player@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Phone Number */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>

            {/* Position */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Preferred Position *</Text>
              <View style={[
                styles.pickerContainer,
                errors.position && styles.inputError
              ]}>
                <Picker
                  selectedValue={formData.position}
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
              {errors.position && (
                <Text style={styles.errorText}>{errors.position}</Text>
              )}
            </View>

            {/* Message */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Personal Message (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.message}
                onChangeText={(value) => handleInputChange('message', value)}
                placeholder="Add a personal message to the invitation..."
                placeholderTextColor="#9CA3AF"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Preview */}
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>Invitation Preview:</Text>
              <View style={styles.previewContent}>
                <Text style={styles.previewItem}>
                  <Text style={styles.previewLabel}>Team: </Text>
                  {teamName || 'Your Team'}
                </Text>
                <Text style={styles.previewItem}>
                  <Text style={styles.previewLabel}>Player: </Text>
                  {formData.playerName || 'Player Name'}
                </Text>
                <Text style={styles.previewItem}>
                  <Text style={styles.previewLabel}>Position: </Text>
                  {formData.position || 'Not specified'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              isLoading && styles.sendButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="white" size="small" />
                <Text style={styles.sendButtonText}>Sending...</Text>
              </View>
            ) : (
              <Text style={styles.sendButtonText}>Send Invitation</Text>
            )}
          </TouchableOpacity>
        </View>
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
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 5,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 28,
    color: '#6B7280',
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 50,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  previewContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  previewContent: {
    gap: 4,
  },
  previewItem: {
    fontSize: 13,
    color: '#6B7280',
  },
  previewLabel: {
    fontWeight: '500',
    color: '#374151',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  sendButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default PlayerInvitation;
