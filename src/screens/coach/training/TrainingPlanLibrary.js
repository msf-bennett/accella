import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
  StatusBar,
  Animated,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Text,
  Portal,
  Modal,
  Divider,
  Snackbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system imports
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';
import DocumentProcessor from '../../../services/DocumentProcessor';

const { width: screenWidth } = Dimensions.get('window');

const TrainingPlanLibrary = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, isOnline } = useSelector(state => state.auth);
  const { trainingPlans, error } = useSelector(state => state.training);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Success message state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const categories = [
    { key: 'all', label: 'All Sports', icon: 'stadium' },
    { key: 'football', label: 'Football', icon: 'football' },
    { key: 'basketball', label: 'Basketball', icon: 'basketball' },
    { key: 'soccer', label: 'Soccer', icon: 'soccer' },
    { key: 'tennis', label: 'Tennis', icon: 'tennis' },
    { key: 'fitness', label: 'Fitness', icon: 'radiobox-marked' },
  ];

  const difficultyColors = {
    beginner: COLORS.success,
    intermediate: '#FF9800',
    advanced: COLORS.error,
  };

  // Handle route params for success message
  useEffect(() => {
    const { showSuccess, message, newPlanId } = route.params || {};
    
    if (showSuccess && message) {
      setSnackbarMessage(message);
      setSnackbarVisible(true);
      
      // If there's a new plan ID, scroll to it after loading
      if (newPlanId) {
        // We'll handle this after plans are loaded
      }
    }
  }, [route.params]);

  // MOVED: Define loadTrainingPlans function before it's used
