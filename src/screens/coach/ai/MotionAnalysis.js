import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Modal,
  TextInput,
  StatusBar,
  SafeAreaView,
  Alert,
  RefreshControl,
  Animated,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button, Chip, ProgressBar, Avatar, IconButton, FAB, Surface, Searchbar, Portal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';

// Import your app's constants and styles
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  background: '#f9fafb',
  surface: '#ffffff',
  text: '#111827',
  textSecondary: '#6b7280',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold' },
  h2: { fontSize: 20, fontWeight: '600' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 14 },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const MotionAnalysisScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth?.user);
  const [refreshing, setRefreshing] = useState(false);
  
  // Video player state
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  // Analysis state
  const [activeTab, setActiveTab] = useState('analysis');
  const [selectedTool, setSelectedTool] = useState('pointer');
  const [showOverlays, setShowOverlays] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [selectedTrainee, setSelectedTrainee] = useState('all');
  const [analysisMode, setAnalysisMode] = useState('technique');
  
  // Modal state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showToolsModal, setShowToolsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data
  const videos = [
    {
      id: 1,
      title: 'Football Technique - Alex Johnson',
      trainee: 'Alex Johnson',
      sport: 'Football',
      date: '2024-08-15',
      duration: '00:02:30',
      thumbnail: '🏈',
      type: 'technique',
      status: 'analyzed',
      insights: ['Improved ball control', 'Work on left foot', 'Good positioning'],
      aiScore: 85,
      progressPoints: 120,
    },
    {
      id: 2,
      title: 'Basketball Shooting Form - Sarah Williams',
      trainee: 'Sarah Williams',
      sport: 'Basketball',
      date: '2024-08-14',
      duration: '00:01:45',
      thumbnail: '⛹️‍♀️',
      type: 'shooting',
      status: 'pending',
      insights: ['Consistent arc', 'Follow-through needs work', 'Good stance'],
      aiScore: 78,
      progressPoints: 95,
    },
    {
      id: 3,
      title: 'Tennis Serve Analysis - Michael Chen',
      trainee: 'Michael Chen',
      sport: 'Tennis',
      date: '2024-08-13',
      duration: '00:03:15',
      thumbnail: '🎾',
      type: 'serve',
      status: 'analyzed',
      insights: ['Excellent toss', 'Power generation good', 'Minor timing adjustment'],
      aiScore: 92,
      progressPoints: 150,
    }
  ];

  const motionMetrics = [
    { name: 'Velocity', current: 85, max: 95, unit: 'km/h', trend: 'up', icon: 'speed' },
    { name: 'Acceleration', current: 12.5, max: 15, unit: 'm/s²', trend: 'up', icon: 'trending-up' },
    { name: 'Angle', current: 45, optimal: 42, unit: '°', trend: 'neutral', icon: 'straighten' },
    { name: 'Force', current: 750, max: 850, unit: 'N', trend: 'down', icon: 'fitness-center' },
    { name: 'Balance', current: 92, target: 95, unit: '%', trend: 'up', icon: 'balance' },
    { name: 'Timing', current: 0.85, optimal: 0.80, unit: 's', trend: 'neutral', icon: 'timer' }
  ];

  // Initialize animations
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
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTrendIcon = (trend) => {
    const iconName = trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'trending-flat';
    const color = trend === 'up' ? COLORS.success : trend === 'down' ? COLORS.error : COLORS.textSecondary;
    return <Icon name={iconName} size={16} color={color} />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'analyzed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'processing': return COLORS.primary;
      default: return COLORS.textSecondary;
    }
  };

  const handleVideoSelect = (video) => {
    setCurrentVideo(video);
    setShowVideoModal(false);
    // Add haptic feedback
    // Vibration.vibrate(50);
  };

  const handleUploadVideo = () => {
    Alert.alert(
      '🎬 Video Upload',
      'Video upload and analysis feature is coming soon! This will allow you to upload training videos for AI-powered motion analysis.',
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.videoItem,
        currentVideo?.id === item.id && styles.videoItemActive
      ]}
      onPress={() => handleVideoSelect(item)}
    >
      <Card style={styles.videoCard}>
        <View style={styles.videoItemHeader}>
          <View style={styles.videoThumbnail}>
            <Text style={styles.videoThumbnailEmoji}>{item.thumbnail}</Text>
          </View>
          <View style={styles.videoInfo}>
            <Text style={[TEXT_STYLES.body, styles.videoTitle]} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={[TEXT_STYLES.caption, styles.videoTrainee]}>{item.trainee}</Text>
            <View style={styles.videoMeta}>
              <Chip size="small" textStyle={styles.chipText}>
                {item.duration}
              </Chip>
              <Chip 
                size="small" 
                style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
                textStyle={styles.statusChipText}
              >
                {item.status}
              </Chip>
            </View>
          </View>
          <View style={styles.videoStats}>
            <View style={styles.scoreContainer}>
              <Icon name="psychology" size={16} color={COLORS.primary} />
              <Text style={styles.aiScore}>{item.aiScore}</Text>
            </View>
            <View style={styles.pointsContainer}>
              <Icon name="stars" size={14} color={COLORS.warning} />
              <Text style={styles.points}>{item.progressPoints}</Text>
            </View>
          </View>
        </View>
        {item.status === 'analyzed' && (
          <View style={styles.insights}>
            {item.insights.slice(0, 2).map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <Icon name="circle" size={6} color={COLORS.primary} />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  const renderMetricCard = ({ item }) => (
    <Card style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Icon name={item.icon} size={20} color={COLORS.primary} />
        <View style={styles.metricTrend}>
          {getTrendIcon(item.trend)}
        </View>
      </View>
      <Text style={[TEXT_STYLES.caption, styles.metricName]}>{item.name}</Text>
      <Text style={[TEXT_STYLES.h2, styles.metricValue]}>
        {item.current}
        <Text style={[TEXT_STYLES.caption, styles.metricUnit]}>{item.unit}</Text>
      </Text>
      {item.max && (
        <Text style={[TEXT_STYLES.caption, styles.metricMax]}>
          Max: {item.max}{item.unit}
        </Text>
      )}
      {item.optimal && (
        <Text style={[TEXT_STYLES.caption, styles.metricOptimal]}>
          Optimal: {item.optimal}{item.unit}
        </Text>
      )}
      <ProgressBar 
        progress={item.current / (item.max || item.optimal || 100)} 
        color={COLORS.primary}
        style={styles.metricProgress}
      />
    </Card>
  );

  const renderAnalysisContent = () => {
    switch (activeTab) {
      case 'analysis':
        return (
          <ScrollView 
            style={styles.tabContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
            }
          >
            {/* AI Insights Card */}
            <Card style={[styles.aiInsightCard, { marginBottom: SPACING.lg }]}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.aiInsightGradient}
              >
                <View style={styles.aiInsightHeader}>
                  <Icon name="psychology" size={24} color="#ffffff" />
                  <Text style={styles.aiInsightTitle}>AI Motion Analysis</Text>
                </View>
                <Text style={styles.aiInsightText}>
                  🎯 Advanced biomechanical analysis with real-time performance feedback
                </Text>
              </LinearGradient>
            </Card>

            {/* Metrics Grid */}
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>📊 Key Metrics</Text>
            <FlatList
              data={motionMetrics}
              renderItem={renderMetricCard}
              keyExtractor={(item) => item.name}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.metricsGrid}
            />

            {/* Biomechanical Analysis */}
            <Card style={styles.bioSection}>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>🦴 Biomechanical Analysis</Text>
              <View style={styles.jointAnalysis}>
                {[
                  { joint: 'Shoulder', angle: 142, optimal: '140-145', status: 'optimal', icon: 'accessibility' },
                  { joint: 'Elbow', angle: 95, optimal: '90-100', status: 'optimal', icon: 'straighten' },
                  { joint: 'Hip', angle: 158, optimal: '155-165', status: 'optimal', icon: 'accessibility-new' },
                  { joint: 'Knee', angle: 125, optimal: '120-130', status: 'optimal', icon: 'straighten' }
                ].map((joint) => (
                  <Card key={joint.joint} style={styles.jointCard}>
                    <View style={styles.jointHeader}>
                      <Icon name={joint.icon} size={20} color={COLORS.primary} />
                      <View style={[
                        styles.statusIndicator,
                        { backgroundColor: joint.status === 'optimal' ? COLORS.success : COLORS.warning }
                      ]} />
                    </View>
                    <Text style={[TEXT_STYLES.caption, styles.jointName]}>{joint.joint}</Text>
                    <Text style={[TEXT_STYLES.h2, styles.jointAngle]}>{joint.angle}°</Text>
                    <Text style={[TEXT_STYLES.caption, styles.jointOptimal]}>
                      Optimal: {joint.optimal}°
                    </Text>
                    <ProgressBar 
                      progress={0.95} 
                      color={COLORS.success}
                      style={styles.jointProgress}
                    />
                  </Card>
                ))}
              </View>
            </Card>

            {/* Performance Tracking */}
            <Card style={styles.performanceCard}>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>📈 Performance Tracking</Text>
              <View style={styles.performanceStats}>
                <View style={styles.performanceStat}>
                  <Icon name="trending-up" size={20} color={COLORS.success} />
                  <Text style={styles.performanceLabel}>Improvement</Text>
                  <Text style={styles.performanceValue}>+12%</Text>
                </View>
                <View style={styles.performanceStat}>
                  <Icon name="local-fire-department" size={20} color={COLORS.warning} />
                  <Text style={styles.performanceLabel}>Streak</Text>
                  <Text style={styles.performanceValue}>7 days</Text>
                </View>
                <View style={styles.performanceStat}>
                  <Icon name="jump-rope" size={20} color={COLORS.primary} />
                  <Text style={styles.performanceLabel}>Achievements</Text>
                  <Text style={styles.performanceValue}>5 new</Text>
                </View>
              </View>
            </Card>
          </ScrollView>
        );

      case 'comparison':
        return (
          <ScrollView 
            style={styles.tabContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
            }
          >
            <Card style={styles.comparisonCard}>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>📊 Performance Comparison</Text>
              <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginBottom: SPACING.lg }]}>
                Compare your progress with previous sessions and optimal benchmarks
              </Text>
              
              <View style={styles.comparisonStats}>
                {[
                  { metric: 'Speed', current: 85, previous: 78, optimal: 90 },
                  { metric: 'Accuracy', current: 92, previous: 88, optimal: 95 },
                  { metric: 'Power', current: 78, previous: 75, optimal: 85 },
                  { metric: 'Technique', current: 88, previous: 85, optimal: 92 },
                ].map((item) => (
                  <View key={item.metric} style={styles.comparisonRow}>
                    <Text style={styles.comparisonMetric}>{item.metric}</Text>
                    <View style={styles.comparisonBars}>
                      <View style={styles.barContainer}>
                        <Text style={styles.barLabel}>Current</Text>
                        <View style={styles.barBackground}>
                          <View style={[styles.bar, { width: `${item.current}%`, backgroundColor: COLORS.primary }]} />
                        </View>
                        <Text style={styles.barValue}>{item.current}%</Text>
                      </View>
                      <View style={styles.barContainer}>
                        <Text style={styles.barLabel}>Previous</Text>
                        <View style={styles.barBackground}>
                          <View style={[styles.bar, { width: `${item.previous}%`, backgroundColor: COLORS.textSecondary }]} />
                        </View>
                        <Text style={styles.barValue}>{item.previous}%</Text>
                      </View>
                    </View>
                    <View style={styles.improvementBadge}>
                      <Icon name="trending-up" size={12} color={COLORS.success} />
                      <Text style={styles.improvementText}>+{item.current - item.previous}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          </ScrollView>
        );

      case 'insights':
        return (
          <ScrollView 
            style={styles.tabContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
            }
          >
            <Card style={[styles.insightCard, styles.primaryInsight]}>
              <LinearGradient
                colors={[COLORS.primary + '20', COLORS.secondary + '20']}
                style={styles.insightGradient}
              >
                <View style={styles.insightHeader}>
                  <Icon name="psychology" size={20} color={COLORS.primary} />
                  <Text style={styles.insightTitle}>🎯 AI Recommendation</Text>
                </View>
                <Text style={styles.insightDescription}>
                  Your technique shows 12% improvement! Focus on maintaining consistent timing 
                  in the preparation phase for even better results. 🚀
                </Text>
              </LinearGradient>
            </Card>

            <Card style={[styles.insightCard, styles.successInsight]}>
              <View style={styles.insightHeader}>
                <Icon name="trending-up" size={20} color={COLORS.success} />
                <Text style={styles.insightTitle}>📈 Performance Trend</Text>
              </View>
              <Text style={styles.insightDescription}>
                Excellent progress! You've maintained improvement across 4 consecutive sessions. 
                Keep up the momentum! 💪
              </Text>
            </Card>

            <Card style={[styles.insightCard, styles.warningInsight]}>
              <View style={styles.insightHeader}>
                <Icon name="warning" size={20} color={COLORS.warning} />
                <Text style={styles.insightTitle}>⚠️ Areas for Improvement</Text>
              </View>
              <Text style={styles.insightDescription}>
                Minor imbalance detected in force distribution. Consider adding unilateral 
                strengthening exercises to your routine.
              </Text>
            </Card>

            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>🎯 Action Items</Text>
            
            {[
              {
                icon: 'schedule',
                title: '⏱️ Focus on Timing',
                description: 'Practice with metronome at 120 BPM',
                priority: 'High',
                color: COLORS.error,
                points: 50,
              },
              {
                icon: 'fitness-center',
                title: '💪 Strength Training',
                description: 'Add unilateral exercises to routine',
                priority: 'Medium',
                color: COLORS.success,
                points: 30,
              },
              {
                icon: 'healing',
                title: '🧘 Recovery Focus',
                description: 'Monitor fatigue levels during training',
                priority: 'Low',
                color: COLORS.warning,
                points: 20,
              }
            ].map((action, index) => (
              <TouchableOpacity key={index} style={styles.actionCard}>
                <Icon name={action.icon} size={20} color={action.color} />
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                  <View style={styles.actionMeta}>
                    <Chip 
                      size="small" 
                      style={[styles.priorityChip, { backgroundColor: action.color + '20' }]}
                      textStyle={[styles.priorityText, { color: action.color }]}
                    >
                      {action.priority} Priority
                    </Chip>
                    <View style={styles.pointsBadge}>
                      <Icon name="stars" size={12} color={COLORS.warning} />
                      <Text style={styles.pointsText}>+{action.points} pts</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );

      default:
        return (
          <View style={styles.emptyState}>
            <Icon name="video-library" size={64} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>No Video Selected</Text>
            <Text style={[TEXT_STYLES.body, styles.emptyDescription]}>
              Choose a video from the library to start motion analysis
            </Text>
            <Button 
              mode="contained" 
              onPress={() => setShowVideoModal(true)}
              style={styles.emptyButton}
            >
              Browse Videos
            </Button>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerInfo}>
            <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>🎬 Motion Analysis</Text>
            <Text style={styles.headerSubtitle}>
              AI-powered biomechanical analysis and performance tracking
            </Text>
          </View>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadVideo}>
            <Icon name="cloud-upload" size={16} color="#ffffff" />
            <Text style={styles.uploadText}>Upload</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      {/* Video Player */}
      <Card style={styles.videoContainer}>
        {currentVideo ? (
          <View style={styles.videoPlayer}>
            <Text style={styles.videoPlayerEmoji}>{currentVideo.thumbnail}</Text>
            <Text style={[TEXT_STYLES.h2, styles.videoPlayerTitle]}>{currentVideo.title}</Text>
            <Text style={[TEXT_STYLES.caption, styles.videoPlayerSubtitle]}>
              🎥 Video Player - Motion Tracking Active
            </Text>
            
            {/* Motion tracking overlays */}
            {showOverlays && (
              <View style={styles.overlayContainer}>
                <View style={[styles.trackingPoint, { top: '30%', left: '50%', backgroundColor: COLORS.error }]} />
                <View style={[styles.trackingPoint, { top: '45%', left: '45%', backgroundColor: COLORS.primary }]} />
                <View style={[styles.trackingPoint, { top: '45%', left: '55%', backgroundColor: COLORS.primary }]} />
                <View style={[styles.trackingPoint, { top: '60%', left: '50%', backgroundColor: COLORS.success }]} />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyVideoPlayer}>
            <Icon name="video-library" size={48} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h2, styles.emptyVideoTitle]}>Select a video to start analysis</Text>
            <Text style={[TEXT_STYLES.caption, styles.emptyVideoSubtitle]}>
              Choose from the library or upload a new training video
            </Text>
            <Button 
              mode="contained" 
              onPress={() => setShowVideoModal(true)}
              style={styles.selectVideoButton}
            >
              Browse Library
            </Button>
          </View>
        )}

        {/* Video Controls */}
        {currentVideo && (
          <View style={styles.videoControls}>
            <IconButton
              icon={isPlaying ? 'pause' : 'play-arrow'}
              size={24}
              iconColor="#ffffff"
              style={styles.playButton}
              onPress={togglePlayPause}
            />
            
            <View style={styles.progressContainer}>
              <ProgressBar 
                progress={0.45} 
                color="#ffffff"
                style={styles.progressBar}
              />
              <Text style={styles.timeText}>01:15 / {currentVideo?.duration}</Text>
            </View>

            <IconButton
              icon="volume-up"
              size={16}
              iconColor="#ffffff"
              onPress={() => setIsMuted(!isMuted)}
            />
          </View>
        )}
      </Card>

      {/* Tools Bar */}
      <Surface style={styles.toolsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolsScroll}>
          <Chip 
            selected={showOverlays}
            onPress={() => setShowOverlays(!showOverlays)}
            icon="center-focus-weak"
            style={styles.toolChip}
          >
            Tracking
          </Chip>
          
          <Chip 
            selected={showGrid}
            onPress={() => setShowGrid(!showGrid)}
            icon="grid-on"
            style={styles.toolChip}
          >
            Grid
          </Chip>

          <Chip icon="straighten" style={styles.toolChip}>
            Ruler
          </Chip>

          <Chip icon="straighten" style={styles.toolChip}>
            Angle
          </Chip>
        </ScrollView>

        <Button 
          mode="contained" 
          compact
          icon="save"
          onPress={() => Alert.alert('💾 Analysis Saved', 'Your motion analysis has been saved successfully!')}
          style={styles.saveButton}
          buttonColor={COLORS.success}
        >
          Save
        </Button>
      </Surface>

      {/* Tabs */}
      <Surface style={styles.tabBar}>
        {['analysis', 'comparison', 'insights'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </Surface>

      {/* Content */}
      <View style={styles.content}>
        {renderAnalysisContent()}
      </View>

      {/* Floating Action Button */}
      <FAB
        icon="video-library"
        style={styles.fab}
        onPress={() => setShowVideoModal(true)}
      />

      {/* Video Library Modal */}
      <Portal>
        <Modal
          visible={showVideoModal}
          onDismiss={() => setShowVideoModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>🎬 Video Library</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowVideoModal(false)}
            />
          </View>
          
          <Searchbar
            placeholder="Search videos..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
          
          <FlatList
            data={videos.filter(video => 
              video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              video.trainee.toLowerCase().includes(searchQuery.toLowerCase())
            )}
            renderItem={renderVideoItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.videoList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
            }
          />
          
          <Button 
            mode="outlined" 
            icon="videocam"
            onPress={handleUploadVideo}
            style={styles.recordButton}
          >
            📹 Record New Video
          </Button>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

// Set screen options for navigation
MotionAnalysisScreen.navigationOptions = {
  title: 'Motion Analysis',
  headerShown: false,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 0,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: '#ffffff',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  uploadButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  videoContainer: {
    margin: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: '#000000',
    aspectRatio: 16/9,
    position: 'relative',
    elevation: 4,
  },
  videoPlayer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoPlayerEmoji: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  videoPlayerTitle: {
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  videoPlayerSubtitle: {
    color: '#d1d5db',
    textAlign: 'center',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  trackingPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.8,
  },
  emptyVideoPlayer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyVideoTitle: {
    color: '#ffffff',
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyVideoSubtitle: {
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  selectVideoButton: {
    marginTop: SPACING.md,
  },
  videoControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: SPACING.md,
  },
  progressContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: SPACING.xs,
  },
  timeText: {
    color: '#ffffff',
    fontSize: 12,
  },
  toolsBar: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  toolsScroll: {
    flex: 1,
  },
  toolChip: {
    marginRight: SPACING.sm,
  },
  saveButton: {
    marginLeft: SPACING.md,
  },
  tabBar: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    elevation: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  tabActive: {
    backgroundColor: COLORS.primary + '20',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  aiInsightCard: {
    overflow: 'hidden',
    elevation: 4,
  },
  aiInsightGradient: {
    padding: SPACING.lg,
  },
  aiInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  aiInsightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: SPACING.sm,
  },
  aiInsightText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  metricsGrid: {
    marginBottom: SPACING.xxl,
  },
  metricCard: {
    flex: 1,
    margin: SPACING.xs,
    padding: SPACING.lg,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metricTrend: {
    marginLeft: SPACING.sm,
  },
  metricName: {
    marginBottom: SPACING.xs,
  },
  metricValue: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  metricUnit: {
    fontWeight: 'normal',
  },
  metricMax: {
    marginBottom: SPACING.xs,
  },
  metricOptimal: {
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  metricProgress: {
    height: 4,
  },
  bioSection: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 2,
  },
  jointAnalysis: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  jointCard: {
    width: '48%',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  jointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  jointName: {
    marginBottom: SPACING.xs,
  },
  jointAngle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  jointOptimal: {
    marginBottom: SPACING.sm,
  },
  jointProgress: {
    height: 4,
  },
  performanceCard: {
    padding: SPACING.lg,
    elevation: 2,
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceStat: {
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  comparisonCard: {
    padding: SPACING.lg,
    elevation: 2,
  },
  comparisonStats: {
    marginTop: SPACING.lg,
  },
  comparisonRow: {
    marginBottom: SPACING.lg,
  },
  comparisonMetric: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  comparisonBars: {
    marginBottom: SPACING.sm,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  barLabel: {
    width: 60,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    marginHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  barValue: {
    width: 30,
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'right',
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  improvementText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  insightCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 2,
  },
  primaryInsight: {
    overflow: 'hidden',
  },
  successInsight: {
    backgroundColor: COLORS.success + '10',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  warningInsight: {
    backgroundColor: COLORS.warning + '10',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  insightGradient: {
    margin: -SPACING.lg,
    padding: SPACING.lg,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  insightDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    elevation: 1,
  },
  actionContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  actionDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  actionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityChip: {
    height: 24,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '500',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 10,
    color: COLORS.warning,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    color: COLORS.text,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  emptyDescription: {
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: SPACING.xl,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    borderRadius: 12,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  modalTitle: {
    color: COLORS.text,
  },
  searchBar: {
    margin: SPACING.lg,
    marginTop: 0,
    elevation: 0,
    backgroundColor: COLORS.background,
  },
  videoList: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  videoItem: {
    marginBottom: SPACING.md,
  },
  videoCard: {
    elevation: 2,
  },
  videoItemActive: {
    transform: [{ scale: 0.98 }],
  },
  videoItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.lg,
  },
  videoThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  videoThumbnailEmoji: {
    fontSize: 20,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  videoTrainee: {
    marginBottom: SPACING.sm,
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 10,
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
  },
  videoStats: {
    alignItems: 'flex-end',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  aiScore: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  points: {
    fontSize: 12,
    color: COLORS.warning,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  insights: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  insightText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  recordButton: {
    margin: SPACING.lg,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
  },
});

export default MotionAnalysisScreen;