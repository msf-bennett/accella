import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Animated,
  Alert,
  TouchableOpacity,
  Vibration,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Portal,
  Dialog,
  TextInput,
  HelperText,
  SegmentedButtons,
  FAB
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const ProfileSettings = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showSpecializationDialog, setShowSpecializationDialog] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  // Profile form state
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    bio: 'Passionate football coach with 5+ years of experience developing young talent.',
    location: 'New York, NY',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    height: '180',
    weight: '75',
    position: 'Coach', // or player position
    experienceLevel: 'professional',
    specializations: ['Football', 'Youth Training', 'Fitness'],
    languages: ['English', 'Spanish'],
    certifications: ['UEFA B License', 'First Aid Certified'],
    availability: {
      monday: { available: true, hours: '09:00-17:00' },
      tuesday: { available: true, hours: '09:00-17:00' },
      wednesday: { available: true, hours: '09:00-17:00' },
      thursday: { available: true, hours: '09:00-17:00' },
      friday: { available: true, hours: '09:00-17:00' },
      saturday: { available: false, hours: '' },
      sunday: { available: false, hours: '' }
    },
    socialLinks: {
      instagram: '',
      youtube: '',
      linkedin: '',
      website: ''
    },
    emergencyContact: {
      name: 'Jane Doe',
      phone: '+1234567891',
      relationship: 'Spouse'
    }
  });

  // Form validation
  const [errors, setErrors] = useState({});

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    // Simulate API call to refresh profile data
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const handleFeatureTap = (feature) => {
    Vibration.vibrate(30);
    Alert.alert(
      '🚧 Feature in Development',
      `${feature} is coming soon! We're working hard to bring you enhanced profile features.`,
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!profile.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!profile.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!profile.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(profile.email)) newErrors.email = 'Email is invalid';
    if (!profile.phone.trim()) newErrors.phone = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = () => {
    if (validateForm()) {
      Vibration.vibrate(50);
      Alert.alert(
        '✅ Profile Updated',
        'Your profile has been successfully updated!',
        [{ text: 'Great!', onPress: () => setIsEditing(false) }]
      );
    }
  };

  const handleImageUpload = () => {
    Alert.alert(
      '📷 Profile Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => handleFeatureTap('Camera Upload') },
        { text: 'Gallery', onPress: () => handleFeatureTap('Gallery Upload') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const ProfileCard = ({ icon, title, children, collapsible = false }) => {
    const [expanded, setExpanded] = useState(true);
    
    return (
      <Card style={styles.profileCard} elevation={2}>
        <TouchableOpacity
          onPress={() => collapsible && setExpanded(!expanded)}
          disabled={!collapsible}
        >
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Icon name={icon} size={24} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginLeft: SPACING.md }]}>
                  {title}
                </Text>
              </View>
              {collapsible && (
                <Icon 
                  name={expanded ? 'expand-less' : 'expand-more'} 
                  size={24} 
                  color={COLORS.secondary} 
                />
              )}
            </View>
            {expanded && <View style={styles.cardContent}>{children}</View>}
          </Card.Content>
        </TouchableOpacity>
      </Card>
    );
  };

  const InputField = ({ label, value, onChangeText, error, multiline = false, keyboardType = 'default', ...props }) => (
    <View style={styles.inputContainer}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        error={!!error}
        multiline={multiline}
        keyboardType={keyboardType}
        mode="outlined"
        outlineColor={COLORS.secondary}
        activeOutlineColor={COLORS.primary}
        disabled={!isEditing}
        {...props}
      />
      {error && <HelperText type="error">{error}</HelperText>}
    </View>
  );

  const SpecializationChip = ({ specialization, onRemove }) => (
    <Chip
      key={specialization}
      style={styles.chip}
      onClose={isEditing ? () => onRemove(specialization) : undefined}
      closeIcon={isEditing ? 'close' : undefined}
    >
      {specialization}
    </Chip>
  );

  const AvailabilityRow = ({ day, data, onToggle, onHoursChange }) => (
    <View style={styles.availabilityRow}>
      <Text style={[TEXT_STYLES.body, { flex: 1, textTransform: 'capitalize' }]}>{day}</Text>
      <TouchableOpacity
        onPress={() => onToggle(day)}
        disabled={!isEditing}
        style={[styles.availabilityToggle, { backgroundColor: data.available ? COLORS.success : COLORS.secondary }]}
      >
        <Text style={[TEXT_STYLES.caption, { color: 'white' }]}>
          {data.available ? 'Available' : 'Off'}
        </Text>
      </TouchableOpacity>
      {data.available && isEditing && (
        <TextInput
          value={data.hours}
          onChangeText={(text) => onHoursChange(day, text)}
          placeholder="09:00-17:00"
          style={styles.hoursInput}
          mode="outlined"
          dense
        />
      )}
      {data.available && !isEditing && (
        <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.md }]}>{data.hours}</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={[TEXT_STYLES.h2, { color: 'white', flex: 1, textAlign: 'center' }]}>
            👤 Profile Settings
          </Text>
          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            style={styles.editButton}
          >
            <Icon name={isEditing ? 'close' : 'edit'} size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Profile Photo Section */}
          <ProfileCard icon="account-circle" title="Profile Photo">
            <View style={styles.photoSection}>
              <TouchableOpacity onPress={handleImageUpload} disabled={!isEditing}>
                <Avatar.Text
                  size={100}
                  label="JD"
                  style={styles.profileAvatar}
                />
                {isEditing && (
                  <View style={styles.photoOverlay}>
                    <Icon name="camera-alt" size={32} color="white" />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.md }]}>
                {isEditing ? 'Tap to change photo' : 'Profile Photo'}
              </Text>
            </View>
          </ProfileCard>

          {/* Basic Information */}
          <ProfileCard icon="person" title="Basic Information">
            <View style={styles.twoColumnRow}>
              <View style={styles.halfWidth}>
                <InputField
                  label="First Name"
                  value={profile.firstName}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, firstName: text }))}
                  error={errors.firstName}
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Last Name"
                  value={profile.lastName}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, lastName: text }))}
                  error={errors.lastName}
                />
              </View>
            </View>
            
            <InputField
              label="Email"
              value={profile.email}
              onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
              error={errors.email}
              keyboardType="email-address"
            />
            
            <InputField
              label="Phone Number"
              value={profile.phone}
              onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
              error={errors.phone}
              keyboardType="phone-pad"
            />
            
            <InputField
              label="Bio"
              value={profile.bio}
              onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
              multiline
              numberOfLines={3}
            />
            
            <InputField
              label="Location"
              value={profile.location}
              onChangeText={(text) => setProfile(prev => ({ ...prev, location: text }))}
            />

            {isEditing && (
              <View style={styles.genderSection}>
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>Gender</Text>
                <SegmentedButtons
                  value={profile.gender}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value }))}
                  buttons={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
              </View>
            )}
          </ProfileCard>

          {/* Physical Stats (for athletes) */}
          {user?.role !== 'parent' && (
            <ProfileCard icon="fitness-center" title="Physical Stats">
              <View style={styles.twoColumnRow}>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Height (cm)"
                    value={profile.height}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, height: text }))}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Weight (kg)"
                    value={profile.weight}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, weight: text }))}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <InputField
                label={user?.role === 'coach' ? 'Coaching Position' : 'Playing Position'}
                value={profile.position}
                onChangeText={(text) => setProfile(prev => ({ ...prev, position: text }))}
              />
            </ProfileCard>
          )}

          {/* Specializations & Skills */}
          <ProfileCard icon="star" title="Specializations & Skills">
            <View style={styles.chipsContainer}>
              {profile.specializations.map(spec => (
                <SpecializationChip
                  key={spec}
                  specialization={spec}
                  onRemove={(spec) => {
                    setProfile(prev => ({
                      ...prev,
                      specializations: prev.specializations.filter(s => s !== spec)
                    }));
                  }}
                />
              ))}
              {isEditing && (
                <Chip
                  icon="plus"
                  onPress={() => setShowSpecializationDialog(true)}
                  style={[styles.chip, styles.addChip]}
                >
                  Add Skill
                </Chip>
              )}
            </View>

            <View style={styles.certificationsSection}>
              <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginBottom: SPACING.md }]}>
                🏆 Certifications
              </Text>
              {profile.certifications.map((cert, index) => (
                <Chip key={index} style={styles.certificationChip} icon="verified">
                  {cert}
                </Chip>
              ))}
              {isEditing && (
                <Button
                  mode="outlined"
                  icon="plus"
                  onPress={() => handleFeatureTap('Add Certification')}
                  style={styles.addCertButton}
                >
                  Add Certification
                </Button>
              )}
            </View>
          </ProfileCard>

          {/* Availability (for coaches) */}
          {user?.role === 'coach' && (
            <ProfileCard icon="schedule" title="Availability" collapsible>
              <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.md, color: COLORS.secondary }]}>
                Set your weekly availability for training sessions
              </Text>
              {Object.entries(profile.availability).map(([day, data]) => (
                <AvailabilityRow
                  key={day}
                  day={day}
                  data={data}
                  onToggle={(day) => {
                    setProfile(prev => ({
                      ...prev,
                      availability: {
                        ...prev.availability,
                        [day]: { ...prev.availability[day], available: !prev.availability[day].available }
                      }
                    }));
                  }}
                  onHoursChange={(day, hours) => {
                    setProfile(prev => ({
                      ...prev,
                      availability: {
                        ...prev.availability,
                        [day]: { ...prev.availability[day], hours }
                      }
                    }));
                  }}
                />
              ))}
            </ProfileCard>
          )}

          {/* Languages */}
          <ProfileCard icon="language" title="Languages">
            <View style={styles.chipsContainer}>
              {profile.languages.map(lang => (
                <Chip key={lang} style={styles.chip}>
                  {lang}
                </Chip>
              ))}
              {isEditing && (
                <Chip
                  icon="plus"
                  onPress={() => setShowLanguageDialog(true)}
                  style={[styles.chip, styles.addChip]}
                >
                  Add Language
                </Chip>
              )}
            </View>
          </ProfileCard>

          {/* Social Links */}
          <ProfileCard icon="share" title="Social Links" collapsible>
            <InputField
              label="Instagram"
              value={profile.socialLinks.instagram}
              onChangeText={(text) => setProfile(prev => ({
                ...prev,
                socialLinks: { ...prev.socialLinks, instagram: text }
              }))}
              left={<TextInput.Icon icon="instagram" />}
            />
            <InputField
              label="YouTube"
              value={profile.socialLinks.youtube}
              onChangeText={(text) => setProfile(prev => ({
                ...prev,
                socialLinks: { ...prev.socialLinks, youtube: text }
              }))}
              left={<TextInput.Icon icon="youtube" />}
            />
            <InputField
              label="LinkedIn"
              value={profile.socialLinks.linkedin}
              onChangeText={(text) => setProfile(prev => ({
                ...prev,
                socialLinks: { ...prev.socialLinks, linkedin: text }
              }))}
              left={<TextInput.Icon icon="linkedin" />}
            />
            <InputField
              label="Website"
              value={profile.socialLinks.website}
              onChangeText={(text) => setProfile(prev => ({
                ...prev,
                socialLinks: { ...prev.socialLinks, website: text }
              }))}
              left={<TextInput.Icon icon="web" />}
            />
          </ProfileCard>

          {/* Emergency Contact */}
          <ProfileCard icon="emergency" title="Emergency Contact" collapsible>
            <InputField
              label="Contact Name"
              value={profile.emergencyContact.name}
              onChangeText={(text) => setProfile(prev => ({
                ...prev,
                emergencyContact: { ...prev.emergencyContact, name: text }
              }))}
            />
            <InputField
              label="Contact Phone"
              value={profile.emergencyContact.phone}
              onChangeText={(text) => setProfile(prev => ({
                ...prev,
                emergencyContact: { ...prev.emergencyContact, phone: text }
              }))}
              keyboardType="phone-pad"
            />
            <InputField
              label="Relationship"
              value={profile.emergencyContact.relationship}
              onChangeText={(text) => setProfile(prev => ({
                ...prev,
                emergencyContact: { ...prev.emergencyContact, relationship: text }
              }))}
            />
          </ProfileCard>

          <View style={{ height: SPACING.xl * 2 }} />
        </ScrollView>
      </Animated.View>

      {/* Save FAB */}
      {isEditing && (
        <FAB
          icon="check"
          label="Save Changes"
          style={styles.saveFab}
          onPress={handleSaveProfile}
        />
      )}

      {/* Specialization Dialog */}
      <Portal>
        <Dialog visible={showSpecializationDialog} onDismiss={() => setShowSpecializationDialog(false)}>
          <Dialog.Title>Add Specialization</Dialog.Title>
          <Dialog.Content>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
              This feature is coming soon! You'll be able to add custom specializations.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowSpecializationDialog(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Language Dialog */}
      <Portal>
        <Dialog visible={showLanguageDialog} onDismiss={() => setShowLanguageDialog(false)}>
          <Dialog.Title>Add Language</Dialog.Title>
          <Dialog.Content>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
              Language selection feature is coming soon!
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLanguageDialog(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.xs,
  },
  editButton: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  profileCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardContent: {
    marginTop: SPACING.md,
  },
  photoSection: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  profileAvatar: {
    backgroundColor: COLORS.primary,
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  twoColumnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  genderSection: {
    marginTop: SPACING.lg,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  chip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  addChip: {
    backgroundColor: COLORS.primary,
  },
  certificationsSection: {
    marginTop: SPACING.lg,
  },
  certificationChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: '#e8f5e8',
  },
  addCertButton: {
    marginTop: SPACING.md,
    borderColor: COLORS.primary,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  availabilityToggle: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  hoursInput: {
    flex: 1,
    marginLeft: SPACING.md,
    height: 40,
  },
  saveFab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.success,
  },
};

export default ProfileSettings;