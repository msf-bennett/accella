import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Animated,
  Alert,
  TouchableOpacity,
  Vibration,
  Linking,
  Dimensions
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Portal,
  Dialog,
  TextInput,
  HelperText,
  Searchbar,
  FAB,
  ProgressBar
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width } = Dimensions.get('window');

const SupportCenter = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'normal',
    category: 'general'
  });

  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 0,
    feedback: '',
    category: 'general'
  });

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    // Simulate API call to refresh support data
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const handleFeatureTap = (feature) => {
    Vibration.vibrate(30);
    Alert.alert(
      '🚧 Feature in Development',
      `${feature} is coming soon! We're working hard to bring you comprehensive support features.`,
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const handleContactSubmit = () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    
    Vibration.vibrate(50);
    Alert.alert(
      '✅ Support Request Sent',
      'We\'ve received your request and will get back to you within 24 hours!',
      [{ text: 'Thanks!', onPress: () => setShowContactDialog(false) }]
    );
    
    setContactForm({ subject: '', message: '', priority: 'normal', category: 'general' });
  };

  const handleFeedbackSubmit = () => {
    if (feedbackForm.rating === 0 || !feedbackForm.feedback.trim()) {
      Alert.alert('Error', 'Please provide a rating and feedback.');
      return;
    }
    
    Vibration.vibrate(50);
    Alert.alert(
      '🌟 Thank You!',
      'Your feedback helps us improve the app. We appreciate your input!',
      [{ text: 'You\'re welcome!', onPress: () => setShowFeedbackDialog(false) }]
    );
    
    setFeedbackForm({ rating: 0, feedback: '', category: 'general' });
  };

  const handlePhoneCall = () => {
    Alert.alert(
      '📞 Call Support',
      'Would you like to call our support team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call Now', 
          onPress: () => {
            Linking.openURL('tel:+1234567890').catch(() => {
              handleFeatureTap('Phone Support');
            });
          }
        }
      ]
    );
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@coachingapp.com?subject=Support Request').catch(() => {
      handleFeatureTap('Email Support');
    });
  };

  const supportCategories = [
    { key: 'all', label: '🏠 All', icon: 'home' },
    { key: 'account', label: '👤 Account', icon: 'account-circle' },
    { key: 'training', label: '🏃 Training', icon: 'fitness-center' },
    { key: 'payment', label: '💳 Payment', icon: 'payment' },
    { key: 'technical', label: '🔧 Technical', icon: 'build' },
    { key: 'privacy', label: '🔒 Privacy', icon: 'privacy-tip' }
  ];

  const faqData = [
    {
      id: 1,
      category: 'account',
      question: 'How do I change my profile information?',
      answer: 'Go to Settings > Profile Settings to update your personal information, photos, and specializations. Make sure to save your changes.'
    },
    {
      id: 2,
      category: 'training',
      question: 'How do I create a training plan?',
      answer: 'As a coach, navigate to the Training section and tap "Create Plan". You can set duration, exercises, and assign it to players. AI assistance is also available.'
    },
    {
      id: 3,
      category: 'payment',
      question: 'How do I set up payment methods?',
      answer: 'Go to Settings > Payment Methods to add credit cards, PayPal, or bank accounts. All transactions are secure and encrypted.'
    },
    {
      id: 4,
      category: 'technical',
      question: 'The app is running slowly. What can I do?',
      answer: 'Try closing other apps, restart the app, or check your internet connection. If issues persist, contact our technical support team.'
    },
    {
      id: 5,
      category: 'privacy',
      question: 'How is my data protected?',
      answer: 'We use industry-standard encryption and never share your personal data without consent. Check our Privacy Policy for full details.'
    },
    {
      id: 6,
      category: 'account',
      question: 'Can I change my user role?',
      answer: 'Contact support to change between Coach, Player, or Parent roles. Some restrictions apply based on verification requirements.'
    },
    {
      id: 7,
      category: 'training',
      question: 'How do I track my progress?',
      answer: 'Use the Progress tab to view detailed analytics, completion rates, and performance trends over time.'
    },
    {
      id: 8,
      category: 'technical',
      question: 'How does offline mode work?',
      answer: 'The app automatically syncs when you have internet. You can view downloaded content and record activities offline.'
    }
  ];

  const quickActions = [
    {
      title: 'Live Chat',
      subtitle: 'Chat with our team',
      icon: 'chat',
      color: COLORS.primary,
      onPress: () => handleFeatureTap('Live Chat')
    },
    {
      title: 'Call Support',
      subtitle: '+1 (234) 567-8900',
      icon: 'phone',
      color: COLORS.success,
      onPress: handlePhoneCall
    },
    {
      title: 'Email Us',
      subtitle: 'support@app.com',
      icon: 'email',
      color: '#FF6B6B',
      onPress: handleEmailSupport
    },
    {
      title: 'Video Guide',
      subtitle: 'Watch tutorials',
      icon: 'play-circle-filled',
      color: '#9C27B0',
      onPress: () => handleFeatureTap('Video Tutorials')
    }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const QuickActionCard = ({ title, subtitle, icon, color, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.quickActionCard}>
      <LinearGradient
        colors={[color, `${color}CC`]}
        style={styles.quickActionGradient}
      >
        <Icon name={icon} size={28} color="white" />
        <Text style={[TEXT_STYLES.body, { color: 'white', fontWeight: 'bold', marginTop: SPACING.xs }]}>
          {title}
        </Text>
        <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
          {subtitle}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const FAQItem = ({ faq }) => {
    const isExpanded = expandedFAQ === faq.id;
    
    return (
      <Card style={styles.faqCard} elevation={1}>
        <TouchableOpacity
          onPress={() => {
            Vibration.vibrate(30);
            setExpandedFAQ(isExpanded ? null : faq.id);
          }}
        >
          <Card.Content>
            <View style={styles.faqHeader}>
              <Text style={[TEXT_STYLES.body, { flex: 1, fontWeight: '500' }]}>
                {faq.question}
              </Text>
              <Icon
                name={isExpanded ? 'expand-less' : 'expand-more'}
                size={24}
                color={COLORS.primary}
              />
            </View>
            {isExpanded && (
              <Animated.View style={styles.faqAnswer}>
                <Text style={[TEXT_STYLES.body, { color: COLORS.secondary, lineHeight: 22 }]}>
                  {faq.answer}
                </Text>
              </Animated.View>
            )}
          </Card.Content>
        </TouchableOpacity>
      </Card>
    );
  };

  const StatusCard = ({ icon, title, description, status, color }) => (
    <Card style={styles.statusCard} elevation={2}>
      <Card.Content>
        <View style={styles.statusHeader}>
          <View style={styles.statusIcon}>
            <Icon name={icon} size={24} color={color} />
          </View>
          <View style={styles.statusInfo}>
            <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>{title}</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>{description}</Text>
          </View>
          <Chip
            textStyle={{ fontSize: 12 }}
            style={{ backgroundColor: `${color}20` }}
            textColor={color}
          >
            {status}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  const RatingStars = ({ rating, onRatingChange, size = 32 }) => (
    <View style={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRatingChange && onRatingChange(star)}
          disabled={!onRatingChange}
        >
          <Icon
            name={star <= rating ? 'star' : 'star-border'}
            size={size}
            color={star <= rating ? '#FFD700' : '#E0E0E0'}
            style={{ marginHorizontal: 2 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={[TEXT_STYLES.h2, { color: 'white', flex: 1, textAlign: 'center' }]}>
            🎧 Support Center
          </Text>
          <TouchableOpacity onPress={() => setShowFeedbackDialog(true)} style={styles.feedbackButton}>
            <Icon name="feedback" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
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
          {/* Quick Actions */}
          <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>⚡ Quick Help</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                title={action.title}
                subtitle={action.subtitle}
                icon={action.icon}
                color={action.color}
                onPress={action.onPress}
              />
            ))}
          </View>

          {/* System Status */}
          <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>📊 System Status</Text>
          <StatusCard
            icon="cloud-done"
            title="All Systems Operational"
            description="Last updated: 2 minutes ago"
            status="Healthy"
            color={COLORS.success}
          />
          <StatusCard
            icon="sync"
            title="Data Sync"
            description="Syncing training data"
            status="Processing"
            color="#FF9800"
          />

          {/* Search & Categories */}
          <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>❓ Frequently Asked Questions</Text>
          
          <Searchbar
            placeholder="Search for help..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            icon="search"
            clearIcon="close"
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {supportCategories.map(category => (
              <TouchableOpacity
                key={category.key}
                onPress={() => {
                  Vibration.vibrate(30);
                  setSelectedCategory(category.key);
                }}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.key && styles.activeCategoryChip
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.key && styles.activeCategoryText
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* FAQ List */}
          <View style={styles.faqContainer}>
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map(faq => (
                <FAQItem key={faq.id} faq={faq} />
              ))
            ) : (
              <Card style={styles.noResultsCard}>
                <Card.Content style={styles.noResultsContent}>
                  <Icon name="search-off" size={48} color={COLORS.secondary} />
                  <Text style={[TEXT_STYLES.body, { marginTop: SPACING.md, textAlign: 'center' }]}>
                    No results found for "{searchQuery}"
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { textAlign: 'center', color: COLORS.secondary }]}>
                    Try different keywords or contact support
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>

          {/* Additional Resources */}
          <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>📚 Additional Resources</Text>
          
          <Card style={styles.resourceCard} elevation={1}>
            <Card.Content>
              <View style={styles.resourceItem}>
                <Icon name="book" size={24} color={COLORS.primary} />
                <View style={styles.resourceText}>
                  <Text style={TEXT_STYLES.body}>User Guide</Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                    Complete app documentation
                  </Text>
                </View>
                <IconButton icon="open-in-new" size={20} onPress={() => handleFeatureTap('User Guide')} />
              </View>
              
              <View style={styles.resourceItem}>
                <Icon name="video-library" size={24} color={COLORS.primary} />
                <View style={styles.resourceText}>
                  <Text style={TEXT_STYLES.body}>Video Tutorials</Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                    Step-by-step video guides
                  </Text>
                </View>
                <IconButton icon="open-in-new" size={20} onPress={() => handleFeatureTap('Video Library')} />
              </View>
              
              <View style={styles.resourceItem}>
                <Icon name="forum" size={24} color={COLORS.primary} />
                <View style={styles.resourceText}>
                  <Text style={TEXT_STYLES.body}>Community Forum</Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                    Connect with other users
                  </Text>
                </View>
                <IconButton icon="open-in-new" size={20} onPress={() => handleFeatureTap('Community')} />
              </View>
            </Card.Content>
          </Card>

          <View style={{ height: SPACING.xl * 2 }} />
        </ScrollView>
      </Animated.View>

      {/* Contact Support FAB */}
      <FAB
        icon="support-agent"
        label="Contact Support"
        style={styles.contactFab}
        onPress={() => setShowContactDialog(true)}
      />

      {/* Contact Dialog */}
      <Portal>
        <Dialog visible={showContactDialog} onDismiss={() => setShowContactDialog(false)}>
          <Dialog.Title>📧 Contact Support</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Subject *"
              value={contactForm.subject}
              onChangeText={(text) => setContactForm(prev => ({ ...prev, subject: text }))}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Message *"
              value={contactForm.message}
              onChangeText={(text) => setContactForm(prev => ({ ...prev, message: text }))}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.dialogInput}
            />
            <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.md, color: COLORS.secondary }]}>
              We typically respond within 24 hours
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowContactDialog(false)}>Cancel</Button>
            <Button onPress={handleContactSubmit}>Send</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Feedback Dialog */}
      <Portal>
        <Dialog visible={showFeedbackDialog} onDismiss={() => setShowFeedbackDialog(false)}>
          <Dialog.Title>🌟 Share Feedback</Dialog.Title>
          <Dialog.Content>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
              How would you rate your experience?
            </Text>
            <RatingStars
              rating={feedbackForm.rating}
              onRatingChange={(rating) => setFeedbackForm(prev => ({ ...prev, rating }))}
            />
            <TextInput
              label="Tell us more *"
              value={feedbackForm.feedback}
              onChangeText={(text) => setFeedbackForm(prev => ({ ...prev, feedback: text }))}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={[styles.dialogInput, { marginTop: SPACING.md }]}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowFeedbackDialog(false)}>Cancel</Button>
            <Button onPress={handleFeedbackSubmit}>Submit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.xs,
  },
  feedbackButton: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
    color: COLORS.text,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  quickActionCard: {
    width: (width - SPACING.lg * 3) / 2,
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    minHeight: 100,
  },
  statusCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: SPACING.md,
  },
  statusInfo: {
    flex: 1,
  },
  searchbar: {
    marginBottom: SPACING.md,
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  categoriesContainer: {
    marginBottom: SPACING.lg,
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.md,
  },
  activeCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
  },
  activeCategoryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  faqContainer: {
    marginBottom: SPACING.lg,
  },
  faqCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqAnswer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  noResultsCard: {
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  noResultsContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  resourceCard: {
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resourceText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  contactFab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  dialogInput: {
    marginBottom: SPACING.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
};

export default SupportCenter;