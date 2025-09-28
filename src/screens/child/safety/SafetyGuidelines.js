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
  Platform,
  Vibration,
  Animated,
  Linking,
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
  FAB,
  Divider,
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
  infoBlue: '#1976D2',
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

const SafetyGuidelines = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, userRole } = useSelector(state => ({
    user: state.auth.user,
    userRole: state.auth.userRole, // 'parent', 'coach', 'admin'
  }));

  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [certificationProgress, setCertificationProgress] = useState({});
  const [bookmarkedGuidelines, setBookmarkedGuidelines] = useState([]);
  const [showQuickReference, setShowQuickReference] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  // Safety Guidelines Data Structure
  const safetyGuidelines = {
    overview: {
      title: 'Safety Overview',
      icon: 'security',
      color: COLORS.primary,
      priority: 'high',
      sections: [
        {
          id: 'mission',
          title: 'Our Safety Mission',
          icon: 'gps-fixed',
          content: 'Child safety is our top priority. Every decision, policy, and procedure is designed with the fundamental principle that no activity or achievement is worth compromising a child\'s safety, well-being, or development.',
          keyPoints: [
            'Zero tolerance for any form of child abuse or neglect',
            'Comprehensive background checks for all staff and volunteers',
            'Regular safety training and certification requirements',
            'Open-door policy for parents and guardians',
            'Mandatory incident reporting and investigation procedures',
          ]
        },
        {
          id: 'principles',
          title: 'Core Safety Principles',
          icon: 'verified_user',
          content: 'These fundamental principles guide all our safety protocols and decision-making processes.',
          keyPoints: [
            'Prevention First: Proactive measures to prevent incidents',
            'Transparency: Clear communication with all stakeholders',
            'Accountability: Clear responsibilities and consequences',
            'Continuous Improvement: Regular review and enhancement',
            'Child-Centered: All decisions prioritize child welfare',
          ]
        }
      ]
    },
    supervision: {
      title: 'Child Supervision',
      icon: 'supervisor_account',
      color: COLORS.safetyGreen,
      priority: 'critical',
      sections: [
        {
          id: 'ratios',
          title: 'Supervision Ratios & Requirements',
          icon: 'groups',
          content: 'Mandatory supervision ratios based on age groups and activity types to ensure adequate oversight.',
          table: [
            { ageGroup: '5-7 years', ratio: '1:6', activity: 'General Training', notes: 'Constant visual supervision required' },
            { ageGroup: '8-10 years', ratio: '1:8', activity: 'General Training', notes: 'Direct supervision within 50 feet' },
            { ageGroup: '11-13 years', ratio: '1:10', activity: 'General Training', notes: 'Active supervision and periodic check-ins' },
            { ageGroup: '14-17 years', ratio: '1:12', activity: 'General Training', notes: 'Oversight supervision with autonomy' },
            { ageGroup: 'All ages', ratio: '1:4', activity: 'High-Risk Activities', notes: 'Enhanced supervision protocols' },
          ],
          keyPoints: [
            'Never leave children unsupervised during activities',
            'Maintain visual contact at all times during training',
            'Implement buddy system for older children',
            'Designated safety officer for each training session',
          ]
        },
        {
          id: 'protocols',
          title: 'Supervision Protocols',
          icon: 'visibility',
          content: 'Specific protocols for maintaining effective supervision across different scenarios.',
          keyPoints: [
            'Head counts every 15 minutes during activities',
            'Clear sight lines maintained throughout facility',
            'No one-on-one interactions in isolated areas',
            'Two-adult rule for all private conversations',
            'Bathroom and changing area supervision protocols',
            'Transportation supervision requirements',
          ]
        }
      ]
    },
    facility: {
      title: 'Facility Safety',
      icon: 'home_work',
      color: COLORS.infoBlue,
      priority: 'high',
      sections: [
        {
          id: 'requirements',
          title: 'Facility Safety Requirements',
          icon: 'verified',
          content: 'All training facilities must meet strict safety standards and undergo regular inspections.',
          keyPoints: [
            'Emergency exits clearly marked and unobstructed',
            'First aid stations accessible within 100 feet',
            'Proper lighting levels (minimum 50 foot-candles)',
            'Non-slip surfaces in all training areas',
            'Secure storage for equipment and personal items',
            'Climate control appropriate for activity level',
            'Regular safety equipment inspections',
          ]
        },
        {
          id: 'hazards',
          title: 'Hazard Identification & Control',
          icon: 'warning',
          content: 'Systematic approach to identifying and mitigating potential safety hazards.',
          hazardTypes: [
            {
              type: 'Physical Hazards',
              examples: ['Wet floors', 'Damaged equipment', 'Poor lighting', 'Sharp edges'],
              controls: ['Regular inspections', 'Immediate repairs', 'Warning signs', 'Barrier protection']
            },
            {
              type: 'Environmental Hazards',
              examples: ['Extreme temperatures', 'Poor air quality', 'Noise levels', 'UV exposure'],
              controls: ['Climate monitoring', 'Air quality tests', 'Noise assessments', 'Sun protection']
            },
            {
              type: 'Behavioral Hazards',
              examples: ['Rough play', 'Non-compliance', 'Bullying', 'Risk-taking'],
              controls: ['Clear rules', 'Positive reinforcement', 'Intervention protocols', 'Parent communication']
            }
          ]
        }
      ]
    },
    medical: {
      title: 'Medical & Health',
      icon: 'local_hospital',
      color: COLORS.error,
      priority: 'critical',
      sections: [
        {
          id: 'emergencies',
          title: 'Medical Emergency Response',
          icon: 'emergency',
          content: 'Immediate response protocols for medical emergencies to ensure rapid and appropriate care.',
          emergencySteps: [
            {
              step: 1,
              title: 'Assess the Situation',
              actions: ['Ensure scene safety', 'Check responsiveness', 'Identify nature of emergency']
            },
            {
              step: 2,
              title: 'Call for Help',
              actions: ['Call 911 if serious', 'Notify on-site medical personnel', 'Contact parents/guardians']
            },
            {
              step: 3,
              title: 'Provide Care',
              actions: ['Apply first aid within training', 'Monitor vital signs', 'Comfort and reassure child']
            },
            {
              step: 4,
              title: 'Document & Follow-up',
              actions: ['Complete incident report', 'Medical facility coordination', 'Follow-up with family']
            }
          ]
        },
        {
          id: 'conditions',
          title: 'Managing Medical Conditions',
          icon: 'medication',
          content: 'Protocols for managing children with pre-existing medical conditions and medication needs.',
          keyPoints: [
            'Current medical information on file for each child',
            'Emergency medication easily accessible',
            'Staff trained in condition-specific responses',
            'Clear action plans for each medical condition',
            'Regular communication with parents about health status',
            'Medication administration protocols and documentation',
          ]
        }
      ]
    },
    communication: {
      title: 'Communication & Reporting',
      icon: 'forum',
      color: COLORS.warning,
      priority: 'high',
      sections: [
        {
          id: 'channels',
          title: 'Communication Channels',
          icon: 'communication',
          content: 'Established communication pathways for different types of safety-related information.',
          channels: [
            {
              type: 'Emergency Communication',
              method: 'Immediate phone call + SMS',
              when: 'Injuries, incidents, emergencies',
              response: 'Within 5 minutes'
            },
            {
              type: 'Safety Concerns',
              method: 'Phone call + written report',
              when: 'Behavior issues, safety violations',
              response: 'Within 2 hours'
            },
            {
              type: 'General Updates',
              method: 'App notifications + email',
              when: 'Policy changes, routine updates',
              response: 'Within 24 hours'
            }
          ]
        },
        {
          id: 'reporting',
          title: 'Incident Reporting Requirements',
          icon: 'report_problem',
          content: 'Mandatory reporting procedures for all safety-related incidents and concerns.',
          reportingLevels: [
            {
              level: 'Level 1 - Minor Incidents',
              examples: ['Minor scrapes', 'Brief emotional upset', 'Equipment malfunction'],
              action: 'Document in daily log, inform parents at pickup',
              timeline: 'End of session'
            },
            {
              level: 'Level 2 - Moderate Incidents',
              examples: ['Injuries requiring first aid', 'Behavior interventions', 'Safety protocol violations'],
              action: 'Complete incident report, notify parents immediately',
              timeline: 'Within 1 hour'
            },
            {
              level: 'Level 3 - Serious Incidents',
              examples: ['Injuries requiring medical attention', 'Suspected abuse', 'Emergency situations'],
              action: 'Immediate notification, formal investigation, regulatory reporting',
              timeline: 'Immediately'
            }
          ]
        }
      ]
    },
    training: {
      title: 'Safety Training',
      icon: 'school',
      color: COLORS.secondary,
      priority: 'high',
      sections: [
        {
          id: 'requirements',
          title: 'Mandatory Training Requirements',
          icon: 'assignment',
          content: 'All staff and volunteers must complete required safety training before working with children.',
          trainings: [
            {
              course: 'Child Protection Fundamentals',
              duration: '4 hours',
              renewal: 'Annual',
              topics: ['Recognizing abuse', 'Reporting procedures', 'Appropriate boundaries']
            },
            {
              course: 'First Aid & CPR Certification',
              duration: '8 hours',
              renewal: '2 years',
              topics: ['Basic life support', 'Emergency response', 'Medical emergencies']
            },
            {
              course: 'Sport-Specific Safety',
              duration: '2 hours',
              renewal: 'Annual',
              topics: ['Equipment safety', 'Injury prevention', 'Age-appropriate activities']
            },
            {
              course: 'Emergency Response Procedures',
              duration: '3 hours',
              renewal: 'Annual',
              topics: ['Evacuation procedures', 'Severe weather', 'Lockdown protocols']
            }
          ]
        },
        {
          id: 'ongoing',
          title: 'Ongoing Education & Updates',
          icon: 'update',
          content: 'Continuous learning and skill development to maintain current safety knowledge.',
          keyPoints: [
            'Monthly safety briefings and updates',
            'Quarterly scenario-based training exercises',
            'Annual comprehensive safety assessment',
            'Access to online learning resources',
            'Peer learning and experience sharing',
            'Industry best practice updates',
          ]
        }
      ]
    }
  };

  // Quick Reference Emergency Contacts
  const emergencyContacts = [
    { name: 'Emergency Services', number: '911', type: 'emergency' },
    { name: 'Poison Control', number: '1-800-222-1222', type: 'emergency' },
    { name: 'Child Protective Services', number: '1-800-252-5400', type: 'reporting' },
    { name: 'Safety Hotline', number: '1-800-SAFE-KID', type: 'consultation' },
  ];

  // Categories for navigation
  const categories = [
    { id: 'overview', label: 'Overview', icon: 'security' },
    { id: 'supervision', label: 'Supervision', icon: 'supervisor_account' },
    { id: 'facility', label: 'Facility', icon: 'home_work' },
    { id: 'medical', label: 'Medical', icon: 'local_hospital' },
    { id: 'communication', label: 'Communication', icon: 'forum' },
    { id: 'training', label: 'Training', icon: 'school' },
  ];

  // Effects
  useEffect(() => {
    // Animate entrance
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

  // Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call to refresh guidelines
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(refreshSafetyGuidelines());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh safety guidelines');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleSectionToggle = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
    Vibration.vibrate(30);
  };

  const handleBookmark = (guidelineId) => {
    setBookmarkedGuidelines(prev => {
      const isBookmarked = prev.includes(guidelineId);
      if (isBookmarked) {
        return prev.filter(id => id !== guidelineId);
      } else {
        return [...prev, guidelineId];
      }
    });
    Vibration.vibrate(50);
  };

  const handleEmergencyCall = (number) => {
    Alert.alert(
      'Emergency Call',
      `Call ${number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => Linking.openURL(`tel:${number}`) 
        },
      ]
    );
  };

  const handleCertificationStart = (courseId) => {
    Alert.alert(
      'Start Certification',
      'This will begin your safety certification process. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start', 
          onPress: () => {
            setShowCertificationModal(true);
            setCertificationProgress({ [courseId]: 0 });
          }
        },
      ]
    );
  };

  const renderPriorityBadge = (priority) => (
    <Badge
      style={[
        styles.priorityBadge,
        {
          backgroundColor: priority === 'critical' ? COLORS.error : 
                          priority === 'high' ? COLORS.warning : COLORS.primary
        }
      ]}
    >
      {priority.toUpperCase()}
    </Badge>
  );

  const renderSectionContent = (section) => {
    const isExpanded = expandedSections[section.id];

    return (
      <Surface key={section.id} style={styles.sectionCard}>
        <TouchableOpacity
          onPress={() => handleSectionToggle(section.id)}
          style={styles.sectionHeader}
          activeOpacity={0.7}
        >
          <View style={styles.sectionTitleContainer}>
            <Avatar.Icon
              size={40}
              icon={section.icon}
              style={[styles.sectionIcon, { backgroundColor: `${COLORS.primary}20` }]}
            />
            <View style={styles.sectionTitleText}>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                {section.title}
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.sectionPreview]}>
                {section.content.substring(0, 80)}...
              </Text>
            </View>
          </View>
          <View style={styles.sectionActions}>
            <IconButton
              icon={bookmarkedGuidelines.includes(section.id) ? 'bookmark' : 'bookmark-border'}
              size={20}
              onPress={() => handleBookmark(section.id)}
              iconColor={bookmarkedGuidelines.includes(section.id) ? COLORS.warning : COLORS.textSecondary}
            />
            <Icon
              name={isExpanded ? 'expand-less' : 'expand-more'}
              size={24}
              color={COLORS.textSecondary}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <Animated.View
            style={[
              styles.sectionContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={[TEXT_STYLES.body, styles.sectionDescription]}>
              {section.content}
            </Text>

            {/* Key Points */}
            {section.keyPoints && (
              <View style={styles.keyPointsContainer}>
                <Text style={[TEXT_STYLES.h3, styles.subsectionTitle]}>
                  Key Points
                </Text>
                {section.keyPoints.map((point, index) => (
                  <View key={index} style={styles.keyPointItem}>
                    <Icon name="check-circle" size={16} color={COLORS.safetyGreen} />
                    <Text style={[TEXT_STYLES.body, styles.keyPointText]}>
                      {point}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Table Data */}
            {section.table && (
              <View style={styles.tableContainer}>
                <Text style={[TEXT_STYLES.h3, styles.subsectionTitle]}>
                  Requirements Table
                </Text>
                {section.table.map((row, index) => (
                  <Surface key={index} style={styles.tableRow}>
                    <View style={styles.tableCell}>
                      <Text style={[TEXT_STYLES.caption, styles.tableCellLabel]}>
                        Age Group
                      </Text>
                      <Text style={[TEXT_STYLES.body, styles.tableCellValue]}>
                        {row.ageGroup}
                      </Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text style={[TEXT_STYLES.caption, styles.tableCellLabel]}>
                        Ratio
                      </Text>
                      <Text style={[TEXT_STYLES.body, styles.tableCellValue, { color: COLORS.primary }]}>
                        {row.ratio}
                      </Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text style={[TEXT_STYLES.caption, styles.tableCellLabel]}>
                        Notes
                      </Text>
                      <Text style={[TEXT_STYLES.caption, styles.tableCellNotes]}>
                        {row.notes}
                      </Text>
                    </View>
                  </Surface>
                ))}
              </View>
            )}

            {/* Emergency Steps */}
            {section.emergencySteps && (
              <View style={styles.stepsContainer}>
                <Text style={[TEXT_STYLES.h3, styles.subsectionTitle]}>
                  Emergency Response Steps
                </Text>
                {section.emergencySteps.map((step, index) => (
                  <Surface key={index} style={styles.stepCard}>
                    <View style={styles.stepHeader}>
                      <Avatar.Text
                        size={32}
                        label={step.step.toString()}
                        style={{ backgroundColor: COLORS.error }}
                        labelStyle={{ fontSize: 14, fontWeight: 'bold' }}
                      />
                      <Text style={[TEXT_STYLES.h3, styles.stepTitle]}>
                        {step.title}
                      </Text>
                    </View>
                    {step.actions.map((action, actionIndex) => (
                      <View key={actionIndex} style={styles.actionItem}>
                        <Icon name="arrow-right" size={16} color={COLORS.error} />
                        <Text style={[TEXT_STYLES.body, styles.actionText]}>
                          {action}
                        </Text>
                      </View>
                    ))}
                  </Surface>
                ))}
              </View>
            )}

            {/* Training Courses */}
            {section.trainings && (
              <View style={styles.trainingContainer}>
                <Text style={[TEXT_STYLES.h3, styles.subsectionTitle]}>
                  Required Courses
                </Text>
                {section.trainings.map((training, index) => (
                  <Surface key={index} style={styles.trainingCard}>
                    <View style={styles.trainingHeader}>
                      <View style={styles.trainingInfo}>
                        <Text style={[TEXT_STYLES.h3, styles.trainingTitle]}>
                          {training.course}
                        </Text>
                        <View style={styles.trainingMeta}>
                          <Chip
                            icon="schedule"
                            textStyle={styles.chipText}
                            style={styles.durationChip}
                          >
                            {training.duration}
                          </Chip>
                          <Chip
                            icon="refresh"
                            textStyle={styles.chipText}
                            style={styles.renewalChip}
                          >
                            {training.renewal}
                          </Chip>
                        </View>
                      </View>
                      <Button
                        mode="contained"
                        compact
                        onPress={() => handleCertificationStart(training.course)}
                        style={styles.startButton}
                      >
                        Start
                      </Button>
                    </View>
                    <Text style={[TEXT_STYLES.caption, styles.trainingTopics]}>
                      Topics: {training.topics.join(', ')}
                    </Text>
                  </Surface>
                ))}
              </View>
            )}
          </Animated.View>
        )}
      </Surface>
    );
  };

  const renderQuickReferenceModal = () => (
    <Portal>
      <Modal
        visible={showQuickReference}
        onDismiss={() => setShowQuickReference(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Surface style={styles.modalSurface}>
          <View style={styles.modalHeader}>
            <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>
              🚨 Emergency Quick Reference
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowQuickReference(false)}
            />
          </View>

          <ScrollView style={styles.modalScrollView}>
            <Text style={[TEXT_STYLES.h3, styles.emergencySubtitle]}>
              Emergency Contacts
            </Text>
            {emergencyContacts.map((contact, index) => (
              <TouchableOpacity
                key={index}
                style={styles.emergencyContactCard}
                onPress={() => handleEmergencyCall(contact.number)}
              >
                <View style={styles.contactInfo}>
                  <Text style={[TEXT_STYLES.body, styles.contactName]}>
                    {contact.name}
                  </Text>
                  <Text style={[TEXT_STYLES.h3, styles.contactNumber]}>
                    {contact.number}
                  </Text>
                  <Chip
                    textStyle={styles.chipText}
                    style={[
                      styles.contactTypeChip,
                      { backgroundColor: `${contact.type === 'emergency' ? COLORS.error : COLORS.primary}20` }
                    ]}
                  >
                    {contact.type}
                  </Chip>
                </View>
                <Icon name="call" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            ))}

            <Divider style={styles.divider} />

            <Text style={[TEXT_STYLES.h3, styles.emergencySubtitle]}>
              Quick Actions
            </Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: COLORS.error }]}
                onPress={() => navigation.navigate('IncidentReport')}
              >
                <Icon name="report-problem" size={32} color="white" />
                <Text style={[TEXT_STYLES.caption, { color: 'white', textAlign: 'center' }]}>
                  Report Incident
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: COLORS.warning }]}
                onPress={() => navigation.navigate('EmergencyProcedures')}
              >
                <Icon name="medical-services" size={32} color="white" />
                <Text style={[TEXT_STYLES.caption, { color: 'white', textAlign: 'center' }]}>
                  Medical Emergency
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: COLORS.primary }]}
                onPress={() => navigation.navigate('ParentNotifications')}
              >
                <Icon name="notifications-active" size={32} color="white" />
                <Text style={[TEXT_STYLES.caption, { color: 'white', textAlign: 'center' }]}>
                  Alert Parents
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Surface>
      </Modal>
    </Portal>
  );

  const currentGuideline = safetyGuidelines[selectedCategory];

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
              Safety Guidelines
            </Text>
            <IconButton
              icon="bookmark"
              size={24}
              iconColor="white"
              onPress={() => Alert.alert('Bookmarks', `You have ${bookmarkedGuidelines.length} bookmarked guidelines`)}
            />
          </View>

          <Searchbar
            placeholder="Search safety guidelines..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={COLORS.primary}
          />
        </View>
      </LinearGradient>

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
            <Icon
              name={category.icon}
              size={20}
              color={selectedCategory === category.id ? 'white' : COLORS.primary}
              style={styles.categoryIcon}
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
        {/* Safety Priority Banner */}
        <Surface style={styles.priorityBanner}>
          <LinearGradient
            colors={[currentGuideline.color, `${currentGuideline.color}CC`]}
            style={styles.priorityGradient}
          >
            <Icon name={currentGuideline.icon} size={32} color="white" />
            <View style={styles.priorityContent}>
              <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
                {currentGuideline.title}
              </Text>
              {renderPriorityBadge(currentGuideline.priority)}
            </View>
          </LinearGradient>
        </Surface>

        {/* Guidelines Content */}
        <View style={styles.guidelinesContainer}>
          {currentGuideline.sections.map(renderSectionContent)}
        </View>

        {/* Additional Resources */}
        <Surface style={styles.resourcesCard}>
          <Text style={[TEXT_STYLES.h3, styles.resourcesTitle]}>
            📚 Additional Resources
          </Text>
          <View style={styles.resourcesGrid}>
            <TouchableOpacity
              style={styles.resourceButton}
              onPress={() => Alert.alert('Resource', 'Opening safety training videos...')}
            >
              <Icon name="play-circle-filled" size={24} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.caption, styles.resourceLabel]}>
                Training Videos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resourceButton}
              onPress={() => Alert.alert('Resource', 'Downloading safety handbook...')}
            >
              <Icon name="picture-as-pdf" size={24} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.caption, styles.resourceLabel]}>
                Safety Handbook
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resourceButton}
              onPress={() => navigation.navigate('SafetyChecklist')}
            >
              <Icon name="checklist" size={24} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.caption, styles.resourceLabel]}>
                Safety Checklist
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resourceButton}
              onPress={() => Alert.alert('Resource', 'Opening certification portal...')}
            >
              <Icon name="verified" size={24} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.caption, styles.resourceLabel]}>
                Certifications
              </Text>
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Contact Information */}
        <Surface style={styles.contactCard}>
          <View style={styles.contactHeader}>
            <Icon name="contact-phone" size={24} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.h3, styles.contactTitle]}>
              Safety Contacts
            </Text>
          </View>
          <Text style={[TEXT_STYLES.body, styles.contactDescription]}>
            For immediate safety concerns or questions about these guidelines:
          </Text>
          <View style={styles.contactButtons}>
            <Button
              mode="contained"
              icon="call"
              onPress={() => handleEmergencyCall('1-800-SAFE-KID')}
              style={[styles.contactButton, { backgroundColor: COLORS.safetyGreen }]}
            >
              Safety Hotline
            </Button>
            <Button
              mode="outlined"
              icon="email"
              onPress={() => Alert.alert('Email', 'Opening email to safety@yourapp.com')}
              style={styles.contactButton}
            >
              Email Safety Team
            </Button>
          </View>
        </Surface>
      </ScrollView>

      {/* Floating Emergency Button */}
      <FAB
        icon="emergency"
        style={[styles.fab, { backgroundColor: COLORS.error }]}
        onPress={() => setShowQuickReference(true)}
        label="Emergency"
      />

      {renderQuickReferenceModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    elevation: 0,
    borderRadius: 12,
  },
  searchInput: {
    color: COLORS.text,
  },
  categoriesContainer: {
    marginVertical: SPACING.md,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  categoryCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    marginRight: SPACING.xs,
  },
  categoryLabel: {
    color: COLORS.primary,
  },
  categoryLabelActive: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  priorityBanner: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  priorityGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  priorityContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  priorityBadge: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  guidelinesContainer: {
    paddingHorizontal: SPACING.md,
  },
  sectionCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    marginRight: SPACING.md,
  },
  sectionTitleText: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: SPACING.xs / 2,
  },
  sectionPreview: {
    color: COLORS.textSecondary,
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionContent: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  sectionDescription: {
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  keyPointsContainer: {
    marginBottom: SPACING.md,
  },
  subsectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.primary,
  },
  keyPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  keyPointText: {
    flex: 1,
    marginLeft: SPACING.sm,
    lineHeight: 22,
  },
  tableContainer: {
    marginBottom: SPACING.md,
  },
  tableRow: {
    flexDirection: 'row',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
  },
  tableCell: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  tableCellLabel: {
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  tableCellValue: {
    fontWeight: '500',
  },
  tableCellNotes: {
    lineHeight: 18,
  },
  stepsContainer: {
    marginBottom: SPACING.md,
  },
  stepCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 67, 54, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepTitle: {
    marginLeft: SPACING.md,
    color: COLORS.error,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionText: {
    flex: 1,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
  trainingContainer: {
    marginBottom: SPACING.md,
  },
  trainingCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'rgba(118, 75, 162, 0.05)',
  },
  trainingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  trainingInfo: {
    flex: 1,
  },
  trainingTitle: {
    marginBottom: SPACING.sm,
    color: COLORS.secondary,
  },
  trainingMeta: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  chipText: {
    fontSize: 11,
  },
  durationChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    height: 24,
  },
  renewalChip: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    height: 24,
  },
  startButton: {
    backgroundColor: COLORS.secondary,
  },
  trainingTopics: {
    lineHeight: 18,
    fontStyle: 'italic',
  },
  resourcesCard: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  resourcesTitle: {
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  resourcesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  resourceButton: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    minWidth: '22%',
  },
  resourceLabel: {
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  contactCard: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  contactTitle: {
    marginLeft: SPACING.sm,
  },
  contactDescription: {
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  contactButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalSurface: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    flex: 1,
    color: COLORS.error,
  },
  modalScrollView: {
    padding: SPACING.md,
  },
  emergencySubtitle: {
    marginBottom: SPACING.md,
    color: COLORS.error,
  },
  emergencyContactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 67, 54, 0.05)',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  contactNumber: {
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  contactTypeChip: {
    alignSelf: 'flex-start',
    height: 20,
  },
  divider: {
    marginVertical: SPACING.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    minHeight: 80,
  },
});

export default SafetyGuidelines;