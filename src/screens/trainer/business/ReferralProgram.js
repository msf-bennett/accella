import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
  Vibration,
  Share,
  Clipboard,
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
  Searchbar,
  ProgressBar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Design System
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
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
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const ReferralProgramScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  // Referral Settings State
  const [referralSettings, setReferralSettings] = useState({
    referrerReward: 50,
    referredReward: 25,
    minimumPurchase: 100,
    rewardType: 'discount', // discount, cash, credit
    expiryDays: 30,
    maxRewards: 500,
    isActive: true,
  });

  // Mock data for demonstration
  const referralCode = 'FIT2024JOHN';
  const referralLink = `https://fitapp.com/ref/${referralCode}`;

  const mockReferrals = [
    {
      id: '1',
      referrerName: 'Sarah Johnson',
      referrerAvatar: null,
      referredName: 'Mike Chen',
      referredAvatar: null,
      status: 'completed',
      rewardAmount: 50,
      dateReferred: '2024-08-15',
      dateCompleted: '2024-08-17',
      packagePurchased: 'Premium Training Package',
      purchaseAmount: 199,
    },
    {
      id: '2',
      referrerName: 'David Wilson',
      referrerAvatar: null,
      referredName: 'Emma Davis',
      referredAvatar: null,
      status: 'pending',
      rewardAmount: 50,
      dateReferred: '2024-08-18',
      dateCompleted: null,
      packagePurchased: null,
      purchaseAmount: 0,
    },
    {
      id: '3',
      referrerName: 'Lisa Brown',
      referrerAvatar: null,
      referredName: 'James Wilson',
      referredAvatar: null,
      status: 'completed',
      rewardAmount: 50,
      dateReferred: '2024-08-10',
      dateCompleted: '2024-08-12',
      packagePurchased: 'Basic Fitness Plan',
      purchaseAmount: 99,
    },
    {
      id: '4',
      referrerName: 'Tom Anderson',
      referrerAvatar: null,
      referredName: 'Anna Martinez',
      referredAvatar: null,
      status: 'expired',
      rewardAmount: 0,
      dateReferred: '2024-07-10',
      dateCompleted: null,
      packagePurchased: null,
      purchaseAmount: 0,
    },
  ];

  const stats = {
    totalReferrals: mockReferrals.length,
    completedReferrals: mockReferrals.filter(r => r.status === 'completed').length,
    pendingReferrals: mockReferrals.filter(r => r.status === 'pending').length,
    totalRewards: mockReferrals.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.rewardAmount, 0),
    conversionRate: (mockReferrals.filter(r => r.status === 'completed').length / mockReferrals.length * 100).toFixed(1),
    avgPurchaseValue: mockReferrals.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.purchaseAmount, 0) / mockReferrals.filter(r => r.status === 'completed').length,
  };

  const filteredReferrals = mockReferrals.filter(referral => {
    const matchesSearch = referral.referrerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         referral.referredName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || referral.status === filterType;
    return matchesSearch && matchesFilter;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh referral data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleShareReferralCode = async () => {
    try {
      await Share.share({
        message: `Join my fitness training program and get ${referralSettings.referredReward}% off! Use my referral code: ${referralCode} or visit: ${referralLink}`,
        url: referralLink,
        title: 'Join My Fitness Program!',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share referral code');
    }
  };

  const handleCopyReferralCode = () => {
    Clipboard.setString(referralCode);
    Vibration.vibrate(50);
    Alert.alert('Copied!', 'Referral code copied to clipboard 📋');
  };

  const handleCopyReferralLink = () => {
    Clipboard.setString(referralLink);
    Vibration.vibrate(50);
    Alert.alert('Copied!', 'Referral link copied to clipboard 🔗');
  };

  const handleUpdateSettings = () => {
    Alert.alert('Success', 'Referral settings updated successfully! 🎉');
    setShowSettingsModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'expired': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'pending': return 'access-time';
      case 'expired': return 'cancel';
      default: return 'help';
    }
  };

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <Card style={[styles.statCard, { backgroundColor: COLORS.primary }]}>
        <Card.Content style={styles.statContent}>
          <Icon name="people" size={24} color={COLORS.white} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>{stats.totalReferrals}</Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>Total Referrals</Text>
        </Card.Content>
      </Card>

      <Card style={[styles.statCard, { backgroundColor: COLORS.success }]}>
        <Card.Content style={styles.statContent}>
          <Icon name="trending-up" size={24} color={COLORS.white} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>{stats.conversionRate}%</Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>Conversion Rate</Text>
        </Card.Content>
      </Card>

      <Card style={[styles.statCard, { backgroundColor: COLORS.warning }]}>
        <Card.Content style={styles.statContent}>
          <Icon name="attach-money" size={24} color={COLORS.white} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>${stats.totalRewards}</Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>Rewards Earned</Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderReferralCodeCard = () => (
    <Card style={styles.referralCodeCard}>
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.referralCodeGradient}>
        <View style={styles.referralCodeContent}>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>Your Referral Code</Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.9 }]}>
            Share this code to earn rewards! 🚀
          </Text>
          
          <View style={styles.codeContainer}>
            <Text style={styles.referralCodeText}>{referralCode}</Text>
            <TouchableOpacity onPress={handleCopyReferralCode} style={styles.copyButton}>
              <Icon name="content-copy" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.referralActions}>
            <Button
              mode="contained"
              onPress={handleShareReferralCode}
              icon="share"
              style={styles.shareButton}
              buttonColor="rgba(255,255,255,0.2)"
              textColor={COLORS.white}
            >
              Share Code
            </Button>
            <Button
              mode="outlined"
              onPress={handleCopyReferralLink}
              icon="link"
              style={styles.linkButton}
              textColor={COLORS.white}
              borderColor="rgba(255,255,255,0.5)"
            >
              Copy Link
            </Button>
          </View>

          <View style={styles.rewardInfo}>
            <View style={styles.rewardItem}>
              <Icon name="card-giftcard" size={20} color={COLORS.white} />
              <Text style={[TEXT_STYLES.caption, { color: COLORS.white, marginLeft: SPACING.xs }]}>
                You earn ${referralSettings.referrerReward} per referral
              </Text>
            </View>
            <View style={styles.rewardItem}>
              <Icon name="star" size={20} color={COLORS.white} />
              <Text style={[TEXT_STYLES.caption, { color: COLORS.white, marginLeft: SPACING.xs }]}>
                Friends get {referralSettings.referredReward}% off their first purchase
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderFilterChips = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
      {[
        { key: 'all', label: 'All Referrals', icon: 'view-list' },
        { key: 'completed', label: 'Completed', icon: 'check-circle' },
        { key: 'pending', label: 'Pending', icon: 'access-time' },
        { key: 'expired', label: 'Expired', icon: 'cancel' },
      ].map((filter) => (
        <Chip
          key={filter.key}
          mode={filterType === filter.key ? 'flat' : 'outlined'}
          selected={filterType === filter.key}
          onPress={() => setFilterType(filter.key)}
          icon={filter.icon}
          style={[
            styles.filterChip,
            filterType === filter.key && { backgroundColor: COLORS.primary }
          ]}
          textStyle={filterType === filter.key ? { color: COLORS.white } : {}}
        >
          {filter.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderReferralCard = (referral) => (
    <Card key={referral.id} style={styles.referralCard}>
      <Card.Content>
        <View style={styles.referralHeader}>
          <View style={styles.referralInfo}>
            <View style={styles.avatarContainer}>
              <Avatar.Text
                size={40}
                label={referral.referrerName.split(' ').map(n => n[0]).join('')}
                backgroundColor={COLORS.primary}
              />
              <Icon name="arrow-forward" size={20} color={COLORS.textSecondary} style={styles.arrowIcon} />
              <Avatar.Text
                size={40}
                label={referral.referredName.split(' ').map(n => n[0]).join('')}
                backgroundColor={COLORS.secondary}
              />
            </View>
            <View style={styles.namesContainer}>
              <Text style={TEXT_STYLES.body}>{referral.referrerName}</Text>
              <Icon name="arrow-forward" size={16} color={COLORS.textSecondary} />
              <Text style={TEXT_STYLES.body}>{referral.referredName}</Text>
            </View>
          </View>
          
          <Chip
            mode="outlined"
            icon={getStatusIcon(referral.status)}
            style={[styles.statusChip, { borderColor: getStatusColor(referral.status) }]}
            textStyle={{ color: getStatusColor(referral.status) }}
          >
            {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
          </Chip>
        </View>

        <View style={styles.referralDetails}>
          <View style={styles.detailRow}>
            <Icon name="calendar-today" size={16} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
              Referred: {new Date(referral.dateReferred).toLocaleDateString()}
            </Text>
          </View>
          
          {referral.status === 'completed' && (
            <>
              <View style={styles.detailRow}>
                <Icon name="shopping-bag" size={16} color={COLORS.success} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                  Purchased: {referral.packagePurchased}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="attach-money" size={16} color={COLORS.success} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                  Purchase Value: ${referral.purchaseAmount}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="card-giftcard" size={16} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, fontWeight: '600' }]}>
                  Your Reward: ${referral.rewardAmount}
                </Text>
              </View>
            </>
          )}
          
          {referral.status === 'pending' && (
            <View style={styles.pendingInfo}>
              <Icon name="hourglass-empty" size={16} color={COLORS.warning} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, color: COLORS.warning }]}>
                Waiting for first purchase
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={showSettingsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSettingsModal(false)}
    >
      <BlurView style={styles.modalContainer} blurType="dark">
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={TEXT_STYLES.h2}>Referral Settings ⚙️</Text>
            <IconButton icon="close" onPress={() => setShowSettingsModal(false)} />
          </View>

          <ScrollView style={styles.settingsForm}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Reward Structure</Text>
            
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={TEXT_STYLES.caption}>Referrer Reward ($)</Text>
                <TextInput
                  style={styles.input}
                  value={referralSettings.referrerReward.toString()}
                  onChangeText={(text) => setReferralSettings({
                    ...referralSettings,
                    referrerReward: parseInt(text) || 0
                  })}
                  keyboardType="numeric"
                  placeholder="50"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={TEXT_STYLES.caption}>Referred Discount (%)</Text>
                <TextInput
                  style={styles.input}
                  value={referralSettings.referredReward.toString()}
                  onChangeText={(text) => setReferralSettings({
                    ...referralSettings,
                    referredReward: parseInt(text) || 0
                  })}
                  keyboardType="numeric"
                  placeholder="25"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={TEXT_STYLES.caption}>Minimum Purchase Amount ($)</Text>
              <TextInput
                style={styles.input}
                value={referralSettings.minimumPurchase.toString()}
                onChangeText={(text) => setReferralSettings({
                  ...referralSettings,
                  minimumPurchase: parseInt(text) || 0
                })}
                keyboardType="numeric"
                placeholder="100"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={TEXT_STYLES.caption}>Referral Expiry (Days)</Text>
              <TextInput
                style={styles.input}
                value={referralSettings.expiryDays.toString()}
                onChangeText={(text) => setReferralSettings({
                  ...referralSettings,
                  expiryDays: parseInt(text) || 30
                })}
                keyboardType="numeric"
                placeholder="30"
              />
            </View>

            <View style={styles.toggleContainer}>
              <Text style={TEXT_STYLES.body}>Program Status</Text>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  referralSettings.isActive ? styles.toggleActive : styles.toggleInactive
                ]}
                onPress={() => setReferralSettings({
                  ...referralSettings,
                  isActive: !referralSettings.isActive
                })}
              >
                <Text style={[
                  TEXT_STYLES.caption,
                  { color: referralSettings.isActive ? COLORS.white : COLORS.textSecondary }
                ]}>
                  {referralSettings.isActive ? 'Active' : 'Inactive'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowSettingsModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdateSettings}
                style={styles.saveButton}
                buttonColor={COLORS.primary}
              >
                Save Settings
              </Button>
            </View>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[TEXT_STYLES.h1, { color: COLORS.white }]}>Referral Program 🎯</Text>
            <Text style={[TEXT_STYLES.body, { color: COLORS.white, opacity: 0.9 }]}>
              Grow your business through referrals
            </Text>
          </View>
          <IconButton
            icon="settings"
            iconColor={COLORS.white}
            onPress={() => setShowSettingsModal(true)}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
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
        {renderStatsCards()}
        {renderReferralCodeCard()}

        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search referrals..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
          />
        </View>

        {renderFilterChips()}

        <View style={styles.referralsSection}>
          <View style={styles.sectionHeader}>
            <Text style={TEXT_STYLES.h2}>Referral History ({filteredReferrals.length})</Text>
            <Chip
              mode="outlined"
              icon="trending-up"
              textStyle={{ color: COLORS.success }}
              style={{ borderColor: COLORS.success }}
            >
              {stats.conversionRate}% success
            </Chip>
          </View>

          {filteredReferrals.length > 0 ? (
            filteredReferrals.map(renderReferralCard)
          ) : (
            <Surface style={styles.emptyState}>
              <Icon name="people-outline" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md }]}>No referrals found</Text>
              <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.sm }]}>
                {searchQuery ? 'Try adjusting your search terms' : 'Start sharing your referral code to see results here'}
              </Text>
              {!searchQuery && (
                <Button
                  mode="contained"
                  onPress={handleShareReferralCode}
                  style={styles.shareCodeButton}
                  buttonColor={COLORS.primary}
                  icon="share"
                >
                  Share Referral Code
                </Button>
              )}
            </Surface>
          )}
        </View>
      </ScrollView>

      <FAB
        icon="share"
        style={styles.fab}
        color={COLORS.white}
        customSize={56}
        onPress={handleShareReferralCode}
      />

      {renderSettingsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    elevation: 4,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  referralCodeCard: {
    marginBottom: SPACING.lg,
    elevation: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  referralCodeGradient: {
    padding: SPACING.lg,
  },
  referralCodeContent: {
    alignItems: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  referralCodeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 2,
  },
  copyButton: {
    marginLeft: SPACING.md,
    padding: SPACING.xs,
  },
  referralActions: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  shareButton: {
    flex: 1,
  },
  linkButton: {
    flex: 1,
  },
  rewardInfo: {
    marginTop: SPACING.lg,
    width: '100%',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  searchSection: {
    marginBottom: SPACING.md,
  },
  searchbar: {
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  filtersContainer: {
    marginBottom: SPACING.lg,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  referralsSection: {
    marginBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  referralCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    backgroundColor: COLORS.white,
  },
  referralHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  referralInfo: {
    flex: 1,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  arrowIcon: {
    marginHorizontal: SPACING.sm,
  },
  namesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  referralDetails: {
    gap: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
  },
  shareCodeButton: {
    marginTop: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '100%',
    maxHeight: '90%',
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingsForm: {
    padding: SPACING.md,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
    fontSize: 16,
    backgroundColor: COLORS.white,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  toggle: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: COLORS.success,
  },
  toggleInactive: {
    backgroundColor: COLORS.border,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  saveButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
});

export default ReferralProgramScreen;