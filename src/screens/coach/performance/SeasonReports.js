import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  Share,
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
  Searchbar,
  Divider,
  Menu,
  Portal,
  Badge,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width, height } = Dimensions.get('window');

const SeasonReports = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { seasonData, reports, loading } = useSelector(state => state.reports);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState('2024');
  const [selectedReportType, setSelectedReportType] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'charts'
  const [expandedCard, setExpandedCard] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate screen entrance
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
      Animated.timing(chartAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    loadSeasonReports();
  }, []);

  const loadSeasonReports = useCallback(async () => {
    try {
      // Dispatch actions to load season reports
      // dispatch(fetchSeasonReports({ season: selectedSeason }));
      // dispatch(fetchSeasonData({ season: selectedSeason }));
    } catch (error) {
      console.error('Error loading season reports:', error);
    }
  }, [selectedSeason, dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSeasonReports();
    setRefreshing(false);
  }, [loadSeasonReports]);

  // Mock data for demonstration
  const mockSeasons = [
    { value: '2024', label: '2024 Season', status: 'active' },
    { value: '2023', label: '2023 Season', status: 'completed' },
    { value: '2022', label: '2022 Season', status: 'completed' },
  ];

  const mockReportTypes = [
    { value: 'overview', label: 'Season Overview', icon: 'dashboard', count: 1 },
    { value: 'performance', label: 'Performance Analysis', icon: 'analytics', count: 3 },
    { value: 'individual', label: 'Individual Reports', icon: 'person', count: 24 },
    { value: 'team', label: 'Team Reports', icon: 'group', count: 8 },
    { value: 'comparison', label: 'Comparisons', icon: 'compare', count: 5 },
  ];

  const mockSeasonOverview = {
    totalPlayers: 24,
    averageImprovement: 23.5,
    goalsAchieved: 189,
    totalGoals: 245,
    trainingHours: 1248,
    attendanceRate: 87.3,
    topPerformer: 'Alex Johnson',
    mostImproved: 'Maria Santos',
    teamRanking: 3,
    championshipsWon: 2,
  };

  const mockReports = [
    {
      id: 1,
      title: 'Q4 Performance Summary',
      type: 'performance',
      description: 'Comprehensive analysis of team performance in the final quarter',
      generatedDate: '2024-08-15',
      author: 'Coach Smith',
      status: 'completed',
      views: 23,
      downloads: 8,
      size: '2.3 MB',
      pages: 15,
      highlights: [
        '23% average improvement across all players',
        '15 new personal records achieved',
        '92% goal completion rate in Q4',
      ],
      metrics: {
        fitness: { improvement: 18, trend: 'up' },
        skills: { improvement: 28, trend: 'up' },
        tactical: { improvement: 15, trend: 'stable' },
        mental: { improvement: 31, trend: 'up' },
      },
    },
    {
      id: 2,
      title: 'Individual Player Progress Report',
      type: 'individual',
      description: 'Detailed progress analysis for all 24 players with recommendations',
      generatedDate: '2024-08-10',
      author: 'System Generated',
      status: 'completed',
      views: 45,
      downloads: 12,
      size: '4.7 MB',
      pages: 48,
      highlights: [
        '8 players exceeded all targets',
        '3 players need additional support',
        'Average skill improvement: 22%',
      ],
      metrics: {
        completed: 21,
        inProgress: 3,
        needsAttention: 2,
        excelling: 8,
      },
    },
    {
      id: 3,
      title: 'Team Tactical Analysis',
      type: 'team',
      description: 'Strategic analysis of team formations and tactical effectiveness',
      generatedDate: '2024-08-08',
      author: 'Coach Martinez',
      status: 'completed',
      views: 31,
      downloads: 15,
      size: '3.1 MB',
      pages: 22,
      highlights: [
        '4-3-3 formation most effective',
        '67% win rate with new strategy',
        'Defensive stability improved 40%',
      ],
      metrics: {
        formations: 5,
        strategies: 8,
        effectiveness: 74,
        implementation: 89,
      },
    },
    {
      id: 4,
      title: 'Season Comparison Report',
      type: 'comparison',
      description: 'Year-over-year performance comparison and trend analysis',
      generatedDate: '2024-08-05',
      author: 'Analytics Team',
      status: 'draft',
      views: 12,
      downloads: 3,
      size: '1.8 MB',
      pages: 12,
      highlights: [
        '15% improvement from last season',
        'Player retention rate: 96%',
        'New training methods showing results',
      ],
      metrics: {
        improvement: 15,
        retention: 96,
        satisfaction: 92,
        effectiveness: 88,
      },
    },
  ];

  const getReportIcon = (type) => {
    switch (type) {
      case 'performance': return 'analytics';
      case 'individual': return 'person';
      case 'team': return 'group';
      case 'comparison': return 'compare';
      default: return 'description';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'draft': return COLORS.warning;
      case 'processing': return COLORS.primary;
      default: return COLORS.textSecondary;
    }
  };

  const shareReport = async (report) => {
    try {
      await Share.share({
        message: `Check out this report: ${report.title} - Generated on ${report.generatedDate}`,
        title: report.title,
      });
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  const renderHeader = () => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          borderRadius: 12,
          margin: SPACING.medium,
          overflow: 'hidden',
        }}
      >
        <Card style={{ backgroundColor: 'transparent', elevation: 0 }}>
          <Card.Content style={{ padding: SPACING.large }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.medium }}>
              <Text style={[TEXT_STYLES.heading, { color: 'white' }]}>
                Season Reports 📊
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <Portal>
                  <Menu
                    visible={showMenu}
                    onDismiss={() => setShowMenu(false)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        iconColor="white"
                        size={24}
                        onPress={() => setShowMenu(true)}
                      />
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        setShowMenu(false);
                        navigation.navigate('CreateReport');
                      }}
                      title="Create New Report"
                      leadingIcon="add-circle"
                    />
                    <Menu.Item
                      onPress={() => {
                        setShowMenu(false);
                        navigation.navigate('ReportTemplates');
                      }}
                      title="Report Templates"
                      leadingIcon="file-copy"
                    />
                    <Menu.Item
                      onPress={() => {
                        setShowMenu(false);
                        navigation.navigate('ScheduleReports');
                      }}
                      title="Schedule Reports"
                      leadingIcon="schedule"
                    />
                    <Menu.Item
                      onPress={() => {
                        setShowMenu(false);
                        Alert.alert('Export', 'Bulk export feature coming soon');
                      }}
                      title="Export All"
                      leadingIcon="download"
                    />
                  </Menu>
                </Portal>
              </View>
            </View>

            {/* Season Overview Stats */}
            <View style={{ marginBottom: SPACING.medium }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.medium }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Total Reports</Text>
                  <Text style={[TEXT_STYLES.title, { color: 'white', fontWeight: 'bold' }]}>47</Text>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>This Month</Text>
                  <Text style={[TEXT_STYLES.title, { color: 'white', fontWeight: 'bold' }]}>8</Text>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Downloads</Text>
                  <Text style={[TEXT_STYLES.title, { color: COLORS.success, fontWeight: 'bold' }]}>156</Text>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Avg Rating</Text>
                  <Text style={[TEXT_STYLES.title, { color: 'white', fontWeight: 'bold' }]}>4.8⭐</Text>
                </View>
              </View>

              {/* Season Progress */}
              <View>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginBottom: SPACING.xsmall }]}>
                  Season Progress (75% complete)
                </Text>
                <ProgressBar
                  progress={0.75}
                  color={COLORS.success}
                  style={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' }}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      </LinearGradient>
    </Animated.View>
  );

  const renderFilters = () => (
    <View style={{ paddingHorizontal: SPACING.medium, marginBottom: SPACING.medium }}>
      <Searchbar
        placeholder="Search reports..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{ marginBottom: SPACING.medium, elevation: 2 }}
        iconColor={COLORS.primary}
      />

      {/* Season Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.small }}>
        <View style={{ flexDirection: 'row' }}>
          {mockSeasons.map((season) => (
            <TouchableOpacity
              key={season.value}
              onPress={() => setSelectedSeason(season.value)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: SPACING.medium,
                paddingVertical: SPACING.small,
                marginRight: SPACING.small,
                borderRadius: 20,
                backgroundColor: selectedSeason === season.value ? COLORS.primary : COLORS.background,
                borderWidth: 1,
                borderColor: selectedSeason === season.value ? COLORS.primary : COLORS.border,
              }}
            >
              <Text
                style={[
                  TEXT_STYLES.caption,
                  { color: selectedSeason === season.value ? 'white' : COLORS.primary }
                ]}
              >
                {season.label}
              </Text>
              {season.status === 'active' && (
                <Badge
                  size={8}
                  style={{ backgroundColor: COLORS.success, marginLeft: SPACING.xsmall }}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Report Type Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row' }}>
          {mockReportTypes.map((type) => (
            <Chip
              key={type.value}
              mode={selectedReportType === type.value ? 'flat' : 'outlined'}
              selected={selectedReportType === type.value}
              onPress={() => setSelectedReportType(type.value)}
              style={{
                marginRight: SPACING.small,
                backgroundColor: selectedReportType === type.value ? COLORS.primary : 'transparent',
              }}
              textStyle={{
                color: selectedReportType === type.value ? 'white' : COLORS.primary,
              }}
            >
              {type.label} ({type.count})
            </Chip>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderSeasonOverviewCard = () => (
    <Animated.View style={{ opacity: chartAnim }}>
      <Card style={{ margin: SPACING.medium, elevation: 4 }}>
        <Card.Content style={{ padding: SPACING.medium }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.medium }}>
            <Text style={[TEXT_STYLES.subheading, { fontWeight: '600' }]}>
              Season Overview 🏆
            </Text>
            <IconButton
              icon="open-in-new"
              size={20}
              iconColor={COLORS.primary}
              onPress={() => navigation.navigate('DetailedSeasonReport')}
            />
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: SPACING.medium }}>
            <View style={{ width: '48%', marginBottom: SPACING.medium }}>
              <Surface style={{ padding: SPACING.medium, borderRadius: 8, elevation: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.small }}>
                  <Icon name="group" size={24} color={COLORS.primary} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.small, color: COLORS.textSecondary }]}>
                    Total Players
                  </Text>
                </View>
                <Text style={[TEXT_STYLES.title, { fontWeight: 'bold' }]}>{mockSeasonOverview.totalPlayers}</Text>
              </Surface>
            </View>

            <View style={{ width: '48%', marginBottom: SPACING.medium }}>
              <Surface style={{ padding: SPACING.medium, borderRadius: 8, elevation: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.small }}>
                  <Icon name="trending-up" size={24} color={COLORS.success} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.small, color: COLORS.textSecondary }]}>
                    Avg Improvement
                  </Text>
                </View>
                <Text style={[TEXT_STYLES.title, { fontWeight: 'bold', color: COLORS.success }]}>
                  +{mockSeasonOverview.averageImprovement}%
                </Text>
              </Surface>
            </View>

            <View style={{ width: '48%', marginBottom: SPACING.medium }}>
              <Surface style={{ padding: SPACING.medium, borderRadius: 8, elevation: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.small }}>
                  <Icon name="flag" size={24} color={COLORS.warning} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.small, color: COLORS.textSecondary }]}>
                    Goals Achieved
                  </Text>
                </View>
                <Text style={[TEXT_STYLES.title, { fontWeight: 'bold' }]}>
                  {mockSeasonOverview.goalsAchieved}/{mockSeasonOverview.totalGoals}
                </Text>
                <ProgressBar
                  progress={mockSeasonOverview.goalsAchieved / mockSeasonOverview.totalGoals}
                  color={COLORS.success}
                  style={{ height: 4, marginTop: SPACING.xsmall }}
                />
              </Surface>
            </View>

            <View style={{ width: '48%', marginBottom: SPACING.medium }}>
              <Surface style={{ padding: SPACING.medium, borderRadius: 8, elevation: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.small }}>
                  <Icon name="schedule" size={24} color={COLORS.error} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.small, color: COLORS.textSecondary }]}>
                    Training Hours
                  </Text>
                </View>
                <Text style={[TEXT_STYLES.title, { fontWeight: 'bold' }]}>{mockSeasonOverview.trainingHours}h</Text>
              </Surface>
            </View>
          </View>

          {/* Key Achievements */}
          <View>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.small }]}>
              Key Achievements
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <View
                style={{
                  backgroundColor: `${COLORS.success}20`,
                  paddingHorizontal: SPACING.small,
                  paddingVertical: 4,
                  borderRadius: 12,
                  marginRight: SPACING.xsmall,
                  marginBottom: SPACING.xsmall,
                }}
              >
                <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>
                  🏆 {mockSeasonOverview.championshipsWon} Championships
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: `${COLORS.primary}20`,
                  paddingHorizontal: SPACING.small,
                  paddingVertical: 4,
                  borderRadius: 12,
                  marginRight: SPACING.xsmall,
                  marginBottom: SPACING.xsmall,
                }}
              >
                <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                  📈 Top Player: {mockSeasonOverview.topPerformer}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: `${COLORS.warning}20`,
                  paddingHorizontal: SPACING.small,
                  paddingVertical: 4,
                  borderRadius: 12,
                  marginRight: SPACING.xsmall,
                  marginBottom: SPACING.xsmall,
                }}
              >
                <Text style={[TEXT_STYLES.caption, { color: COLORS.warning }]}>
                  🚀 Most Improved: {mockSeasonOverview.mostImproved}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderReportCard = (report) => (
    <Animated.View style={{ opacity: chartAnim }}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ReportViewer', { reportId: report.id })}
        activeOpacity={0.9}
      >
        <Card style={{ margin: SPACING.medium, marginBottom: SPACING.medium, elevation: 4 }}>
          <Card.Content style={{ padding: SPACING.medium }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.medium }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xsmall }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: `${COLORS.primary}20`,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: SPACING.small,
                    }}
                  >
                    <Icon name={getReportIcon(report.type)} size={20} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[TEXT_STYLES.subheading, { fontWeight: '600' }]}>{report.title}</Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                      by {report.author} • {report.pages} pages
                    </Text>
                  </View>
                </View>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: SPACING.xsmall }]} numberOfLines={2}>
                  {report.description}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <View
                  style={{
                    backgroundColor: getStatusColor(report.status),
                    paddingHorizontal: SPACING.small,
                    paddingVertical: 2,
                    borderRadius: 10,
                    marginBottom: SPACING.xsmall,
                  }}
                >
                  <Text style={[TEXT_STYLES.caption, { color: 'white', fontSize: 10 }]}>
                    {report.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, fontSize: 10 }]}>
                  {report.size}
                </Text>
              </View>
            </View>

            {/* Highlights */}
            <View style={{ marginBottom: SPACING.medium }}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.small }]}>
                Key Highlights
              </Text>
              {report.highlights.slice(0, 2).map((highlight, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.xsmall }}>
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: COLORS.primary,
                      marginTop: 6,
                      marginRight: SPACING.small,
                    }}
                  />
                  <Text style={[TEXT_STYLES.caption, { flex: 1, color: COLORS.text }]}>{highlight}</Text>
                </View>
              ))}
              {report.highlights.length > 2 && (
                <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, fontStyle: 'italic' }]}>
                  +{report.highlights.length - 2} more insights
                </Text>
              )}
            </View>

            {/* Metrics Preview */}
            {report.type === 'performance' && (
              <View style={{ marginBottom: SPACING.medium }}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.small }]}>
                  Performance Metrics
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {Object.entries(report.metrics).map(([key, value]) => (
                    <View key={key} style={{ alignItems: 'center', flex: 1 }}>
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: value.trend === 'up' ? `${COLORS.success}20` : `${COLORS.warning}20`,
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginBottom: SPACING.xsmall,
                        }}
                      >
                        <Icon
                          name={value.trend === 'up' ? 'trending-up' : 'trending-flat'}
                          size={16}
                          color={value.trend === 'up' ? COLORS.success : COLORS.warning}
                        />
                      </View>
                      <Text style={[TEXT_STYLES.caption, { fontSize: 11, textAlign: 'center' }]}>
                        {key} +{value.improvement}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Stats */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.medium }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="visibility" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: SPACING.xsmall }]}>
                  {report.views} views
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="download" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: SPACING.xsmall }]}>
                  {report.downloads} downloads
                </Text>
              </View>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {new Date(report.generatedDate).toLocaleDateString()}
              </Text>
            </View>

            {/* Actions */}
            <Divider style={{ marginBottom: SPACING.medium }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row' }}>
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('ReportViewer', { reportId: report.id })}
                  labelStyle={{ color: COLORS.primary }}
                  icon="visibility"
                  compact
                >
                  View
                </Button>
                <Button
                  mode="text"
                  onPress={() => Alert.alert('Download', `Downloading ${report.title}`)}
                  labelStyle={{ color: COLORS.success }}
                  icon="download"
                  compact
                >
                  Download
                </Button>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <IconButton
                  icon="share"
                  size={20}
                  iconColor={COLORS.primary}
                  onPress={() => shareReport(report)}
                />
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  iconColor={COLORS.textSecondary}
                  onPress={() => {
                    Alert.alert(
                      'Report Actions',
                      'Choose an action',
                      [
                        { text: 'Edit Report', onPress: () => navigation.navigate('EditReport', { reportId: report.id }) },
                        { text: 'Duplicate', onPress: () => Alert.alert('Duplicate', 'Report duplicated') },
                        { text: 'Delete', onPress: () => Alert.alert('Delete', 'Are you sure?'), style: 'destructive' },
                        { text: 'Cancel', style: 'cancel' },
                      ]
                    );
                  }}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderReportsList = () => {
    const filteredReports = mockReports.filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          report.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedReportType === 'overview' || report.type === selectedReportType;
      
      return matchesSearch && matchesType;
    });

    if (selectedReportType === 'overview') {
      return (
        <View>
          {renderSeasonOverviewCard()}
          {filteredReports.map(report => renderReportCard(report))}
        </View>
      );
    }

    return (
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => renderReportCard(item)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        nestedScrollEnabled={false}
      />
    );
  };

  const renderQuickActions = () => (
    <View style={{ 
      flexDirection: 'row', 
      paddingHorizontal: SPACING.medium, 
      paddingBottom: SPACING.large,
      justifyContent: 'space-between'
    }}>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('ReportTemplates')}
        style={{ flex: 1, marginRight: SPACING.small }}
        icon="file-copy"
      >
        Templates
      </Button>

      <Button
        mode="outlined"
        onPress={() => navigation.navigate('ScheduleReports')}
        style={{ flex: 1, marginHorizontal: SPACING.xsmall }}
        icon="schedule"
      >
        Schedule
      </Button>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('CreateReport')}
        style={{ flex: 1, marginLeft: SPACING.small, backgroundColor: COLORS.primary }}
        icon="add"
      >
        Create
      </Button>
    </View>
  );

  const renderEmptyState = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
      <Icon name="description" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.heading, { color: COLORS.textSecondary, marginTop: SPACING.medium }]}>
        No Reports Found
      </Text>
      <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.small }]}>
        Create your first season report to track progress and performance
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('CreateReport')}
        style={{ marginTop: SPACING.large, backgroundColor: COLORS.primary }}
        icon="add"
      >
        Create Report
      </Button>
    </View>
  );

  const renderInsightsCard = () => (
    <Card style={{ margin: SPACING.medium, elevation: 4 }}>
      <Card.Content style={{ padding: SPACING.medium }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.medium }}>
          <Text style={[TEXT_STYLES.subheading, { fontWeight: '600' }]}>
            Recent Insights 💡
          </Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('AllInsights')}
            labelStyle={{ color: COLORS.primary }}
            compact
          >
            View All
          </Button>
        </View>

        <View style={{ marginBottom: SPACING.medium }}>
          <View style={{
            backgroundColor: `${COLORS.success}10`,
            padding: SPACING.medium,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: COLORS.success,
            marginBottom: SPACING.small,
          }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.success, fontWeight: '600', marginBottom: SPACING.xsmall }]}>
              Performance Improvement
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.text }]}>
              Team fitness levels have improved by 23% over the last quarter, with 18 players achieving personal bests.
            </Text>
          </View>

          <View style={{
            backgroundColor: `${COLORS.warning}10`,
            padding: SPACING.medium,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: COLORS.warning,
            marginBottom: SPACING.small,
          }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.warning, fontWeight: '600', marginBottom: SPACING.xsmall }]}>
              Attention Needed
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.text }]}>
              3 players showing declining attendance rates. Consider individual check-ins to address potential issues.
            </Text>
          </View>

          <View style={{
            backgroundColor: `${COLORS.primary}10`,
            padding: SPACING.medium,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: COLORS.primary,
          }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, fontWeight: '600', marginBottom: SPACING.xsmall }]}>
              New Recommendation
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.text }]}>
              Based on recent performance data, consider implementing specialized speed training for forwards.
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.background}
          />
        }
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {renderHeader()}
        {renderFilters()}
        
        {selectedReportType === 'overview' && renderInsightsCard()}
        
        {mockReports.length > 0 ? renderReportsList() : renderEmptyState()}
        {renderQuickActions()}
      </ScrollView>

      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => {
          Alert.alert(
            'Create Report',
            'Choose report type',
            [
              { text: 'Performance Report', onPress: () => navigation.navigate('CreateReport', { type: 'performance' }) },
              { text: 'Individual Report', onPress: () => navigation.navigate('CreateReport', { type: 'individual' }) },
              { text: 'Team Analysis', onPress: () => navigation.navigate('CreateReport', { type: 'team' }) },
              { text: 'Custom Report', onPress: () => navigation.navigate('CreateReport', { type: 'custom' }) },
              { text: 'Use Template', onPress: () => navigation.navigate('ReportTemplates') },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}
      />
    </View>
  );
};

// Screen configuration for navigation
SeasonReports.navigationOptions = {
  title: 'Season Reports',
  headerShown: true,
  headerStyle: {
    backgroundColor: COLORS.primary,
  },
  headerTintColor: 'white',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
};

export default SeasonReports;