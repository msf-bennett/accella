import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Share,
  Alert,
  StatusBar,
  Dimensions,
  Vibration,
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
  TextInput,
  Searchbar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const MarketingTools = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, marketing } = useSelector(state => state);
  
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [socialPostText, setSocialPostText] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 23,
    activePromoCodes: 5,
    conversionRate: 18.5,
    socialShares: 45,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const marketingTools = [
    {
      id: 'referrals',
      title: 'Referral Program',
      description: 'Reward clients for bringing friends',
      icon: 'people',
      color: COLORS.primary,
      stats: `${referralStats.totalReferrals} referrals this month`,
    },
    {
      id: 'promo_codes',
      title: 'Promo Codes',
      description: 'Create discount codes for new clients',
      icon: 'local-offer',
      color: '#FF6B6B',
      stats: `${referralStats.activePromoCodes} active codes`,
    },
    {
      id: 'social_media',
      title: 'Social Media Kit',
      description: 'Pre-made posts and content',
      icon: 'share',
      color: '#4ECDC4',
      stats: `${referralStats.socialShares} shares this week`,
    },
    {
      id: 'email_campaigns',
      title: 'Email Marketing',
      description: 'Automated client engagement',
      icon: 'email',
      color: '#45B7D1',
      stats: 'Next campaign in 2 days',
    },
    {
      id: 'testimonials',
      title: 'Client Reviews',
      description: 'Collect and showcase testimonials',
      icon: 'star',
      color: '#FFA726',
      stats: '4.9★ average rating',
    },
    {
      id: 'business_cards',
      title: 'Digital Business Cards',
      description: 'Professional contact sharing',
      icon: 'contact-page',
      color: '#AB47BC',
      stats: '127 views this month',
    },
  ];

  const quickActions = [
    { id: 'create_promo', title: 'New Promo', icon: 'add-circle', color: COLORS.primary },
    { id: 'share_profile', title: 'Share Profile', icon: 'share', color: '#4ECDC4' },
    { id: 'post_social', title: 'Social Post', icon: 'camera', color: '#FF6B6B' },
    { id: 'email_blast', title: 'Email Blast', icon: 'send', color: '#45B7D1' },
  ];

  const handleToolPress = (tool) => {
    Vibration.vibrate(50);
    
    switch (tool.id) {
      case 'referrals':
        navigation.navigate('ReferralProgram');
        break;
      case 'promo_codes':
        setSelectedTool(tool);
        setModalVisible(true);
        break;
      case 'social_media':
        handleSocialMediaKit();
        break;
      case 'email_campaigns':
        Alert.alert(
          'Email Campaigns',
          'Email marketing feature coming soon! Set up automated campaigns to engage your clients.',
          [{ text: 'Got it', style: 'default' }]
        );
        break;
      case 'testimonials':
        navigation.navigate('ClientTestimonials');
        break;
      case 'business_cards':
        handleDigitalBusinessCard();
        break;
      default:
        Alert.alert(
          'Feature Coming Soon',
          'This marketing tool is currently in development.',
          [{ text: 'OK', style: 'default' }]
        );
    }
  };

  const handleQuickAction = (action) => {
    Vibration.vibrate(50);
    
    switch (action.id) {
      case 'create_promo':
        setSelectedTool({ id: 'promo_codes', title: 'Create Promo Code' });
        setModalVisible(true);
        break;
      case 'share_profile':
        handleShareProfile();
        break;
      case 'post_social':
        setSocialPostText(`🏋️‍♂️ Transform your fitness journey with personalized training! 
        
Join me for expert coaching and achieve your goals faster. 
#FitnessCoach #PersonalTrainer #Transformation`);
        setSelectedTool({ id: 'social_post', title: 'Social Media Post' });
        setModalVisible(true);
        break;
      case 'email_blast':
        Alert.alert(
          'Email Blast',
          'Send targeted emails to your client base. Feature coming soon!',
          [{ text: 'OK', style: 'default' }]
        );
        break;
    }
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out ${user.name}'s fitness coaching profile! Professional training programs tailored to your goals. Book your session today! 🏋️‍♂️💪`,
        url: `https://app.fitnesscoach.com/trainer/${user.id}`,
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  const handleSocialMediaKit = () => {
    const socialContent = [
      '🏋️‍♂️ New week, new goals! Who\'s ready to crush their fitness targets?',
      '💪 Consistency beats perfection every time. Small steps = Big results!',
      '🎯 Personalized training programs designed just for YOU. Let\'s chat!',
      '⚡ Energy boost workout coming up! Who wants to join the challenge?',
    ];

    Alert.alert(
      'Social Media Kit',
      'Choose from our pre-made content or create your own:',
      [
        { text: 'Pre-made Posts', onPress: () => showSocialContent(socialContent) },
        { text: 'Create Custom', onPress: () => handleQuickAction({ id: 'post_social' }) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const showSocialContent = (content) => {
    const randomContent = content[Math.floor(Math.random() * content.length)];
    Share.share({ message: randomContent });
  };

  const handleDigitalBusinessCard = async () => {
    const cardInfo = `${user.name} - Certified Fitness Trainer
    
🏋️‍♂️ Specializing in: Strength Training, Weight Loss, Nutrition
📧 Email: ${user.email}
📱 Book sessions: https://app.fitnesscoach.com/trainer/${user.id}
⭐ 4.9/5 Rating from 150+ clients`;

    try {
      await Share.share({
        message: cardInfo,
        title: 'My Fitness Coaching Profile',
      });
    } catch (error) {
      console.error('Error sharing business card:', error);
    }
  };

  const createPromoCode = () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    Alert.alert(
      'Promo Code Created! 🎉',
      `Code "${promoCode}" created successfully! Share it with potential clients for 20% off their first session.`,
      [
        {
          text: 'Share Code',
          onPress: () => Share.share({
            message: `Use promo code "${promoCode}" for 20% off your first fitness training session with ${user.name}! 🏋️‍♂️💪`
          })
        },
        { text: 'Done', style: 'default' }
      ]
    );

    setPromoCode('');
    setModalVisible(false);
  };

  const shareCustomPost = () => {
    if (!socialPostText.trim()) {
      Alert.alert('Error', 'Please enter your post content');
      return;
    }

    Share.share({ message: socialPostText });
    setSocialPostText('');
    setModalVisible(false);
  };

  const renderStatsCard = () => (
    <Card style={styles.statsCard}>
      <LinearGradient
        colors={[COLORS.primary, '#764ba2']}
        style={styles.statsGradient}
      >
        <View style={styles.statsContent}>
          <Text style={styles.statsTitle}>Marketing Performance</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{referralStats.totalReferrals}</Text>
              <Text style={styles.statLabel}>Referrals</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{referralStats.conversionRate}%</Text>
              <Text style={styles.statLabel}>Conversion</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{referralStats.socialShares}</Text>
              <Text style={styles.statLabel}>Shares</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.quickActionCard, { marginLeft: index === 0 ? 0 : SPACING.md }]}
            onPress={() => handleQuickAction(action)}
          >
            <LinearGradient
              colors={[action.color, action.color + '80']}
              style={styles.quickActionGradient}
            >
              <Icon name={action.icon} size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.quickActionTitle}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMarketingTool = (tool) => (
    <TouchableOpacity
      key={tool.id}
      style={styles.toolCard}
      onPress={() => handleToolPress(tool)}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.toolHeader}>
            <View style={[styles.toolIcon, { backgroundColor: tool.color + '20' }]}>
              <Icon name={tool.icon} size={24} color={tool.color} />
            </View>
            <IconButton
              icon="chevron-right"
              iconColor={COLORS.textSecondary}
              size={20}
            />
          </View>
          <Text style={styles.toolTitle}>{tool.title}</Text>
          <Text style={styles.toolDescription}>{tool.description}</Text>
          <View style={styles.toolStats}>
            <Chip
              mode="outlined"
              textStyle={styles.chipText}
              style={[styles.chip, { borderColor: tool.color }]}
            >
              {tool.stats}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10} />
        <Surface style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedTool?.title || 'Marketing Tool'}
            </Text>
            <IconButton
              icon="close"
              onPress={() => setModalVisible(false)}
            />
          </View>

          {selectedTool?.id === 'promo_codes' && (
            <View style={styles.modalBody}>
              <TextInput
                label="Promo Code"
                value={promoCode}
                onChangeText={setPromoCode}
                mode="outlined"
                placeholder="e.g., NEWCLIENT20"
                style={styles.input}
              />
              <Text style={styles.inputHelp}>
                Create a memorable code for 20% off first sessions
              </Text>
              <Button
                mode="contained"
                onPress={createPromoCode}
                style={styles.modalButton}
                contentStyle={styles.buttonContent}
              >
                Create Promo Code
              </Button>
            </View>
          )}

          {selectedTool?.id === 'social_post' && (
            <View style={styles.modalBody}>
              <TextInput
                label="Social Media Post"
                value={socialPostText}
                onChangeText={setSocialPostText}
                mode="outlined"
                multiline
                numberOfLines={6}
                placeholder="Write your engaging post..."
                style={styles.textArea}
              />
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setSocialPostText('')}
                  style={styles.modalButtonSecondary}
                >
                  Clear
                </Button>
                <Button
                  mode="contained"
                  onPress={shareCustomPost}
                  style={styles.modalButton}
                  contentStyle={styles.buttonContent}
                >
                  Share Post
                </Button>
              </View>
            </View>
          )}
        </Surface>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={[COLORS.primary, '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Marketing Tools</Text>
        <Text style={styles.headerSubtitle}>Grow your fitness business 🚀</Text>
      </LinearGradient>

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
      >
        {renderStatsCard()}
        {renderQuickActions()}

        <View style={styles.toolsContainer}>
          <Text style={styles.sectionTitle}>Marketing Tools</Text>
          {marketingTools.map(renderMarketingTool)}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => handleQuickAction({ id: 'create_promo' })}
      />

      {renderModal()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    margin: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsContent: {
    alignItems: 'center',
  },
  statsTitle: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  quickActionsContainer: {
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  quickActionCard: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  quickActionGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionTitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  toolsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  toolCard: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  toolDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  toolStats: {
    marginTop: SPACING.sm,
  },
  chip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
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
  },
  modalContent: {
    width: width - 40,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  input: {
    marginBottom: SPACING.sm,
  },
  textArea: {
    marginBottom: SPACING.md,
  },
  inputHelp: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
  },
  modalButtonSecondary: {
    borderColor: COLORS.primary,
    marginRight: SPACING.md,
  },
  buttonContent: {
    paddingVertical: SPACING.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
};

export default MarketingTools;