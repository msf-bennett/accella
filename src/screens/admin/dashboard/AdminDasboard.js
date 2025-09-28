import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/colors';

const AdminDashboard = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    userStats: {
      totalUsers: 15420,
      newUsersToday: 23,
      activeUsers: 8945,
      parentUsers: 6230,
      coachUsers: 1890,
      traineeUsers: 6890,
      academyUsers: 410,
    },
    systemHealth: {
      uptime: '99.8%',
      responseTime: '127ms',
      errorRate: '0.02%',
      activeAlerts: 2,
    },
    safetyMetrics: {
      pendingReports: 4,
      resolvedToday: 12,
      backgroundChecks: 8,
      criticalAlerts: 1,
    },
    financialMetrics: {
      todayRevenue: 12450,
      monthlyRevenue: 385920,
      pendingPayouts: 23400,
      disputesToResolve: 3,
    },
    contentModeration: {
      pendingReview: 15,
      flaggedContent: 7,
      bannedUsers: 2,
      autoModerated: 89,
    },
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: '1', type: 'safety', message: 'New safety report submitted', time: '2 min ago', priority: 'high' },
    { id: '2', type: 'user', message: 'Coach verification completed', time: '5 min ago', priority: 'medium' },
    { id: '3', type: 'system', message: 'System backup completed', time: '15 min ago', priority: 'low' },
    { id: '4', type: 'payment', message: 'Payment dispute raised', time: '23 min ago', priority: 'high' },
    { id: '5', type: 'content', message: 'Content flagged for review', time: '1 hour ago', priority: 'medium' },
  ]);

  const quickActions = [
    { id: '1', title: 'User Management', icon: 'people', route: 'UserManagement', color: COLORS.primary },
    { id: '2', title: 'Safety Reports', icon: 'shield-checkmark', route: 'SafetyDashboard', color: COLORS.error },
    { id: '3', title: 'Content Review', icon: 'flag', route: 'ContentModerationQueue', color: COLORS.warning },
    { id: '4', title: 'Analytics', icon: 'analytics', route: 'AnalyticsDashboard', color: COLORS.success },
    { id: '5', title: 'Financial', icon: 'card', route: 'PaymentOverview', color: COLORS.info },
    { id: '6', title: 'System Config', icon: 'settings', route: 'SystemSettings', color: COLORS.gray },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const StatCard = ({ title, value, subtitle, icon, color, onPress, alert = false }) => (
    <TouchableOpacity 
      style={[styles.statCard, alert && styles.alertCard]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        {alert && (
          <View style={styles.alertBadge}>
            <Ionicons name="warning" size={16} color={COLORS.white} />
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );

  const QuickActionButton = ({ item }) => (
    <TouchableOpacity 
      style={styles.quickActionButton}
      onPress={() => navigation.navigate(item.route)}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon} size={20} color={item.color} />
      </View>
      <Text style={styles.quickActionText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const ActivityItem = ({ item }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'safety': return 'shield-checkmark';
        case 'user': return 'person';
        case 'system': return 'settings';
        case 'payment': return 'card';
        case 'content': return 'flag';
        default: return 'information-circle';
      }
    };

    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'high': return COLORS.error;
        case 'medium': return COLORS.warning;
        case 'low': return COLORS.success;
        default: return COLORS.gray;
      }
    };

    return (
      <View style={styles.activityItem}>
        <View style={[styles.activityIcon, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
          <Ionicons name={getActivityIcon(item.type)} size={16} color={getPriorityColor(item.priority)} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityMessage}>{item.message}</Text>
          <Text style={styles.activityTime}>{item.time}</Text>
        </View>
        <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Sports Training Platform</Text>
        </View>
        <TouchableOpacity style={styles.alertButton}>
          <Ionicons name="notifications" size={24} color={COLORS.text} />
          <View style={styles.alertBadgeSmall}>
            <Text style={styles.alertBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* System Health Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="System Uptime"
              value={dashboardData.systemHealth.uptime}
              subtitle="Last 30 days"
              icon="pulse"
              color={COLORS.success}
            />
            <StatCard
              title="Active Alerts"
              value={dashboardData.systemHealth.activeAlerts}
              subtitle="Requires attention"
              icon="warning"
              color={COLORS.error}
              alert={dashboardData.systemHealth.activeAlerts > 0}
            />
          </View>
        </View>

        {/* User Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Users"
              value={dashboardData.userStats.totalUsers.toLocaleString()}
              subtitle={`+${dashboardData.userStats.newUsersToday} today`}
              icon="people"
              color={COLORS.primary}
              onPress={() => navigation.navigate('UserManagement')}
            />
            <StatCard
              title="Active Users"
              value={dashboardData.userStats.activeUsers.toLocaleString()}
              subtitle="Last 24 hours"
              icon="pulse"
              color={COLORS.success}
            />
            <StatCard
              title="Parents"
              value={dashboardData.userStats.parentUsers.toLocaleString()}
              icon="home"
              color={COLORS.info}
            />
            <StatCard
              title="Coaches"
              value={dashboardData.userStats.coachUsers.toLocaleString()}
              icon="fitness"
              color={COLORS.warning}
            />
          </View>
        </View>

        {/* Safety & Compliance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety & Compliance</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Pending Reports"
              value={dashboardData.safetyMetrics.pendingReports}
              subtitle="Requires review"
              icon="shield-checkmark"
              color={COLORS.error}
              alert={dashboardData.safetyMetrics.criticalAlerts > 0}
              onPress={() => navigation.navigate('SafetyDashboard')}
            />
            <StatCard
              title="Background Checks"
              value={dashboardData.safetyMetrics.backgroundChecks}
              subtitle="In progress"
              icon="checkmark-circle"
              color={COLORS.warning}
            />
          </View>
        </View>

        {/* Financial Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Today's Revenue"
              value={`$${dashboardData.financialMetrics.todayRevenue.toLocaleString()}`}
              icon="trending-up"
              color={COLORS.success}
            />
            <StatCard
              title="Payment Disputes"
              value={dashboardData.financialMetrics.disputesToResolve}
              subtitle="Awaiting resolution"
              icon="card"
              color={COLORS.error}
              alert={dashboardData.financialMetrics.disputesToResolve > 0}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <FlatList
            data={quickActions}
            renderItem={({ item }) => <QuickActionButton item={item} />}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.quickActionsRow}
          />
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            {recentActivity.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.appInfoCard}>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Version:</Text>
              <Text style={styles.appInfoValue}>1.2.3 (1001)</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Environment:</Text>
              <Text style={styles.appInfoValue}>Production</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Last Update:</Text>
              <Text style={styles.appInfoValue}>Jan 15, 2024</Text>
            </View>
            <TouchableOpacity style={styles.manageVersionButton}>
              <Text style={styles.manageVersionText}>Manage Versions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  alertButton: {
    position: 'relative',
    padding: 8,
  },
  alertBadgeSmall: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  statSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  quickActionsRow: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  quickActionButton: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    textAlign: 'center',
    color: COLORS.text,
    fontWeight: '500',
  },
  activityList: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.gray,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  appInfoCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  appInfoLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  appInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  manageVersionButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  manageVersionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default AdminDashboard;