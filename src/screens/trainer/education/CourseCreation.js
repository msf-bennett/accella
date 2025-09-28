import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
  Vibration,
  KeyboardAvoidingView,
  Platform,
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
  Modal,
  ProgressBar,
  TextInput,
  Divider,
  Switch,
  RadioButton,
  Checkbox,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#FF6B6B',
  creator: '#9C27B0',
  content: '#FF5722',
  publish: '#4CAF50',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheader: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  input: {
    fontSize: 16,
    color: COLORS.text,
  },
};

const { width, height } = Dimensions.get('window');

const CourseCreation = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  
  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Course Data
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    duration: '',
    price: '',
    isPaid: false,
    tags: [],
    modules: [],
    requirements: [],
    objectives: [],
    targetAudience: '',
    language: 'english',
    certificateEnabled: false,
    publishStatus: 'draft',
  });

  // UI States
  const [createdCourses, setCreatedCourses] = useState([
    {
      id: 'c1',
      title: 'Advanced HIIT Training Certification',
      description: 'Complete guide to High-Intensity Interval Training',
      category: 'Strength Training',
      difficulty: 'advanced',
      modules: 12,
      students: 145,
      revenue: 2850,
      status: 'published',
      rating: 4.8,
      lastUpdated: '2024-08-15',
    },
    {
      id: 'c2',
      title: 'Functional Movement Basics',
      description: 'Foundation course for movement assessment',
      category: 'Movement',
      difficulty: 'beginner',
      modules: 8,
      students: 89,
      revenue: 1245,
      status: 'published',
      rating: 4.6,
      lastUpdated: '2024-08-10',
    },
    {
      id: 'c3',
      title: 'Nutrition for Athletes',
      description: 'Sports nutrition fundamentals',
      category: 'Nutrition',
      difficulty: 'intermediate',
      modules: 6,
      students: 0,
      revenue: 0,
      status: 'draft',
      rating: 0,
      lastUpdated: '2024-08-18',
    },
  ]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Course Templates
  const courseTemplates = [
    {
      id: 'strength',
      name: 'Strength Training Course',
      description: 'Perfect for resistance training and powerlifting courses',
      icon: '💪',
      color: COLORS.error,
      modules: ['Introduction', 'Exercise Selection', 'Programming', 'Advanced Techniques', 'Assessment'],
      duration: '6-8 weeks',
      targetAudience: 'Beginner to Advanced',
    },
    {
      id: 'cardio',
      name: 'Cardiovascular Training',
      description: 'For aerobic fitness and endurance training courses',
      icon: '❤️',
      color: COLORS.accent,
      modules: ['Cardio Basics', 'Training Zones', 'Program Design', 'Monitoring', 'Special Populations'],
      duration: '4-6 weeks',
      targetAudience: 'All Levels',
    },
    {
      id: 'nutrition',
      name: 'Nutrition & Wellness',
      description: 'Comprehensive nutrition education courses',
      icon: '🥗',
      color: COLORS.success,
      modules: ['Nutrition Fundamentals', 'Macronutrients', 'Meal Planning', 'Supplements', 'Special Diets'],
      duration: '8-10 weeks',
      targetAudience: 'Beginner to Intermediate',
    },
    {
      id: 'movement',
      name: 'Movement & Mobility',
      description: 'Functional movement and flexibility courses',
      icon: '🤸',
      color: COLORS.creator,
      modules: ['Movement Assessment', 'Mobility Exercises', 'Corrective Strategies', 'Program Integration'],
      duration: '5-7 weeks',
      targetAudience: 'All Levels',
    },
    {
      id: 'mindset',
      name: 'Mental Performance',
      description: 'Psychology and mindset training courses',
      icon: '🧠',
      color: COLORS.warning,
      modules: ['Goal Setting', 'Motivation', 'Stress Management', 'Mental Toughness', 'Habit Formation'],
      duration: '4-6 weeks',
      targetAudience: 'All Levels',
    },
  ];

  const courseCategories = [
    'Strength Training', 'Cardio', 'Yoga', 'Pilates', 'Nutrition', 
    'Movement', 'Rehabilitation', 'Sports Performance', 'Mental Health'
  ];

  useEffect(() => {
    // Initialize animations
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
      Animated.timing(progressAnim, {
        toValue: currentStep / 6,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [currentStep]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
    Vibration.vibrate(50);
  }, []);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCourseData({
      ...courseData,
      category: template.name,
      modules: template.modules.map((title, index) => ({
        id: `mod_${index}`,
        title,
        duration: '45 min',
        content: '',
        videos: [],
        assignments: [],
        completed: false,
      })),
    });
    setCurrentStep(2);
    Vibration.vibrate(50);
  };

  const updateCourseData = (field, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addTag = (tag) => {
    if (tag && !courseData.tags.includes(tag)) {
      updateCourseData('tags', [...courseData.tags, tag]);
    }
  };

  const removeTag = (tagToRemove) => {
    updateCourseData('tags', courseData.tags.filter(tag => tag !== tagToRemove));
  };

  const addModule = () => {
    const newModule = {
      id: `mod_${Date.now()}`,
      title: `Module ${courseData.modules.length + 1}`,
      duration: '45 min',
      content: '',
      videos: [],
      assignments: [],
      completed: false,
    };
    updateCourseData('modules', [...courseData.modules, newModule]);
  };

  const saveDraft = () => {
    Alert.alert(
      '💾 Draft Saved',
      'Your course has been saved as a draft. You can continue editing anytime.',
      [{ text: 'Continue Editing', onPress: () => {} }]
    );
    Vibration.vibrate(50);
  };

  const publishCourse = () => {
    Alert.alert(
      '🚀 Publish Course',
      'Your course will be reviewed and made available to students. This process typically takes 24-48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish! 🎉',
          onPress: () => {
            updateCourseData('publishStatus', 'under_review');
            navigation.goBack();
          },
        },
      ]
    );
  };

  const previewCourse = () => {
    setShowPreview(true);
    setModalVisible(true);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.warning;
      case 'advanced': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return COLORS.success;
      case 'draft': return COLORS.warning;
      case 'under_review': return COLORS.primary;
      default: return COLORS.textSecondary;
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.creator, COLORS.content]}
      style={{
        padding: SPACING.lg,
        paddingTop: StatusBar.currentHeight + SPACING.lg,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={[TEXT_STYLES.header, { color: 'white', marginBottom: SPACING.xs }]}>
            🎓 Course Studio
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
            Create & monetize your expertise
          </Text>
        </View>
        <Surface style={{ borderRadius: 20, padding: SPACING.md }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.creator }]}>Active Courses</Text>
            <Text style={[TEXT_STYLES.subheader, { color: COLORS.creator }]}>
              {createdCourses.filter(c => c.status === 'published').length}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>
              ${createdCourses.reduce((sum, c) => sum + c.revenue, 0)} earned
            </Text>
          </View>
        </Surface>
      </View>

      {currentStep > 1 && (
        <View style={{ marginTop: SPACING.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Course Creation Progress
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Step {currentStep} of 6
            </Text>
          </View>
          <Animated.View>
            <ProgressBar
              progress={progressAnim}
              color="rgba(255,255,255,0.9)"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 }}
            />
          </Animated.View>
        </View>
      )}
    </LinearGradient>
  );

  const renderStepNavigation = () => (
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      padding: SPACING.md,
      backgroundColor: COLORS.surface,
      elevation: 2,
    }}>
      <Button
        mode="outlined"
        onPress={() => setCurrentStep(Math.max(1, currentStep - 1))}
        disabled={currentStep === 1}
        icon="arrow-back"
      >
        Back
      </Button>
      
      <Button
        mode="outlined"
        onPress={saveDraft}
        icon="save"
        buttonColor={COLORS.warning}
      >
        Save Draft
      </Button>

      <Button
        mode="contained"
        onPress={() => {
          if (currentStep < 6) {
            setCurrentStep(currentStep + 1);
          } else {
            publishCourse();
          }
        }}
        icon={currentStep === 6 ? "publish" : "arrow-forward"}
        buttonColor={currentStep === 6 ? COLORS.publish : COLORS.primary}
      >
        {currentStep === 6 ? 'Publish' : 'Next'}
      </Button>
    </View>
  );

  const renderStep1_Templates = () => (
    <ScrollView style={{ flex: 1, padding: SPACING.md }}>
      <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md, textAlign: 'center' }]}>
        🚀 Choose Your Course Template
      </Text>
      <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginBottom: SPACING.lg }]}>
        Start with a professionally designed template or build from scratch
      </Text>

      {courseTemplates.map((template, index) => (
        <Animated.View
          key={template.id}
          style={{
            opacity: fadeAnim,
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50 * (index + 1), 0],
              })
            }],
            marginBottom: SPACING.md,
          }}
        >
          <TouchableOpacity onPress={() => handleTemplateSelect(template)}>
            <Card style={{ elevation: 3 }}>
              <LinearGradient
                colors={[template.color + '20', 'transparent']}
                style={{ padding: SPACING.lg }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                  <Text style={{ fontSize: 32, marginRight: SPACING.md }}>{template.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={TEXT_STYLES.subheader}>{template.name}</Text>
                    <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
                      {template.description}
                    </Text>
                  </View>
                  <Icon name="arrow-forward-ios" size={20} color={template.color} />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                  <View>
                    <Text style={[TEXT_STYLES.caption, { color: template.color }]}>Duration</Text>
                    <Text style={TEXT_STYLES.body}>{template.duration}</Text>
                  </View>
                  <View>
                    <Text style={[TEXT_STYLES.caption, { color: template.color }]}>Modules</Text>
                    <Text style={TEXT_STYLES.body}>{template.modules.length} modules</Text>
                  </View>
                  <View>
                    <Text style={[TEXT_STYLES.caption, { color: template.color }]}>Audience</Text>
                    <Text style={TEXT_STYLES.body}>{template.targetAudience}</Text>
                  </View>
                </View>

                <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>Included Modules:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {template.modules.slice(0, 3).map((module, idx) => (
                    <Chip
                      key={idx}
                      style={{
                        marginRight: SPACING.xs,
                        marginBottom: SPACING.xs,
                        backgroundColor: template.color + '30',
                      }}
                      textStyle={{ fontSize: 11, color: template.color }}
                    >
                      {module}
                    </Chip>
                  ))}
                  {template.modules.length > 3 && (
                    <Chip
                      style={{
                        marginRight: SPACING.xs,
                        marginBottom: SPACING.xs,
                        backgroundColor: template.color,
                      }}
                      textStyle={{ fontSize: 11, color: 'white' }}
                    >
                      +{template.modules.length - 3} more
                    </Chip>
                  )}
                </View>
              </LinearGradient>
            </Card>
          </TouchableOpacity>
        </Animated.View>
      ))}

      <TouchableOpacity onPress={() => setCurrentStep(2)}>
        <Card style={{ elevation: 2, marginTop: SPACING.md }}>
          <Card.Content style={{ alignItems: 'center', padding: SPACING.lg }}>
            <Icon name="add-circle-outline" size={48} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.subheader, { marginTop: SPACING.sm, color: COLORS.primary }]}>
              Start from Scratch
            </Text>
            <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.xs }]}>
              Build your course completely custom
            </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderStep2_BasicInfo = () => (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={{ flex: 1, padding: SPACING.md }}>
        <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
          📝 Course Information
        </Text>

        <Surface style={{ padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.md }}>
          <TextInput
            label="Course Title *"
            value={courseData.title}
            onChangeText={(text) => updateCourseData('title', text)}
            mode="outlined"
            style={{ marginBottom: SPACING.md }}
            outlineColor={COLORS.primary}
            activeOutlineColor={COLORS.creator}
          />

          <TextInput
            label="Course Description *"
            value={courseData.description}
            onChangeText={(text) => updateCourseData('description', text)}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={{ marginBottom: SPACING.md }}
            outlineColor={COLORS.primary}
            activeOutlineColor={COLORS.creator}
          />

          <TextInput
            label="Target Audience"
            value={courseData.targetAudience}
            onChangeText={(text) => updateCourseData('targetAudience', text)}
            mode="outlined"
            style={{ marginBottom: SPACING.md }}
            outlineColor={COLORS.primary}
            activeOutlineColor={COLORS.creator}
            placeholder="e.g., Personal trainers, fitness enthusiasts..."
          />
        </Surface>

        <Surface style={{ padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>Course Settings</Text>
          
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Difficulty Level</Text>
          <View style={{ marginBottom: SPACING.md }}>
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => updateCourseData('difficulty', level)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: SPACING.xs,
                }}
              >
                <RadioButton
                  value={level}
                  status={courseData.difficulty === level ? 'checked' : 'unchecked'}
                  onPress={() => updateCourseData('difficulty', level)}
                  color={getDifficultyColor(level)}
                />
                <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, textTransform: 'capitalize' }]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md }}>
            <Text style={TEXT_STYLES.body}>Enable Certificate</Text>
            <Switch
              value={courseData.certificateEnabled}
              onValueChange={(value) => updateCourseData('certificateEnabled', value)}
              color={COLORS.creator}
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={TEXT_STYLES.body}>Paid Course</Text>
            <Switch
              value={courseData.isPaid}
              onValueChange={(value) => updateCourseData('isPaid', value)}
              color={COLORS.success}
            />
          </View>

          {courseData.isPaid && (
            <TextInput
              label="Course Price ($)"
              value={courseData.price}
              onChangeText={(text) => updateCourseData('price', text)}
              mode="outlined"
              keyboardType="numeric"
              style={{ marginTop: SPACING.md }}
              outlineColor={COLORS.primary}
              activeOutlineColor={COLORS.success}
            />
          )}
        </Surface>

        <Surface style={{ padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.xl }}>
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {courseCategories.map((category) => (
              <Chip
                key={category}
                selected={courseData.category === category}
                onPress={() => updateCourseData('category', category)}
                style={{
                  marginRight: SPACING.sm,
                  backgroundColor: courseData.category === category ? COLORS.creator : COLORS.background,
                }}
                textStyle={{
                  color: courseData.category === category ? 'white' : COLORS.text,
                }}
              >
                {category}
              </Chip>
            ))}
          </ScrollView>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderCurrentCourses = () => (
    <ScrollView 
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.creator]}
          tintColor={COLORS.creator}
        />
      }
    >
      <View style={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
          <Text style={TEXT_STYLES.subheader}>My Courses</Text>
          <Chip
            icon="add"
            onPress={() => setCurrentStep(1)}
            style={{ backgroundColor: COLORS.creator }}
            textStyle={{ color: 'white' }}
          >
            New Course
          </Chip>
        </View>

        {createdCourses.map((course, index) => (
          <Animated.View
            key={course.id}
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginBottom: SPACING.md,
            }}
          >
            <Card style={{ elevation: 3 }}>
              <Card.Content style={{ padding: SPACING.lg }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm }}>
                  <View style={{ flex: 1 }}>
                    <Text style={TEXT_STYLES.subheader}>{course.title}</Text>
                    <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
                      {course.description}
                    </Text>
                  </View>
                  <Chip
                    style={{ backgroundColor: getStatusColor(course.status) }}
                    textStyle={{ color: 'white', fontSize: 10 }}
                  >
                    {course.status.replace('_', ' ').toUpperCase()}
                  </Chip>
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm }}>
                  <Chip
                    icon="school"
                    style={{
                      backgroundColor: getDifficultyColor(course.difficulty),
                      marginRight: SPACING.xs,
                      marginBottom: SPACING.xs,
                    }}
                    textStyle={{ color: 'white', fontSize: 10 }}
                  >
                    {course.difficulty}
                  </Chip>
                  <Chip
                    icon="category"
                    style={{
                      backgroundColor: COLORS.background,
                      marginRight: SPACING.xs,
                      marginBottom: SPACING.xs,
                    }}
                    textStyle={{ fontSize: 10 }}
                  >
                    {course.category}
                  </Chip>
                  <Chip
                    icon="book"
                    style={{
                      backgroundColor: COLORS.background,
                      marginBottom: SPACING.xs,
                    }}
                    textStyle={{ fontSize: 10 }}
                  >
                    {course.modules} modules
                  </Chip>
                </View>

                <Divider style={{ marginVertical: SPACING.sm }} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>Students</Text>
                    <Text style={TEXT_STYLES.subheader}>{course.students}</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>Revenue</Text>
                    <Text style={[TEXT_STYLES.subheader, { color: COLORS.success }]}>
                      ${course.revenue}
                    </Text>
                  </View>
                  {course.rating > 0 && (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.warning }]}>Rating</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="star" size={16} color={COLORS.warning} />
                        <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.xs }]}>
                          {course.rating}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      Alert.alert(
                        '📊 Course Analytics',
                        'View detailed analytics including student engagement, completion rates, revenue trends, and feedback analysis.',
                        [{ text: 'Open Analytics! 📈', onPress: () => navigation.navigate('CourseAnalytics', { courseId: course.id }) }]
                      );
                    }}
                    icon="analytics"
                    compact
                  >
                    Analytics
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      Alert.alert(
                        '✏️ Edit Course',
                        'Edit course content, modules, pricing, and settings. Changes will be reviewed before publishing.',
                        [{ text: 'Start Editing! 🎨', onPress: () => navigation.navigate('CourseEditor', { courseId: course.id }) }]
                      );
                    }}
                    icon="edit"
                    buttonColor={COLORS.creator}
                    compact
                  >
                    Edit
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );

  const renderStep3_Modules = () => (
    <ScrollView style={{ flex: 1, padding: SPACING.md }}>
      <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
        📚 Course Modules
      </Text>

      {courseData.modules.map((module, index) => (
        <Card key={module.id} style={{ marginBottom: SPACING.md, elevation: 2 }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Text style={[TEXT_STYLES.body, { flex: 1 }]}>Module {index + 1}</Text>
              <IconButton
                icon="delete"
                iconColor={COLORS.error}
                size={20}
                onPress={() => {
                  updateCourseData('modules', courseData.modules.filter((_, i) => i !== index));
                }}
              />
            </View>
            <TextInput
              value={module.title}
              onChangeText={(text) => {
                const updatedModules = [...courseData.modules];
                updatedModules[index].title = text;
                updateCourseData('modules', updatedModules);
              }}
              mode="outlined"
              label="Module Title"
              style={{ marginBottom: SPACING.sm }}
            />
            <TextInput
              value={module.duration}
              onChangeText={(text) => {
                const updatedModules = [...courseData.modules];
                updatedModules[index].duration = text;
                updateCourseData('modules', updatedModules);
              }}
              mode="outlined"
              label="Duration"
              style={{ marginBottom: SPACING.sm }}
            />
          </Card.Content>
        </Card>
      ))}

      <Button
        mode="outlined"
        onPress={addModule}
        icon="add"
        style={{ marginTop: SPACING.md }}
        buttonColor={COLORS.creator}
      >
        Add Module
      </Button>
    </ScrollView>
  );

  const renderStep4_Content = () => (
    <ScrollView style={{ flex: 1, padding: SPACING.md }}>
      <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
        🎥 Content & Media
      </Text>

      <Surface style={{ padding: SPACING.lg, borderRadius: 12, marginBottom: SPACING.md }}>
        <View style={{ alignItems: 'center' }}>
          <Icon name="cloud-upload" size={48} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.subheader, { marginTop: SPACING.sm }]}>Upload Course Materials</Text>
          <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
            Add videos, PDFs, presentations, and other learning materials
          </Text>
          <Button
            mode="contained"
            onPress={() => {
              Alert.alert(
                '📁 Media Upload',
                'Upload feature will allow you to add videos, documents, images, and interactive content to your course modules.',
                [{ text: 'Got it! 📤', onPress: () => {} }]
              );
            }}
            icon="upload"
            style={{ marginTop: SPACING.md }}
            buttonColor={COLORS.content}
          >
            Choose Files
          </Button>
        </View>
      </Surface>

      <Surface style={{ padding: SPACING.md, borderRadius: 12 }}>
        <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>Content Types to Include:</Text>
        {[
          'Video Lessons',
          'PDF Workbooks', 
          'Interactive Quizzes',
          'Downloadable Resources',
          'Live Session Links',
          'Assignment Templates'
        ].map((type) => (
          <View key={type} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
            <Checkbox
              status="unchecked"
              onPress={() => {}}
              color={COLORS.content}
            />
            <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>{type}</Text>
          </View>
        ))}
      </Surface>
    </ScrollView>
  );

  const renderStep5_Pricing = () => (
    <ScrollView style={{ flex: 1, padding: SPACING.md }}>
      <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
        💰 Pricing & Monetization
      </Text>

      <Surface style={{ padding: SPACING.lg, borderRadius: 12, marginBottom: SPACING.md }}>
        <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>Course Pricing Model</Text>
        
        {[
          { id: 'free', label: 'Free Course', desc: 'Build your audience and credibility' },
          { id: 'one-time', label: 'One-time Payment', desc: 'Students pay once for lifetime access' },
          { id: 'subscription', label: 'Monthly Subscription', desc: 'Recurring revenue model' },
        ].map((model) => (
          <TouchableOpacity
            key={model.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: SPACING.sm,
              paddingHorizontal: SPACING.md,
              borderRadius: 8,
              marginBottom: SPACING.sm,
              backgroundColor: courseData.isPaid === (model.id !== 'free') ? COLORS.primary + '20' : 'transparent',
            }}
          >
            <RadioButton
              value={model.id}
              status={courseData.isPaid === (model.id !== 'free') ? 'checked' : 'unchecked'}
              onPress={() => updateCourseData('isPaid', model.id !== 'free')}
              color={COLORS.success}
            />
            <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
              <Text style={TEXT_STYLES.body}>{model.label}</Text>
              <Text style={TEXT_STYLES.caption}>{model.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {courseData.isPaid && (
          <TextInput
            label="Course Price ($)"
            value={courseData.price}
            onChangeText={(text) => updateCourseData('price', text)}
            mode="outlined"
            keyboardType="numeric"
            style={{ marginTop: SPACING.md }}
            left={<TextInput.Icon icon="attach-money" />}
          />
        )}
      </Surface>

      <Surface style={{ padding: SPACING.md, borderRadius: 12 }}>
        <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>Revenue Sharing</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={TEXT_STYLES.subheader}>You Keep: 70%</Text>
            <Text style={TEXT_STYLES.caption}>Platform takes 30%</Text>
          </View>
          <Icon name="trending-up" size={32} color={COLORS.success} />
        </View>
      </Surface>
    </ScrollView>
  );

  const renderStep6_Review = () => (
    <ScrollView style={{ flex: 1, padding: SPACING.md }}>
      <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
        🔍 Review & Publish
      </Text>

      <Surface style={{ padding: SPACING.lg, borderRadius: 12, marginBottom: SPACING.md }}>
        <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>Course Summary</Text>
        <View style={{ marginBottom: SPACING.sm }}>
          <Text style={TEXT_STYLES.caption}>Title</Text>
          <Text style={TEXT_STYLES.body}>{courseData.title || 'Untitled Course'}</Text>
        </View>
        <View style={{ marginBottom: SPACING.sm }}>
          <Text style={TEXT_STYLES.caption}>Category</Text>
          <Text style={TEXT_STYLES.body}>{courseData.category || 'No category'}</Text>
        </View>
        <View style={{ marginBottom: SPACING.sm }}>
          <Text style={TEXT_STYLES.caption}>Modules</Text>
          <Text style={TEXT_STYLES.body}>{courseData.modules.length} modules</Text>
        </View>
        <View>
          <Text style={TEXT_STYLES.caption}>Price</Text>
          <Text style={[TEXT_STYLES.body, { color: COLORS.success }]}>
            {courseData.isPaid ? `${courseData.price || '0'}` : 'Free'}
          </Text>
        </View>
      </Surface>

      <Button
        mode="contained"
        onPress={previewCourse}
        icon="preview"
        style={{ marginBottom: SPACING.md }}
        buttonColor={COLORS.primary}
      >
        Preview Course
      </Button>

      <Surface style={{ padding: SPACING.md, borderRadius: 12 }}>
        <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>Publishing Checklist:</Text>
        {[
          'Course title and description ✅',
          'At least 3 modules ✅',
          'Pricing information ✅',
          'Course materials uploaded',
          'Preview video recorded',
        ].map((item, index) => (
          <Text key={index} style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>
            • {item}
          </Text>
        ))}
      </Surface>
    </ScrollView>
  );

  const renderPreviewModal = () => (
    <Portal>
      <Modal
        visible={modalVisible && showPreview}
        onDismiss={() => {
          setModalVisible(false);
          setShowPreview(false);
        }}
        contentContainerStyle={{
          backgroundColor: COLORS.surface,
          margin: SPACING.lg,
          borderRadius: 16,
          maxHeight: height * 0.8,
        }}
      >
        <ScrollView style={{ padding: SPACING.lg }}>
          <Text style={[TEXT_STYLES.header, { textAlign: 'center', marginBottom: SPACING.lg }]}>
            Course Preview
          </Text>
          
          <Surface style={{ padding: SPACING.lg, borderRadius: 12, marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.sm }]}>
              {courseData.title}
            </Text>
            <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.md }]}>
              {courseData.description}
            </Text>
            
            <View style={{ flexDirection: 'row', marginBottom: SPACING.md }}>
              <Chip
                style={{ backgroundColor: getDifficultyColor(courseData.difficulty), marginRight: SPACING.sm }}
                textStyle={{ color: 'white' }}
              >
                {courseData.difficulty}
              </Chip>
              <Chip style={{ backgroundColor: COLORS.background }}>
                {courseData.modules.length} modules
              </Chip>
            </View>

            <Text style={[TEXT_STYLES.body, { color: COLORS.success, fontWeight: 'bold' }]}>
              {courseData.isPaid ? `${courseData.price}` : 'Free Course'}
            </Text>
          </Surface>

          <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.sm }]}>Course Modules</Text>
          {courseData.modules.map((module, index) => (
            <Surface key={module.id} style={{ padding: SPACING.md, marginBottom: SPACING.sm, borderRadius: 8 }}>
              <Text style={TEXT_STYLES.body}>
                {index + 1}. {module.title}
              </Text>
              <Text style={TEXT_STYLES.caption}>Duration: {module.duration}</Text>
            </Surface>
          ))}

          <Button
            mode="contained"
            onPress={() => {
              setModalVisible(false);
              setShowPreview(false);
            }}
            style={{ marginTop: SPACING.lg }}
          >
            Close Preview
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1_Templates();
      case 2: return renderStep2_BasicInfo();
      case 3: return renderStep3_Modules();
      case 4: return renderStep4_Content();
      case 5: return renderStep5_Pricing();
      case 6: return renderStep6_Review();
      default: return renderCurrentCourses();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      
      {currentStep > 0 ? (
        <>
          {renderCurrentStep()}
          {renderStepNavigation()}
        </>
      ) : (
        renderCurrentCourses()
      )}
      
      {renderPreviewModal()}

      {currentStep === 0 && (
        <FAB
          icon="add"
          style={{
            position: 'absolute',
            margin: SPACING.lg,
            right: 0,
            bottom: 80,
            backgroundColor: COLORS.creator,
          }}
          color="white"
          onPress={() => setCurrentStep(1)}
        />
      )}
    </View>
  );
};

export default CourseCreation;