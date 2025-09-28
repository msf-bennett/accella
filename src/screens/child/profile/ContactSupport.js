import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  StatusBar,
  Vibration,
  Platform,
  Animated,
  Linking,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  TextInput,
  Surface,
  Chip,
  List,
  Avatar,
  Portal,
  Modal,
  IconButton,
  ProgressBar,
  Searchbar,
  FAB,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../styles/theme';

const { width } = Dimensions.get('window');

const ContactSupport = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.settings);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  
  // Form states
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    urgency: 'normal',
    category: 'general',
  });
  
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'suggestion',
    rating: 5,
    message: '',
  });

  // Initialize animations
  useEffect(() => {
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call for latest FAQs and support info
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh support information');
    }
    setRefreshing(false);
  }, []);

  const supportCategories = [
    { id: 'all', label: 'All', icon: 'apps', color: COLORS.primary },
    { id: 'technical', label: 'Technical', icon: 'build', color: COLORS.warning },
    { id: 'account', label: 'Account', icon: 'person', color: COLORS.success },
    { id: 'training', label: 'Training', icon: 'fitness-center', color: COLORS.secondary },
    { id: 'safety', label: 'Safety', icon: 'security', color: COLORS.error },
  ];

  const faqData = [
    {
      id: 1,
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'Go to Account Settings from your profile menu. Tap the edit button and update your information. Remember to ask a parent or guardian for help with important changes! 👨‍👩‍👧‍👦',
      helpful: 28,
    },
    {
      id: 2,
      category: 'training',
      question: 'What should I do if I miss a training session?',
      answer: 'Don\'t worry! You can catch up by watching the session replay in your training plan. Mark it as completed when you finish, and talk to your coach about making up any missed activities. 💪',
      helpful: 35,
    },
    {
      id: 3,
      category: 'technical',
      question: 'The app is running slowly on my device',
      answer: 'Try closing other apps running in the background. If that doesn\'t help, restart your device. Make sure you have the latest version of the app installed! 📱',
      helpful: 22,
    },
    {
      id: 4,
      category: 'safety',
      question: 'Who can see my personal information?',
      answer: 'Only you, your parents/guardians, and your assigned coach can see your profile. We never share your information with strangers. Your safety is our top priority! 🔒',
      helpful: 41,
    },
    {
      id: 5,
      category: 'training',
      question: 'How do I track my progress?',
      answer: 'Check your Dashboard for progress charts, achievement badges, and skill improvements. You can also view your training history and upcoming sessions! 📊',
      helpful: 33,
    },
  ];

  const quickActions = [
    {
      title: 'Chat with Support',
      subtitle: 'Get instant help',
      icon: 'chat',
      color: COLORS.primary,
      action: () => setShowContactModal(true),
    },
    {
      title: 'Report a Problem',
      subtitle: 'Technical issues',
      icon: 'bug-report',
      color: COLORS.warning,
      action: () => handleReportProblem(),
    },
    {
      title: 'Send Feedback',
      subtitle: 'Share your thoughts',
      icon: 'feedback',
      color: COLORS.success,
      action: () => setShowFeedbackModal(true),
    },
    {
      title: 'Safety Concerns',
      subtitle: 'Report safety issues',
      icon: 'security',
      color: COLORS.error,
      action: () => handleSafetyConcern(),
    },
  ];

  const handleReportProblem = () => {
    Alert.alert(
      'Report a Problem 🐛',
      'We\'ll help you fix any technical issues. A support team member will contact you soon!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => setShowContactModal(true) }
      ]
    );
  };

  const handleSafetyConcern = () => {
    Alert.alert(
      'Safety First! 🛡️',
      'Safety is our top priority. This will immediately notify our safety team and your parent/guardian.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Report Now', 
          style: 'destructive',
          onPress: () => {
            Vibration.vibrate(100);
            Alert.alert('Safety Report Sent', 'Your safety concern has been reported. A team member will contact you within 15 minutes.');
          }
        }
      ]
    );
  };

  const handleContactSubmit = async () => {
    if (!contactForm.subject || !contactForm.message) {
      Alert.alert('Missing Information', 'Please fill in both subject and message fields.');
      return;
    }

    try {
      Vibration.vibrate(50);
      
      // Simulate API call
      dispatch({
        type: 'SUBMIT_SUPPORT_REQUEST',
        payload: {
          ...contactForm,
          userId: user?.id,
          timestamp: new Date().toISOString(),
        }
      });

      Alert.alert(
        'Message Sent! 📧',
        'Thank you for contacting us! We\'ll get back to you within 24 hours.',
        [{ text: 'OK', onPress: () => {
          setShowContactModal(false);
          setContactForm({ subject: '', message: '', urgency: 'normal', category: 'general' });
        }}]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackForm.message) {
      Alert.alert('Missing Information', 'Please tell us what you think!');
      return;
    }

    try {
      Vibration.vibrate(50);
      
      dispatch({
        type: 'SUBMIT_FEEDBACK',
        payload: {
          ...feedbackForm,
          userId: user?.id,
          timestamp: new Date().toISOString(),
        }
      });

      Alert.alert(
        'Thank You! 🌟',
        'Your feedback helps us make the app better for everyone!',
        [{ text: 'OK', onPress: () => {
          setShowFeedbackModal(false);
          setFeedbackForm({ type: 'suggestion', rating: 5, message: '' });
        }}]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send feedback. Please try again.');
    }
  };

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const HeaderSection = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.headerGradient}
    >
      <Animated.View 
        style={[
          styles.headerContent,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.headerTop}>
          <View style={styles.welcomeSection}>
            <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
              Hi {user?.firstName || 'Champion'}! 👋
            </Text>
            <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
              Need help? We're here for you!
            </Text>
          </View>
          <Avatar.Icon
            size={50}
            icon="support-agent"
            style={styles.supportAvatar}
          />
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Support</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>< 1hr</Text>
            <Text style={styles.statLabel}>Response</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Safe</Text>
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );

  const QuickActionsSection = () => (
    <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
      <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Quick Help</Text>
      <View style={styles.actionGrid}>
        {quickActions.map((action, index) => (
          <Surface key={index} style={styles.actionCard} elevation={2}>
            <List.Item
              title={action.title}
              description={action.subtitle}
              left={() => (
                <Avatar.Icon
                  size={40}
                  icon={action.icon}
                  style={[styles.actionIcon, { backgroundColor: action.color }]}
                />
              )}
              onPress={action.action}
              titleStyle={[TEXT_STYLES.subtitle, { color: theme === 'dark' ? '#fff' : '#000' }]}
              descriptionStyle={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}
            />
          </Surface>
        ))}
      </View>
    </Animated.View>
  );

  const FAQSection = () => (
    <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
      <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Frequently Asked Questions</Text>
      
      <Searchbar
        placeholder="Search questions..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
      />
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {supportCategories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && { backgroundColor: category.color }
            ]}
            textStyle={[
              styles.categoryChipText,
              selectedCategory === category.id && { color: '#fff' }
            ]}
            icon={category.icon}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>

      <View style={styles.faqContainer}>
        {filteredFAQs.map((faq) => (
          <Card key={faq.id} style={styles.faqCard}>
            <List.Accordion
              title={faq.question}
              expanded={expandedFAQ === faq.id}
              onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
              left={() => (
                <MaterialIcons 
                  name="help-outline" 
                  size={24} 
                  color={COLORS.primary} 
                />
              )}
              titleStyle={[TEXT_STYLES.subtitle, { color: theme === 'dark' ? '#fff' : '#000' }]}
            >
              <Card.Content>
                <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: SPACING.sm }]}>
                  {faq.answer}
                </Text>
                <View style={styles.faqFooter}>
                  <Button
                    mode="outlined"
                    compact
                    icon="thumb-up"
                    onPress={() => {
                      Vibration.vibrate(50);
                      Alert.alert('Thanks!', 'Glad this was helpful! 😊');
                    }}
                  >
                    Helpful ({faq.helpful})
                  </Button>
                </View>
              </Card.Content>
            </List.Accordion>
          </Card>
        ))}
      </View>
    </Animated.View>
  );

  const ContactModal = () => (
    <Portal>
      <Modal
        visible={showContactModal}
        onDismiss={() => setShowContactModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card>
          <Card.Title 
            title="Contact Support 📧"
            subtitle="We'll help you right away!"
          />
          <Card.Content>
            <TextInput
              label="What's this about?"
              value={contactForm.subject}
              onChangeText={(text) => setContactForm({...contactForm, subject: text})}
              mode="outlined"
              style={styles.modalInput}
            />
            
            <TextInput
              label="Tell us what's happening"
              value={contactForm.message}
              onChangeText={(text) => setContactForm({...contactForm, message: text})}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.modalInput}
              placeholder="Describe your question or problem..."
            />
            
            <View style={styles.urgencySection}>
              <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.xs }]}>
                How urgent is this?
              </Text>
              <View style={styles.urgencyButtons}>
                {['low', 'normal', 'high'].map((level) => (
                  <Chip
                    key={level}
                    selected={contactForm.urgency === level}
                    onPress={() => setContactForm({...contactForm, urgency: level})}
                    style={styles.urgencyChip}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Chip>
                ))}
              </View>
            </View>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => setShowContactModal(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleContactSubmit}>
              Send Message
            </Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );

  const FeedbackModal = () => (
    <Portal>
      <Modal
        visible={showFeedbackModal}
        onDismiss={() => setShowFeedbackModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card>
          <Card.Title 
            title="Share Your Thoughts 💭"
            subtitle="Help us make the app better!"
          />
          <Card.Content>
            <View style={styles.ratingSection}>
              <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
                How much do you like our app?
              </Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <IconButton
                    key={star}
                    icon={star <= feedbackForm.rating ? "star" : "star-outline"}
                    iconColor={star <= feedbackForm.rating ? "#FFD700" : COLORS.textSecondary}
                    size={30}
                    onPress={() => setFeedbackForm({...feedbackForm, rating: star})}
                  />
                ))}
              </View>
            </View>
            
            <TextInput
              label="What would you like to tell us?"
              value={feedbackForm.message}
              onChangeText={(text) => setFeedbackForm({...feedbackForm, message: text})}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.modalInput}
              placeholder="Share your ideas, suggestions, or compliments..."
            />
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => setShowFeedbackModal(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleFeedbackSubmit}>
              Send Feedback
            </Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView
        style={styles.scrollView}
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
        <HeaderSection />
        <View style={styles.content}>
          <QuickActionsSection />
          <FAQSection />
        </View>
      </ScrollView>

      <FAB
        icon="headset"
        label="Live Chat"
        style={styles.fab}
        onPress={() => Alert.alert('Live Chat', 'Live chat feature coming soon! 💬')}
      />

      <ContactModal />
      <FeedbackModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  welcomeSection: {
    flex: 1,
  },
  headerTitle: {
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
  },
  supportAvatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h3,
    color: COLORS.white,
    marginBottom: 2,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  actionGrid: {
    gap: SPACING.sm,
  },
  actionCard: {
    borderRadius: 12,
    marginBottom: SPACING.xs,
  },
  actionIcon: {
    marginLeft: SPACING.sm,
  },
  searchBar: {
    marginBottom: SPACING.md,
    borderRadius: 25,
  },
  categoryScroll: {
    marginBottom: SPACING.md,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.xs,
    gap: SPACING.xs,
  },
  categoryChip: {
    marginRight: SPACING.xs,
  },
  categoryChipText: {
    fontSize: 12,
  },
  faqContainer: {
    gap: SPACING.sm,
  },
  faqCard: {
    borderRadius: 12,
    marginBottom: SPACING.xs,
  },
  faqFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    margin: SPACING.md,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalInput: {
    marginBottom: SPACING.md,
  },
  urgencySection: {
    marginTop: SPACING.sm,
  },
  urgencyButtons: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  urgencyChip: {
    flex: 1,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  ratingStars: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default ContactSupport;