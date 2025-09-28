import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
  StatusBar,
  Animated,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Text,
  Portal,
  Modal,
  Slider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system imports
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const VideoAnalysis = ({ navigation }) => {
  const dispatch = useDispatch();
  
  // Redux state with fallback values
  const { user, isOnline } = useSelector(state => state.auth || {});
  const { loading, error } = useSelector(state => state.training || {});

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('timeline'); // 'timeline', 'comparison', 'breakdown'
  const [showAnalysisTools, setShowAnalysisTools] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [annotationMode, setAnnotationMode] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);

  // Sample video analysis data - moved to state
  const [analysisVideos, setAnalysisVideos] = useState([
    {
      id: '1',
      title: 'Match Performance - Week 5',
      player: 'Marcus Johnson',
      playerAvatar: 'https://i.pravatar.cc/150?img=1',
      date: '2024-03-15',
      duration: '02:45',
      sport: 'football',
      category: 'match',
      thumbnail: 'https://via.placeholder.com/300x200/667eea/white?text=Match+Analysis',
      analysisPoints: [
        { time: '00:15', type: 'positive', note: 'Excellent ball control', category: 'technique' },
        { time: '01:23', type: 'improvement', note: 'Could improve positioning', category: 'tactical' },
        { time: '02:10', type: 'positive', note: 'Great decision making', category: 'mental' },
      ],
      metrics: {
        technique: 8.5,
        tactical: 7.2,
        physical: 8.8,
        mental: 9.1,
      },
      tags: ['dribbling', 'passing', 'positioning'],
      status: 'analyzed',
      coachNotes: 'Great improvement in ball control since last session.',
    },
    {
      id: '2',
      title: 'Drill Practice - Speed Training',
      player: 'Sarah Williams',
      playerAvatar: 'https://i.pravatar.cc/150?img=2',
      date: '2024-03-14',
      duration: '01:30',
      sport: 'basketball',
      category: 'training',
      thumbnail: 'https://via.placeholder.com/300x200/764ba2/white?text=Speed+Training',
      analysisPoints: [
        { time: '00:30', type: 'positive', note: 'Explosive start', category: 'physical' },
        { time: '01:15', type: 'improvement', note: 'Maintain form in final sprint', category: 'technique' },
      ],
      metrics: {
        technique: 7.8,
        tactical: 8.0,
        physical: 9.2,
        mental: 8.5,
      },
      tags: ['speed', 'agility', 'form'],
      status: 'pending',
      coachNotes: 'Focus on maintaining technique under fatigue.',
    },
    {
      id: '3',
      title: 'Team Formation Analysis',
      player: 'Team Alpha',
      playerAvatar: null,
      date: '2024-03-13',
      duration: '05:20',
      sport: 'soccer',
      category: 'tactical',
      thumbnail: 'https://via.placeholder.com/300x200/4CAF50/white?text=Formation+Analysis',
      analysisPoints: [
        { time: '00:45', type: 'improvement', note: 'Defensive gaps in transition', category: 'tactical' },
        { time: '02:30', type: 'positive', note: 'Excellent pressing coordination', category: 'tactical' },
        { time: '04:15', type: 'improvement', note: 'Width in attack needed', category: 'tactical' },
      ],
      metrics: {
        technique: 8.0,
        tactical: 7.5,
        physical: 8.3,
        mental: 8.7,
      },
      tags: ['formation', 'pressing', 'transition'],
      status: 'analyzed',
      coachNotes: 'Work on maintaining shape during transitions.',
    },
  ]);

  const categories = [
    { key: 'all', label: 'All Videos', icon: 'video-library' },
    { key: 'match', label: 'Match', icon: 'sports' },
    { key: 'training', label: 'Training', icon: 'fitness-center' },
    { key: 'tactical', label: 'Tactical', icon: 'strategy' },
    { key: 'individual', label: 'Individual', icon: 'person' },
  ];

  const analysisTypes = {
    positive: { color: COLORS?.success || '#4CAF50', icon: 'thumb-up' },
    improvement: { color: '#FF9800', icon: 'trending-up' },
    critical: { color: COLORS?.error || '#F44336', icon: 'priority-high' },
  };

  // Animation setup with error handling
  useEffect(() => {
    try {
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
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.warn('Animation error:', error);
    }
  }, [fadeAnim, slideAnim, scaleAnim]);

  // Refresh handler with proper error handling
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // If using Redux, uncomment this:
      // await dispatch(fetchAnalysisVideos());
      
      console.log('Video analysis data refreshed successfully');
    } catch (error) {
      console.error('Refresh error:', error);
      Alert.alert('Error', 'Failed to refresh video analysis data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter videos with null checks
  const filteredVideos = analysisVideos.filter(video => {
    if (!video) return false;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (video.title && video.title.toLowerCase().includes(searchLower)) ||
      (video.player && video.player.toLowerCase().includes(searchLower)) ||
      (video.tags && video.tags.some(tag => tag && tag.toLowerCase().includes(searchLower)));
    
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleVideoSelect = useCallback((video) => {
    if (!video) return;
    setSelectedVideo(video);
    setShowAnalysisTools(true);
  }, []);

  const handleUploadVideo = useCallback(() => {
    Alert.alert(
      'Feature Coming Soon', 
      'Video upload functionality will be available in the next update! 🎥',
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  const handleAIAnalysis = useCallback((video) => {
    if (!video) return;
    
    Alert.alert(
      'AI Analysis',
      `Start AI-powered analysis for "${video.title}"? This may take a few minutes.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Analysis', onPress: () => startAIAnalysis(video) },
      ]
    );
  }, []);

  const startAIAnalysis = useCallback((video) => {
    Alert.alert(
      'Feature Coming Soon', 
      'AI-powered video analysis will be available in the next update! 🤖'
    );
  }, []);

  const handleAddAnnotation = useCallback(() => {
    const newAnnotation = {
      id: Date.now().toString(),
      timestamp: currentTimestamp,
      type: 'improvement',
      note: 'New annotation',
      category: 'technique',
    };
    setAnnotations(prev => [...prev, newAnnotation]);
  }, [currentTimestamp]);

  const renderVideoCard = ({ item: video, index }) => {
    if (!video) return null;

    const statusColors = {
      analyzed: COLORS?.success || '#4CAF50',
      pending: '#FF9800',
      uploaded: COLORS?.primary || '#2196F3',
    };

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          marginBottom: SPACING?.md || 16,
        }}
      >
        <TouchableOpacity
          onPress={() => handleVideoSelect(video)}
          activeOpacity={0.8}
        >
          <Card style={{
            marginHorizontal: SPACING?.sm || 8,
            elevation: 6,
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {/* Video Thumbnail */}
            <View style={{ position: 'relative' }}>
              <Surface style={{
                height: 180,
                backgroundColor: COLORS?.surface || '#FAFAFA',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Icon name="play-circle-outline" size={64} color={COLORS?.primary || '#2196F3'} />
                <Text style={[
                  TEXT_STYLES?.caption || { fontSize: 12 },
                  { 
                    position: 'absolute', 
                    bottom: 10, 
                    right: 10, 
                    backgroundColor: 'rgba(0,0,0,0.7)', 
                    color: 'white', 
                    padding: 4, 
                    borderRadius: 4 
                  }
                ]}>
                  {video.duration}
                </Text>
              </Surface>
              
              {/* Status Badge */}
              <Chip
                mode="flat"
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  backgroundColor: statusColors[video.status] || statusColors.uploaded,
                  height: 28,
                }}
                textStyle={{ color: 'white', fontSize: 12 }}
              >
                {video.status ? video.status.charAt(0).toUpperCase() + video.status.slice(1) : 'Unknown'}
              </Chip>
            </View>

            <Card.Content style={{ padding: SPACING?.md || 16 }}>
              {/* Header */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                marginBottom: SPACING?.sm || 8 
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES?.h4 || { fontSize: 18, fontWeight: 'bold' }, { marginBottom: 4 }]}>
                    {video.title || 'Untitled Video'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {video.playerAvatar && (
                      <Avatar.Image
                        size={24}
                        source={{ uri: video.playerAvatar }}
                        style={{ marginRight: SPACING?.xs || 4 }}
                      />
                    )}
                    <Text style={[
                      TEXT_STYLES?.body2 || { fontSize: 14 }, 
                      { color: COLORS?.textSecondary || '#666' }
                    ]}>
                      {video.player || 'Unknown Player'} • {video.date || 'No date'}
                    </Text>
                  </View>
                </View>
                <IconButton
                  icon="smart-toy"
                  size={20}
                  iconColor={COLORS?.primary || '#2196F3'}
                  onPress={() => handleAIAnalysis(video)}
                />
              </View>

              {/* Metrics */}
              {video.metrics && (
                <View style={{ marginBottom: SPACING?.md || 16 }}>
                  <Text style={[
                    TEXT_STYLES?.subtitle2 || { fontSize: 14, fontWeight: '600' }, 
                    { marginBottom: SPACING?.sm || 8 }
                  ]}>
                    Performance Metrics
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {Object.entries(video.metrics).map(([key, value]) => (
                      <View key={key} style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={[
                          TEXT_STYLES?.caption || { fontSize: 12 }, 
                          { color: COLORS?.textSecondary || '#666' }
                        ]}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Text>
                        <Text style={[
                          TEXT_STYLES?.h4 || { fontSize: 18, fontWeight: 'bold' }, 
                          { 
                            color: value >= 8 
                              ? (COLORS?.success || '#4CAF50') 
                              : value >= 7 
                                ? '#FF9800' 
                                : (COLORS?.error || '#F44336')
                          }
                        ]}>
                          {value}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Analysis Points */}
              {video.analysisPoints && video.analysisPoints.length > 0 && (
                <View style={{ marginBottom: SPACING?.md || 16 }}>
                  <Text style={[
                    TEXT_STYLES?.subtitle2 || { fontSize: 14, fontWeight: '600' }, 
                    { marginBottom: SPACING?.sm || 8 }
                  ]}>
                    Key Points ({video.analysisPoints.length})
                  </Text>
                  {video.analysisPoints.slice(0, 2).map((point, pointIndex) => (
                    <View key={pointIndex} style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: SPACING?.xs || 4,
                      padding: SPACING?.xs || 4,
                      backgroundColor: `${analysisTypes[point.type]?.color || '#666'}10`,
                      borderRadius: 8,
                    }}>
                      <Icon
                        name={analysisTypes[point.type]?.icon || 'info'}
                        size={16}
                        color={analysisTypes[point.type]?.color || '#666'}
                        style={{ marginRight: SPACING?.xs || 4 }}
                      />
                      <Text style={[
                        TEXT_STYLES?.caption || { fontSize: 12 }, 
                        { flex: 1, color: COLORS?.textPrimary || '#000' }
                      ]}>
                        {point.time} - {point.note}
                      </Text>
                    </View>
                  ))}
                  {video.analysisPoints.length > 2 && (
                    <Text style={[
                      TEXT_STYLES?.caption || { fontSize: 12 }, 
                      { color: COLORS?.primary || '#2196F3', textAlign: 'center' }
                    ]}>
                      +{video.analysisPoints.length - 2} more points
                    </Text>
                  )}
                </View>
              )}

              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <View style={{ 
                  flexDirection: 'row', 
                  flexWrap: 'wrap', 
                  marginBottom: SPACING?.sm || 8 
                }}>
                  {video.tags.map((tag, tagIndex) => (
                    <Chip
                      key={tagIndex}
                      mode="outlined"
                      compact
                      style={{
                        marginRight: SPACING?.xs || 4,
                        marginBottom: SPACING?.xs || 4,
                        height: 24,
                      }}
                      textStyle={{ fontSize: 10 }}
                    >
                      {tag}
                    </Chip>
                  ))}
                </View>
              )}

              {/* Coach Notes */}
              {video.coachNotes && (
                <View style={{
                  backgroundColor: `${COLORS?.primary || '#2196F3'}10`,
                  padding: SPACING?.sm || 8,
                  borderRadius: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: COLORS?.primary || '#2196F3',
                }}>
                  <Text style={[
                    TEXT_STYLES?.caption || { fontSize: 12 }, 
                    { color: COLORS?.textPrimary || '#000', fontStyle: 'italic' }
                  ]}>
                    💭 {video.coachNotes}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCategoryChip = ({ item: category }) => (
    <Chip
      mode={selectedCategory === category.key ? 'flat' : 'outlined'}
      selected={selectedCategory === category.key}
      onPress={() => setSelectedCategory(category.key)}
      icon={category.icon}
      style={{
        marginRight: SPACING?.sm || 8,
        backgroundColor: selectedCategory === category.key 
          ? (COLORS?.primary || '#2196F3') 
          : 'transparent',
      }}
      textStyle={{
        color: selectedCategory === category.key 
          ? 'white' 
          : (COLORS?.textPrimary || '#000'),
      }}
    >
      {category.label}
    </Chip>
  );

  const renderAnalysisTools = () => (
    <Portal>
      <Modal
        visible={showAnalysisTools}
        onDismiss={() => setShowAnalysisTools(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING?.md || 16,
          borderRadius: 16,
          height: screenHeight * 0.8,
        }}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{
            padding: SPACING?.md || 16,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[TEXT_STYLES?.h3 || { fontSize: 20, fontWeight: 'bold' }, { color: 'white' }]}>
              Video Analysis
            </Text>
            <IconButton
              icon="close"
              iconColor="white"
              size={24}
              onPress={() => setShowAnalysisTools(false)}
            />
          </View>
          {selectedVideo && (
            <Text style={[
              TEXT_STYLES?.body2 || { fontSize: 14 }, 
              { color: 'rgba(255,255,255,0.8)' }
            ]}>
              {selectedVideo.title}
            </Text>
          )}
        </LinearGradient>

        <ScrollView style={{ flex: 1, padding: SPACING?.md || 16 }}>
          {/* Video Player Placeholder */}
          <Surface style={{
            height: 200,
            borderRadius: 12,
            marginBottom: SPACING?.md || 16,
            backgroundColor: '#000',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Icon name="play-circle-outline" size={80} color="white" />
          </Surface>

          {/* Analysis Mode Toggle */}
          <View style={{ flexDirection: 'row', marginBottom: SPACING?.md || 16 }}>
            {['timeline', 'comparison', 'breakdown'].map((mode) => (
              <Button
                key={mode}
                mode={analysisMode === mode ? 'contained' : 'outlined'}
                onPress={() => setAnalysisMode(mode)}
                style={{ flex: 1, marginHorizontal: 2 }}
                compact
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </View>

          {/* Playback Controls */}
          <Card style={{ marginBottom: SPACING?.md || 16 }}>
            <Card.Content>
              <Text style={[
                TEXT_STYLES?.subtitle1 || { fontSize: 16, fontWeight: '600' }, 
                { marginBottom: SPACING?.sm || 8 }
              ]}>
                Playback Controls
              </Text>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginBottom: SPACING?.sm || 8 
              }}>
                <Text style={TEXT_STYLES?.body2 || { fontSize: 14 }}>
                  Speed: {playbackSpeed.toFixed(2)}x
                </Text>
              </View>
              <Slider
                value={playbackSpeed}
                onValueChange={setPlaybackSpeed}
                minimumValue={0.25}
                maximumValue={2.0}
                step={0.25}
                thumbColor={COLORS?.primary || '#2196F3'}
                minimumTrackTintColor={COLORS?.primary || '#2196F3'}
              />
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-around', 
                marginTop: SPACING?.sm || 8 
              }}>
                <IconButton icon="skip-previous" iconColor={COLORS?.primary || '#2196F3'} />
                <IconButton icon="pause" iconColor={COLORS?.primary || '#2196F3'} />
                <IconButton icon="skip-next" iconColor={COLORS?.primary || '#2196F3'} />
                <IconButton 
                  icon={annotationMode ? "edit-off" : "edit"}
                  iconColor={annotationMode 
                    ? (COLORS?.error || '#F44336') 
                    : (COLORS?.primary || '#2196F3')
                  }
                  onPress={() => setAnnotationMode(!annotationMode)}
                />
              </View>
            </Card.Content>
          </Card>

          {/* Analysis Points */}
          {selectedVideo?.analysisPoints && selectedVideo.analysisPoints.length > 0 && (
            <Card style={{ marginBottom: SPACING?.md || 16 }}>
              <Card.Content>
                <Text style={[
                  TEXT_STYLES?.subtitle1 || { fontSize: 16, fontWeight: '600' }, 
                  { marginBottom: SPACING?.sm || 8 }
                ]}>
                  Analysis Points
                </Text>
                {selectedVideo.analysisPoints.map((point, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: SPACING?.sm || 8,
                      backgroundColor: `${analysisTypes[point.type]?.color || '#666'}10`,
                      borderRadius: 8,
                      marginBottom: SPACING?.xs || 4,
                    }}
                  >
                    <Icon
                      name={analysisTypes[point.type]?.icon || 'info'}
                      size={20}
                      color={analysisTypes[point.type]?.color || '#666'}
                      style={{ marginRight: SPACING?.sm || 8 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[
                        TEXT_STYLES?.body2 || { fontSize: 14 }, 
                        { fontWeight: 'bold' }
                      ]}>
                        {point.time} - {point.category}
                      </Text>
                      <Text style={[
                        TEXT_STYLES?.body2 || { fontSize: 14 }, 
                        { color: COLORS?.textSecondary || '#666' }
                      ]}>
                        {point.note}
                      </Text>
                    </View>
                    <IconButton
                      icon="edit"
                      size={16}
                      iconColor={COLORS?.textSecondary || '#666'}
                    />
                  </TouchableOpacity>
                ))}
                
                <Button
                  mode="outlined"
                  onPress={handleAddAnnotation}
                  style={{ marginTop: SPACING?.sm || 8 }}
                  icon="add"
                >
                  Add Annotation
                </Button>
              </Card.Content>
            </Card>
          )}

          {/* AI Insights */}
          <Card>
            <Card.Content>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginBottom: SPACING?.sm || 8 
              }}>
                <Icon name="smart-toy" size={24} color={COLORS?.primary || '#2196F3'} />
                <Text style={[
                  TEXT_STYLES?.subtitle1 || { fontSize: 16, fontWeight: '600' }, 
                  { marginLeft: SPACING?.sm || 8 }
                ]}>
                  AI Insights
                </Text>
              </View>
              <Text style={[
                TEXT_STYLES?.body2 || { fontSize: 14 }, 
                { 
                  color: COLORS?.textSecondary || '#666', 
                  marginBottom: SPACING?.sm || 8 
                }
              ]}>
                Based on video analysis, here are the key recommendations:
              </Text>
              <View style={{ marginLeft: SPACING?.md || 16 }}>
                <Text style={[
                  TEXT_STYLES?.body2 || { fontSize: 14 }, 
                  { marginBottom: SPACING?.xs || 4 }
                ]}>
                  • Focus on maintaining ball control under pressure
                </Text>
                <Text style={[
                  TEXT_STYLES?.body2 || { fontSize: 14 }, 
                  { marginBottom: SPACING?.xs || 4 }
                ]}>
                  • Improve positional awareness in defensive third
                </Text>
                <Text style={[
                  TEXT_STYLES?.body2 || { fontSize: 14 }, 
                  { marginBottom: SPACING?.xs || 4 }
                ]}>
                  • Excellent decision making in final third
                </Text>
              </View>
              <Button
                mode="contained"
                onPress={() => Alert.alert(
                  'Feature Coming Soon', 
                  'Advanced AI insights will be available in the next update! 🤖'
                )}
                style={{ marginTop: SPACING?.sm || 8 }}
                icon="auto-awesome"
              >
                Generate Full Report
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS?.background || '#FAFAFA' }}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={COLORS?.primary || '#2196F3'} 
        translucent 
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: (StatusBar.currentHeight || 0) + (SPACING?.md || 16),
          paddingBottom: SPACING?.lg || 24,
          paddingHorizontal: SPACING?.md || 16,
        }}
      >
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: SPACING?.md || 16 
        }}>
          <Text style={[TEXT_STYLES?.h2 || { fontSize: 24, fontWeight: 'bold' }, { color: 'white' }]}>
            Video Analysis 🎥
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon="cloud-upload"
              iconColor="white"
              size={24}
              onPress={handleUploadVideo}
            />
            <IconButton
              icon="analytics"
              iconColor="white"
              size={24}
              onPress={() => Alert.alert(
                'Feature Coming Soon', 
                'Analytics dashboard will be available in the next update! 📊'
              )}
            />
          </View>
        </View>

        <Searchbar
          placeholder="Search videos, players, or analysis points..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            elevation: 0,
          }}
          iconColor={COLORS?.primary || '#2196F3'}
          inputStyle={{ color: COLORS?.textPrimary || '#000' }}
        />
      </LinearGradient>

      {/* Category Filter */}
      <View style={{ paddingVertical: SPACING?.md || 16 }}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING?.md || 16 }}
          renderItem={renderCategoryChip}
          keyExtractor={item => item.key}
        />
      </View>

      {/* Videos List */}
      <FlatList
        data={filteredVideos}
        renderItem={renderVideoCard}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS?.primary || '#2196F3']}
            tintColor={COLORS?.primary || '#2196F3'}
          />
        }
        ListEmptyComponent={
          <View style={{ padding: SPACING?.xl || 32, alignItems: 'center' }}>
            <Icon name="video-library" size={64} color={COLORS?.textSecondary || '#666'} />
            <Text style={[
              TEXT_STYLES?.h3 || { fontSize: 20, fontWeight: 'bold' }, 
              { 
                marginTop: SPACING?.md || 16, 
                color: COLORS?.textSecondary || '#666' 
              }
            ]}>
              No videos found
            </Text>
            <Text style={[
              TEXT_STYLES?.body2 || { fontSize: 14 }, 
              { 
                marginTop: SPACING?.sm || 8, 
                color: COLORS?.textSecondary || '#666', 
                textAlign: 'center' 
              }
            ]}>
              Upload your first video to start analyzing player performance
            </Text>
            <Button
              mode="contained"
              onPress={handleUploadVideo}
              style={{ marginTop: SPACING?.md || 16 }}
              icon="cloud-upload"
            >
              Upload Video
            </Button>
          </View>
        }
      />

      {/* Floating Action Button */}
      <FAB
        icon="videocam"
        style={{
          position: 'absolute',
          margin: SPACING?.md || 16,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS?.primary || '#2196F3',
        }}
        onPress={handleUploadVideo}
        label="Record"
      />

      {/* Analysis Tools Modal */}
      {renderAnalysisTools()}
    </View>
  );
};

export default VideoAnalysis;