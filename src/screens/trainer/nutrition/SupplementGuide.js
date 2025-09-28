import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  FlatList,
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
  Portal,
  Modal,
  TextInput,
  SegmentedButtons,
  Divider,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SupplementGuide = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('supplements');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedSupplement, setSelectedSupplement] = useState(null);
  const [supplements, setSupplements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [clientRecommendations, setClientRecommendations] = useState([]);

  // Redux
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const isLoading = useSelector(state => state.supplements?.isLoading || false);

  // Mock data for demonstration
  useEffect(() => {
    setCategories([
      { id: 'all', name: 'All', icon: '🏷️', count: 15 },
      { id: 'protein', name: 'Protein', icon: '🥤', count: 4 },
      { id: 'preworkout', name: 'Pre-Workout', icon: '⚡', count: 3 },
      { id: 'recovery', name: 'Recovery', icon: '🔄', count: 3 },
      { id: 'vitamins', name: 'Vitamins', icon: '💊', count: 3 },
      { id: 'minerals', name: 'Minerals', icon: '⚛️', count: 2 },
    ]);

    setSupplements([
      {
        id: '1',
        name: 'Whey Protein Isolate',
        category: 'protein',
        rating: 4.8,
        price: '$45-65',
        dosage: '25-30g',
        timing: 'Post-workout',
        benefits: ['Muscle building', 'Recovery', 'Convenience'],
        description: 'Fast-absorbing protein ideal for post-workout recovery',
        evidenceLevel: 'Strong',
        safetyRating: 'Very Safe',
        interactions: 'None known',
        sideEffects: 'Rare digestive issues',
        recommendedFor: ['Muscle gain', 'Recovery'],
        notRecommendedFor: ['Lactose intolerance'],
        icon: '🥤',
        color: '#4CAF50',
      },
      {
        id: '2',
        name: 'Creatine Monohydrate',
        category: 'performance',
        rating: 4.9,
        price: '$15-25',
        dosage: '3-5g daily',
        timing: 'Any time',
        benefits: ['Strength', 'Power', 'Muscle volume'],
        description: 'Most researched supplement for strength and power',
        evidenceLevel: 'Very Strong',
        safetyRating: 'Very Safe',
        interactions: 'None significant',
        sideEffects: 'Water retention',
        recommendedFor: ['Strength training', 'Power sports'],
        notRecommendedFor: ['Kidney issues'],
        icon: '💪',
        color: '#FF5722',
      },
      {
        id: '3',
        name: 'Caffeine',
        category: 'preworkout',
        rating: 4.6,
        price: '$10-20',
        dosage: '100-400mg',
        timing: '30-45min pre-workout',
        benefits: ['Energy', 'Focus', 'Fat burning'],
        description: 'Natural stimulant for energy and performance',
        evidenceLevel: 'Very Strong',
        safetyRating: 'Safe',
        interactions: 'Various medications',
        sideEffects: 'Jitters, sleep disruption',
        recommendedFor: ['Energy boost', 'Fat loss'],
        notRecommendedFor: ['Heart conditions', 'Pregnancy'],
        icon: '☕',
        color: '#795548',
      },
      {
        id: '4',
        name: 'Beta-Alanine',
        category: 'performance',
        rating: 4.4,
        price: '$20-35',
        dosage: '3-5g daily',
        timing: 'Pre-workout or divided',
        benefits: ['Muscular endurance', 'Reduce fatigue'],
        description: 'Amino acid that buffers muscle acidity',
        evidenceLevel: 'Strong',
        safetyRating: 'Safe',
        interactions: 'None known',
        sideEffects: 'Tingling sensation',
        recommendedFor: ['Endurance training', 'High-intensity work'],
        notRecommendedFor: ['Sensitive individuals'],
        icon: '🏃',
        color: '#2196F3',
      },
      {
        id: '5',
        name: 'Vitamin D3',
        category: 'vitamins',
        rating: 4.7,
        price: '$10-25',
        dosage: '1000-4000 IU',
        timing: 'With fat-containing meal',
        benefits: ['Bone health', 'Immune function', 'Hormone support'],
        description: 'Essential vitamin for overall health and performance',
        evidenceLevel: 'Very Strong',
        safetyRating: 'Very Safe',
        interactions: 'Some medications',
        sideEffects: 'Rare at normal doses',
        recommendedFor: ['Most people', 'Limited sun exposure'],
        notRecommendedFor: ['Hypercalcemia'],
        icon: '☀️',
        color: '#FFC107',
      },
      {
        id: '6',
        name: 'Omega-3 Fish Oil',
        category: 'recovery',
        rating: 4.5,
        price: '$20-40',
        dosage: '1-3g EPA+DHA',
        timing: 'With meals',
        benefits: ['Anti-inflammatory', 'Heart health', 'Recovery'],
        description: 'Essential fatty acids for health and recovery',
        evidenceLevel: 'Strong',
        safetyRating: 'Very Safe',
        interactions: 'Blood thinners',
        sideEffects: 'Fishy taste, burps',
        recommendedFor: ['Most athletes', 'Anti-inflammatory'],
        notRecommendedFor: ['Fish allergies'],
        icon: '🐟',
        color: '#00BCD4',
      },
    ]);

    setClientRecommendations([
      {
        id: '1',
        clientName: 'John Smith',
        goal: 'Muscle Gain',
        recommendations: ['Whey Protein Isolate', 'Creatine Monohydrate'],
        status: 'pending',
        date: '2024-01-20',
      },
      {
        id: '2',
        clientName: 'Sarah Johnson',
        goal: 'Fat Loss',
        recommendations: ['Caffeine', 'Omega-3 Fish Oil'],
        status: 'accepted',
        date: '2024-01-18',
      },
      {
        id: '3',
        clientName: 'Mike Wilson',
        goal: 'Performance',
        recommendations: ['Beta-Alanine', 'Creatine Monohydrate'],
        status: 'reviewing',
        date: '2024-01-22',
      },
    ]);
  }, []);

  // Animations
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Filter supplements based on search and category
  const filteredSupplements = supplements.filter(supplement => {
    const matchesSearch = supplement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplement.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplement.benefits.some(benefit => benefit.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || supplement.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSupplementDetails = (supplement) => {
    setSelectedSupplement(supplement);
    setShowInfoModal(true);
  };

  const handleRecommendToClient = (supplement) => {
    Alert.alert(
      'Recommend Supplement',
      `Recommend "${supplement.name}" to clients feature in development. This will include client selection, dosage customization, and tracking compliance.`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleCreateStack = () => {
    Alert.alert(
      'Create Supplement Stack',
      'Supplement stack builder feature coming soon. This will include synergy analysis, timing optimization, and cost calculation.',
      [{ text: 'Understood', style: 'default' }]
    );
  };

  const getEvidenceLevelColor = (level) => {
    switch (level) {
      case 'Very Strong': return COLORS.success;
      case 'Strong': return COLORS.primary;
      case 'Moderate': return '#FF9800';
      case 'Weak': return COLORS.error;
      default: return COLORS.secondary;
    }
  };

  const getSafetyRatingColor = (rating) => {
    switch (rating) {
      case 'Very Safe': return COLORS.success;
      case 'Safe': return COLORS.primary;
      case 'Caution': return '#FF9800';
      case 'Unsafe': return COLORS.error;
      default: return COLORS.secondary;
    }
  };

  const renderCategoryChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
      contentContainerStyle={styles.categoryContainer}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Surface
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.selectedCategoryChip
            ]}
            elevation={selectedCategory === category.id ? 4 : 2}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryName,
              selectedCategory === category.id && styles.selectedCategoryName
            ]}>
              {category.name}
            </Text>
            <Badge
              style={[
                styles.categoryBadge,
                selectedCategory === category.id && styles.selectedCategoryBadge
              ]}
            >
              {category.count}
            </Badge>
          </Surface>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSupplementCard = (supplement) => (
    <Animated.View
      key={supplement.id}
      style={[
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }
      ]}
    >
      <Card style={styles.supplementCard} mode="elevated">
        <Card.Content>
          <View style={styles.supplementHeader}>
            <View style={styles.supplementIcon}>
              <Text style={styles.supplementEmoji}>{supplement.icon}</Text>
            </View>
            <View style={styles.supplementInfo}>
              <Text style={styles.supplementName}>{supplement.name}</Text>
              <Text style={styles.supplementDescription}>{supplement.description}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>{supplement.rating}</Text>
                <Text style={styles.price}>{supplement.price}</Text>
              </View>
            </View>
          </View>

          <View style={styles.dosageInfo}>
            <View style={styles.dosageItem}>
              <Icon name="schedule" size={16} color={COLORS.primary} />
              <Text style={styles.dosageText}>{supplement.dosage}</Text>
            </View>
            <View style={styles.dosageItem}>
              <Icon name="access-time" size={16} color={COLORS.secondary} />
              <Text style={styles.dosageText}>{supplement.timing}</Text>
            </View>
          </View>

          <View style={styles.benefitsContainer}>
            {supplement.benefits.slice(0, 3).map((benefit, index) => (
              <Chip key={index} style={styles.benefitChip} compact>
                {benefit}
              </Chip>
            ))}
          </View>

          <View style={styles.evidenceContainer}>
            <View style={styles.evidenceItem}>
              <Text style={styles.evidenceLabel}>Evidence</Text>
              <Chip
                style={[styles.evidenceChip, { backgroundColor: getEvidenceLevelColor(supplement.evidenceLevel) + '20' }]}
                textStyle={{ color: getEvidenceLevelColor(supplement.evidenceLevel) }}
                compact
              >
                {supplement.evidenceLevel}
              </Chip>
            </View>
            <View style={styles.evidenceItem}>
              <Text style={styles.evidenceLabel}>Safety</Text>
              <Chip
                style={[styles.evidenceChip, { backgroundColor: getSafetyRatingColor(supplement.safetyRating) + '20' }]}
                textStyle={{ color: getSafetyRatingColor(supplement.safetyRating) }}
                compact
              >
                {supplement.safetyRating}
              </Chip>
            </View>
          </View>
        </Card.Content>

        <Card.Actions>
          <Button
            mode="outlined"
            onPress={() => handleSupplementDetails(supplement)}
            style={styles.actionButton}
            icon="info"
          >
            Details
          </Button>
          <Button
            mode="contained"
            onPress={() => handleRecommendToClient(supplement)}
            style={styles.actionButton}
            icon="person-add"
          >
            Recommend
          </Button>
        </Card.Actions>
      </Card>
    </Animated.View>
  );

  const renderClientRecommendations = () => (
    <View style={styles.recommendationsSection}>
      <Text style={styles.sectionTitle}>Client Recommendations 📋</Text>
      {clientRecommendations.map((recommendation) => (
        <Card key={recommendation.id} style={styles.recommendationCard} mode="outlined">
          <Card.Content>
            <View style={styles.recommendationHeader}>
              <View>
                <Text style={styles.clientName}>{recommendation.clientName}</Text>
                <Text style={styles.clientGoal}>Goal: {recommendation.goal}</Text>
              </View>
              <Chip
                mode="outlined"
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: recommendation.status === 'accepted' ? COLORS.success + '20' :
                                   recommendation.status === 'pending' ? '#FF9800' + '20' :
                                   COLORS.secondary + '20'
                  }
                ]}
                textStyle={{
                  color: recommendation.status === 'accepted' ? COLORS.success :
                         recommendation.status === 'pending' ? '#FF9800' :
                         COLORS.secondary
                }}
              >
                {recommendation.status.toUpperCase()}
              </Chip>
            </View>
            <View style={styles.recommendedSupplements}>
              <Text style={styles.recommendedLabel}>Recommended:</Text>
              {recommendation.recommendations.map((supp, index) => (
                <Chip key={index} style={styles.recommendedChip} compact>
                  {supp}
                </Chip>
              ))}
            </View>
            <Text style={styles.recommendationDate}>
              Sent {new Date(recommendation.date).toLocaleDateString()}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderEducationResources = () => (
    <View style={styles.educationSection}>
      <Text style={styles.sectionTitle}>Education Resources 📚</Text>
      
      <Card style={styles.resourceCard} mode="outlined">
        <Card.Content>
          <View style={styles.resourceHeader}>
            <Icon name="school" size={24} color={COLORS.primary} />
            <Text style={styles.resourceTitle}>Supplement Timing Guide</Text>
          </View>
          <Text style={styles.resourceDescription}>
            Learn optimal timing for different supplements to maximize effectiveness
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button
            mode="text"
            onPress={() => Alert.alert('Education', 'Educational resources coming soon!')}
          >
            Read More
          </Button>
        </Card.Actions>
      </Card>

      <Card style={styles.resourceCard} mode="outlined">
        <Card.Content>
          <View style={styles.resourceHeader}>
            <Icon name="science" size={24} color={COLORS.primary} />
            <Text style={styles.resourceTitle}>Evidence-Based Recommendations</Text>
          </View>
          <Text style={styles.resourceDescription}>
            Understanding research quality and making informed recommendations
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button
            mode="text"
            onPress={() => Alert.alert('Education', 'Research guides coming soon!')}
          >
            Learn More
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );

  const renderQuickStats = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.statsContainer}
    >
      <Text style={styles.statsTitle}>Supplement Overview 📊</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{supplements.length}</Text>
          <Text style={styles.statLabel}>Supplements</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{clientRecommendations.length}</Text>
          <Text style={styles.statLabel}>Recommendations</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{supplements.filter(s => s.evidenceLevel === 'Very Strong' || s.evidenceLevel === 'Strong').length}</Text>
          <Text style={styles.statLabel}>Evidence-Based</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSupplementModal = () => (
    <Portal>
      <Modal
        visible={showInfoModal}
        onDismiss={() => setShowInfoModal(false)}
        contentContainerStyle={styles.modalContent}
      >
        {selectedSupplement && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedSupplement.name}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowInfoModal(false)}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>📋 Overview</Text>
              <Text style={styles.modalText}>{selectedSupplement.description}</Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>💊 Dosage & Timing</Text>
              <Text style={styles.modalText}>
                <Text style={styles.modalBold}>Dosage:</Text> {selectedSupplement.dosage}{'\n'}
                <Text style={styles.modalBold}>Best Time:</Text> {selectedSupplement.timing}
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>✅ Benefits</Text>
              <View style={styles.modalChipContainer}>
                {selectedSupplement.benefits.map((benefit, index) => (
                  <Chip key={index} style={styles.modalChip} compact>
                    {benefit}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>🔬 Evidence & Safety</Text>
              <Text style={styles.modalText}>
                <Text style={styles.modalBold}>Evidence Level:</Text> {selectedSupplement.evidenceLevel}{'\n'}
                <Text style={styles.modalBold}>Safety Rating:</Text> {selectedSupplement.safetyRating}{'\n'}
                <Text style={styles.modalBold}>Side Effects:</Text> {selectedSupplement.sideEffects}
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>👥 Recommendations</Text>
              <Text style={styles.modalText}>
                <Text style={styles.modalBold}>Recommended for:</Text> {selectedSupplement.recommendedFor?.join(', ')}{'\n'}
                <Text style={styles.modalBold}>Not recommended for:</Text> {selectedSupplement.notRecommendedFor?.join(', ')}
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={() => {
                setShowInfoModal(false);
                handleRecommendToClient(selectedSupplement);
              }}
              style={styles.modalButton}
              icon="person-add"
            >
              Recommend to Client
            </Button>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Supplement Guide 💊</Text>
          <Text style={styles.headerSubtitle}>Evidence-based supplement recommendations for your clients</Text>
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
        <Searchbar
          placeholder="Search supplements..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />

        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            { value: 'supplements', label: '💊 Supplements' },
            { value: 'recommendations', label: '📋 Recommendations' },
            { value: 'education', label: '📚 Education' },
          ]}
          style={styles.segmentedButtons}
        />

        {renderQuickStats()}

        {activeTab === 'supplements' && (
          <View>
            {renderCategoryChips()}
            <View style={styles.supplementsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Available Supplements 💊</Text>
                <Chip
                  mode="outlined"
                  style={styles.countChip}
                >
                  {filteredSupplements.length} found
                </Chip>
              </View>
              {filteredSupplements.map(renderSupplementCard)}
            </View>
          </View>
        )}

        {activeTab === 'recommendations' && renderClientRecommendations()}

        {activeTab === 'education' && renderEducationResources()}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {renderSupplementModal()}

      <FAB
        icon="add"
        style={styles.fab}
        onPress={handleCreateStack}
        label="Create Stack"
        extended
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    marginTop: -20,
  },
  searchBar: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  segmentedButtons: {
    marginBottom: SPACING.md,
  },
  statsContainer: {
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statsTitle: {
    ...TEXT_STYLES.subtitle,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.title,
    color: 'white',
    fontSize: 24,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  categoryScroll: {
    marginBottom: SPACING.md,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  categoryName: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    marginRight: SPACING.xs,
  },
  selectedCategoryName: {
    color: 'white',
  },
  categoryBadge: {
    backgroundColor: COLORS.secondary + '20',
    color: COLORS.secondary,
  },
  selectedCategoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
  },
  supplementsSection: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
  },
  countChip: {
    backgroundColor: COLORS.primary + '20',
  },
  supplementCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  supplementHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  supplementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  supplementEmoji: {
    fontSize: 24,
  },
  supplementInfo: {
    flex: 1,
  },
  supplementName: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  supplementDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
    marginRight: SPACING.sm,
  },
 price: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  dosageInfo: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
  },
  dosageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dosageText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  benefitChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.primary + '10',
  },
  evidenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  evidenceItem: {
    flex: 1,
    alignItems: 'center',
  },
  evidenceLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  evidenceChip: {
    borderRadius: 12,
  },
  actionButton: {
    marginHorizontal: SPACING.xs,
  },
  recommendationsSection: {
    marginBottom: SPACING.xl,
  },
  recommendationCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  clientName: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
  },
  clientGoal: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statusChip: {
    borderRadius: 12,
  },
  recommendedSupplements: {
    marginBottom: SPACING.md,
  },
  recommendedLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  recommendedChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.secondary + '10',
  },
  recommendationDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  },
  educationSection: {
    marginBottom: SPACING.xl,
  },
  resourceCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  resourceTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  resourceDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  modalContent: {
    backgroundColor: 'white',
    margin: SPACING.lg,
    borderRadius: 16,
    maxHeight: height * 0.8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.title,
    color: COLORS.textPrimary,
    flex: 1,
  },
  modalSection: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  modalSectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  modalText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  modalBold: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.primary + '10',
  },
  modalButton: {
    margin: SPACING.lg,
    marginTop: 0,
    borderRadius: 12,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default SupplementGuide;