import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Alert,
  Dimensions,
  FlatList,
  Animated,
  Platform,
  Vibration,
  Image,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Searchbar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  ProgressBar,
  Badge,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design System Imports
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const TeamOpportunities = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading, opportunities } = useSelector((state) => ({
    user: state.auth.user,
    isLoading: state.teams.isLoading,
    opportunities: state.teams.opportunities || [],
  }));

  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [appliedOpportunities, setAppliedOpportunities] = useState(new Set());
  const [savedOpportunities, setSavedOpportunities] = useState(new Set());
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for team opportunities
  const mockOpportunities = [
    {
      id: '1',
      title: 'Starting Midfielder Position',
      teamName: 'City Lions FC',
      sport: 'Football',
      level: 'Semi-Professional',
      type: 'Open Position',
      location: 'Los Angeles, CA',
      distance: '2.3 km',
      salary: '$2,500/month',
      duration: 'Season Contract',
      deadline: '2024-03-25',
      postedAt: '2024-03-10T09:00:00Z',
      teamLogo: 'https://via.placeholder.com/80x80',
      teamImage: 'https://via.placeholder.com/400x200',
      description: 'Seeking an experienced midfielder to join our championship-winning team for the upcoming season.',
      requirements: [
        'Minimum 3 years playing experience',
        'Strong passing and tactical awareness',
        'Available for evening training sessions',
        'Previous competitive league experience preferred'
      ],
      benefits: [
        'Monthly salary and performance bonuses',
        'Professional training facilities',
        'Team gear and equipment provided',
        'Medical insurance coverage'
      ],
      coach: 'Marcus Rodriguez',
      teamRating: 4.8,
      applicants: 23,
      maxApplicants: 50,
      isUrgent: true,
      tags: ['Experienced', 'Paid', 'Championship'],
      contactEmail: 'recruiting@citylions.com',
      tryoutDate: '2024-03-20',
      tryoutTime: '6:00 PM',
    },
    {
      id: '2',
      title: 'Youth Basketball Team Tryouts',
      teamName: 'Thunder Hawks U-18',
      sport: 'Basketball',
      level: 'Youth',
      type: 'Tryouts',
      location: 'Miami, FL',
      distance: '4.7 km',
      salary: 'Volunteer',
      duration: 'Full Season',
      deadline: '2024-03-30',
      postedAt: '2024-03-12T14:30:00Z',
      teamLogo: 'https://via.placeholder.com/80x80',
      teamImage: 'https://via.placeholder.com/400x200',
      description: 'Open tryouts for our competitive U-18 basketball team. Great opportunity for young players to develop skills.',
      requirements: [
        'Age 16-18 years',
        'Basic basketball fundamentals',
        'Commitment to regular practice',
        'Good academic standing'
      ],
      benefits: [
        'Professional coaching staff',
        'Tournament participation',
        'Skill development programs',
        'College recruitment exposure'
      ],
      coach: 'Sarah Johnson',
      teamRating: 4.6,
      applicants: 45,
      maxApplicants: 80,
      isUrgent: false,
      tags: ['Youth', 'Development', 'Tournaments'],
      contactEmail: 'tryouts@thunderhawks.org',
      tryoutDate: '2024-03-22',
      tryoutTime: '10:00 AM',
    },
    {
      id: '3',
      title: 'Professional Swimming Team Recruitment',
      teamName: 'Aqua Sharks Elite',
      sport: 'Swimming',
      level: 'Professional',
      type: 'Recruitment',
      location: 'San Diego, CA',
      distance: '8.1 km',
      salary: '$4,000/month',
      duration: 'Annual Contract',
      deadline: '2024-04-05',
      postedAt: '2024-03-08T11:15:00Z',
      teamLogo: 'https://via.placeholder.com/80x80',
      teamImage: 'https://via.placeholder.com/400x200',
      description: 'Elite swimming team seeking talented swimmers for national and international competitions.',
      requirements: [
        'National qualifying times',
        'Minimum 5 years competitive experience',
        '6-day training commitment',
        'Clean drug testing record'
      ],
      benefits: [
        'Full-time athlete salary',
        'Olympic-standard facilities',
        'Sports science support',
        'International competition travel'
      ],
      coach: 'Dr. Michael Chen',
      teamRating: 4.9,
      applicants: 12,
      maxApplicants: 20,
      isUrgent: false,
      tags: ['Elite', 'Olympics', 'Full-time'],
      contactEmail: 'recruitment@aquasharks.com',
      tryoutDate: '2024-03-28',
      tryoutTime: '8:00 AM',
    },
    {
      id: '4',
      title: 'College Tennis Scholarship Program',
      teamName: 'State University Tennis',
      sport: 'Tennis',
      level: 'College',
      type: 'Scholarship',
      location: 'Austin, TX',
      distance: '12.5 km',
      salary: 'Full Scholarship',
      duration: '4 Years',
      deadline: '2024-04-15',
      postedAt: '2024-03-05T16:45:00Z',
      teamLogo: 'https://via.placeholder.com/80x80',
      teamImage: 'https://via.placeholder.com/400x200',
      description: 'Full scholarship opportunity for talented tennis players to compete at collegiate level while earning degree.',
      requirements: [
        'High school graduation',
        'Minimum 3.0 GPA',
        'State-level tournament experience',
        'UTR rating of 8 or higher'
      ],
      benefits: [
        'Full tuition coverage',
        'Room and board included',
        'Professional coaching',
        'Academic support services'
      ],
      coach: 'Jennifer Martinez',
      teamRating: 4.7,
      applicants: 67,
      maxApplicants: 100,
      isUrgent: true,
      tags: ['Scholarship', 'Education', 'Full Coverage'],
      contactEmail: 'tennis.recruit@stateuni.edu',
      tryoutDate: '2024-04-01',
      tryoutTime: '2:00 PM',
    },
    {
      id: '5',
      title: 'Marathon Training Group',
      teamName: 'Elite Runners Club',
      sport: 'Running',
      level: 'Amateur',
      type: 'Training Group',
      location: 'Seattle, WA',
      distance: '6.2 km',
      salary: '$50/month',
      duration: '6 Months',
      deadline: '2024-03-28',
      postedAt: '2024-03-11T08:20:00Z',
      teamLogo: 'https://via.placeholder.com/80x80',
      teamImage: 'https://via.placeholder.com/400x200',
      description: 'Join our structured marathon training program with experienced coaches and supportive team environment.',
      requirements: [
        'Ability to run 10K',
        'Commitment to training schedule',
        'Previous running experience',
        'Health clearance certificate'
      ],
      benefits: [
        'Structured training plans',
        'Group motivation and support',
        'Race entry fee discounts',
        'Nutrition guidance'
      ],
      coach: 'David Thompson',
      teamRating: 4.5,
      applicants: 18,
      maxApplicants: 25,
      isUrgent: false,
      tags: ['Training', 'Marathon', 'Beginner-Friendly'],
      contactEmail: 'join@eliterunners.com',
      tryoutDate: '2024-03-25',
      tryoutTime: '7:00 AM',
    },
  ];

  const sportsCategories = ['All', 'Football', 'Basketball', 'Swimming', 'Tennis', 'Running', 'Baseball', 'Volleyball'];
  const levelCategories = ['All', 'Youth', 'Amateur', 'Semi-Professional', 'Professional', 'College'];
  const typeCategories = ['All', 'Open Position', 'Tryouts', 'Recruitment', 'Scholarship', 'Training Group'];

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    setFilteredOpportunities(mockOpportunities);
  }, []);

  // Filter opportunities
  useEffect(() => {
    let filtered = mockOpportunities;

    if (searchQuery) {
      filtered = filtered.filter(opp =>
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.sport.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSport !== 'All') {
      filtered = filtered.filter(opp => opp.sport === selectedSport);
    }

    if (selectedLevel !== 'All') {
      filtered = filtered.filter(opp => opp.level === selectedLevel);
    }

    if (selectedType !== 'All') {
      filtered = filtered.filter(opp => opp.type === selectedType);
    }

    // Sort by urgency and date
    filtered.sort((a, b) => {
      if (a.isUrgent !== b.isUrgent) {
        return b.isUrgent - a.isUrgent;
      }
      return new Date(b.postedAt) - new Date(a.postedAt);
    });

    setFilteredOpportunities(filtered);
  }, [searchQuery, selectedSport, selectedLevel, selectedType]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('🔄 Opportunities Updated', 'Latest team opportunities have been loaded!');
    }, 2000);
  }, []);

  const handleOpportunityPress = (opportunity) => {
    Vibration.vibrate(50);
    Alert.alert(
      '🏆 Team Opportunity',
      `Feature coming soon!\n\nTeam: ${opportunity.teamName}\nPosition: ${opportunity.title}\n\nThis will show detailed opportunity information, application process, and team details.`
    );
  };

  const handleApply = (opportunity) => {
    Vibration.vibrate(100);
    const newApplied = new Set(appliedOpportunities);
    if (newApplied.has(opportunity.id)) {
      Alert.alert('✅ Already Applied', `You have already applied for this position with ${opportunity.teamName}.`);
    } else {
      newApplied.add(opportunity.id);
      setAppliedOpportunities(newApplied);
      Alert.alert(
        '📝 Application Submitted',
        `Your application for "${opportunity.title}" with ${opportunity.teamName} has been submitted!\n\nThis feature will include application forms, document uploads, and tracking.`
      );
    }
  };

  const handleSaveOpportunity = (opportunityId) => {
    Vibration.vibrate(30);
    const newSaved = new Set(savedOpportunities);
    if (newSaved.has(opportunityId)) {
      newSaved.delete(opportunityId);
      Alert.alert('💾 Removed from Saved', 'Opportunity removed from your saved list');
    } else {
      newSaved.add(opportunityId);
      Alert.alert('💾 Opportunity Saved', 'Added to your saved opportunities');
    }
    setSavedOpportunities(newSaved);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just posted';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getDaysUntilDeadline = (deadlineString) => {
    const now = new Date();
    const deadline = new Date(deadlineString);
    const diffInDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    return diffInDays;
  };

  const getSalaryColor = (salary) => {
    if (salary.includes('$') && !salary.includes('Volunteer')) return COLORS.success;
    if (salary.includes('Scholarship')) return COLORS.primary;
    return COLORS.textSecondary;
  };

  const renderFilterChip = (items, selected, onSelect) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: SPACING.sm }}>
      {items.map((item) => (
        <Chip
          key={item}
          selected={selected === item}
          onPress={() => onSelect(item)}
          style={{
            marginRight: SPACING.sm,
            backgroundColor: selected === item ? COLORS.primary : COLORS.background,
          }}
          textStyle={{
            color: selected === item ? '#fff' : COLORS.text,
            fontWeight: selected === item ? 'bold' : 'normal',
          }}
        >
          {item}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderOpportunityCard = ({ item, index }) => {
    const daysLeft = getDaysUntilDeadline(item.deadline);
    const isApplied = appliedOpportunities.has(item.id);
    const isSaved = savedOpportunities.has(item.id);

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          marginBottom: SPACING.md,
        }}
      >
        <TouchableOpacity onPress={() => handleOpportunityPress(item)} activeOpacity={0.8}>
          <Card style={{ margin: SPACING.xs, elevation: 4 }}>
            {item.isUrgent && (
              <LinearGradient
                colors={['#ff6b6b', '#ee5a52']}
                style={{
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.xs,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="priority-high" size={16} color="#fff" />
                  <Text style={[TEXT_STYLES.caption, { color: '#fff', marginLeft: 4, fontWeight: 'bold' }]}>
                    URGENT HIRING
                  </Text>
                </View>
                <Text style={[TEXT_STYLES.caption, { color: '#fff', fontWeight: 'bold' }]}>
                  {daysLeft} days left
                </Text>
              </LinearGradient>
            )}

            <Image
              source={{ uri: item.teamImage }}
              style={{
                width: '100%',
                height: 120,
                backgroundColor: COLORS.background,
              }}
              resizeMode="cover"
            />

            <Card.Content style={{ padding: SPACING.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm }}>
                <Avatar.Image
                  size={50}
                  source={{ uri: item.teamLogo }}
                  style={{ backgroundColor: COLORS.background }}
                />
                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <Text style={[TEXT_STYLES.heading, { fontSize: 18, marginBottom: 2 }]}>
                    {item.title}
                  </Text>
                  <Text style={[TEXT_STYLES.subheading, { color: COLORS.primary, marginBottom: 4 }]}>
                    {item.teamName}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="star" size={14} color="#FFD700" />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS.textSecondary }]}>
                      {item.teamRating} team rating
                    </Text>
                  </View>
                </View>
                <IconButton
                  icon={isSaved ? 'bookmark' : 'bookmark-border'}
                  size={20}
                  iconColor={isSaved ? COLORS.primary : COLORS.textSecondary}
                  onPress={() => handleSaveOpportunity(item.id)}
                />
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Chip
                  compact
                  style={{
                    backgroundColor: COLORS.primary,
                    height: 24,
                    marginRight: SPACING.sm,
                  }}
                  textStyle={{ color: '#fff', fontSize: 10 }}
                >
                  {item.sport}
                </Chip>
                <Chip
                  compact
                  style={{
                    backgroundColor: COLORS.secondary,
                    height: 24,
                    marginRight: SPACING.sm,
                  }}
                  textStyle={{ color: '#fff', fontSize: 10 }}
                >
                  {item.level}
                </Chip>
                <Chip
                  compact
                  style={{
                    backgroundColor: COLORS.background,
                    height: 24,
                  }}
                  textStyle={{ fontSize: 10 }}
                >
                  {item.type}
                </Chip>
              </View>

              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: SPACING.md }]}>
                {item.description}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Icon name="location-on" size={16} color={COLORS.error} />
                <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.xs, flex: 1 }]}>
                  {item.location} • {item.distance} away
                </Text>
                <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: getSalaryColor(item.salary) }]}>
                  {item.salary}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Icon name="schedule" size={16} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, flex: 1 }]}>
                  Duration: {item.duration} • Posted {formatTimeAgo(item.postedAt)}
                </Text>
              </View>

              {item.tryoutDate && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                  <Icon name="event" size={16} color={COLORS.secondary} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                    Tryout: {item.tryoutDate} at {item.tryoutTime}
                  </Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                <Icon name="group" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                  {item.applicants}/{item.maxApplicants} applications
                </Text>
              </View>

              <ProgressBar
                progress={item.applicants / item.maxApplicants}
                color={COLORS.primary}
                style={{ marginBottom: SPACING.sm, height: 4 }}
              />

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
                {item.tags.map((tag, tagIndex) => (
                  <Chip
                    key={tagIndex}
                    compact
                    style={{
                      marginRight: SPACING.xs,
                      backgroundColor: COLORS.background,
                      height: 24,
                    }}
                    textStyle={{ fontSize: 10 }}
                  >
                    {tag}
                  </Chip>
                ))}
              </ScrollView>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Avatar.Text
                  size={24}
                  label={item.coach.split(' ').map(n => n[0]).join('')}
                  style={{ backgroundColor: COLORS.primary }}
                  labelStyle={{ fontSize: 10 }}
                />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.sm }]}>
                  Coach: {item.coach}
                </Text>
              </View>
            </Card.Content>

            <Card.Actions style={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.md }}>
              <Button
                mode="outlined"
                onPress={() => handleOpportunityPress(item)}
                style={{ flex: 1, marginRight: SPACING.sm }}
                disabled={isApplied}
              >
                {isApplied ? 'Applied' : 'Details'}
              </Button>
              <Button
                mode="contained"
                onPress={() => handleApply(item)}
                style={{ flex: 1 }}
                buttonColor={isApplied ? COLORS.success : COLORS.primary}
                disabled={isApplied}
              >
                {isApplied ? '✓ Applied' : 'Apply Now'}
              </Button>
            </Card.Actions>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderFiltersModal = () => (
    <Portal>
      <Modal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.lg,
          borderRadius: 12,
          padding: SPACING.lg,
        }}
      >
        <Text style={[TEXT_STYLES.heading, { marginBottom: SPACING.md }]}>
          🎯 Filter Opportunities
        </Text>

        <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.sm }]}>
          Sport Category
        </Text>
        {renderFilterChip(sportsCategories, selectedSport, setSelectedSport)}

        <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.sm, marginTop: SPACING.md }]}>
          Competition Level
        </Text>
        {renderFilterChip(levelCategories, selectedLevel, setSelectedLevel)}

        <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.sm, marginTop: SPACING.md }]}>
          Opportunity Type
        </Text>
        {renderFilterChip(typeCategories, selectedType, setSelectedType)}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.lg }}>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedSport('All');
              setSelectedLevel('All');
              setSelectedType('All');
            }}
            style={{ flex: 1, marginRight: SPACING.sm }}
          >
            Clear All
          </Button>
          <Button
            mode="contained"
            onPress={() => setShowFilters(false)}
            style={{ flex: 1 }}
            buttonColor={COLORS.primary}
          >
            Apply Filters
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
          paddingHorizontal: SPACING.md,
          paddingBottom: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.heading, { color: '#fff', fontSize: 24, flex: 1 }]}>
            🚀 Team Opportunities
          </Text>
          <IconButton
            icon="tune"
            iconColor="#fff"
            size={24}
            onPress={() => setShowFilters(true)}
          />
          <IconButton
            icon="folder"
            iconColor="#fff"
            size={24}
            onPress={() => Alert.alert('📂 My Applications', 'View your applications and saved opportunities feature coming soon!')}
          />
        </View>

        <Searchbar
          placeholder="Search teams, positions, locations..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            elevation: 4,
          }}
          iconColor={COLORS.primary}
          inputStyle={{ color: COLORS.text }}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: SPACING.md }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderRadius: 20,
              marginRight: SPACING.sm,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => Alert.alert('💰 Paid Positions', 'Paid opportunities filtering coming soon!')}
          >
            <Icon name="attach-money" size={16} color="#fff" />
            <Text style={[TEXT_STYLES.body, { color: '#fff', marginLeft: 4 }]}>
              Paid Only
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderRadius: 20,
              marginRight: SPACING.sm,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => Alert.alert('📍 Near Me', 'Location-based filtering coming soon!')}
          >
            <Icon name="near-me" size={16} color="#fff" />
            <Text style={[TEXT_STYLES.body, { color: '#fff', marginLeft: 4 }]}>
              Near Me
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => Alert.alert('⚡ Urgent', 'Urgent opportunities filtering coming soon!')}
          >
            <Icon name="priority-high" size={16} color="#fff" />
            <Text style={[TEXT_STYLES.body, { color: '#fff', marginLeft: 4 }]}>
              Urgent
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

      <View style={{ flex: 1, paddingHorizontal: SPACING.sm }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: SPACING.sm,
          paddingVertical: SPACING.md,
        }}>
          <Text style={[TEXT_STYLES.body, { flex: 1 }]}>
            {filteredOpportunities.length} opportunities found
          </Text>
          {(selectedSport !== 'All' || selectedLevel !== 'All' || selectedType !== 'All') && (
            <Chip
              onPress={() => {
                setSelectedSport('All');
                setSelectedLevel('All');
                setSelectedType('All');
              }}
              style={{ backgroundColor: COLORS.primary }}
              textStyle={{ color: '#fff' }}
            >
              Clear Filters
            </Chip>
          )}
        </View>

        <FlatList
          data={filteredOpportunities}
          renderItem={renderOpportunityCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: SPACING.xl,
            }}>
              <Icon name="work-off" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.heading, {
                marginTop: SPACING.md,
                color: COLORS.textSecondary,
                textAlign: 'center',
              }]}>
                No Opportunities Found
              </Text>
              <Text style={[TEXT_STYLES.body, {
                marginTop: SPACING.sm,
                color: COLORS.textSecondary,
                textAlign: 'center',
              }]}>
                Try adjusting your search or filters to find more opportunities
              </Text>
            </View>
          }
        />
      </View>

      {renderFiltersModal()}

      <FAB
        icon="add-circle"
        label="Create Team"
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('➕ Create Team', 'Team creation feature coming soon! This will allow you to create your own team and recruit players.')}
      />
    </View>
  );
};

export default TeamOpportunities;