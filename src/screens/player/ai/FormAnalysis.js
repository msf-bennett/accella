import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
  Animated
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
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import { BlurView } from '../../../components/shared/BlurView';
import { useSelector, useDispatch } from 'react-redux';

// Import your constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e1e5e9'
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary }
};

const { width, height } = Dimensions.get('window');

const FormAnalysis = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [filterSport, setFilterSport] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Mock data - replace with Redux selectors
  const [videos] = useState([
    {
      id: 1,
      playerName: 'Alex Johnson',
      sport: 'Basketball',
      exercise: 'Free Throw',
      uploadDate: '2024-08-15',
      status: 'analyzed',
      thumbnail: 'https://via.placeholder.com/150',
      duration: '0:45',
      analysisScore: 85,
      issues: ['elbow_alignment', 'follow_through']
    },
    {
      id: 2,
      playerName: 'Sarah Chen',
      sport: 'Tennis',
      exercise: 'Serve',
      uploadDate: '2024-08-16',
      status: 'pending',
      thumbnail: 'https://via.placeholder.com/150',
      duration: '1:20',
      analysisScore: null,
      issues: []
    },
    {
      id: 3,
      playerName: 'Mike Torres',
      sport: 'Golf',
      exercise: 'Drive',
      uploadDate: '2024-08-17',
      status: 'analyzed',
      thumbnail: 'https://via.placeholder.com/150',
      duration: '0:30',
      analysisScore: 92,
      issues: ['grip_position']
    }
  ]);

  const [quickAnalysis] = useState([
    {
      id: 1,
      title: 'Shooting Form',
      sport: 'Basketball',
      keyPoints: ['Elbow under ball', 'Follow-through', 'Arc trajectory'],
      color: '#FF6B6B'
    },
    {
      id: 2,
      title: 'Swing Mechanics',
      sport: 'Tennis',
      keyPoints: ['Racket head speed', 'Contact point', 'Follow-through'],
      color: '#4ECDC4'
    },
    {
      id: 3,
      title: 'Running Form',
      sport: 'Track',
      keyPoints: ['Stride length', 'Foot strike', 'Posture'],
      color: '#45B7D1'
    }
  ]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleVideoUpload = () => {
    Alert.alert(
      'Upload Video',
      'Select video source for form analysis',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = () => {
    Alert.alert('Camera Integration', 'Camera integration coming soon! 📹');
  };

  const openGallery = () => {
    Alert.alert('Gallery Integration', 'Gallery integration coming soon! 🖼️');
  };

  const analyzeVideo = (video) => {
    setSelectedVideo(video);
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = {
        overallScore: Math.floor(Math.random() * 30) + 70,
        keyFrames: [
          { timestamp: '0:05', issue: 'Setup Position', severity: 'medium' },
          { timestamp: '0:12', issue: 'Contact Point', severity: 'high' },
          { timestamp: '0:18', issue: 'Follow Through', severity: 'low' }
        ],
        recommendations: [
          'Focus on maintaining elbow alignment throughout the motion',
          'Increase follow-through extension for better consistency',
          'Practice slower repetitions to build muscle memory'
        ],
        comparison: {
          professional: 95,
          personal_best: 88,
          peer_average: 82
        }
      };
      
      setAnalysisResults(mockAnalysis);
      setIsAnalyzing(false);
      setShowAnalysisModal(true);
    }, 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'analyzed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'error': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.exercise.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = filterSport === 'all' || video.sport === filterSport;
    return matchesSearch && matchesSport;
  });

  const renderVideoCard = (video) => (
    <Card key={video.id} style={styles.videoCard}>
      <View style={styles.videoHeader}>
        <View style={styles.videoInfo}>
          <Avatar.Text 
            size={40} 
            label={video.playerName.charAt(0)} 
            style={{ backgroundColor: COLORS.primary }}
          />
          <View style={styles.playerInfo}>
            <Text style={TEXT_STYLES.body}>{video.playerName}</Text>
            <Text style={TEXT_STYLES.caption}>{video.sport} • {video.exercise}</Text>
            <Text style={TEXT_STYLES.caption}>{video.uploadDate}</Text>
          </View>
        </View>
        <View style={styles.videoActions}>
          <Chip 
            mode="outlined" 
            style={[styles.statusChip, { borderColor: getStatusColor(video.status) }]}
            textStyle={{ color: getStatusColor(video.status) }}
          >
            {video.status}
          </Chip>
        </View>
      </View>
      
      <View style={styles.videoPreview}>
        <Surface style={styles.thumbnail}>
          <Icon name="play-circle-filled" size={40} color={COLORS.primary} />
          <Text style={styles.duration}>{video.duration}</Text>
        </Surface>
        
        <View style={styles.analysisInfo}>
          {video.analysisScore && (
            <View style={styles.scoreContainer}>
              <Text style={TEXT_STYLES.caption}>Form Score</Text>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                {video.analysisScore}%
              </Text>
              <ProgressBar 
                progress={video.analysisScore / 100} 
                color={COLORS.primary}
                style={styles.progressBar}
              />
            </View>
          )}
          
          {video.issues.length > 0 && (
            <View style={styles.issuesContainer}>
              <Text style={TEXT_STYLES.caption}>Issues Found: {video.issues.length}</Text>
              <View style={styles.issueChips}>
                {video.issues.slice(0, 2).map((issue, index) => (
                  <Chip key={index} compact style={styles.issueChip}>
                    {issue.replace('_', ' ')}
                  </Chip>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
      
      <Card.Actions>
        <Button 
          mode="outlined" 
          onPress={() => navigation.navigate('VideoPlayer', { video })}
          icon="play-arrow"
        >
          Watch
        </Button>
        <Button 
          mode="contained" 
          onPress={() => analyzeVideo(video)}
          disabled={isAnalyzing}
          buttonColor={COLORS.primary}
        >
          {video.status === 'analyzed' ? 'Re-analyze' : 'Analyze'}
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderQuickAnalysisCard = (analysis) => (
    <TouchableOpacity 
      key={analysis.id} 
      style={styles.quickAnalysisCard}
      onPress={() => Alert.alert('Quick Analysis', `Starting ${analysis.title} analysis template`)}
    >
      <LinearGradient
        colors={[analysis.color, analysis.color + '80']}
        style={styles.quickAnalysisGradient}
      >
        <View style={styles.quickAnalysisHeader}>
          <Icon name="analytics" size={24} color="white" />
          <Text style={styles.quickAnalysisTitle}>{analysis.title}</Text>
        </View>
        <Text style={styles.quickAnalysisSport}>{analysis.sport}</Text>
        <View style={styles.keyPointsContainer}>
          {analysis.keyPoints.map((point, index) => (
            <Text key={index} style={styles.keyPoint}>• {point}</Text>
          ))}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderAnalysisModal = () => (
    <Portal>
      <Modal
        visible={showAnalysisModal}
        animationType="slide"
        onRequestClose={() => setShowAnalysisModal(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.modalHeader}
          >
            <IconButton
              icon="close"
              iconColor="white"
              onPress={() => setShowAnalysisModal(false)}
            />
            <Text style={styles.modalTitle}>Analysis Results</Text>
            <View style={{ width: 48 }} />
          </LinearGradient>
          
          <ScrollView style={styles.modalContent}>
            {analysisResults && (
              <View>
                <Card style={styles.scoreCard}>
                  <Card.Content>
                    <View style={styles.scoreHeader}>
                      <Text style={TEXT_STYLES.h2}>Overall Form Score</Text>
                      <Text style={[TEXT_STYLES.h1, { color: COLORS.primary }]}>
                        {analysisResults.overallScore}%
                      </Text>
                    </View>
                    <ProgressBar 
                      progress={analysisResults.overallScore / 100}
                      color={COLORS.primary}
                      style={styles.scoreProgress}
                    />
                  </Card.Content>
                </Card>
                
                <Card style={styles.keyFramesCard}>
                  <Card.Content>
                    <Text style={TEXT_STYLES.h3}>Key Frame Analysis</Text>
                    {analysisResults.keyFrames.map((frame, index) => (
                      <View key={index} style={styles.keyFrame}>
                        <View style={styles.frameHeader}>
                          <Text style={TEXT_STYLES.body}>{frame.timestamp}</Text>
                          <Chip 
                            compact 
                            style={{ backgroundColor: getSeverityColor(frame.severity) + '20' }}
                            textStyle={{ color: getSeverityColor(frame.severity) }}
                          >
                            {frame.severity}
                          </Chip>
                        </View>
                        <Text style={TEXT_STYLES.caption}>{frame.issue}</Text>
                      </View>
                    ))}
                  </Card.Content>
                </Card>
                
                <Card style={styles.recommendationsCard}>
                  <Card.Content>
                    <Text style={TEXT_STYLES.h3}>AI Recommendations</Text>
                    {analysisResults.recommendations.map((rec, index) => (
                      <View key={index} style={styles.recommendation}>
                        <Icon name="lightbulb" size={16} color={COLORS.warning} />
                        <Text style={[TEXT_STYLES.body, { flex: 1, marginLeft: 8 }]}>
                          {rec}
                        </Text>
                      </View>
                    ))}
                  </Card.Content>
                </Card>
                
                <Card style={styles.comparisonCard}>
                  <Card.Content>
                    <Text style={TEXT_STYLES.h3}>Performance Comparison</Text>
                    <View style={styles.comparisonItem}>
                      <Text style={TEXT_STYLES.body}>vs Professional</Text>
                      <Text style={TEXT_STYLES.body}>{analysisResults.comparison.professional}%</Text>
                    </View>
                    <View style={styles.comparisonItem}>
                      <Text style={TEXT_STYLES.body}>vs Personal Best</Text>
                      <Text style={TEXT_STYLES.body}>{analysisResults.comparison.personal_best}%</Text>
                    </View>
                    <View style={styles.comparisonItem}>
                      <Text style={TEXT_STYLES.body}>vs Peer Average</Text>
                      <Text style={TEXT_STYLES.body}>{analysisResults.comparison.peer_average}%</Text>
                    </View>
                  </Card.Content>
                </Card>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Form Analysis</Text>
            <Text style={styles.headerSubtitle}>AI-Powered Movement Analysis 🎯</Text>
          </View>
          <IconButton
            icon="upload"
            iconColor="white"
            size={24}
            onPress={handleVideoUpload}
          />
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Search and Filters */}
          <View style={styles.searchSection}>
            <Searchbar
              placeholder="Search players or exercises..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                <Chip
                  selected={filterSport === 'all'}
                  onPress={() => setFilterSport('all')}
                  style={styles.filterChip}
                >
                  All Sports
                </Chip>
                <Chip
                  selected={filterSport === 'Basketball'}
                  onPress={() => setFilterSport('Basketball')}
                  style={styles.filterChip}
                >
                  Basketball
                </Chip>
                <Chip
                  selected={filterSport === 'Tennis'}
                  onPress={() => setFilterSport('Tennis')}
                  style={styles.filterChip}
                >
                  Tennis
                </Chip>
                <Chip
                  selected={filterSport === 'Golf'}
                  onPress={() => setFilterSport('Golf')}
                  style={styles.filterChip}
                >
                  Golf
                </Chip>
              </View>
            </ScrollView>
          </View>

          {/* Quick Analysis Templates */}
          <View style={styles.section}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Quick Analysis Templates</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.quickAnalysisContainer}>
                {quickAnalysis.map(renderQuickAnalysisCard)}
              </View>
            </ScrollView>
          </View>

          {/* Analysis Queue */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Analysis Queue</Text>
              <Chip compact>{filteredVideos.length} videos</Chip>
            </View>
            
            {isAnalyzing && (
              <Card style={styles.analyzingCard}>
                <Card.Content style={styles.analyzingContent}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.analyzingText}>Analyzing video...</Text>
                  <Text style={TEXT_STYLES.caption}>This may take a few moments</Text>
                </Card.Content>
              </Card>
            )}
            
            {filteredVideos.map(renderVideoCard)}
            
            {filteredVideos.length === 0 && !isAnalyzing && (
              <Card style={styles.emptyStateCard}>
                <Card.Content style={styles.emptyStateContent}>
                  <Icon name="video-library" size={48} color={COLORS.textSecondary} />
                  <Text style={styles.emptyStateText}>No videos found</Text>
                  <Text style={TEXT_STYLES.caption}>
                    Upload a video to get started with AI form analysis
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>
        </ScrollView>
      </Animated.View>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={handleVideoUpload}
        customSize={56}
      />

      {renderAnalysisModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerText: {
    flex: 1
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold'
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs
  },
  content: {
    flex: 1,
    marginTop: -SPACING.md,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  searchSection: {
    padding: SPACING.md,
    paddingTop: SPACING.lg
  },
  searchBar: {
    marginBottom: SPACING.md
  },
  filterChips: {
    flexDirection: 'row',
    gap: SPACING.sm
  },
  filterChip: {
    marginRight: SPACING.sm
  },
  section: {
    marginBottom: SPACING.lg
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md
  },
  quickAnalysisContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md
  },
  quickAnalysisCard: {
    width: width * 0.7,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden'
  },
  quickAnalysisGradient: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between'
  },
  quickAnalysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  quickAnalysisTitle: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: '600'
  },
  quickAnalysisSport: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)'
  },
  keyPointsContainer: {
    marginTop: SPACING.xs
  },
  keyPoint: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12
  },
  videoCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md
  },
  videoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  playerInfo: {
    marginLeft: SPACING.md,
    flex: 1
  },
  videoActions: {
    alignItems: 'flex-end'
  },
  statusChip: {
    borderWidth: 1
  },
  videoPreview: {
    flexDirection: 'row',
    padding: SPACING.md,
    paddingTop: 0,
    gap: SPACING.md
  },
  thumbnail: {
    width: 120,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.border,
    position: 'relative'
  },
  duration: {
    position: 'absolute',
    bottom: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10
  },
  analysisInfo: {
    flex: 1,
    justifyContent: 'space-between'
  },
  scoreContainer: {
    marginBottom: SPACING.sm
  },
  progressBar: {
    marginTop: SPACING.xs,
    height: 4
  },
  issuesContainer: {
    marginTop: SPACING.sm
  },
  issueChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.xs
  },
  issueChip: {
    backgroundColor: COLORS.error + '20'
  },
  analyzingCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md
  },
  analyzingContent: {
    alignItems: 'center',
    paddingVertical: SPACING.lg
  },
  analyzingText: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.md,
    fontWeight: '600'
  },
  emptyStateCard: {
    marginHorizontal: SPACING.md
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.md,
    fontWeight: '600'
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight + SPACING.sm,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.sm
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold'
  },
  modalContent: {
    flex: 1,
    padding: SPACING.md
  },
  scoreCard: {
    marginBottom: SPACING.md
  },
  scoreHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  scoreProgress: {
    height: 8,
    borderRadius: 4
  },
  keyFramesCard: {
    marginBottom: SPACING.md
  },
  keyFrame: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  frameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs
  },
  recommendationsCard: {
    marginBottom: SPACING.md
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  comparisonCard: {
    marginBottom: SPACING.xl
  },
  comparisonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm
  }
});

export default FormAnalysis;