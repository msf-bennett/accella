import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
  Vibration,
  StatusBar,
  Dimensions,
  Linking,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  Searchbar,
  Divider,
  List,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  white: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
  lightGray: '#F5F5F5',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text, lineHeight: 24 },
  caption: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const CancellationPolicy = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [showContactModal, setShowContactModal] = useState(false);
  const [activePolicy, setActivePolicy] = useState('general');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Policy data
  const policyTypes = [
    { id: 'general', title: 'General Policy', icon: 'description' },
    { id: 'training', title: 'Training Sessions', icon: 'fitness-center' },
    { id: 'group', title: 'Group Classes', icon: 'group' },
    { id: 'personal', title: 'Personal Training', icon: 'person' },
    { id: 'packages', title: 'Package Deals', icon: 'card-giftcard' },
  ];

  const policies = {
    general: {
      title: 'General Cancellation Policy',
      icon: 'description',
      color: COLORS.primary,
      sections: [
        {
          title: 'Free Cancellation Window',
          content: 'You can cancel any booking free of charge up to 24 hours before the scheduled session time.',
          icon: 'schedule',
          highlight: true,
        },
        {
          title: 'Late Cancellation Fee',
          content: 'Cancellations made within 24 hours of the session will incur a 50% cancellation fee.',
          icon: 'payment',
          warning: true,
        },
        {
          title: 'No-Show Policy',
          content: 'Failure to attend without cancellation will result in full payment charge and may affect future booking privileges.',
          icon: 'report',
          error: true,
        },
        {
          title: 'Emergency Cancellations',
          content: 'Medical emergencies or unforeseen circumstances may be eligible for fee waiver with proper documentation.',
          icon: 'local-hospital',
        },
        {
          title: 'Weather Cancellations',
          content: 'Outdoor sessions cancelled due to severe weather conditions will receive full refunds.',
          icon: 'cloud',
        },
      ],
    },
    training: {
      title: 'Training Session Policy',
      icon: 'fitness-center',
      color: COLORS.success,
      sections: [
        {
          title: 'Individual Training Sessions',
          content: 'Standard 24-hour free cancellation policy applies. Late cancellations subject to 50% fee.',
          icon: 'person',
        },
        {
          title: 'Rescheduling Options',
          content: 'Sessions can be rescheduled up to 2 times without penalty within the same month.',
          icon: 'swap-horiz',
          highlight: true,
        },
        {
          title: 'Coach Cancellations',
          content: 'If your coach cancels, you receive full refund or free rescheduling with priority booking.',
          icon: 'person-off',
        },
        {
          title: 'Equipment Issues',
          content: 'Sessions cancelled due to facility or equipment problems receive full refunds.',
          icon: 'build',
        },
      ],
    },
    group: {
      title: 'Group Class Policy',
      icon: 'group',
      color: COLORS.warning,
      sections: [
        {
          title: 'Class Cancellation Window',
          content: 'Group classes must be cancelled at least 12 hours in advance for full refund.',
          icon: 'schedule',
          highlight: true,
        },
        {
          title: 'Waitlist Policy',
          content: 'If you cancel within 12 hours, your spot may be offered to waitlisted participants.',
          icon: 'queue',
        },
        {
          title: 'Minimum Participants',
          content: 'Classes with insufficient participants may be cancelled up to 2 hours before start time.',
          icon: 'group-remove',
        },
        {
          title: 'Class Credits',
          content: 'Cancelled group classes can be converted to credits valid for 3 months.',
          icon: 'card-giftcard',
        },
      ],
    },
    personal: {
      title: 'Personal Training Policy',
      icon: 'person',
      color: COLORS.secondary,
      sections: [
        {
          title: 'Premium Cancellation Terms',
          content: 'Personal training requires 48-hour advance notice for free cancellation.',
          icon: 'schedule',
          highlight: true,
        },
        {
          title: 'Late Cancellation Fee',
          content: 'Cancellations within 48 hours incur 75% of session fee.',
          icon: 'payment',
          warning: true,
        },
        {
          title: 'Trainer Availability',
          content: 'Rescheduling subject to trainer availability and may require longer lead time.',
          icon: 'person-search',
        },
        {
          title: 'Package Sessions',
          content: 'Personal training packages follow the same 48-hour rule for all sessions.',
          icon: 'inventory',
        },
      ],
    },
    packages: {
      title: 'Package & Membership Policy',
      icon: 'card-giftcard',
      color: COLORS.error,
      sections: [
        {
          title: 'Package Cancellations',
          content: 'Multi-session packages can be cancelled within 7 days of purchase for full refund.',
          icon: 'inventory',
          highlight: true,
        },
        {
          title: 'Partial Refunds',
          content: 'After 7 days, refunds calculated based on unused sessions minus 20% processing fee.',
          icon: 'calculate',
        },
        {
          title: 'Membership Freezing',
          content: 'Memberships can be frozen for up to 3 months for medical reasons or travel.',
          icon: 'pause',
        },
        {
          title: 'Transfer Policy',
          content: 'Package sessions can be transferred to family members with 48-hour notice.',
          icon: 'swap-calls',
        },
      ],
    },
  };

  // Component mount animation
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

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh policy information');
    }
    setRefreshing(false);
  }, []);

  // Toggle section expansion
  const toggleSection = (sectionIndex) => {
    Vibration.vibrate(10);
    setExpandedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  // Handle contact support
  const handleContactSupport = () => {
    Vibration.vibrate(10);
    setShowContactModal(true);
  };

  // Handle contact method
  const handleContactMethod = (method) => {
    Vibration.vibrate(10);
    setShowContactModal(false);
    
    switch (method) {
      case 'email':
        Linking.openURL('mailto:support@trainingapp.com?subject=Cancellation Policy Inquiry');
        break;
      case 'phone':
        Linking.openURL('tel:+1234567890');
        break;
      case 'chat':
        Alert.alert('Live Chat', 'Opening live chat support...', [
          { text: 'OK', onPress: () => console.log('Opening chat') }
        ]);
        break;
    }
  };

  // Get section style based on type
  const getSectionStyle = (section) => {
    if (section.highlight) return { backgroundColor: COLORS.primary + '10', borderLeftColor: COLORS.primary };
    if (section.warning) return { backgroundColor: COLORS.warning + '10', borderLeftColor: COLORS.warning };
    if (section.error) return { backgroundColor: COLORS.error + '10', borderLeftColor: COLORS.error };
    return { backgroundColor: COLORS.white, borderLeftColor: COLORS.border };
  };

  // Header component
  const PolicyHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={{
        paddingTop: StatusBar.currentHeight + SPACING.lg,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
      }}
    >
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
          Cancellation Policy 📋
        </Text>

        <TouchableOpacity
          onPress={handleContactSupport}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon name="support-agent" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  // Policy type selector
  const PolicyTypeSelector = () => (
    <View style={{ paddingVertical: SPACING.md }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.md }}
      >
        {policyTypes.map((type, index) => (
          <TouchableOpacity
            key={type.id}
            onPress={() => {
              setActivePolicy(type.id);
              Vibration.vibrate(10);
            }}
            style={{
              marginRight: SPACING.sm,
            }}
          >
            <Surface
              style={{
                padding: SPACING.md,
                borderRadius: 12,
                backgroundColor: activePolicy === type.id ? COLORS.primary : COLORS.white,
                elevation: activePolicy === type.id ? 4 : 2,
                minWidth: 120,
                alignItems: 'center',
              }}
            >
              <Icon
                name={type.icon}
                size={24}
                color={activePolicy === type.id ? COLORS.white : COLORS.primary}
              />
              <Text style={[
                TEXT_STYLES.caption,
                {
                  color: activePolicy === type.id ? COLORS.white : COLORS.text,
                  fontWeight: activePolicy === type.id ? '600' : 'normal',
                  textAlign: 'center',
                  marginTop: SPACING.xs,
                }
              ]}>
                {type.title}
              </Text>
            </Surface>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Policy section component
  const PolicySection = ({ section, index, isExpanded, onToggle }) => (
    <Card style={{
      margin: SPACING.sm,
      marginHorizontal: SPACING.md,
      elevation: 2,
    }}>
      <TouchableOpacity onPress={() => onToggle(index)}>
        <View style={[
          {
            padding: SPACING.md,
            borderLeftWidth: 4,
            borderLeftColor: COLORS.border,
          },
          getSectionStyle(section)
        ]}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Icon
                name={section.icon}
                size={24}
                color={section.highlight ? COLORS.primary : 
                      section.warning ? COLORS.warning :
                      section.error ? COLORS.error : COLORS.textSecondary}
                style={{ marginRight: SPACING.md }}
              />
              <Text style={[TEXT_STYLES.h3, { flex: 1 }]} numberOfLines={2}>
                {section.title}
              </Text>
            </View>
            
            <Icon
              name={isExpanded ? 'expand-less' : 'expand-more'}
              size={24}
              color={COLORS.textSecondary}
            />
          </View>
          
          {isExpanded && (
            <>
              <Divider style={{ marginVertical: SPACING.md }} />
              <Text style={[TEXT_STYLES.body, { lineHeight: 22 }]}>
                {section.content}
              </Text>
              
              {(section.highlight || section.warning || section.error) && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: SPACING.md,
                  padding: SPACING.sm,
                  borderRadius: 8,
                  backgroundColor: section.highlight ? COLORS.primary + '15' :
                                 section.warning ? COLORS.warning + '15' :
                                 COLORS.error + '15',
                }}>
                  <Icon
                    name={section.highlight ? 'info' : section.warning ? 'warning' : 'error'}
                    size={16}
                    color={section.highlight ? COLORS.primary : 
                          section.warning ? COLORS.warning : COLORS.error}
                    style={{ marginRight: SPACING.sm }}
                  />
                  <Text style={[
                    TEXT_STYLES.caption,
                    {
                      color: section.highlight ? COLORS.primary : 
                            section.warning ? COLORS.warning : COLORS.error,
                      fontWeight: '600',
                      flex: 1,
                    }
                  ]}>
                    {section.highlight ? 'Important Information' :
                     section.warning ? 'Please Note' : 'Important Warning'}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );

  // Contact modal component
  const ContactModal = () => (
    <Portal>
      <Modal
        visible={showContactModal}
        onDismiss={() => setShowContactModal(false)}
        contentContainerStyle={{
          margin: SPACING.lg,
        }}
      >
        <BlurView intensity={100} style={{ borderRadius: 12 }}>
          <Card style={{ elevation: 8 }}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={{
                padding: SPACING.lg,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
              }}
            >
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
                  Contact Support 💬
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  iconColor={COLORS.white}
                  onPress={() => setShowContactModal(false)}
                />
              </View>
              <Text style={[TEXT_STYLES.body, { color: COLORS.white, opacity: 0.9 }]}>
                Need help with cancellations? We're here to assist!
              </Text>
            </LinearGradient>
            
            <View style={{ padding: SPACING.lg }}>
              <TouchableOpacity
                onPress={() => handleContactMethod('email')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: SPACING.md,
                  borderRadius: 8,
                  backgroundColor: COLORS.lightGray,
                  marginBottom: SPACING.md,
                }}
              >
                <Icon name="email" size={24} color={COLORS.primary} />
                <View style={{ marginLeft: SPACING.md, flex: 1 }}>
                  <Text style={TEXT_STYLES.h3}>Email Support</Text>
                  <Text style={TEXT_STYLES.caption}>support@trainingapp.com</Text>
                </View>
                <Icon name="arrow-forward-ios" size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleContactMethod('phone')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: SPACING.md,
                  borderRadius: 8,
                  backgroundColor: COLORS.lightGray,
                  marginBottom: SPACING.md,
                }}
              >
                <Icon name="phone" size={24} color={COLORS.success} />
                <View style={{ marginLeft: SPACING.md, flex: 1 }}>
                  <Text style={TEXT_STYLES.h3}>Phone Support</Text>
                  <Text style={TEXT_STYLES.caption}>+1 (234) 567-8900</Text>
                </View>
                <Icon name="arrow-forward-ios" size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleContactMethod('chat')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: SPACING.md,
                  borderRadius: 8,
                  backgroundColor: COLORS.lightGray,
                }}
              >
                <Icon name="chat" size={24} color={COLORS.warning} />
                <View style={{ marginLeft: SPACING.md, flex: 1 }}>
                  <Text style={TEXT_STYLES.h3}>Live Chat</Text>
                  <Text style={TEXT_STYLES.caption}>Available 24/7</Text>
                </View>
                <Icon name="arrow-forward-ios" size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  // Quick summary component
  const QuickSummary = () => (
    <Card style={{
      margin: SPACING.md,
      elevation: 3,
      backgroundColor: COLORS.primary + '08',
    }}>
      <View style={{ padding: SPACING.lg }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: SPACING.md,
        }}>
          <Icon name="info" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm, color: COLORS.primary }]}>
            Quick Summary
          </Text>
        </View>
        
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: SPACING.md,
        }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>24h</Text>
            <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>Free Cancellation</Text>
          </View>
          
          <View style={{
            width: 1,
            height: 40,
            backgroundColor: COLORS.border,
            marginHorizontal: SPACING.md,
          }} />
          
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.warning }]}>50%</Text>
            <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>Late Cancel Fee</Text>
          </View>
          
          <View style={{
            width: 1,
            height: 40,
            backgroundColor: COLORS.border,
            marginHorizontal: SPACING.md,
          }} />
          
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.error }]}>100%</Text>
            <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>No-Show Fee</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const currentPolicy = policies[activePolicy];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="light-content"
      />
      
      <PolicyHeader />
      
      <Animated.View style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}>
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              progressBackgroundColor={COLORS.white}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <QuickSummary />
          
          <PolicyTypeSelector />
          
          {/* Active policy header */}
          <Card style={{
            margin: SPACING.md,
            elevation: 4,
          }}>
            <LinearGradient
              colors={[currentPolicy.color, currentPolicy.color + 'CC']}
              style={{
                padding: SPACING.lg,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Icon
                name={currentPolicy.icon}
                size={32}
                color={COLORS.white}
                style={{ marginRight: SPACING.md }}
              />
              <Text style={[TEXT_STYLES.h2, { color: COLORS.white, flex: 1 }]}>
                {currentPolicy.title}
              </Text>
            </LinearGradient>
          </Card>

          {/* Policy sections */}
          {currentPolicy.sections.map((section, index) => (
            <PolicySection
              key={index}
              section={section}
              index={index}
              isExpanded={expandedSections[index]}
              onToggle={toggleSection}
            />
          ))}

          {/* Important notes */}
          <Card style={{
            margin: SPACING.md,
            elevation: 2,
            backgroundColor: COLORS.lightGray,
          }}>
            <View style={{ padding: SPACING.lg }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: SPACING.md,
              }}>
                <Icon name="gavel" size={24} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
                  Important Notes
                </Text>
              </View>
              
              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
                • All times are based on the local timezone of the training facility
              </Text>
              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
                • Refunds typically process within 5-7 business days
              </Text>
              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
                • Group class credits expire after 3 months from issue date
              </Text>
              <Text style={TEXT_STYLES.body}>
                • This policy is subject to change with 30 days notice
              </Text>
            </View>
          </Card>

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* Search FAB */}
      <FAB
        icon="search"
        style={{
          position: 'absolute',
          bottom: SPACING.lg,
          right: SPACING.lg,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => {
          Vibration.vibrate(10);
          Alert.alert('Search', 'Search functionality coming soon!');
        }}
      />

      <ContactModal />
    </View>
  );
};

export default CancellationPolicy;