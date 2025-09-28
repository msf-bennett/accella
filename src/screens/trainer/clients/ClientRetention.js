import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Dimensions,
  Animated,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
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
  Searchbar,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  card: '#ffffff',
  border: '#e0e0e0',
  danger: '#FF5722',
  info: '#2196F3',
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

const { width: screenWidth } = Dimensions.get('window');

const ClientRetention = ({ navigation }) => {
  const dispatch = useDispatch();
  
  // Redux state
  const { user, isLoading } = useSelector(state => state.auth);
  const { clients, retentionData } = useSelector(state => state.trainer);

  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [riskFilter, setRiskFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('30days');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for demonstration
  const retentionMetrics = {
    overallRate: 85,
    monthlyRate: 92,
    quarterlyRate: 78,
    yearlyRate: 65,
    totalClients: 48,
    activeClients: 41,
    atRiskClients: 7,
    churnedClients: 5,
    newClients: 12,
    avgSessionsPerMonth: 8.5,
    avgRetentionDuration: 14.2, // months
  };

  const atRiskClients = [
    {
      id: '1',
      name: 'Michael Chen',
      avatar: null,
      riskLevel: 'high',
      riskScore: 85,
      lastSession: '2024-08-10',
      daysInactive: 9,
      totalSessions: 15,
      averageAttendance: 65,
      program: 'Weight Loss',
      joinDate: '2024-04-15',
      reasons: ['low_attendance', 'missed_payments', 'no_progress'],
      suggestedActions: ['schedule_check_in', 'adjust_program', 'offer_discount'],
    },
    {
      id: '2',
      name: 'Lisa Rodriguez',
      avatar: null,
      riskLevel: 'medium',
      riskScore: 65,
      lastSession: '2024-08-15',
      daysInactive: 4,
      totalSessions: 28,
      averageAttendance: 75,
      program: 'Strength Training',
      joinDate: '2024-02-20',
      reasons: ['declining_engagement', 'schedule_conflicts'],
      suggestedActions: ['flexible_scheduling', 'motivation_call'],
    },
    {
      id: '3',
      name: 'David Kim',
      avatar: null,
      riskLevel: 'low',
      riskScore: 35,
      lastSession: '2024-08-17',
      daysInactive: 2,
      totalSessions: 42,
      averageAttendance: 88,
      program: 'Athletic Performance',
      joinDate: '2024-01-10',
      reasons: ['plateau_concerns'],
      suggestedActions: ['program_review', 'goal_reassessment'],
    },
  ];

  const retentionTrends = {
    monthly: [88, 85, 92, 87, 90, 85],
    labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
  };

  const churnReasons = [
    { reason: 'Lack of Results', percentage: 35, count: 17 },
    { reason: 'Time Constraints', percentage: 28, count: 14 },
    { reason: 'Financial Issues', percentage: 20, count: 10 },
    { reason: 'Injury/Health', percentage: 10, count: 5 },
    { reason: 'Other', percentage: 7, count: 3 },
  ];

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleClientAction = (action) => {
    Alert.alert(
      '✅ Action Scheduled',
      `${action} has been scheduled for ${selectedClient?.name}`,
      [{ text: 'OK' }]
    );
    setShowActionModal(false);
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.info;
      default: return COLORS.textSecondary;
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'check-circle';
      default: return 'help';
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <View style={styles.headerTitle}>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
            Client Retention
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.9 }]}>
            Track & improve client loyalty 📈
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Icon name="filter-list" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderMetricsOverview = () => (
    <View style={styles.metricsContainer}>
      {/* Main Retention Rate */}
      <Card style={styles.mainMetricCard}>
        <LinearGradient
          colors={[COLORS.success, '#45a049']}
          style={styles.mainMetricGradient}
        >
          <View style={styles.mainMetricContent}>
            <Text style={[TEXT_STYLES.h1, { color: COLORS.white, fontSize: 36 }]}>
              {retentionMetrics.overallRate}%
            </Text>
            <Text style={[TEXT_STYLES.body, { color: COLORS.white, opacity: 0.9 }]}>
              Overall Retention Rate
            </Text>
            <View style={styles.trendIndicator}>
              <Icon name="trending-up" size={16} color={COLORS.white} />
              <Text style={[TEXT_STYLES.caption, { color: COLORS.white, marginLeft: 4 }]}>
                +3% from last month
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Card>

      {/* Key Metrics Grid */}
      <View style={styles.metricsGrid}>
        <Surface style={styles.metricCard}>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>41</Text>
          <Text style={TEXT_STYLES.caption}>Active Clients 👥</Text>
          <Text style={[TEXT_STYLES.small, { color: COLORS.success }]}>+2 this month</Text>
        </Surface>
        
        <Surface style={styles.metricCard}>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.warning }]}>7</Text>
          <Text style={TEXT_STYLES.caption}>At Risk ⚠️</Text>
          <Text style={[TEXT_STYLES.small, { color: COLORS.error }]}>Needs attention</Text>
        </Surface>
        
        <Surface style={styles.metricCard}>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.info }]}>8.5</Text>
          <Text style={TEXT_STYLES.caption}>Avg Sessions/Month 💪</Text>
          <Text style={[TEXT_STYLES.small, { color: COLORS.success }]}>Above target</Text>
        </Surface>
        
        <Surface style={styles.metricCard}>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.secondary }]}>14.2</Text>
          <Text style={TEXT_STYLES.caption}>Avg Duration (months) ⏱️</Text>
          <Text style={[TEXT_STYLES.small, { color: COLORS.success }]}>Industry leading</Text>
        </Surface>
      </View>
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['overview', 'at-risk', 'trends', 'insights'].map((tab) => (
          <Chip
            key={tab}
            selected={activeTab === tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabChip,
              activeTab === tab && { backgroundColor: COLORS.primary }
            ]}
            textStyle={activeTab === tab ? { color: COLORS.white } : {}}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Retention by Period */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
            📊 Retention by Period
          </Text>
          <View style={styles.periodMetrics}>
            <View style={styles.periodItem}>
              <Text style={TEXT_STYLES.body}>Monthly</Text>
              <View style={styles.periodValue}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>92%</Text>
                <ProgressBar progress={0.92} color={COLORS.success} style={styles.periodBar} />
              </View>
            </View>
            
            <View style={styles.periodItem}>
              <Text style={TEXT_STYLES.body}>Quarterly</Text>
              <View style={styles.periodValue}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.warning }]}>78%</Text>
                <ProgressBar progress={0.78} color={COLORS.warning} style={styles.periodBar} />
              </View>
            </View>
            
            <View style={styles.periodItem}>
              <Text style={TEXT_STYLES.body}>Yearly</Text>
              <View style={styles.periodValue}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.info }]}>65%</Text>
                <ProgressBar progress={0.65} color={COLORS.info} style={styles.periodBar} />
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
            🚀 Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Icon name="phone" size={24} color={COLORS.primary} />
              <Text style={TEXT_STYLES.caption}>Check-in Calls</Text>
              <Badge style={styles.actionBadge}>3</Badge>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <Icon name="email" size={24} color={COLORS.success} />
              <Text style={TEXT_STYLES.caption}>Follow-up Emails</Text>
              <Badge style={styles.actionBadge}>5</Badge>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <Icon name="assessment" size={24} color={COLORS.warning} />
              <Text style={TEXT_STYLES.caption}>Progress Reviews</Text>
              <Badge style={styles.actionBadge}>7</Badge>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <Icon name="local-offer" size={24} color={COLORS.info} />
              <Text style={TEXT_STYLES.caption}>Special Offers</Text>
              <Badge style={styles.actionBadge}>2</Badge>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderAtRiskTab = () => (
    <View style={styles.tabContent}>
      <Searchbar
        placeholder="Search at-risk clients..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      <FlatList
        data={atRiskClients.filter(client => 
          client.name.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={[styles.clientCard, { borderLeftColor: getRiskColor(item.riskLevel) }]}>
            <Card.Content>
              <View style={styles.clientHeader}>
                <View style={styles.clientInfo}>
                  <Avatar.Text
                    size={40}
                    label={item.name.split(' ').map(n => n[0]).join('')}
                    style={[styles.clientAvatar, { backgroundColor: getRiskColor(item.riskLevel) }]}
                  />
                  <View style={styles.clientDetails}>
                    <Text style={TEXT_STYLES.body}>{item.name}</Text>
                    <Text style={TEXT_STYLES.caption}>{item.program}</Text>
                  </View>
                </View>
                
                <View style={styles.riskIndicator}>
                  <Icon 
                    name={getRiskIcon(item.riskLevel)} 
                    size={20} 
                    color={getRiskColor(item.riskLevel)} 
                  />
                  <Text style={[TEXT_STYLES.caption, { color: getRiskColor(item.riskLevel) }]}>
                    {item.riskLevel.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.riskMetrics}>
                <View style={styles.riskMetric}>
                  <Text style={TEXT_STYLES.caption}>Risk Score</Text>
                  <Text style={[TEXT_STYLES.body, { color: getRiskColor(item.riskLevel) }]}>
                    {item.riskScore}%
                  </Text>
                </View>
                
                <View style={styles.riskMetric}>
                  <Text style={TEXT_STYLES.caption}>Days Inactive</Text>
                  <Text style={TEXT_STYLES.body}>{item.daysInactive}</Text>
                </View>
                
                <View style={styles.riskMetric}>
                  <Text style={TEXT_STYLES.caption}>Attendance</Text>
                  <Text style={TEXT_STYLES.body}>{item.averageAttendance}%</Text>
                </View>
              </View>
              
              <View style={styles.riskReasons}>
                <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>
                  Risk Factors:
                </Text>
                <View style={styles.reasonChips}>
                  {item.reasons.map((reason, index) => (
                    <Chip
                      key={index}
                      size="small"
                      style={styles.reasonChip}
                      textStyle={{ fontSize: 10 }}
                    >
                      {reason.replace('_', ' ')}
                    </Chip>
                  ))}
                </View>
              </View>
              
              <View style={styles.clientActions}>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => {
                    setSelectedClient(item);
                    setShowActionModal(true);
                  }}
                  style={styles.actionButton}
                >
                  Take Action
                </Button>
                
                <Button
                  mode="contained"
                  compact
                  onPress={() => navigation.navigate('ClientProgress', { clientId: item.id })}
                  style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                >
                  View Details
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderTrendsTab = () => (
    <View style={styles.tabContent}>
      {/* Retention Trend Chart */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
            📈 Retention Trends (6 Months)
          </Text>
          <LineChart
            data={{
              labels: retentionTrends.labels,
              datasets: [{
                data: retentionTrends.monthly,
                color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                strokeWidth: 3,
              }]
            }}
            width={screenWidth - 64}
            height={200}
            chartConfig={{
              backgroundColor: COLORS.white,
              backgroundGradientFrom: COLORS.white,
              backgroundGradientTo: COLORS.white,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
              style: { borderRadius: 16 }
            }}
            style={styles.chart}
            bezier
          />
        </Card.Content>
      </Card>

      {/* Churn Reasons */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
            📉 Main Churn Reasons
          </Text>
          {churnReasons.map((item, index) => (
            <View key={index} style={styles.churnItem}>
              <View style={styles.churnHeader}>
                <Text style={TEXT_STYLES.body}>{item.reason}</Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.error }]}>
                  {item.count} clients ({item.percentage}%)
                </Text>
              </View>
              <ProgressBar
                progress={item.percentage / 100}
                color={COLORS.error}
                style={styles.churnBar}
              />
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Cohort Analysis */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
            👥 Client Cohort Analysis
          </Text>
          <View style={styles.cohortGrid}>
            <Surface style={styles.cohortCard}>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>95%</Text>
              <Text style={TEXT_STYLES.caption}>Month 1 Retention</Text>
            </Surface>
            
            <Surface style={styles.cohortCard}>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>82%</Text>
              <Text style={TEXT_STYLES.caption}>Month 3 Retention</Text>
            </Surface>
            
            <Surface style={styles.cohortCard}>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.warning }]}>71%</Text>
              <Text style={TEXT_STYLES.caption}>Month 6 Retention</Text>
            </Surface>
            
            <Surface style={styles.cohortCard}>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.info }]}>65%</Text>
              <Text style={TEXT_STYLES.caption}>Month 12 Retention</Text>
            </Surface>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderInsightsTab = () => (
    <View style={styles.tabContent}>
      {/* AI Insights */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
            🤖 AI-Powered Insights
          </Text>
          
          <Surface style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Icon name="lightbulb" size={20} color={COLORS.warning} />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                Key Insight
              </Text>
            </View>
            <Text style={TEXT_STYLES.caption}>
              Clients who complete their first month have a 78% higher chance of staying for 6+ months. Focus on month 1 engagement!
            </Text>
          </Surface>
          
          <Surface style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Icon name="trending-down" size={20} color={COLORS.error} />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                Risk Alert
              </Text>
            </View>
            <Text style={TEXT_STYLES.caption}>
              7 clients haven't attended sessions in 5+ days. Consider reaching out with personalized check-ins.
            </Text>
          </Surface>
          
          <Surface style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Icon name="star" size={20} color={COLORS.success} />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                Success Pattern
              </Text>
            </View>
            <Text style={TEXT_STYLES.caption}>
              Clients with 8+ sessions per month have 92% retention rate. Current average is 8.5 sessions.
            </Text>
          </Surface>
        </Card.Content>
      </Card>

      {/* Recommendations */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
            💡 Recommended Actions
          </Text>
          
          <View style={styles.recommendationsList}>
            <TouchableOpacity style={styles.recommendationItem}>
              <View style={styles.recommendationIcon}>
                <Icon name="phone" size={16} color={COLORS.white} />
              </View>
              <View style={styles.recommendationContent}>
                <Text style={TEXT_STYLES.body}>Schedule Check-in Calls</Text>
                <Text style={TEXT_STYLES.caption}>3 high-risk clients need immediate attention</Text>
              </View>
              <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.recommendationItem}>
              <View style={[styles.recommendationIcon, { backgroundColor: COLORS.success }]}>
                <Icon name="assessment" size={16} color={COLORS.white} />
              </View>
              <View style={styles.recommendationContent}>
                <Text style={TEXT_STYLES.body}>Program Adjustments</Text>
                <Text style={TEXT_STYLES.caption}>5 clients showing plateau signs</Text>
              </View>
              <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.recommendationItem}>
              <View style={[styles.recommendationIcon, { backgroundColor: COLORS.warning }]}>
                <Icon name="local-offer" size={16} color={COLORS.white} />
              </View>
              <View style={styles.recommendationContent}>
                <Text style={TEXT_STYLES.body}>Loyalty Rewards</Text>
                <Text style={TEXT_STYLES.caption}>Implement rewards for 6+ month clients</Text>
              </View>
              <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* Retention Strategies */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
            🎯 Proven Retention Strategies
          </Text>
          
          <View style={styles.strategyList}>
            <View style={styles.strategyItem}>
              <Icon name="check-circle" size={20} color={COLORS.success} />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                Regular Progress Check-ins
              </Text>
            </View>
            
            <View style={styles.strategyItem}>
              <Icon name="check-circle" size={20} color={COLORS.success} />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                Flexible Scheduling Options
              </Text>
            </View>
            
            <View style={styles.strategyItem}>
              <Icon name="check-circle" size={20} color={COLORS.success} />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                Personalized Goal Setting
              </Text>
            </View>
            
            <View style={styles.strategyItem}>
              <Icon name="check-circle" size={20} color={COLORS.success} />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                Community Building Events
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderActionModal = () => (
    <Portal>
      <Modal
        visible={showActionModal}
        onDismiss={() => setShowActionModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10} />
        <Surface style={styles.modalContent}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            🎯 Take Action for {selectedClient?.name}
          </Text>
          
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.lg }]}>
            Suggested Actions:
          </Text>
          
          <ScrollView style={styles.actionsList}>
            {selectedClient?.suggestedActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionOption}
                onPress={() => handleClientAction(action)}
              >
                <Icon 
                  name={
                    action.includes('call') ? 'phone' :
                    action.includes('schedule') ? 'schedule' :
                    action.includes('program') ? 'fitness-center' :
                    action.includes('discount') ? 'local-offer' : 'star'
                  }
                  size={20} 
                  color={COLORS.primary} 
                />
                <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, flex: 1 }]}>
                  {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
                <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowActionModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
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
          style={styles.scrollView}
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
          {renderMetricsOverview()}
          {renderTabBar()}
          
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'at-risk' && renderAtRiskTab()}
          {activeTab === 'trends' && renderTrendsTab()}
          {activeTab === 'insights' && renderInsightsTab()}
          
          <View style={styles.bottomPadding} />
        </ScrollView>
      </Animated.View>

      <FAB
        style={styles.fab}
        icon="add"
        label="New Strategy"
        onPress={() => Alert.alert('🚀 Feature Coming Soon', 'Retention strategy builder is in development!')}
        color={COLORS.white}
      />

      {renderActionModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  filterButton: {
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  metricsContainer: {
    padding: SPACING.md,
  },
  mainMetricCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  mainMetricGradient: {
    padding: SPACING.lg,
  },
  mainMetricContent: {
    alignItems: 'center',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  tabBar: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  tabChip: {
    marginRight: SPACING.sm,
  },
  tabContent: {
    paddingHorizontal: SPACING.md,
  },
  card: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  periodMetrics: {
    gap: SPACING.md,
  },
  periodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodValue: {
    flex: 1,
    alignItems: 'flex-end',
  },
  periodBar: {
    width: 100,
    height: 6,
    borderRadius: 3,
    marginTop: SPACING.xs,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  actionBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: COLORS.error,
  },
  searchbar: {
    marginBottom: SPACING.md,
  },
  clientCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    borderLeftWidth: 4,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientAvatar: {
    marginRight: SPACING.sm,
  },
  clientDetails: {
    flex: 1,
  },
  riskIndicator: {
    alignItems: 'center',
  },
  riskMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  riskMetric: {
    alignItems: 'center',
  },
  riskReasons: {
    marginBottom: SPACING.md,
  },
  reasonChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  reasonChip: {
    backgroundColor: COLORS.background,
  },
  clientActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  chart: {
    borderRadius: 16,
    marginVertical: SPACING.sm,
  },
  churnItem: {
    marginBottom: SPACING.md,
  },
  churnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  churnBar: {
    height: 6,
    borderRadius: 3,
  },
  cohortGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cohortCard: {
    width: '48%',
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    marginBottom: SPACING.sm,
  },
  insightCard: {
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 1,
    marginBottom: SPACING.sm,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  recommendationsList: {
    gap: SPACING.sm,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
  },
  recommendationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  recommendationContent: {
    flex: 1,
  },
  strategyList: {
    gap: SPACING.sm,
  },
  strategyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
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
  },
  modalBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    margin: SPACING.lg,
    maxHeight: '70%',
    width: '90%',
    elevation: 8,
  },
  actionsList: {
    maxHeight: 300,
  },
  actionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalButtons: {
    marginTop: SPACING.lg,
  },
  modalButton: {
    marginHorizontal: SPACING.xs,
  },
  bottomPadding: {
    height: 100,
  },
});

export default ClientRetention;