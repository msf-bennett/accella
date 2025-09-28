import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  Animated,
  Alert,
  Modal,
  Image,
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
  Portal,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system imports
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
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const DrillLibrary = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [drills, setDrills] = useState([]);
  const [filteredDrills, setFilteredDrills] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [drillDetailModalVisible, setDrillDetailModalVisible] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for drills
  const mockDrills = [
    {
      id: '1',
      title: 'Cone Weaving Sprint',
      category: 'Speed & Agility',
      sport: 'Football',
      difficulty: 'Beginner',
      duration: '10 min',
      participants: '1-10',
      equipment: ['Cones', 'Stopwatch'],
      description: 'Improve speed and agility through cone weaving exercises',
      videoUrl: 'https://example.com/video1',
      thumbnail: 'https://via.placeholder.com/300x200',
      rating: 4.5,
      views: 1250,
      saves: 89,
      tags: ['cardio', 'footwork', 'coordination'],
      instructions: [
        'Set up 6 cones in a straight line, 2 meters apart',
        'Sprint to first cone, then weave through remaining cones',
        'Touch each cone with your hand',
        'Sprint back to starting position',
        'Rest for 30 seconds and repeat'
      ],
      variations: ['Add ball control', 'Backward weaving', 'Side shuffling'],
      objectives: ['Improve agility', 'Enhance coordination', 'Build speed'],
    },
    {
      id: '2',
      title: 'Passing Accuracy Challenge',
      category: 'Technical Skills',
      sport: 'Football',
      difficulty: 'Intermediate',
      duration: '15 min',
      participants: '2-8',
      equipment: ['Football', 'Target Goals', 'Cones'],
      description: 'Enhance passing accuracy and consistency under pressure',
      videoUrl: 'https://example.com/video2',
      thumbnail: 'https://via.placeholder.com/300x200',
      rating: 4.8,
      views: 2100,
      saves: 156,
      tags: ['passing', 'accuracy', 'technique'],
      instructions: [
        'Set up target goals at various distances',
        'Practice short, medium, and long passes',
        'Score points for hitting targets',
        'Progress through difficulty levels',
        'Track accuracy percentage'
      ],
      variations: ['Moving targets', 'Pressure situations', 'Weak foot only'],
      objectives: ['Improve passing accuracy', 'Build confidence', 'Develop consistency'],
    },
    {
      id: '3',
      title: 'Defensive Positioning',
      category: 'Tactical',
      sport: 'Basketball',
      difficulty: 'Advanced',
      duration: '20 min',
      participants: '6-12',
      equipment: ['Basketball', 'Court markers'],
      description: 'Master defensive positioning and team coordination',
      videoUrl: 'https://example.com/video3',
      thumbnail: 'https://via.placeholder.com/300x200',
      rating: 4.3,
      views: 890,
      saves: 67,
      tags: ['defense', 'positioning', 'teamwork'],
      instructions: [
        'Form defensive lines based on court positions',
        'Practice switching and help defense',
        'Communicate constantly with teammates',
        'React to offensive movements',
        'Maintain proper stance and spacing'
      ],
      variations: ['Zone defense', 'Man-to-man', 'Press defense'],
      objectives: ['Improve team defense', 'Build communication', 'Master positioning'],
    },
  ];

  const categories = ['All', 'Speed & Agility', 'Technical Skills', 'Tactical', 'Strength', 'Endurance', 'Flexibility'];
  const sports = ['All', 'Football', 'Basketball', 'Tennis', 'Soccer', 'Baseball', 'Volleyball'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Initialize animations
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

    loadDrills();
  }, []);

  // Filter drills based on search and filters
  useEffect(() => {
    filterDrills();
  }, [searchQuery, selectedCategory, selectedSport, selectedDifficulty, drills]);

  const loadDrills = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDrills(mockDrills);
    } catch (error) {
      Alert.alert('Error', 'Failed to load drills');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterDrills = useCallback(() => {
    let filtered = drills;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(drill =>
        drill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drill.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(drill => drill.category === selectedCategory);
    }

    // Sport filter
    if (selectedSport !== 'All') {
      filtered = filtered.filter(drill => drill.sport === selectedSport);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(drill => drill.difficulty === selectedDifficulty);
    }

    setFilteredDrills(filtered);
  }, [drills, searchQuery, selectedCategory, selectedSport, selectedDifficulty]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDrills();
    setRefreshing(false);
  }, [loadDrills]);

  const handleDrillPress = (drill) => {
    setSelectedDrill(drill);
    setDrillDetailModalVisible(true);
  };

  const handleAddToSession = (drill) => {
    Alert.alert(
      'Add to Session',
      `Add "${drill.title}" to a training session?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: () => {
            // Implement add to session logic
            Alert.alert('Success', 'Drill added to session! 🎯');
          }
        }
      ]
    );
  };

  const handleSaveDrill = (drill) => {
    Alert.alert('Saved', `"${drill.title}" saved to your favorites! ⭐`);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const renderDrillCard = ({ item, index }) => {
    const cardScale = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(cardScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={[
          viewMode === 'grid' ? styles.gridCard : styles.listCard,
          { transform: [{ scale: cardScale }] }
        ]}
      >
        <TouchableOpacity
          onPress={() => handleDrillPress(item)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <Card style={styles.drillCard} elevation={3}>
            <Image source={{ uri: item.thumbnail }} style={styles.drillThumbnail} />
            
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.thumbnailOverlay}
            >
              <View style={styles.drillBadges}>
                <Chip
                  mode="flat"
                  style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(item.difficulty) }]}
                  textStyle={styles.chipText}
                >
                  {item.difficulty}
                </Chip>
                <Chip mode="flat" style={styles.durationChip} textStyle={styles.chipText}>
                  {item.duration}
                </Chip>
              </View>
            </LinearGradient>

            <Card.Content style={styles.drillContent}>
              <Text style={TEXT_STYLES.h3} numberOfLines={2}>
                {item.title}
              </Text>
              
              <View style={styles.drillMeta}>
                <Text style={TEXT_STYLES.caption}>{item.category}</Text>
                <Text style={TEXT_STYLES.caption}>•</Text>
                <Text style={TEXT_STYLES.caption}>{item.sport}</Text>
              </View>

              <Text style={[TEXT_STYLES.body, styles.drillDescription]} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.drillStats}>
                <View style={styles.statItem}>
                  <Icon name="star" size={16} color={COLORS.warning} />
                  <Text style={TEXT_STYLES.small}>{item.rating}</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="visibility" size={16} color={COLORS.textSecondary} />
                  <Text style={TEXT_STYLES.small}>{item.views}</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="bookmark" size={16} color={COLORS.textSecondary} />
                  <Text style={TEXT_STYLES.small}>{item.saves}</Text>
                </View>
              </View>

              <View style={styles.drillActions}>
                <Button
                  mode="contained"
                  style={styles.addButton}
                  onPress={() => handleAddToSession(item)}
                  labelStyle={styles.buttonLabel}
                >
                  Add to Session
                </Button>
                <IconButton
                  icon="bookmark-outline"
                  size={20}
                  onPress={() => handleSaveDrill(item)}
                  style={styles.saveButton}
                />
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterChips}
    >
      {categories.map((category) => (
        <Chip
          key={category}
          mode={selectedCategory === category ? 'flat' : 'outlined'}
          style={[
            styles.filterChip,
            selectedCategory === category && styles.activeFilterChip
          ]}
          textStyle={selectedCategory === category ? styles.activeChipText : styles.chipText}
          onPress={() => setSelectedCategory(category)}
        >
          {category}
        </Chip>
      ))}
    </ScrollView>
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.warning;
      case 'Advanced': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const renderDrillDetailModal = () => (
    <Modal
      visible={drillDetailModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setDrillDetailModalVisible(false)}
    >
      <BlurView style={styles.modalOverlay} blurType="light" blurAmount={10}>
        <View style={styles.drillDetailModal}>
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
                {selectedDrill?.title}
              </Text>
              <IconButton
                icon="close"
                size={24}
                iconColor="white"
                onPress={() => setDrillDetailModalVisible(false)}
              />
            </View>
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            {selectedDrill && (
              <>
                <Image source={{ uri: selectedDrill.thumbnail }} style={styles.modalThumbnail} />
                
                <View style={styles.modalSection}>
                  <Text style={TEXT_STYLES.h3}>Description</Text>
                  <Text style={TEXT_STYLES.body}>{selectedDrill.description}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={TEXT_STYLES.h3}>Equipment Needed</Text>
                  <View style={styles.equipmentList}>
                    {selectedDrill.equipment.map((item, index) => (
                      <Chip key={index} mode="outlined" style={styles.equipmentChip}>
                        {item}
                      </Chip>
                    ))}
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={TEXT_STYLES.h3}>Instructions</Text>
                  {selectedDrill.instructions.map((instruction, index) => (
                    <View key={index} style={styles.instructionItem}>
                      <Text style={styles.instructionNumber}>{index + 1}</Text>
                      <Text style={TEXT_STYLES.body}>{instruction}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.modalSection}>
                  <Text style={TEXT_STYLES.h3}>Objectives</Text>
                  {selectedDrill.objectives.map((objective, index) => (
                    <View key={index} style={styles.objectiveItem}>
                      <Icon name="check-circle" size={16} color={COLORS.success} />
                      <Text style={[TEXT_STYLES.body, styles.objectiveText]}>{objective}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.modalSection}>
                  <Text style={TEXT_STYLES.h3}>Variations</Text>
                  {selectedDrill.variations.map((variation, index) => (
                    <Text key={index} style={[TEXT_STYLES.body, styles.variationText]}>
                      • {variation}
                    </Text>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="contained"
              style={styles.modalAddButton}
              onPress={() => {
                handleAddToSession(selectedDrill);
                setDrillDetailModalVisible(false);
              }}
            >
              Add to Session
            </Button>
          </View>
        </View>
      </BlurView>
    </Modal>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <BlurView style={styles.modalOverlay} blurType="light" blurAmount={10}>
          <View style={styles.filterModal}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>Filters</Text>
                <IconButton
                  icon="close"
                  size={24}
                  iconColor="white"
                  onPress={() => setFilterModalVisible(false)}
                />
              </View>
            </LinearGradient>

            <ScrollView style={styles.filterModalContent}>
              <View style={styles.filterSection}>
                <Text style={TEXT_STYLES.h3}>Sport</Text>
                <View style={styles.filterOptions}>
                  {sports.map((sport) => (
                    <Chip
                      key={sport}
                      mode={selectedSport === sport ? 'flat' : 'outlined'}
                      style={[
                        styles.filterOption,
                        selectedSport === sport && styles.activeFilterOption
                      ]}
                      onPress={() => setSelectedSport(sport)}
                    >
                      {sport}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={TEXT_STYLES.h3}>Difficulty</Text>
                <View style={styles.filterOptions}>
                  {difficulties.map((difficulty) => (
                    <Chip
                      key={difficulty}
                      mode={selectedDifficulty === difficulty ? 'flat' : 'outlined'}
                      style={[
                        styles.filterOption,
                        selectedDifficulty === difficulty && styles.activeFilterOption
                      ]}
                      onPress={() => setSelectedDifficulty(difficulty)}
                    >
                      {difficulty}
                    </Chip>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.filterModalActions}>
              <Button
                mode="outlined"
                style={styles.resetButton}
                onPress={() => {
                  setSelectedCategory('All');
                  setSelectedSport('All');
                  setSelectedDifficulty('All');
                }}
              >
                Reset
              </Button>
              <Button
                mode="contained"
                style={styles.applyButton}
                onPress={() => setFilterModalVisible(false)}
              >
                Apply Filters
              </Button>
            </View>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>Drill Library 📚</Text>
          <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
            Discover and organize your training drills
          </Text>
          
          <View style={styles.headerActions}>
            <Searchbar
              placeholder="Search drills..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
              inputStyle={styles.searchInput}
              iconColor={COLORS.primary}
            />
            
            <View style={styles.headerButtons}>
              <IconButton
                icon="tune"
                size={24}
                iconColor="white"
                style={styles.headerButton}
                onPress={() => setFilterModalVisible(true)}
              />
              <IconButton
                icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
                size={24}
                iconColor="white"
                style={styles.headerButton}
                onPress={toggleViewMode}
              />
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {renderFilterChips()}

        <View style={styles.resultsHeader}>
          <Text style={TEXT_STYLES.h3}>
            {filteredDrills.length} Drills Found
          </Text>
          <Text style={TEXT_STYLES.caption}>
            {searchQuery && `Results for "${searchQuery}"`}
          </Text>
        </View>

        <FlatList
          data={filteredDrills}
          renderItem={renderDrillCard}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
          contentContainerStyle={styles.drillsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={() => Alert.alert('Create Drill', 'Feature coming soon! 🔧')}
      />

      {renderDrillDetailModal()}
      {renderFilterModal()}
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
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerActions: {
    width: '100%',
    marginTop: SPACING.md,
  },
  searchBar: {
    marginBottom: SPACING.sm,
    backgroundColor: 'white',
    borderRadius: 25,
  },
  searchInput: {
    fontSize: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    margin: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  filterChips: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  activeChipText: {
    color: 'white',
  },
  resultsHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  drillsList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  gridCard: {
    flex: 1,
    margin: SPACING.xs,
  },
  listCard: {
    marginVertical: SPACING.xs,
  },
  drillCard: {
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  drillThumbnail: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    justifyContent: 'space-between',
    padding: SPACING.sm,
  },
  drillBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  difficultyChip: {
    backgroundColor: COLORS.success,
  },
  durationChip: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  drillContent: {
    padding: SPACING.md,
  },
  drillMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  drillDescription: {
    marginVertical: SPACING.sm,
    lineHeight: 20,
  },
  drillStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  drillActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  addButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  buttonLabel: {
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: COLORS.background,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.xl,
    borderRadius: 28,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drillDetailModal: {
    width: width * 0.9,
    maxHeight: '90%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  filterModal: {
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: SPACING.md,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    padding: SPACING.md,
  },
  modalThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  equipmentChip: {
    marginRight: 0,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: SPACING.xs,
  },
  instructionNumber: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: SPACING.sm,
    minWidth: 20,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  objectiveText: {
    marginLeft: SPACING.sm,
  },
  variationText: {
    marginVertical: SPACING.xs,
    paddingLeft: SPACING.sm,
  },
  modalActions: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalAddButton: {
    width: '100%',
  },
  filterModalContent: {
    flex: 1,
    padding: SPACING.md,
  },
  filterSection: {
    marginBottom: SPACING.lg,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  filterOption: {
    marginRight: 0,
  },
  activeFilterOption: {
    backgroundColor: COLORS.primary,
  },
  filterModalActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
});

export default DrillLibrary;
