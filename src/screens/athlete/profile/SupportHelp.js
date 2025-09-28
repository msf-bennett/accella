import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Vibration,
  TextInput,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { 
  Card,
  Button,
  Surface,
  Portal,
  Modal,
  Divider,
  IconButton,
  Chip,
  Avatar,
  ProgressBar,
  Searchbar,
  FAB,
  List,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design constants
import { COLORS, SPACING, TEXT_STYLES } from '../../constants/theme';

const SupportHelp = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Form states
  const [feedbackForm, setFeedbackForm] = useState({
    subject: '',
    message: '',
    rating: 5,
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    urgency: 'medium',
  });

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
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call to refresh support data
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const helpCategories = [
    {
      id: 1,
      title: 'Getting Started',
      icon: 'play-arrow',
      color: COLORS.primary,
      description: 'Learn the basics of using the app',
      items: [
        'Creating your athlete profile',
        'Finding and connecting with coaches',
        'Understanding your dashboard',
        'Setting up training goals',
      ],
    },
    {
      id: 2,
      title: 'Training & Sessions',
      icon: 'fitness-center',
      color: COLORS.success,
      description: 'Everything about training sessions',
      items: [
        'Viewing assigned workouts',
        'Tracking your progress',
        'Submitting feedback to coaches',
        'Understanding training plans',
      ],
    },
    {
      id: 3,
      title: 'Performance Tracking',
      icon: 'trending-up',
      color: '#FF6B35',
      description: 'Monitor your athletic progress',
      items: [
        'Recording personal records',
        'Understanding performance metrics',
        'Viewing progress charts',
        'Setting improvement goals',
      ],
    },
    {
      id: 4,
      title: 'Communication',
      icon: 'chat',
      color: '#9C27B0',
      description: 'Connect with coaches and teammates',
      items: [
        'Messaging your coach',
        'Group chat features',
        'Video call support',
        'Notification settings',
      ],
    },
    {
      id: 5,
      title: 'Account & Settings',
      icon: 'settings',
      color: COLORS.secondary,
      description: 'Manage your account preferences',
      items: [
        'Updating profile information',
        'Privacy and security settings',
        'Subscription management',
        'Data export and deletion',
      ],
    },
    {
      id: 6,
      title: 'Technical Issues',
      icon: 'bug-report',
      color: COLORS.error,
      description: 'Troubleshooting common problems',
      items: [
        'App crashes and freezing',
        'Sync and connectivity issues',
        'Video playback problems',
        'Notification not working',
      ],
    },
  ];

  const faqData = [
    {
      id: 1,
      question: 'How do I connect with a coach?',
      answer: 'You can search for coaches in the "Find Coaches" section. Use filters for sport, location, and specialization to find the perfect match. Send connection requests and wait for approval.',
      category: 'Getting Started',
    },
    {
      id: 2,
      question: 'Why can\'t I see my training sessions?',
      answer: 'Make sure you\'re connected with a coach who has assigned you training plans. Check your internet connection and try refreshing the app. If the issue persists, contact your coach directly.',
      category: 'Training & Sessions',
    },
    {
      id: 3,
      question: 'How do I track my progress effectively?',
      answer: 'Consistently log your workouts, record personal bests, and submit feedback after each session. Use the progress dashboard to view your improvements over time.',
      category: 'Performance Tracking',
    },
    {
      id: 4,
      question: 'Can I message my coach privately?',
      answer: 'Yes! You can send private messages to your coach through the chat feature. They\'ll receive notifications and can respond when available.',
      category: 'Communication',
    },
    {
      id: 5,
      question: 'How do I change my notification settings?',
      answer: 'Go to Settings > Notifications to customize when and how you receive alerts for training sessions, messages, and progress updates.',
      category: 'Account & Settings',
    },
    {
      id: 6,
      question: 'The app keeps crashing, what should I do?',
      answer: 'Try restarting the app and your device. Ensure you have the latest version installed. Clear the app cache if the problem persists. Contact support if crashes continue.',
      category: 'Technical Issues',
    },
  ];

  const quickActions = [
    {
      id: 1,
      title: 'Live Chat',
      icon: 'chat-bubble',
      color: COLORS.primary,
      action: () => Alert.alert('Live Chat! 💬', 'Live chat support will be available in the next update. You can contact us via email for now.'),
    },
    {
      id: 2,
      title: 'Call Support',
      icon: 'phone',
      color: COLORS.success,
      action: () => {
        Alert.alert(
          'Call Support 📞',
          'Would you like to call our support team?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call Now', onPress: () => Linking.openURL('tel:+254700123456') }
          ]
        );
      },
    },
    {
      id: 3,
      title: 'Email Us',
      icon: 'email',
      color: '#FF6B35',
      action: () => {
        Linking.openURL('mailto:support@trainingapp.com?subject=Support Request');
      },
    },
    {
      id: 4,
      title: 'Report Bug',
      icon: 'bug-report',
      color: COLORS.error,
      action: () => setFeedbackModalVisible(true),
    },
  ];

  const handleSubmitFeedback = () => {
    if (!feedbackForm.subject || !feedbackForm.message) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    // Simulate feedback submission
    setFeedbackModalVisible(false);
    setFeedbackForm({ subject: '', message: '', rating: 5 });
    Vibration.vibrate(50);
    Alert.alert('Thank You! 🙏', 'Your feedback has been submitted successfully. We appreciate your input!');
  };

  const handleSubmitContact = () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    // Simulate contact form submission
    setContactModalVisible(false);
    setContactForm({ name: '', email: '', subject: '', message: '', urgency: 'medium' });
    Vibration.vibrate(50);
    Alert.alert('Message Sent! ✅', 'We\'ve received your message and will respond within 24 hours.');
  };

  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const SupportCard = ({ title, children, icon, color }) => (
    <Card style={styles.supportCard}>
      <Surface style={[styles.cardHeader, { backgroundColor: color }]}>
        <View style={styles.cardHeaderContent}>
          <MaterialIcons name={icon} size={24} color="white" />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
      </Surface>
      <View style={styles.cardContent}>
        {children}
      </View>
    </Card>
  );

  const CategoryCard = ({ category, onPress }) => (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.categoryCard}>
        <View style={styles.categoryContent}>
          <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
            <MaterialIcons name={category.icon} size={24} color={category.color} />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
            <Text style={styles.categoryItems}>{category.items.length} topics</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={COLORS.secondary} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  const QuickActionButton = ({ action, onPress }) => (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
        <MaterialIcons name={action.icon} size={20} color={action.color} />
      </View>
      <Text style={styles.quickActionText}>{action.title}</Text>
    </TouchableOpacity>
  );

  const FAQItem = ({ faq, isExpanded, onToggle }) => (
    <Card style={styles.faqCard}>
      <TouchableOpacity onPress={onToggle}>
        <View style={styles.faqHeader}>
          <Text style={styles.faqQuestion}>{faq.question}</Text>
          <MaterialIcons
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={20}
            color={COLORS.secondary}
          />
        </View>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
          <Chip
            style={styles.faqCategory}
            textStyle={styles.faqCategoryText}
          >
            {faq.category}
          </Chip>
        </View>
      )}
    </Card>
  );

  const RatingStars = ({ rating, onRatingChange }) => (
    <View style={styles.ratingContainer}>
      <Text style={styles.ratingLabel}>Rate your experience:</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingChange(star)}
            style={styles.starButton}
          >
            <MaterialIcons
              name={star <= rating ? 'star' : 'star-border'}
              size={24}
              color={star <= rating ? '#FFD700' : COLORS.secondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor="white"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>Support & Help</Text>
          <Text style={styles.headerSubtitle}>We're here to help you succeed! 🚀</Text>
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          style={styles.scrollView}
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
          {/* Quick Actions */}
          <SupportCard title="Quick Actions" icon="flash-on" color={COLORS.primary}>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <QuickActionButton
                  key={action.id}
                  action={action}
                  onPress={action.action}
                />
              ))}
            </View>
          </SupportCard>

          {/* Help Categories */}
          <SupportCard title="Help Categories" icon="help-outline" color={COLORS.success}>
            {helpCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onPress={() => {
                  Alert.alert(
                    category.title,
                    `Topics covered:\n\n${category.items.map(item => `• ${item}`).join('\n')}`
                  );
                }}
              />
            ))}
          </SupportCard>

          {/* FAQ Section */}
          <SupportCard title="Frequently Asked Questions" icon="quiz" color="#FF6B35">
            <Searchbar
              placeholder="Search FAQs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
              iconColor={COLORS.primary}
            />
            
            {filteredFAQs.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="search-off" size={48} color={COLORS.secondary} />
                <Text style={styles.emptyText}>No FAQs found for your search</Text>
              </View>
            ) : (
              filteredFAQs.map((faq) => (
                <FAQItem
                  key={faq.id}
                  faq={faq}
                  isExpanded={expandedFAQ === faq.id}
                  onToggle={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                />
              ))
            )}
          </SupportCard>

          {/* Contact Information */}
          <SupportCard title="Contact Information" icon="contacts" color="#9C27B0">
            <View style={styles.contactInfo}>
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => Linking.openURL('mailto:support@trainingapp.com')}
              >
                <MaterialIcons name="email" size={20} color={COLORS.primary} />
                <Text style={styles.contactText}>support@trainingapp.com</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => Linking.openURL('tel:+254700123456')}
              >
                <MaterialIcons name="phone" size={20} color={COLORS.success} />
                <Text style={styles.contactText}>+254 700 123 456</Text>
              </TouchableOpacity>
              
              <View style={styles.contactItem}>
                <MaterialIcons name="schedule" size={20} color="#FF6B35" />
                <Text style={styles.contactText}>Support Hours: 8AM - 6PM EAT</Text>
              </View>
            </View>

            <Button
              mode="contained"
              icon="send"
              style={styles.contactButton}
              buttonColor={COLORS.primary}
              onPress={() => setContactModalVisible(true)}
            >
              Send Message
            </Button>
          </SupportCard>

          {/* App Information */}
          <SupportCard title="App Information" icon="info" color={COLORS.secondary}>
            <View style={styles.appInfo}>
              <Text style={styles.appInfoText}>Version: 1.0.0</Text>
              <Text style={styles.appInfoText}>Build: 2024.08.22</Text>
              <Text style={styles.appInfoText}>Last Updated: Aug 22, 2024</Text>
            </View>

            <View style={styles.appLinks}>
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Privacy Policy will be available in the next update.')}
              >
                <Text style={styles.linkText}>Privacy Policy</Text>
                <MaterialIcons name="chevron-right" size={16} color={COLORS.primary} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Terms of Service will be available in the next update.')}
              >
                <Text style={styles.linkText}>Terms of Service</Text>
                <MaterialIcons name="chevron-right" size={16} color={COLORS.primary} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Release Notes will be available in the next update.')}
              >
                <Text style={styles.linkText}>What's New</Text>
                <MaterialIcons name="chevron-right" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </SupportCard>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        <FAB
          icon="feedback"
          style={styles.fab}
          onPress={() => setFeedbackModalVisible(true)}
          color="white"
        />
      </Animated.View>

      {/* Contact Modal */}
      <Portal>
        <Modal
          visible={contactModalVisible}
          onDismiss={() => setContactModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.blurView}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="white"
          >
            <Card style={styles.contactModal}>
              <Text style={styles.modalTitle}>Contact Support 📧</Text>
              
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Your Name"
                  value={contactForm.name}
                  onChangeText={(text) => setContactForm(prev => ({ ...prev, name: text }))}
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="Email Address"
                  value={contactForm.email}
                  onChangeText={(text) => setContactForm(prev => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="Subject (Optional)"
                  value={contactForm.subject}
                  onChangeText={(text) => setContactForm(prev => ({ ...prev, subject: text }))}
                />

                <Text style={styles.inputLabel}>Priority Level:</Text>
                <View style={styles.urgencyContainer}>
                  {['low', 'medium', 'high'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.urgencyButton,
                        contactForm.urgency === level && styles.urgencyButtonActive
                      ]}
                      onPress={() => setContactForm(prev => ({ ...prev, urgency: level }))}
                    >
                      <Text style={[
                        styles.urgencyText,
                        contactForm.urgency === level && styles.urgencyTextActive
                      ]}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={[styles.textInput, styles.messageInput]}
                  placeholder="Describe your issue or question..."
                  value={contactForm.message}
                  onChangeText={(text) => setContactForm(prev => ({ ...prev, message: text }))}
                  multiline
                  numberOfLines={4}
                />
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setContactModalVisible(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmitContact}
                  style={styles.modalButton}
                  buttonColor={COLORS.primary}
                >
                  Send Message
                </Button>
              </View>
            </Card>
          </BlurView>
        </Modal>
      </Portal>

      {/* Feedback Modal */}
      <Portal>
        <Modal
          visible={feedbackModalVisible}
          onDismiss={() => setFeedbackModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.blurView}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="white"
          >
            <Card style={styles.feedbackModal}>
              <Text style={styles.modalTitle}>Send Feedback 💬</Text>
              
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <RatingStars
                  rating={feedbackForm.rating}
                  onRatingChange={(rating) => setFeedbackForm(prev => ({ ...prev, rating }))}
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="Subject"
                  value={feedbackForm.subject}
                  onChangeText={(text) => setFeedbackForm(prev => ({ ...prev, subject: text }))}
                />

                <TextInput
                  style={[styles.textInput, styles.messageInput]}
                  placeholder="Tell us about your experience or report a bug..."
                  value={feedbackForm.message}
                  onChangeText={(text) => setFeedbackForm(prev => ({ ...prev, message: text }))}
                  multiline
                  numberOfLines={4}
                />
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setFeedbackModalVisible(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmitFeedback}
                  style={styles.modalButton}
                  buttonColor={COLORS.primary}
                >
                  Submit Feedback
                </Button>
              </View>
            </Card>
          </BlurView>
        </Modal>
      </Portal>
    </>
  );
};