const loadTrainingPlans = useCallback(async () => {
  try {
    setLoading(true);
    const realPlans = await DocumentProcessor.getTrainingPlans();
    const storedDocuments = await DocumentProcessor.getStoredDocuments();
    
    // Enhance plans with proper structure and resolve document names
    const enhancedPlans = realPlans.map(plan => {
      // Try to find the source document to get the actual name
      const sourceDoc = storedDocuments.find(doc => doc.id === plan.sourceDocument);
      
      return {
        ...plan,
        academyName: plan.academyName || plan.title,
        // FIXED: Use the actual source document name
        originalName: sourceDoc?.originalName || plan.originalName || plan.sourceDocumentName || `Document-${plan.sourceDocument?.slice(-8) || 'Unknown'}`,
        creator: plan.creatorUsername || plan.creator || 'Coach',
        creatorUsername: plan.creatorUsername || plan.creator,
      };
    });
    
    setPlans(enhancedPlans);
    
    // Check if we need to highlight a newly created plan
    const { newPlanId } = route.params || {};
    if (newPlanId) {
      const newPlan = enhancedPlans.find(plan => plan.id === newPlanId);
      if (newPlan) {
        console.log('New plan found:', newPlan.title, 'from document:', newPlan.originalName);
      }
    }
  } catch (error) {
    console.error('Error loading training plans:', error);
    Alert.alert('Error', 'Failed to load training plans');
  } finally {
    setLoading(false);
  }
}, [route.params]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadTrainingPlans();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh training plans');
    } finally {
      setRefreshing(false);
    }
  }, [loadTrainingPlans]);

  // Handle plan selection
  const handlePlanPress = useCallback((plan) => {
    setSelectedPlan(plan);
    if (plan.isOwned) {
      navigation.navigate('TrainingPlanDetails', { planId: plan.id });
    } else {
      Alert.alert(
        'Training Plan',
        `Would you like to preview or purchase "${plan.title}"?`,
        [
          { text: 'Preview', onPress: () => handlePreviewPlan(plan) },
          { text: 'Purchase', onPress: () => handlePurchasePlan(plan) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  }, [navigation]);

  const handlePreviewPlan = useCallback((plan) => {
    Alert.alert('Feature Coming Soon', 'Plan preview functionality will be available in the next update!');
  }, []);

  const handlePurchasePlan = useCallback((plan) => {
    Alert.alert('Feature Coming Soon', 'Marketplace payment system will be available in the next update!');
  }, []);

const handleCreatePlan = useCallback(() => {
  navigation.navigate('CreateTrainingPlan', {
    currentUser: user // Pass the current user data
  });
}, [navigation, user]);

  const handleUploadPlan = useCallback(() => {
    navigation.navigate('CoachingPlanUploadScreen');
  }, [navigation]);

  // Animation setup
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
  }, [fadeAnim, slideAnim]);

  // Load training plans on component mount
  useEffect(() => {
    loadTrainingPlans();
  }, [loadTrainingPlans]);

  // Filter plans based on search and category - moved to useMemo
  const filteredPlans = React.useMemo(() => {
    return plans.filter(plan => {
      const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plan.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || plan.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [plans, searchQuery, selectedCategory]);

  // Show loading state - MOVED AFTER ALL HOOKS
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: SPACING.md }}>Loading training plans...</Text>
      </View>
    );
  }

// In TrainingPlanLibrary.js, update the renderPlanCard function:
const renderPlanCard = ({ item: plan, index }) => {
  const { newPlanId } = route.params || {};
  const isNewPlan = plan.id === newPlanId;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.md,
      }}
    >
      <TouchableOpacity
        onPress={() => handlePlanPress(plan)}
        activeOpacity={0.7}
      >
        <Card style={{
          marginHorizontal: SPACING.sm,
          elevation: 4,
          borderRadius: 12,
          borderWidth: isNewPlan ? 2 : 0,
          borderColor: isNewPlan ? COLORS.primary : 'transparent',
        }}>
          <LinearGradient
            colors={plan.isOwned ? ['#667eea', '#764ba2'] : ['#e0e0e0', '#bdbdbd']}
            style={{
              height: 140,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              padding: SPACING.md,
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                {/* Academy Name - Main Display */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                  <Text style={[TEXT_STYLES.h3, { color: 'white', marginBottom: 0, fontSize: 16 }]}>
                    {plan.academyName || plan.title}
                  </Text>
                  {isNewPlan && (
                    <Text style={{
                      marginLeft: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 12,
                      fontSize: 10,
                      color: 'white',
                      fontWeight: 'bold',
                    }}>
                      NEW
                    </Text>
                  )}
                </View>
                
                {/* Creator and Duration Row */}
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginBottom: SPACING.xs }]}>
                  {plan.creatorUsername || plan.creator} • {plan.duration}
                </Text>
                
                {/* FIXED: Show actual source document name with better fallback logic */}
                <Text style={[TEXT_STYLES.caption, { 
                  color: 'rgba(255,255,255,0.7)', 
                  fontStyle: 'italic',
                  fontSize: 11,
                  lineHeight: 14
                }]}>
                  {/* Try multiple sources for the document name, with better logic */}
                  ({plan.originalName || 
                    plan.sourceDocumentName || 
                    (plan.sourceDocument ? `Document ${plan.sourceDocument.slice(-8)}` : 'Imported Document')})
                </Text>
              </View>
              
              {/* Ownership indicator */}
              <View style={{ alignItems: 'flex-end' }}>
                {plan.isOwned ? (
                  <Icon name="check-circle" size={24} color="white" />
                ) : (
                  <Text style={[TEXT_STYLES.body2, { color: 'white', fontWeight: 'bold' }]}>
                    ${plan.price}
                  </Text>
                )}
              </View>
            </View>
            
            {/* Difficulty and rating row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Chip
                mode="flat"
                style={{
                  backgroundColor: difficultyColors[plan.difficulty],
                  height: 28,
                }}
                textStyle={{ color: 'white', fontSize: 12 }}
              >
                {plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1)}
              </Chip>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={[TEXT_STYLES.caption, { color: 'white', marginLeft: 4 }]}>
                  {plan.rating}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Card content remains the same */}
          <Card.Content style={{ padding: SPACING.md }}>
            <Text style={[TEXT_STYLES.body2, { marginBottom: SPACING.sm, color: COLORS.textSecondary }]}>
              {plan.description}
            </Text>
            
            {plan.isOwned && plan.progress > 0 && (
              <View style={{ marginBottom: SPACING.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    Progress
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                    {plan.progress}%
                  </Text>
                </View>
                <ProgressBar
                  progress={plan.progress / 100}
                  color={COLORS.primary}
                  style={{ height: 6, borderRadius: 3 }}
                />
              </View>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="fitness-center" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS.textSecondary }]}>
                  {plan.sessionsCount} sessions
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="download" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS.textSecondary }]}>
                  {plan.downloads}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.sm }}>
              {plan.tags.slice(0, 3).map((tag, tagIndex) => (
                <Chip
                  key={tagIndex}
                  mode="outlined"
                  compact
                  style={{
                    marginRight: SPACING.xs,
                    marginBottom: SPACING.xs,
                    height: 24,
                  }}
                  textStyle={{ fontSize: 10 }}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
};

  const renderCategoryChip = ({ item: category }) => (
    <Chip
      mode={selectedCategory === category.key ? 'flat' : 'outlined'}
      selected={selectedCategory === category.key}
      onPress={() => setSelectedCategory(category.key)}
      icon={category.icon}
      style={{
        marginRight: SPACING.sm,
        backgroundColor: selectedCategory === category.key ? COLORS.primary : 'transparent',
      }}
      textStyle={{
        color: selectedCategory === category.key ? 'white' : COLORS.textPrimary,
      }}
    >
      {category.label}
    </Chip>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.md,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
            Training Library
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
              iconColor="white"
              size={24}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            />
            <IconButton
              icon="tune"
              iconColor="white"
              size={24}
              onPress={() => setFilterModalVisible(true)}
            />
            <IconButton 
              icon="description" 
              iconColor="white"
              size={24}
              onPress={() => navigation.navigate('DocumentLibrary', { showAllDocuments: true })} 
            />
          </View>
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search training plans..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            elevation: 0,
          }}
          iconColor={COLORS.primary}
          inputStyle={{ color: COLORS.textPrimary }}
        />
      </LinearGradient>

      {/* Category Filter */}
      <View style={{ paddingVertical: SPACING.md }}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING.md }}
          renderItem={renderCategoryChip}
          keyExtractor={item => item.key}
        />
      </View>

      {/* Plans List */}
      <FlatList
        data={filteredPlans}
        renderItem={renderPlanCard}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={{ padding: SPACING.xl, alignItems: 'center' }}>
            <Icon name="search-off" size={64} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md, color: COLORS.textSecondary }]}>
              No plans found
            </Text>
            <Text style={[TEXT_STYLES.body2, { marginTop: SPACING.sm, color: COLORS.textSecondary, textAlign: 'center' }]}>
              Try adjusting your search or category filter, or create your first training plan!
            </Text>
            <Button
              mode="contained"
              onPress={handleCreatePlan}
              style={{ marginTop: SPACING.md }}
            >
              Create Your First Plan
            </Button>
          </View>
        }
      />

      {/* Multiple Floating Action Buttons */}
      <View style={{ position: 'absolute', right: SPACING.md, bottom: SPACING.md }}>
        <FAB
          icon="upload"
          style={{
            backgroundColor: COLORS.secondary,
            marginBottom: SPACING.sm,
          }}
          size="small"
          onPress={handleUploadPlan}
          label="Upload Plan"
        />
        <FAB
          icon="plus"
          style={{
            backgroundColor: COLORS.primary,
          }}
          onPress={handleCreatePlan}
          label="Create Plan"
        />
      </View>

      {/* Success Snackbar */}
      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={5000}
          style={{
            backgroundColor: COLORS.success,
          }}
          action={{
            label: 'View',
            onPress: () => {
              setSnackbarVisible(false);
              const { newPlanId } = route.params || {};
              if (newPlanId) {
                const newPlan = plans.find(plan => plan.id === newPlanId);
                if (newPlan) {
                  handlePlanPress(newPlan);
                }
              }
            },
            textColor: 'white',
          }}
        >
          <Text style={{ color: 'white' }}>{snackbarMessage}</Text>
        </Snackbar>
      </Portal>

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={filterModalVisible}
          onDismiss={() => setFilterModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: SPACING.lg,
            borderRadius: 12,
            padding: SPACING.lg,
          }}
        >
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.lg }]}>
            Filter Options
          </Text>
          
          <Text style={[TEXT_STYLES.subtitle1, { marginBottom: SPACING.md }]}>
            Difficulty Level
          </Text>
          {['all', 'beginner', 'intermediate', 'advanced'].map(level => (
            <TouchableOpacity
              key={level}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: SPACING.sm,
              }}
            >
              <Icon
                name={level === 'all' ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={24}
                color={COLORS.primary}
              />
              <Text style={[TEXT_STYLES.body1, { marginLeft: SPACING.sm }]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}

          <Divider style={{ marginVertical: SPACING.lg }} />

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button
              mode="text"
              onPress={() => setFilterModalVisible(false)}
              style={{ marginRight: SPACING.sm }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                setFilterModalVisible(false);
                Alert.alert('Feature Coming Soon', 'Advanced filtering options will be available in the next update!');
              }}
            >
              Apply
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default TrainingPlanLibrary;