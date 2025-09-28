import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  TextInput,
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
  Portal,
  Modal,
  Searchbar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#FFFFFF',
  dark: '#2c3e50',
  gray: '#95a5a6',
  lightGray: '#ecf0f1',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.dark },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.dark },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.dark },
  body: { fontSize: 16, color: COLORS.dark },
  caption: { fontSize: 14, color: COLORS.gray },
  small: { fontSize: 12, color: COLORS.gray },
};

const { width, height } = Dimensions.get('window');

const ProgramTemplatesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'Strength',
    duration: '8',
    level: 'Beginner',
    equipment: [],
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for program templates
  const mockTemplates = [
    {
      id: 1,
      name: 'Full Body Strength',
      description: 'Complete strength training program targeting all major muscle groups',
      category: 'Strength',
      duration: '12 weeks',
      level: 'Intermediate',
      exercises: 45,
      equipment: ['Dumbbells', 'Barbell', 'Bench'],
      rating: 4.8,
      uses: 156,
      created: '2024-01-15',
      image: '💪',
    },
    {
      id: 2,
      name: 'HIIT Fat Burner',
      description: 'High-intensity interval training for maximum calorie burn',
      category: 'Cardio',
      duration: '6 weeks',
      level: 'Advanced',
      exercises: 20,
      equipment: ['Bodyweight'],
      rating: 4.9,
      uses: 203,
      created: '2024-01-10',
      image: '🔥',
    },
    {
      id: 3,
      name: 'Beginner Basics',
      description: 'Perfect starter program for fitness newcomers',
      category: 'General',
      duration: '4 weeks',
      level: 'Beginner',
      exercises: 15,
      equipment: ['Minimal'],
      rating: 4.7,
      uses: 89,
      created: '2024-01-20',
      image: '🌟',
    },
    {
      id: 4,
      name: 'Athletic Performance',
      description: 'Sport-specific training for competitive athletes',
      category: 'Sports',
      duration: '16 weeks',
      level: 'Advanced',
      exercises: 65,
      equipment: ['Full Gym'],
      rating: 4.9,
      uses: 78,
      created: '2024-01-08',
      image: '🏆',
    },
    {
      id: 5,
      name: 'Yoga Flow',
      description: 'Flexibility and mindfulness through dynamic yoga sequences',
      category: 'Flexibility',
      duration: '8 weeks',
      level: 'All Levels',
      exercises: 30,
      equipment: ['Mat'],
      rating: 4.6,
      uses: 134,
      created: '2024-01-12',
      image: '🧘‍♀️',
    },
  ];

  const categories = ['All', 'Strength', 'Cardio', 'Sports', 'Flexibility', 'General'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  const equipmentOptions = ['Bodyweight', 'Dumbbells', 'Barbell', 'Bench', 'Mat', 'Full Gym', 'Minimal'];

  // Effects
  useEffect(() => {
    setTemplates(mockTemplates);
    setFilteredTemplates(mockTemplates);
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [searchQuery, selectedCategory, templates]);

  // Filter templates based on search and category
  const filterTemplates = useCallback(() => {
    let filtered = templates;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, searchQuery, selectedCategory]);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Create template handler
  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim()) {
      Alert.alert('Error', 'Please enter a template name');
      return;
    }

    const template = {
      id: Date.now(),
      ...newTemplate,
      exercises: 0,
      rating: 0,
      uses: 0,
      created: new Date().toISOString().split('T')[0],
      image: '📝',
    };

    setTemplates(prev => [template, ...prev]);
    setNewTemplate({
      name: '',
      description: '',
      category: 'Strength',
      duration: '8',
      level: 'Beginner',
      equipment: [],
    });
    setShowCreateModal(false);
    
    Alert.alert('Success', 'Template created successfully! 🎉');
  };

  // Template actions
  const handleUseTemplate = (template) => {
    Alert.alert(
      'Use Template',
      `Would you like to create a new program using "${template.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Create Program',
          onPress: () => navigation.navigate('CreateProgram', { template })
        },
      ]
    );
  };

  const handleEditTemplate = (template) => {
    Alert.alert('Edit Template', 'Template editing feature coming soon! 🚧');
  };

  const handleDeleteTemplate = (templateId) => {
    Alert.alert(
      'Delete Template',
      'Are you sure you want to delete this template?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setTemplates(prev => prev.filter(t => t.id !== templateId));
          }
        },
      ]
    );
  };

  // Render template card
  const renderTemplateCard = (template) => (
    <Animated.View
      key={template.id}
      style={[
        styles.templateCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card style={styles.card} elevation={3}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.cardHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.templateEmoji}>{template.image}</Text>
            <View style={styles.headerText}>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateMeta}>
                {template.duration} • {template.level}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <IconButton
                icon="edit"
                iconColor={COLORS.white}
                size={20}
                onPress={() => handleEditTemplate(template)}
              />
              <IconButton
                icon="delete"
                iconColor={COLORS.white}
                size={20}
                onPress={() => handleDeleteTemplate(template.id)}
              />
            </View>
          </View>
        </LinearGradient>

        <Card.Content style={styles.cardContent}>
          <Text style={styles.description}>{template.description}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="fitness-center" size={16} color={COLORS.primary} />
              <Text style={styles.statText}>{template.exercises} exercises</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star" size={16} color={COLORS.warning} />
              <Text style={styles.statText}>{template.rating}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="people" size={16} color={COLORS.success} />
              <Text style={styles.statText}>{template.uses} uses</Text>
            </View>
          </View>

          <View style={styles.chipContainer}>
            <Chip style={styles.categoryChip} textStyle={styles.chipText}>
              {template.category}
            </Chip>
            {template.equipment.slice(0, 2).map((eq, index) => (
              <Chip key={index} style={styles.equipmentChip} textStyle={styles.chipText}>
                {eq}
              </Chip>
            ))}
            {template.equipment.length > 2 && (
              <Chip style={styles.equipmentChip} textStyle={styles.chipText}>
                +{template.equipment.length - 2}
              </Chip>
            )}
          </View>

          <Button
            mode="contained"
            onPress={() => handleUseTemplate(template)}
            style={styles.useButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Use Template
          </Button>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  // Render create modal
  const renderCreateModal = () => (
    <Portal>
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurContainer}>
          <Surface style={styles.modalSurface} elevation={5}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Template</Text>
              <IconButton
                icon="close"
                onPress={() => setShowCreateModal(false)}
              />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Template Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTemplate.name}
                  onChangeText={(text) => setNewTemplate(prev => ({ ...prev, name: text }))}
                  placeholder="Enter template name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newTemplate.description}
                  onChangeText={(text) => setNewTemplate(prev => ({ ...prev, description: text }))}
                  placeholder="Describe your template"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipRow}>
                    {categories.filter(cat => cat !== 'All').map((category) => (
                      <Chip
                        key={category}
                        selected={newTemplate.category === category}
                        onPress={() => setNewTemplate(prev => ({ ...prev, category }))}
                        style={[
                          styles.selectChip,
                          newTemplate.category === category && styles.selectedChip
                        ]}
                        textStyle={styles.selectChipText}
                      >
                        {category}
                      </Chip>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration (weeks)</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTemplate.duration}
                  onChangeText={(text) => setNewTemplate(prev => ({ ...prev, duration: text }))}
                  placeholder="8"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Difficulty Level</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipRow}>
                    {levels.map((level) => (
                      <Chip
                        key={level}
                        selected={newTemplate.level === level}
                        onPress={() => setNewTemplate(prev => ({ ...prev, level }))}
                        style={[
                          styles.selectChip,
                          newTemplate.level === level && styles.selectedChip
                        ]}
                        textStyle={styles.selectChipText}
                      >
                        {level}
                      </Chip>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowCreateModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleCreateTemplate}
                  style={styles.createButton}
                >
                  Create Template
                </Button>
              </View>
            </ScrollView>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Program Templates</Text>
          <Text style={styles.headerSubtitle}>
            Create and manage your workout templates 📝
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search templates..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.selectedCategoryChip
            ]}
            textStyle={[
              styles.categoryChipText,
              selectedCategory === category && styles.selectedCategoryChipText
            ]}
          >
            {category}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.statsCard}>
          <Surface style={styles.statsSurface} elevation={2}>
            <View style={styles.statsContent}>
              <View style={styles.statColumn}>
                <Text style={styles.statNumber}>{templates.length}</Text>
                <Text style={styles.statLabel}>Templates</Text>
              </View>
              <View style={styles.statColumn}>
                <Text style={styles.statNumber}>
                  {templates.reduce((sum, t) => sum + t.uses, 0)}
                </Text>
                <Text style={styles.statLabel}>Total Uses</Text>
              </View>
              <View style={styles.statColumn}>
                <Text style={styles.statNumber}>
                  {(templates.reduce((sum, t) => sum + t.rating, 0) / templates.length || 0).toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </View>
            </View>
          </Surface>
        </View>

        {filteredTemplates.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No Templates Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Try adjusting your search' : 'Create your first template to get started'}
            </Text>
          </View>
        ) : (
          filteredTemplates.map(renderTemplateCard)
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        color={COLORS.white}
      />

      {renderCreateModal()}
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchBar: {
    backgroundColor: COLORS.white,
    elevation: 3,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  categoryContainer: {
    marginBottom: SPACING.md,
  },
  categoryContent: {
    paddingHorizontal: SPACING.lg,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.dark,
  },
  selectedCategoryChipText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl * 3,
  },
  statsCard: {
    marginBottom: SPACING.lg,
  },
  statsSurface: {
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
  },
  statColumn: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
  },
  templateCard: {
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  templateName: {
    ...TEXT_STYLES.h3,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  templateMeta: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    opacity: 0.9,
  },
  headerActions: {
    flexDirection: 'row',
  },
  cardContent: {
    paddingTop: SPACING.lg,
  },
  description: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.lg,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.primary,
  },
  equipmentChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.lightGray,
  },
  chipText: {
    ...TEXT_STYLES.small,
    color: COLORS.white,
  },
  useButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
  },
  buttonContent: {
    paddingVertical: SPACING.xs,
  },
  buttonLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
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
  blurContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalSurface: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
  },
  modalContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    maxHeight: height * 0.6,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...TEXT_STYLES.body,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
  },
  selectChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.lightGray,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  selectChipText: {
    ...TEXT_STYLES.small,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    marginRight: SPACING.sm,
    borderColor: COLORS.gray,
  },
  createButton: {
    flex: 1,
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
});

export default ProgramTemplatesScreen;