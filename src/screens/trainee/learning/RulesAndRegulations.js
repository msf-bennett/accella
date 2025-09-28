import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
  StatusBar,
  Linking,
  Share,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  Divider,
  List,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const RulesAndRegulationsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedSections, setExpandedSections] = useState({});
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  const categories = [
    { key: 'all', label: 'All Rules', icon: 'rule' },
    { key: 'safety', label: 'Safety', icon: 'security' },
    { key: 'conduct', label: 'Conduct', icon: 'people' },
    { key: 'training', label: 'Training', icon: 'fitness-center' },
    { key: 'booking', label: 'Booking', icon: 'schedule' },
    { key: 'payment', label: 'Payment', icon: 'payment' },
    { key: 'privacy', label: 'Privacy', icon: 'privacy-tip' }
  ];

  const rulesData = [
    {
      id: 1,
      category: 'safety',
      title: 'Safety & Equipment Guidelines 🛡️',
      priority: 'high',
      icon: 'security',
      lastUpdated: '2024-12-15',
      rules: [
        {
          id: '1.1',
          title: 'Equipment Usage',
          description: 'Proper use and maintenance of training equipment',
          details: [
            'Always inspect equipment before use',
            'Report damaged equipment immediately to your trainer',
            'Use equipment only for its intended purpose',
            'Return equipment to designated areas after use',
            'Follow weight limits and safety guidelines for all equipment'
          ]
        },
        {
          id: '1.2',
          title: 'Personal Safety',
          description: 'Guidelines to ensure your safety during training',
          details: [
            'Always warm up before intense exercise',
            'Stay hydrated throughout your workout',
            'Listen to your body and rest when needed',
            'Inform your trainer of any injuries or health conditions',
            'Use proper form and technique as instructed'
          ]
        },
        {
          id: '1.3',
          title: 'Emergency Procedures',
          description: 'What to do in case of emergencies',
          details: [
            'Know the location of first aid kits and emergency exits',
            'Report injuries or incidents immediately',
            'Follow evacuation procedures when alarms sound',
            'Emergency contact numbers are posted at all locations',
            'Trainers are certified in first aid and CPR'
          ]
        }
      ]
    },
    {
      id: 2,
      category: 'conduct',
      title: 'Code of Conduct & Behavior 🤝',
      priority: 'high',
      icon: 'people',
      lastUpdated: '2024-12-10',
      rules: [
        {
          id: '2.1',
          title: 'Respectful Behavior',
          description: 'Maintaining a positive and respectful environment',
          details: [
            'Treat all members, staff, and trainers with respect',
            'Use appropriate language at all times',
            'Respect personal space and boundaries',
            'Be inclusive and welcoming to all participants',
            'No discrimination based on fitness level, age, or background'
          ]
        },
        {
          id: '2.2',
          title: 'Professional Conduct',
          description: 'Expected behavior in training environments',
          details: [
            'Arrive on time for scheduled sessions',
            'Come prepared with appropriate workout attire',
            'Follow trainer instructions and guidelines',
            'Maintain personal hygiene standards',
            'Keep personal belongings secure and organized'
          ]
        },
        {
          id: '2.3',
          title: 'Communication Guidelines',
          description: 'How to communicate effectively and appropriately',
          details: [
            'Use the in-app messaging for training-related communication',
            'Provide constructive feedback respectfully',
            'Report concerns to appropriate staff members',
            'Maintain confidentiality of other members\' information',
            'Use official channels for complaints or suggestions'
          ]
        }
      ]
    },
    {
      id: 3,
      category: 'training',
      title: 'Training Rules & Protocols 🏋️',
      priority: 'medium',
      icon: 'fitness-center',
      lastUpdated: '2024-12-08',
      rules: [
        {
          id: '3.1',
          title: 'Session Attendance',
          description: 'Rules regarding training session attendance',
          details: [
            'Notify your trainer at least 2 hours before canceling',
            'Late arrivals may result in shortened sessions',
            'Consistent no-shows may affect your training schedule',
            'Make-up sessions subject to trainer availability',
            'Group sessions have minimum attendance requirements'
          ]
        },
        {
          id: '3.2',
          title: 'Progress Tracking',
          description: 'How progress is monitored and recorded',
          details: [
            'Complete all assigned assessments and measurements',
            'Provide honest feedback about your training experience',
            'Update health information when changes occur',
            'Participate in periodic fitness evaluations',
            'Review progress reports with your trainer regularly'
          ]
        },
        {
          id: '3.3',
          title: 'Training Modifications',
          description: 'When and how training plans can be adjusted',
          details: [
            'Discuss modifications with your trainer before implementing',
            'Medical clearance required for certain adjustments',
            'Changes must align with your stated fitness goals',
            'Progressive overload principles will be maintained',
            'All modifications will be documented in your profile'
          ]
        }
      ]
    },
    {
      id: 4,
      category: 'booking',
      title: 'Booking & Scheduling Policies 📅',
      priority: 'medium',
      icon: 'schedule',
      lastUpdated: '2024-12-12',
      rules: [
        {
          id: '4.1',
          title: 'Session Booking',
          description: 'How to book and manage training sessions',
          details: [
            'Book sessions through the app at least 24 hours in advance',
            'Cancellations must be made 2+ hours before session time',
            'Late cancellations may incur charges',
            'Reschedule requests subject to trainer availability',
            'Group sessions require minimum 24-hour booking notice'
          ]
        },
        {
          id: '4.2',
          title: 'Availability & Scheduling',
          description: 'Understanding trainer and facility availability',
          details: [
            'Check real-time availability in the app',
            'Peak hours may have limited availability',
            'Holiday schedules will be posted in advance',
            'Emergency closures will be communicated immediately',
            'Prefer consistent weekly time slots for best results'
          ]
        }
      ]
    },
    {
      id: 5,
      category: 'payment',
      title: 'Payment & Billing Policies 💳',
      priority: 'high',
      icon: 'payment',
      lastUpdated: '2024-12-14',
      rules: [
        {
          id: '5.1',
          title: 'Payment Processing',
          description: 'How payments are processed and managed',
          details: [
            'All payments processed securely through the app',
            'Payment required before session confirmation',
            'Automatic billing for subscription packages',
            'Payment methods can be updated in app settings',
            'All transactions are recorded and receipts provided'
          ]
        },
        {
          id: '5.2',
          title: 'Refund Policy',
          description: 'Conditions under which refunds are provided',
          details: [
            'Refunds available for unused sessions in packages',
            'Emergency cancellations may qualify for full refund',
            'Processing time for refunds is 3-5 business days',
            'Subscription refunds prorated based on usage',
            'Contact support for refund requests and disputes'
          ]
        }
      ]
    },
    {
      id: 6,
      category: 'privacy',
      title: 'Privacy & Data Protection 🔒',
      priority: 'high',
      icon: 'privacy-tip',
      lastUpdated: '2024-12-16',
      rules: [
        {
          id: '6.1',
          title: 'Personal Data',
          description: 'How your personal information is collected and used',
          details: [
            'Data collected only for training and service improvement',
            'Personal information encrypted and securely stored',
            'No sharing of data with third parties without consent',
            'You can request data deletion at any time',
            'Regular security audits ensure data protection'
          ]
        },
        {
          id: '6.2',
          title: 'Health Information',
          description: 'Special protections for health-related data',
          details: [
            'Medical information shared only with assigned trainers',
            'Health data used solely for safety and program design',
            'Strict confidentiality maintained by all staff',
            'You control what health information to share',
            'Regular review of health data sharing permissions'
          ]
        }
      ]
    }
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const filteredRules = rulesData.filter(section => {
    const matchesSearch = section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         section.rules.some(rule => 
                           rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           rule.description.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.primary;
    }
  };

  const shareRules = async () => {
    try {
      await Share.share({
        message: 'Check out the training rules and regulations for our fitness app!',
        title: 'Fitness Training Rules & Regulations',
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share at this time.');
    }
  };

  const contactSupport = () => {
    Alert.alert(
      'Contact Support 📞',
      'Need help understanding our rules and regulations?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email Support', onPress: () => Linking.openURL('mailto:support@fitnessapp.com') },
        { text: 'Call Support', onPress: () => Linking.openURL('tel:+1234567890') }
      ]
    );
  };

  return (
    <Animated.View style={{ 
      flex: 1, 
      backgroundColor: COLORS.background,
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }]
    }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.md,
          paddingHorizontal: SPACING.lg,
          paddingBottom: SPACING.lg,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>
              Rules & Regulations 📋
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)' }]}>
              Important guidelines for safe and effective training
            </Text>
          </View>
          <IconButton
            icon="share"
            iconColor="white"
            size={24}
            onPress={shareRules}
          />
        </View>
        
        <Surface style={{ borderRadius: 8, elevation: 2, marginTop: SPACING.md }}>
          <View style={{ 
            padding: SPACING.md, 
            flexDirection: 'row', 
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 8
          }}>
            <Icon name="info" size={20} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
            <Text style={[TEXT_STYLES.caption, { flex: 1, color: COLORS.text }]}>
              Last updated: December 16, 2024 • Please review all sections carefully
            </Text>
          </View>
        </Surface>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Search Bar */}
        <View style={{ padding: SPACING.lg }}>
          <Searchbar
            placeholder="Search rules and regulations..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ marginBottom: SPACING.md }}
          />
        </View>

        {/* Categories */}
        <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <Chip
                key={category.key}
                selected={selectedCategory === category.key}
                onPress={() => setSelectedCategory(category.key)}
                icon={category.icon}
                style={{ marginRight: SPACING.sm }}
                selectedColor={COLORS.primary}
              >
                {category.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
          <Card style={{ elevation: 2 }}>
            <Card.Content>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Quick Actions 🚀</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <TouchableOpacity
                  style={{ alignItems: 'center', flex: 1 }}
                  onPress={contactSupport}
                >
                  <Icon name="support-agent" size={32} color={COLORS.primary} />
                  <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs, textAlign: 'center' }]}>
                    Contact Support
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={{ alignItems: 'center', flex: 1 }}
                  onPress={() => Alert.alert('Coming Soon! 🚀', 'PDF download feature is under development.')}
                >
                  <Icon name="download" size={32} color={COLORS.success} />
                  <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs, textAlign: 'center' }]}>
                    Download PDF
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={{ alignItems: 'center', flex: 1 }}
                  onPress={() => Alert.alert('Coming Soon! 🚀', 'FAQ section is being prepared.')}
                >
                  <Icon name="help" size={32} color={COLORS.warning} />
                  <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs, textAlign: 'center' }]}>
                    View FAQ
                  </Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Rules Sections */}
        <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl }}>
          {filteredRules.length > 0 ? (
            filteredRules.map((section) => (
              <Card key={section.id} style={{ marginBottom: SPACING.lg, elevation: 3 }}>
                <TouchableOpacity
                  onPress={() => toggleSection(section.id)}
                  activeOpacity={0.7}
                >
                  <Card.Content style={{ padding: SPACING.lg }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <Avatar.Icon
                          size={40}
                          icon={section.icon}
                          style={{ 
                            backgroundColor: getPriorityColor(section.priority) + '20',
                            marginRight: SPACING.md 
                          }}
                          color={getPriorityColor(section.priority)}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={[TEXT_STYLES.h3, { marginBottom: 4 }]}>
                            {section.title}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Chip
                              size="small"
                              style={{ 
                                backgroundColor: getPriorityColor(section.priority) + '20',
                                marginRight: SPACING.sm 
                              }}
                              textStyle={{ 
                                color: getPriorityColor(section.priority),
                                fontSize: 10 
                              }}
                            >
                              {section.priority.toUpperCase()}
                            </Chip>
                            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                              {section.rules.length} rules • Updated {section.lastUpdated}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Icon
                        name={expandedSections[section.id] ? "expand-less" : "expand-more"}
                        size={24}
                        color={COLORS.primary}
                      />
                    </View>
                  </Card.Content>
                </TouchableOpacity>

                {expandedSections[section.id] && (
                  <View>
                    <Divider />
                    {section.rules.map((rule, ruleIndex) => (
                      <View key={rule.id}>
                        <List.Item
                          title={rule.title}
                          description={rule.description}
                          left={(props) => (
                            <List.Icon 
                              {...props} 
                              icon="rule" 
                              color={COLORS.primary}
                            />
                          )}
                          right={(props) => (
                            <List.Icon 
                              {...props} 
                              icon="chevron-right" 
                            />
                          )}
                          onPress={() => {
                            Alert.alert(
                              rule.title,
                              rule.details.map((detail, index) => `${index + 1}. ${detail}`).join('\n\n'),
                              [{ text: 'Got it!', style: 'default' }]
                            );
                          }}
                          style={{ paddingHorizontal: SPACING.lg }}
                        />
                        {ruleIndex < section.rules.length - 1 && (
                          <Divider style={{ marginLeft: SPACING.xl }} />
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            ))
          ) : (
            <Card style={{ padding: SPACING.xl, alignItems: 'center' }}>
              <Icon name="search-off" size={64} color={COLORS.lightGray} style={{ marginBottom: SPACING.md }} />
              <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginBottom: SPACING.sm }]}>
                No rules found
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center' }]}>
                Try adjusting your search or category filters
              </Text>
              <Button
                mode="outlined"
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                style={{ marginTop: SPACING.md }}
              >
                Clear Filters
              </Button>
            </Card>
          )}
        </View>

        {/* Footer Information */}
        <View style={{ 
          paddingHorizontal: SPACING.lg, 
          paddingBottom: SPACING.xl,
          marginTop: SPACING.lg 
        }}>
          <Card style={{ backgroundColor: COLORS.primary + '10', elevation: 1 }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Icon name="gavel" size={24} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
                <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                  Important Notice
                </Text>
              </View>
              <Text style={[TEXT_STYLES.body, { color: COLORS.text, lineHeight: 22 }]}>
                These rules and regulations are subject to change. Users will be notified of any updates through the app. 
                By using our services, you agree to comply with these guidelines and any future modifications.
              </Text>
              
              <View style={{ marginTop: SPACING.md, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button
                  mode="text"
                  onPress={() => Alert.alert('Coming Soon! 🚀', 'Terms of Service page is being prepared.')}
                  textColor={COLORS.primary}
                >
                  Terms of Service
                </Button>
                <Button
                  mode="text"
                  onPress={() => Alert.alert('Coming Soon! 🚀', 'Privacy Policy page is being prepared.')}
                  textColor={COLORS.primary}
                >
                  Privacy Policy
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

export default RulesAndRegulationsScreen;