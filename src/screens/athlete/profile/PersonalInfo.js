import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  TouchableOpacity,
  Platform,
  Vibration,
} from 'react-native';
import { 
  Card,
  Button,
  Avatar,
  IconButton,
  Surface,
  Portal,
  Modal,
  TextInput,
  Chip,
  ProgressBar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const PersonalInfo = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { personalInfo } = useSelector((state) => state.athlete);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Personal info state
  const [personalData, setPersonalData] = useState({
    fullName: 'Alex Johnson',
    age: 17,
    height: '5\'8"',
    weight: '145 lbs',
    position: 'Midfielder',
    team: 'Eagles FC U18',
    emergencyContact: 'Sarah Johnson - (555) 123-4567',
    medicalInfo: 'No known allergies',
    experience: '5 years',
    dominantFoot: 'Right',
    jerseyNumber: '10',
    goals: 'Improve speed and ball control',
  });

  const [achievements, setAchievements] = useState([
    { id: 1, title: 'Profile Starter', description: 'Complete your basic info', completed: true },
    { id: 2, title: 'Detail Master', description: 'Fill in all profile sections', completed: false },
    { id: 3, title: 'Goal Setter', description: 'Set your training goals', completed: true },
    { id: 4, title: 'Team Player', description: 'Join your first team', completed: true },
  ]);

  useEffect(() => {
    // Initialize animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Calculate profile completion
    calculateProfileCompletion();
  }, [personalData]);

  const calculateProfileCompletion = () => {
    const fields = Object.values(personalData);
    const filledFields = fields.filter(field => field && field.toString().trim() !== '');
    const completion = (filledFields.length / fields.length) * 100;
    setProfileCompletion(completion);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleEditField = (fieldName, currentValue) => {
    setEditingField(fieldName);
    setTempValue(currentValue.toString());
    setEditModalVisible(true);
    Vibration.vibrate(50);
  };

  const saveField = () => {
    if (tempValue.trim()) {
      setPersonalData(prev => ({
        ...prev,
        [editingField]: tempValue
      }));
      setEditModalVisible(false);
      setEditingField(null);
      setTempValue('');
      
      // Show success feedback
      Alert.alert('Success! 🎉', 'Your information has been updated.');
    }
  };

  const InfoCard = ({ title, children, icon }) => (
    <Card style={styles.infoCard}>
      <Surface style={styles.cardHeader}>
        <View style={styles.cardHeaderContent}>
          <MaterialIcons name={icon} size={24} color={COLORS.primary} />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
      </Surface>
      <View style={styles.cardContent}>
        {children}
      </View>
    </Card>
  );

  const InfoRow = ({ label, value, fieldName, editable = true }) => (
    <TouchableOpacity
      style={styles.infoRow}
      onPress={() => editable && handleEditField(fieldName, value)}
      disabled={!editable}
    >
      <View style={styles.infoRowContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <View style={styles.infoValueContainer}>
          <Text style={styles.infoValue}>{value}</Text>
          {editable && (
            <MaterialIcons name="edit" size={16} color={COLORS.primary} style={styles.editIcon} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const AchievementBadge = ({ achievement }) => (
    <View style={[styles.achievementBadge, achievement.completed && styles.achievementCompleted]}>
      <MaterialIcons 
        name={achievement.completed ? "check-circle" : "radio-button-unchecked"} 
        size={20} 
        color={achievement.completed ? COLORS.success : COLORS.secondary} 
      />
      <View style={styles.achievementText}>
        <Text style={[styles.achievementTitle, achievement.completed && styles.achievementTitleCompleted]}>
          {achievement.title}
        </Text>
        <Text style={styles.achievementDescription}>{achievement.description}</Text>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <Avatar.Image 
            size={80} 
            source={{ uri: 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
          <Text style={styles.headerName}>{personalData.fullName}</Text>
          <Text style={styles.headerSubtitle}>{personalData.position} • {personalData.team}</Text>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Profile Completion</Text>
            <ProgressBar 
              progress={profileCompletion / 100} 
              color={COLORS.success}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>{Math.round(profileCompletion)}% Complete</Text>
          </View>
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          style={styles.scrollView}
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
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <Surface style={styles.statCard}>
              <Text style={styles.statValue}>{personalData.age}</Text>
              <Text style={styles.statLabel}>Age</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={styles.statValue}>{personalData.experience}</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={styles.statValue}>{personalData.jerseyNumber}</Text>
              <Text style={styles.statLabel}>Jersey #</Text>
            </Surface>
          </View>

          {/* Basic Information */}
          <InfoCard title="Basic Information" icon="person">
            <InfoRow label="Full Name" value={personalData.fullName} fieldName="fullName" />
            <InfoRow label="Age" value={personalData.age} fieldName="age" />
            <InfoRow label="Height" value={personalData.height} fieldName="height" />
            <InfoRow label="Weight" value={personalData.weight} fieldName="weight" />
            <InfoRow label="Dominant Foot" value={personalData.dominantFoot} fieldName="dominantFoot" />
          </InfoCard>

          {/* Athletic Information */}
          <InfoCard title="Athletic Profile" icon="sports-soccer">
            <InfoRow label="Position" value={personalData.position} fieldName="position" />
            <InfoRow label="Team" value={personalData.team} fieldName="team" />
            <InfoRow label="Jersey Number" value={personalData.jerseyNumber} fieldName="jerseyNumber" />
            <InfoRow label="Experience" value={personalData.experience} fieldName="experience" />
            <InfoRow label="Goals" value={personalData.goals} fieldName="goals" />
          </InfoCard>

          {/* Emergency & Medical */}
          <InfoCard title="Emergency & Medical" icon="local-hospital">
            <InfoRow label="Emergency Contact" value={personalData.emergencyContact} fieldName="emergencyContact" />
            <InfoRow label="Medical Information" value={personalData.medicalInfo} fieldName="medicalInfo" />
          </InfoCard>

          {/* Achievements */}
          <Card style={styles.infoCard}>
            <Surface style={styles.cardHeader}>
              <View style={styles.cardHeaderContent}>
                <MaterialIcons name="jump-rope" size={24} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Profile Achievements 🏆</Text>
              </View>
            </Surface>
            <View style={styles.cardContent}>
              {achievements.map((achievement) => (
                <AchievementBadge key={achievement.id} achievement={achievement} />
              ))}
            </View>
          </Card>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>

      {/* Edit Modal */}
      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.blurView}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="white"
          >
            <Card style={styles.editCard}>
              <Text style={styles.editTitle}>
                Edit {editingField?.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </Text>
              
              <TextInput
                mode="outlined"
                value={tempValue}
                onChangeText={setTempValue}
                style={styles.editInput}
                autoFocus
                theme={{
                  colors: {
                    primary: COLORS.primary,
                  },
                }}
              />
              
              <View style={styles.editActions}>
                <Button
                  mode="outlined"
                  onPress={() => setEditModalVisible(false)}
                  style={styles.editButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={saveField}
                  style={styles.editButton}
                  buttonColor={COLORS.primary}
                >
                  Save
                </Button>
              </View>
            </Card>
          </BlurView>
        </Modal>
      </Portal>
    </>
  );
};

const styles = {
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.xl,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    marginBottom: SPACING.md,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerName: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.lg,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    width: '80%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    marginTop: -30,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    minWidth: 80,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  infoCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    ...TEXT_STYLES.h4,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  infoRow: {
    marginBottom: SPACING.md,
  },
  infoRowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  infoLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    flex: 1,
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  infoValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '500',
    textAlign: 'right',
  },
  editIcon: {
    marginLeft: SPACING.sm,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  achievementCompleted: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: COLORS.success,
  },
  achievementText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  achievementTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  achievementTitleCompleted: {
    color: COLORS.success,
  },
  achievementDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editCard: {
    width: '90%',
    padding: SPACING.xl,
    borderRadius: 16,
  },
  editTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    textTransform: 'capitalize',
  },
  editInput: {
    marginBottom: SPACING.lg,
    backgroundColor: 'transparent',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  editButton: {
    flex: 0.4,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
};

export default PersonalInfo;