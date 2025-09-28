import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  Dimensions,
  Animated,
  Vibration,
  Platform,
  TextInput,
  KeyboardAvoidingView,
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
  Modal,
  Badge,
  Switch,
  RadioButton,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system imports
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width, height } = Dimensions.get('window');

const TutorialCreator = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, coachProfile } = useSelector(state => state.auth);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('create');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Tutorial creation state
  const [tutorialData, setTutorialData] = useState({
    title: '',
    description: '',
    category: 'drills',
    difficulty: 'beginner',
    duration: '',
    equipment: [],
    tags: [],
    isPublic: true,
    allowComments: true,
    steps: []
  });
  
  const [currentStep, setCurrentStep] = useState({
    title: '',
    description: '',
    duration: '',
    tips: '',
    media: null,
    mediaType: 'none'
  });
  
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState(-1);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Mock data for existing tutorials
  const [myTutorials] = useState([
    {
      id: 1,
      title: 'Perfect Free Kick Technique',
      description: 'Master the art of free kicks with this step-by-step guide',
      category: 'skills',
      difficulty: 'intermediate',
      duration: '15 min',
      steps: 8,
      views: 2341,
      likes: 178,
      status: 'published',
      createdAt: '2024-08-10',
      thumbnail: 'https://via.placeholder.com/200x120',
    },
    {
      id: 2,
      title: 'Defensive Positioning Basics',
      description: 'Learn fundamental defensive positioning principles',
      category: 'strategy',
      difficulty: 'beginner',
      duration: '12 min',
      steps: 6,
      views: 1567,
      likes: 89,
      status: 'draft',
      createdAt: '2024-08-08',
      thumbnail: 'https://via.placeholder.com/200x120',
    },
  ]);

  const categories = [
    { id: 'drills', name: 'Drills', icon: 'fitness-center', color: '#FF6B6B' },
    { id: 'skills', name: 'Skills', icon: 'sports-soccer', color: '#4ECDC4' },
    { id: 'strategy', name: 'Strategy', icon: 'psychology', color: '#45B7D1' },
    { id: 'fitness', name: 'Fitness', icon: 'directions-run', color: '#96CEB4' },
    { id: 'nutrition', name: 'Nutrition', icon: 'restaurant', color: '#FECA57' },
    { id: 'mental', name: 'Mental', icon: 'self-improvement', color: '#FF9FF3' },
  ];

  const difficulties = [
    { id: 'beginner', name: 'Beginner', color: '#4CAF50', icon: 'sentiment-satisfied' },
    { id: 'intermediate', name: 'Intermediate', color: '#FF9800', icon: 'sentiment-neutral' },
    { id: 'advanced', name: 'Advanced', color: '#F44336', icon: 'sentiment-very-dissatisfied' },
  ];

  const equipmentOptions = [
    'Football/Soccer Ball', 'Cones', 'Agility Ladder', 'Resistance Bands',
    'Medicine Ball', 'Goal Posts', 'Training Bibs', 'Hurdles', 'Weights', 'None'
  ];

  const tabs = [
    { id: 'create', name: 'Create', icon: 'create' },
    { id: 'my_tutorials', name: 'My Tutorials', icon: 'video-library', count: myTutorials.length },
    { id: 'drafts', name: 'Drafts', icon: 'drafts', count: 1 },
  ];

  // Effects
  useEffect(() => {
    const animateIn = () => {
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
    };
    
    animateIn();
    updateProgress();
  }, [tutorialData]);

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Success', 'Tutorials refreshed! 📚');
    }, 1500);
  }, []);

  const updateProgress = () => {
    const requiredFields = ['title', 'description', 'category', 'difficulty'];
    const completedFields = requiredFields.filter(field => tutorialData[field] && tutorialData[field].length > 0);
    const hasSteps = tutorialData.steps.length > 0;
    
    const progress = (completedFields.length + (hasSteps ? 1 : 0)) / (requiredFields.length + 1);
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const handleInputChange = (field, value) => {
    setTutorialData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddStep = () => {
    Vibration.vibrate(50);
    setCurrentStep({
      title: '',
      description: '',
      duration: '',
      tips: '',
      media: null,
      mediaType: 'none'
    });
    setEditingStepIndex(-1);
    setShowStepModal(true);
  };

  const handleEditStep = (index) => {
    Vibration.vibrate(50);
    setCurrentStep(tutorialData.steps[index]);
    setEditingStepIndex(index);
    setShowStepModal(true);
  };

  const handleSaveStep = () => {
    if (!currentStep.title.trim() || !currentStep.description.trim()) {
      Alert.alert('Missing Information', 'Please provide step title and description');
      return;
    }

    const newSteps = [...tutorialData.steps];
    if (editingStepIndex >= 0) {
      newSteps[editingStepIndex] = currentStep;
    } else {
      newSteps.push(currentStep);
    }

    setTutorialData(prev => ({
      ...prev,
      steps: newSteps
    }));

    setShowStepModal(false);
    Vibration.vibrate(100);
    Alert.alert('Step Saved! ✅', 'Tutorial step has been added successfully');
  };

  const handleDeleteStep = (index) => {
    Alert.alert(
      'Delete Step',
      'Are you sure you want to delete this step?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newSteps = tutorialData.steps.filter((_, i) => i !== index);
            setTutorialData(prev => ({ ...prev, steps: newSteps }));
            Vibration.vibrate(100);
          }
        }
      ]
    );
  };

  const handleSaveDraft = () => {
    Vibration.vibrate(100);
    Alert.alert(
      'Save Draft 📝',
      'Tutorial saved as draft! You can continue editing later.',
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handlePublishTutorial = () => {
    const requiredFields = ['title', 'description'];
    const missingFields = requiredFields.filter(field => !tutorialData[field].trim());
    
    if (missingFields.length > 0) {
      Alert.alert('Missing Information', 'Please complete all required fields before publishing');
      return;
    }

    if (tutorialData.steps.length === 0) {
      Alert.alert('No Steps', 'Please add at least one step to your tutorial');
      return;
    }

    Vibration.vibrate(100);
    Alert.alert(
      'Publish Tutorial 🚀',
      'Your tutorial will be published and available to the community!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          onPress: () => {
            Alert.alert('Success! 🎉', 'Tutorial published successfully!');
            // Reset form
            setTutorialData({
              title: '',
              description: '',
              category: 'drills',
              difficulty: 'beginner',
              duration: '',
              equipment: [],
              tags: [],
              isPublic: true,
              allowComments: true,
              steps: []
            });
          }
        }
      ]
    );
  };

  const handleTabSelect = (tabId) => {
    Vibration.vibrate(30);
    setSelectedTab(tabId);
  };

  const handleTutorialPress = (tutorial) => {
    Vibration.vibrate(50);
    navigation.navigate('TutorialViewer', { tutorialId: tutorial.id });
  };

  // Render methods
  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Tutorial Creator 🎬</Text>
            <Text style={styles.headerSubtitle}>
              Create step-by-step training guides
            </Text>
          </View>
          <Avatar.Image
            size={45}
            source={{ uri: coachProfile?.avatar || 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Tutorial Progress</Text>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  })
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {tutorialData.steps.length} steps • {tutorialData.title ? 'Title ✓' : 'Add title'}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderTabBar = () => (
    <View style={styles.tabContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabItem,
              selectedTab === tab.id && styles.activeTabItem
            ]}
            onPress={() => handleTabSelect(tab.id)}
            activeOpacity={0.7}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={selectedTab === tab.id ? COLORS.primary : '#666'}
            />
            <Text style={[
              styles.tabText,
              selectedTab === tab.id && styles.activeTabText
            ]}>
              {tab.name}
            </Text>
            {tab.count && (
              <Badge style={styles.tabBadge}>{tab.count}</Badge>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderBasicInfo = () => (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Icon name="info" size={24} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Basic Information</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Tutorial Title *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter tutorial title..."
          value={tutorialData.title}
          onChangeText={(value) => handleInputChange('title', value)}
          maxLength={60}
        />
        <Text style={styles.charCount}>{tutorialData.title.length}/60</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Describe what players will learn..."
          value={tutorialData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          multiline
          numberOfLines={3}
          maxLength={200}
        />
        <Text style={styles.charCount}>{tutorialData.description.length}/200</Text>
      </View>

      <View style={styles.rowContainer}>
        <View style={styles.halfWidth}>
          <Text style={styles.inputLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => handleInputChange('category', category.id)}
                >
                  <Chip
                    style={[
                      styles.categoryChip,
                      tutorialData.category === category.id && { backgroundColor: category.color + '20' }
                    ]}
                    textStyle={[
                      styles.chipText,
                      tutorialData.category === category.id && { color: category.color }
                    ]}
                    icon={({ size }) => (
                      <Icon
                        name={category.icon}
                        size={size}
                        color={tutorialData.category === category.id ? category.color : '#666'}
                      />
                    )}
                  >
                    {category.name}
                  </Chip>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Difficulty Level</Text>
        <View style={styles.radioContainer}>
          {difficulties.map((difficulty) => (
            <TouchableOpacity
              key={difficulty.id}
              style={styles.radioOption}
              onPress={() => handleInputChange('difficulty', difficulty.id)}
            >
              <RadioButton
                value={difficulty.id}
                status={tutorialData.difficulty === difficulty.id ? 'checked' : 'unchecked'}
                onPress={() => handleInputChange('difficulty', difficulty.id)}
                color={difficulty.color}
              />
              <Icon name={difficulty.icon} size={20} color={difficulty.color} />
              <Text style={[styles.radioText, { color: difficulty.color }]}>
                {difficulty.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Estimated Duration</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., 15 minutes"
          value={tutorialData.duration}
          onChangeText={(value) => handleInputChange('duration', value)}
        />
      </View>
    </Card>
  );

  const renderStepsSection = () => (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Icon name="list" size={24} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Tutorial Steps ({tutorialData.steps.length})</Text>
        <IconButton
          icon="add"
          size={24}
          onPress={handleAddStep}
          style={styles.addButton}
        />
      </View>

      {tutorialData.steps.length > 0 ? (
        tutorialData.steps.map((step, index) => (
          <View key={index} style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription} numberOfLines={2}>
                  {step.description}
                </Text>
                {step.duration && (
                  <Text style={styles.stepDuration}>⏱ {step.duration}</Text>
                )}
              </View>
              <View style={styles.stepActions}>
                <IconButton
                  icon="edit"
                  size={20}
                  onPress={() => handleEditStep(index)}
                />
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => handleDeleteStep(index)}
                />
              </View>
            </View>
            {index < tutorialData.steps.length - 1 && <Divider style={styles.stepDivider} />}
          </View>
        ))
      ) : (
        <View style={styles.emptySteps}>
          <Icon name="video-library" size={60} color="#DDD" />
          <Text style={styles.emptyTitle}>No steps added yet</Text>
          <Text style={styles.emptyDescription}>
            Add your first step to start building the tutorial
          </Text>
          <Button
            mode="contained"
            onPress={handleAddStep}
            style={styles.addFirstStepButton}
            icon="add"
          >
            Add First Step
          </Button>
        </View>
      )}
    </Card>
  );

  const renderSettings = () => (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Icon name="settings" size={24} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Publishing Settings</Text>
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Public Tutorial</Text>
          <Text style={styles.settingDescription}>
            Make this tutorial visible to the community
          </Text>
        </View>
        <Switch
          value={tutorialData.isPublic}
          onValueChange={(value) => handleInputChange('isPublic', value)}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Allow Comments</Text>
          <Text style={styles.settingDescription}>
            Let users comment and ask questions
          </Text>
        </View>
        <Switch
          value={tutorialData.allowComments}
          onValueChange={(value) => handleInputChange('allowComments', value)}
          color={COLORS.primary}
        />
      </View>
    </Card>
  );

  const renderActionButtons = () => (
    <View style={styles.actionContainer}>
      <Button
        mode="outlined"
        onPress={handleSaveDraft}
        style={styles.actionButton}
        icon="save"
      >
        Save Draft
      </Button>
      <Button
        mode="contained"
        onPress={() => setShowPreview(true)}
        style={styles.actionButton}
        icon="preview"
      >
        Preview
      </Button>
      <Button
        mode="contained"
        onPress={handlePublishTutorial}
        style={[styles.actionButton, styles.publishButton]}
        icon="publish"
        buttonColor="#4CAF50"
      >
        Publish
      </Button>
    </View>
  );

  const renderStepModal = () => (
    <Portal>
      <Modal
        visible={showStepModal}
        onDismiss={() => setShowStepModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingStepIndex >= 0 ? 'Edit Step' : 'Add New Step'}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Step Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter step title..."
              value={currentStep.title}
              onChangeText={(value) => setCurrentStep(prev => ({ ...prev, title: value }))}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe what to do in this step..."
              value={currentStep.description}
              onChangeText={(value) => setCurrentStep(prev => ({ ...prev, description: value }))}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.rowContainer}>
            <View style={styles.halfWidth}>
              <Text style={styles.inputLabel}>Duration</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 2 minutes"
                value={currentStep.duration}
                onChangeText={(value) => setCurrentStep(prev => ({ ...prev, duration: value }))}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tips (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Add helpful tips or common mistakes to avoid..."
              value={currentStep.tips}
              onChangeText={(value) => setCurrentStep(prev => ({ ...prev, tips: value }))}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowStepModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveStep}
              style={styles.modalButton}
            >
              Save Step
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderMyTutorials = () => (
    <View style={styles.tutorialsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Tutorials ({myTutorials.length})</Text>
        <IconButton
          icon="sort"
          size={24}
          onPress={() => {
            Alert.alert('Sort Options', 'Sort tutorials by date, views, or status');
          }}
        />
      </View>

      {myTutorials.map((tutorial, index) => (
        <TouchableOpacity
          key={tutorial.id}
          onPress={() => handleTutorialPress(tutorial)}
          activeOpacity={0.9}
        >
          <Card style={styles.tutorialCard}>
            <View style={styles.tutorialContent}>
              <View style={styles.tutorialHeader}>
                <View style={styles.tutorialInfo}>
                  <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
                  <Text style={styles.tutorialDescription} numberOfLines={2}>
                    {tutorial.description}
                  </Text>
                </View>
                <Chip
                  style={[
                    styles.statusChip,
                    tutorial.status === 'published' ? styles.publishedChip : styles.draftChip
                  ]}
                  textStyle={styles.statusText}
                >
                  {tutorial.status.toUpperCase()}
                </Chip>
              </View>

              <View style={styles.tutorialMeta}>
                <View style={styles.metaItem}>
                  <Icon name="play-lesson" size={16} color="#666" />
                  <Text style={styles.metaText}>{tutorial.steps} steps</Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="schedule" size={16} color="#666" />
                  <Text style={styles.metaText}>{tutorial.duration}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="visibility" size={16} color="#666" />
                  <Text style={styles.metaText}>{tutorial.views}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="favorite" size={16} color="#FF6B6B" />
                  <Text style={styles.metaText}>{tutorial.likes}</Text>
                </View>
              </View>

              <View style={styles.tutorialActions}>
                <Button
                  mode="outlined"
                  onPress={() => Alert.alert('Edit Tutorial', 'Edit functionality coming soon!')}
                  style={styles.tutorialActionButton}
                  compact
                >
                  Edit
                </Button>
                <Button
                  mode="contained"
                  onPress={() => Alert.alert('Share Tutorial', 'Share functionality coming soon!')}
                  style={styles.tutorialActionButton}
                  compact
                >
                  Share
                </Button>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'create':
        return (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderBasicInfo()}
            {renderStepsSection()}
            {renderSettings()}
            {renderActionButtons()}
          </ScrollView>
        );
      case 'my_tutorials':
        return renderMyTutorials();
      case 'drafts':
        return (
          <View style={styles.emptyState}>
            <Icon name="drafts" size={80} color="#DDD" />
            <Text style={styles.emptyTitle}>No drafts yet</Text>
            <Text style={styles.emptyDescription}>
              Your saved drafts will appear here
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {renderHeader()}
      {renderTabBar()}
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {renderTabContent()}
      </Animated.View>

      {renderStepModal()}

      <FAB
        style={styles.fab}
        icon="add"
        onPress={selectedTab === 'create' ? handleAddStep : () => setSelectedTab('create')}
        color="#FFF"
      />
    </KeyboardAvoidingView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: SPACING.large,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    paddingHorizontal: SPACING.large,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.large,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 4,
  },
  avatar: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  progressContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: SPACING.medium,
  },
  progressLabel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.small,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.small,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.9,
  },
  tabContainer: {
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabScrollContainer: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    marginRight: SPACING.small,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    minWidth: 80,
    justifyContent: 'center',
  },
  activeTabItem: {
    backgroundColor: COLORS.primary + '20',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabBadge: {
    marginLeft: 4,
    backgroundColor: COLORS.primary,
    minWidth: 18,
    height: 18,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.medium,
    paddingBottom: 100, // Space for FAB
  },
  sectionCard: {
    marginBottom: SPACING.medium,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    backgroundColor: '#FFF',
    padding: SPACING.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginLeft: SPACING.small,
    flex: 1,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: COLORS.primary + '20',
    margin: 0,
  },
  inputContainer: {
    marginBottom: SPACING.medium,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: SPACING.small,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  halfWidth: {
    flex: 1,
    marginRight: SPACING.small,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: SPACING.small,
    paddingVertical: SPACING.small,
  },
  categoryChip: {
    marginRight: SPACING.small,
    backgroundColor: '#F5F5F5',
  },
  chipText: {
    fontSize: 14,
  },
  radioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.small,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '30%',
    paddingVertical: SPACING.small,
  },
  radioText: {
    marginLeft: SPACING.small,
    fontSize: 14,
    fontWeight: '500',
  },
  stepCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: SPACING.medium,
    marginBottom: SPACING.small,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  stepNumberText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  stepDuration: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  stepActions: {
    flexDirection: 'row',
  },
  stepDivider: {
    marginVertical: SPACING.small,
    backgroundColor: '#E0E0E0',
  },
  emptySteps: {
    alignItems: 'center',
    padding: SPACING.large * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: SPACING.medium,
    marginBottom: SPACING.small,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: SPACING.large,
    lineHeight: 20,
  },
  addFirstStepButton: {
    borderRadius: 25,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: SPACING.small,
    marginTop: SPACING.medium,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  publishButton: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.medium,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: SPACING.large,
    maxHeight: height * 0.8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: SPACING.large,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.medium,
    marginTop: SPACING.large,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
  },
  tutorialsContainer: {
    padding: SPACING.medium,
  },
  tutorialCard: {
    marginBottom: SPACING.medium,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    backgroundColor: '#FFF',
  },
  tutorialContent: {
    padding: SPACING.medium,
  },
  tutorialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.small,
  },
  tutorialInfo: {
    flex: 1,
    marginRight: SPACING.medium,
  },
  tutorialTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  tutorialDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statusChip: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishedChip: {
    backgroundColor: '#4CAF50',
  },
  draftChip: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  tutorialMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.small,
    gap: SPACING.medium,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  tutorialActions: {
    flexDirection: 'row',
    gap: SPACING.small,
    marginTop: SPACING.small,
  },
  tutorialActionButton: {
    flex: 1,
    borderRadius: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.large * 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
};

export default TutorialCreator;