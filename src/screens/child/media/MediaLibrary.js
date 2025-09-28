import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Alert,
  RefreshControl,
  Image,
  FlatList,
  Dimensions,
  Platform,
  Vibration,
  Modal,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
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
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Design System
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const { width, height } = Dimensions.get('window');

const MediaLibrary = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, theme } = useSelector(state => state.app);
  
  // Animation values
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;
  const scaleValue = useRef(new Animated.Value(0.9)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter options for children
  const filterOptions = [
    { id: 'all', name: 'All My Stuff', icon: 'folder', color: COLORS.primary, count: 24 },
    { id: 'videos', name: 'Training Videos', icon: 'videocam', color: '#E91E63', count: 12 },
    { id: 'photos', name: 'Progress Photos', icon: 'photo-camera', color: '#4CAF50', count: 8 },
    { id: 'achievements', name: 'Achievements', icon: 'jump-rope', color: '#FFD700', count: 4 },
    { id: 'favorites', name: 'My Favorites', icon: 'favorite', color: '#FF5722', count: 6 },
  ];

  // Sample media data for children
  const sampleMediaData = [
    {
      id: 1,
      type: 'video',
      title: 'Soccer Practice Day! ⚽',
      thumbnail: 'https://via.placeholder.com/300x200/667eea/white?text=Soccer+Practice',
      duration: 28,
      date: '2025-08-28',
      likes: 15,
      coachFeedback: 'Great improvement on your kicks! 🌟',
      tags: ['⚽ Soccer', '💪 Strong', '🎯 Goal'],
      status: 'approved',
      views: 23,
    },
    {
      id: 2,
      type: 'photo',
      title: 'New Personal Best! 🏃',
      thumbnail: 'https://via.placeholder.com/300x200/4CAF50/white?text=Running+Victory',
      date: '2025-08-27',
      likes: 22,
      coachFeedback: 'Wow! You\'re getting so fast! Keep it up! 🚀',
      tags: ['🏃 Running', '🏆 Victory', '💯 Perfect'],
      status: 'approved',
      achievement: 'Speed Demon',
    },
    {
      id: 3,
      type: 'video',
      title: 'Learning New Basketball Moves 🏀',
      thumbnail: 'https://via.placeholder.com/300x200/FF9800/white?text=Basketball+Skills',
      duration: 15,
      date: '2025-08-26',
      likes: 18,
      coachFeedback: 'Your dribbling is improving every day! 🏀',
      tags: ['🏀 Basketball', '🚀 Improving', '🌟 Awesome'],
      status: 'approved',
      views: 31,
    },
    {
      id: 4,
      type: 'achievement',
      title: 'Team Captain Badge! 👑',
      thumbnail: 'https://via.placeholder.com/300x200/FFD700/white?text=Captain+Badge',
      date: '2025-08-25',
      likes: 35,
      coachFeedback: 'So proud of your leadership! You inspire everyone! 👑',
      tags: ['👑 Champion', '👥 Team', '🌟 Awesome'],
      status: 'approved',
      achievement: 'Team Leader',
      points: 500,
    },
    {
      id: 5,
      type: 'photo',
      title: 'Swimming Progress 🏊',
      thumbnail: 'https://via.placeholder.com/300x200/03A9F4/white?text=Swimming+Fun',
      date: '2025-08-24',
      likes: 12,
      coachFeedback: 'Your stroke technique is getting better! 🏊‍♂️',
      tags: ['🏊 Swimming', '💪 Strong', '🚀 Improving'],
      status: 'pending',
    },
    {
      id: 6,
      type: 'video',
      title: 'Gymnastics Routine Practice 🤸',
      thumbnail: 'https://via.placeholder.com/300x200/9C27B0/white?text=Gymnastics',
      duration: 22,
      date: '2025-08-23',
      likes: 28,
      coachFeedback: 'Amazing balance and form! You\'re a star! ⭐',
      tags: ['🤸 Gymnastics', '🌟 Awesome', '💯 Perfect'],
      status: 'approved',
      views: 42,
    },
  ];

  useEffect(() => {
    // Initialize media data
    setMediaItems(sampleMediaData);
    setLoading(false);

    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const filteredMedia = mediaItems.filter(item => {
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'videos' && item.type === 'video') ||
                         (selectedFilter === 'photos' && item.type === 'photo') ||
                         (selectedFilter === 'achievements' && item.type === 'achievement') ||
                         (selectedFilter === 'favorites' && item.likes > 20);
    
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const handleMediaPress = (item) => {
    setSelectedMedia(item);
    setShowMediaModal(true);
    Vibration.vibrate(50);
  };

  const handleLike = (itemId) => {
    setMediaItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, likes: item.likes + 1 }
        : item
    ));
    Vibration.vibrate([50, 25, 50]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'rejected': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return '✅ Approved';
      case 'pending': return '⏳ Being Reviewed';
      case 'rejected': return '❌ Needs Changes';
      default: return 'Unknown';
    }
  };

  const renderFilterChip = (filter) => (
    <TouchableOpacity
      key={filter.id}
      onPress={() => {
        setSelectedFilter(filter.id);
        Vibration.vibrate(25);
      }}
      style={{ marginRight: SPACING.md }}
    >
      <Surface style={{
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: 20,
        backgroundColor: selectedFilter === filter.id ? filter.color : COLORS.white,
        elevation: selectedFilter === filter.id ? 4 : 2,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <Icon
          name={filter.icon}
          size={16}
          color={selectedFilter === filter.id ? COLORS.white : filter.color}
        />
        <Text style={[
          TEXT_STYLES.caption,
          {
            marginLeft: SPACING.xs,
            color: selectedFilter === filter.id ? COLORS.white : COLORS.text,
            fontWeight: '600',
          }
        ]}>
          {filter.name}
        </Text>
        <View style={{
          backgroundColor: selectedFilter === filter.id ? COLORS.white : filter.color,
          borderRadius: 10,
          minWidth: 20,
          height: 20,
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: SPACING.xs,
        }}>
          <Text style={{
            fontSize: 10,
            fontWeight: 'bold',
            color: selectedFilter === filter.id ? filter.color : COLORS.white,
          }}>
            {filter.count}
          </Text>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderMediaItem = ({ item }) => {
    const isGridView = viewMode === 'grid';
    const itemWidth = isGridView ? (width - 48) / 2 : width - 32;
    
    return (
      <TouchableOpacity
        onPress={() => handleMediaPress(item)}
        style={{
          width: itemWidth,
          marginRight: isGridView ? SPACING.md : 0,
          marginBottom: SPACING.md,
        }}
      >
        <Card style={{
          backgroundColor: COLORS.white,
          elevation: 3,
          borderRadius: 16,
        }}>
          <View>
            <Image
              source={{ uri: item.thumbnail }}
              style={{
                width: '100%',
                height: isGridView ? 120 : 160,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}
              resizeMode="cover"
            />
            
            {/* Status Badge */}
            <View style={{
              position: 'absolute',
              top: SPACING.sm,
              right: SPACING.sm,
              backgroundColor: getStatusColor(item.status),
              borderRadius: 12,
              paddingHorizontal: SPACING.sm,
              paddingVertical: 2,
            }}>
              <Text style={{
                fontSize: 10,
                color: COLORS.white,
                fontWeight: 'bold',
              }}>
                {getStatusText(item.status)}
              </Text>
            </View>

            {/* Video Duration */}
            {item.type === 'video' && (
              <View style={{
                position: 'absolute',
                bottom: SPACING.sm,
                right: SPACING.sm,
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderRadius: 8,
                paddingHorizontal: SPACING.sm,
                paddingVertical: 2,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Icon name="play-arrow" size={12} color={COLORS.white} />
                <Text style={{
                  fontSize: 10,
                  color: COLORS.white,
                  marginLeft: 2,
                }}>
                  {item.duration}s
                </Text>
              </View>
            )}

            {/* Achievement Badge */}
            {item.type === 'achievement' && (
              <View style={{
                position: 'absolute',
                top: SPACING.sm,
                left: SPACING.sm,
                backgroundColor: '#FFD700',
                borderRadius: 20,
                padding: SPACING.sm,
              }}>
                <Icon name="jump-rope" size={20} color={COLORS.white} />
              </View>
            )}
          </View>

          <Card.Content style={{ padding: SPACING.md }}>
            <Text style={[TEXT_STYLES.body, {
              fontWeight: '600',
              marginBottom: SPACING.xs,
              numberOfLines: 2,
            }]}>
              {item.title}
            </Text>
            
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: SPACING.sm,
            }}>
              <Text style={[TEXT_STYLES.caption]}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
              <TouchableOpacity
                onPress={() => handleLike(item.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: COLORS.background,
                  borderRadius: 12,
                  paddingHorizontal: SPACING.sm,
                  paddingVertical: 2,
                }}
              >
                <Icon name="favorite" size={14} color={COLORS.error} />
                <Text style={[TEXT_STYLES.caption, {
                  marginLeft: 4,
                  fontWeight: '600',
                }]}>
                  {item.likes}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tags */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {item.tags.slice(0, 2).map((tag, index) => (
                <Chip
                  key={index}
                  style={{
                    margin: 2,
                    backgroundColor: COLORS.background,
                    height: 24,
                  }}
                  textStyle={{ fontSize: 10 }}
                >
                  {tag}
                </Chip>
              ))}
              {item.tags.length > 2 && (
                <Chip
                  style={{
                    margin: 2,
                    backgroundColor: COLORS.primary,
                    height: 24,
                  }}
                  textStyle={{ fontSize: 10, color: COLORS.white }}
                >
                  +{item.tags.length - 2}
                </Chip>
              )}
            </View>

            {/* Coach Feedback Preview */}
            {item.coachFeedback && item.status === 'approved' && (
              <View style={{
                backgroundColor: COLORS.success + '20',
                borderRadius: 8,
                padding: SPACING.sm,
                marginTop: SPACING.sm,
              }}>
                <Text style={[TEXT_STYLES.caption, {
                  color: COLORS.success,
                  fontWeight: '600',
                  marginBottom: 2,
                }]}>
                  Coach Says:
                </Text>
                <Text style={[TEXT_STYLES.caption, {
                  color: COLORS.text,
                  fontStyle: 'italic',
                }]} numberOfLines={2}>
                  {item.coachFeedback}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderStatsCard = () => {
    const totalLikes = mediaItems.reduce((sum, item) => sum + item.likes, 0);
    const totalViews = mediaItems.reduce((sum, item) => sum + (item.views || 0), 0);
    const approvedCount = mediaItems.filter(item => item.status === 'approved').length;

    return (
      <Card style={{
        backgroundColor: COLORS.white,
        elevation: 3,
        marginBottom: SPACING.lg,
        borderRadius: 16,
      }}>
        <Card.Content style={{ padding: SPACING.md }}>
          <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.md }]}>
            My Awesome Stats! 📊
          </Text>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}>
            <View style={{ alignItems: 'center' }}>
              <Icon name="favorite" size={24} color={COLORS.error} />
              <Text style={[TEXT_STYLES.title, { color: COLORS.error }]}>
                {totalLikes}
              </Text>
              <Text style={[TEXT_STYLES.caption]}>Likes</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Icon name="visibility" size={24} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.title, { color: COLORS.primary }]}>
                {totalViews}
              </Text>
              <Text style={[TEXT_STYLES.caption]}>Views</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Icon name="check-circle" size={24} color={COLORS.success} />
              <Text style={[TEXT_STYLES.title, { color: COLORS.success }]}>
                {approvedCount}
              </Text>
              <Text style={[TEXT_STYLES.caption]}>Approved</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: Platform.OS === 'ios' ? 50 : 40,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: SPACING.md,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton
              icon="arrow-back"
              iconColor={COLORS.white}
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Text style={[TEXT_STYLES.title, { color: COLORS.white, marginLeft: SPACING.sm }]}>
              My Media Library 📚
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
              iconColor={COLORS.white}
              size={24}
              onPress={() => {
                setViewMode(viewMode === 'grid' ? 'list' : 'grid');
                Vibration.vibrate(50);
              }}
            />
            <IconButton
              icon="bar-chart"
              iconColor={COLORS.white}
              size={24}
              onPress={() => setShowStatsModal(true)}
            />
          </View>
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search my awesome content! 🔍"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 25,
            elevation: 3,
          }}
          inputStyle={{ color: COLORS.text }}
        />
      </LinearGradient>

      {/* Filters */}
      <View style={{
        paddingVertical: SPACING.md,
        paddingLeft: SPACING.md,
      }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
        >
          {filterOptions.map(renderFilterChip)}
        </ScrollView>
      </View>

      {/* Content */}
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
        <Animated.View
          style={{
            opacity: fadeIn,
            transform: [
              { translateY: slideUp },
              { scale: scaleValue }
            ],
            padding: SPACING.md,
          }}
        >
          {/* Stats Card */}
          {renderStatsCard()}

          {/* Media Grid/List */}
          {loading ? (
            <View style={{ alignItems: 'center', padding: SPACING.xl }}>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
                Loading your awesome content... 📱
              </Text>
            </View>
          ) : filteredMedia.length > 0 ? (
            <FlatList
              data={filteredMedia}
              renderItem={renderMediaItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={viewMode === 'grid' ? 2 : 1}
              scrollEnabled={false}
              key={viewMode} // Force re-render when view mode changes
              ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
            />
          ) : (
            <View style={{
              alignItems: 'center',
              padding: SPACING.xl,
            }}>
              <Icon name="photo-library" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.subtitle, {
                textAlign: 'center',
                marginTop: SPACING.md,
                color: COLORS.textSecondary,
              }]}>
                No content found! 📷
              </Text>
              <Text style={[TEXT_STYLES.body, {
                textAlign: 'center',
                marginTop: SPACING.sm,
                color: COLORS.textSecondary,
              }]}>
                Try creating some awesome content or changing your search!
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Media Detail Modal */}
      <Portal>
        <Modal
          visible={showMediaModal}
          animationType="slide"
          transparent={true}
        >
          <BlurView
            style={{ flex: 1 }}
            blurType="dark"
            blurAmount={10}
          >
            <View style={{
              flex: 1,
              justifyContent: 'center',
              padding: SPACING.lg,
            }}>
              {selectedMedia && (
                <Surface style={{
                  backgroundColor: COLORS.white,
                  borderRadius: 20,
                  maxHeight: height * 0.9,
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: SPACING.lg,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.border,
                  }}>
                    <Text style={[TEXT_STYLES.subtitle, { flex: 1 }]} numberOfLines={2}>
                      {selectedMedia.title}
                    </Text>
                    <IconButton
                      icon="close"
                      size={24}
                      onPress={() => setShowMediaModal(false)}
                    />
                  </View>
                  
                  <ScrollView style={{ maxHeight: height * 0.7 }}>
                    <View style={{ padding: SPACING.lg }}>
                      <Image
                        source={{ uri: selectedMedia.thumbnail }}
                        style={{
                          width: '100%',
                          height: 200,
                          borderRadius: 12,
                          marginBottom: SPACING.md,
                        }}
                        resizeMode="cover"
                      />
                      
                      {/* Status and Stats */}
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: SPACING.md,
                      }}>
                        <Chip
                          style={{
                            backgroundColor: getStatusColor(selectedMedia.status),
                          }}
                          textStyle={{ color: COLORS.white, fontWeight: 'bold' }}
                        >
                          {getStatusText(selectedMedia.status)}
                        </Chip>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Icon name="favorite" size={16} color={COLORS.error} />
                          <Text style={[TEXT_STYLES.caption, { marginLeft: 4, marginRight: SPACING.md }]}>
                            {selectedMedia.likes} likes
                          </Text>
                          {selectedMedia.views && (
                            <>
                              <Icon name="visibility" size={16} color={COLORS.primary} />
                              <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                                {selectedMedia.views} views
                              </Text>
                            </>
                          )}
                        </View>
                      </View>

                      {/* Achievement Info */}
                      {selectedMedia.achievement && (
                        <Card style={{
                          backgroundColor: '#FFD700' + '20',
                          marginBottom: SPACING.md,
                        }}>
                          <Card.Content style={{ padding: SPACING.md }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Icon name="jump-rope" size={24} color="#FFD700" />
                              <View style={{ marginLeft: SPACING.md, flex: 1 }}>
                                <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                                  Achievement Unlocked!
                                </Text>
                                <Text style={[TEXT_STYLES.caption]}>
                                  {selectedMedia.achievement}
                                </Text>
                                {selectedMedia.points && (
                                  <Text style={[TEXT_STYLES.caption, { color: '#FFD700', fontWeight: 'bold' }]}>
                                    +{selectedMedia.points} points! 🎉
                                  </Text>
                                )}
                              </View>
                            </View>
                          </Card.Content>
                        </Card>
                      )}

                      {/* Tags */}
                      <View style={{ marginBottom: SPACING.md }}>
                        <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
                          Tags 🏷️
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                          {selectedMedia.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              style={{
                                margin: 2,
                                backgroundColor: COLORS.primary,
                              }}
                              textStyle={{ color: COLORS.white, fontSize: 12 }}
                            >
                              {tag}
                            </Chip>
                          ))}
                        </View>
                      </View>

                      {/* Coach Feedback */}
                      {selectedMedia.coachFeedback && selectedMedia.status === 'approved' && (
                        <Card style={{
                          backgroundColor: COLORS.success + '20',
                          marginBottom: SPACING.md,
                        }}>
                          <Card.Content style={{ padding: SPACING.md }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                              <Icon name="person" size={24} color={COLORS.success} />
                              <View style={{ marginLeft: SPACING.md, flex: 1 }}>
                                <Text style={[TEXT_STYLES.body, {
                                  fontWeight: 'bold',
                                  color: COLORS.success,
                                  marginBottom: SPACING.xs,
                                }]}>
                                  Coach's Feedback 👨‍🏫
                                </Text>
                                <Text style={[TEXT_STYLES.body]}>
                                  {selectedMedia.coachFeedback}
                                </Text>
                              </View>
                            </View>
                          </Card.Content>
                        </Card>
                      )}

                      <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.md }]}>
                        Created on {new Date(selectedMedia.date).toLocaleDateString()} 📅
                      </Text>

                      {/* Action Buttons */}
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        marginTop: SPACING.lg,
                      }}>
                        <Button
                          mode="outlined"
                          onPress={() => handleLike(selectedMedia.id)}
                          style={{
                            borderColor: COLORS.error,
                            flex: 1,
                            marginRight: SPACING.sm,
                          }}
                          labelStyle={{ color: COLORS.error }}
                          icon="favorite"
                        >
                          Like! ❤️
                        </Button>
                        <Button
                          mode="contained"
                          onPress={() => {
                            Alert.alert(
                              '📤 Share Coming Soon!',
                              'Ask a grown-up to help you share this awesome content!',
                              [{ text: 'OK', style: 'default' }]
                            );
                          }}
                          style={{
                            backgroundColor: COLORS.primary,
                            flex: 1,
                            marginLeft: SPACING.sm,
                          }}
                          icon="share"
                        >
                          Share! 🚀
                        </Button>
                      </View>
                    </View>
                  </ScrollView>
                </Surface>
              )}
            </View>
          </BlurView>
        </Modal>

        {/* Stats Modal */}
        <Modal
          visible={showStatsModal}
          animationType="slide"
          transparent={true}
        >
          <BlurView
            style={{ flex: 1 }}
            blurType="dark"
            blurAmount={10}
          >
            <View style={{
              flex: 1,
              justifyContent: 'center',
              padding: SPACING.lg,
            }}>
              <Surface style={{
                backgroundColor: COLORS.white,
                borderRadius: 20,
                maxHeight: height * 0.8,
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: SPACING.lg,
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.border,
                }}>
                  <Text style={TEXT_STYLES.title}>
                    My Amazing Journey! 📊
                  </Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setShowStatsModal(false)}
                  />
                </View>
                
                <ScrollView style={{ maxHeight: height * 0.6, padding: SPACING.lg }}>
                  {/* Overall Stats */}
                  <Card style={{
                    backgroundColor: COLORS.primary + '20',
                    marginBottom: SPACING.lg,
                  }}>
                    <Card.Content style={{ padding: SPACING.lg }}>
                      <Text style={[TEXT_STYLES.subtitle, { 
                        textAlign: 'center', 
                        marginBottom: SPACING.md,
                        color: COLORS.primary,
                      }]}>
                        Total Impact 🌟
                      </Text>
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                      }}>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={[TEXT_STYLES.title, { 
                            fontSize: 32, 
                            color: COLORS.error,
                            fontWeight: 'bold',
                          }]}>
                            {mediaItems.reduce((sum, item) => sum + item.likes, 0)}
                          </Text>
                          <Text style={[TEXT_STYLES.body, { color: COLORS.error }]}>
                            Total Likes ❤️
                          </Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={[TEXT_STYLES.title, { 
                            fontSize: 32, 
                            color: COLORS.success,
                            fontWeight: 'bold',
                          }]}>
                            {mediaItems.filter(item => item.status === 'approved').length}
                          </Text>
                          <Text style={[TEXT_STYLES.body, { color: COLORS.success }]}>
                            Approved ✅
                          </Text>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>

                  {/* Content Breakdown */}
                  <Card style={{ marginBottom: SPACING.lg }}>
                    <Card.Content style={{ padding: SPACING.lg }}>
                      <Text style={[TEXT_STYLES.subtitle, { 
                        marginBottom: SPACING.md,
                        textAlign: 'center',
                      }]}>
                        My Content Mix 📱
                      </Text>
                      
                      {/* Videos */}
                      <View style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: SPACING.md,
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Icon name="videocam" size={20} color="#E91E63" />
                          <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                            Training Videos
                          </Text>
                        </View>
                        <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: "#E91E63" }]}>
                          {mediaItems.filter(item => item.type === 'video').length}
                        </Text>
                      </View>
                      <ProgressBar 
                        progress={mediaItems.filter(item => item.type === 'video').length / mediaItems.length} 
                        color="#E91E63"
                        style={{ marginBottom: SPACING.md, height: 8, borderRadius: 4 }}
                      />

                      {/* Photos */}
                      <View style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: SPACING.md,
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Icon name="photo-camera" size={20} color={COLORS.success} />
                          <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                            Progress Photos
                          </Text>
                        </View>
                        <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: COLORS.success }]}>
                          {mediaItems.filter(item => item.type === 'photo').length}
                        </Text>
                      </View>
                      <ProgressBar 
                        progress={mediaItems.filter(item => item.type === 'photo').length / mediaItems.length} 
                        color={COLORS.success}
                        style={{ marginBottom: SPACING.md, height: 8, borderRadius: 4 }}
                      />

                      {/* Achievements */}
                      <View style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: SPACING.md,
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Icon name="jump-rope" size={20} color="#FFD700" />
                          <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                            Achievements
                          </Text>
                        </View>
                        <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: "#FFD700" }]}>
                          {mediaItems.filter(item => item.type === 'achievement').length}
                        </Text>
                      </View>
                      <ProgressBar 
                        progress={mediaItems.filter(item => item.type === 'achievement').length / mediaItems.length} 
                        color="#FFD700"
                        style={{ height: 8, borderRadius: 4 }}
                      />
                    </Card.Content>
                  </Card>

                  {/* Top Performing Content */}
                  <Card style={{ marginBottom: SPACING.lg }}>
                    <Card.Content style={{ padding: SPACING.lg }}>
                      <Text style={[TEXT_STYLES.subtitle, { 
                        marginBottom: SPACING.md,
                        textAlign: 'center',
                      }]}>
                        My Most Popular! 🔥
                      </Text>
                      
                      {mediaItems
                        .filter(item => item.status === 'approved')
                        .sort((a, b) => b.likes - a.likes)
                        .slice(0, 3)
                        .map((item, index) => (
                        <View key={item.id} style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: SPACING.md,
                          backgroundColor: index === 0 ? '#FFD700' + '20' : COLORS.background,
                          borderRadius: 12,
                          padding: SPACING.sm,
                        }}>
                          <View style={{
                            backgroundColor: index === 0 ? '#FFD700' : 
                                           index === 1 ? '#C0C0C0' : '#CD7F32',
                            borderRadius: 15,
                            width: 30,
                            height: 30,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: SPACING.md,
                          }}>
                            <Text style={{
                              color: COLORS.white,
                              fontWeight: 'bold',
                              fontSize: 16,
                            }}>
                              {index + 1}
                            </Text>
                          </View>
                          
                          <Image
                            source={{ uri: item.thumbnail }}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 8,
                              marginRight: SPACING.md,
                            }}
                          />
                          
                          <View style={{ flex: 1 }}>
                            <Text style={[TEXT_STYLES.body, { 
                              fontWeight: '600',
                              fontSize: 14,
                            }]} numberOfLines={1}>
                              {item.title}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Icon name="favorite" size={12} color={COLORS.error} />
                              <Text style={[TEXT_STYLES.caption, { 
                                marginLeft: 4,
                                fontWeight: 'bold',
                              }]}>
                                {item.likes} likes
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </Card.Content>
                  </Card>

                  {/* Motivational Message */}
                  <Card style={{
                    backgroundColor: COLORS.success + '20',
                  }}>
                    <Card.Content style={{ padding: SPACING.lg, alignItems: 'center' }}>
                      <Icon name="jump-rope" size={48} color={COLORS.success} />
                      <Text style={[TEXT_STYLES.subtitle, { 
                        textAlign: 'center',
                        marginTop: SPACING.md,
                        color: COLORS.success,
                      }]}>
                        You're Amazing! 🌟
                      </Text>
                      <Text style={[TEXT_STYLES.body, { 
                        textAlign: 'center',
                        marginTop: SPACING.sm,
                      }]}>
                        Keep creating awesome content and showing your progress! 
                        Your coach and family are so proud of you! 💪
                      </Text>
                    </Card.Content>
                  </Card>
                </ScrollView>
              </Surface>
            </View>
          </BlurView>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        label="Create!"
        style={{
          position: 'absolute',
          right: SPACING.md,
          bottom: SPACING.md,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => {
          Alert.alert(
            '🎨 Create Something New!',
            'What awesome content do you want to create today?',
            [
              { text: 'Maybe Later', style: 'cancel' },
              { 
                text: 'Let\'s Go!', 
                style: 'default',
                onPress: () => navigation.navigate('ContentCreation')
              }
            ]
          );
        }}
      />
    </View>
  );
};

export default MediaLibrary;