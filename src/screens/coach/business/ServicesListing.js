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
  Share,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  Surface,
  IconButton,
  Searchbar,
  FAB,
  Portal,
  Modal,
  Divider,
  ProgressBar,
  TextInput,
  Switch,
  Badge,
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

const ServicesListing = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, services } = useSelector((state) => state.coach);
  
  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [animatedValue] = useState(new Animated.Value(0));

  // Services data state
  const [servicesData, setServicesData] = useState({
    activeServices: 8,
    totalBookings: 156,
    monthlyRevenue: 2850,
    averageRating: 4.8,
    categories: [
      { id: 'training', name: 'Personal Training', count: 5, color: COLORS.primary },
      { id: 'nutrition', name: 'Nutrition Plans', count: 2, color: COLORS.success },
      { id: 'consultation', name: 'Consultations', count: 3, color: COLORS.warning },
      { id: 'programs', name: 'Programs', count: 4, color: COLORS.secondary },
    ],
    services: [
      {
        id: '1',
        title: '💪 One-on-One Personal Training',
        category: 'training',
        price: 75,
        duration: 60,
        description: 'Personalized fitness training session focused on your specific goals and needs.',
        isActive: true,
        bookings: 45,
        rating: 4.9,
        totalEarnings: 3375,
        lastBooking: '2025-08-15',
        tags: ['Strength', 'Cardio', 'Weight Loss'],
        image: null,
        availability: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: false,
        },
        timeSlots: ['08:00', '10:00', '14:00', '16:00', '18:00'],
        maxClients: 1,
        equipment: ['Dumbbells', 'Resistance Bands', 'Yoga Mat'],
      },
      {
        id: '2',
        title: '🥗 Custom Nutrition Plan',
        category: 'nutrition',
        price: 125,
        duration: null,
        description: 'Personalized meal plans and nutrition guidance for optimal health and performance.',
        isActive: true,
        bookings: 23,
        rating: 4.8,
        totalEarnings: 2875,
        lastBooking: '2025-08-14',
        tags: ['Weight Loss', 'Muscle Gain', 'Healthy Eating'],
        image: null,
        deliverables: ['7-day meal plan', 'Shopping list', 'Recipe book', '2 follow-up calls'],
        turnaroundTime: '3-5 days',
      },
      {
        id: '3',
        title: '👥 Small Group Training',
        category: 'training',
        price: 35,
        duration: 45,
        description: 'High-energy group fitness sessions with personalized attention for up to 4 participants.',
        isActive: true,
        bookings: 28,
        rating: 4.7,
        totalEarnings: 980,
        lastBooking: '2025-08-16',
        tags: ['Group Fitness', 'Fun', 'Motivation'],
        image: null,
        maxClients: 4,
        minClients: 2,
        equipment: ['Kettlebells', 'Medicine Balls', 'TRX'],
      },
      {
        id: '4',
        title: '📱 Virtual Training Session',
        category: 'training',
        price: 45,
        duration: 45,
        description: 'Live online training session from the comfort of your home with full guidance.',
        isActive: true,
        bookings: 31,
        rating: 4.6,
        totalEarnings: 1395,
        lastBooking: '2025-08-15',
        tags: ['Online', 'Convenient', 'Home Workout'],
        image: null,
        platform: 'Zoom',
        requirements: ['Stable internet', 'Basic equipment', 'Space to move'],
      },
      {
        id: '5',
        title: '🏃‍♂️ 12-Week Transformation Program',
        category: 'programs',
        price: 599,
        duration: null,
        description: 'Complete body transformation program with training, nutrition, and weekly check-ins.',
        isActive: true,
        bookings: 8,
        rating: 5.0,
        totalEarnings: 4792,
        lastBooking: '2025-08-12',
        tags: ['Transformation', 'Complete Program', 'Results Guaranteed'],
        image: null,
        programLength: '12 weeks',
        includes: ['24 training sessions', 'Meal plans', 'Weekly check-ins', 'Progress tracking'],
      },
      {
        id: '6',
        title: '💬 Fitness Consultation',
        category: 'consultation',
        price: 85,
        duration: 90,
        description: 'Comprehensive fitness assessment and personalized goal-setting session.',
        isActive: true,
        bookings: 19,
        rating: 4.9,
        totalEarnings: 1615,
        lastBooking: '2025-08-13',
        tags: ['Assessment', 'Goal Setting', 'Strategy'],
        image: null,
        includes: ['Body composition analysis', 'Movement screening', 'Goal planning', 'Program recommendations'],
      },
      {
        id: '7',
        title: '🏋️‍♀️ Strength Training Basics',
        category: 'programs',
        price: 199,
        duration: null,
        description: '4-week beginner-friendly strength training program with video guides.',
        isActive: false,
        bookings: 12,
        rating: 4.5,
        totalEarnings: 2388,
        lastBooking: '2025-08-05',
        tags: ['Beginner', 'Strength', 'Video Guides'],
        image: null,
        programLength: '4 weeks',
        difficulty: 'Beginner',
      },
      {
        id: '8',
        title: '🧘‍♀️ Mindful Movement Session',
        category: 'training',
        price: 55,
        duration: 60,
        description: 'Gentle movement and mindfulness practice combining yoga and light strength training.',
        isActive: true,
        bookings: 15,
        rating: 4.8,
        totalEarnings: 825,
        lastBooking: '2025-08-14',
        tags: ['Mindfulness', 'Yoga', 'Gentle'],
        image: null,
        equipment: ['Yoga mat', 'Light weights', 'Blocks'],
      },
    ],
    performanceStats: {
      topPerformer: 'One-on-One Personal Training',
      bookingTrend: '+12%',
      avgSessionValue: 68,
      clientRetention: '87%',
      busyDays: ['Tuesday', 'Thursday', 'Saturday'],
    },
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
      // Dispatch action to refresh services data
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh services data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleEditService = (service) => {
    setSelectedService(service);
    setServiceModalVisible(true);
  };

  const handleToggleService = (serviceId, isActive) => {
    Alert.alert(
      isActive ? '🔴 Deactivate Service' : '🟢 Activate Service',
      `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this service?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: isActive ? 'Deactivate' : 'Activate',
          style: isActive ? 'destructive' : 'default',
          onPress: () => {
            Alert.alert(
              '✅ Service Updated',
              `Service has been ${isActive ? 'deactivated' : 'activated'} successfully!`
            );
          }
        }
      ]
    );
  };

  const handleShareService = async (service) => {
    try {
      await Share.share({
        message: `💪 ${service.title}\n\n${service.description}\n\n💰 $${service.price}${service.duration ? ` for ${service.duration} minutes` : ''}\n\nBook now with Coach Alex!`,
        title: 'Check out this service!',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share service');
    }
  };

  const handleDuplicateService = (service) => {
    Alert.alert(
      '📋 Duplicate Service',
      `Create a copy of "${service.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Duplicate',
          onPress: () => Alert.alert('✅ Service Duplicated', 'A copy of the service has been created and saved as draft.')
        }
      ]
    );
  };

  const renderOverviewStats = () => (
    <Card style={styles.overviewCard}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.overviewGradient}
      >
        <View style={styles.overviewContent}>
          <Text style={[TEXT_STYLES.h2, { color: 'white', textAlign: 'center' }]}>
            🚀 Service Overview
          </Text>
          <Text style={styles.overviewSubtitle}>Your business at a glance</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{servicesData.activeServices}</Text>
              <Text style={styles.statLabel}>Active Services</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{servicesData.totalBookings}</Text>
              <Text style={styles.statLabel}>Total Bookings</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${servicesData.monthlyRevenue}</Text>
              <Text style={styles.statLabel}>Monthly Revenue</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐ {servicesData.averageRating}</Text>
              <Text style={styles.statLabel}>Average Rating</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderCategoryStats = () => (
    <View style={styles.categorySection}>
      <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>📊 Service Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {servicesData.categories.map((category) => (
          <Surface key={category.id} style={[styles.categoryCard, { borderLeftColor: category.color }]} elevation={2}>
            <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
              <Text style={[styles.categoryEmoji, { color: category.color }]}>
                {category.id === 'training' ? '💪' : 
                 category.id === 'nutrition' ? '🥗' :
                 category.id === 'consultation' ? '💬' : '📋'}
              </Text>
            </View>
            <Text style={TEXT_STYLES.body}>{category.name}</Text>
            <Text style={[TEXT_STYLES.h3, { color: category.color }]}>{category.count}</Text>
            <Text style={TEXT_STYLES.caption}>services</Text>
          </Surface>
        ))}
      </ScrollView>
    </View>
  );

  const renderPerformanceInsights = () => (
    <Card style={styles.insightsCard}>
      <Card.Title 
        title="📈 Performance Insights" 
        subtitle="Key metrics and trends"
        titleStyle={TEXT_STYLES.h3}
      />
      <Card.Content>
        <View style={styles.insightsGrid}>
          <View style={styles.insightItem}>
            <Icon name="trending-up" size={24} color={COLORS.success} />
            <Text style={styles.insightLabel}>Top Service</Text>
            <Text style={styles.insightValue}>{servicesData.performanceStats.topPerformer}</Text>
          </View>
          <View style={styles.insightItem}>
            <Icon name="show-chart" size={24} color={COLORS.primary} />
            <Text style={styles.insightLabel}>Booking Trend</Text>
            <Text style={[styles.insightValue, { color: COLORS.success }]}>
              {servicesData.performanceStats.bookingTrend}
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Icon name="attach-money" size={24} color={COLORS.warning} />
            <Text style={styles.insightLabel}>Avg Session Value</Text>
            <Text style={styles.insightValue}>${servicesData.performanceStats.avgSessionValue}</Text>
          </View>
          <View style={styles.insightItem}>
            <Icon name="people" size={24} color={COLORS.secondary} />
            <Text style={styles.insightLabel}>Client Retention</Text>
            <Text style={styles.insightValue}>{servicesData.performanceStats.clientRetention}</Text>
          </View>
        </View>
        
        <Divider style={styles.insightsDivider} />
        
        <View style={styles.busyDaysContainer}>
          <Text style={styles.busyDaysTitle}>🗓️ Busiest Days</Text>
          <View style={styles.busyDaysChips}>
            {servicesData.performanceStats.busyDays.map((day) => (
              <Chip
                key={day}
                mode="flat"
                compact
                style={[styles.busyDayChip, { backgroundColor: COLORS.primary + '20' }]}
                textStyle={{ color: COLORS.primary }}
              >
                {day}
              </Chip>
            ))}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderServiceItem = (service) => {
    const categoryColor = servicesData.categories.find(cat => cat.id === service.category)?.color || COLORS.primary;
    
    return (
      <Card key={service.id} style={[styles.serviceCard, !service.isActive && styles.inactiveService]}>
        <Card.Content>
          <View style={styles.serviceHeader}>
            <View style={styles.serviceLeft}>
              <View style={[styles.serviceBadge, { backgroundColor: categoryColor + '20' }]}>
                <Text style={[styles.serviceBadgeText, { color: categoryColor }]}>
                  {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                </Text>
              </View>
              {!service.isActive && (
                <Badge style={styles.inactiveBadge} size={20}>Inactive</Badge>
              )}
            </View>
            
            <View style={styles.serviceActions}>
              <Switch
                value={service.isActive}
                onValueChange={() => handleToggleService(service.id, service.isActive)}
                thumbColor={service.isActive ? COLORS.success : COLORS.textSecondary}
                trackColor={{ false: '#767577', true: COLORS.success + '50' }}
              />
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => {
                  Alert.alert(
                    'Service Actions',
                    'What would you like to do?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Edit Service', onPress: () => handleEditService(service) },
                      { text: 'Duplicate', onPress: () => handleDuplicateService(service) },
                      { text: 'Share Service', onPress: () => handleShareService(service) },
                      { 
                        text: 'Delete', 
                        style: 'destructive',
                        onPress: () => Alert.alert('⚠️ Delete Service', 'This action cannot be undone.')
                      }
                    ]
                  );
                }}
              />
            </View>
          </View>
          
          <Text style={[TEXT_STYLES.h3, styles.serviceTitle]}>{service.title}</Text>
          <Text style={styles.serviceDescription} numberOfLines={2}>{service.description}</Text>
          
          <View style={styles.servicePricing}>
            <Text style={styles.servicePrice}>${service.price}</Text>
            {service.duration && (
              <Text style={styles.serviceDuration}>• {service.duration} min</Text>
            )}
            {service.programLength && (
              <Text style={styles.serviceDuration}>• {service.programLength}</Text>
            )}
          </View>
          
          {service.tags && service.tags.length > 0 && (
            <View style={styles.serviceTagsContainer}>
              {service.tags.slice(0, 3).map((tag, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  compact
                  style={styles.serviceTag}
                  textStyle={{ fontSize: 10 }}
                >
                  {tag}
                </Chip>
              ))}
              {service.tags.length > 3 && (
                <Text style={styles.moreTags}>+{service.tags.length - 3} more</Text>
              )}
            </View>
          )}
          
          <View style={styles.serviceStats}>
            <View style={styles.statGroup}>
              <Icon name="event" size={16} color={COLORS.primary} />
              <Text style={styles.statText}>{service.bookings} bookings</Text>
            </View>
            <View style={styles.statGroup}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.statText}>{service.rating}</Text>
            </View>
            <View style={styles.statGroup}>
              <Icon name="attach-money" size={16} color={COLORS.success} />
              <Text style={styles.statText}>${service.totalEarnings}</Text>
            </View>
          </View>
          
          <View style={styles.serviceFooter}>
            <Text style={styles.lastBooking}>
              Last booked: {service.lastBooking}
            </Text>
            
            <View style={styles.serviceButtons}>
              <Button
                mode="outlined"
                compact
                onPress={() => navigation.navigate('ServiceAnalytics', { serviceId: service.id })}
                style={styles.actionButton}
              >
                Analytics
              </Button>
              <Button
                mode="contained"
                compact
                onPress={() => handleEditService(service)}
                style={styles.actionButton}
              >
                Edit
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderServicesList = () => {
    const filteredServices = servicesData.services
      .filter(service => {
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'active') return service.isActive;
        if (selectedCategory === 'inactive') return !service.isActive;
        return service.category === selectedCategory;
      })
      .filter(service => {
        if (!searchQuery) return true;
        return service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
               service.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      });

    return (
      <View style={styles.servicesSection}>
        <View style={styles.sectionHeader}>
          <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
            🎯 My Services ({filteredServices.length})
          </Text>
        </View>
        
        <View style={styles.searchAndFilter}>
          <Searchbar
            placeholder="Search services..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={{ fontSize: 14 }}
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['all', 'active', 'inactive', 'training', 'nutrition', 'consultation', 'programs'].map((filter) => (
            <Chip
              key={filter}
              mode={selectedCategory === filter ? 'flat' : 'outlined'}
              selected={selectedCategory === filter}
              onPress={() => setSelectedCategory(filter)}
              style={styles.filterChip}
              compact
            >
              {filter === 'all' ? 'All Services' :
               filter === 'active' ? '🟢 Active' :
               filter === 'inactive' ? '🔴 Inactive' :
               filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Chip>
          ))}
        </ScrollView>
        
        {filteredServices.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="search-off" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No services found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search terms' : 'Create your first service to get started!'}
            </Text>
          </View>
        ) : (
          filteredServices.map((service) => renderServiceItem(service))
        )}
      </View>
    );
  };

  const renderQuickActions = () => (
    <Card style={styles.actionsCard}>
      <Card.Title 
        title="⚡ Quick Actions" 
        subtitle="Manage your services efficiently"
        titleStyle={TEXT_STYLES.h3}
      />
      <Card.Content>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('CreateService')}
          >
            <Icon name="add-circle" size={24} color={COLORS.success} />
            <Text style={styles.quickActionText}>Create Service</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('ServiceTemplates')}
          >
            <Icon name="content-copy" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Service Templates</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('BulkEdit')}
          >
            <Icon name="edit" size={24} color={COLORS.warning} />
            <Text style={styles.quickActionText}>Bulk Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('ServiceAnalytics')}
          >
            <Icon name="analytics" size={24} color={COLORS.secondary} />
            <Text style={styles.quickActionText}>Full Analytics</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>🎯 My Services</Text>
          <Text style={styles.headerSubtitle}>Manage your coaching offerings</Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            icon="analytics"
            iconColor="white"
            size={24}
            onPress={() => navigation.navigate('ServiceAnalytics')}
          />
          <IconButton
            icon="add"
            iconColor="white"
            size={24}
            onPress={() => navigation.navigate('CreateService')}
          />
        </View>
      </LinearGradient>

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
        {renderOverviewStats()}
        {renderCategoryStats()}
        {renderPerformanceInsights()}
        {renderServicesList()}
        {renderQuickActions()}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateService')}
        color="white"
        label="New Service"
      />

      {/* Service Edit Modal */}
      <Portal>
        <Modal
          visible={serviceModalVisible}
          onDismiss={() => setServiceModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={TEXT_STYLES.h3}>✏️ Quick Edit Service</Text>
            <IconButton
              icon="close"
              onPress={() => setServiceModalVisible(false)}
            />
          </View>
          
          {selectedService && (
            <ScrollView style={styles.modalContent}>
              <TextInput
                mode="outlined"
                label="Service Title"
                defaultValue={selectedService.title}
                style={styles.modalInput}
              />
              
              <TextInput
                mode="outlined"
                label="Price ($)"
                defaultValue={selectedService.price.toString()}
                keyboardType="numeric"
                style={styles.modalInput}
              />
              
              <TextInput
                mode="outlined"
                label="Description"
                defaultValue={selectedService.description}
                multiline
                numberOfLines={3}
                style={styles.modalInput}
              />
              
              <View style={styles.modalActions}>
                <Button 
                  mode="outlined" 
                  onPress={() => setServiceModalVisible(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => {
                    Alert.alert('✅ Service Updated', 'Your service has been updated successfully!');
                    setServiceModalVisible(false);
                  }}
                  style={styles.saveButton}
                >
                  Save Changes
                </Button>
              </View>
            </ScrollView>
          )}
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
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'white',
    opacity: 0.9,
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  overviewCard: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  overviewGradient: {
    padding: SPACING.lg,
  },
  overviewContent: {
    alignItems: 'center',
  },
  overviewSubtitle: {
    color: 'white',
    opacity: 0.9,
    fontSize: 16,
    marginBottom: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'white',
    opacity: 0.8,
    fontSize: 12,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  categoryScroll: {
    paddingVertical: SPACING.xs,
  },
  categoryCard: {
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    width: 120,
    borderLeftWidth: 4,
    backgroundColor: 'white',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  categoryEmoji: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  insightsCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  insightItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  insightLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  insightValue: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  insightsDivider: {
    marginVertical: SPACING.md,
  },
  busyDaysContainer: {
    alignItems: 'center',
  },
  busyDaysTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  busyDaysChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  busyDayChip: {
    marginHorizontal: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  servicesSection: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  searchAndFilter: {
    marginBottom: SPACING.md,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  filterScroll: {
    marginBottom: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  serviceCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  inactiveService: {
    opacity: 0.7,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  serviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginRight: SPACING.sm,
  },
  serviceBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  inactiveBadge: {
    backgroundColor: COLORS.error,
  },
  serviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceTitle: {
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  serviceDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  servicePricing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  serviceDuration: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  serviceTagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  serviceTag: {
    marginRight: SPACING.sm,
  },
  moreTags: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  serviceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastBooking: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    flex: 1,
  },
  serviceButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
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
  quickActionButton: {
    width: '48%',
    backgroundColor: 'white',
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontWeight: '600',
    color: COLORS.text,
  },
  bottomSpacing: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.success,
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
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  modalContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  modalInput: {
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.lg,
  },
  cancelButton: {
    marginRight: SPACING.md,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
});

export default ServicesListing;