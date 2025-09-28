import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
  Vibration,
  Animated,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Portal,
  Modal,
  Searchbar,
  ProgressBar,
  Badge,
  Checkbox,
  RadioButton,
  TextInput,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9ff',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  safetyGreen: '#2E7D32',
  alertRed: '#C62828',
  warningOrange: '#F57C00',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const SafetyChecklist = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, children, currentSession } = useSelector(state => ({
    user: state.auth.user,
    children: state.family.children || [],
    currentSession: state.training.currentSession,
  }));

  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('pre-training');
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [checklistProgress, setChecklistProgress] = useState({});
  const [incidentReport, setIncidentReport] = useState({
    type: '',
    severity: '',
    description: '',
    childrenInvolved: [],
    actionsTaken: '',
    requiresMedicalAttention: false,
    parentNotified: false,
  });
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [weatherAlert, setWeatherAlert] = useState(null);

  // Animation values
  const progressAnimation = new Animated.Value(0);

  // Sample safety checklist data
  const safetyChecklists = {
    'pre-training': {
      title: 'Pre-Training Safety Check',
      icon: 'playlist-add-check',
      color: COLORS.primary,
      items: [
        {
          id: 'venue-inspection',
          title: 'Venue Safety Inspection',
          description: 'Check training area for hazards, proper lighting, and emergency exits',
          priority: 'high',
          items: [
            { id: 'flooring', text: 'Training surface is clean and free of hazards', completed: false },
            { id: 'lighting', text: 'Adequate lighting throughout training area', completed: false },
            { id: 'exits', text: 'Emergency exits are clearly marked and accessible', completed: false },
            { id: 'equipment', text: 'All training equipment is secure and in good condition', completed: false },
            { id: 'boundaries', text: 'Training boundaries are clearly defined', completed: false },
          ]
        },
        {
          id: 'weather-check',
          title: 'Weather & Environmental Assessment',
          description: 'Verify weather conditions and environmental safety',
          priority: 'high',
          items: [
            { id: 'weather', text: 'Weather conditions are safe for outdoor activities', completed: false },
            { id: 'temperature', text: 'Temperature is appropriate for planned activities', completed: false },
            { id: 'air-quality', text: 'Air quality is acceptable for physical activity', completed: false },
            { id: 'visibility', text: 'Visibility conditions are adequate', completed: false },
          ]
        },
        {
          id: 'equipment-safety',
          title: 'Equipment Safety Check',
          description: 'Inspect all training equipment and safety gear',
          priority: 'medium',
          items: [
            { id: 'protective-gear', text: 'All protective equipment is available and functioning', completed: false },
            { id: 'first-aid', text: 'First aid kit is accessible and fully stocked', completed: false },
            { id: 'communication', text: 'Communication devices are working properly', completed: false },
            { id: 'emergency-equipment', text: 'Emergency equipment (AED, etc.) is accessible', completed: false },
          ]
        },
      ]
    },
    'during-training': {
      title: 'Active Training Monitoring',
      icon: 'visibility',
      color: COLORS.warning,
      items: [
        {
          id: 'child-monitoring',
          title: 'Child Supervision & Monitoring',
          description: 'Continuous monitoring of all children during activities',
          priority: 'critical',
          items: [
            { id: 'attendance', text: 'All children are accounted for and present', completed: false },
            { id: 'hydration', text: 'Regular hydration breaks are provided', completed: false },
            { id: 'fatigue', text: 'Monitor children for signs of fatigue or distress', completed: false },
            { id: 'behavior', text: 'Observe and address any unsafe behavior', completed: false },
            { id: 'participation', text: 'Ensure all children can participate safely', completed: false },
          ]
        },
        {
          id: 'activity-safety',
          title: 'Activity-Specific Safety',
          description: 'Safety measures specific to current training activities',
          priority: 'high',
          items: [
            { id: 'proper-form', text: 'Children are using proper form and technique', completed: false },
            { id: 'age-appropriate', text: 'Activities are age and skill-level appropriate', completed: false },
            { id: 'spacing', text: 'Adequate spacing between children during activities', completed: false },
            { id: 'equipment-use', text: 'Equipment is being used correctly and safely', completed: false },
          ]
        },
      ]
    },
    'post-training': {
      title: 'Post-Training Safety Protocol',
      icon: 'assignment-turned-in',
      color: COLORS.success,
      items: [
        {
          id: 'pickup-protocol',
          title: 'Child Pickup & Release Protocol',
          description: 'Secure and verified child release procedures',
          priority: 'critical',
          items: [
            { id: 'authorized-pickup', text: 'Only authorized persons are picking up children', completed: false },
            { id: 'id-verification', text: 'Photo ID verification for all pickups', completed: false },
            { id: 'sign-out', text: 'Proper sign-out procedures completed', completed: false },
            { id: 'late-pickup', text: 'Late pickup protocols followed if applicable', completed: false },
          ]
        },
        {
          id: 'facility-secure',
          title: 'Facility Security & Cleanup',
          description: 'Secure facility and ensure safe environment',
          priority: 'medium',
          items: [
            { id: 'equipment-stored', text: 'All equipment properly stored and secured', completed: false },
            { id: 'area-cleaned', text: 'Training area cleaned and hazards removed', completed: false },
            { id: 'lights-secured', text: 'Facilities properly secured and locked', completed: false },
            { id: 'incident-documented', text: 'Any incidents properly documented', completed: false },
          ]
        },
      ]
    },
    'emergency': {
      title: 'Emergency Procedures',
      icon: 'local-hospital',
      color: COLORS.error,
      items: [
        {
          id: 'medical-emergency',
          title: 'Medical Emergency Response',
          description: 'Steps to follow in case of medical emergencies',
          priority: 'critical',
          items: [
            { id: 'assess-situation', text: 'Assess the situation and ensure scene safety', completed: false },
            { id: 'call-emergency', text: 'Call emergency services (911) if needed', completed: false },
            { id: 'provide-first-aid', text: 'Provide appropriate first aid within training', completed: false },
            { id: 'notify-parents', text: 'Immediately notify parents/guardians', completed: false },
            { id: 'document-incident', text: 'Document incident thoroughly', completed: false },
          ]
        },
        {
          id: 'severe-weather',
          title: 'Severe Weather Protocol',
          description: 'Safety procedures for severe weather conditions',
          priority: 'high',
          items: [
            { id: 'monitor-weather', text: 'Continuously monitor weather conditions', completed: false },
            { id: 'shelter-location', text: 'Move to designated shelter area if needed', completed: false },
            { id: 'parent-notification', text: 'Notify parents of weather delays/cancellations', completed: false },
            { id: 'safe-dismissal', text: 'Ensure safe dismissal when conditions improve', completed: false },
          ]
        },
      ]
    },
  };

  // Categories for navigation
  const categories = [
    { id: 'pre-training', label: 'Pre-Training', icon: 'playlist-add-check', color: COLORS.primary },
    { id: 'during-training', label: 'Active Training', icon: 'visibility', color: COLORS.warning },
    { id: 'post-training', label: 'Post-Training', icon: 'assignment-turned-in', color: COLORS.success },
    { id: 'emergency', label: 'Emergency', icon: 'local-hospital', color: COLORS.error },
  ];

  // Effects
  useEffect(() => {
    calculateProgress();
    checkWeatherAlerts();
  }, [checklistProgress, selectedCategory]);

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: calculateCategoryProgress(),
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [checklistProgress, selectedCategory]);

  // Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call to refresh safety data
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(refreshSafetyChecklist());
      setWeatherAlert({
        type: 'warning',
        message: 'Thunderstorm warning in effect. Monitor conditions closely.',
        severity: 'moderate',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh safety checklist');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const calculateProgress = () => {
    const currentChecklist = safetyChecklists[selectedCategory];
    if (!currentChecklist) return;

    let totalItems = 0;
    let completedItems = 0;

    currentChecklist.items.forEach(section => {
      section.items.forEach(item => {
        totalItems++;
        if (checklistProgress[item.id]) {
          completedItems++;
        }
      });
    });

    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  const calculateCategoryProgress = () => {
    return calculateProgress() / 100;
  };

  const handleItemToggle = (itemId, sectionId, sectionTitle) => {
    const newValue = !checklistProgress[itemId];
    setChecklistProgress(prev => ({
      ...prev,
      [itemId]: newValue,
    }));

    if (newValue) {
      Vibration.vibrate(50);
    }

    // Check for critical safety items
    const section = safetyChecklists[selectedCategory].items.find(s => s.id === sectionId);
    const item = section?.items.find(i => i.id === itemId);
    
    if (item && section.priority === 'critical' && !newValue) {
      Alert.alert(
        '⚠️ Critical Safety Item',
        'This is a critical safety requirement. Please ensure it is completed before proceeding.',
        [{ text: 'Understood', style: 'default' }]
      );
    }
  };

  const checkWeatherAlerts = async () => {
    // Simulate weather API check
    const weatherConditions = ['clear', 'warning', 'severe'];
    const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    
    if (randomCondition === 'warning') {
      setWeatherAlert({
        type: 'warning',
        message: 'Thunderstorm possible. Monitor conditions closely.',
        severity: 'moderate',
      });
    } else if (randomCondition === 'severe') {
      setWeatherAlert({
        type: 'severe',
        message: 'Severe weather alert! Consider canceling outdoor activities.',
        severity: 'high',
      });
    }
  };

  const handleEmergencyAction = (actionType) => {
    switch (actionType) {
      case 'call-911':
        Alert.alert(
          '🚨 Emergency Services',
          'This will initiate a call to emergency services (911). Continue only if this is a real emergency.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Call 911', 
              style: 'destructive',
              onPress: () => {
                // In a real app, this would make the call
                Alert.alert('Emergency Called', 'Emergency services have been contacted.');
              }
            },
          ]
        );
        break;
      case 'notify-parents':
        navigation.navigate('EmergencyNotification');
        break;
      case 'incident-report':
        setShowIncidentModal(true);
        break;
      default:
        Alert.alert('Action', 'Emergency action initiated');
    }
  };

  const submitIncidentReport = () => {
    if (!incidentReport.type || !incidentReport.description) {
      Alert.alert('Incomplete Report', 'Please fill in all required fields.');
      return;
    }

    // Simulate submitting incident report
    Alert.alert(
      'Incident Report Submitted',
      'The incident has been documented and parents will be notified automatically.',
      [
        {
          text: 'OK',
          onPress: () => {
            setShowIncidentModal(false);
            setIncidentReport({
              type: '',
              severity: '',
              description: '',
              childrenInvolved: [],
              actionsTaken: '',
              requiresMedicalAttention: false,
              parentNotified: false,
            });
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return COLORS.alertRed;
      case 'high':
        return COLORS.warningOrange;
      case 'medium':
        return COLORS.primary;
      default:
        return COLORS.textSecondary;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'check-circle';
    }
  };

  const renderWeatherAlert = () => {
    if (!weatherAlert) return null;

    return (
      <Surface style={styles.weatherAlert}>
        <LinearGradient
          colors={weatherAlert.type === 'severe' ? [COLORS.error, '#c62828'] : [COLORS.warning, '#f57c00']}
          style={styles.weatherGradient}
        >
          <Icon
            name={weatherAlert.type === 'severe' ? 'warning' : 'cloud'}
            size={24}
            color="white"
          />
          <View style={styles.weatherText}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
              Weather Alert
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
              {weatherAlert.message}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setWeatherAlert(null)}>
            <Icon name="close" size={20} color="white" />
          </TouchableOpacity>
        </LinearGradient>
      </Surface>
    );
  };

  const renderChecklistSection = (section) => (
    <Surface key={section.id} style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Icon
            name={getPriorityIcon(section.priority)}
            size={24}
            color={getPriorityColor(section.priority)}
            style={styles.priorityIcon}
          />
          <View style={styles.sectionTitleText}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              {section.title}
            </Text>
            <Text style={[TEXT_STYLES.caption, styles.sectionDescription]}>
              {section.description}
            </Text>
          </View>
        </View>
        <Chip
          textStyle={styles.priorityChipText}
          style={[styles.priorityChip, { backgroundColor: `${getPriorityColor(section.priority)}20` }]}
        >
          {section.priority.toUpperCase()}
        </Chip>
      </View>

      <View style={styles.checklistItems}>
        {section.items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={styles.checklistItem}
            onPress={() => handleItemToggle(item.id, section.id, section.title)}
            activeOpacity={0.7}
          >
            <Checkbox
              status={checklistProgress[item.id] ? 'checked' : 'unchecked'}
              onPress={() => handleItemToggle(item.id, section.id, section.title)}
              color={COLORS.safetyGreen}
            />
            <Text
              style={[
                TEXT_STYLES.body,
                styles.checklistItemText,
                checklistProgress[item.id] && styles.checkedItemText,
              ]}
            >
              {item.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Surface>
  );

  const renderIncidentModal = () => (
    <Portal>
      <Modal
        visible={showIncidentModal}
        onDismiss={() => setShowIncidentModal(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Surface style={styles.modalSurface}>
          <View style={styles.modalHeader}>
            <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>
              Incident Report
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowIncidentModal(false)}
            />
          </View>

          <ScrollView style={styles.modalScrollView}>
            <TextInput
              label="Incident Type *"
              value={incidentReport.type}
              onChangeText={(text) => setIncidentReport(prev => ({ ...prev, type: text }))}
              style={styles.input}
              mode="outlined"
            />

            <View style={styles.severitySection}>
              <Text style={[TEXT_STYLES.h3, styles.sectionLabel]}>Severity Level</Text>
              <RadioButton.Group
                onValueChange={(value) => setIncidentReport(prev => ({ ...prev, severity: value }))}
                value={incidentReport.severity}
              >
                <View style={styles.radioItem}>
                  <RadioButton value="minor" />
                  <Text style={TEXT_STYLES.body}>Minor - No medical attention needed</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="moderate" />
                  <Text style={TEXT_STYLES.body}>Moderate - Basic first aid provided</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="serious" />
                  <Text style={TEXT_STYLES.body}>Serious - Medical attention required</Text>
                </View>
              </RadioButton.Group>
            </View>

            <TextInput
              label="Description *"
              value={incidentReport.description}
              onChangeText={(text) => setIncidentReport(prev => ({ ...prev, description: text }))}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
            />

            <TextInput
              label="Actions Taken"
              value={incidentReport.actionsTaken}
              onChangeText={(text) => setIncidentReport(prev => ({ ...prev, actionsTaken: text }))}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />

            <View style={styles.checkboxSection}>
              <TouchableOpacity
                style={styles.checkboxItem}
                onPress={() => setIncidentReport(prev => ({ 
                  ...prev, 
                  requiresMedicalAttention: !prev.requiresMedicalAttention 
                }))}
              >
                <Checkbox
                  status={incidentReport.requiresMedicalAttention ? 'checked' : 'unchecked'}
                  color={COLORS.error}
                />
                <Text style={TEXT_STYLES.body}>Requires medical attention</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxItem}
                onPress={() => setIncidentReport(prev => ({ 
                  ...prev, 
                  parentNotified: !prev.parentNotified 
                }))}
              >
                <Checkbox
                  status={incidentReport.parentNotified ? 'checked' : 'unchecked'}
                  color={COLORS.primary}
                />
                <Text style={TEXT_STYLES.body}>Parent/Guardian notified</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowIncidentModal(false)}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={submitIncidentReport}
              style={styles.submitButton}
              buttonColor={COLORS.primary}
            >
              Submit Report
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );

  const currentChecklist = safetyChecklists[selectedCategory];
  const progressPercentage = calculateProgress();

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-back"
              size={24}
              iconColor="white"
              onPress={() => navigation.goBack()}
            />
            <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
              Safety Checklist
            </Text>
            <IconButton
              icon="help-outline"
              size={24}
              iconColor="white"
              onPress={() => Alert.alert(
                'Safety Checklist Help',
                'Use this checklist to ensure all safety protocols are followed. Critical items must be completed before proceeding.'
              )}
            />
          </View>

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <Text style={[TEXT_STYLES.caption, styles.progressText]}>
              {currentChecklist.title} Progress: {Math.round(progressPercentage)}%
            </Text>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Weather Alert */}
      {renderWeatherAlert()}

      {/* Category Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.categoryCard,
              selectedCategory === category.id && styles.categoryCardActive,
            ]}
          >
            <LinearGradient
              colors={selectedCategory === category.id 
                ? [category.color, category.color] 
                : ['transparent', 'transparent']
              }
              style={styles.categoryGradient}
            >
              <Icon
                name={category.icon}
                size={24}
                color={selectedCategory === category.id ? 'white' : category.color}
              />
              <Text
                style={[
                  TEXT_STYLES.caption,
                  styles.categoryLabel,
                  selectedCategory === category.id && styles.categoryLabelActive,
                ]}
              >
                {category.label}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
        {/* Emergency Quick Actions */}
        {selectedCategory === 'emergency' && (
          <Surface style={styles.emergencyActions}>
            <Text style={[TEXT_STYLES.h3, styles.emergencyTitle]}>
              🚨 Emergency Quick Actions
            </Text>
            <View style={styles.emergencyGrid}>
              <TouchableOpacity
                style={[styles.emergencyButton, { backgroundColor: COLORS.error }]}
                onPress={() => handleEmergencyAction('call-911')}
              >
                <Icon name="local-hospital" size={32} color="white" />
                <Text style={[TEXT_STYLES.caption, { color: 'white', textAlign: 'center' }]}>
                  Call 911
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.emergencyButton, { backgroundColor: COLORS.warning }]}
                onPress={() => handleEmergencyAction('notify-parents')}
              >
                <Icon name="notification-important" size={32} color="white" />
                <Text style={[TEXT_STYLES.caption, { color: 'white', textAlign: 'center' }]}>
                  Notify Parents
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.emergencyButton, { backgroundColor: COLORS.primary }]}
                onPress={() => handleEmergencyAction('incident-report')}
              >
                <Icon name="report" size={32} color="white" />
                <Text style={[TEXT_STYLES.caption, { color: 'white', textAlign: 'center' }]}>
                  Incident Report
                </Text>
              </TouchableOpacity>
            </View>
          </Surface>
        )}

        {/* Safety Checklist Sections */}
        <View style={styles.checklistContainer}>
          {currentChecklist.items.map(renderChecklistSection)}
        </View>

        {/* Completion Summary */}
        {progressPercentage === 100 && (
          <Surface style={styles.completionBanner}>
            <LinearGradient
              colors={[COLORS.safetyGreen, '#2E7D32']}
              style={styles.completionGradient}
            >
              <Icon name="check-circle" size={32} color="white" />
              <View style={styles.completionText}>
                <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                  ✅ Safety Checklist Complete!
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
                  All safety protocols have been verified. Training can proceed safely.
                </Text>
              </View>
            </LinearGradient>
          </Surface>
        )}
      </ScrollView>

      {renderIncidentModal()}
    </View>
  );
};


export default SafetyChecklist;