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
  RadioButton,
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

  // ALL State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('newest');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPlans, setSelectedPlans] = useState(new Set());
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const categories = [
    { key: 'sort', label: 'Sort By', icon: 'sort' },
    { key: 'all', label: 'All Sports', icon: 'stadium' },
    { key: 'football', label: 'Football', icon: 'football' },
    { key: 'basketball', label: 'Basketball', icon: 'basketball' },
    { key: 'soccer', label: 'Soccer', icon: 'soccer' },
    { key: 'tennis', label: 'Tennis', icon: 'tennis' },
    { key: 'fitness', label: 'Fitness', icon: 'radiobox-marked' },
  ];

  const sortOptions = [
    { key: 'newest', label: 'Newest First', icon: 'arrow-downward' },
    { key: 'oldest', label: 'Oldest First', icon: 'arrow-upward' },
    { key: 'nameAZ', label: 'Name (A-Z)', icon: 'sort-by-alpha' },
    { key: 'nameZA', label: 'Name (Z-A)', icon: 'sort-by-alpha' },
    { key: 'progress', label: 'Progress', icon: 'trending-up' },
    { key: 'sessions', label: 'Session Count', icon: 'fitness-center' },
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
    }
  }, [route.params]);

  // Load training plans
  const loadTrainingPlans = useCallback(async () => {
    try {
      setLoading(true);
      const realPlans = await DocumentProcessor.getTrainingPlans();
      const storedDocuments = await DocumentProcessor.getStoredDocuments();
      
      // Enhance plans with proper structure and resolve document names
      const enhancedPlans = realPlans.map(plan => {
        const sourceDoc = storedDocuments.find(doc => doc.id === plan.sourceDocument);
        
        // Calculate actual session count from weeks
        let totalSessions = 0;
        let weekCount = 0;
        
        if (plan.weeks && Array.isArray(plan.weeks)) {
          weekCount = plan.weeks.length;
          plan.weeks.forEach(week => {
            if (week.dailySessions && Array.isArray(week.dailySessions)) {
              totalSessions += week.dailySessions.length;
            }
          });
        }
        
        return {
          ...plan,
          academyName: plan.academyName || plan.title,
          originalName: sourceDoc?.originalName || plan.originalName || plan.sourceDocumentName || `Document-${plan.sourceDocument?.slice(-8) || 'Unknown'}`,
          creator: plan.creatorUsername || plan.creator || 'Coach',
          creatorUsername: plan.creatorUsername || plan.creator,
          uploadedAt: plan.uploadedAt || plan.createdAt || new Date().toISOString(),
          weekCount: weekCount || plan.weekCount || 0,
          sessionsCount: totalSessions || plan.sessionsCount || 0,
        };
      });
      
      setPlans(enhancedPlans);
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
      currentUser: user
    });
  }, [navigation, user]);

  const handleUploadPlan = useCallback(() => {
    navigation.navigate('CoachingPlanUploadScreen');
  }, [navigation]);

  const handleCategoryPress = useCallback((categoryKey) => {
    if (categoryKey === 'sort') {
      setSortModalVisible(true);
    } else {
      setSelectedCategory(categoryKey);
    }
  }, []);

  // Selection mode handlers
  const handleToggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => !prev);
    if (selectionMode) {
      setSelectedPlans(new Set());
    }
    setSettingsModalVisible(false);
  }, [selectionMode]);

  const handleSelectAll = useCallback(() => {
    const allPlanIds = new Set(plans.filter(plan => {
      const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plan.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || plan.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).map(plan => plan.id));
    
    setSelectedPlans(allPlanIds);
    setSelectionMode(true);
    setSettingsModalVisible(false);
    setSnackbarMessage(`Selected ${allPlanIds.size} plans`);
    setSnackbarVisible(true);
  }, [plans, searchQuery, selectedCategory]);

  const handleDeselectAll = useCallback(() => {
    setSelectedPlans(new Set());
    setSnackbarMessage('All plans deselected');
    setSnackbarVisible(true);
  }, []);

  const handleTogglePlanSelection = useCallback((planId) => {
    setSelectedPlans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(planId)) {
        newSet.delete(planId);
      } else {
        newSet.add(planId);
      }
      return newSet;
    });
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedPlans.size === 0) {
      Alert.alert('No Selection', 'Please select plans to delete');
      return;
    }

    Alert.alert(
      'Delete Plans',
      `Are you sure you want to delete ${selectedPlans.size} selected plan${selectedPlans.size > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const remainingPlans = plans.filter(plan => !selectedPlans.has(plan.id));
              setPlans(remainingPlans);
              
              setSnackbarMessage(`Deleted ${selectedPlans.size} plan${selectedPlans.size > 1 ? 's' : ''}`);
              setSnackbarVisible(true);
              setSelectedPlans(new Set());
              setSelectionMode(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete plans');
            }
          }
        }
      ]
    );
  }, [selectedPlans, plans]);

  const handleClearAllPlans = useCallback(() => {
    Alert.alert(
      'Clear All Plans',
      'Are you sure you want to clear all training plans? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              setPlans([]);
              setSnackbarMessage('All plans cleared');
              setSnackbarVisible(true);
              setSettingsModalVisible(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear plans');
            }
          }
        }
      ]
    );
  }, []);

  // Sort plans based on selected option
  const sortPlans = useCallback((plansToSort) => {
    const sorted = [...plansToSort];
    
    switch (sortOption) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
      case 'nameAZ':
        return sorted.sort((a, b) => (a.academyName || a.title).localeCompare(b.academyName || b.title));
      case 'nameZA':
        return sorted.sort((a, b) => (b.academyName || b.title).localeCompare(a.academyName || a.title));
      case 'progress':
        return sorted.sort((a, b) => (b.progress || 0) - (a.progress || 0));
      case 'sessions':
        return sorted.sort((a, b) => (b.sessionsCount || 0) - (a.sessionsCount || 0));
      default:
        return sorted;
    }
  }, [sortOption]);

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

  // Filter and sort plans
  const filteredPlans = React.useMemo(() => {
    let filtered = plans.filter(plan => {
      const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plan.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || plan.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    
    return sortPlans(filtered);
  }, [plans, searchQuery, selectedCategory, sortPlans]);

  // Show loading state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: SPACING.md }}>Loading training plans...</Text>
      </View>
    );
  }

  const renderPlanCard = ({ item: plan, index }) => {
    const { newPlanId } = route.params || {};
    const isNewPlan = plan.id === newPlanId;
    const isSelected = selectedPlans.has(plan.id);

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          marginBottom: SPACING.md,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (selectionMode) {
              handleTogglePlanSelection(plan.id);
            } else {
              handlePlanPress(plan);
            }
          }}
          onLongPress={() => {
            if (!selectionMode) {
              setSelectionMode(true);
              handleTogglePlanSelection(plan.id);
            }
          }}
          activeOpacity={0.7}
        >
          <Card style={{
            marginHorizontal: SPACING.sm,
            elevation: 4,
            borderRadius: 12,
            borderWidth: isNewPlan || isSelected ? 2 : 0,
            borderColor: isSelected ? COLORS.success : isNewPlan ? COLORS.primary : 'transparent',
            opacity: selectionMode && !isSelected ? 0.6 : 1,
          }}>
            {selectionMode && (
              <View style={{
                position: 'absolute',
                top: 8,
                left: 8,
                zIndex: 10,
                backgroundColor: 'white',
                borderRadius: 20,
                elevation: 4,
              }}>
                <Icon
                  name={isSelected ? 'check-circle' : 'radio-button-unchecked'}
                  size={28}
                  color={isSelected ? COLORS.success : COLORS.textSecondary}
                />
              </View>
            )}
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
                  
                  <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginBottom: SPACING.xs }]}>
                    {plan.creatorUsername || plan.creator} • {plan.weekCount || 0} {plan.weekCount === 1 ? 'week' : 'weeks'}
                  </Text>
                  
                  <Text style={[TEXT_STYLES.caption, { 
                    color: 'rgba(255,255,255,0.7)', 
                    fontStyle: 'italic',
                    fontSize: 11,
                    lineHeight: 14
                  }]}>
                    ({plan.originalName || 
                      plan.sourceDocumentName || 
                      (plan.sourceDocument ? `Document ${plan.sourceDocument.slice(-8)}` : 'Imported Document')})
                  </Text>
                </View>
                
                <View style={{ alignItems: 'flex-end', marginLeft: SPACING.sm }}>
                  <View style={{ alignItems: 'center', marginBottom: SPACING.xs }}>
                    <Text style={{ 
                      color: 'white', 
                      fontSize: 20, 
                      fontWeight: 'bold',
                      lineHeight: 22
                    }}>
                      {plan.sessionsCount || 0}
                    </Text>
                    <Text style={{ 
                      color: 'rgba(255,255,255,0.85)', 
                      fontSize: 9,
                      marginTop: -1,
                      marginBottom: 3
                    }}>
                      sessions
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="star" size={13} color="#FFD700" />
                      <Text style={{ color: 'white', marginLeft: 2, fontSize: 11, fontWeight: '500' }}>
                        {plan.rating}
                      </Text>
                    </View>
                  </View>
                  
                  {plan.isOwned ? (
                    <Icon name="check-circle" size={24} color="white" />
                  ) : (
                    <Text style={[TEXT_STYLES.body2, { color: 'white', fontWeight: 'bold' }]}>
                      ${plan.price}
                    </Text>
                  )}
                </View>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
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
              </View>
            </LinearGradient>

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
      mode={category.key === 'sort' ? 'outlined' : selectedCategory === category.key ? 'flat' : 'outlined'}
      selected={selectedCategory === category.key}
      onPress={() => handleCategoryPress(category.key)}
      icon={category.icon}
      style={{
        marginRight: SPACING.sm,
        backgroundColor: selectedCategory === category.key ? COLORS.primary : 'transparent',
        borderColor: category.key === 'sort' ? COLORS.secondary : COLORS.primary,
        borderWidth: category.key === 'sort' ? 1.5 : 1,
      }}
      textStyle={{
        color: selectedCategory === category.key ? 'white' : COLORS.textPrimary,
        fontWeight: category.key === 'sort' ? 'bold' : 'normal',
      }}
    >
      {category.label}
    </Chip>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
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
            <IconButton 
              icon="more-vert" 
              iconColor="white"
              size={24}
              onPress={() => setSettingsModalVisible(true)} 
            />
          </View>
        </View>

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
        
        {sortOption !== 'newest' && (
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginTop: SPACING.sm,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            paddingHorizontal: SPACING.sm,
            paddingVertical: SPACING.xs,
            borderRadius: 8,
            alignSelf: 'flex-start',
          }}>
            <Icon name="sort" size={14} color="white" />
            <Text style={[TEXT_STYLES.caption, { color: 'white', marginLeft: 4 }]}>
              Sorted by: {sortOptions.find(opt => opt.key === sortOption)?.label}
            </Text>
          </View>
        )}
      </LinearGradient>

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

      {selectionMode && (
        <Surface style={{
          marginHorizontal: SPACING.md,
          marginBottom: SPACING.md,
          padding: SPACING.md,
          borderRadius: 12,
          backgroundColor: COLORS.primary,
          elevation: 4,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                Selection Mode
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>
                {selectedPlans.size} plan{selectedPlans.size !== 1 ? 's' : ''} selected
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              {selectedPlans.size > 0 && (
                <IconButton
                  icon="delete"
                  iconColor="white"
                  size={24}
                  onPress={handleDeleteSelected}
                />
              )}
              <IconButton
                icon="close"
                iconColor="white"
                size={24}
                onPress={() => {
                  setSelectionMode(false);
                  setSelectedPlans(new Set());
                }}
              />
            </View>
          </View>
          {selectedPlans.size > 0 && (
            <Button
              mode="text"
              onPress={handleDeselectAll}
              style={{ marginTop: SPACING.xs }}
              labelStyle={{ color: 'white' }}
            >
              Deselect All
            </Button>
          )}
        </Surface>
      )}

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

      <Portal>
        <Modal
          visible={sortModalVisible}
          onDismiss={() => setSortModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: SPACING.lg,
            borderRadius: 16,
            maxHeight: '70%',
          }}
        >
          <View style={{ padding: SPACING.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
              <Text style={[TEXT_STYLES.h3]}>
                Sort Training Plans
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setSortModalVisible(false)}
              />
            </View>
            
            <ScrollView>
              <RadioButton.Group
                onValueChange={value => {
                  setSortOption(value);
                  setSortModalVisible(false);
                  setSnackbarMessage(`Sorted by ${sortOptions.find(opt => opt.key === value)?.label}`);
                  setSnackbarVisible(true);
                }}
                value={sortOption}
              >
                {sortOptions.map(option => (
                  <TouchableOpacity
                    key={option.key}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: SPACING.md,
                      paddingHorizontal: SPACING.sm,
                      borderRadius: 8,
                      backgroundColor: sortOption === option.key ? COLORS.primary + '10' : 'transparent',
                    }}
                    onPress={() => {
                      setSortOption(option.key);
                      setSortModalVisible(false);
                      setSnackbarMessage(`Sorted by ${option.label}`);
                      setSnackbarVisible(true);
                    }}
                  >
                    <Icon 
                      name={option.icon} 
                      size={24} 
                      color={sortOption === option.key ? COLORS.primary : COLORS.textSecondary}
                      style={{ marginRight: SPACING.md }}
                    />
                    <Text style={[
                      TEXT_STYLES.body1, 
                      { 
                        flex: 1,
                        color: sortOption === option.key ? COLORS.primary : COLORS.textPrimary,
                        fontWeight: sortOption === option.key ? 'bold' : 'normal',
                      }
                    ]}>
                      {option.label}
                    </Text>
                    <RadioButton
                      value={option.key}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
                ))}
              </RadioButton.Group>
            </ScrollView>
          </View>
        </Modal>
      </Portal>

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

      <Portal>
        <Modal
          visible={settingsModalVisible}
          onDismiss={() => setSettingsModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: SPACING.lg,
            borderRadius: 16,
            maxHeight: '70%',
          }}
        >
          <View style={{ padding: SPACING.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
              <Text style={[TEXT_STYLES.h3]}>
                Library Settings
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setSettingsModalVisible(false)}
              />
            </View>
            
            <ScrollView>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: SPACING.md,
                  paddingHorizontal: SPACING.sm,
                  borderRadius: 8,
                  backgroundColor: COLORS.primary + '05',
                  marginBottom: SPACING.sm,
                }}
                onPress={handleToggleSelectionMode}
              >
                <Icon 
                  name="check-circle" 
                  size={24} 
                  color={COLORS.primary}
                  style={{ marginRight: SPACING.md }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.body1, { fontWeight: '600' }]}>
                    {selectionMode ? 'Exit Selection Mode' : 'Enable Selection Mode'}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    Select multiple plans for bulk actions
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: SPACING.md,
                  paddingHorizontal: SPACING.sm,
                  borderRadius: 8,
                  marginBottom: SPACING.sm,
                }}
                onPress={handleSelectAll}
              >
                <Icon 
                  name="select-all" 
                  size={24} 
                  color={COLORS.textSecondary}
                  style={{ marginRight: SPACING.md }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.body1, { fontWeight: '600' }]}>
                    Select All Plans
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    Select all {filteredPlans.length} visible plans
                  </Text>
                </View>
              </TouchableOpacity>

              <Divider style={{ marginVertical: SPACING.md }} />

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: SPACING.md,
                  paddingHorizontal: SPACING.sm,
                  borderRadius: 8,
                  backgroundColor: COLORS.error + '08',
                  marginBottom: SPACING.sm,
                }}
                onPress={handleClearAllPlans}
              >
                <Icon 
                  name="delete-sweep" 
                  size={24} 
                  color={COLORS.error}
                  style={{ marginRight: SPACING.md }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.body1, { fontWeight: '600', color: COLORS.error }]}>
                    Clear All Plans
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    Remove all training plans from library
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={{
                marginTop: SPACING.lg,
                padding: SPACING.md,
                backgroundColor: COLORS.background,
                borderRadius: 8,
              }}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, textAlign: 'center' }]}>
                  Total Plans: {plans.length} • Selected: {selectedPlans.size}
                </Text>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default TrainingPlanLibrary;