import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Vibration,
  Modal,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Searchbar,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
  FadeInRight,
  FadeInUp,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const SessionTemplates = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, coachData } = useSelector((state) => state.auth);
  const { templates, categories } = useSelector((state) => state.coach);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [sortBy, setSortBy] = useState('recent'); // recent, name, category, popular
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'strength',
    duration: 60,
    intensity: 'medium',
    exercises: [],
    equipment: [],
    objectives: [],
    notes: '',
  });

  const scrollY = useSharedValue(0);
  const fabScale = useSharedValue(1);

  // Sample template data
  const sessionTemplates = [
    {
      id: 1,
      name: 'Strength & Power Building',
      description: 'Focus on building overall strength and explosive power through compound movements',
      category: 'strength',
      duration: 90,
      intensity: 'high',
      exercises: [
        { name: 'Squats', sets: 4, reps: '8-12', rest: '2-3 min' },
        { name: 'Deadlifts', sets: 3, reps: '6-8', rest: '3 min' },
        { name: 'Bench Press', sets: 4, reps: '8-10', rest: '2-3 min' },
        { name: 'Pull-ups', sets: 3, reps: '8-12', rest: '2 min' },
      ],
      equipment: ['Barbell', 'Dumbbells', 'Pull-up Bar'],
      objectives: ['Strength', 'Power', 'Muscle Building'],
      usageCount: 24,
      rating: 4.8,
      lastUsed: '2024-12-26',
      createdAt: '2024-12-15',
      thumbnail: '💪',
    },
    {
      id: 2,
      name: 'Cardio Endurance Circuit',
      description: 'High-intensity circuit training to improve cardiovascular endurance',
      category: 'cardio',
      duration: 45,
      intensity: 'high',
      exercises: [
        { name: 'Burpees', sets: 3, reps: '15', rest: '30 sec' },
        { name: 'Mountain Climbers', sets: 3, reps: '20', rest: '30 sec' },
        { name: 'Jumping Jacks', sets: 3, reps: '25', rest: '30 sec' },
        { name: 'High Knees', sets: 3, reps: '20', rest: '30 sec' },
      ],
      equipment: ['None'],
      objectives: ['Endurance', 'Fat Loss', 'Conditioning'],
      usageCount: 18,
      rating: 4.6,
      lastUsed: '2024-12-25',
      createdAt: '2024-12-20',
      thumbnail: '🏃',
    },
    {
      id: 3,
      name: 'Flexibility & Recovery',
      description: 'Gentle stretching and mobility work for recovery and injury prevention',
      category: 'recovery',
      duration: 30,
      intensity: 'low',
      exercises: [
        { name: 'Dynamic Warm-up', sets: 1, reps: '5 min', rest: 'None' },
        { name: 'Hip Flexor Stretch', sets: 2, reps: '30 sec each', rest: '15 sec' },
        { name: 'Shoulder Rolls', sets: 2, reps: '10 each way', rest: '15 sec' },
        { name: 'Cat-Cow Stretch', sets: 2, reps: '10', rest: '15 sec' },
      ],
      equipment: ['Yoga Mat', 'Foam Roller'],
      objectives: ['Flexibility', 'Recovery', 'Injury Prevention'],
      usageCount: 15,
      rating: 4.9,
      lastUsed: '2024-12-24',
      createdAt: '2024-12-18',
      thumbnail: '🧘',
    },
    {
      id: 4,
      name: 'Sports-Specific Agility',
      description: 'Dynamic movements to improve agility, coordination and sport performance',
      category: 'agility',
      duration: 60,
      intensity: 'medium',
      exercises: [
        { name: 'Ladder Drills', sets: 3, reps: '30 sec', rest: '60 sec' },
        { name: 'Cone Weaving', sets: 3, reps: '5 rounds', rest: '60 sec' },
        { name: 'Box Jumps', sets: 3, reps: '10', rest: '90 sec' },
        { name: 'Shuttle Runs', sets: 4, reps: '15 sec', rest: '45 sec' },
      ],
      equipment: ['Agility Ladder', 'Cones', 'Plyometric Box'],
      objectives: ['Agility', 'Speed', 'Coordination'],
      usageCount: 12,
      rating: 4.7,
      lastUsed: '2024-12-23',
      createdAt: '2024-12-22',
      thumbnail: '⚡',
    },
  ];

  const templateCategories = [
    { id: 'all', name: 'All Templates', icon: 'apps', color: COLORS.primary },
    { id: 'strength', name: 'Strength', icon: 'fitness-center', color: '#e74c3c' },
    { id: 'cardio', name: 'Cardio', icon: 'directions-run', color: '#f39c12' },
    { id: 'agility', name: 'Agility', icon: 'speed', color: '#9b59b6' },
    { id: 'recovery', name: 'Recovery', icon: 'spa', color: '#27ae60' },
    { id: 'technique', name: 'Technique', icon: 'school', color: '#3498db' },
  ];

  const intensityLevels = [
    { id: 'low', name: 'Low', color: '#27ae60', emoji: '🟢' },
    { id: 'medium', name: 'Medium', color: '#f39c12', emoji: '🟡' },
    { id: 'high', name: 'High', color: '#e74c3c', emoji: '🔴' },
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchSessionTemplates());
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTemplates();
    setRefreshing(false);
  }, []);

  const handleCreateTemplate = async () => {
    try {
      if (!newTemplate.name || !newTemplate.description) {
        Alert.alert('Error', 'Please fill in template name and description');
        return;
      }

      Vibration.vibrate(50);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Success! 🎉',
        'Session template has been created successfully',
        [{ text: 'OK', onPress: () => setShowCreateModal(false) }]
      );
      
      // Reset form
      setNewTemplate({
        name: '',
        description: '',
        category: 'strength',
        duration: 60,
        intensity: 'medium',
        exercises: [],
        equipment: [],
        objectives: [],
        notes: '',
      });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to create template. Please try again.');
    }
  };

  const handleUseTemplate = (template) => {
    Alert.alert(
      'Use Template',
      `Create a new session using "${template.name}" template?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Session',
          onPress: () => {
            Vibration.vibrate(50);
            navigation.navigate('SessionScheduler', { template });
          }
        }
      ]
    );
  };

  const handleEditTemplate = (template) => {
    navigation.navigate('TemplateEditor', { templateId: template.id });
  };

  const handleDeleteTemplate = (templateId) => {
    Alert.alert(
      'Delete Template',
      'Are you sure you want to delete this template? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Vibration.vibrate(100);
            // dispatch(deleteTemplate(templateId));
            Alert.alert('Deleted', 'Template has been deleted');
          }
        }
      ]
    );
  };

  const filteredTemplates = sessionTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryConfig = (categoryId) => {
    return templateCategories.find(cat => cat.id === categoryId) || templateCategories[0];
  };

  const getIntensityConfig = (intensity) => {
    return intensityLevels.find(level => level.id === intensity) || intensityLevels[1];
  };

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.delay(100)}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + 20,
          paddingHorizontal: SPACING.lg,
          paddingBottom: SPACING.lg,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md }}>
          <View>
            <Text style={[TEXT_STYLES.header, { color: 'white', fontSize: 28 }]}>
              Templates 📋
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)', marginTop: 4 }]}>
              Manage your session templates
            </Text>
          </View>
          <Avatar.Text
            size={50}
            label={user?.name?.charAt(0) || 'C'}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            labelStyle={{ color: 'white' }}
          />
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search templates..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: 12,
            marginBottom: SPACING.md,
          }}
          inputStyle={{ fontSize: 16 }}
        />

        {/* View Mode Toggle */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => setViewMode('grid')}
              style={{
                padding: SPACING.sm,
                backgroundColor: viewMode === 'grid' ? 'rgba(255,255,255,0.3)' : 'transparent',
                borderRadius: 8,
                marginRight: SPACING.xs,
              }}
            >
              <Icon name="grid-view" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('list')}
              style={{
                padding: SPACING.sm,
                backgroundColor: viewMode === 'list' ? 'rgba(255,255,255,0.3)' : 'transparent',
                borderRadius: 8,
              }}
            >
              <Icon name="list" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            onPress={() => Alert.alert('Feature Coming Soon', 'Sort options will be implemented')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
            }}
          >
            <Icon name="sort" size={16} color="white" />
            <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, color: 'white' }]}>
              Sort
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderCategoryFilter = () => (
    <Animated.View
      entering={FadeInDown.delay(200)}
      style={{ paddingVertical: SPACING.lg }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
      >
        {templateCategories.map((category, index) => (
          <Animated.View
            key={category.id}
            entering={FadeInRight.delay(index * 100)}
          >
            <TouchableOpacity
              onPress={() => setSelectedCategory(category.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                marginRight: SPACING.sm,
                borderRadius: 20,
                backgroundColor: selectedCategory === category.id ? category.color : `${category.color}20`,
              }}
            >
              <Icon
                name={category.icon}
                size={16}
                color={selectedCategory === category.id ? 'white' : category.color}
              />
              <Text style={[
                TEXT_STYLES.caption,
                {
                  marginLeft: SPACING.xs,
                  color: selectedCategory === category.id ? 'white' : category.color,
                  fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
                }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderTemplateCard = ({ item, index }) => {
    const categoryConfig = getCategoryConfig(item.category);
    const intensityConfig = getIntensityConfig(item.intensity);
    
    if (viewMode === 'grid') {
      return (
        <Animated.View
          entering={FadeInUp.delay(index * 100)}
          style={{
            width: (width - SPACING.lg * 3) / 2,
            marginRight: index % 2 === 0 ? SPACING.md : 0,
            marginBottom: SPACING.md,
          }}
        >
          <Card style={{
            borderRadius: 16,
            elevation: 3,
            height: 280,
          }}>
            <LinearGradient
              colors={[categoryConfig.color, `${categoryConfig.color}90`]}
              style={{
                height: 60,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 32 }}>{item.thumbnail}</Text>
            </LinearGradient>
            
            <Card.Content style={{ padding: SPACING.md, flex: 1 }}>
              <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.xs }]} numberOfLines={2}>
                {item.name}
              </Text>
              
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.sm }]} numberOfLines={3}>
                {item.description}
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                <Icon name="schedule" size={14} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, color: COLORS.textSecondary }]}>
                  {item.duration} min
                </Text>
                <Text style={{ marginHorizontal: SPACING.sm, color: COLORS.textSecondary }}>•</Text>
                <Text style={[TEXT_STYLES.caption, { color: intensityConfig.color }]}>
                  {intensityConfig.emoji} {intensityConfig.name}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Icon name="star" size={14} color="#f39c12" />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, color: COLORS.textSecondary }]}>
                  {item.rating} • Used {item.usageCount} times
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 'auto' }}>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => handleUseTemplate(item)}
                  style={{ flex: 1, marginRight: SPACING.xs }}
                  contentStyle={{ paddingVertical: 2 }}
                >
                  Use
                </Button>
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => {
                    setSelectedTemplate(item);
                    setShowTemplateModal(true);
                  }}
                />
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      );
    } else {
      return (
        <Animated.View entering={FadeInRight.delay(index * 50)}>
          <Card style={{
            marginHorizontal: SPACING.lg,
            marginBottom: SPACING.md,
            borderRadius: 16,
            elevation: 2,
          }}>
            <LinearGradient
              colors={[categoryConfig.color, `${categoryConfig.color}90`]}
              style={{
                height: 4,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}
            />
            
            <Card.Content style={{ padding: SPACING.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: `${categoryConfig.color}20`,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.md,
                }}>
                  <Text style={{ fontSize: 24 }}>{item.thumbnail}</Text>
                </View>
                
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.xs }]}>
                        {item.name}
                      </Text>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.sm }]} numberOfLines={2}>
                        {item.description}
                      </Text>
                    </View>
                    <IconButton
                      icon="dots-vertical"
                      size={20}
                      onPress={() => {
                        setSelectedTemplate(item);
                        setShowTemplateModal(true);
                      }}
                    />
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: SPACING.sm }}>
                    <Chip
                      mode="outlined"
                      compact
                      style={{ marginRight: SPACING.xs, marginBottom: SPACING.xs }}
                      textStyle={{ fontSize: 10 }}
                    >
                      {item.duration} min
                    </Chip>
                    <Chip
                      mode="outlined"
                      compact
                      style={{
                        marginRight: SPACING.xs,
                        marginBottom: SPACING.xs,
                        backgroundColor: `${intensityConfig.color}20`,
                      }}
                      textStyle={{ fontSize: 10, color: intensityConfig.color }}
                    >
                      {intensityConfig.name}
                    </Chip>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                      ⭐ {item.rating} • {item.usageCount} uses
                    </Text>
                  </View>
                  
                  <Button
                    mode="contained"
                    compact
                    onPress={() => handleUseTemplate(item)}
                    style={{ alignSelf: 'flex-start' }}
                    contentStyle={{ paddingVertical: 2 }}
                  >
                    Use Template
                  </Button>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      );
    }
  };

  const renderCreateTemplateModal = () => (
    <Portal>
      <Modal
        visible={showCreateModal}
        onRequestClose={() => setShowCreateModal(false)}
        animationType="slide"
      >
        <BlurView intensity={95} style={{ flex: 1 }}>
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            padding: SPACING.lg,
          }}>
            <Surface style={{
              borderRadius: 20,
              padding: SPACING.lg,
              maxHeight: '85%',
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
                <Text style={[TEXT_STYLES.h3]}>Create Template 📝</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowCreateModal(false)}
                />
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: 12,
                    padding: SPACING.md,
                    marginBottom: SPACING.md,
                    fontSize: 16,
                  }}
                  placeholder="Template Name"
                  value={newTemplate.name}
                  onChangeText={(text) => setNewTemplate(prev => ({ ...prev, name: text }))}
                />
                
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: 12,
                    padding: SPACING.md,
                    marginBottom: SPACING.md,
                    fontSize: 16,
                    minHeight: 80,
                  }}
                  placeholder="Description"
                  multiline
                  value={newTemplate.description}
                  onChangeText={(text) => setNewTemplate(prev => ({ ...prev, description: text }))}
                />
                
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm, fontWeight: '600' }]}>
                  Category
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.lg }}>
                  {templateCategories.slice(1).map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => setNewTemplate(prev => ({ ...prev, category: category.id }))}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: SPACING.md,
                        paddingVertical: SPACING.sm,
                        borderRadius: 20,
                        marginRight: SPACING.sm,
                        marginBottom: SPACING.sm,
                        backgroundColor: newTemplate.category === category.id ? category.color : `${category.color}20`,
                      }}
                    >
                      <Icon
                        name={category.icon}
                        size={16}
                        color={newTemplate.category === category.id ? 'white' : category.color}
                      />
                      <Text style={{
                        marginLeft: SPACING.xs,
                        color: newTemplate.category === category.id ? 'white' : category.color,
                        fontWeight: '500',
                      }}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm, fontWeight: '600' }]}>
                  Intensity Level
                </Text>
                <View style={{ flexDirection: 'row', marginBottom: SPACING.lg }}>
                  {intensityLevels.map((level) => (
                    <TouchableOpacity
                      key={level.id}
                      onPress={() => setNewTemplate(prev => ({ ...prev, intensity: level.id }))}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: SPACING.sm,
                        marginHorizontal: SPACING.xs,
                        borderRadius: 12,
                        backgroundColor: newTemplate.intensity === level.id ? level.color : `${level.color}20`,
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{level.emoji}</Text>
                      <Text style={{
                        marginLeft: SPACING.xs,
                        color: newTemplate.intensity === level.id ? 'white' : level.color,
                        fontWeight: '500',
                      }}>
                        {level.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Button
                  mode="outlined"
                  onPress={() => Alert.alert('Feature Coming Soon', 'Exercise builder will be implemented')}
                  style={{ marginBottom: SPACING.md, borderRadius: 12 }}
                  contentStyle={{ paddingVertical: SPACING.sm }}
                  icon="add"
                >
                  Add Exercises
                </Button>
                
                <Button
                  mode="contained"
                  onPress={handleCreateTemplate}
                  style={{
                    borderRadius: 12,
                    paddingVertical: SPACING.xs,
                  }}
                  contentStyle={{ paddingVertical: SPACING.sm }}
                >
                  Create Template 🚀
                </Button>
              </ScrollView>
            </Surface>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderTemplateOptionsModal = () => (
    <Portal>
      <Modal
        visible={showTemplateModal}
        onRequestClose={() => setShowTemplateModal(false)}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setShowTemplateModal(false)}
        >
          <Surface style={{
            width: width * 0.8,
            borderRadius: 20,
            padding: SPACING.lg,
          }}>
            <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginBottom: SPACING.lg }]}>
              Template Options
            </Text>
            
            <Button
              mode="contained"
              onPress={() => {
                setShowTemplateModal(false);
                selectedTemplate && handleUseTemplate(selectedTemplate);
              }}
              style={{ marginBottom: SPACING.md, borderRadius: 12 }}
              contentStyle={{ paddingVertical: SPACING.sm }}
              icon="play-arrow"
            >
              Use Template
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => {
                setShowTemplateModal(false);
                selectedTemplate && handleEditTemplate(selectedTemplate);
              }}
              style={{ marginBottom: SPACING.md, borderRadius: 12 }}
              contentStyle={{ paddingVertical: SPACING.sm }}
              icon="edit"
            >
              Edit Template
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => {
                setShowTemplateModal(false);
                Alert.alert('Feature Coming Soon', 'Duplicate template feature will be implemented');
              }}
              style={{ marginBottom: SPACING.md, borderRadius: 12 }}
              contentStyle={{ paddingVertical: SPACING.sm }}
              icon="content-copy"
            >
              Duplicate
            </Button>
            
            <Button
              mode="text"
              onPress={() => {
                setShowTemplateModal(false);
                selectedTemplate && handleDeleteTemplate(selectedTemplate.id);
              }}
              style={{ borderRadius: 12 }}
              contentStyle={{ paddingVertical: SPACING.sm }}
              textColor={COLORS.error}
              icon="delete"
            >
              Delete Template
            </Button>
          </Surface>
        </TouchableOpacity>
      </Modal>
    </Portal>
  );

  const renderEmptyState = () => (
    <Animated.View
      entering={FadeInUp.delay(300)}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginTop: height * 0.1,
      }}
    >
      <Text style={{ fontSize: 80, marginBottom: SPACING.lg }}>📋</Text>
      <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginBottom: SPACING.md }]}>
        No Templates Found
      </Text>
      <Text style={[TEXT_STYLES.body, { textAlign: 'center', color: COLORS.textSecondary, marginBottom: SPACING.xl }]}>
        {searchQuery || selectedCategory !== 'all' 
          ? 'Try adjusting your search or filter settings'
          : 'Create your first session template to get started'
        }
      </Text>
      <Button
        mode="contained"
        onPress={() => setShowCreateModal(true)}
        style={{ borderRadius: 20 }}
        contentStyle={{ paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg }}
        icon="add"
      >
        Create Your First Template
      </Button>
    </Animated.View>
  );

  const renderQuickStats = () => (
    <Animated.View
      entering={FadeInDown.delay(250)}
      style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Surface style={{
          flex: 1,
          padding: SPACING.md,
          borderRadius: 16,
          marginRight: SPACING.sm,
          elevation: 2,
        }}>
          <View style={{ alignItems: 'center' }}>
            <Icon name="library-books" size={24} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.h2, { marginTop: SPACING.xs, color: COLORS.primary }]}>
              {sessionTemplates.length}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              Templates
            </Text>
          </View>
        </Surface>
        
        <Surface style={{
          flex: 1,
          padding: SPACING.md,
          borderRadius: 16,
          marginHorizontal: SPACING.xs,
          elevation: 2,
        }}>
          <View style={{ alignItems: 'center' }}>
            <Icon name="trending-up" size={24} color={COLORS.success} />
            <Text style={[TEXT_STYLES.h2, { marginTop: SPACING.xs, color: COLORS.success }]}>
              4.7
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              Avg Rating
            </Text>
          </View>
        </Surface>
        
        <Surface style={{
          flex: 1,
          padding: SPACING.md,
          borderRadius: 16,
          marginLeft: SPACING.sm,
          elevation: 2,
        }}>
          <View style={{ alignItems: 'center' }}>
            <Icon name="play-arrow" size={24} color={COLORS.warning} />
            <Text style={[TEXT_STYLES.h2, { marginTop: SPACING.xs, color: COLORS.warning }]}>
              69
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              Total Uses
            </Text>
          </View>
        </Surface>
      </View>
    </Animated.View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {renderHeader()}
      {renderCategoryFilter()}
      
      <ScrollView
        style={{ flex: 1 }}
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
        {renderQuickStats()}
        
        {filteredTemplates.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={{ paddingHorizontal: viewMode === 'grid' ? SPACING.lg : 0 }}>
            {viewMode === 'grid' ? (
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}>
                {filteredTemplates.map((template, index) => 
                  renderTemplateCard({ item: template, index })
                )}
              </View>
            ) : (
              <FlatList
                data={filteredTemplates}
                renderItem={renderTemplateCard}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>
      
      <FAB
        icon="add"
        onPress={() => setShowCreateModal(true)}
        style={{
          position: 'absolute',
          right: SPACING.lg,
          bottom: SPACING.xl,
          backgroundColor: COLORS.primary,
        }}
      />
      
      {renderCreateTemplateModal()}
      {renderTemplateOptionsModal()}
    </View>
  );
};

export default SessionTemplates;