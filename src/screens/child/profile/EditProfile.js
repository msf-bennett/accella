import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Alert,
  RefreshControl,
  StatusBar,
  Vibration,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Button,
  TextInput,
  Avatar,
  IconButton,
  Surface,
  Chip,
  Portal,
  Modal,
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const EditProfile = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [showParentalModal, setShowParentalModal] = useState(false);
  const [showSportsModal, setShowSportsModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || 'Young Athlete',
    nickname: user?.nickname || '',
    age: user?.age || '',
    favoriteColor: user?.favoriteColor || '#667eea',
    bio: user?.bio || 'I love sports and getting stronger! 💪',
    sports: user?.sports || ['Football', 'Swimming'],
    goals: user?.goals || ['Get faster', 'Have fun', 'Make friends'],
    avatarColor: user?.avatarColor || '#667eea',
    achievements: user?.achievements || 0,
  });

  const scrollViewRef = useRef();

  const availableSports = [
    'Football', 'Basketball', 'Swimming', 'Tennis', 'Soccer', 
    'Baseball', 'Volleyball', 'Track & Field', 'Gymnastics', 
    'Martial Arts', 'Cricket', 'Rugby', 'Hockey'
  ];

  const avatarColors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', 
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
  ];

  const goalSuggestions = [
    'Get stronger 💪', 'Run faster 🏃‍♂️', 'Have more fun 🎉', 
    'Make new friends 👫', 'Learn new skills 🎯', 'Be healthier 🌟',
    'Win competitions 🏆', 'Practice daily 📅', 'Listen to coach 👨‍🏫'
  ];

  useEffect(() => {
    // Entrance animation
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1500);
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
    if (!isEditing) setIsEditing(true);
  };

  const handleSportToggle = (sport) => {
    setProfileData(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport].slice(0, 3), // Max 3 sports
    }));
    setHasChanges(true);
    Vibration.vibrate(25);
  };

  const handleGoalToggle = (goal) => {
    setProfileData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal].slice(0, 4), // Max 4 goals
    }));
    setHasChanges(true);
    Vibration.vibrate(25);
  };

  const handleSensitiveChange = () => {
    Alert.alert(
      "👨‍👩‍👧‍👦 Parent Approval Required",
      "Changes to age or personal details need your parent's permission for safety!",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Ask Parent", 
          onPress: () => {
            setShowParentalModal(true);
            Vibration.vibrate(50);
          }
        },
      ]
    );
  };

  const handleSaveProfile = () => {
    if (!hasChanges) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      "💾 Save Changes?",
      "Your profile looks awesome! Save these changes?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Save! ✨", 
          onPress: () => {
            // Dispatch profile update
            dispatch({ type: 'UPDATE_PROFILE', payload: profileData });
            setHasChanges(false);
            setIsEditing(false);
            Vibration.vibrate([25, 50, 25]);
            
            Alert.alert(
              "🎉 Profile Updated!",
              "Your profile looks amazing! Great job!",
              [{ text: "Awesome! 🌟", onPress: () => navigation.goBack() }]
            );
          }
        },
      ]
    );
  };

  const handleAvatarColorChange = (color) => {
    setProfileData(prev => ({
      ...prev,
      avatarColor: color,
    }));
    setHasChanges(true);
    setShowAvatarModal(false);
    Vibration.vibrate(25);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient 
        colors={['#667eea', '#764ba2']} 
        style={styles.header}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-back"
              size={24}
              iconColor="white"
              onPress={() => navigation.goBack()}
            />
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Edit My Profile ✏️</Text>
              <Text style={styles.headerSubtitle}>Make it yours!</Text>
            </View>
            <IconButton
              icon="check"
              size={24}
              iconColor={hasChanges ? "white" : "rgba(255,255,255,0.5)"}
              onPress={handleSaveProfile}
            />
          </View>

          <TouchableOpacity onPress={() => setShowAvatarModal(true)}>
            <View style={styles.avatarContainer}>
              <Avatar.Text 
                size={80} 
                label={profileData.displayName?.charAt(0) || 'K'} 
                style={[styles.avatar, { backgroundColor: profileData.avatarColor }]}
              />
              <Surface style={styles.editAvatarBadge}>
                <Icon name="edit" size={16} color={COLORS.primary} />
              </Surface>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
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
        {/* Basic Info */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>📝 Basic Info</Text>
          
          <Card style={styles.formCard}>
            <Card.Content>
              <TextInput
                label="Display Name ✨"
                value={profileData.displayName}
                onChangeText={(text) => handleInputChange('displayName', text)}
                mode="outlined"
                style={styles.input}
                maxLength={30}
                placeholder="What should we call you?"
              />

              <TextInput
                label="Nickname (Optional) 😊"
                value={profileData.nickname}
                onChangeText={(text) => handleInputChange('nickname', text)}
                mode="outlined"
                style={styles.input}
                maxLength={20}
                placeholder="Cool nickname?"
              />

              <TouchableOpacity onPress={handleSensitiveChange}>
                <TextInput
                  label="Age 🎂"
                  value={profileData.age}
                  mode="outlined"
                  style={[styles.input, styles.disabledInput]}
                  editable={false}
                  right={<TextInput.Icon icon="lock" color={COLORS.primary} />}
                  placeholder="Ask parent to update"
                />
              </TouchableOpacity>

              <TextInput
                label="About Me 🌟"
                value={profileData.bio}
                onChangeText={(text) => handleInputChange('bio', text)}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={3}
                maxLength={150}
                placeholder="Tell everyone what makes you awesome!"
              />
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Sports Selection */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚽ My Sports</Text>
            <Text style={styles.sectionDescription}>
              Pick up to 3 sports you love! 🏆
            </Text>
          </View>
          
          <Card style={styles.sportsCard}>
            <Card.Content>
              <View style={styles.chipContainer}>
                {availableSports.map((sport, index) => (
                  <Chip
                    key={index}
                    selected={profileData.sports.includes(sport)}
                    onPress={() => handleSportToggle(sport)}
                    style={[
                      styles.sportChip,
                      profileData.sports.includes(sport) && styles.selectedChip
                    ]}
                    textStyle={[
                      styles.chipText,
                      profileData.sports.includes(sport) && styles.selectedChipText
                    ]}
                    mode="outlined"
                  >
                    {sport}
                  </Chip>
                ))}
              </View>
              <Text style={styles.chipCounter}>
                Selected: {profileData.sports.length}/3
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Goals */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 My Goals</Text>
            <Text style={styles.sectionDescription}>
              What do you want to achieve? Pick up to 4! 🌟
            </Text>
          </View>
          
          <Card style={styles.goalsCard}>
            <Card.Content>
              <View style={styles.chipContainer}>
                {goalSuggestions.map((goal, index) => (
                  <Chip
                    key={index}
                    selected={profileData.goals.includes(goal)}
                    onPress={() => handleGoalToggle(goal)}
                    style={[
                      styles.goalChip,
                      profileData.goals.includes(goal) && styles.selectedChip
                    ]}
                    textStyle={[
                      styles.chipText,
                      profileData.goals.includes(goal) && styles.selectedChipText
                    ]}
                    mode="outlined"
                  >
                    {goal}
                  </Chip>
                ))}
              </View>
              <Text style={styles.chipCounter}>
                Selected: {profileData.goals.length}/4
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Achievements Display */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>🏆 My Achievements</Text>
          
          <Card style={styles.achievementCard}>
            <LinearGradient 
              colors={['#ffecd2', '#fcb69f']} 
              style={styles.achievementGradient}
            >
              <Card.Content>
                <View style={styles.achievementContent}>
                  <Icon name="jump-rope" size={48} color="#ff6b35" />
                  <View style={styles.achievementText}>
                    <Text style={styles.achievementNumber}>
                      {profileData.achievements || 0}
                    </Text>
                    <Text style={styles.achievementLabel}>
                      Badges Earned! 🎖️
                    </Text>
                  </View>
                  <IconButton
                    icon="arrow-forward"
                    size={24}
                    iconColor="#ff6b35"
                    onPress={() => navigation.navigate('Achievements')}
                  />
                </View>
              </Card.Content>
            </LinearGradient>
          </Card>
        </Animated.View>

        {/* Parent Controls Info */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>👨‍👩‍👧‍👦 Parent Zone</Text>
          
          <Card style={styles.parentCard}>
            <Card.Content>
              <View style={styles.parentInfo}>
                <Icon name="info" size={24} color={COLORS.primary} />
                <View style={styles.parentText}>
                  <Text style={styles.parentTitle}>Safety First! 🛡️</Text>
                  <Text style={styles.parentDescription}>
                    Some settings need parent approval to keep you safe. 
                    Your parents can always update your personal information.
                  </Text>
                </View>
              </View>
              
              <Button
                mode="outlined"
                onPress={() => setShowParentalModal(true)}
                style={styles.parentButton}
                icon="family-restroom"
              >
                Need Parent Help? 👨‍👩‍👧‍👦
              </Button>
            </Card.Content>
          </Card>
        </Animated.View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Save Button */}
      {hasChanges && (
        <Animated.View 
          style={[
            styles.saveButtonContainer,
            { opacity: fadeAnim }
          ]}
        >
          <Button
            mode="contained"
            onPress={handleSaveProfile}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
            labelStyle={styles.saveButtonText}
          >
            Save My Awesome Profile! ✨
          </Button>
        </Animated.View>
      )}

      {/* Avatar Color Modal */}
      <Portal>
        <Modal
          visible={showAvatarModal}
          onDismiss={() => setShowAvatarModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.modalBlur}
            blurType="light"
            blurAmount={10}
          >
            <Card style={styles.modalCard}>
              <Card.Content style={styles.modalContent}>
                <Icon name="palette" size={48} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Choose Avatar Color! 🎨</Text>
                
                <View style={styles.colorGrid}>
                  {avatarColors.map((color, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleAvatarColorChange(color)}
                      style={styles.colorOption}
                    >
                      <Avatar.Text 
                        size={50} 
                        label={profileData.displayName?.charAt(0) || 'K'} 
                        style={[styles.colorAvatar, { backgroundColor: color }]}
                      />
                      {profileData.avatarColor === color && (
                        <Icon 
                          name="check-circle" 
                          size={20} 
                          color={COLORS.success} 
                          style={styles.colorCheck}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Button
                  mode="outlined"
                  onPress={() => setShowAvatarModal(false)}
                  style={styles.modalCloseButton}
                >
                  Done! 👍
                </Button>
              </Card.Content>
            </Card>
          </BlurView>
        </Modal>
      </Portal>

      {/* Parental Request Modal */}
      <Portal>
        <Modal
          visible={showParentalModal}
          onDismiss={() => setShowParentalModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.modalBlur}
            blurType="light"
            blurAmount={10}
          >
            <Card style={styles.modalCard}>
              <Card.Content style={styles.modalContent}>
                <Icon name="family-restroom" size={48} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Parent Request Sent! 📨</Text>
                <Text style={styles.modalDescription}>
                  We've told your parent you need help with your profile. 
                  They'll get a notification and can help you make changes safely! 🛡️
                </Text>
                <View style={styles.modalActions}>
                  <Button
                    mode="contained"
                    onPress={() => setShowParentalModal(false)}
                    style={styles.modalButton}
                  >
                    Perfect! ✨
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </BlurView>
        </Modal>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.lg,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    elevation: 3,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 15,
    padding: SPACING.xs,
    elevation: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  section: {
    marginVertical: SPACING.lg,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  formCard: {
    elevation: 2,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: 'transparent',
  },
  disabledInput: {
    opacity: 0.7,
  },
  sportsCard: {
    elevation: 2,
  },
  goalsCard: {
    elevation: 2,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  sportChip: {
    margin: SPACING.xs / 2,
    backgroundColor: COLORS.background,
  },
  goalChip: {
    margin: SPACING.xs / 2,
    backgroundColor: COLORS.background,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
  },
  selectedChipText: {
    color: 'white',
  },
  chipCounter: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  achievementCard: {
    elevation: 3,
    borderRadius: 16,
    overflow: 'hidden',
  },
  achievementGradient: {
    padding: 0,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  achievementNumber: {
    ...TEXT_STYLES.h1,
    color: '#ff6b35',
    fontWeight: '800',
  },
  achievementLabel: {
    ...TEXT_STYLES.body,
    color: '#ff6b35',
    fontWeight: '600',
  },
  parentCard: {
    elevation: 2,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  parentInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  parentText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  parentTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  parentDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
  parentButton: {
    borderColor: COLORS.primary,
    borderRadius: 25,
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 1000,
  },
  saveButton: {
    borderRadius: 25,
    elevation: 5,
  },
  saveButtonContent: {
    paddingVertical: SPACING.xs,
  },
  saveButtonText: {
    ...TEXT_STYLES.body,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 100,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalCard: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    elevation: 5,
  },
  modalContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  modalActions: {
    width: '100%',
  },
  modalButton: {
    borderRadius: 25,
  },
  modalCloseButton: {
    borderRadius: 25,
    marginTop: SPACING.md,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
    maxWidth: 300,
  },
  colorOption: {
    margin: SPACING.xs,
    position: 'relative',
  },
  colorAvatar: {
    elevation: 2,
  },
  colorCheck: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
  },
});

export default EditProfile;