import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions,
  Vibration,
  Image,
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
  Modal,
  TextInput,
  Switch,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const MarketPlaceProfile = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, profile } = useSelector(state => state);
  
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [isProfileVisible, setIsProfileVisible] = useState(true);
  const [instantBooking, setInstantBooking] = useState(true);
  
  const [profileData, setProfileData] = useState({
    title: 'Certified Personal Trainer & Nutrition Coach',
    bio: 'Helping you achieve your fitness goals with personalized training programs. 10+ years of experience in strength training, weight loss, and athletic performance.',
    hourlyRate: 85,
    sessionTypes: ['1-on-1 Training', 'Group Sessions', 'Online Coaching', 'Nutrition Planning'],
    specializations: ['Weight Loss', 'Muscle Building', 'Athletic Performance', 'Rehabilitation'],
    certifications: ['NASM-CPT', 'Precision Nutrition Level 1', 'FMS Level 2'],
    experience: '10+ years',
    languages: ['English', 'Spanish'],
    availability: {
      monday: { enabled: true, start: '06:00', end: '20:00' },
      tuesday: { enabled: true, start: '06:00', end: '20:00' },
      wednesday: { enabled: true, start: '06:00', end: '20:00' },
      thursday: { enabled: true, start: '06:00', end: '20:00' },
      friday: { enabled: true, start: '06:00', end: '20:00' },
      saturday: { enabled: true, start: '08:00', end: '16:00' },
      sunday: { enabled: false, start: '08:00', end: '16:00' },
    },
    location: 'Downtown Fitness Center, New York',
    radius: 15,
    photos: [
      'https://example.com/gym1.jpg',
      'https://example.com/gym2.jpg',
      'https://example.com/training1.jpg',
    ],
    videoIntro: 'https://example.com/intro-video.mp4',
  });

  const [profileStats, setProfileStats] = useState({
    totalViews: 1247,
    bookingsThisMonth: 28,
    responseRate: 95,
    rating: 4.9,
    totalReviews: 156,
    repeatClients: 87,
  });

  const [recentReviews, setRecentReviews] = useState([
    {
      id: 'rev_001',
      clientName: 'Sarah M.',
      rating: 5,
      comment: 'Amazing trainer! Helped me lose 25 lbs and gain so much confidence. Highly recommend!',
      date: '2025-01-15',
      verified: true,
    },
    {
      id: 'rev_002',
      clientName: 'Mike D.',
      rating: 5,
      comment: 'Professional, knowledgeable, and motivating. Great nutrition advice too!',
      date: '2025-01-12',
      verified: true,
    },
    {
      id: 'rev_003',
      clientName: 'Emma L.',
      rating: 4,
      comment: 'Excellent form correction and personalized workouts. Seeing great results!',
      date: '2025-01-08',
      verified: true,
    },
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const profileSections = [
    {
      id: 'basic_info',
      title: 'Basic Information',
      description: 'Your title, bio, and contact details',
      icon: 'person',
      status: 'complete',
    },
    {
      id: 'services_pricing',
      title: 'Services & Pricing',
      description: 'Session types and hourly rates',
      icon: 'attach-money',
      status: 'complete',
    },
    {
      id: 'specializations',
      title: 'Specializations',
      description: 'Your expertise and certifications',
      icon: 'star',
      status: 'complete',
    },
    {
      id: 'availability',
      title: 'Availability',
      description: 'Your working hours and schedule',
      icon: 'schedule',
      status: 'complete',
    },
    {
      id: 'location_travel',
      title: 'Location & Travel',
      description: 'Where you train and travel radius',
      icon: 'location-on',
      status: 'complete',
    },
    {
      id: 'photos_videos',
      title: 'Photos & Videos',
      description: 'Showcase your gym and training style',
      icon: 'photo-camera',
      status: 'incomplete',
    },
  ];

  const handleSectionPress = (section) => {
    Vibration.vibrate(50);
    setSelectedSection(section);
    
    switch (section.id) {
      case 'basic_info':
        setModalVisible(true);
        break;
      case 'services_pricing':
        setModalVisible(true);
        break;
      case 'specializations':
        setModalVisible(true);
        break;
      case 'availability':
        navigation.navigate('AvailabilitySettings');
        break;
      case 'location_travel':
        setModalVisible(true);
        break;
      case 'photos_videos':
        handleMediaUpload();
        break;
      default:
        Alert.alert(
          'Coming Soon',
          'This profile section is currently in development.',
          [{ text: 'OK', style: 'default' }]
        );
    }
  };

  const handleMediaUpload = () => {
    Alert.alert(
      'Add Photos & Videos',
      'Choose how you want to add media to your profile:',
      [
        { text: 'Take Photo', onPress: () => takePhoto() },
        { text: 'Choose from Gallery', onPress: () => chooseFromGallery() },
        { text: 'Record Video', onPress: () => recordVideo() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const takePhoto = () => {
    Alert.alert('Camera', 'Camera integration coming soon!');
  };

  const chooseFromGallery = () => {
    Alert.alert('Gallery', 'Photo gallery integration coming soon!');
  };

  const recordVideo = () => {
    Alert.alert('Video Recording', 'Video recording feature coming soon!');
  };

  const handlePreviewProfile = () => {
    Alert.alert(
      'Profile Preview',
      'This will show how your profile appears to clients in the marketplace.',
      [
        {
          text: 'View Preview',
          onPress: () => navigation.navigate('ProfilePreview', { profileData })
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out my fitness training profile! I offer personalized training sessions and nutrition coaching. Book a session today! 🏋️‍♂️💪\n\n${profileData.title}\n⭐ ${profileStats.rating}/5 (${profileStats.totalReviews} reviews)`,
        url: `https://app.fitnesscoach.com/trainer/${user.id}`,
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  const handleBoostProfile = () => {
    Alert.alert(
      'Boost Your Profile 🚀',
      'Increase your visibility in search results and get more bookings! Premium promotion starts at $19.99/week.',
      [
        { text: 'Learn More', onPress: () => navigation.navigate('ProfileBoosting') },
        { text: 'Maybe Later', style: 'cancel' },
      ]
    );
  };

  const renderProfileHeader = () => (
    <Card style={styles.headerCard}>
      <LinearGradient
        colors={[COLORS.primary, '#764ba2']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.profileInfo}>
            <Avatar.Text
              size={60}
              label={user.name.split(' ').map(n => n[0]).join('')}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              labelStyle={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}
            />
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileTitle}>{profileData.title}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {profileStats.rating} ({profileStats.totalReviews} reviews)
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.visibilityToggle}>
            <Switch
              value={isProfileVisible}
              onValueChange={setIsProfileVisible}
              trackColor={{ false: '#767577', true: '#4ECDC4' }}
              thumbColor={isProfileVisible ? '#fff' : '#f4f3f4'}
            />
            <Text style={styles.visibilityText}>
              {isProfileVisible ? 'Visible' : 'Hidden'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <Surface style={styles.statCard}>
          <Text style={styles.statNumber}>{profileStats.totalViews}</Text>
          <Text style={styles.statLabel}>Profile Views</Text>
          <View style={styles.statTrend}>
            <Icon name="trending-up" size={14} color={COLORS.success} />
            <Text style={[styles.trendText, { color: COLORS.success }]}>+12%</Text>
          </View>
        </Surface>
        <Surface style={styles.statCard}>
          <Text style={styles.statNumber}>{profileStats.bookingsThisMonth}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
          <Text style={styles.statPeriod}>This Month</Text>
        </Surface>
      </View>
      <View style={styles.statsRow}>
        <Surface style={styles.statCard}>
          <Text style={styles.statNumber}>{profileStats.responseRate}%</Text>
          <Text style={styles.statLabel}>Response Rate</Text>
          <Chip mode="outlined" textStyle={styles.excellentChipText} style={styles.excellentChip}>
            Excellent
          </Chip>
        </Surface>
        <Surface style={styles.statCard}>
          <Text style={styles.statNumber}>{profileStats.repeatClients}%</Text>
          <Text style={styles.statLabel}>Repeat Clients</Text>
          <Text style={styles.statPeriod}>Retention Rate</Text>
        </Surface>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity style={styles.quickActionCard} onPress={handlePreviewProfile}>
          <LinearGradient
            colors={['#4ECDC4', '#44A08D']}
            style={styles.quickActionGradient}
          >
            <Icon name="visibility" size={24} color="#fff" />
          </LinearGradient>
          <Text style={styles.quickActionText}>Preview Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionCard} onPress={handleShareProfile}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.quickActionGradient}
          >
            <Icon name="share" size={24} color="#fff" />
          </LinearGradient>
          <Text style={styles.quickActionText}>Share Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionCard} onPress={handleBoostProfile}>
          <LinearGradient
            colors={['#f093fb', '#f5576c']}
            style={styles.quickActionGradient}
          >
            <Icon name="trending-up" size={24} color="#fff" />
          </LinearGradient>
          <Text style={styles.quickActionText}>Boost Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard} 
          onPress={() => navigation.navigate('ProfileAnalytics')}
        >
          <LinearGradient
            colors={['#ffecd2', '#fcb69f']}
            style={styles.quickActionGradient}
          >
            <Icon name="analytics" size={24} color="#fff" />
          </LinearGradient>
          <Text style={styles.quickActionText}>View Analytics</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProfileSection = (section) => (
    <TouchableOpacity
      key={section.id}
      style={styles.sectionCard}
      onPress={() => handleSectionPress(section)}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionInfo}>
              <View style={[
                styles.sectionIcon,
                { backgroundColor: section.status === 'complete' ? COLORS.success + '20' : '#FFA726' + '20' }
              ]}>
                <Icon
                  name={section.icon}
                  size={24}
                  color={section.status === 'complete' ? COLORS.success : '#FFA726'}
                />
              </View>
              <View style={styles.sectionContent}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Chip
                    mode="outlined"
                    textStyle={[
                      styles.statusChipText,
                      { color: section.status === 'complete' ? COLORS.success : '#FFA726' }
                    ]}
                    style={[
                      styles.statusChip,
                      { borderColor: section.status === 'complete' ? COLORS.success : '#FFA726' }
                    ]}
                    icon={section.status === 'complete' ? 'check-circle' : 'schedule'}
                  >
                    {section.status === 'complete' ? 'Complete' : 'Incomplete'}
                  </Chip>
                </View>
                <Text style={styles.sectionDescription}>{section.description}</Text>
              </View>
            </View>
            <IconButton
              icon="chevron-right"
              iconColor={COLORS.textSecondary}
              size={20}
            />
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderRecentReviews = () => (
    <View style={styles.reviewsContainer}>
      <View style={styles.reviewsHeader}>
        <Text style={styles.sectionTitle}>Recent Reviews</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AllReviews')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {recentReviews.slice(0, 2).map((review) => (
        <Card key={review.id} style={styles.reviewCard}>
          <Card.Content>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewClient}>
                <Avatar.Text
                  size={32}
                  label={review.clientName.split(' ')[0][0]}
                  style={{ backgroundColor: COLORS.primary }}
                />
                <View style={styles.reviewClientInfo}>
                  <Text style={styles.reviewClientName}>{review.clientName}</Text>
                  <View style={styles.reviewRating}>
                    {[...Array(5)].map((_, index) => (
                      <Icon
                        key={index}
                        name="star"
                        size={14}
                        color={index < review.rating ? '#FFD700' : '#E0E0E0'}
                      />
                    ))}
                  </View>
                </View>
              </View>
              {review.verified && (
                <Chip
                  mode="outlined"
                  textStyle={styles.verifiedChipText}
                  style={styles.verifiedChip}
                  icon="verified"
                >
                  Verified
                </Chip>
              )}
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
            <Text style={styles.reviewDate}>
              {new Date(review.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10} />
        <Surface style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedSection?.title || 'Edit Profile'}
            </Text>
            <IconButton
              icon="close"
              onPress={() => setModalVisible(false)}
            />
          </View>

          <ScrollView style={styles.modalBody}>
            {selectedSection?.id === 'basic_info' && (
              <View>
                <TextInput
                  label="Professional Title"
                  value={profileData.title}
                  onChangeText={(text) => setProfileData({...profileData, title: text})}
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Bio"
                  value={profileData.bio}
                  onChangeText={(text) => setProfileData({...profileData, bio: text})}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  style={styles.input}
                />
                <TextInput
                  label="Years of Experience"
                  value={profileData.experience}
                  onChangeText={(text) => setProfileData({...profileData, experience: text})}
                  mode="outlined"
                  style={styles.input}
                />
              </View>
            )}

            {selectedSection?.id === 'services_pricing' && (
              <View>
                <TextInput
                  label="Hourly Rate ($)"
                  value={profileData.hourlyRate.toString()}
                  onChangeText={(text) => setProfileData({...profileData, hourlyRate: parseInt(text) || 0})}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />
                <Text style={styles.inputLabel}>Session Types</Text>
                {profileData.sessionTypes.map((type, index) => (
                  <View key={index} style={styles.tagItem}>
                    <Chip mode="outlined" onPress={() => {/* Edit logic */}}>
                      {type}
                    </Chip>
                  </View>
                ))}
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Enable Instant Booking</Text>
                  <Switch
                    value={instantBooking}
                    onValueChange={setInstantBooking}
                    trackColor={{ false: '#767577', true: COLORS.primary }}
                    thumbColor={instantBooking ? '#fff' : '#f4f3f4'}
                  />
                </View>
              </View>
            )}

            {selectedSection?.id === 'location_travel' && (
              <View>
                <TextInput
                  label="Primary Location"
                  value={profileData.location}
                  onChangeText={(text) => setProfileData({...profileData, location: text})}
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Travel Radius (miles)"
                  value={profileData.radius.toString()}
                  onChangeText={(text) => setProfileData({...profileData, radius: parseInt(text) || 0})}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                Alert.alert('Saved!', 'Your profile changes have been saved.');
                setModalVisible(false);
              }}
              style={styles.saveButton}
              contentStyle={styles.buttonContent}
            >
              Save Changes
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {renderProfileHeader()}
        {renderStatsCards()}
        {renderQuickActions()}

        <View style={styles.sectionsContainer}>
          <Text style={styles.sectionTitle}>Profile Sections</Text>
          {profileSections.map(renderProfileSection)}
        </View>

        {renderRecentReviews()}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="edit"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />

      {renderModal()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: SPACING.lg,
    marginTop: 50,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  profileName: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  profileTitle: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  ratingText: {
    ...TEXT_STYLES.body,
    color: '#fff',
    marginLeft: SPACING.xs,
  },
  visibilityToggle: {
    alignItems: 'center',
  },
  visibilityText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    marginTop: SPACING.xs,
  },
  statsContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statPeriod: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  trendText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  excellentChip: {
    backgroundColor: COLORS.success + '20',
    borderColor: COLORS.success,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  excellentChipText: {
    color: COLORS.success,
    fontSize: 10,
  },
  quickActionsContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    alignItems: 'center',
    width: (width - SPACING.lg * 3) / 2,
    marginBottom: SPACING.md,
  },
  quickActionGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionsContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionCard: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  reviewsContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAllText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '500',
  },
  reviewCard: {
    marginBottom: SPACING.md,
    backgroundColor: '#fff',
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  reviewClient: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewClientInfo: {
    marginLeft: SPACING.sm,
  },
  reviewClientName: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  reviewRating: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  verifiedChip: {
    backgroundColor: COLORS.success + '20',
    borderColor: COLORS.success,
  },
  verifiedChipText: {
    color: COLORS.success,
    fontSize: 11,
  },
  reviewComment: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  reviewDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  modalContent: {
    width: width - 40,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
  },
  modalBody: {
    maxHeight: 400,
    paddingHorizontal: SPACING.lg,
  },
  input: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  tagItem: {
    marginBottom: SPACING.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  toggleLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    borderColor: COLORS.textSecondary,
    marginRight: SPACING.md,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  buttonContent: {
    paddingVertical: SPACING.sm,
  },
};

export default MarketPlaceProfile;