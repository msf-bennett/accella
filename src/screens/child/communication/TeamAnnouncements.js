import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Vibration,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Avatar,
  IconButton,
  Searchbar,
  FAB,
  Surface,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const TeamAnnouncements = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { announcements, unreadCount } = useSelector(state => state.communication);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadAnnouncements();
    animateEntrance();
  }, []);

  const animateEntrance = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const loadAnnouncements = useCallback(async () => {
    try {
      // Simulate API call - replace with actual implementation
      const mockAnnouncements = [
        {
          id: '1',
          title: 'Practice Schedule Update 📅',
          content: 'Hey team! Our Friday practice has been moved to 4:00 PM due to field maintenance. Don\'t forget to bring your water bottles! 💪',
          author: 'Coach Sarah',
          authorAvatar: 'https://example.com/coach-avatar.jpg',
          timestamp: '2 hours ago',
          priority: 'high',
          category: 'schedule',
          isRead: false,
          reactions: { thumbsUp: 12, heart: 8 },
          hasAttachment: false,
        },
        {
          id: '2',
          title: 'Great Job at Last Game! 🏆',
          content: 'I\'m so proud of everyone\'s performance yesterday! Special shoutout to our defense for keeping a clean sheet. Pizza party this Saturday at 2 PM! 🍕',
          author: 'Coach Mike',
          authorAvatar: 'https://example.com/coach-mike.jpg',
          timestamp: '1 day ago',
          priority: 'normal',
          category: 'celebration',
          isRead: true,
          reactions: { thumbsUp: 23, heart: 15, celebration: 10 },
          hasAttachment: true,
        },
        {
          id: '3',
          title: 'Equipment Check Reminder 🥅',
          content: 'Parents and players, please make sure all equipment is in good condition before next week\'s tournament. Check your cleats, shin guards, and jerseys!',
          author: 'Team Manager',
          authorAvatar: 'https://example.com/manager-avatar.jpg',
          timestamp: '3 days ago',
          priority: 'normal',
          category: 'equipment',
          isRead: true,
          reactions: { thumbsUp: 8 },
          hasAttachment: false,
        },
        {
          id: '4',
          title: 'New Training Drills This Week! ⚽',
          content: 'We\'ll be working on some exciting new passing drills this week. Can\'t wait to see everyone improve their ball control! Keep practicing at home too! 🌟',
          author: 'Assistant Coach Tom',
          authorAvatar: 'https://example.com/tom-avatar.jpg',
          timestamp: '5 days ago',
          priority: 'normal',
          category: 'training',
          isRead: true,
          reactions: { thumbsUp: 18, heart: 6 },
          hasAttachment: true,
        },
      ];
      
      // Dispatch to Redux store
      // dispatch(setAnnouncements(mockAnnouncements));
    } catch (error) {
      Alert.alert('Oops! 🤔', 'Couldn\'t load announcements right now. Please try again!');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  }, [loadAnnouncements]);

  const handleAnnouncementPress = (announcement) => {
    Vibration.vibrate(50);
    if (!announcement.isRead) {
      // Mark as read
      // dispatch(markAnnouncementAsRead(announcement.id));
    }
    navigation.navigate('AnnouncementDetail', { announcement });
  };

  const handleReaction = (announcementId, reactionType) => {
    Vibration.vibrate(30);
    // dispatch(addReaction(announcementId, reactionType));
  };

  const filteredAnnouncements = announcements?.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         announcement.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         announcement.category === selectedFilter ||
                         (selectedFilter === 'unread' && !announcement.isRead);
    
    return matchesSearch && matchesFilter;
  }) || [];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'normal': return COLORS.primary;
      default: return COLORS.secondary;
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      schedule: 'schedule',
      celebration: 'celebration',
      equipment: 'sports-soccer',
      training: 'fitness-center',
      general: 'announcement',
    };
    return icons[category] || 'announcement';
  };

  const FilterChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: SPACING.md }}
      style={{ marginBottom: SPACING.md }}
    >
      {[
        { key: 'all', label: 'All 📢', count: announcements?.length || 0 },
        { key: 'unread', label: 'New 🔔', count: unreadCount || 0 },
        { key: 'schedule', label: 'Schedule 📅', count: 0 },
        { key: 'celebration', label: 'Celebrate 🎉', count: 0 },
        { key: 'training', label: 'Training ⚽', count: 0 },
      ].map(filter => (
        <Chip
          key={filter.key}
          selected={selectedFilter === filter.key}
          onPress={() => setSelectedFilter(filter.key)}
          style={{
            marginRight: SPACING.sm,
            backgroundColor: selectedFilter === filter.key ? COLORS.primary : COLORS.background,
          }}
          textStyle={{
            color: selectedFilter === filter.key ? 'white' : COLORS.text,
            fontSize: 14,
          }}
        >
          {filter.label}
          {filter.count > 0 && selectedFilter !== filter.key && (
            <Badge size={16} style={{ marginLeft: 4, backgroundColor: COLORS.error }}>
              {filter.count}
            </Badge>
          )}
        </Chip>
      ))}
    </ScrollView>
  );

  const AnnouncementCard = ({ announcement, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50 * (index + 1), 0],
          })
        }]
      }}
    >
      <Card
        style={{
          marginHorizontal: SPACING.md,
          marginBottom: SPACING.md,
          elevation: announcement.isRead ? 2 : 6,
          borderLeftWidth: 4,
          borderLeftColor: getPriorityColor(announcement.priority),
        }}
        onPress={() => handleAnnouncementPress(announcement)}
      >
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
            <Avatar.Image 
              size={40} 
              source={{ uri: announcement.authorAvatar || 'https://via.placeholder.com/40' }}
              style={{ marginRight: SPACING.sm }}
            />
            <View style={{ flex: 1 }}>
              <Title style={[TEXT_STYLES.h3, { fontSize: 16, marginBottom: 2 }]}>
                {announcement.author}
              </Title>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon 
                  name={getCategoryIcon(announcement.category)} 
                  size={14} 
                  color={COLORS.secondary} 
                />
                <Paragraph style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS.secondary }]}>
                  {announcement.timestamp}
                </Paragraph>
              </View>
            </View>
            {!announcement.isRead && (
              <Badge size={8} style={{ backgroundColor: COLORS.primary }} />
            )}
            {announcement.hasAttachment && (
              <Icon name="attachment" size={20} color={COLORS.secondary} style={{ marginLeft: 8 }} />
            )}
          </View>

          <Title style={[TEXT_STYLES.h3, { fontSize: 16, marginBottom: SPACING.sm }]}>
            {announcement.title}
          </Title>

          <Paragraph style={[TEXT_STYLES.body, { marginBottom: SPACING.md, lineHeight: 20 }]}>
            {announcement.content.length > 150 
              ? `${announcement.content.substring(0, 150)}...` 
              : announcement.content}
          </Paragraph>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {Object.entries(announcement.reactions).map(([type, count]) => (
                <Surface
                  key={type}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 4,
                    marginRight: SPACING.sm,
                    borderRadius: 12,
                    backgroundColor: COLORS.surface,
                  }}
                >
                  <IconButton
                    icon={type === 'thumbsUp' ? 'thumb-up' : type === 'heart' ? 'favorite' : 'celebration'}
                    size={16}
                    onPress={() => handleReaction(announcement.id, type)}
                    style={{ margin: 0 }}
                  />
                  <Paragraph style={[TEXT_STYLES.caption, { fontSize: 12 }]}>
                    {count}
                  </Paragraph>
                </Surface>
              ))}
            </View>
            
            <Chip
              compact
              style={{ backgroundColor: `${getPriorityColor(announcement.priority)}20` }}
              textStyle={{ 
                color: getPriorityColor(announcement.priority), 
                fontSize: 10,
                textTransform: 'uppercase'
              }}
            >
              {announcement.priority}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const EmptyState = () => (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      paddingHorizontal: SPACING.xl 
    }}>
      <Icon name="announcement" size={80} color={COLORS.secondary} />
      <Title style={[TEXT_STYLES.h2, { textAlign: 'center', marginTop: SPACING.lg }]}>
        No Announcements Yet! 📢
      </Title>
      <Paragraph style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.sm }]}>
        Your coach will post team updates and announcements here. Check back soon!
      </Paragraph>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ paddingTop: StatusBar.currentHeight + SPACING.lg, paddingBottom: SPACING.md }}
      >
        <View style={{ paddingHorizontal: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Title style={[TEXT_STYLES.h1, { color: 'white', marginBottom: 4 }]}>
                Team Announcements 📢
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                Stay updated with your team! 🌟
              </Paragraph>
            </View>
            {unreadCount > 0 && (
              <Badge size={24} style={{ backgroundColor: COLORS.error }}>
                {unreadCount}
              </Badge>
            )}
          </View>
        </View>
      </LinearGradient>

      <Searchbar
        placeholder="Search announcements... 🔍"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{
          margin: SPACING.md,
          elevation: 2,
        }}
        inputStyle={{ fontSize: 14 }}
        iconColor={COLORS.primary}
      />

      <FilterChips />

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((announcement, index) => (
            <AnnouncementCard 
              key={announcement.id} 
              announcement={announcement} 
              index={index}
            />
          ))
        ) : (
          <EmptyState />
        )}
        
        <View style={{ height: 80 }} />
      </ScrollView>

      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('Coming Soon! 🚀', 'The ability to create announcements is coming soon!')}
      />
    </View>
  );
};

export default TeamAnnouncements;