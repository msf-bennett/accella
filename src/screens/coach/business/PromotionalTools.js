import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  Dimensions,
  StatusBar,
  Alert,
  TouchableOpacity,
  Animated,
  Share,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  Surface,
  IconButton,
  Searchbar,
  FAB,
  Portal,
  Modal,
  Divider,
  ProgressBar,
  Switch,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design System Imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 22, fontWeight: '600' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const PromotionalTools = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, promotions } = useSelector((state) => state.coach);
  
  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('campaigns');
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  // Promotional data state
  const [promotionalData, setPromotionalData] = useState({
    activeCampaigns: 3,
    totalReach: 12540,
    conversions: 87,
    roi: 340,
    campaigns: [
      {
        id: '1',
        name: '🏋️ New Year Fitness Challenge',
        type: 'discount',
        status: 'active',
        discount: 25,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        used: 23,
        limit: 50,
        revenue: 2300,
        description: 'Start your fitness journey with 25% off any training package'
      },
      {
        id: '2',
        name: '💪 Summer Body Prep',
        type: 'bundle',
        status: 'scheduled',
        discount: 30,
        startDate: '2025-03-01',
        endDate: '2025-05-31',
        used: 0,
        limit: 100,
        revenue: 0,
        description: 'Get beach ready with our comprehensive summer training bundle'
      },
      {
        id: '3',
        name: '🎯 Free Consultation Week',
        type: 'free_trial',
        status: 'active',
        discount: 100,
        startDate: '2025-08-10',
        endDate: '2025-08-17',
        used: 15,
        limit: 25,
        revenue: 0,
        description: 'Free initial consultation for new clients'
      },
    ],
    referralProgram: {
      enabled: true,
      referrerReward: 50,
      refereeDiscount: 20,
      totalReferrals: 34,
      pendingPayouts: 850,
      topReferrers: [
        { name: 'Sarah Johnson', referrals: 8, earnings: 400 },
        { name: 'Mike Chen', referrals: 6, earnings: 300 },
        { name: 'Emma Wilson', referrals: 5, earnings: 250 },
      ]
    },
    socialMedia: {
      platforms: [
        { name: 'Instagram', followers: 2340, engagement: 4.2, connected: true },
        { name: 'Facebook', followers: 1890, engagement: 3.8, connected: true },
        { name: 'TikTok', followers: 0, engagement: 0, connected: false },
        { name: 'YouTube', followers: 0, engagement: 0, connected: false },
      ],
      scheduledPosts: 12,
      lastPost: '2025-08-15'
    },
    emailMarketing: {
      subscribers: 456,
      openRate: 28.5,
      clickRate: 4.2,
      lastCampaign: '2025-08-10',
      templates: [
        'Welcome Series', 'Weekly Motivation', 'Special Offers', 'Success Stories'
      ]
    },
    loyaltyProgram: {
      enabled: false,
      members: 0,
      pointsIssued: 0,
      redemptions: 0
    }
  });

  // Animation setup
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Dispatch action to refresh promotional data
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh promotional data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleCreateCampaign = () => {
    Alert.alert(
      '🚀 Create Campaign',
      'Feature coming soon! Create custom promotional campaigns with discount codes, special offers, and targeted marketing.',
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const handleSharePromotion = async (campaign) => {
    try {
      await Share.share({
        message: `🔥 Special Offer: ${campaign.name}\n\n${campaign.description}\n\nGet ${campaign.discount}% OFF - Limited time only!\n\nBook now: https://yourapp.com/promo/${campaign.id}`,
        title: campaign.name,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share promotion');
    }
  };

  const handleAnalytics = (campaignId) => {
    Alert.alert(
      '📊 Campaign Analytics',
      'Feature coming soon! View detailed analytics including reach, conversions, ROI, and customer engagement metrics.',
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const handleSocialMediaConnect = (platform) => {
    Alert.alert(
      `📱 Connect ${platform}`,
      `Feature coming soon! Connect your ${platform} account to automatically share promotions and engage with your audience.`,
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const renderPromotionalOverview = () => (
    <Card style={styles.overviewCard}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.overviewGradient}
      >
        <View style={styles.overviewContent}>
          <Text style={[TEXT_STYLES.h3, { color: 'white', textAlign: 'center' }]}>
            📈 Marketing Performance
          </Text>
          
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>{promotionalData.activeCampaigns}</Text>
              <Text style={styles.overviewStatLabel}>Active Campaigns</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>
                {promotionalData.totalReach.toLocaleString()}
              </Text>
              <Text style={styles.overviewStatLabel}>Total Reach</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>{promotionalData.conversions}</Text>
              <Text style={styles.overviewStatLabel}>Conversions</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>{promotionalData.roi}%</Text>
              <Text style={styles.overviewStatLabel}>ROI</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const getCampaignStatusColor = (status) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'scheduled': return COLORS.warning;
      case 'expired': return COLORS.error;
      case 'paused': return COLORS.textSecondary;
      default: return COLORS.textSecondary;
    }
  };

  const getCampaignIcon = (type) => {
    switch (type) {
      case 'discount': return 'local-offer';
      case 'bundle': return 'card-giftcard';
      case 'free_trial': return 'star';
      case 'referral': return 'group-add';
      default: return 'campaign';
    }
  };

  const renderCampaignItem = (campaign) => (
    <TouchableOpacity
      key={campaign.id}
      onPress={() => handleAnalytics(campaign.id)}
      style={styles.campaignItem}
    >
      <View style={styles.campaignHeader}>
        <View style={styles.campaignLeft}>
          <Icon 
            name={getCampaignIcon(campaign.type)} 
            size={24} 
            color={getCampaignStatusColor(campaign.status)} 
          />
          <View style={styles.campaignInfo}>
            <Text style={TEXT_STYLES.body}>{campaign.name}</Text>
            <Text style={TEXT_STYLES.caption}>{campaign.description}</Text>
          </View>
        </View>
        
        <View style={styles.campaignRight}>
          <Chip 
            mode="outlined" 
            compact
            textStyle={{ fontSize: 10 }}
            style={{
              backgroundColor: getCampaignStatusColor(campaign.status) + '20'
            }}
          >
            {campaign.status}
          </Chip>
          <IconButton
            icon="share"
            size={20}
            onPress={() => handleSharePromotion(campaign)}
          />
        </View>
      </View>
      
      <View style={styles.campaignStats}>
        <View style={styles.campaignStat}>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
            {campaign.discount}%
          </Text>
          <Text style={TEXT_STYLES.caption}>Discount</Text>
        </View>
        <View style={styles.campaignStat}>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
            {campaign.used}/{campaign.limit}
          </Text>
          <Text style={TEXT_STYLES.caption}>Used</Text>
        </View>
        <View style={styles.campaignStat}>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.secondary }]}>
            ${campaign.revenue}
          </Text>
          <Text style={TEXT_STYLES.caption}>Revenue</Text>
        </View>
      </View>
      
      <ProgressBar 
        progress={campaign.used / campaign.limit} 
        color={getCampaignStatusColor(campaign.status)}
        style={styles.campaignProgress}
      />
    </TouchableOpacity>
  );

  const renderActiveCampaigns = () => (
    <Card style={styles.campaignsCard}>
      <Card.Title 
        title="🎯 Active Campaigns" 
        subtitle="Your promotional campaigns"
        titleStyle={TEXT_STYLES.h3}
        right={(props) => (
          <Button 
            mode="outlined" 
            compact 
            onPress={handleCreateCampaign}
          >
            Create
          </Button>
        )}
      />
      <Card.Content>
        {promotionalData.campaigns.map((campaign) => (
          <View key={campaign.id}>
            {renderCampaignItem(campaign)}
            <Divider style={styles.campaignDivider} />
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderReferralProgram = () => (
    <Card style={styles.referralCard}>
      <Card.Title 
        title="👥 Referral Program" 
        subtitle="Reward client referrals"
        titleStyle={TEXT_STYLES.h3}
        right={(props) => (
          <Switch
            value={promotionalData.referralProgram.enabled}
            onValueChange={(value) => {
              setPromotionalData(prev => ({
                ...prev,
                referralProgram: { ...prev.referralProgram, enabled: value }
              }));
            }}
            color={COLORS.success}
          />
        )}
      />
      <Card.Content>
        <View style={styles.referralStats}>
          <View style={styles.referralStat}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
              ${promotionalData.referralProgram.referrerReward}
            </Text>
            <Text style={TEXT_STYLES.caption}>Referrer Reward</Text>
          </View>
          <View style={styles.referralStat}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
              {promotionalData.referralProgram.refereeDiscount}%
            </Text>
            <Text style={TEXT_STYLES.caption}>Referee Discount</Text>
          </View>
          <View style={styles.referralStat}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.secondary }]}>
              {promotionalData.referralProgram.totalReferrals}
            </Text>
            <Text style={TEXT_STYLES.caption}>Total Referrals</Text>
          </View>
        </View>
        
        <Divider style={styles.sectionDivider} />
        
        <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>🏆 Top Referrers</Text>
        {promotionalData.referralProgram.topReferrers.map((referrer, index) => (
          <View key={index} style={styles.referrerItem}>
            <Avatar.Text
              size={32}
              label={referrer.name.split(' ').map(n => n[0]).join('')}
              backgroundColor={COLORS.primary + '20'}
              color={COLORS.primary}
            />
            <View style={styles.referrerInfo}>
              <Text style={TEXT_STYLES.body}>{referrer.name}</Text>
              <Text style={TEXT_STYLES.caption}>{referrer.referrals} referrals</Text>
            </View>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
              ${referrer.earnings}
            </Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderSocialMediaTools = () => (
    <Card style={styles.socialCard}>
      <Card.Title 
        title="📱 Social Media" 
        subtitle="Connect and engage"
        titleStyle={TEXT_STYLES.h3}
        right={(props) => (
          <Button 
            mode="outlined" 
            compact 
            onPress={() => navigation.navigate('SocialMediaManager')}
          >
            Manage
          </Button>
        )}
      />
      <Card.Content>
        {promotionalData.socialMedia.platforms.map((platform, index) => (
          <View key={index} style={styles.platformItem}>
            <View style={styles.platformLeft}>
              <Icon 
                name={platform.connected ? 'check-circle' : 'radio-button-unchecked'} 
                size={20} 
                color={platform.connected ? COLORS.success : COLORS.textSecondary} 
              />
              <View style={styles.platformInfo}>
                <Text style={TEXT_STYLES.body}>{platform.name}</Text>
                <Text style={TEXT_STYLES.caption}>
                  {platform.connected 
                    ? `${platform.followers.toLocaleString()} followers • ${platform.engagement}% engagement`
                    : 'Not connected'
                  }
                </Text>
              </View>
            </View>
            
            <Button
              mode={platform.connected ? "outlined" : "contained"}
              compact
              onPress={() => handleSocialMediaConnect(platform.name)}
            >
              {platform.connected ? 'Manage' : 'Connect'}
            </Button>
          </View>
        ))}
        
        <Divider style={styles.sectionDivider} />
        
        <View style={styles.socialStats}>
          <View style={styles.socialStat}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
              {promotionalData.socialMedia.scheduledPosts}
            </Text>
            <Text style={TEXT_STYLES.caption}>Scheduled Posts</Text>
          </View>
          <View style={styles.socialStat}>
            <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
              Last Post: {promotionalData.socialMedia.lastPost}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmailMarketing = () => (
    <Card style={styles.emailCard}>
      <Card.Title 
        title="📧 Email Marketing" 
        subtitle="Reach your audience"
        titleStyle={TEXT_STYLES.h3}
        right={(props) => (
          <Button 
            mode="outlined" 
            compact 
            onPress={() => navigation.navigate('EmailCampaigns')}
          >
            Create
          </Button>
        )}
      />
      <Card.Content>
        <View style={styles.emailStats}>
          <View style={styles.emailStat}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
              {promotionalData.emailMarketing.subscribers}
            </Text>
            <Text style={TEXT_STYLES.caption}>Subscribers</Text>
          </View>
          <View style={styles.emailStat}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
              {promotionalData.emailMarketing.openRate}%
            </Text>
            <Text style={TEXT_STYLES.caption}>Open Rate</Text>
          </View>
          <View style={styles.emailStat}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.warning }]}>
              {promotionalData.emailMarketing.clickRate}%
            </Text>
            <Text style={TEXT_STYLES.caption}>Click Rate</Text>
          </View>
        </View>
        
        <Divider style={styles.sectionDivider} />
        
        <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>📄 Email Templates</Text>
        <View style={styles.templateContainer}>
          {promotionalData.emailMarketing.templates.map((template, index) => (
            <Chip
              key={index}
              mode="outlined"
              style={styles.templateChip}
              onPress={() => navigation.navigate('EmailEditor', { template })}
            >
              {template}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={styles.actionsCard}>
      <Card.Title 
        title="⚡ Marketing Actions" 
        titleStyle={TEXT_STYLES.h3}
      />
      <Card.Content>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleCreateCampaign}
          >
            <Icon name="campaign" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>Create Campaign</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ContentCreator')}
          >
            <Icon name="create" size={24} color={COLORS.success} />
            <Text style={styles.actionText}>Content Creator</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('InfluencerNetwork')}
          >
            <Icon name="people" size={24} color={COLORS.secondary} />
            <Text style={styles.actionText}>Influencer Network</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('MarketingAnalytics')}
          >
            <Icon name="trending-up" size={24} color={COLORS.warning} />
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>🚀 Promotional Tools</Text>
          <Text style={styles.headerSubtitle}>Grow your coaching business</Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            icon="analytics"
            iconColor="white"
            size={24}
            onPress={() => navigation.navigate('MarketingAnalytics')}
          />
          <IconButton
            icon="dots-vertical"
            iconColor="white"
            size={24}
            onPress={() => navigation.navigate('MarketingSettings')}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
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
        {renderPromotionalOverview()}
        {renderActiveCampaigns()}
        {renderReferralProgram()}
        {renderSocialMediaTools()}
        {renderEmailMarketing()}
        {renderQuickActions()}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={handleCreateCampaign}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'white',
    opacity: 0.9,
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  overviewCard: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  overviewGradient: {
    padding: SPACING.lg,
  },
  overviewContent: {
    alignItems: 'center',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.lg,
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewStatValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  overviewStatLabel: {
    color: 'white',
    opacity: 0.8,
    fontSize: 12,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  campaignsCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  campaignItem: {
    paddingVertical: SPACING.md,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  campaignLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  campaignInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  campaignRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  campaignStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  campaignStat: {
    alignItems: 'center',
  },
  campaignProgress: {
    height: 4,
    borderRadius: 2,
  },
  campaignDivider: {
    marginTop: SPACING.md,
  },
  referralCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  referralStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  referralStat: {
    alignItems: 'center',
  },
  referrerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  referrerInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  socialCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  platformItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  platformLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  socialStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  socialStat: {
    alignItems: 'center',
  },
  emailCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  emailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  emailStat: {
    alignItems: 'center',
  },
  templateContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  templateChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  actionsCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - SPACING.md * 5) / 2,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  sectionDivider: {
    marginVertical: SPACING.md,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default PromotionalTools;