const styles = {
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  supportCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    ...TEXT_STYLES.h4,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  quickActionButton: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    fontWeight: '600',
  },
  categoryCard: {
    marginBottom: SPACING.md,
    borderRadius: 8,
    elevation: 1,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  categoryDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  categoryItems: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  searchBar: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  faqCard: {
    marginBottom: SPACING.md,
    borderRadius: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  faqQuestion: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  faqAnswer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  faqAnswerText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  faqCategory: {
    alignSelf: 'flex-start',
    backgroundColor: `${COLORS.primary}20`,
  },
  faqCategoryText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    marginTop: SPACING.md,
  },
  contactInfo: {
    marginBottom: SPACING.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  contactText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  contactButton: {
    marginTop: SPACING.md,
  },
  appInfo: {
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  appInfoText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    paddingVertical: SPACING.xs,
  },
  appLinks: {
    gap: SPACING.sm,
  },
  linkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  linkText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: SPACING.xl * 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactModal: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: SPACING.lg,
  },
  feedbackModal: {
    width: '90%',
    maxHeight: '75%',
    borderRadius: 12,
    padding: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  modalContent: {
    maxHeight: 400,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  messageInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  urgencyContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  urgencyButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  urgencyText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  urgencyTextActive: {
    color: 'white',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  ratingLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  starButton: {
    padding: SPACING.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
};

export default SupportHelp;