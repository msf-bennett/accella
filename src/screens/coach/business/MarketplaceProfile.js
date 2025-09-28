import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  Dimensions,
  StatusBar,
  Alert,
  TouchableOpacity,
  Animated,
  Image,
  TextInput,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  Surface,
  IconButton,
  Switch,
  FAB,
  Portal,
  Modal,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design System Imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 22, fontWeight: '600' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const MarketplaceProfile = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, profile } = useSelector((state) => state.coach);
  
  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [profileActive, setProfileActive] = useState(true);
  const [animatedValue] = useState(new Animated.Value(0));
  const [selectedSection, setSelectedSection] = useState('overview');

  // Profile data state
  const [profileData, setProfileData] = useState({
    name: 'Alex Thompson',
    title: 'Certified Personal Trainer & Fitness Coach',
    location: 'Nairobi, Kenya',
    rating: 4.8,
    totalReviews: 127,
    hourlyRate: 75,
    responseTime: '< 1 hour',
    availability: 'Available Now',
    profileImage: null,
    bio: 'Passionate fitness coach with 8+ years of experience helping clients achieve their health and fitness goals. Specialized in strength training, weight loss, and athletic performance.',
    specializations: ['Strength Training', 'Weight Loss', 'HIIT', 'Nutrition Coaching', 'Athletic Performance'],
    certifications: [
      { name: 'ACSM Certified Personal Trainer', year: '2020' },
      { name: 'Precision Nutrition Level 1', year: '2019' },
      { name: 'CrossFit Level 2 Trainer', year: '2021' },
    ],
    experience: '8+ years',
    languages: ['English', 'Swahili'],
    achievements: [
      { icon: '🏆', title: 'Top Rated Coach', description: 'Ranked in top 5% coaches' },
      { icon: '⭐', title: '100+ Happy Clients', description: 'Transformed lives' },
      { icon: '🎯', title: 'Goal Achievement Expert', description: '95% success rate' },
    ],
    packages: [
      {
        id: '1',
        name: 'Starter Package',
        price: 200,
        duration: '4 weeks',
        sessions: 8,
        description: 'Perfect for beginners starting their fitness journey'
      },
      {
        id: '2',
        name: 'Transformation Package',
        price: 500,
        duration: '12 weeks',
        sessions: 24,
        description: 'Complete body transformation with nutrition guidance'
      },
      {
        id: '3',
        name: 'Elite Athlete Package',
        price: 800,
        duration: '16 weeks',
        sessions: 32,
        description: 'Advanced training for competitive athletes'
      },
    ],
    gallery: [
      { id: '1', type: 'image', url: null, caption: 'Training session with client' },
      { id: '2', type: 'video', url: null, caption: 'HIIT workout demonstration' },
      { id: '3', type: 'image', url: null, caption: 'Gym facility' },
    ],
    stats: {
      totalClients: 89,
      sessionsCompleted: 1247,
      yearsActive: 3,
      successRate: 95,
    }
  });

  // Animation setup
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Dispatch action to refresh profile data
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh profile data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleSaveProfile = () => {
    Alert.alert(
      '✅ Profile Updated',
      'Your marketplace profile has been updated successfully!',
      [{ text: 'Great! 🎉', style: 'default' }]
    );
    setEditModalVisible(false);
  };

  const handleViewAnalytics = () => {
    Alert.alert(
      '📊 Profile Analytics',
      'Feature coming soon! View detailed analytics about your profile views, client inquiries, and conversion rates.',
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const handleBoostProfile = () => {
    Alert.alert(
      '🚀 Boost Profile',
      'Feature coming soon! Promote your profile to reach more potential clients in your area.',
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const renderProfileHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.profileHeader}
    >
      <View style={styles.profileHeaderContent}>
        <View style={styles.profileImageContainer}>
          <Avatar.Image
            size={80}
            source={{ uri: profileData.profileImage || 'https://via.placeholder.com/150' }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editImageButton}>
            <Icon name="camera-alt" size={16} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>{profileData.name}</Text>
          <Text style={styles.profileTitle}>{profileData.title}</Text>
          <View style={styles.locationRow}>
            <Icon name="location-on" size={16} color="white" />
            <Text style={styles.locationText}>{profileData.location}</Text>
          </View>
          
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{profileData.rating}</Text>
              <Text style={styles.reviewsText}>({profileData.totalReviews} reviews)</Text>
            </View>
            <View style={styles.availabilityContainer}>
              <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.availabilityText}>{profileData.availability}</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.headerActions}>
        <Switch
          value={profileActive}
          onValueChange={setProfileActive}
          color={COLORS.success}
        />
        <Text style={styles.switchLabel}>Profile Active</Text>
      </View>
    </LinearGradient>
  );

  const renderStatsCard = () => (
    <Card style={styles.statsCard}>
      <Card.Title 
        title="📈 Profile Statistics" 
        titleStyle={TEXT_STYLES.h3}
        right={(props) => (
          <IconButton {...props} icon="analytics" onPress={handleViewAnalytics} />
        )}
      />
      <Card.Content>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>{profileData.stats.totalClients}</Text>
            <Text style={TEXT_STYLES.caption}>Total Clients</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>{profileData.stats.sessionsCompleted}</Text>
            <Text style={TEXT_STYLES.caption}>Sessions Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.secondary }]}>{profileData.stats.yearsActive}</Text>
            <Text style={TEXT_STYLES.caption}>Years Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.warning }]}>{profileData.stats.successRate}%</Text>
            <Text style={TEXT_STYLES.caption}>Success Rate</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderPackagesCard = () => (
    <Card style={styles.packagesCard}>
      <Card.Title 
        title="💎 Training Packages" 
        subtitle="Your service offerings"
        titleStyle={TEXT_STYLES.h3}
        right={(props) => (
          <Button mode="outlined" compact onPress={() => navigation.navigate('ManagePackages')}>
            Manage
          </Button>
        )}
      />
      <Card.Content>
        {profileData.packages.map((pkg, index) => (
          <View key={pkg.id} style={styles.packageItem}>
            <View style={styles.packageHeader}>
              <Text style={TEXT_STYLES.h3}>{pkg.name}</Text>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>${pkg.price}</Text>
            </View>
            <View style={styles.packageDetails}>
              <Text style={TEXT_STYLES.caption}>{pkg.duration} • {pkg.sessions} sessions</Text>
              <Text style={TEXT_STYLES.body}>{pkg.description}</Text>
            </View>
            {index < profileData.packages.length - 1 && <Divider style={styles.packageDivider} />}
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderSpecializationsCard = () => (
    <Card style={styles.specializationsCard}>
      <Card.Title 
        title="🎯 Specializations" 
        subtitle="Your expertise areas"
        titleStyle={TEXT_STYLES.h3}
        right={(props) => (
          <IconButton {...props} icon="edit" onPress={handleEditProfile} />
        )}
      />
      <Card.Content>
        <View style={styles.specializationsContainer}>
          {profileData.specializations.map((spec, index) => (
            <Chip
              key={index}
              mode="outlined"
              style={styles.specializationChip}
              textStyle={{ color: COLORS.primary }}
            >
              {spec}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderAchievementsCard = () => (
    <Card style={styles.achievementsCard}>
      <Card.Title 
        title="🏆 Achievements" 
        subtitle="Your success milestones"
        titleStyle={TEXT_STYLES.h3}
      />
      <Card.Content>
        {profileData.achievements.map((achievement, index) => (
          <View key={index} style={styles.achievementItem}>
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            <View style={styles.achievementContent}>
              <Text style={TEXT_STYLES.body}>{achievement.title}</Text>
              <Text style={TEXT_STYLES.caption}>{achievement.description}</Text>
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderGalleryCard = () => (
    <Card style={styles.galleryCard}>
      <Card.Title 
        title="📸 Portfolio Gallery" 
        subtitle="Showcase your work"
        titleStyle={TEXT_STYLES.h3}
        right={(props) => (
          <Button mode="outlined" compact onPress={() => navigation.navigate('ManageGallery')}>
            Add Media
          </Button>
        )}
      />
      <Card.Content>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {profileData.gallery.map((item) => (
            <TouchableOpacity key={item.id} style={styles.galleryItem}>
              <Surface style={styles.galleryPlaceholder} elevation={2}>
                <Icon 
                  name={item.type === 'video' ? 'play-circle-outline' : 'image'} 
                  size={32} 
                  color={COLORS.textSecondary} 
                />
              </Surface>
              <Text style={styles.galleryCaption}>{item.caption}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={styles.actionsCard}>
      <Card.Title 
        title="⚡ Quick Actions" 
        titleStyle={TEXT_STYLES.h3}
      />
      <Card.Content>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleBoostProfile}
          >
            <Icon name="trending-up" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>Boost Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ClientRequests')}
          >
            <Icon name="notifications" size={24} color={COLORS.warning} />
            <Text style={styles.actionText}>View Inquiries</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Reviews')}
          >
            <Icon name="star-rate" size={24} color={COLORS.success} />
            <Text style={styles.actionText}>Manage Reviews</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleViewAnalytics}
          >
            <Icon name="insights" size={24} color={COLORS.secondary} />
            <Text style={styles.actionText}>View Analytics</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderProfileHeader()}

      <ScrollView
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
        {renderStatsCard()}
        {renderPackagesCard()}
        {renderSpecializationsCard()}
        {renderAchievementsCard()}
        {renderGalleryCard()}
        {renderQuickActions()}

        {/* Bio Section */}
        <Card style={styles.bioCard}>
          <Card.Title 
            title="📝 About Me" 
            titleStyle={TEXT_STYLES.h3}
            right={(props) => (
              <IconButton {...props} icon="edit" onPress={handleEditProfile} />
            )}
          />
          <Card.Content>
            <Text style={TEXT_STYLES.body}>{profileData.bio}</Text>
            
            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <Icon name="work" size={20} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>Experience: {profileData.experience}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="schedule" size={20} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>Response time: {profileData.responseTime}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="attach-money" size={20} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>Starting at: ${profileData.hourlyRate}/hour</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="language" size={20} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>Languages: {profileData.languages.join(', ')}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="edit"
        style={styles.fab}
        onPress={handleEditProfile}
        color="white"
      />

      {/* Edit Profile Modal */}
      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={TEXT_STYLES.h3}>✏️ Edit Profile</Text>
            <IconButton
              icon="close"
              onPress={() => setEditModalVisible(false)}
            />
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>
              Profile editing interface coming soon! You'll be able to update your bio, 
              specializations, packages, and portfolio directly from here.
            </Text>
            <Button 
              mode="contained" 
              onPress={handleSaveProfile}
              style={styles.saveButton}
            >
              Save Changes
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  profileImage: {
    backgroundColor: 'white',
  },
  editImageButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileTitle: {
    color: 'white',
    opacity: 0.9,
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  locationText: {
    color: 'white',
    opacity: 0.9,
    marginLeft: SPACING.xs,
    fontSize: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: 'white',
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  reviewsText: {
    color: 'white',
    opacity: 0.8,
    marginLeft: SPACING.xs,
    fontSize: 12,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  availabilityText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchLabel: {
    color: 'white',
    marginLeft: SPACING.sm,
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  statsCard: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  packagesCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  packageItem: {
    paddingVertical: SPACING.sm,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  packageDetails: {
    marginTop: SPACING.xs,
  },
  packageDivider: {
    marginTop: SPACING.md,
  },
  specializationsCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specializationChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  achievementsCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  achievementContent: {
    flex: 1,
  },
  galleryCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  galleryItem: {
    marginRight: SPACING.md,
    alignItems: 'center',
  },
  galleryPlaceholder: {
    width: 100,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  galleryCaption: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
    width: 100,
  },
  actionsCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - SPACING.md * 5) / 2,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  bioCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  detailsSection: {
    marginTop: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: 100,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: SPACING.lg,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  modalContent: {
    padding: SPACING.md,
  },
  modalText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  saveButton: {
    marginTop: SPACING.md,
  },
});

export default MarketplaceProfile;