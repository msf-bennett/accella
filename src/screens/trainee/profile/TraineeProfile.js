import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
  Share,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Dialog,
  TextInput,
  ProgressBar,
  Divider,
  List,
  Switch,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width, height } = Dimensions.get('window');

const TraineeProfile = ({ navigation }) => {
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: true,
    showPhone: false,
    showStats: true,
    showProgress: true,
  });

  // Redux state
  const dispatch = useDispatch();
  const { user, profile } = useSelector(state => state.profile);

  // Mock profile data - replace with actual data from Redux
  const [traineeProfile, setTraineeProfile] = useState({
    id: 'T001',
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 123-4567',
    avatar: null,
    dateOfBirth: '1995-06-15',
    gender: 'Male',
    height: 175, // cm
    weight: 70, // kg
    location: 'New York, NY',
    joinDate: '2024-01-15',
    bio: 'Passionate about fitness and always looking to improve. Love challenging workouts and trying new sports!',
    goals: ['Weight Loss', 'Muscle Building', 'Endurance'],
    fitnessLevel: 'Intermediate',
    preferredWorkoutTime: 'Morning',
    medicalConditions: [],
    emergencyContact: {
      name: 'Sarah Johnson',
      relationship: 'Sister',
      phone: '+1 (555) 987-6543',
    },
  });

  const [stats, setStats] = useState({
    totalWorkouts: 145,
    totalHours: 287,
    currentStreak: 12,
    longestStreak: 28,
    achievements: 23,
    coachesWorkedWith: 3,
    averageRating: 4.8,
    completionRate: 94,
  });

  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: 'First Workout',
      description: 'Completed your first workout session',
      icon: 'fitness-center',
      date: '2024-01-16',
      category: 'Milestone',
    },
    {
      id: 2,
      title: 'Week Warrior',
      description: 'Completed 7 days in a row',
      icon: 'local-fire-department',
      date: '2024-02-01',
      category: 'Streak',
    },
    {
      id: 3,
      title: 'Strength Master',
      description: 'Increased bench press by 25%',
      icon: 'fitness-center',
      date: '2024-03-15',
      category: 'Strength',
    },
    {
      id: 4,
      title: 'Marathon Runner',
      description: 'Completed 100+ cardio sessions',
      icon: 'directions-run',
      date: '2024-04-20',
      category: 'Cardio',
    },
  ]);

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'workout',
      title: 'HIIT Training',
      date: '2024-08-26',
      duration: 45,
      coach: 'Mike Thompson',
      rating: 5,
    },
    {
      id: 2,
      type: 'achievement',
      title: 'New Personal Best',
      date: '2024-08-25',
      description: 'Deadlift: 120kg',
    },
    {
      id: 3,
      type: 'workout',
      title: 'Strength Training',
      date: '2024-08-24',
      duration: 60,
      coach: 'Sarah Davis',
      rating: 4,
    },
  ]);

  // Component lifecycle
  useEffect(() => {
    startEntranceAnimation();
  }, []);

  const startEntranceAnimation = () => {
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Implement refresh logic
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleEditField = (field, currentValue) => {
    setEditField(field);
    setEditValue(currentValue);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    setTraineeProfile({
      ...traineeProfile,
      [editField]: editValue,
    });
    setShowEditDialog(false);
    Alert.alert('Success! ✅', 'Profile updated successfully');
  };

  const handleShareProfile = async () => {
    try {
      const result = await Share.share({
        message: `Check out my fitness profile: ${traineeProfile.firstName} ${traineeProfile.lastName} - ${stats.totalWorkouts} workouts completed with ${stats.achievements} achievements!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { text: 'Underweight', color: COLORS.secondary };
    if (bmi < 25) return { text: 'Normal', color: COLORS.success };
    if (bmi < 30) return { text: 'Overweight', color: '#FF8C00' };
    return { text: 'Obese', color: COLORS.error };
  };

  const renderProfileHeader = () => {
    const bmi = calculateBMI(traineeProfile.weight, traineeProfile.height);
    const bmiCategory = getBMICategory(bmi);

    return (
      <Animated.View
        style={{
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          opacity: fadeAnim,
          marginBottom: SPACING.lg,
        }}
      >
        <Card style={{ backgroundColor: 'white', elevation: 6 }}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={{
              padding: SPACING.lg,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Profile picture upload will be available soon.')}
              style={{ position: 'relative', marginBottom: SPACING.md }}
            >
              <Avatar.Text
                size={100}
                label={`${traineeProfile.firstName.charAt(0)}${traineeProfile.lastName.charAt(0)}`}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              />
              <Surface
                style={{
                  position: 'absolute',
                  bottom: -5,
                  right: -5,
                  borderRadius: 15,
                  elevation: 4,
                }}
              >
                <IconButton
                  icon="camera"
                  size={16}
                  iconColor={COLORS.primary}
                  style={{ margin: 0, backgroundColor: 'white' }}
                />
              </Surface>
            </TouchableOpacity>

            <Text style={[TEXT_STYLES.h1, { color: 'white', textAlign: 'center' }]}>
              {traineeProfile.firstName} {traineeProfile.lastName}
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)', textAlign: 'center' }]}>
              {traineeProfile.location}
            </Text>
            
            <View style={{ flexDirection: 'row', marginTop: SPACING.sm }}>
              <Chip
                mode="outlined"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginRight: SPACING.xs }}
              >
                Level: {traineeProfile.fitnessLevel}
              </Chip>
              <Chip
                mode="outlined"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                Member since {new Date(traineeProfile.joinDate).getFullYear()}
              </Chip>
            </View>
          </LinearGradient>

          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.md }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
                  {calculateAge(traineeProfile.dateOfBirth)}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Age</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
                  {traineeProfile.height}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Height (cm)</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
                  {traineeProfile.weight}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Weight (kg)</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h2, { color: bmiCategory.color }]}>
                  {bmi}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>BMI</Text>
              </View>
            </View>

            {traineeProfile.bio && (
              <View>
                <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center', fontStyle: 'italic' }]}>
                  "{traineeProfile.bio}"
                </Text>
              </View>
            )}
          </Card.Content>

          <Card.Actions>
            <Button
              mode="outlined"
              onPress={() => handleEditField('bio', traineeProfile.bio)}
            >
              Edit Profile
            </Button>
            <Button
              mode="contained"
              onPress={handleShareProfile}
            >
              Share Profile
            </Button>
          </Card.Actions>
        </Card>
      </Animated.View>
    );
  };

  const renderStatsCard = () => (
    <Card style={{ backgroundColor: 'white', elevation: 4, marginBottom: SPACING.md }}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ padding: SPACING.md, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
      >
        <Text style={[TEXT_STYLES.h3, { color: 'white', textAlign: 'center' }]}>
          Fitness Statistics 📊
        </Text>
      </LinearGradient>
      
      <Card.Content style={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <View style={{ width: '48%', alignItems: 'center', marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.h1, { color: COLORS.primary }]}>{stats.totalWorkouts}</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Total Workouts</Text>
          </View>
          <View style={{ width: '48%', alignItems: 'center', marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.h1, { color: COLORS.success }]}>{stats.totalHours}h</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Training Hours</Text>
          </View>
          <View style={{ width: '48%', alignItems: 'center', marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.h1, { color: '#FF6B35' }]}>{stats.currentStreak}</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Current Streak</Text>
          </View>
          <View style={{ width: '48%', alignItems: 'center', marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.h1, { color: COLORS.secondary }]}>{stats.achievements}</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Achievements</Text>
          </View>
        </View>

        <Divider style={{ marginVertical: SPACING.md }} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>{stats.completionRate}%</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Completion Rate</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="star" size={16} color="#FFD700" />
              <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginLeft: 2 }]}>{stats.averageRating}</Text>
            </View>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Avg Rating</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>{stats.coachesWorkedWith}</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Coaches</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderPersonalInfo = () => (
    <Card style={{ backgroundColor: 'white', elevation: 4, marginBottom: SPACING.md }}>
      <Card.Content style={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.textPrimary }]}>
            Personal Information 👤
          </Text>
          <IconButton
            icon="edit"
            size={20}
            onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Bulk edit functionality will be available soon.')}
          />
        </View>

        <View style={{ marginBottom: SPACING.sm }}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Email</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.body]}>{traineeProfile.email}</Text>
            <IconButton
              icon="edit"
              size={16}
              onPress={() => handleEditField('email', traineeProfile.email)}
            />
          </View>
        </View>

        <View style={{ marginBottom: SPACING.sm }}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Phone</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.body]}>{traineeProfile.phone}</Text>
            <IconButton
              icon="edit"
              size={16}
              onPress={() => handleEditField('phone', traineeProfile.phone)}
            />
          </View>
        </View>

        <View style={{ marginBottom: SPACING.sm }}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Date of Birth</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.body]}>{new Date(traineeProfile.dateOfBirth).toLocaleDateString()}</Text>
            <IconButton
              icon="edit"
              size={16}
              onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Date picker will be available soon.')}
            />
          </View>
        </View>

        <View style={{ marginBottom: SPACING.sm }}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Gender</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.body]}>{traineeProfile.gender}</Text>
            <IconButton
              icon="edit"
              size={16}
              onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Gender selection will be available soon.')}
            />
          </View>
        </View>

        <View>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Preferred Workout Time</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.body]}>{traineeProfile.preferredWorkoutTime}</Text>
            <IconButton
              icon="edit"
              size={16}
              onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Time preference selection will be available soon.')}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderGoalsAndLevel = () => (
    <Card style={{ backgroundColor: 'white', elevation: 4, marginBottom: SPACING.md }}>
      <Card.Content style={{ padding: SPACING.md }}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.textPrimary }]}>
          Goals & Fitness Level 🎯
        </Text>

        <View style={{ marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.sm }]}>
            Current Goals
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {traineeProfile.goals.map((goal, index) => (
              <Chip
                key={index}
                mode="outlined"
                style={{
                  marginRight: SPACING.xs,
                  marginBottom: SPACING.xs,
                  backgroundColor: COLORS.primaryLight,
                }}
              >
                {goal}
              </Chip>
            ))}
          </View>
        </View>

        <View style={{ marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Fitness Level</Text>
          <Chip
            mode="outlined"
            style={{
              alignSelf: 'flex-start',
              backgroundColor: COLORS.success,
              marginTop: SPACING.xs,
            }}
          >
            {traineeProfile.fitnessLevel}
          </Chip>
        </View>

        <Button
          mode="outlined"
          onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Goals and level editing will be available soon.')}
        >
          Update Goals & Level
        </Button>
      </Card.Content>
    </Card>
  );

  const renderAchievements = () => (
    <Card style={{ backgroundColor: 'white', elevation: 4, marginBottom: SPACING.md }}>
      <Card.Content style={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.textPrimary }]}>
            Recent Achievements 🏆
          </Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Achievements')}
          >
            View All
          </Button>
        </View>

        {achievements.slice(0, 3).map((achievement) => (
          <View
            key={achievement.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: SPACING.sm,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            }}
          >
            <Avatar.Icon
              size={40}
              icon={achievement.icon}
              style={{
                backgroundColor: COLORS.primaryLight,
                marginRight: SPACING.sm,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                {achievement.title}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {achievement.description}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {new Date(achievement.date).toLocaleDateString()}
              </Text>
            </View>
            <Chip mode="outlined" compact>
              {achievement.category}
            </Chip>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderEditDialog = () => (
    <Portal>
      <Dialog visible={showEditDialog} onDismiss={() => setShowEditDialog(false)}>
        <Dialog.Title>Edit {editField}</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label={`Enter ${editField}`}
            value={editValue}
            onChangeText={setEditValue}
            mode="outlined"
            multiline={editField === 'bio'}
            numberOfLines={editField === 'bio' ? 4 : 1}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowEditDialog(false)}>Cancel</Button>
          <Button
            mode="contained"
            onPress={handleSaveEdit}
            disabled={!editValue.trim()}
          >
            Save
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderPrivacySettings = () => (
    <Card style={{ backgroundColor: 'white', elevation: 2, marginBottom: SPACING.md }}>
      <Card.Content style={{ padding: SPACING.md }}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.textPrimary }]}>
          Privacy Settings 🔒
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
          <Text style={[TEXT_STYLES.body]}>Show Email to Coaches</Text>
          <Switch
            value={privacySettings.showEmail}
            onValueChange={(value) => setPrivacySettings({...privacySettings, showEmail: value})}
            color={COLORS.primary}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
          <Text style={[TEXT_STYLES.body]}>Show Phone Number</Text>
          <Switch
            value={privacySettings.showPhone}
            onValueChange={(value) => setPrivacySettings({...privacySettings, showPhone: value})}
            color={COLORS.primary}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
          <Text style={[TEXT_STYLES.body]}>Show Statistics</Text>
          <Switch
            value={privacySettings.showStats}
            onValueChange={(value) => setPrivacySettings({...privacySettings, showStats: value})}
            color={COLORS.primary}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[TEXT_STYLES.body]}>Show Progress</Text>
          <Switch
            value={privacySettings.showProgress}
            onValueChange={(value) => setPrivacySettings({...privacySettings, showProgress: value})}
            color={COLORS.primary}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: Platform.OS === 'ios' ? 50 : 30,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <IconButton
            icon="arrow-back"
            size={24}
            iconColor="white"
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.h2, { color: 'white', flex: 1, textAlign: 'center' }]}>
            My Profile
          </Text>
          <IconButton
            icon="settings"
            size={24}
            iconColor="white"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Profile Header */}
          {renderProfileHeader()}

          {/* Stats Card */}
          {renderStatsCard()}

          {/* Personal Information */}
          {renderPersonalInfo()}

          {/* Goals and Fitness Level */}
          {renderGoalsAndLevel()}

          {/* Achievements */}
          {renderAchievements()}

          {/* Privacy Settings */}
          {renderPrivacySettings()}

          {/* Quick Actions */}
          <Card style={{ backgroundColor: 'white', elevation: 2 }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.textPrimary }]}>
                Quick Actions ⚡
              </Text>
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Button
                  mode="outlined"
                  icon="sports"
                  onPress={() => navigation.navigate('SportsBackground')}
                  style={{ marginRight: SPACING.sm, marginBottom: SPACING.sm }}
                >
                  Sports Background
                </Button>
                <Button
                  mode="outlined"
                  icon="credit-card"
                  onPress={() => navigation.navigate('Subscription')}
                  style={{ marginRight: SPACING.sm, marginBottom: SPACING.sm }}
                >
                  Subscription
                </Button>
                <Button
                  mode="outlined"
                  icon="timeline"
                  onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Progress tracking will be available soon.')}
                  style={{ marginRight: SPACING.sm, marginBottom: SPACING.sm }}
                >
                  Progress
                </Button>
                <Button
                  mode="outlined"
                  icon="download"
                  onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Data export will be available soon.')}
                  style={{ marginBottom: SPACING.sm }}
                >
                  Export Data
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Edit Dialog */}
      {renderEditDialog()}

      {/* Floating Action Button */}
      <FAB
        icon="edit"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => handleEditField('bio', traineeProfile.bio)}
        label="Edit"
      />
    </View>
  );
};

export default TraineeProfile;