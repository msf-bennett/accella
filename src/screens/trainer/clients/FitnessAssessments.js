import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  RefreshControl,
  Animated,
  Vibration,
  Dimensions,
  Platform,
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
  RadioButton,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import your established design system
import { COLORS, SPACING, TEXT_STYLES } from '../styles/theme';

const { width: screenWidth } = Dimensions.get('window');

const FitnessAssessment = ({ navigation, route }) => {
  // Redux state management
  const dispatch = useDispatch();
  const { user, clients, assessments, loading } = useSelector(state => ({
    user: state.auth.user,
    clients: state.clients.data,
    assessments: state.assessments.data,
    loading: state.assessments.loading,
  }));

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Assessment categories and tests
  const assessmentCategories = [
    {
      id: 'cardiovascular',
      name: 'Cardiovascular Fitness',
      icon: 'favorite',
      color: '#e74c3c',
      tests: [
        { id: 'resting_hr', name: 'Resting Heart Rate', unit: 'bpm', type: 'number' },
        { id: 'step_test', name: '3-Minute Step Test', unit: 'bpm', type: 'number' },
        { id: 'mile_run', name: '1-Mile Run Time', unit: 'minutes', type: 'time' },
      ]
    },
    {
      id: 'strength',
      name: 'Strength & Power',
      icon: 'fitness-center',
      color: '#3498db',
      tests: [
        { id: 'pushups', name: 'Push-ups (max)', unit: 'reps', type: 'number' },
        { id: 'plank', name: 'Plank Hold', unit: 'seconds', type: 'time' },
        { id: 'squat_jump', name: 'Vertical Jump', unit: 'inches', type: 'number' },
      ]
    },
    {
      id: 'flexibility',
      name: 'Flexibility',
      icon: 'self-improvement',
      color: '#9b59b6',
      tests: [
        { id: 'sit_reach', name: 'Sit & Reach', unit: 'inches', type: 'number' },
        { id: 'shoulder_flex', name: 'Shoulder Flexibility', unit: 'rating', type: 'rating' },
        { id: 'hip_flex', name: 'Hip Flexibility', unit: 'rating', type: 'rating' },
      ]
    },
    {
      id: 'body_composition',
      name: 'Body Composition',
      icon: 'straighten',
      color: '#f39c12',
      tests: [
        { id: 'weight', name: 'Weight', unit: 'lbs', type: 'number' },
        { id: 'body_fat', name: 'Body Fat %', unit: '%', type: 'number' },
        { id: 'muscle_mass', name: 'Muscle Mass', unit: 'lbs', type: 'number' },
      ]
    },
  ];

  const ratingOptions = [
    { label: 'Excellent', value: 5 },
    { label: 'Good', value: 4 },
    { label: 'Average', value: 3 },
    { label: 'Below Average', value: 2 },
    { label: 'Poor', value: 1 },
  ];

  // Effects
  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setTranslucent(true);
    
    // Entrance animations
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

    // Load assessments data
    loadAssessments();
  }, []);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: currentStep / assessmentCategories.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // Handlers
  const loadAssessments = useCallback(async () => {
    try {
      // Dispatch action to load assessments
      // dispatch(loadAssessmentsAction());
      console.log('Loading assessments...');
    } catch (error) {
      console.error('Error loading assessments:', error);
      Alert.alert('Error', 'Failed to load assessments. Please try again.');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAssessments();
    setRefreshing(false);
  }, [loadAssessments]);

  const startAssessment = useCallback((client) => {
    Vibration.vibrate(50);
    setSelectedClient(client);
    setCurrentStep(0);
    setAssessmentData({});
    setShowAssessmentModal(true);
  }, []);

  const handleTestInput = useCallback((categoryId, testId, value) => {
    setAssessmentData(prev => ({
      ...prev,
      [`${categoryId}_${testId}`]: value
    }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < assessmentCategories.length - 1) {
      setCurrentStep(prev => prev + 1);
      Vibration.vibrate(30);
    } else {
      completeAssessment();
    }
  }, [currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const completeAssessment = useCallback(() => {
    // Calculate scores and save assessment
    const results = calculateAssessmentResults();
    
    // Dispatch save action
    // dispatch(saveAssessmentAction({
    //   clientId: selectedClient.id,
    //   data: assessmentData,
    //   results,
    //   date: new Date().toISOString(),
    // }));

    setShowResults(true);
    Vibration.vibrate([100, 50, 100]);

    Alert.alert(
      '🎉 Assessment Complete!',
      `Great job! ${selectedClient?.name}'s fitness assessment has been completed and saved.`,
      [
        {
          text: 'View Results',
          onPress: () => {
            setShowAssessmentModal(false);
            setShowResults(false);
            // Navigate to detailed results
          }
        }
      ]
    );
  }, [assessmentData, selectedClient]);

  const calculateAssessmentResults = () => {
    // Implementation of fitness assessment scoring logic
    const scores = {};
    assessmentCategories.forEach(category => {
      let categoryScore = 0;
      let testsCompleted = 0;
      
      category.tests.forEach(test => {
        const value = assessmentData[`${category.id}_${test.id}`];
        if (value) {
          // Calculate score based on test type and value
          categoryScore += calculateTestScore(test, value);
          testsCompleted++;
        }
      });
      
      scores[category.id] = testsCompleted > 0 ? categoryScore / testsCompleted : 0;
    });
    
    return scores;
  };

  const calculateTestScore = (test, value) => {
    // Simplified scoring logic - in reality, this would use age/gender norms
    switch (test.type) {
      case 'number':
        return Math.min(Math.max((value / 100) * 5, 1), 5);
      case 'time':
        return Math.min(Math.max((300 - value) / 60, 1), 5);
      case 'rating':
        return value;
      default:
        return 3;
    }
  };

  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const renderClientCard = ({ item: client }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.md,
      }}
    >
      <Card style={{ elevation: 4, borderRadius: 12 }}>
        <Card.Content style={{ padding: SPACING.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
            <Avatar.Text 
              size={60} 
              label={client.name.charAt(0)} 
              style={{ backgroundColor: COLORS.primary }}
            />
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.text.primary }]}>
                {client.name}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                Age: {client.age} • Sport: {client.sport}
              </Text>
              <View style={{ flexDirection: 'row', marginTop: SPACING.xs }}>
                <Chip 
                  mode="outlined" 
                  compact
                  style={{ marginRight: SPACING.xs }}
                >
                  Last Assessment: {client.lastAssessment || 'Never'}
                </Chip>
              </View>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button
              mode="contained"
              onPress={() => startAssessment(client)}
              style={{ flex: 1, marginRight: SPACING.sm }}
              icon="assessment"
              contentStyle={{ paddingVertical: SPACING.xs }}
            >
              New Assessment
            </Button>
            <IconButton
              icon="history"
              size={24}
              onPress={() => {
                Alert.alert('Feature Coming Soon', 'Assessment history will be available in the next update!');
              }}
              style={{ backgroundColor: COLORS.surface }}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderAssessmentStep = () => {
    const category = assessmentCategories[currentStep];
    
    return (
      <View style={{ flex: 1 }}>
        <LinearGradient
          colors={[category.color + '20', category.color + '10']}
          style={{
            padding: SPACING.lg,
            borderRadius: 12,
            marginBottom: SPACING.lg,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
            <MaterialIcons name={category.icon} size={32} color={category.color} />
            <Text style={[TEXT_STYLES.h2, { marginLeft: SPACING.md, color: category.color }]}>
              {category.name}
            </Text>
          </View>
          <Text style={[TEXT_STYLES.body, { color: COLORS.text.secondary }]}>
            Complete the following tests for {selectedClient?.name}
          </Text>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false}>
          {category.tests.map((test, index) => (
            <Card key={test.id} style={{ marginBottom: SPACING.md, elevation: 2 }}>
              <Card.Content style={{ padding: SPACING.lg }}>
                <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.sm }]}>
                  {test.name}
                </Text>
                
                {test.type === 'rating' ? (
                  <View>
                    <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.md }]}>
                      Rate the performance level:
                    </Text>
                    <RadioButton.Group
                      onValueChange={(value) => handleTestInput(category.id, test.id, parseInt(value))}
                      value={assessmentData[`${category.id}_${test.id}`]?.toString() || ''}
                    >
                      {ratingOptions.map((option) => (
                        <View key={option.value} style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <RadioButton value={option.value.toString()} />
                          <Text style={TEXT_STYLES.body}>{option.label}</Text>
                        </View>
                      ))}
                    </RadioButton.Group>
                  </View>
                ) : (
                  <TextInput
                    mode="outlined"
                    label={`Enter ${test.name.toLowerCase()}`}
                    right={<TextInput.Affix text={test.unit} />}
                    value={assessmentData[`${category.id}_${test.id}`]?.toString() || ''}
                    onChangeText={(value) => handleTestInput(category.id, test.id, value)}
                    keyboardType={test.type === 'number' ? 'numeric' : 'default'}
                    style={{ marginBottom: SPACING.sm }}
                  />
                )}
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: SPACING.lg }}>
          <IconButton
            icon="arrow-back"
            size={24}
            iconColor="white"
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.h1, { color: 'white', flex: 1, marginLeft: SPACING.sm }]}>
            Fitness Assessment 📊
          </Text>
          <IconButton
            icon="add"
            size={24}
            iconColor="white"
            onPress={() => {
              Alert.alert('Feature Coming Soon', 'Custom assessment templates will be available soon!');
            }}
          />
        </View>
      </LinearGradient>

      <View style={{ flex: 1, padding: SPACING.lg }}>
        <Searchbar
          placeholder="Search clients..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ marginBottom: SPACING.lg, elevation: 2 }}
          icon="search"
        />

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
          {filteredClients.length > 0 ? (
            filteredClients.map((client, index) => (
              <View key={client.id}>
                {renderClientCard({ item: client })}
              </View>
            ))
          ) : (
            <Surface style={{ 
              padding: SPACING.xl, 
              borderRadius: 12, 
              alignItems: 'center',
              marginTop: SPACING.xl 
            }}>
              <MaterialIcons name="search-off" size={64} color={COLORS.text.secondary} />
              <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md, textAlign: 'center' }]}>
                No Clients Found
              </Text>
              <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.sm }]}>
                {searchQuery ? 'Try adjusting your search terms' : 'Add clients to start assessments'}
              </Text>
            </Surface>
          )}
        </ScrollView>
      </View>

      {/* Assessment Modal */}
      <Portal>
        <Modal
          visible={showAssessmentModal}
          onDismiss={() => setShowAssessmentModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.background,
            margin: SPACING.lg,
            borderRadius: 12,
            flex: 1,
            maxHeight: '90%',
          }}
        >
          <View style={{ flex: 1, padding: SPACING.lg }}>
            {/* Progress Header */}
            <View style={{ marginBottom: SPACING.lg }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                <Text style={TEXT_STYLES.h3}>
                  Step {currentStep + 1} of {assessmentCategories.length}
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowAssessmentModal(false)}
                />
              </View>
              <Animated.View>
                <ProgressBar 
                  progress={progressAnim}
                  color={COLORS.primary}
                  style={{ height: 6, borderRadius: 3 }}
                />
              </Animated.View>
            </View>

            {/* Assessment Content */}
            {renderAssessmentStep()}

            {/* Navigation Buttons */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              marginTop: SPACING.lg,
              paddingTop: SPACING.lg,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
            }}>
              <Button
                mode="outlined"
                onPress={previousStep}
                disabled={currentStep === 0}
                style={{ flex: 1, marginRight: SPACING.sm }}
              >
                Previous
              </Button>
              <Button
                mode="contained"
                onPress={nextStep}
                style={{ flex: 1, marginLeft: SPACING.sm }}
              >
                {currentStep === assessmentCategories.length - 1 ? 'Complete' : 'Next'}
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="assessment"
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => {
          Alert.alert(
            'Quick Assessment',
            'Start a quick assessment for all clients?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Start', onPress: () => console.log('Quick assessment started') }
            ]
          );
        }}
      />
    </View>
  );
};

export default FitnessAssessment;