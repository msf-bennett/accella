import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Animated,
  Alert,
  Dimensions,
  TouchableOpacity,
  Modal,
  Vibration
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Searchbar
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

const CoachProfile = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, players, analytics } = useSelector(state => state.coach);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

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
    // Simulate API call
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const handleFeatureTap = (feature) => {
    Vibration.vibrate(30);
    Alert.alert(
      '🚧 Feature in Development',
      `${feature} is coming soon! We're working hard to bring you the best coaching experience.`,
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const StatsCard = ({ title, value, subtitle, icon, color = COLORS.primary, trend }) => (
    <Surface style={styles.statsCard} elevation={2}>
      <View style={styles.statsHeader}>
        <Icon name={icon} size={24} color={color} />
        <View style={[styles.trendIndicator, { backgroundColor: trend > 0 ? COLORS.success : COLORS.error }]}>
          <Icon name={trend > 0 ? 'trending-up' : 'trending-down'} size={12} color="white" />
        </View>
      </View>
      <Text style={[TEXT_STYLES.h2, { color, marginVertical: SPACING.xs }]}>{value}</Text>
      <Text style={TEXT_STYLES.caption}>{title}</Text>
      {subtitle && <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>{subtitle}</Text>}
    </Surface>
  );

  const QuickActionCard = ({ title, subtitle, icon, onPress, color = COLORS.primary }) => (
    <TouchableOpacity onPress={onPress} style={styles.quickActionCard}>
      <LinearGradient
        colors={[color, `${color}CC`]}
        style={styles.quickActionGradient}
      >
        <Icon name={icon} size={32} color="white" />
        <Text style={[TEXT_STYLES.body, { color: 'white', fontWeight: 'bold', marginTop: SPACING.xs }]}>
          {title}
        </Text>
        <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
          {subtitle}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const PlayerCard = ({ player, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.playerCard}>
      <Card elevation={1}>
        <Card.Content style={styles.playerCardContent}>
          <Avatar.Text size={50} label={player.initials} style={{ backgroundColor: COLORS.primary }} />
          <View style={styles.playerInfo}>
            <Text style={TEXT_STYLES.body}>{player.name}</Text>
            <Text style={TEXT_STYLES.caption}>{player.position} • {player.age}yrs</Text>
            <View style={styles.playerStats}>
              <Chip size="small" textStyle={{ fontSize: 10 }}>
                🔥 {player.streak} days
              </Chip>
              <Chip size="small" textStyle={{ fontSize: 10 }}>
                ⭐ Level {player.level}
              </Chip>
            </View>
          </View>
          <View style={styles.playerActions}>
            <IconButton icon="message" size={20} onPress={() => handleFeatureTap('Player Chat')} />
            <Text style={[TEXT_STYLES.caption, { color: player.status === 'active' ? COLORS.success : COLORS.secondary }]}>
              {player.status}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            {/* Key Metrics */}
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>📊 Key Metrics</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
              <StatsCard
                title="Active Players"
                value="24"
                subtitle="+3 this week"
                icon="group"
                color={COLORS.primary}
                trend={1}
              />
              <StatsCard
                title="Sessions This Week"
                value="18"
                subtitle="75% completion"
                icon="fitness-center"
                color={COLORS.success}
                trend={1}
              />
              <StatsCard
                title="Revenue (MTD)"
                value="$2,840"
                subtitle="+12% vs last month"
                icon="attach-money"
                color="#FF6B6B"
                trend={1}
              />
              <StatsCard
                title="Avg Rating"
                value="4.8"
                subtitle="Based on 47 reviews"
                icon="star"
                color="#FFD93D"
                trend={0}
              />
            </ScrollView>

            {/* Quick Actions */}
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>⚡ Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <QuickActionCard
                title="Create Session"
                subtitle="Plan new training"
                icon="add-circle-outline"
                onPress={() => handleFeatureTap('Session Creation')}
                color={COLORS.primary}
              />
              <QuickActionCard
                title="View Analytics"
                subtitle="Performance insights"
                icon="analytics"
                onPress={() => handleFeatureTap('Analytics Dashboard')}
                color="#FF6B6B"
              />
              <QuickActionCard
                title="Message Players"
                subtitle="Team communication"
                icon="message"
                onPress={() => handleFeatureTap('Team Chat')}
                color={COLORS.success}
              />
              <QuickActionCard
                title="Schedule"
                subtitle="Manage calendar"
                icon="schedule"
                onPress={() => handleFeatureTap('Schedule Management')}
                color="#9C27B0"
              />
            </View>
          </View>
        );
      
      case 'players':
        return (
          <View style={styles.tabContent}>
            <View style={styles.playersHeader}>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>👥 My Players (24)</Text>
              <Button
                mode="contained"
                icon="person-add"
                onPress={() => handleFeatureTap('Add Player')}
                style={styles.addButton}
              >
                Add Player
              </Button>
            </View>
            
            <Searchbar
              placeholder="Search players..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
            />

            <ScrollView style={styles.playersList}>
              {[
                { id: 1, name: 'Alex Johnson', position: 'Forward', age: 16, initials: 'AJ', streak: 12, level: 8, status: 'active' },
                { id: 2, name: 'Maria Santos', position: 'Midfielder', age: 15, initials: 'MS', streak: 8, level: 6, status: 'active' },
                { id: 3, name: 'David Kim', position: 'Defender', age: 17, initials: 'DK', streak: 5, level: 7, status: 'inactive' },
                { id: 4, name: 'Emma Wilson', position: 'Goalkeeper', age: 16, initials: 'EW', streak: 15, level: 9, status: 'active' }
              ].map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onPress={() => handleFeatureTap('Player Details')}
                />
              ))}
            </ScrollView>
          </View>
        );

      case 'business':
        return (
          <View style={styles.tabContent}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>💼 Business Overview</Text>
            
            {/* Revenue Chart Placeholder */}
            <Card style={styles.businessCard} elevation={2}>
              <Card.Content>
                <Text style={TEXT_STYLES.body}>📈 Monthly Revenue Trend</Text>
                <View style={styles.chartPlaceholder}>
                  <Icon name="trending-up" size={48} color={COLORS.primary} />
                  <Text style={TEXT_STYLES.caption}>Chart visualization coming soon</Text>
                </View>
              </Card.Content>
            </Card>

            {/* Payment Methods */}
            <Card style={styles.businessCard} elevation={2}>
              <Card.Content>
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>💳 Payment Methods</Text>
                <Button
                  mode="outlined"
                  icon="credit-card"
                  onPress={() => handleFeatureTap('Payment Setup')}
                >
                  Manage Payment Methods
                </Button>
              </Card.Content>
            </Card>

            {/* Subscription Management */}
            <Card style={styles.businessCard} elevation={2}>
              <Card.Content>
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>⭐ Subscription</Text>
                <Chip icon="star" style={{ alignSelf: 'flex-start' }}>Pro Coach Plan</Chip>
                <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
                  Next billing: March 15, 2025
                </Text>
                <Button
                  mode="text"
                  onPress={() => handleFeatureTap('Subscription Management')}
                  style={{ alignSelf: 'flex-start' }}
                >
                  Manage Subscription
                </Button>
              </Card.Content>
            </Card>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileSection}>
            <Avatar.Text
              size={80}
              label="JD"
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>John Doe</Text>
              <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
                ⚽ Football Coach
              </Text>
              <View style={styles.badges}>
                <Chip textStyle={{ color: 'white', fontSize: 12 }} style={styles.badge}>
                  🏆 5 years exp
                </Chip>
                <Chip textStyle={{ color: 'white', fontSize: 12 }} style={styles.badge}>
                  ⭐ 4.8 rating
                </Chip>
              </View>
            </View>
          </View>
          
          <IconButton
            icon="edit"
            iconColor="white"
            size={24}
            onPress={() => setShowEditModal(true)}
          />
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'overview', title: '📊 Overview', icon: 'dashboard' },
            { key: 'players', title: '👥 Players', icon: 'group' },
            { key: 'business', title: '💼 Business', icon: 'business-center' }
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setSelectedTab(tab.key)}
              style={[
                styles.tabButton,
                selectedTab === tab.key && styles.activeTabButton
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab.key && styles.activeTabText
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
          {renderTabContent()}
        </ScrollView>
      </Animated.View>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => handleFeatureTap('Quick Add')}
      />

      {/* Edit Profile Modal */}
      <Portal>
        <Modal
          visible={showEditModal}
          onDismiss={() => setShowEditModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.blurOverlay} blurType="light" blurAmount={10}>
            <Card style={styles.editCard}>
              <Card.Content>
                <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginBottom: SPACING.lg }]}>
                  ✏️ Edit Profile
                </Text>
                <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginBottom: SPACING.lg }]}>
                  Profile editing features are coming soon!
                </Text>
                <Button
                  mode="contained"
                  onPress={() => setShowEditModal(false)}
                  style={{ marginTop: SPACING.md }}
                >
                  Got it!
                </Button>
              </Card.Content>
            </Card>
          </BlurView>
        </Modal>
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  profileInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tabContainer: {
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minWidth: 120,
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  statsContainer: {
    marginBottom: SPACING.xl,
  },
  statsCard: {
    width: 140,
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderRadius: 12,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
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
    minHeight: 120,
  },
  playersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  searchbar: {
    marginBottom: SPACING.lg,
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  playersList: {
    flex: 1,
  },
  playerCard: {
    marginBottom: SPACING.md,
  },
  playerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  playerStats: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  playerActions: {
    alignItems: 'center',
  },
  businessCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
  },
  chartPlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    marginTop: SPACING.md,
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  editCard: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
  },
};

export default CoachProfile;
