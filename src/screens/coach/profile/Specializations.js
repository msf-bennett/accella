import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Animated,
  Alert,
  TouchableOpacity,
  Vibration,
  Dimensions,
  FlatList
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Portal,
  Dialog,
  TextInput,
  HelperText,
  Searchbar,
  FAB,
  ProgressBar,
  Checkbox,
  RadioButton
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width } = Dimensions.get('window');

const Specializations = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTab, setSelectedTab] = useState('browse');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  // User's current specializations
  const [userSpecializations, setUserSpecializations] = useState([
    { id: 1, name: 'Football Coaching', level: 'Expert', experience: '5+ years', verified: true },
    { id: 2, name: 'Youth Training', level: 'Advanced', experience: '3 years', verified: true },
    { id: 3, name: 'Fitness Training', level: 'Intermediate', experience: '2 years', verified: false },
  ]);

  // Add specialization form
  const [newSpecialization, setNewSpecialization] = useState({
    name: '',
    level: 'beginner',
    experience: '',
    description: '',
    category: 'sports'
  });

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
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    // Simulate API call to refresh specializations
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const handleFeatureTap = (feature) => {
    Vibration.vibrate(30);
    Alert.alert(
      '🚧 Feature in Development',
      `${feature} is coming soon! We're working hard to bring you enhanced specialization features.`,
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const categories = [
    { key: 'all', label: '🏠 All', icon: 'apps' },
    { key: 'sports', label: '⚽ Sports', icon: 'sports-soccer' },
    { key: 'fitness', label: '💪 Fitness', icon: 'fitness-center' },
    { key: 'nutrition', label: '🥗 Nutrition', icon: 'restaurant' },
    { key: 'mental', label: '🧠 Mental', icon: 'psychology' },
    { key: 'recovery', label: '🧘 Recovery', icon: 'spa' },
    { key: 'youth', label: '👶 Youth', icon: 'child-care' }
  ];

  const availableSpecializations = [
    {
      id: 1,
      name: 'Football Coaching',
      category: 'sports',
      description: 'Comprehensive football training and tactical development',
      requirements: 'Coaching certification preferred',
      popularity: 95,
      coaches: 1250,
      avgRating: 4.8,
      icon: 'sports-soccer',
      color: '#4CAF50'
    },
    {
      id: 2,
      name: 'Basketball Training',
      category: 'sports',
      description: 'Skills development and game strategy for basketball',
      requirements: 'Playing or coaching experience',
      popularity: 88,
      coaches: 890,
      avgRating: 4.7,
      icon: 'sports-basketball',
      color: '#FF5722'
    },
    {
      id: 3,
      name: 'Strength Training',
      category: 'fitness',
      description: 'Weight training and muscle development programs',
      requirements: 'Fitness certification recommended',
      popularity: 92,
      coaches: 2100,
      avgRating: 4.9,
      icon: 'fitness-center',
      color: '#9C27B0'
    },
    {
      id: 4,
      name: 'Youth Development',
      category: 'youth',
      description: 'Age-appropriate training for young athletes',
      requirements: 'Child safety certification required',
      popularity: 85,
      coaches: 650,
      avgRating: 4.8,
      icon: 'child-care',
      color: '#2196F3'
    },
    {
      id: 5,
      name: 'Sports Nutrition',
      category: 'nutrition',
      description: 'Nutritional guidance for athletic performance',
      requirements: 'Nutrition certification required',
      popularity: 78,
      coaches: 320,
      avgRating: 4.6,
      icon: 'restaurant',
      color: '#FF9800'
    },
    {
      id: 6,
      name: 'Mental Performance',
      category: 'mental',
      description: 'Psychological training and mindset coaching',
      requirements: 'Psychology background preferred',
      popularity: 70,
      coaches: 180,
      avgRating: 4.7,
      icon: 'psychology',
      color: '#607D8B'
    },
    {
      id: 7,
      name: 'Injury Recovery',
      category: 'recovery',
      description: 'Rehabilitation and return-to-sport programs',
      requirements: 'Medical or physiotherapy background',
      popularity: 82,
      coaches: 450,
      avgRating: 4.8,
      icon: 'healing',
      color: '#E91E63'
    },
    {
      id: 8,
      name: 'Endurance Training',
      category: 'fitness',
      description: 'Long-distance and cardio training programs',
      requirements: 'Endurance sport experience',
      popularity: 75,
      coaches: 780,
      avgRating: 4.5,
      icon: 'directions-run',
      color: '#00BCD4'
    }
  ];

  const filteredSpecializations = availableSpecializations.filter(spec => {
    const matchesCategory = selectedCategory === 'all' || spec.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      spec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddSpecialization = () => {
    if (!newSpecialization.name.trim()) {
      Alert.alert('Error', 'Please enter a specialization name.');
      return;
    }
    
    Vibration.vibrate(50);
    Alert.alert(
      '✅ Specialization Added',
      'Your new specialization has been added! It will be reviewed for verification.',
      [{ text: 'Great!', onPress: () => setShowAddDialog(false) }]
    );
    
    setNewSpecialization({
      name: '',
      level: 'beginner',
      experience: '',
      description: '',
      category: 'sports'
    });
  };

  const handleRemoveSpecialization = (id) => {
    Alert.alert(
      'Remove Specialization',
      'Are you sure you want to remove this specialization?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setUserSpecializations(prev => prev.filter(spec => spec.id !== id));
            Vibration.vibrate(50);
          }
        }
      ]
    );
  };

  const SpecializationCard = ({ specialization, isUserSpec = false, onPress, onRemove }) => (
    <Card style={styles.specializationCard} elevation={2}>
      <TouchableOpacity onPress={onPress}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[specialization.color || COLORS.primary, `${specialization.color || COLORS.primary}CC`]}
                style={styles.iconGradient}
              >
                <Icon name={specialization.icon || 'star'} size={24} color="white" />
              </LinearGradient>
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', flex: 1 }]}>
                {specialization.name}
              </Text>
              {isUserSpec && specialization.verified && (
                <Chip size="small" icon="verified" textStyle={{ fontSize: 10 }}>
                  Verified
                </Chip>
              )}
              {!isUserSpec && (
                <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                  ⭐ {specialization.avgRating}
                </Text>
              )}
            </View>
          </View>
          
          <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary, marginVertical: SPACING.sm }]}>
            {specialization.description}
          </Text>
          
          {isUserSpec ? (
            <View style={styles.userSpecInfo}>
              <Chip size="small" style={styles.levelChip}>
                📊 {specialization.level}
              </Chip>
              <Chip size="small" style={styles.experienceChip}>
                🕒 {specialization.experience}
              </Chip>
            </View>
          ) : (
            <View style={styles.specStats}>
              <View style={styles.statItem}>
                <Icon name="trending-up" size={16} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                  {specialization.popularity}% popular
                </Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="group" size={16} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                  {specialization.coaches} coaches
                </Text>
              </View>
            </View>
          )}
          
          {isUserSpec && (
            <View style={styles.cardActions}>
              <Button
                mode="text"
                icon="edit"
                onPress={() => handleFeatureTap('Edit Specialization')}
              >
                Edit
              </Button>
              <Button
                mode="text"
                icon="delete"
                textColor={COLORS.error}
                onPress={() => onRemove(specialization.id)}
              >
                Remove
              </Button>
            </View>
          )}
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  const StatsOverview = () => (
    <Card style={styles.statsCard} elevation={2}>
      <Card.Content>
        <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginBottom: SPACING.md }]}>
          📊 Your Specialization Stats
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
              {userSpecializations.length}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
              Active Specs
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
              {userSpecializations.filter(s => s.verified).length}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
              Verified
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[TEXT_STYLES.h2, { color: '#FF9800' }]}>4.7</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
              Avg Rating
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[TEXT_STYLES.h2, { color: '#9C27B0' }]}>85%</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
              Completion
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const CategoryFilter = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
      {categories.map(category => (
        <TouchableOpacity
          key={category.key}
          onPress={() => {
            Vibration.vibrate(30);
            setSelectedCategory(category.key);
          }}
          style={[
            styles.categoryChip,
            selectedCategory === category.key && styles.activeCategoryChip
          ]}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category.key && styles.activeCategoryText
            ]}
          >
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'browse':
        return (
          <View style={styles.tabContent}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>🔍 Browse Specializations</Text>
            
            <Searchbar
              placeholder="Search specializations..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
            />
            
            <CategoryFilter />
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredSpecializations.map(spec => (
                <SpecializationCard
                  key={spec.id}
                  specialization={spec}
                  onPress={() => handleFeatureTap('Specialization Details')}
                />
              ))}
            </ScrollView>
          </View>
        );
      
      case 'my-specs':
        return (
          <View style={styles.tabContent}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>⭐ My Specializations</Text>
            
            <StatsOverview />
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {userSpecializations.map(spec => (
                <SpecializationCard
                  key={spec.id}
                  specialization={spec}
                  isUserSpec={true}
                  onPress={() => handleFeatureTap('Specialization Analytics')}
                  onRemove={handleRemoveSpecialization}
                />
              ))}
              
              {userSpecializations.length === 0 && (
                <Card style={styles.emptyCard}>
                  <Card.Content style={styles.emptyContent}>
                    <Icon name="star-outline" size={48} color={COLORS.secondary} />
                    <Text style={[TEXT_STYLES.body, { marginTop: SPACING.md, textAlign: 'center' }]}>
                      No specializations yet
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { textAlign: 'center', color: COLORS.secondary }]}>
                      Add your first specialization to get started
                    </Text>
                  </Card.Content>
                </Card>
              )}
            </ScrollView>
          </View>
        );
      
      case 'trending':
        return (
          <View style={styles.tabContent}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>🔥 Trending Specializations</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {availableSpecializations
                .sort((a, b) => b.popularity - a.popularity)
                .slice(0, 5)
                .map((spec, index) => (
                  <Card key={spec.id} style={styles.trendingCard} elevation={1}>
                    <Card.Content>
                      <View style={styles.trendingHeader}>
                        <View style={styles.trendingRank}>
                          <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                            #{index + 1}
                          </Text>
                        </View>
                        <View style={styles.trendingInfo}>
                          <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                            {spec.name}
                          </Text>
                          <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                            {spec.popularity}% popularity • {spec.coaches} coaches
                          </Text>
                        </View>
                        <View style={styles.trendingProgress}>
                          <ProgressBar
                            progress={spec.popularity / 100}
                            color={COLORS.primary}
                            style={styles.progressBar}
                          />
                          <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: 4 }]}>
                            {spec.popularity}%
                          </Text>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
            </ScrollView>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={[TEXT_STYLES.h2, { color: 'white', flex: 1, textAlign: 'center' }]}>
            ⭐ Specializations
          </Text>
          <TouchableOpacity onPress={() => handleFeatureTap('Specialization Help')} style={styles.helpButton}>
            <Icon name="help-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'browse', title: '🔍 Browse', icon: 'search' },
            { key: 'my-specs', title: '⭐ My Specs', icon: 'star' },
            { key: 'trending', title: '🔥 Trending', icon: 'trending-up' }
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => {
                Vibration.vibrate(30);
                setSelectedTab(tab.key);
              }}
              style={[
                styles.tabButton,
                selectedTab === tab.key && styles.activeTabButton
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab.key && styles.activeTabText
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
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
          {renderTabContent()}
          <View style={{ height: SPACING.xl * 2 }} />
        </ScrollView>
      </Animated.View>

      {/* Add Specialization FAB */}
      <FAB
        icon="add"
        label="Add Specialization"
        style={styles.addFab}
        onPress={() => setShowAddDialog(true)}
      />

      {/* Add Specialization Dialog */}
      <Portal>
        <Dialog visible={showAddDialog} onDismiss={() => setShowAddDialog(false)}>
          <Dialog.Title>⭐ Add Specialization</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Specialization Name *"
              value={newSpecialization.name}
              onChangeText={(text) => setNewSpecialization(prev => ({ ...prev, name: text }))}
              mode="outlined"
              style={styles.dialogInput}
            />
            
            <Text style={[TEXT_STYLES.body, { marginTop: SPACING.md, marginBottom: SPACING.sm }]}>
              Experience Level
            </Text>
            <RadioButton.Group
              onValueChange={value => setNewSpecialization(prev => ({ ...prev, level: value }))}
              value={newSpecialization.level}
            >
              <View style={styles.radioRow}>
                <RadioButton.Item label="🌱 Beginner" value="beginner" />
                <RadioButton.Item label="📈 Intermediate" value="intermediate" />
              </View>
              <View style={styles.radioRow}>
                <RadioButton.Item label="🎯 Advanced" value="advanced" />
                <RadioButton.Item label="🏆 Expert" value="expert" />
              </View>
            </RadioButton.Group>
            
            <TextInput
              label="Years of Experience"
              value={newSpecialization.experience}
              onChangeText={(text) => setNewSpecialization(prev => ({ ...prev, experience: text }))}
              mode="outlined"
              keyboardType="numeric"
              style={styles.dialogInput}
            />
            
            <TextInput
              label="Description (Optional)"
              value={newSpecialization.description}
              onChangeText={(text) => setNewSpecialization(prev => ({ ...prev, description: text }))}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onPress={handleAddSpecialization}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.xs,
  },
  helpButton: {
    padding: SPACING.xs,
  },
  tabContainer: {
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minWidth: 120,
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  searchbar: {
    marginBottom: SPACING.md,
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  categoriesContainer: {
    marginBottom: SPACING.lg,
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.md,
  },
  activeCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
  },
  activeCategoryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  specializationCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    marginRight: SPACING.md,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userSpecInfo: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  levelChip: {
    marginRight: SPACING.sm,
    backgroundColor: '#e8f5e8',
  },
  experienceChip: {
    backgroundColor: '#fff3e0',
  },
  specStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
  },
  statsCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  emptyCard: {
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  emptyContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  trendingCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingRank: {
    width: 60,
    alignItems: 'center',
  },
  trendingInfo: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  trendingProgress: {
    width: 80,
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  addFab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  dialogInput: {
    marginBottom: SPACING.md,
  },
  radioRow: {
    flexDirection: 'row',
  },
};

export default Specializations;