import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Modal,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SupportScreen = ({ navigation }) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const supportOptions = [
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions',
      icon: 'help-circle-outline',
      color: '#007AFF',
      action: () => scrollToFAQ(),
    },
    {
      id: 'contact',
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: 'mail-outline',
      color: '#34C759',
      action: () => setShowContactModal(true),
    },
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Chat with support agent',
      icon: 'chatbubble-outline',
      color: '#FF9500',
      action: () => startLiveChat(),
    },
    {
      id: 'phone',
      title: 'Call Support',
      description: 'Speak directly with our team',
      icon: 'call-outline',
      color: '#FF3B30',
      action: () => Linking.openURL('tel:+254700123456'),
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      description: 'Help us improve the app',
      icon: 'thumbs-up-outline',
      color: '#8E44AD',
      action: () => setShowFeedbackModal(true),
    },
    {
      id: 'tutorials',
      title: 'Video Tutorials',
      description: 'Learn how to use the app',
      icon: 'play-circle-outline',
      color: '#17A2B8',
      action: () => navigation.navigate('Tutorials'),
    },
  ];

  const faqData = [
    {
      id: 1,
      question: 'How do I register my child for training sessions?',
      answer: 'To register your child:\n1. Go to "Search Academies" from the main menu\n2. Find and select your preferred academy\n3. Choose the sport and age category\n4. Select available time slots\n5. Complete payment and registration\n\nYou\'ll receive confirmation once registration is complete.',
    },
    {
      id: 2,
      question: 'Can I track my child\'s attendance and performance?',
      answer: 'Yes! You can view:\n• Real-time attendance updates\n• Performance scores and coach feedback\n• Progress reports and analytics\n• Session videos and photos\n\nAll this information is available in the "Session Details" and "All Activities" sections.',
    },
    {
      id: 3,
      question: 'How do I communicate with coaches?',
      answer: 'You can contact coaches through:\n• In-app messaging via "Coach Chat"\n• Direct phone calls from coach profiles\n• Comments on training sessions\n• Scheduled video calls\n\nCoaches typically respond within 2-4 hours during business hours.',
    },
    {
      id: 4,
      question: 'What payment methods are accepted?',
      answer: 'We accept:\n• M-Pesa payments\n• Credit/Debit cards\n• Bank transfers\n• PayPal\n\nAll payments are secure and encrypted. You\'ll receive instant confirmation for successful transactions.',
    },
    {
      id: 5,
      question: 'How do I cancel or reschedule sessions?',
      answer: 'To cancel or reschedule:\n1. Go to your child\'s schedule\n2. Tap on the session you want to change\n3. Select "Reschedule" or "Cancel"\n4. Choose a new time slot (for rescheduling)\n5. Confirm the change\n\nCancellations made 24+ hours in advance are fully refundable.',
    },
    {
      id: 6,
      question: 'Is my child\'s data secure and private?',
      answer: 'Absolutely. We use:\n• End-to-end encryption for all communications\n• Secure cloud storage with regular backups\n• GDPR-compliant data handling\n• Regular security audits\n\nYour child\'s information is never shared with third parties without your explicit consent.',
    },
    {
      id: 7,
      question: 'How do notifications work?',
      answer: 'You\'ll receive notifications for:\n• Upcoming sessions (30 min before)\n• Schedule changes or cancellations\n• Performance updates from coaches\n• Payment reminders\n• Achievement milestones\n\nYou can customize notification settings in the Settings menu.',
    },
    {
      id: 8,
      question: 'What if I need to switch academies or coaches?',
      answer: 'You can easily switch by:\n1. Completing current session commitments\n2. Searching for new academies/coaches\n3. Comparing ratings and reviews\n4. Booking trial sessions\n5. Transferring your child\'s progress data\n\nOur team can assist with the transition process.',
    },
  ];

  const feedbackCategories = [
    'App Performance',
    'User Interface',
    'Coach Communication',
    'Payment Issues',
    'Academy Features',
    'General Suggestion',
    'Bug Report',
    'Feature Request'
  ];

  const scrollToFAQ = () => {
    // Implement scroll to FAQ section
    Alert.alert('FAQ', 'Scrolling to FAQ section...');
  };

  const startLiveChat = () => {
    Alert.alert(
      'Live Chat',
      'Would you like to start a live chat session with our support team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Chat', onPress: () => navigation.navigate('LiveChat') }
      ]
    );
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim() || !feedbackCategory) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Thank You!', 
        'Your feedback has been submitted successfully. We appreciate your input!',
        [{ text: 'OK', onPress: () => {
          setShowFeedbackModal(false);
          setFeedbackText('');
          setFeedbackCategory('');
        }}]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitContactForm = async () => {
    if (!contactSubject.trim() || !contactMessage.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Message Sent!', 
        'Your message has been sent to our support team. We\'ll get back to you within 24 hours.',
        [{ text: 'OK', onPress: () => {
          setShowContactModal(false);
          setContactSubject('');
          setContactMessage('');
        }}]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const shareApp = async () => {
    try {
      await Share.share({
        message: 'Check out this amazing coaching app! It helps track training, connect with coaches, and manage sports activities for kids.',
        title: 'Smart Coaching App',
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const renderSupportOption = (option) => (
    <TouchableOpacity 
      key={option.id}
      style={styles.supportCard}
      onPress={option.action}
    >
      <View style={[styles.supportIcon, { backgroundColor: option.color + '20' }]}>
        <Ionicons name={option.icon} size={24} color={option.color} />
      </View>
      <View style={styles.supportInfo}>
        <Text style={styles.supportTitle}>{option.title}</Text>
        <Text style={styles.supportDescription}>{option.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  const renderFAQItem = (item) => (
    <View key={item.id} style={styles.faqItem}>
      <TouchableOpacity 
        style={styles.faqHeader}
        onPress={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
      >
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons 
          name={expandedFAQ === item.id ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#666" 
        />
      </TouchableOpacity>
      {expandedFAQ === item.id && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{item.answer}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support & Help</Text>
        <TouchableOpacity onPress={shareApp}>
          <Ionicons name="share-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeIcon}>
            <Ionicons name="headset-outline" size={32} color="#007AFF" />
          </View>
          <Text style={styles.welcomeTitle}>How can we help you?</Text>
          <Text style={styles.welcomeDescription}>
            Our support team is here to assist you with any questions or issues you might have.
          </Text>
        </View>

        {/* Support Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Support</Text>
          {supportOptions.map(renderSupportOption)}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('SettingsScreen')}
            >
              <Ionicons name="settings-outline" size={24} color="#666" />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('AllActivities')}
            >
              <Ionicons name="list-outline" size={24} color="#666" />
              <Text style={styles.quickActionText}>All Activities</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Schedule')}
            >
              <Ionicons name="calendar-outline" size={24} color="#666" />
              <Text style={styles.quickActionText}>Schedule</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#666" />
              <Text style={styles.quickActionText}>Notifications</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencyContainer}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="warning-outline" size={20} color="#FF3B30" />
            <Text style={styles.emergencyTitle}>Emergency Contact</Text>
          </View>
          <Text style={styles.emergencyText}>
            For urgent safety concerns during training sessions
          </Text>
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={() => Linking.openURL('tel:+254700999888')}
          >
            <Ionicons name="call" size={16} color="white" />
            <Text style={styles.emergencyButtonText}>Call Emergency Line</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqData.map(renderFAQItem)}
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Version</Text>
              <Text style={styles.infoValue}>2.1.4</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>August 10, 2025</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Support Hours</Text>
              <Text style={styles.infoValue}>6:00 AM - 10:00 PM EAT</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://smartcoaching.app/privacy')}
          >
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={16} color="#007AFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://smartcoaching.app/terms')}
          >
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons name="open-outline" size={16} color="#007AFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://smartcoaching.app/help')}
          >
            <Text style={styles.linkText}>Online Help Center</Text>
            <Ionicons name="open-outline" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Troubleshooting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Troubleshooting</Text>
          
          <TouchableOpacity 
            style={styles.troubleshootCard}
            onPress={() => Alert.alert('Cache Cleared', 'App cache has been cleared successfully.')}
          >
            <Ionicons name="refresh-outline" size={20} color="#666" />
            <Text style={styles.troubleshootText}>Clear App Cache</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.troubleshootCard}
            onPress={() => Alert.alert('Sync Complete', 'Data synchronization completed.')}
          >
            <Ionicons name="sync-outline" size={20} color="#666" />
            <Text style={styles.troubleshootText}>Sync Data</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.troubleshootCard}
            onPress={() => Alert.alert('Connection Test', 'Internet connection is working properly.')}
          >
            <Ionicons name="wifi-outline" size={20} color="#666" />
            <Text style={styles.troubleshootText}>Test Connection</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Contact Support Modal */}
      <Modal
        visible={showContactModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contact Support</Text>
              <TouchableOpacity onPress={() => setShowContactModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Subject"
              value={contactSubject}
              onChangeText={setContactSubject}
            />

            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Describe your issue or question..."
              value={contactMessage}
              onChangeText={setContactMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowContactModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, submitting && styles.disabledButton]}
                onPress={submitContactForm}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Send Message</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Feedback</Text>
              <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {feedbackCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    feedbackCategory === category && styles.selectedCategoryChip
                  ]}
                  onPress={() => setFeedbackCategory(category)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    feedbackCategory === category && styles.selectedCategoryChipText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>Your Feedback</Text>
            <TextInput
              style={[styles.input, styles.feedbackInput]}
              placeholder="Tell us what you think or what could be improved..."
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowFeedbackModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, submitting && styles.disabledButton]}
                onPress={submitFeedback}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Feedback</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
  welcomeContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 32,
    marginBottom: 12,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e8f4fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportInfo: {
    flex: 1,
    marginLeft: 16,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  supportDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    width: '47%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
  },
  emergencyContainer: {
    backgroundColor: '#fff5f5',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  emergencyButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 16,
  },
  faqAnswer: {
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  troubleshootCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
  },
  troubleshootText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  messageInput: {
    height: 120,
  },
  feedbackInput: {
    height: 120,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryChip: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCategoryChip: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedCategoryChipText: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default SupportScreen;