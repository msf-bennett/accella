import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  FlatList,
} from 'react-native';
import { 
  Card,
  Button,
  FAB,
  Avatar,
  Chip,
  IconButton,
  Surface,
  ProgressBar,
  Searchbar,
  Menu,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  background: '#f5f5f5',
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
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const ProgressReports = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { clients } = useSelector((state) => state.clients);
  const { reports } = useSelector((state) => state.reports);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [filterVisible, setFilterVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Mock data for demonstration
  const [reportStats] = useState({
    totalReports: 89,
    thisMonth: 12,
    shared: 67,
    pending: 4,
    averageScore: 87.5,
  });

  const [recentReports] = useState([
    {
      id: '1',
      clientName: 'Sarah Johnson',
      clientAvatar: 'SJ',
      reportType: 'Monthly Progress',
      period: 'July 2024',
      overallScore: 92,
      improvements: ['Strength +15%', 'Cardio +12%', 'Flexibility +8%'],
      concerns: ['Recovery time'],
      status: 'completed',
      dateGenerated: '2024-08-01',
      lastViewed: '2024-08-15',
      shared: true,
    },
    {
      id: '2',
      clientName: 'Mike Chen',
      clientAvatar: 'MC',
      reportType: 'Quarterly Review',
      period: 'Q2 2024',
      overallScore: 88,
      improvements: ['Power +20%', 'Endurance +18%'],
      concerns: ['Form consistency', 'Attendance'],
      status: 'completed',
      dateGenerated: '2024-07-28',
      lastViewed: '2024-08-10',
      shared: false,
    },
    {
      id: '3',
      clientName: 'Emma Wilson',
      clientAvatar: 'EW',
      reportType: 'Weekly Summary',
      period: 'Week 33',
      overallScore: 85,
      improvements: ['Balance +10%', 'Core strength +12%'],
      concerns: ['Nutrition tracking'],
      status: 'draft',
      dateGenerated: '2024-08-18',
      lastViewed: null,
      shared: false,
    },
    {
      id: '4',
      clientName: 'David Brown',
      clientAvatar: 'DB',
      reportType: 'Monthly Progress',
      period: 'July 2024',
      overallScore: 90,
      improvements: ['Weight loss 8lbs', 'Stamina +25%', 'Sleep quality +15%'],
      concerns: [],
      status: 'completed',
      dateGenerated: '2024-08-02',
      lastViewed: '2024-08-20',
      shared: true,
    },
  ]);

  const [reportTemplates] = useState([
    { id: '1', name: 'Basic Progress', icon: 'description', color: COLORS.primary },
    { id: '2', name: 'Comprehensive', icon: 'analytics', color: COLORS.success },
    { id: '3', name: 'Performance Focus', icon: 'speed', color: COLORS.warning },
    { id: '4', name: 'Nutrition & Wellness', icon: 'restaurant', color: COLORS.info },
  ]);

  const [upcomingReports] = useState([
    {
      id: '1',
      clientName: 'Lisa Park',
      clientAvatar: 'LP',
      reportType: 'Monthly Progress',
      dueDate: '2024-08-25',
      priority: 'high',
    },
    {
      id: '2',
      clientName: 'Tom Harris',
      clientAvatar: 'TH',
      reportType: 'Weekly Summary',
      dueDate: '2024-08-23',
      priority: 'medium',
    },
    {
      id: '3',
      clientName: 'Alex Rivera',
      clientAvatar: 'AR',
      reportType: 'Quarterly Review',
      dueDate: '2024-08-30',
      priority: 'low',
    },
  ]);

  useEffect(() => {
    // Animation sequence
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
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleGenerateReport = () => {
    Alert.alert(
      'Generate Progress Report',
      'AI-powered report generation feature is under development. You will be able to create comprehensive progress reports automatically.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleReportDetails = (reportId) => {
    Alert.alert(
      'Report Details',
      'Detailed report view with charts, graphs, and export options will be available here.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleShareReport = (reportId) => {
    Alert.alert(
      'Share Report',
      'You will be able to share reports via email, SMS, or app notifications with customizable privacy settings.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleExportReport = (reportId) => {
    Alert.alert(
      'Export Report',
      'Export reports as PDF, Excel, or send directly to clients with professional formatting.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return COLORS.success;
      case 'draft':
        return COLORS.warning;
      case 'pending':
        return COLORS.info;
      default:
        return COLORS.textSecondary;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return COLORS.success;
    if (score >= 80) return COLORS.info;
    if (score >= 70) return COLORS.warning;
    return COLORS.error;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return COLORS.error;
      case 'medium':
        return COLORS.warning;
      case 'low':
        return COLORS.success;
      default:
        return COLORS.textSecondary;
    }
  };

  const renderStatsOverview = () => (
    <Card style={styles.statsCard}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.statsGradient}
      >
        <View style={styles.statsContent}>
          <Text style={[TEXT_STYLES.h3, { color: '#fff' }]}>
            Reports Overview 📊
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{reportStats.totalReports}</Text>
              <Text style={styles.statLabel}>Total Reports</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{reportStats.thisMonth}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{reportStats.shared}</Text>
              <Text style={styles.statLabel}>Shared</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{reportStats.averageScore}%</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderReportTemplates = () => (
    <View style={styles.section}>
      <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
        Report Templates 📋
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.templatesContainer}>
          {reportTemplates.map((template, index) => (
            <Animated.View
              key={template.id}
              style={[
                styles.templateCard,
                {
                  transform: [{
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: [0, index * 5 + 50],
                    })
                  }],
                  opacity: fadeAnim,
                }
              ]}
            >
              <TouchableOpacity
                onPress={handleGenerateReport}
                style={styles.templateTouchable}
              >
                <Surface style={[styles.templateSurface, { borderColor: template.color }]}>
                  <Icon name={template.icon} size={32} color={template.color} />
                  <Text style={[styles.templateText, { color: template.color }]}>
                    {template.name}
                  </Text>
                </Surface>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderRecentReports = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
          Recent Reports 📈
        </Text>
        <Menu
          visible={filterVisible}
          onDismiss={() => setFilterVisible(false)}
          anchor={
            <IconButton
              icon="filter-list"
              size={24}
              iconColor={COLORS.primary}
              onPress={() => setFilterVisible(true)}
            />
          }
        >
          <Menu.Item onPress={() => setSelectedPeriod('weekly')} title="Weekly" />
          <Menu.Item onPress={() => setSelectedPeriod('monthly')} title="Monthly" />
          <Menu.Item onPress={() => setSelectedPeriod('quarterly')} title="Quarterly" />
          <Divider />
          <Menu.Item onPress={() => setSelectedPeriod('all')} title="All Reports" />
        </Menu>
      </View>

      {recentReports.map((report, index) => (
        <Animated.View
          key={report.id}
          style={[
            {
              transform: [{
                translateX: slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, index % 2 === 0 ? -20 : 20],
                })
              }],
              opacity: fadeAnim,
            }
          ]}
        >
          <Card style={styles.reportCard}>
            <View style={styles.reportCardHeader}>
              <View style={styles.reportClientInfo}>
                <Avatar.Text
                  size={50}
                  label={report.clientAvatar}
                  style={{ backgroundColor: COLORS.primary }}
                />
                <View style={styles.reportInfo}>
                  <Text style={[TEXT_STYLES.body, styles.clientName]}>
                    {report.clientName}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, styles.reportType]}>
                    {report.reportType} • {report.period}
                  </Text>
                  <View style={styles.reportMeta}>
                    <Chip
                      mode="outlined"
                      compact
                      style={[styles.statusChip, { borderColor: getStatusColor(report.status) }]}
                      textStyle={[styles.statusChipText, { color: getStatusColor(report.status) }]}
                    >
                      {report.status}
                    </Chip>
                    {report.shared && (
                      <Icon name="share" size={16} color={COLORS.success} style={{ marginLeft: SPACING.sm }} />
                    )}
                  </View>
                </View>
              </View>
              
              <View style={styles.reportScore}>
                <Text style={[TEXT_STYLES.h2, { color: getScoreColor(report.overallScore) }]}>
                  {report.overallScore}
                </Text>
                <Text style={TEXT_STYLES.small}>Score</Text>
              </View>
            </View>

            <View style={styles.reportDetails}>
              <View style={styles.improvementsSection}>
                <Text style={[TEXT_STYLES.caption, styles.sectionLabel]}>
                  🎯 Key Improvements
                </Text>
                {report.improvements.slice(0, 2).map((improvement, idx) => (
                  <Text key={idx} style={[TEXT_STYLES.small, styles.improvementText]}>
                    • {improvement}
                  </Text>
                ))}
                {report.improvements.length > 2 && (
                  <Text style={[TEXT_STYLES.small, { color: COLORS.primary }]}>
                    +{report.improvements.length - 2} more
                  </Text>
                )}
              </View>

              {report.concerns.length > 0 && (
                <View style={styles.concernsSection}>
                  <Text style={[TEXT_STYLES.caption, styles.sectionLabel]}>
                    ⚠️ Areas of Focus
                  </Text>
                  {report.concerns.slice(0, 2).map((concern, idx) => (
                    <Text key={idx} style={[TEXT_STYLES.small, styles.concernText]}>
                      • {concern}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.reportActions}>
              <Button
                mode="outlined"
                compact
                onPress={() => handleReportDetails(report.id)}
                style={styles.actionButton}
              >
                View
              </Button>
              <Button
                mode="contained"
                compact
                onPress={() => handleShareReport(report.id)}
                style={styles.actionButton}
                buttonColor={COLORS.primary}
              >
                Share
              </Button>
              <IconButton
                icon="download"
                size={20}
                iconColor={COLORS.textSecondary}
                onPress={() => handleExportReport(report.id)}
              />
            </View>
          </Card>
        </Animated.View>
      ))}
    </View>
  );

  const renderUpcomingReports = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
          Upcoming Reports 📅
        </Text>
        <IconButton
          icon="add"
          size={24}
          iconColor={COLORS.primary}
          onPress={handleGenerateReport}
        />
      </View>

      {upcomingReports.map((report, index) => (
        <Animated.View
          key={report.id}
          style={[
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <Surface style={styles.upcomingCard}>
            <View style={styles.upcomingContent}>
              <Avatar.Text
                size={40}
                label={report.clientAvatar}
                style={{ backgroundColor: COLORS.secondary }}
              />
              <View style={styles.upcomingInfo}>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                  {report.clientName}
                </Text>
                <Text style={TEXT_STYLES.caption}>
                  {report.reportType}
                </Text>
                <Text style={[TEXT_STYLES.small, { color: COLORS.primary }]}>
                  Due: {report.dueDate}
                </Text>
              </View>
              <View style={styles.priorityContainer}>
                <View style={[
                  styles.priorityDot,
                  { backgroundColor: getPriorityColor(report.priority) }
                ]} />
                <Text style={[TEXT_STYLES.small, { color: getPriorityColor(report.priority) }]}>
                  {report.priority}
                </Text>
              </View>
            </View>
          </Surface>
        </Animated.View>
      ))}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
        Quick Actions ⚡
      </Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={handleGenerateReport}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.quickActionGradient}
          >
            <Icon name="auto-awesome" size={32} color="#fff" />
            <Text style={styles.quickActionText}>AI Report</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('Analytics')}
        >
          <LinearGradient
            colors={[COLORS.success, '#66bb6a']}
            style={styles.quickActionGradient}
          >
            <Icon name="trending-up" size={32} color="#fff" />
            <Text style={styles.quickActionText}>Analytics</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => handleExportReport('bulk')}
        >
          <LinearGradient
            colors={[COLORS.info, '#42a5f5']}
            style={styles.quickActionGradient}
          >
            <Icon name="file-download" size={32} color="#fff" />
            <Text style={styles.quickActionText}>Export All</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => handleReportDetails('templates')}
        >
          <LinearGradient
            colors={[COLORS.warning, '#ffb74d']}
            style={styles.quickActionGradient}
          >
            <Icon name="settings" size={32} color="#fff" />
            <Text style={styles.quickActionText}>Settings</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h2, { color: '#fff' }]}>
            Progress Reports
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: '#fff', opacity: 0.9 }]}>
            Generate and manage client reports
          </Text>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
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
          <Searchbar
            placeholder="Search reports, clients..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
          />

          {renderStatsOverview()}
          {renderReportTemplates()}
          {renderQuickActions()}
          {renderRecentReports()}
          {renderUpcomingReports()}

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      <FAB
        icon="auto-awesome"
        style={styles.fab}
        onPress={handleGenerateReport}
        color="#fff"
        customSize={56}
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.lg,
  },
  searchbar: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  statsGradient: {
    borderRadius: 12,
    padding: SPACING.lg,
  },
  statsContent: {
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  templatesContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
  },
  templateCard: {
    marginRight: SPACING.md,
  },
  templateTouchable: {
    borderRadius: 16,
  },
  templateSurface: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    elevation: 2,
  },
  templateText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  reportCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportCardHeader: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
  },
  reportClientInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  clientName: {
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  reportType: {
    marginBottom: SPACING.xs,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    height: 24,
    alignSelf: 'flex-start',
  },
  statusChipText: {
    fontSize: 10,
  },
  reportScore: {
    alignItems: 'center',
  },
  reportDetails: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  improvementsSection: {
    marginBottom: SPACING.sm,
  },
  concernsSection: {
    marginBottom: SPACING.sm,
  },
  sectionLabel: {
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  improvementText: {
    color: COLORS.success,
    marginBottom: SPACING.xs / 2,
  },
  concernText: {
    color: COLORS.warning,
    marginBottom: SPACING.xs / 2,
  },
  reportActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  actionButton: {
    marginRight: SPACING.sm,
  },
  upcomingCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 1,
  },
  upcomingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});

export default ProgressReports;