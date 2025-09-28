import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  TextInput,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import {
  Card,
  Button,
  Surface,
  IconButton,
  Avatar,
  Chip,
  ProgressBar,
  Portal,
  Modal,
  Divider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Constants (these would typically be imported from your constants file)
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f8f9fa',
  white: '#ffffff',
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
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
};

const { width } = Dimensions.get('window');

const ReportIssue = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [issueDescription, setIssueDescription] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const issueCategories = [
    {
      id: 'safety',
      title: 'Safety Concern',
      subtitle: 'Report safety issues or uncomfortable situations',
      icon: 'security',
      color: COLORS.error,
      urgent: true,
      description: 'Use this for any situation that makes you feel unsafe or uncomfortable',
    },
    {
      id: 'inappropriate',
      title: 'Inappropriate Content',
      subtitle: 'Report inappropriate messages or content',
      icon: 'report',
      color: COLORS.warning,
      urgent: true,
      description: 'Report any content that seems inappropriate or makes you uncomfortable',
    },
    {
      id: 'technical',
      title: 'App Problem',
      subtitle: 'Something not working correctly',
      icon: 'bug-report',
      color: COLORS.primary,
      urgent: false,
      description: 'Report crashes, slow loading, or features that aren\'t working',
    },
    {
      id: 'training',
      title: 'Training Issue',
      subtitle: 'Problems with sessions or exercises',
      icon: 'fitness-center',
      color: COLORS.secondary,
      urgent: false,
      description: 'Report issues with training plans, sessions, or exercises',
    },
    {
      id: 'coach',
      title: 'Coach Communication',
      subtitle: 'Issues with coach interactions',
      icon: 'person',
      color: COLORS.warning,
      urgent: true,
      description: 'Report concerns about coach communication or behavior',
    },
    {
      id: 'other',
      title: 'Something Else',
      subtitle: 'Other concerns or feedback',
      icon: 'help',
      color: COLORS.textSecondary,
      urgent: false,
      description: 'Anything else you\'d like to report or ask about',
    },
  ];

  const urgencyLevels = [
    { id: 'low', label: 'Not Urgent', color: COLORS.success, icon: 'schedule' },
    { id: 'medium', label: 'Somewhat Urgent', color: COLORS.warning, icon: 'warning' },
    { id: 'high', label: 'Very Urgent', color: COLORS.error, icon: 'priority-high' },
  ];

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    
    // Animate selection
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
    }).start();

    // Auto-set urgency for safety issues
    if (category.urgent) {
      setUrgencyLevel('high');
    }

    // Show immediate help for safety concerns
    if (category.id === 'safety') {
      Alert.alert(
        '🚨 Safety First',
        'If this is an emergency, please contact emergency services immediately. For other safety concerns, we\'ll notify your parent right away.',
        [
          { text: 'Emergency Call', onPress: () => Alert.alert('Call 911 or your local emergency number') },
          { text: 'Continue Report', style: 'cancel' },
        ]
      );
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedCategory || !issueDescription.trim()) {
      Alert.alert('⚠️ Missing Information', 'Please select a category and describe the issue.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitting(false);
      setShowThankYou(true);
      
      // Reset form
      setTimeout(() => {
        setSelectedCategory(null);
        setIssueDescription('');
        setUrgencyLevel('medium');
        setShowThankYou(false);
        animatedValue.setValue(0);
      }, 3000);

    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('❌ Submission Error', 'Please try again or contact support directly.');
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-back"
            iconColor={COLORS.white}
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Report an Issue</Text>
          <IconButton
            icon="help"
            iconColor={COLORS.white}
            size={24}
            onPress={() => Alert.alert('💡 How to Report', 'Choose what type of issue you\'re having, describe it clearly, and we\'ll help you solve it!')}
          />
        </View>
        <Text style={styles.headerSubtitle}>
          We're here to help and keep you safe 🛡️
        </Text>
      </View>
    </LinearGradient>
  );

  const renderEmergencyBanner = () => (
    <View style={styles.emergencyBanner}>
      <Surface style={styles.emergencySurface} elevation={4}>
        <View style={styles.emergencyContent}>
          <Icon name="emergency" size={24} color={COLORS.error} />
          <View style={styles.emergencyText}>
            <Text style={styles.emergencyTitle}>Emergency?</Text>
            <Text style={styles.emergencySubtitle}>
              If you're in immediate danger, call emergency services now!
            </Text>
          </View>
          <Button
            mode="contained"
            icon="call"
            onPress={() => Alert.alert('Emergency', 'Call 911 or your local emergency number immediately!')}
            style={styles.emergencyButton}
            buttonColor={COLORS.error}
            compact
          >
            Call Help
          </Button>
        </View>
      </Surface>
    </View>
  );

  const renderCategorySelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>What's the issue about? 🤔</Text>
      <View style={styles.categoriesGrid}>
        {issueCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              selectedCategory?.id === category.id && styles.selectedCategoryCard,
            ]}
            onPress={() => handleCategorySelect(category)}
            activeOpacity={0.7}
          >
            <Surface style={[
              styles.categorySurface,
              selectedCategory?.id === category.id && { backgroundColor: category.color + '20' },
            ]} elevation={2}>
              <View style={styles.categoryIcon}>
                <Icon name={category.icon} size={32} color={category.color} />
                {category.urgent && (
                  <View style={styles.urgentBadge}>
                    <Icon name="priority-high" size={12} color={COLORS.white} />
                  </View>
                )}
              </View>
              <Text style={[
                styles.categoryTitle,
                selectedCategory?.id === category.id && { color: category.color },
              ]}>
                {category.title}
              </Text>
              <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
              {selectedCategory?.id === category.id && (
                <Animated.View 
                  style={[
                    styles.categoryDescription,
                    {
                      opacity: animatedValue,
                      transform: [{
                        translateY: animatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0],
                        }),
                      }],
                    },
                  ]}
                >
                  <Text style={styles.categoryDescriptionText}>
                    {category.description}
                  </Text>
                </Animated.View>
              )}
            </Surface>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderUrgencySelection = () => {
    if (!selectedCategory) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How urgent is this? ⚡</Text>
        <Card style={styles.urgencyCard}>
          <Card.Content>
            <View style={styles.urgencyOptions}>
              {urgencyLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.urgencyOption,
                    urgencyLevel === level.id && styles.selectedUrgencyOption,
                    { borderColor: urgencyLevel === level.id ? level.color : COLORS.border },
                  ]}
                  onPress={() => setUrgencyLevel(level.id)}
                  activeOpacity={0.7}
                >
                  <Icon 
                    name={level.icon} 
                    size={20} 
                    color={urgencyLevel === level.id ? level.color : COLORS.textSecondary} 
                  />
                  <Text style={[
                    styles.urgencyLabel,
                    urgencyLevel === level.id && { color: level.color, fontWeight: '600' },
                  ]}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderDescriptionInput = () => {
    if (!selectedCategory) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tell us more about it 📝</Text>
        <Card style={styles.inputCard}>
          <Card.Content style={styles.inputContent}>
            <View style={styles.inputHeader}>
              <Icon name="edit" size={20} color={COLORS.primary} />
              <Text style={styles.inputTitle}>Describe the issue</Text>
            </View>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={6}
              placeholder="Please describe what happened. The more details you provide, the better we can help you..."
              placeholderTextColor={COLORS.textSecondary}
              value={issueDescription}
              onChangeText={setIssueDescription}
              maxLength={500}
            />
            <View style={styles.inputFooter}>
              <Text style={styles.characterCount}>
                {issueDescription.length}/500 characters
              </Text>
              <View style={styles.inputTips}>
                <Icon name="lightbulb" size={16} color={COLORS.warning} />
                <Text style={styles.tipText}>
                  Tip: Include when it happened and what you were doing
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderParentNotification = () => {
    if (!selectedCategory) return null;

    return (
      <View style={styles.section}>
        <Card style={styles.parentCard}>
          <LinearGradient
            colors={[COLORS.primary + '20', COLORS.primary + '10']}
            style={styles.parentGradient}
          >
            <Card.Content style={styles.parentContent}>
              <View style={styles.parentHeader}>
                <Avatar.Icon 
                  size={40} 
                  icon="family-restroom" 
                  style={styles.parentAvatar}
                  color={COLORS.primary}
                />
                <View style={styles.parentInfo}>
                  <Text style={styles.parentTitle}>Parent Will Be Notified</Text>
                  <Text style={styles.parentSubtitle}>
                    Your parent or guardian will receive a copy of this report
                  </Text>
                </View>
              </View>
              {selectedCategory?.urgent && (
                <View style={styles.urgentNotification}>
                  <Icon name="notifications-active" size={20} color={COLORS.error} />
                  <Text style={styles.urgentText}>
                    This will be sent as an urgent notification
                  </Text>
                </View>
              )}
            </Card.Content>
          </LinearGradient>
        </Card>
      </View>
    );
  };

  const renderSubmitSection = () => {
    if (!selectedCategory) return null;

    const canSubmit = selectedCategory && issueDescription.trim().length >= 10;

    return (
      <View style={styles.submitSection}>
        <Card style={styles.submitCard}>
          <Card.Content style={styles.submitContent}>
            <View style={styles.submitInfo}>
              <Icon name="send" size={24} color={COLORS.primary} />
              <View style={styles.submitText}>
                <Text style={styles.submitTitle}>Ready to Submit?</Text>
                <Text style={styles.submitSubtitle}>
                  We'll review your report and get back to you soon
                </Text>
              </View>
            </View>
            
            {!canSubmit && (
              <View style={styles.submitRequirements}>
                <Text style={styles.requirementsTitle}>Please complete:</Text>
                <View style={styles.requirement}>
                  <Icon 
                    name={selectedCategory ? "check-circle" : "radio-button-unchecked"} 
                    size={16} 
                    color={selectedCategory ? COLORS.success : COLORS.textSecondary} 
                  />
                  <Text style={styles.requirementText}>Select issue category</Text>
                </View>
                <View style={styles.requirement}>
                  <Icon 
                    name={issueDescription.trim().length >= 10 ? "check-circle" : "radio-button-unchecked"} 
                    size={16} 
                    color={issueDescription.trim().length >= 10 ? COLORS.success : COLORS.textSecondary} 
                  />
                  <Text style={styles.requirementText}>Write at least 10 characters</Text>
                </View>
              </View>
            )}
            
            <Button
              mode="contained"
              icon={isSubmitting ? "hourglass-empty" : "send"}
              onPress={handleSubmitReport}
              disabled={!canSubmit || isSubmitting}
              loading={isSubmitting}
              style={[
                styles.submitButton,
                !canSubmit && styles.submitButtonDisabled,
              ]}
              buttonColor={canSubmit ? COLORS.primary : COLORS.textSecondary}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderQuickHelp = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🚀 Need Help Right Now?</Text>
      <View style={styles.quickHelpGrid}>
        <TouchableOpacity
          style={styles.quickHelpCard}
          onPress={() => Alert.alert('Feature Coming Soon', 'Live chat with support coming soon! 💬')}
          activeOpacity={0.7}
        >
          <Surface style={styles.quickHelpSurface} elevation={2}>
            <Icon name="chat" size={24} color={COLORS.primary} />
            <Text style={styles.quickHelpTitle}>Live Chat</Text>
            <Text style={styles.quickHelpSubtitle}>Talk to support now</Text>
          </Surface>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickHelpCard}
          onPress={() => navigation.navigate('HelpCenter')}
          activeOpacity={0.7}
        >
          <Surface style={styles.quickHelpSurface} elevation={2}>
            <Icon name="help" size={24} color={COLORS.success} />
            <Text style={styles.quickHelpTitle}>Help Center</Text>
            <Text style={styles.quickHelpSubtitle}>Find answers now</Text>
          </Surface>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickHelpCard}
          onPress={() => Alert.alert('📞 Call Support', 'Call our child support team at +1-234-567-8900')}
          activeOpacity={0.7}
        >
          <Surface style={styles.quickHelpSurface} elevation={2}>
            <Icon name="call" size={24} color={COLORS.warning} />
            <Text style={styles.quickHelpTitle}>Call Support</Text>
            <Text style={styles.quickHelpSubtitle}>Speak with our team</Text>
          </Surface>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentReports = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📋 Your Recent Reports</Text>
      <Card style={styles.reportsCard}>
        <Card.Content>
          {[
            { id: 1, type: 'Technical', status: 'resolved', date: '2 days ago', title: 'App crashes during video loading' },
            { id: 2, type: 'Training', status: 'in_progress', date: '5 days ago', title: 'Exercise instructions unclear' },
          ].map((report, index) => (
            <View key={report.id}>
              {index > 0 && <Divider style={styles.reportDivider} />}
              <View style={styles.reportItem}>
                <View style={styles.reportInfo}>
                  <View style={styles.reportHeader}>
                    <Chip 
                      mode="flat" 
                      style={[
                        styles.reportTypeChip,
                        { backgroundColor: report.type === 'Technical' ? COLORS.primary + '20' : COLORS.secondary + '20' }
                      ]}
                      textStyle={styles.reportTypeText}
                    >
                      {report.type}
                    </Chip>
                    <Chip 
                      mode="flat" 
                      style={[
                        styles.statusChip,
                        report.status === 'resolved' 
                          ? { backgroundColor: COLORS.success + '20' }
                          : { backgroundColor: COLORS.warning + '20' }
                      ]}
                      textStyle={[
                        styles.statusText,
                        { color: report.status === 'resolved' ? COLORS.success : COLORS.warning }
                      ]}
                    >
                      {report.status === 'resolved' ? '✅ Resolved' : '⏳ In Progress'}
                    </Chip>
                  </View>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportDate}>{report.date}</Text>
                </View>
                <IconButton
                  icon="chevron-right"
                  size={20}
                  iconColor={COLORS.textSecondary}
                  onPress={() => Alert.alert('Feature Coming Soon', 'Report details viewer coming soon! 📄')}
                />
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>
    </View>
  );

  const renderThankYouModal = () => (
    <Portal>
      <Modal
        visible={showThankYou}
        dismissable={false}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.thankYouSurface} elevation={8}>
          <LinearGradient
            colors={[COLORS.success, COLORS.success + 'CC']}
            style={styles.thankYouGradient}
          >
            <View style={styles.thankYouContent}>
              <Avatar.Icon 
                size={80} 
                icon="check-circle" 
                style={styles.thankYouAvatar}
                color={COLORS.success}
              />
              <Text style={styles.thankYouTitle}>Thank You! 🎉</Text>
              <Text style={styles.thankYouMessage}>
                Your report has been submitted successfully. We'll review it and get back to you soon.
              </Text>
              <Text style={styles.thankYouSubMessage}>
                Your parent has been notified and will receive updates.
              </Text>
            </View>
          </LinearGradient>
        </Surface>
      </Modal>
    </Portal>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar
        backgroundColor={COLORS.primary}
        barStyle="light-content"
        translucent
      />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderEmergencyBanner()}
        {renderQuickHelp()}
        {renderCategorySelection()}
        {renderUrgencySelection()}
        {renderDescriptionInput()}
        {renderParentNotification()}
        {renderRecentReports()}
        {renderSubmitSection()}
      </ScrollView>
      
      {renderThankYouModal()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheading,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  emergencyBanner: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  emergencySurface: {
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  emergencyText: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.md,
  },
  emergencyTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.error,
  },
  emergencySubtitle: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  emergencyButton: {
    borderRadius: 8,
  },
  quickHelpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  quickHelpCard: {
    width: (width - SPACING.md * 4) / 3,
    marginBottom: SPACING.sm,
  },
  quickHelpSurface: {
    borderRadius: 12,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    alignItems: 'center',
  },
  quickHelpTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  quickHelpSubtitle: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontSize: 10,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - SPACING.md * 3) / 2,
    marginBottom: SPACING.md,
  },
  selectedCategoryCard: {
    transform: [{ scale: 1.02 }],
  },
  categorySurface: {
    borderRadius: 12,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    minHeight: 120,
  },
  categoryIcon: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  urgentBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    padding: 2,
  },
  categoryTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  categorySubtitle: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    lineHeight: 16,
  },
  categoryDescription: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 6,
  },
  categoryDescriptionText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    lineHeight: 14,
    fontStyle: 'italic',
  },
  urgencyCard: {
    backgroundColor: COLORS.white,
    elevation: 2,
    borderRadius: 12,
  },
  urgencyOptions: {
    gap: SPACING.sm,
  },
  urgencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedUrgencyOption: {
    backgroundColor: COLORS.background,
  },
  urgencyLabel: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
  },
  inputCard: {
    backgroundColor: COLORS.white,
    elevation: 2,
    borderRadius: 12,
  },
  inputContent: {
    paddingVertical: SPACING.lg,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  inputTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  textInput: {
    ...TEXT_STYLES.body,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    textAlignVertical: 'top',
    minHeight: 120,
    backgroundColor: COLORS.background,
  },
  inputFooter: {
    marginTop: SPACING.sm,
  },
  characterCount: {
    ...TEXT_STYLES.caption,
    textAlign: 'right',
    marginBottom: SPACING.sm,
  },
  inputTips: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontStyle: 'italic',
    // Missing styles to complete the StyleSheet.create() object:

  },
  parentCard: {
    backgroundColor: COLORS.white,
    elevation: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  parentGradient: {
    borderRadius: 12,
  },
  parentContent: {
    paddingVertical: SPACING.lg,
  },
  parentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  parentAvatar: {
    backgroundColor: COLORS.white,
  },
  parentInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  parentTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  parentSubtitle: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  urgentNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.error + '20',
    borderRadius: 6,
  },
  urgentText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    color: COLORS.error,
    fontWeight: '600',
  },
  submitSection: {
    paddingHorizontal: SPACING.md,
  },
  submitCard: {
    backgroundColor: COLORS.white,
    elevation: 2,
    borderRadius: 12,
  },
  submitContent: {
    paddingVertical: SPACING.lg,
  },
  submitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  submitText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  submitTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  submitSubtitle: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  submitRequirements: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  requirementsTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  requirementText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: SPACING.xs,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  reportsCard: {
    backgroundColor: COLORS.white,
    elevation: 2,
    borderRadius: 12,
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  reportInfo: {
    flex: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  reportTypeChip: {
    height: 24,
  },
  reportTypeText: {
    fontSize: 11,
  },
  statusChip: {
    height: 24,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reportTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  reportDate: {
    ...TEXT_STYLES.caption,
  },
  reportDivider: {
    marginVertical: SPACING.sm,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  thankYouSurface: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 320,
  },
  thankYouGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  thankYouContent: {
    alignItems: 'center',
  },
  thankYouAvatar: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.lg,
  },
  thankYouTitle: {
    ...TEXT_STYLES.heading,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  thankYouMessage: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  thankYouSubMessage: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
  },
});

// Export statement
export default ReportIssue;