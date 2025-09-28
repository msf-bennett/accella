import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  Linking,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Button,
  Searchbar,
  Surface,
  Chip,
  IconButton,
  Avatar,
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

const HelpCenter = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh action
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const helpCategories = [
    { id: 'all', label: 'All Topics', icon: 'help' },
    { id: 'account', label: 'Account', icon: 'account-circle' },
    { id: 'training', label: 'Training', icon: 'fitness-center' },
    { id: 'safety', label: 'Safety', icon: 'security' },
    { id: 'technical', label: 'Technical', icon: 'settings' },
  ];

  const faqData = [
    {
      id: 1,
      category: 'account',
      question: 'How do I update my child\'s profile information?',
      answer: 'Parents can update their child\'s profile by going to Settings > Child Profile. You can modify personal details, sports preferences, and emergency contact information. Some changes may require coach approval.',
    },
    {
      id: 2,
      category: 'training',
      question: 'What should I do if my child misses a training session?',
      answer: 'If your child misses a session, check the app for makeup sessions or contact your coach directly. The app will automatically adjust the training schedule and notify you of any important changes.',
    },
    {
      id: 3,
      category: 'safety',
      question: 'How does the app protect my child\'s privacy?',
      answer: 'We take child safety seriously. All communications are monitored, personal information is encrypted, and we follow strict child protection guidelines. Parents have full visibility into all app interactions.',
    },
    {
      id: 4,
      category: 'training',
      question: 'Can my child access training plans when offline?',
      answer: 'Yes! All assigned training plans and session details are automatically downloaded for offline access. Your child can view exercises, videos, and instructions even without internet connection.',
    },
    {
      id: 5,
      category: 'technical',
      question: 'The app is running slowly. What should I do?',
      answer: 'Try closing and reopening the app, ensure you have the latest version, and check your internet connection. If issues persist, clear the app cache in Settings > Storage.',
    },
    {
      id: 6,
      category: 'account',
      question: 'How do I find and connect with a new coach?',
      answer: 'Use the Coach Finder in the main menu. You can search by sport, location, and experience level. Read reviews and send connection requests to coaches that match your needs.',
    },
  ];

  const quickActions = [
    {
      id: 1,
      title: 'Contact Support',
      subtitle: 'Get help from our team',
      icon: 'support-agent',
      action: () => handleContactSupport(),
    },
    {
      id: 2,
      title: 'Report an Issue',
      subtitle: 'Something not working?',
      icon: 'report-problem',
      action: () => handleReportIssue(),
    },
    {
      id: 3,
      title: 'Safety Concerns',
      subtitle: 'Report safety issues',
      icon: 'security',
      action: () => handleSafetyConcerns(),
    },
    {
      id: 4,
      title: 'Video Guides',
      subtitle: 'Watch how-to videos',
      icon: 'play-circle-filled',
      action: () => handleVideoGuides(),
    },
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSupport = () => {
    Alert.alert(
      '📧 Contact Support',
      'Choose how you\'d like to reach our support team:',
      [
        { text: 'Email Support', onPress: () => Linking.openURL('mailto:support@coachingapp.com') },
        { text: 'Live Chat', onPress: () => Alert.alert('Feature Coming Soon', 'Live chat will be available in the next update! 🚀') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleReportIssue = () => {
    Alert.alert(
      '⚠️ Report Issue',
      'We\'re sorry you\'re experiencing problems. Please describe the issue and we\'ll help you resolve it.',
      [
        { text: 'Send Report', onPress: () => Alert.alert('Feature Coming Soon', 'Issue reporting feature is in development! 🔧') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSafetyConcerns = () => {
    Alert.alert(
      '🛡️ Safety First',
      'If you have any safety concerns about your child\'s training or interactions, please contact us immediately.',
      [
        { text: 'Emergency Contact', onPress: () => Linking.openURL('tel:+1234567890') },
        { text: 'Report Concern', onPress: () => Alert.alert('Feature Coming Soon', 'Safety reporting system coming soon! 🔒') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleVideoGuides = () => {
    Alert.alert('🎬 Video Guides', 'Video tutorials feature is coming soon! We\'re creating helpful guides for parents and children. 📹');
  };

  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
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
          <Text style={styles.headerTitle}>Help Center</Text>
          <IconButton
            icon="notifications"
            iconColor={COLORS.white}
            size={24}
            onPress={() => Alert.alert('Feature Coming Soon', 'Notifications feature is in development! 🔔')}
          />
        </View>
        <Text style={styles.headerSubtitle}>
          Get help and support for your child's training journey 🏃‍♂️
        </Text>
      </View>
    </LinearGradient>
  );

  const renderSearchAndCategories = () => (
    <View style={styles.searchSection}>
      <Searchbar
        placeholder="Search help topics..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.primary}
        inputStyle={TEXT_STYLES.body}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {helpCategories.map((category) => (
          <Chip
            key={category.id}
            mode={selectedCategory === category.id ? 'flat' : 'outlined'}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.selectedCategoryChip,
            ]}
            textStyle={[
              styles.categoryChipText,
              selectedCategory === category.id && styles.selectedCategoryChipText,
            ]}
            icon={category.icon}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickActionCard}
            onPress={action.action}
            activeOpacity={0.7}
          >
            <Surface style={styles.quickActionSurface} elevation={2}>
              <Icon name={action.icon} size={32} color={COLORS.primary} />
              <Text style={styles.quickActionTitle}>{action.title}</Text>
              <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
            </Surface>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFAQs = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Frequently Asked Questions ({filteredFAQs.length})
      </Text>
      {filteredFAQs.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Icon name="search-off" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or category filter
            </Text>
          </Card.Content>
        </Card>
      ) : (
        filteredFAQs.map((faq) => (
          <Card key={faq.id} style={styles.faqCard}>
            <TouchableOpacity onPress={() => toggleFAQ(faq.id)} activeOpacity={0.7}>
              <Card.Content style={styles.faqHeader}>
                <View style={styles.faqQuestion}>
                  <Icon 
                    name={expandedFAQ === faq.id ? 'expand-less' : 'expand-more'} 
                    size={24} 
                    color={COLORS.primary} 
                  />
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                </View>
              </Card.Content>
            </TouchableOpacity>
            {expandedFAQ === faq.id && (
              <>
                <Divider />
                <Card.Content style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  <View style={styles.faqFooter}>
                    <Text style={styles.faqFooterText}>Was this helpful?</Text>
                    <View style={styles.faqActions}>
                      <IconButton
                        icon="thumb-up"
                        size={18}
                        iconColor={COLORS.success}
                        onPress={() => Alert.alert('Thanks!', 'Your feedback helps us improve 👍')}
                      />
                      <IconButton
                        icon="thumb-down"
                        size={18}
                        iconColor={COLORS.error}
                        onPress={() => Alert.alert('Feature Coming Soon', 'Feedback system is in development! 📝')}
                      />
                    </View>
                  </View>
                </Card.Content>
              </>
            )}
          </Card>
        ))
      )}
    </View>
  );

  const renderContactInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Need More Help?</Text>
      <Card style={styles.contactCard}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.contactGradient}
        >
          <Card.Content style={styles.contactContent}>
            <Avatar.Icon 
              size={60} 
              icon="support-agent" 
              style={styles.contactAvatar}
              color={COLORS.primary}
            />
            <Text style={styles.contactTitle}>24/7 Support Available</Text>
            <Text style={styles.contactSubtitle}>
              Our child safety specialists are here to help
            </Text>
            <View style={styles.contactMethods}>
              <Button
                mode="contained"
                icon="email"
                onPress={() => Linking.openURL('mailto:childsupport@coachingapp.com')}
                style={styles.contactButton}
                buttonColor={COLORS.white}
                textColor={COLORS.primary}
              >
                Email Support
              </Button>
              <Button
                mode="outlined"
                icon="phone"
                onPress={() => Linking.openURL('tel:+1234567890')}
                style={[styles.contactButton, styles.contactButtonOutlined]}
                textColor={COLORS.white}
              >
                Call Us
              </Button>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    </View>
  );

  const renderSafetyResources = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Safety & Guidelines</Text>
      <Card style={styles.safetyCard}>
        <Card.Content style={styles.safetyContent}>
          <View style={styles.safetyHeader}>
            <Icon name="security" size={28} color={COLORS.success} />
            <Text style={styles.safetyTitle}>Child Safety First</Text>
          </View>
          <Text style={styles.safetyText}>
            We're committed to providing a safe training environment for your child. 
            Review our safety guidelines and reporting procedures.
          </Text>
          <View style={styles.safetyActions}>
            <Button
              mode="outlined"
              icon="policy"
              onPress={() => Alert.alert('Feature Coming Soon', 'Safety guidelines document coming soon! 📋')}
              style={styles.safetyButton}
              textColor={COLORS.success}
            >
              Safety Guidelines
            </Button>
            <Button
              mode="outlined"
              icon="report"
              onPress={() => Alert.alert('Feature Coming Soon', 'Incident reporting system in development! ⚠️')}
              style={styles.safetyButton}
              textColor={COLORS.warning}
            >
              Report Incident
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <View style={styles.container}>
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
      >
        {renderSearchAndCategories()}
        {renderQuickActions()}
        {renderFAQs()}
        {renderSafetyResources()}
        {renderContactInfo()}
        
        {/* App Info Section */}
        <View style={styles.section}>
          <Card style={styles.infoCard}>
            <Card.Content style={styles.infoContent}>
              <Text style={styles.infoTitle}>App Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Version:</Text>
                <Text style={styles.infoValue}>1.2.3</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Updated:</Text>
                <Text style={styles.infoValue}>August 2025</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Account Type:</Text>
                <Chip mode="flat" style={styles.accountChip} textStyle={styles.accountChipText}>
                  Child Account
                </Chip>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
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
  searchSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  searchbar: {
    backgroundColor: COLORS.white,
    elevation: 2,
    marginBottom: SPACING.md,
  },
  categoriesContainer: {
    marginBottom: SPACING.sm,
  },
  categoriesContent: {
    paddingRight: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.text,
  },
  selectedCategoryChipText: {
    color: COLORS.white,
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
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - SPACING.md * 3) / 2,
    marginBottom: SPACING.md,
  },
  quickActionSurface: {
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  quickActionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SPACING.sm,
    color: COLORS.text,
  },
  quickActionSubtitle: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  faqCard: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
    elevation: 2,
    borderRadius: 12,
  },
  faqHeader: {
    paddingVertical: SPACING.md,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqQuestionText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    flex: 1,
    marginLeft: SPACING.sm,
  },
  faqAnswer: {
    paddingTop: SPACING.md,
  },
  faqAnswerText: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  faqFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqFooterText: {
    ...TEXT_STYLES.caption,
    fontWeight: '500',
  },
  faqActions: {
    flexDirection: 'row',
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    elevation: 1,
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.subheading,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: COLORS.white,
    elevation: 3,
    borderRadius: 16,
    overflow: 'hidden',
  },
  contactGradient: {
    padding: SPACING.lg,
  },
  contactContent: {
    alignItems: 'center',
  },
  contactAvatar: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
  },
  contactTitle: {
    ...TEXT_STYLES.subheading,
    color: COLORS.white,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  contactSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  contactMethods: {
    flexDirection: 'row',
    gap: SPACING.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  contactButton: {
    borderRadius: 8,
    minWidth: 120,
  },
  contactButtonOutlined: {
    borderColor: COLORS.white,
  },
  safetyCard: {
    backgroundColor: COLORS.white,
    elevation: 2,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  safetyContent: {
    paddingVertical: SPACING.lg,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  safetyTitle: {
    ...TEXT_STYLES.subheading,
    marginLeft: SPACING.sm,
    color: COLORS.success,
  },
  safetyText: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  safetyActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    flexWrap: 'wrap',
  },
  safetyButton: {
    borderRadius: 8,
    flex: 1,
    minWidth: 140,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    elevation: 1,
    borderRadius: 12,
  },
  infoContent: {
    paddingVertical: SPACING.lg,
  },
  infoTitle: {
    ...TEXT_STYLES.subheading,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
  },
  infoValue: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  accountChip: {
    backgroundColor: COLORS.success + '20',
  },
  accountChipText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default HelpCenter;