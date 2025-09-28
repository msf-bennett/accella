import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  Surface,
  Portal,
  Modal,
  Searchbar,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
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
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text, lineHeight: 24 },
  caption: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const CoachGuide = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedSections, setExpandedSections] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const categories = [
    { id: 'all', label: 'All Topics', icon: 'dashboard', color: COLORS.primary },
    { id: 'safety', label: 'Safety', icon: 'security', color: COLORS.error },
    { id: 'development', label: 'Development', icon: 'trending-up', color: COLORS.success },
    { id: 'communication', label: 'Communication', icon: 'chat', color: COLORS.warning },
    { id: 'wellness', label: 'Wellness', icon: 'favorite', color: '#E91E63' },
    { id: 'behavior', label: 'Behavior', icon: 'psychology', color: '#9C27B0' },
  ];

  const guideContent = [
    {
      id: 'child-protection',
      title: '🛡️ Child Protection Protocols',
      category: 'safety',
      priority: 'high',
      readTime: '5 min',
      content: {
        overview: 'Essential safeguarding measures for youth coaching',
        keyPoints: [
          'Always maintain appropriate physical boundaries',
          'Never be alone with a child - ensure "two-deep leadership"',
          'Report any concerning behavior immediately',
          'Keep detailed records of all interactions',
          'Understand mandatory reporting requirements',
        ],
        actions: [
          'Review safeguarding policies monthly',
          'Complete background check verification',
          'Attend child protection training annually',
        ]
      }
    },
    {
      id: 'age-appropriate-training',
      title: '⚡ Age-Appropriate Training Methods',
      category: 'development',
      priority: 'high',
      readTime: '8 min',
      content: {
        overview: 'Tailoring training approaches for different developmental stages',
        keyPoints: [
          'Ages 6-8: Focus on fun, basic skills, short attention spans',
          'Ages 9-12: Introduce competition, skill refinement, teamwork',
          'Ages 13-16: Advanced techniques, physical development, mental training',
          'Always prioritize enjoyment over performance',
          'Adjust intensity based on individual development',
        ],
        actions: [
          'Assess individual developmental readiness',
          'Plan varied activities for different skill levels',
          'Monitor for signs of overtraining or burnout',
        ]
      }
    },
    {
      id: 'positive-communication',
      title: '💬 Positive Communication Strategies',
      category: 'communication',
      priority: 'medium',
      readTime: '6 min',
      content: {
        overview: 'Building trust and confidence through effective communication',
        keyPoints: [
          'Use encouraging language and constructive feedback',
          'Listen actively to concerns and ideas',
          'Adapt communication style to individual personalities',
          'Set clear, achievable expectations',
          'Celebrate effort over outcomes',
        ],
        actions: [
          'Practice active listening techniques',
          'Document communication preferences for each child',
          'Regular check-ins with parents/guardians',
        ]
      }
    },
    {
      id: 'mental-wellness',
      title: '🧠 Mental Health & Wellness',
      category: 'wellness',
      priority: 'high',
      readTime: '7 min',
      content: {
        overview: 'Supporting psychological wellbeing in young athletes',
        keyPoints: [
          'Recognize signs of anxiety, depression, or stress',
          'Create a supportive, non-judgmental environment',
          'Teach coping strategies and resilience skills',
          'Balance challenge with support',
          'Know when to refer to mental health professionals',
        ],
        actions: [
          'Learn mental health first aid basics',
          'Establish referral network with professionals',
          'Monitor mood and behavior changes',
        ]
      }
    },
    {
      id: 'behavior-management',
      title: '🎯 Positive Behavior Management',
      category: 'behavior',
      priority: 'medium',
      readTime: '6 min',
      content: {
        overview: 'Creating structure while maintaining positive relationships',
        keyPoints: [
          'Establish clear, consistent rules and consequences',
          'Use positive reinforcement over punishment',
          'Address behaviors privately when possible',
          'Model the behavior you want to see',
          'Focus on learning opportunities from mistakes',
        ],
        actions: [
          'Create team behavior charter together',
          'Implement reward systems for positive behavior',
          'Regular team meetings to address concerns',
        ]
      }
    },
    {
      id: 'nutrition-hydration',
      title: '🥗 Nutrition & Hydration Guidelines',
      category: 'wellness',
      priority: 'medium',
      readTime: '5 min',
      content: {
        overview: 'Supporting healthy eating habits and proper hydration',
        keyPoints: [
          'Emphasize balanced nutrition over restrictive diets',
          'Ensure regular hydration breaks during activities',
          'Educate about pre and post-activity nutrition',
          'Be aware of eating disorder warning signs',
          'Promote body positivity and healthy relationships with food',
        ],
        actions: [
          'Share age-appropriate nutrition resources',
          'Schedule regular hydration reminders',
          'Partner with sports nutritionist if available',
        ]
      }
    },
    {
      id: 'injury-prevention',
      title: '⚕️ Injury Prevention & Response',
      category: 'safety',
      priority: 'high',
      readTime: '8 min',
      content: {
        overview: 'Keeping young athletes safe and responding to injuries',
        keyPoints: [
          'Ensure proper warm-up and cool-down protocols',
          'Teach correct technique to prevent overuse injuries',
          'Know basic first aid and emergency procedures',
          'Have emergency contacts and medical information available',
          'Never ignore pain or encourage "playing through" injuries',
        ],
        actions: [
          'Maintain current first aid certification',
          'Keep emergency action plans updated',
          'Regular equipment safety checks',
        ]
      }
    },
    {
      id: 'parent-collaboration',
      title: '👨‍👩‍👧‍👦 Parent & Guardian Collaboration',
      category: 'communication',
      priority: 'medium',
      readTime: '6 min',
      content: {
        overview: 'Building strong partnerships with families',
        keyPoints: [
          'Maintain regular, transparent communication',
          'Respect parental concerns and input',
          'Establish clear boundaries and expectations',
          'Share progress updates regularly',
          'Involve parents in goal setting when appropriate',
        ],
        actions: [
          'Schedule regular parent check-ins',
          'Create parent handbook with policies',
          'Host parent education sessions',
        ]
      }
    },
  ];

  const filteredContent = guideContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.overview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleSection = (id) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const openGuideModal = (guide) => {
    setSelectedGuide(guide);
    setModalVisible(true);
  };

  const renderCategoryChips = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
      {categories.map((category) => (
        <Chip
          key={category.id}
          mode={selectedCategory === category.id ? 'flat' : 'outlined'}
          selected={selectedCategory === category.id}
          onPress={() => setSelectedCategory(category.id)}
          icon={category.icon}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && { backgroundColor: category.color + '20' }
          ]}
          textStyle={[
            styles.categoryChipText,
            selectedCategory === category.id && { color: category.color }
          ]}
        >
          {category.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderGuideCard = (guide) => (
    <Card key={guide.id} style={styles.guideCard} elevation={3}>
      <TouchableOpacity onPress={() => openGuideModal(guide)}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{guide.title}</Text>
            <Chip
              mode="outlined"
              compact
              style={[
                styles.priorityChip,
                { borderColor: guide.priority === 'high' ? COLORS.error : COLORS.warning }
              ]}
            >
              {guide.priority === 'high' ? 'Essential' : 'Important'}
            </Chip>
          </View>
          
          <Text style={styles.cardOverview} numberOfLines={2}>
            {guide.content.overview}
          </Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.readTime}>
              <MaterialIcons name="schedule" size={16} color={COLORS.textSecondary} />
              <Text style={styles.readTimeText}>{guide.readTime}</Text>
            </View>
            
            <Button
              mode="contained"
              compact
              onPress={() => openGuideModal(guide)}
              style={styles.readButton}
            >
              Read Guide
            </Button>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={styles.quickActionsCard} elevation={2}>
      <Card.Content>
        <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Feature Coming Soon', 'Emergency contact feature is under development.')}
          >
            <MaterialIcons name="emergency" size={32} color={COLORS.error} />
            <Text style={styles.quickActionText}>Emergency Contacts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Feature Coming Soon', 'Incident reporting feature is under development.')}
          >
            <MaterialIcons name="report" size={32} color={COLORS.warning} />
            <Text style={styles.quickActionText}>Report Incident</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Feature Coming Soon', 'Training resources feature is under development.')}
          >
            <MaterialIcons name="school" size={32} color={COLORS.success} />
            <Text style={styles.quickActionText}>Training Resources</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Feature Coming Soon', 'Expert consultation feature is under development.')}
          >
            <MaterialIcons name="support-agent" size={32} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Expert Consultation</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderModalContent = () => {
    if (!selectedGuide) return null;

    return (
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={50} style={styles.modalBlur}>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedGuide.title}</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <Surface style={styles.modalContent}>
                <Text style={styles.modalOverview}>{selectedGuide.content.overview}</Text>
                
                <Text style={styles.modalSectionTitle}>Key Points:</Text>
                {selectedGuide.content.keyPoints.map((point, index) => (
                  <View key={index} style={styles.keyPoint}>
                    <MaterialIcons name="check-circle" size={20} color={COLORS.success} />
                    <Text style={styles.keyPointText}>{point}</Text>
                  </View>
                ))}

                <Text style={styles.modalSectionTitle}>Action Items:</Text>
                {selectedGuide.content.actions.map((action, index) => (
                  <View key={index} style={styles.actionItem}>
                    <MaterialIcons name="assignment" size={20} color={COLORS.primary} />
                    <Text style={styles.actionText}>{action}</Text>
                  </View>
                ))}

                <Button
                  mode="contained"
                  onPress={() => {
                    setModalVisible(false);
                    Alert.alert('Feature Coming Soon', 'Bookmark and progress tracking features are under development.');
                  }}
                  style={styles.bookmarkButton}
                  icon="bookmark"
                >
                  Bookmark This Guide
                </Button>
              </Surface>
            </ScrollView>
          </BlurView>
        </Modal>
      </Portal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Coach's Wellness Guide</Text>
              <Text style={styles.headerSubtitle}>Supporting young athletes safely 🏆</Text>
            </View>
            <Avatar.Icon
              size={50}
              icon="shield-check"
              style={styles.headerAvatar}
            />
          </View>
        </Animated.View>
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
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
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search coaching guides..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              icon="search"
              clearIcon="close"
            />
          </View>

          {renderCategoryChips()}
          {renderQuickActions()}

          <View style={styles.guidesSection}>
            <Text style={styles.sectionTitle}>📚 Coaching Guides</Text>
            <Text style={styles.sectionSubtitle}>
              {filteredContent.length} guides available
            </Text>
            
            {filteredContent.map(renderGuideCard)}
          </View>

          <Card style={styles.supportCard} elevation={2}>
            <Card.Content>
              <Text style={styles.sectionTitle}>🤝 Need Additional Support?</Text>
              <Text style={styles.supportText}>
                Remember, you're not alone in this journey. Our expert network is here to help.
              </Text>
              <Button
                mode="outlined"
                onPress={() => Alert.alert('Feature Coming Soon', 'Expert support network feature is under development.')}
                style={styles.supportButton}
                icon="support-agent"
              >
                Connect with Experts
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>

      {renderModalContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.xs,
  },
  headerAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
  },
  searchContainer: {
    marginBottom: SPACING.lg,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  categoryContainer: {
    marginBottom: SPACING.lg,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  categoryChipText: {
    fontSize: 12,
  },
  quickActionsCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  quickAction: {
    alignItems: 'center',
    justifyContent: 'center',
    width: (width - SPACING.lg * 3) / 2,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontWeight: '500',
  },
  guidesSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.lg,
  },
  guideCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    ...TEXT_STYLES.h3,
    flex: 1,
    marginRight: SPACING.sm,
  },
  priorityChip: {
    backgroundColor: 'transparent',
  },
  cardOverview: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.md,
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTimeText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  readButton: {
    backgroundColor: COLORS.primary,
  },
  supportCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  supportText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  supportButton: {
    borderColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    maxHeight: '90%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    flex: 1,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: SPACING.sm,
  },
  modalContent: {
    padding: SPACING.lg,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
  },
  modalOverview: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.lg,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
  },
  modalSectionTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    color: COLORS.primary,
  },
  keyPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  keyPointText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  actionText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
    fontWeight: '500',
  },
  bookmarkButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: SPACING.xxl,
  },
});

export default CoachGuide;