import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  Platform,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  ProgressBar,
  Portal,
  Modal as PaperModal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from 'expo-blur';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Design System
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  bodySecondary: { fontSize: 14, color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const EquipmentSharingScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('available');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  
  // Mock data - replace with Redux state
  const [availableEquipment, setAvailableEquipment] = useState([
    {
      id: '1',
      name: 'Adjustable Dumbbells',
      category: 'weights',
      owner: { name: 'Mike Johnson', avatar: '🏃‍♂️', rating: 4.8, distance: '0.5 km' },
      description: 'Set of adjustable dumbbells 5-50 lbs',
      condition: 'excellent',
      pricePerDay: 15,
      available: true,
      images: ['📸', '📸'],
      location: 'Downtown Gym Area',
      tags: ['strength', 'home-workout', 'adjustable'],
    },
    {
      id: '2',
      name: 'Yoga Mat & Blocks',
      category: 'accessories',
      owner: { name: 'Sarah Williams', avatar: '🧘‍♀️', rating: 4.9, distance: '1.2 km' },
      description: 'Premium yoga mat with cork blocks',
      condition: 'good',
      pricePerDay: 8,
      available: true,
      images: ['📸'],
      location: 'City Center',
      tags: ['yoga', 'flexibility', 'meditation'],
    },
    {
      id: '3',
      name: 'Resistance Bands Set',
      category: 'accessories',
      owner: { name: 'Alex Chen', avatar: '💪', rating: 4.7, distance: '2.1 km' },
      description: 'Complete resistance bands with door anchor',
      condition: 'excellent',
      pricePerDay: 10,
      available: false,
      images: ['📸', '📸', '📸'],
      location: 'North District',
      tags: ['resistance', 'portable', 'full-body'],
    },
    {
      id: '4',
      name: 'Olympic Barbell',
      category: 'weights',
      owner: { name: 'Tom Rodriguez', avatar: '🏋️‍♂️', rating: 4.6, distance: '3.0 km' },
      description: '45lb Olympic barbell, excellent condition',
      condition: 'excellent',
      pricePerDay: 20,
      available: true,
      images: ['📸', '📸'],
      location: 'Westside',
      tags: ['olympic', 'powerlifting', 'heavy-duty'],
    },
  ]);
  
  const [myEquipment, setMyEquipment] = useState([
    {
      id: '5',
      name: 'Kettlebell Set',
      category: 'weights',
      description: 'Various weights 15-35 lbs',
      condition: 'good',
      pricePerDay: 12,
      status: 'available',
      requests: 3,
      earnings: 156,
    },
    {
      id: '6',
      name: 'Pull-up Bar',
      category: 'accessories',
      description: 'Doorway pull-up bar',
      condition: 'excellent',
      pricePerDay: 6,
      status: 'rented',
      currentRenter: 'John Doe',
      returnDate: '2025-08-28',
      earnings: 78,
    },
  ]);
  
  const [myRequests, setMyRequests] = useState([
    {
      id: '7',
      equipmentName: 'Spin Bike',
      owner: 'Lisa Park',
      requestDate: '2025-08-25',
      status: 'pending',
      pricePerDay: 25,
      duration: 3,
    },
    {
      id: '8',
      equipmentName: 'Weight Plates Set',
      owner: 'Mark Thompson',
      requestDate: '2025-08-24',
      status: 'approved',
      pricePerDay: 18,
      duration: 7,
      pickupLocation: 'Central Park Gym',
    },
  ]);

  const categories = [
    { id: 'all', name: 'All', icon: '🏃‍♂️' },
    { id: 'weights', name: 'Weights', icon: '🏋️‍♂️' },
    { id: 'cardio', name: 'Cardio', icon: '🚴‍♂️' },
    { id: 'accessories', name: 'Accessories', icon: '🧘‍♂️' },
    { id: 'machines', name: 'Machines', icon: '⚙️' },
  ];

  const tabs = [
    { id: 'available', name: 'Available', icon: 'fitness-center' },
    { id: 'my-equipment', name: 'My Equipment', icon: 'inventory' },
    { id: 'requests', name: 'My Requests', icon: 'request-page' },
  ];

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
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
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    // Implement search logic
  }, []);

  const handleCategorySelect = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    Vibration.vibrate(30);
  }, []);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    Vibration.vibrate(30);
  }, []);

  const handleEquipmentPress = useCallback((equipment) => {
    setSelectedEquipment(equipment);
    setShowRequestModal(true);
    Vibration.vibrate(50);
  }, []);

  const handleShareEquipment = useCallback(() => {
    setShowShareModal(true);
    Vibration.vibrate(50);
  }, []);

  const handleRequestEquipment = useCallback((equipmentId) => {
    Alert.alert(
      'Request Sent! 📤',
      'Your equipment request has been sent to the owner. They will be notified and can approve or decline your request.',
      [{ text: 'OK', onPress: () => setShowRequestModal(false) }]
    );
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return COLORS.success;
      case 'rented': return COLORS.warning;
      case 'pending': return COLORS.warning;
      case 'approved': return COLORS.success;
      case 'declined': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return COLORS.success;
      case 'good': return COLORS.primary;
      case 'fair': return COLORS.warning;
      default: return COLORS.textSecondary;
    }
  };

  const filteredEquipment = availableEquipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderCategoryChip = ({ item }) => (
    <Chip
      key={item.id}
      mode={selectedCategory === item.id ? 'flat' : 'outlined'}
      selected={selectedCategory === item.id}
      onPress={() => handleCategorySelect(item.id)}
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.selectedCategoryChip
      ]}
      textStyle={selectedCategory === item.id ? styles.selectedCategoryText : styles.categoryText}
    >
      {item.icon} {item.name}
    </Chip>
  );

  const renderTabButton = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.tabButton,
        activeTab === item.id && styles.activeTabButton
      ]}
      onPress={() => handleTabChange(item.id)}
    >
      <MaterialIcons
        name={item.icon}
        size={20}
        color={activeTab === item.id ? COLORS.primary : COLORS.textSecondary}
      />
      <Text style={[
        styles.tabText,
        activeTab === item.id && styles.activeTabText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderEquipmentCard = ({ item }) => (
    <Card style={styles.equipmentCard} onPress={() => handleEquipmentPress(item)}>
      <Card.Content>
        <View style={styles.equipmentHeader}>
          <View style={styles.equipmentInfo}>
            <Text style={TEXT_STYLES.h3}>{item.name}</Text>
            <Text style={TEXT_STYLES.bodySecondary}>{item.description}</Text>
            <View style={styles.equipmentMeta}>
              <Chip
                mode="outlined"
                style={[styles.conditionChip, { borderColor: getConditionColor(item.condition) }]}
                textStyle={{ color: getConditionColor(item.condition) }}
              >
                {item.condition}
              </Chip>
              <Text style={styles.priceText}>${item.pricePerDay}/day</Text>
            </View>
          </View>
          <View style={styles.availabilityContainer}>
            <View style={[
              styles.availabilityDot,
              { backgroundColor: item.available ? COLORS.success : COLORS.error }
            ]} />
            <Text style={[
              styles.availabilityText,
              { color: item.available ? COLORS.success : COLORS.error }
            ]}>
              {item.available ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>
        
        <View style={styles.ownerSection}>
          <Avatar.Text
            size={40}
            label={item.owner.avatar}
            style={styles.ownerAvatar}
          />
          <View style={styles.ownerInfo}>
            <Text style={TEXT_STYLES.body}>{item.owner.name}</Text>
            <View style={styles.ownerMeta}>
              <MaterialIcons name="star" size={16} color={COLORS.warning} />
              <Text style={styles.ratingText}>{item.owner.rating}</Text>
              <MaterialIcons name="location-on" size={16} color={COLORS.textSecondary} />
              <Text style={styles.distanceText}>{item.owner.distance}</Text>
            </View>
          </View>
          <Button
            mode="contained"
            onPress={() => handleEquipmentPress(item)}
            disabled={!item.available}
            style={styles.requestButton}
            labelStyle={styles.requestButtonText}
          >
            {item.available ? 'Request' : 'Unavailable'}
          </Button>
        </View>
        
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <Chip key={index} mode="outlined" style={styles.tagChip} compact>
              #{tag}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderMyEquipmentCard = ({ item }) => (
    <Card style={styles.equipmentCard}>
      <Card.Content>
        <View style={styles.equipmentHeader}>
          <View style={styles.equipmentInfo}>
            <Text style={TEXT_STYLES.h3}>{item.name}</Text>
            <Text style={TEXT_STYLES.bodySecondary}>{item.description}</Text>
            <Text style={styles.priceText}>${item.pricePerDay}/day</Text>
          </View>
          <View style={styles.statusContainer}>
            <Chip
              mode="flat"
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}
              textStyle={{ color: getStatusColor(item.status) }}
            >
              {item.status}
            </Chip>
          </View>
        </View>
        
        {item.status === 'rented' && (
          <View style={styles.rentalInfo}>
            <Text style={TEXT_STYLES.bodySecondary}>
              Rented to: <Text style={styles.renterName}>{item.currentRenter}</Text>
            </Text>
            <Text style={TEXT_STYLES.bodySecondary}>
              Return Date: <Text style={styles.returnDate}>{item.returnDate}</Text>
            </Text>
          </View>
        )}
        
        {item.status === 'available' && item.requests > 0 && (
          <View style={styles.requestsInfo}>
            <MaterialIcons name="notifications" size={20} color={COLORS.primary} />
            <Text style={styles.requestsText}>
              {item.requests} new request{item.requests > 1 ? 's' : ''}
            </Text>
          </View>
        )}
        
        <View style={styles.earningsSection}>
          <Text style={TEXT_STYLES.bodySecondary}>
            Total Earnings: <Text style={styles.earningsText}>${item.earnings}</Text>
          </Text>
        </View>
        
        <View style={styles.equipmentActions}>
          <Button mode="outlined" style={styles.actionButton}>
            Edit
          </Button>
          <Button mode="contained" style={styles.actionButton}>
            Manage
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderRequestCard = ({ item }) => (
    <Card style={styles.equipmentCard}>
      <Card.Content>
        <View style={styles.equipmentHeader}>
          <View style={styles.equipmentInfo}>
            <Text style={TEXT_STYLES.h3}>{item.equipmentName}</Text>
            <Text style={TEXT_STYLES.bodySecondary}>Owner: {item.owner}</Text>
            <Text style={TEXT_STYLES.bodySecondary}>
              ${item.pricePerDay}/day × {item.duration} days = ${item.pricePerDay * item.duration}
            </Text>
          </View>
          <Chip
            mode="flat"
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}
            textStyle={{ color: getStatusColor(item.status) }}
          >
            {item.status}
          </Chip>
        </View>
        
        <View style={styles.requestMeta}>
          <Text style={TEXT_STYLES.bodySecondary}>
            Requested: {item.requestDate}
          </Text>
          {item.pickupLocation && (
            <Text style={TEXT_STYLES.bodySecondary}>
              Pickup: {item.pickupLocation}
            </Text>
          )}
        </View>
        
        <View style={styles.equipmentActions}>
          {item.status === 'pending' && (
            <Button mode="outlined" style={styles.actionButton}>
              Cancel Request
            </Button>
          )}
          {item.status === 'approved' && (
            <Button mode="contained" style={styles.actionButton}>
              Contact Owner
            </Button>
          )}
          <Button mode="text" style={styles.actionButton}>
            Details
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'available':
        return (
          <FlatList
            data={filteredEquipment}
            renderItem={renderEquipmentCard}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
          />
        );
      case 'my-equipment':
        return (
          <FlatList
            data={myEquipment}
            renderItem={renderMyEquipmentCard}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
          />
        );
      case 'requests':
        return (
          <FlatList
            data={myRequests}
            renderItem={renderRequestCard}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Equipment Sharing 🏋️‍♂️</Text>
          <Text style={styles.headerSubtitle}>Share, borrow, and earn with fitness gear</Text>
        </View>
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search equipment, brands, or owners..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
          />
        </View>

        {/* Category Filter */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryChip}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabsContainer}>
          <FlatList
            data={tabs}
            renderItem={renderTabButton}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsList}
          />
        </View>

        {/* Content */}
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
          {renderContent()}
        </ScrollView>
      </Animated.View>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="add"
        onPress={handleShareEquipment}
        color="white"
      />

      {/* Request Modal */}
      <Portal>
        <PaperModal
          visible={showRequestModal}
          onDismiss={() => setShowRequestModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedEquipment && (
            <View>
              <Text style={styles.modalTitle}>Request Equipment</Text>
              <Text style={TEXT_STYLES.h3}>{selectedEquipment.name}</Text>
              <Text style={TEXT_STYLES.bodySecondary}>{selectedEquipment.description}</Text>
              
              <View style={styles.modalSection}>
                <Text style={TEXT_STYLES.body}>Duration (days):</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="How many days do you need?"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.modalSection}>
                <Text style={TEXT_STYLES.body}>Message to Owner:</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Tell the owner about your training needs..."
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowRequestModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={() => handleRequestEquipment(selectedEquipment.id)}
                  style={styles.modalButton}
                >
                  Send Request
                </Button>
              </View>
            </View>
          )}
        </PaperModal>
      </Portal>

      {/* Share Equipment Modal */}
      <Portal>
        <PaperModal
          visible={showShareModal}
          onDismiss={() => setShowShareModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View>
            <Text style={styles.modalTitle}>Share Your Equipment 📤</Text>
            <Text style={TEXT_STYLES.bodySecondary}>
              Turn your unused fitness equipment into income by sharing with the community!
            </Text>
            
            <Button
              mode="contained"
              onPress={() => {
                setShowShareModal(false);
                Alert.alert(
                  'Feature Coming Soon! 🚧',
                  'The equipment sharing feature is currently under development. Stay tuned for updates!'
                );
              }}
              style={styles.fullWidthButton}
            >
              Start Sharing Equipment
            </Button>
            
            <Button
              mode="text"
              onPress={() => setShowShareModal(false)}
              style={styles.fullWidthButton}
            >
              Cancel
            </Button>
          </View>
        </PaperModal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.bodySecondary,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    marginTop: -SPACING.md,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  searchbar: {
    elevation: 2,
    backgroundColor: COLORS.surface,
  },
  categoriesContainer: {
    paddingVertical: SPACING.sm,
  },
  categoriesList: {
    paddingHorizontal: SPACING.lg,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.textSecondary,
  },
  selectedCategoryText: {
    color: 'white',
  },
  tabsContainer: {
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabsList: {
    paddingHorizontal: SPACING.lg,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.md,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: COLORS.primary + '20',
  },
  tabText: {
    ...TEXT_STYLES.bodySecondary,
    marginLeft: SPACING.xs,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  equipmentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    elevation: 2,
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  conditionChip: {
    marginRight: SPACING.sm,
  },
  priceText: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  availabilityText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusChip: {
    borderRadius: 16,
  },
  ownerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  ownerAvatar: {
    backgroundColor: COLORS.primary + '20',
  },
  ownerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  ownerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    marginRight: SPACING.md,
  },
  distanceText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  requestButton: {
    borderRadius: 20,
  },
  requestButtonText: {
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  tagChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    height: 24,
  },
  rentalInfo: {
    backgroundColor: COLORS.warning + '10',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  renterName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  returnDate: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.warning,
  },
  requestsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  requestsText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  earningsSection: {
    marginBottom: SPACING.md,
  },
  earningsText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.success,
  },
  equipmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  requestMeta: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modalSection: {
    marginVertical: SPACING.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    fontSize: 16,
    backgroundColor: COLORS.background,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  fullWidthButton: {
    marginVertical: SPACING.xs,
  },
});

export default EquipmentSharingScreen;