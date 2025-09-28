import React, { useState, useEffect, useCallback } from 'react';
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
  TextInput,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  IconButton,
  Portal,
  Modal,
  RadioButton,
  Checkbox,
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
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
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const { width } = Dimensions.get('window');

const InjuryReporting = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { sessionId, exerciseId } = route.params || {};
  
  // Redux state
  const user = useSelector(state => state.auth.user);
  const userInjuries = useSelector(state => state.injuries.userInjuries || []);
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showBodyMap, setShowBodyMap] = useState(false);
  const [animatedValues] = useState({
    fadeIn: new Animated.Value(0),
    slideIn: new Animated.Value(50),
    stepProgress: new Animated.Value(0),
  });

  // Injury report form data
  const [injuryReport, setInjuryReport] = useState({
    bodyPart: '',
    injuryType: '',
    severity: '',
    description: '',
    whenOccurred: '',
    activityAtTime: '',
    previousInjury: false,
    symptoms: [],
    painLevel: 0,
    immediateAction: '',
    needsMedicalAttention: false,
    canContinueTraining: null,
    photos: [],
  });

  // Form options
  const injuryTypes = [
    { id: 'strain', label: '🔴 Muscle Strain', description: 'Overstretched or torn muscle fibers' },
    { id: 'sprain', label: '🟡 Sprain', description: 'Stretched or torn ligaments' },
    { id: 'bruise', label: '🟣 Bruise/Contusion', description: 'Impact injury causing bleeding under skin' },
    { id: 'cut', label: '🩸 Cut/Laceration', description: 'Break in the skin' },
    { id: 'fracture', label: '💀 Fracture', description: 'Broken or cracked bone' },
    { id: 'dislocation', label: '🔄 Dislocation', description: 'Joint forced out of position' },
    { id: 'overuse', label: '⚡ Overuse Injury', description: 'Repetitive stress injury' },
    { id: 'other', label: '❓ Other', description: 'Different type of injury' },
  ];

  const severityLevels = [
    { value: 'mild', label: '🟢 Mild', description: 'Minor discomfort, can continue activity' },
    { value: 'moderate', label: '🟡 Moderate', description: 'Noticeable pain, should modify activity' },
    { value: 'severe', label: '🔴 Severe', description: 'Significant pain, stop activity immediately' },
    { value: 'critical', label: '🚨 Critical', description: 'Emergency medical attention needed' },
  ];

  const bodyParts = [
    { id: 'head', label: '🧠 Head/Neck', icon: 'psychology' },
    { id: 'shoulder', label: '🤲 Shoulder', icon: 'back-hand' },
    { id: 'arm', label: '💪 Arm/Elbow', icon: 'fitness-center' },
    { id: 'wrist', label: '✋ Wrist/Hand', icon: 'pan-tool' },
    { id: 'chest', label: '🫁 Chest', icon: 'favorite' },
    { id: 'back', label: '🏃‍♂️ Back/Spine', icon: 'accessibility' },
    { id: 'core', label: '🎯 Core/Abs', icon: 'center-focus-strong' },
    { id: 'hip', label: '🍑 Hip/Glutes', icon: 'self-improvement' },
    { id: 'thigh', label: '🦵 Thigh', icon: 'directions-walk' },
    { id: 'knee', label: '🦴 Knee', icon: 'accessibility-new' },
    { id: 'calf', label: '🏃 Calf/Shin', icon: 'directions-run' },
    { id: 'ankle', label: '🦶 Ankle/Foot', icon: 'hiking' },
  ];

  const symptoms = [
    { id: 'pain', label: '😣 Pain' },
    { id: 'swelling', label: '💨 Swelling' },
    { id: 'bruising', label: '🟣 Bruising' },
    { id: 'stiffness', label: '🔒 Stiffness' },
    { id: 'weakness', label: '📉 Weakness' },
    { id: 'numbness', label: '😴 Numbness' },
    { id: 'tingling', label: '⚡ Tingling' },
    { id: 'instability', label: '🌊 Instability' },
  ];

  const totalSteps = 5;

  useEffect(() => {
    // Initialize animations
    Animated.parallel([
      Animated.timing(animatedValues.fadeIn, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues.slideIn, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    updateStepProgress();
  }, []);

  useEffect(() => {
    updateStepProgress();
  }, [currentStep]);

  const updateStepProgress = () => {
    Animated.timing(animatedValues.stepProgress, {
      toValue: (currentStep - 1) / (totalSteps - 1),
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        Vibration.vibrate(50);
      } else {
        handleSubmitReport();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!injuryReport.bodyPart) {
          Alert.alert('Required Field', 'Please select the injured body part.');
          return false;
        }
        break;
      case 2:
        if (!injuryReport.injuryType || !injuryReport.severity) {
          Alert.alert('Required Fields', 'Please select injury type and severity level.');
          return false;
        }
        break;
      case 3:
        if (!injuryReport.description.trim()) {
          Alert.alert('Required Field', 'Please provide a description of the injury.');
          return false;
        }
        break;
      case 4:
        if (!injuryReport.whenOccurred || injuryReport.canContinueTraining === null) {
          Alert.alert('Required Fields', 'Please complete all required fields.');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmitReport = () => {
    // Check for severe injuries that need immediate attention
    if (injuryReport.severity === 'critical' || injuryReport.severity === 'severe') {
      Alert.alert(
        '🚨 Immediate Medical Attention',
        'Based on the severity reported, you should seek immediate medical attention. Your safety is our priority.',
        [
          {
            text: 'Emergency Services',
            onPress: () => {
              Alert.alert('Emergency Feature', 'This would contact emergency services in a real app.');
            },
            style: 'destructive',
          },
          {
            text: 'Submit Report',
            onPress: submitInjuryReport,
          },
        ]
      );
    } else {
      submitInjuryReport();
    }
  };

  const submitInjuryReport = () => {
    const reportData = {
      ...injuryReport,
      id: Date.now().toString(),
      userId: user.id,
      sessionId,
      exerciseId,
      reportedAt: new Date().toISOString(),
      status: 'reported',
    };

    dispatch({
      type: 'SUBMIT_INJURY_REPORT',
      payload: reportData,
    });

    Alert.alert(
      '✅ Report Submitted',
      'Your injury report has been submitted successfully. Your coach and medical team have been notified.',
      [
        {
          text: 'View Reports',
          onPress: () => navigation.navigate('InjuryHistory'),
        },
        {
          text: 'Back to Training',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const updateInjuryReport = (field, value) => {
    setInjuryReport(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleSymptom = (symptomId) => {
    setInjuryReport(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptomId)
        ? prev.symptoms.filter(s => s !== symptomId)
        : [...prev.symptoms, symptomId],
    }));
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const renderStepIndicator = () => (
    <View style={{ padding: SPACING.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
        <Text style={[TEXT_STYLES.caption, { color: 'white' }]}>
          Step {currentStep} of {totalSteps}
        </Text>
        <Text style={[TEXT_STYLES.caption, { color: 'white' }]}>
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </Text>
      </View>
      <View style={{
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        <Animated.View
          style={{
            height: '100%',
            backgroundColor: 'white',
            borderRadius: 3,
            width: animatedValues.stepProgress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View>
      <Text style={[TEXT_STYLES.header, { textAlign: 'center', marginBottom: SPACING.lg, color: COLORS.primary }]}>
        🎯 Where is the injury?
      </Text>
      
      <Card style={{ marginBottom: SPACING.md, elevation: 2 }}>
        <View style={{ padding: SPACING.md }}>
          <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
            Select the injured body part:
          </Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {bodyParts.map(part => (
              <TouchableOpacity
                key={part.id}
                onPress={() => updateInjuryReport('bodyPart', part.id)}
                style={{
                  width: (width - SPACING.xl * 2) / 2 - SPACING.sm,
                  margin: SPACING.xs,
                  padding: SPACING.md,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: injuryReport.bodyPart === part.id ? COLORS.primary : COLORS.background,
                  backgroundColor: injuryReport.bodyPart === part.id ? COLORS.primary + '20' : COLORS.surface,
                  alignItems: 'center',
                }}
              >
                <Icon
                  name={part.icon}
                  size={32}
                  color={injuryReport.bodyPart === part.id ? COLORS.primary : COLORS.textSecondary}
                />
                <Text style={[
                  TEXT_STYLES.caption,
                  {
                    textAlign: 'center',
                    marginTop: SPACING.xs,
                    color: injuryReport.bodyPart === part.id ? COLORS.primary : COLORS.textSecondary,
                    fontWeight: injuryReport.bodyPart === part.id ? '600' : 'normal',
                  }
                ]}>
                  {part.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setShowBodyMap(true)}
            style={{
              marginTop: SPACING.md,
              padding: SPACING.md,
              borderRadius: 8,
              backgroundColor: COLORS.background,
              alignItems: 'center',
            }}
          >
            <Icon name="accessibility" size={24} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.body, { color: COLORS.primary, marginTop: SPACING.xs }]}>
              View Body Map
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={[TEXT_STYLES.header, { textAlign: 'center', marginBottom: SPACING.lg, color: COLORS.primary }]}>
        🔍 What type of injury?
      </Text>

      {/* Injury Type */}
      <Card style={{ marginBottom: SPACING.md, elevation: 2 }}>
        <View style={{ padding: SPACING.md }}>
          <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
            Injury Type:
          </Text>
          
          {injuryTypes.map(type => (
            <TouchableOpacity
              key={type.id}
              onPress={() => updateInjuryReport('injuryType', type.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: SPACING.md,
                borderRadius: 8,
                marginBottom: SPACING.sm,
                backgroundColor: injuryReport.injuryType === type.id ? COLORS.primary + '20' : 'transparent',
              }}
            >
              <RadioButton
                value={type.id}
                status={injuryReport.injuryType === type.id ? 'checked' : 'unchecked'}
                onPress={() => updateInjuryReport('injuryType', type.id)}
                color={COLORS.primary}
              />
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                  {type.label}
                </Text>
                <Text style={[TEXT_STYLES.caption]}>
                  {type.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Severity Level */}
      <Card style={{ marginBottom: SPACING.md, elevation: 2 }}>
        <View style={{ padding: SPACING.md }}>
          <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
            Severity Level:
          </Text>
          
          {severityLevels.map(level => (
            <TouchableOpacity
              key={level.value}
              onPress={() => updateInjuryReport('severity', level.value)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: SPACING.md,
                borderRadius: 8,
                marginBottom: SPACING.sm,
                backgroundColor: injuryReport.severity === level.value ? 
                  (level.value === 'critical' ? COLORS.error + '20' : COLORS.primary + '20') : 'transparent',
              }}
            >
              <RadioButton
                value={level.value}
                status={injuryReport.severity === level.value ? 'checked' : 'unchecked'}
                onPress={() => updateInjuryReport('severity', level.value)}
                color={level.value === 'critical' ? COLORS.error : COLORS.primary}
              />
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                  {level.label}
                </Text>
                <Text style={[TEXT_STYLES.caption]}>
                  {level.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={[TEXT_STYLES.header, { textAlign: 'center', marginBottom: SPACING.lg, color: COLORS.primary }]}>
        📝 Describe the injury
      </Text>

      <Card style={{ marginBottom: SPACING.md, elevation: 2 }}>
        <View style={{ padding: SPACING.md }}>
          <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
            Detailed Description:
          </Text>
          
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: COLORS.background,
              borderRadius: 8,
              padding: SPACING.md,
              minHeight: 120,
              textAlignVertical: 'top',
              backgroundColor: COLORS.background,
            }}
            multiline
            placeholder="Describe what happened, how it happened, and what you're experiencing..."
            value={injuryReport.description}
            onChangeText={(text) => updateInjuryReport('description', text)}
          />
        </View>
      </Card>

      <Card style={{ marginBottom: SPACING.md, elevation: 2 }}>
        <View style={{ padding: SPACING.md }}>
          <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
            Pain Level (0-10):
          </Text>
          
          <View style={{ alignItems: 'center', marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.header, { color: COLORS.primary, fontSize: 48 }]}>
              {injuryReport.painLevel}
            </Text>
            <Text style={[TEXT_STYLES.caption]}>
              {injuryReport.painLevel === 0 && "No pain"}
              {injuryReport.painLevel > 0 && injuryReport.painLevel <= 3 && "Mild pain"}
              {injuryReport.painLevel > 3 && injuryReport.painLevel <= 6 && "Moderate pain"}
              {injuryReport.painLevel > 6 && injuryReport.painLevel <= 8 && "Severe pain"}
              {injuryReport.painLevel > 8 && "Extreme pain"}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
            {[...Array(11)].map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => updateInjuryReport('painLevel', i)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: injuryReport.painLevel === i ? COLORS.primary : COLORS.background,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{
                  color: injuryReport.painLevel === i ? 'white' : COLORS.textSecondary,
                  fontWeight: '600',
                }}>
                  {i}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Card>

      <Card style={{ elevation: 2 }}>
        <View style={{ padding: SPACING.md }}>
          <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
            Symptoms (select all that apply):
          </Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {symptoms.map(symptom => (
              <TouchableOpacity
                key={symptom.id}
                onPress={() => toggleSymptom(symptom.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: SPACING.sm,
                  margin: SPACING.xs,
                  borderRadius: 20,
                  backgroundColor: injuryReport.symptoms.includes(symptom.id) ? 
                    COLORS.primary + '20' : COLORS.background,
                  borderWidth: 1,
                  borderColor: injuryReport.symptoms.includes(symptom.id) ? 
                    COLORS.primary : 'transparent',
                }}
              >
                <Text style={[
                  TEXT_STYLES.caption,
                  {
                    color: injuryReport.symptoms.includes(symptom.id) ? 
                      COLORS.primary : COLORS.textSecondary,
                    fontWeight: injuryReport.symptoms.includes(symptom.id) ? '600' : 'normal',
                  }
                ]}>
                  {symptom.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Card>
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={[TEXT_STYLES.header, { textAlign: 'center', marginBottom: SPACING.lg, color: COLORS.primary }]}>
        ⏰ When did this happen?
      </Text>

      <Card style={{ marginBottom: SPACING.md, elevation: 2 }}>
        <View style={{ padding: SPACING.md }}>
          <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
            When did the injury occur?
          </Text>
          
          {[
            { id: 'just_now', label: '🔴 Just now (during this session)' },
            { id: 'today', label: '🟡 Earlier today' },
            { id: 'yesterday', label: '🟠 Yesterday' },
            { id: 'this_week', label: '🔵 Earlier this week' },
            { id: 'longer', label: '🟣 More than a week ago' },
          ].map(option => (
            <TouchableOpacity
              key={option.id}
              onPress={() => updateInjuryReport('whenOccurred', option.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: SPACING.md,
                borderRadius: 8,
                marginBottom: SPACING.sm,
                backgroundColor: injuryReport.whenOccurred === option.id ? COLORS.primary + '20' : 'transparent',
              }}
            >
              <RadioButton
                value={option.id}
                status={injuryReport.whenOccurred === option.id ? 'checked' : 'unchecked'}
                color={COLORS.primary}
              />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={{ marginBottom: SPACING.md, elevation: 2 }}>
        <View style={{ padding: SPACING.md }}>
          <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
            Can you continue training today?
          </Text>
          
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => updateInjuryReport('canContinueTraining', true)}
              style={{
                flex: 1,
                padding: SPACING.md,
                borderRadius: 8,
                marginRight: SPACING.sm,
                backgroundColor: injuryReport.canContinueTraining === true ? COLORS.success + '20' : COLORS.background,
                borderWidth: 1,
                borderColor: injuryReport.canContinueTraining === true ? COLORS.success : 'transparent',
                alignItems: 'center',
              }}
            >
              <Icon
                name="check-circle"
                size={32}
                color={injuryReport.canContinueTraining === true ? COLORS.success : COLORS.textSecondary}
              />
              <Text style={[
                TEXT_STYLES.body,
                {
                  textAlign: 'center',
                  marginTop: SPACING.xs,
                  color: injuryReport.canContinueTraining === true ? COLORS.success : COLORS.textSecondary,
                }
              ]}>
                Yes, I can continue
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => updateInjuryReport('canContinueTraining', false)}
              style={{
                flex: 1,
                padding: SPACING.md,
                borderRadius: 8,
                marginLeft: SPACING.sm,
                backgroundColor: injuryReport.canContinueTraining === false ? COLORS.error + '20' : COLORS.background,
                borderWidth: 1,
                borderColor: injuryReport.canContinueTraining === false ? COLORS.error : 'transparent',
                alignItems: 'center',
              }}
            >
              <Icon
                name="cancel"
                size={32}
                color={injuryReport.canContinueTraining === false ? COLORS.error : COLORS.textSecondary}
              />
              <Text style={[
                TEXT_STYLES.body,
                {
                  textAlign: 'center',
                  marginTop: SPACING.xs,
                  color: injuryReport.canContinueTraining === false ? COLORS.error : COLORS.textSecondary,
                }
              ]}>
                No, I need to stop
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      <Card style={{ elevation: 2 }}>
        <View style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
            <Checkbox
              status={injuryReport.needsMedicalAttention ? 'checked' : 'unchecked'}
              onPress={() => updateInjuryReport('needsMedicalAttention', !injuryReport.needsMedicalAttention)}
              color={COLORS.primary}
            />
            <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
              I think I need medical attention
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Checkbox
              status={injuryReport.previousInjury ? 'checked' : 'unchecked'}
              onPress={() => updateInjuryReport('previousInjury', !injuryReport.previousInjury)}
              color={COLORS.primary}
            />
            <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
              I've had a similar injury before
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderStep5 = () => (
    <View>
      <Text style={[TEXT_STYLES.header, { textAlign: 'center', marginBottom: SPACING.lg, color: COLORS.primary }]}>
        📋 Review & Submit
      </Text>

      <Card style={{ marginBottom: SPACING.md, elevation: 2 }}>
        <View style={{ padding: SPACING.md }}>
          <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md, color: COLORS.primary }]}>
            Injury Summary
          </Text>
          
          <View style={{ marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Body Part:</Text>
            <Text style={[TEXT_STYLES.body]}>
              {bodyParts.find(p => p.id === injuryReport.bodyPart)?.label || 'Not selected'}
            </Text>
          </View>

          <View style={{ marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Injury Type:</Text>
            <Text style={[TEXT_STYLES.body]}>
              {injuryTypes.find(t => t.id === injuryReport.injuryType)?.label || 'Not selected'}
            </Text>
          </View>

          <View style={{ marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Severity:</Text>
            <Text style={[TEXT_STYLES.body]}>
              {severityLevels.find(s => s.value === injuryReport.severity)?.label || 'Not selected'}
            </Text>
          </View>

          <View style={{ marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Pain Level:</Text>
            <Text style={[TEXT_STYLES.body]}>{injuryReport.painLevel}/10</Text>
          </View>

          <View style={{ marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Description:</Text>
            <Text style={[TEXT_STYLES.body]} numberOfLines={3}>
              {injuryReport.description || 'No description provided'}
            </Text>
          </View>

          <View style={{ marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Can Continue Training:</Text>
            <Text style={[TEXT_STYLES.body, { color: injuryReport.canContinueTraining ? COLORS.success : COLORS.error }]}>
              {injuryReport.canContinueTraining ? '✅ Yes' : '❌ No'}
            </Text>
          </View>

          {injuryReport.symptoms.length > 0 && (
            <View>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.xs }]}>
                Symptoms:
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {injuryReport.symptoms.map(symptomId => {
                  const symptom = symptoms.find(s => s.id === symptomId);
                  return (
                    <Chip
                      key={symptomId}
                      mode="outlined"
                      style={{ margin: SPACING.xs }}
                      textStyle={{ fontSize: 12 }}
                    >
                      {symptom?.label}
                    </Chip>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </Card>

      {/* Emergency Warning */}
      {(injuryReport.severity === 'severe' || injuryReport.severity === 'critical' || injuryReport.needsMedicalAttention) && (
        <Card style={{ marginBottom: SPACING.md, elevation: 4 }}>
          <LinearGradient
            colors={[COLORS.error, '#d32f2f']}
            style={{ padding: SPACING.md, borderRadius: 12 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Icon name="warning" size={24} color="white" />
              <Text style={[TEXT_STYLES.subheader, { color: 'white', marginLeft: SPACING.sm }]}>
                ⚠️ Medical Attention Recommended
              </Text>
            </View>
            <Text style={[TEXT_STYLES.body, { color: 'white' }]}>
              Based on your report, we recommend seeking medical attention. Your safety is our top priority.
            </Text>
          </LinearGradient>
        </Card>
      )}

      {/* Next Steps */}
      <Card style={{ elevation: 2 }}>
        <View style={{ padding: SPACING.md }}>
          <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md, color: COLORS.primary }]}>
            📋 Next Steps
          </Text>
          
          <View style={{ marginBottom: SPACING.sm }}>
            <Text style={[TEXT_STYLES.body]}>
              • Your coach will be notified immediately
            </Text>
          </View>
          <View style={{ marginBottom: SPACING.sm }}>
            <Text style={[TEXT_STYLES.body]}>
              • Medical team will review your report
            </Text>
          </View>
          <View style={{ marginBottom: SPACING.sm }}>
            <Text style={[TEXT_STYLES.body]}>
              • Modified training plan may be provided
            </Text>
          </View>
          <View>
            <Text style={[TEXT_STYLES.body]}>
              • Follow-up check scheduled within 24 hours
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  const renderNavigationButtons = () => (
    <View style={{
      flexDirection: 'row',
      padding: SPACING.md,
      backgroundColor: COLORS.surface,
      borderTopWidth: 1,
      borderTopColor: COLORS.background,
    }}>
      {currentStep > 1 && (
        <Button
          mode="outlined"
          onPress={handlePrevious}
          style={{ flex: 1, marginRight: SPACING.sm }}
          icon="arrow-back"
        >
          Previous
        </Button>
      )}
      
      <Button
        mode="contained"
        onPress={handleNext}
        style={{ flex: 1, marginLeft: currentStep > 1 ? SPACING.sm : 0 }}
        icon={currentStep === totalSteps ? "send" : "arrow-forward"}
        buttonColor={currentStep === totalSteps ? COLORS.success : COLORS.primary}
      >
        {currentStep === totalSteps ? 'Submit Report' : 'Next'}
      </Button>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.error, '#d32f2f']}
        style={{
          paddingTop: 50,
          paddingBottom: SPACING.sm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, marginBottom: SPACING.sm }}>
          <IconButton
            icon="arrow-back"
            size={24}
            onPress={() => {
              if (currentStep > 1) {
                Alert.alert(
                  'Unsaved Changes',
                  'You have unsaved changes. Are you sure you want to go back?',
                  [
                    { text: 'Stay', style: 'cancel' },
                    { text: 'Leave', onPress: () => navigation.goBack() },
                  ]
                );
              } else {
                navigation.goBack();
              }
            }}
            iconColor="white"
          />
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.header, { color: 'white' }]}>
              🩹 Injury Report
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'white', opacity: 0.8 }]}>
              Report any injuries for immediate assistance
            </Text>
          </View>
          <IconButton
            icon="local-hospital"
            size={24}
            iconColor="white"
            onPress={() => {
              Alert.alert(
                '🚨 Emergency',
                'If this is a medical emergency, please call emergency services immediately.',
                [
                  { text: 'Call Emergency', style: 'destructive' },
                  { text: 'Continue Report', style: 'cancel' },
                ]
              );
            }}
          />
        </View>
        
        {renderStepIndicator()}
      </LinearGradient>

      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.error]}
            tintColor={COLORS.error}
          />
        }
      >
        {renderCurrentStep()}
      </Animated.ScrollView>

      {renderNavigationButtons()}

      {/* Body Map Modal */}
      <Portal>
        <Modal
          visible={showBodyMap}
          onDismiss={() => setShowBodyMap(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.lg,
            borderRadius: 12,
            padding: SPACING.lg,
            maxHeight: '80%',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.header, { flex: 1, color: COLORS.primary }]}>
              🫁 Body Map
            </Text>
            <IconButton
              icon="close"
              onPress={() => setShowBodyMap(false)}
            />
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
              <Text style={[TEXT_STYLES.body, { textAlign: 'center', color: COLORS.textSecondary }]}>
                Interactive body map coming soon! For now, please select from the body parts list.
              </Text>
              <Icon name="accessibility" size={120} color={COLORS.primary} style={{ marginVertical: SPACING.lg }} />
            </View>
            
            <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
              Quick Select:
            </Text>
            {bodyParts.map(part => (
              <TouchableOpacity
                key={part.id}
                onPress={() => {
                  updateInjuryReport('bodyPart', part.id);
                  setShowBodyMap(false);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: SPACING.md,
                  borderRadius: 8,
                  marginBottom: SPACING.sm,
                  backgroundColor: injuryReport.bodyPart === part.id ? COLORS.primary + '20' : COLORS.background,
                }}
              >
                <Icon name={part.icon} size={24} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                  {part.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

export default InjuryReporting;