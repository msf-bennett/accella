import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Alert,
  FlatList,
  Dimensions,
  Vibration,
  Modal,
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
  Portal,
  Dialog,
  Badge,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const DrillPractice = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { drills } = useSelector(state => state.training);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [showDrillModal, setShowDrillModal] = useState(false);
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [favoritesDrills, setFavoritesDrills] = useState(['1', '3', '7']);
  const [completedDrills, setCompletedDrills] = useState(['2', '5']);
  const [activeDrillId, setActiveDrillId] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock drill practice data
  const [drillCategories, setDrillCategories] = useState([
    {
      id: '1',
      name: 'Ball Control Mastery ⚽',
      description: 'Essential ball control drills for soccer players',
      sport: 'Soccer',
      difficulty: 'Intermediate',
      skillFocus: 'Ball Control',
      duration: 20,
      equipment: 'Soccer Ball',
      drillCount: 6,
      participants: '1 Player',
      icon: 'sports-soccer',
      color: '#2ed573',
      drills: [
        {
          id: 'drill_1_1',
          name: 'Cone Weaving',
          description: 'Dribble through cones using both feet',
          duration: 180,
          reps: '3 sets',
          instructions: 'Set up 6 cones in a straight line, 2 yards apart. Dribble through using inside and outside of both feet.',
          difficulty: 'Beginner',
          videoUrl: null,
        },
        {
          id: 'drill_1_2',
          name: 'Wall Passes',
          description: 'Improve first touch with wall rebounds',
          duration: 300,
          reps: '50 touches',
          instructions: 'Stand 3 yards from wall. Pass ball against wall and control with different parts of foot.',
          difficulty: 'Intermediate',
          videoUrl: null,
        }
      ]
    },
    {
      id: '2',
      name: 'Basketball Shooting 🏀',
      description: 'Improve shooting accuracy and consistency',
      sport: 'Basketball',
      difficulty: 'Intermediate',
      skillFocus: 'Shooting',
      duration: 25,
      equipment: 'Basketball, Hoop',
      drillCount: 5,
      participants: '1-2 Players',
      icon: 'sports-basketball',
      color: '#ff6b9d',
      drills: [
        {
          id: 'drill_2_1',
          name: 'Free Throw Practice',
          description: 'Perfect your free throw technique',
          duration: 300,
          reps: '50 shots',
          instructions: 'Focus on consistent form. Same routine every time. Aim for 80% accuracy.',
          difficulty: 'Beginner',
          videoUrl: null,
        },
        {
          id: 'drill_2_2',
          name: 'Around the World',
          description: 'Shoot from different positions around the arc',
          duration: 600,
          reps: '5 positions',
          instructions: 'Start from right corner, make 2 shots before moving to next position.',
          difficulty: 'Intermediate',
          videoUrl: null,
        }
      ]
    },
    {
      id: '3',
      name: 'Tennis Serve Power 🎾',
      description: 'Develop powerful and accurate serves',
      sport: 'Tennis',
      difficulty: 'Advanced',
      skillFocus: 'Serving',
      duration: 30,
      equipment: 'Tennis Racket, Balls',
      drillCount: 4,
      participants: '1 Player',
      icon: 'sports-tennis',
      color: '#3742fa',
      drills: [
        {
          id: 'drill_3_1',
          name: 'Target Practice',
          description: 'Serve to specific targets in service box',
          duration: 450,
          reps: '20 serves each target',
          instructions: 'Place targets in service boxes. Alternate between deuce and ad court.',
          difficulty: 'Intermediate',
          videoUrl: null,
        },
        {
          id: 'drill_3_2',
          name: 'Power Serves',
          description: 'Focus on maximum power with control',
          duration: 600,
          reps: '30 serves',
          instructions: 'Full power serves while maintaining 60% accuracy. Focus on leg drive.',
          difficulty: 'Advanced',
          videoUrl: null,
        }
      ]
    },
    {
      id: '4',
      name: 'Swimming Technique 🏊',
      description: 'Refine stroke technique and breathing',
      sport: 'Swimming',
      difficulty: 'Intermediate',
      skillFocus: 'Technique',
      duration: 35,
      equipment: 'Pool, Kickboard',
      drillCount: 7,
      participants: '1 Player',
      icon: 'pool',
      color: '#00d2d3',
      drills: [
        {
          id: 'drill_4_1',
          name: 'Catch-Up Drill',
          description: 'One arm freestyle for better catch',
          duration: 600,
          reps: '4 x 50m',
          instructions: 'One arm stays extended while other completes full stroke cycle.',
          difficulty: 'Intermediate',
          videoUrl: null,
        }
      ]
    },
    {
      id: '5',
      name: 'Volleyball Spikes 🏐',
      description: 'Master attacking techniques and timing',
      sport: 'Volleyball',
      difficulty: 'Advanced',
      skillFocus: 'Attacking',
      duration: 25,
      equipment: 'Volleyball, Net',
      drillCount: 5,
      participants: '2-3 Players',
      icon: 'sports-volleyball',
      color: '#ff4757',
      drills: [
        {
          id: 'drill_5_1',
          name: 'Approach Timing',
          description: 'Perfect your spike approach',
          duration: 360,
          reps: '20 approaches',
          instructions: 'Focus on 3-step approach. Left-right-left for right handed players.',
          difficulty: 'Intermediate',
          videoUrl: null,
        }
      ]
    },
    {
      id: '6',
      name: 'Golf Putting Precision ⛳',
      description: 'Improve putting accuracy and distance control',
      sport: 'Golf',
      difficulty: 'Beginner',
      skillFocus: 'Putting',
      duration: 20,
      equipment: 'Putter, Golf Balls',
      drillCount: 4,
      participants: '1 Player',
      icon: 'golf-course',
      color: '#2ed573',
      drills: [
        {
          id: 'drill_6_1',
          name: 'Gate Drill',
          description: 'Putt through alignment gates',
          duration: 300,
          reps: '30 putts',
          instructions: 'Set up gates 6 inches apart. Putt straight through without touching.',
          difficulty: 'Beginner',
          videoUrl: null,
        }
      ]
    },
    {
      id: '7',
      name: 'Baseball Batting 🔘',
      description: 'Enhance batting stance and swing mechanics',
      sport: 'Baseball',
      difficulty: 'Intermediate',
      skillFocus: 'Batting',
      duration: 30,
      equipment: 'Bat, Balls, Tee',
      drillCount: 6,
      participants: '1-2 Players',
      icon: 'sports-baseball',
      color: '#ffa502',
      drills: [
        {
          id: 'drill_7_1',
          name: 'Tee Work',
          description: 'Perfect swing mechanics on tee',
          duration: 450,
          reps: '50 swings',
          instructions: 'Focus on level swing through zone. Hit line drives, not fly balls.',
          difficulty: 'Beginner',
          videoUrl: null,
        }
      ]
    },
    {
      id: '8',
      name: 'Track & Field Sprints 🏃',
      description: 'Develop speed and running technique',
      sport: 'Track & Field',
      difficulty: 'Advanced',
      skillFocus: 'Speed',
      duration: 25,
      equipment: 'Track, Blocks',
      drillCount: 5,
      participants: '1 Player',
      icon: 'directions-run',
      color: '#ff3838',
      drills: [
        {
          id: 'drill_8_1',
          name: 'Block Starts',
          description: 'Perfect your starting technique',
          duration: 300,
          reps: '10 starts',
          instructions: 'Focus on drive phase. Keep head down for first 20m.',
          difficulty: 'Advanced',
          videoUrl: null,
        }
      ]
    }
  ]);

  const sports = ['all', 'Soccer', 'Basketball', 'Tennis', 'Swimming', 'Volleyball', 'Golf', 'Baseball', 'Track & Field'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];
  const skillFocuses = ['all', 'Ball Control', 'Shooting', 'Serving', 'Technique', 'Attacking', 'Putting', 'Batting', 'Speed'];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const filterDrills = useCallback(() => {
    return drillCategories.filter(drill => {
      const matchesSearch = drill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          drill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          drill.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          drill.skillFocus.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSport = selectedSport === 'all' || drill.sport === selectedSport;
      const matchesDifficulty = selectedDifficulty === 'all' || drill.difficulty === selectedDifficulty;
      const matchesSkill = selectedSkill === 'all' || drill.skillFocus === selectedSkill;
      
      return matchesSearch && matchesSport && matchesDifficulty && matchesSkill;
    });
  }, [drillCategories, searchQuery, selectedSport, selectedDifficulty, selectedSkill]);

  const handleStartDrill = (drill) => {
    Vibration.vibrate(50);
    setActiveDrillId(drill.id);
    
    Alert.alert(
      `Start ${drill.name}? 🚀`,
      `Sport: ${drill.sport}\nDuration: ${drill.duration} minutes\nDifficulty: ${drill.difficulty}\nDrills: ${drill.drillCount} exercises`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setActiveDrillId(null) },
        {
          text: 'View Details',
          onPress: () => {
            setSelectedDrill(drill);
            setShowDrillModal(true);
            setActiveDrillId(null);
          },
        },
        {
          text: 'Start Practice',
          onPress: () => {
            navigation.navigate('DrillSession', { drill });
            setActiveDrillId(null);
          },
        },
      ]
    );
  };

  const handleToggleFavorite = (drillId) => {
    setFavoritesDrills(prev => 
      prev.includes(drillId)
        ? prev.filter(id => id !== drillId)
        : [...prev, drillId]
    );
    Vibration.vibrate(50);
  };

  const handleMarkCompleted = (drillId) => {
    setCompletedDrills(prev => 
      prev.includes(drillId)
        ? prev
        : [...prev, drillId]
    );
    Vibration.vibrate([100, 50, 100]);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#2ed573';
      case 'Intermediate': return '#ffa502';
      case 'Advanced': return '#ff4757';
      default: return COLORS.primary;
    }
  };

  const getSportIcon = (sport) => {
    const icons = {
      'Soccer': 'sports-soccer',
      'Basketball': 'sports-basketball',
      'Tennis': 'sports-tennis',
      'Swimming': 'pool',
      'Volleyball': 'sports-volleyball',
      'Golf': 'golf-course',
      'Baseball': 'sports-baseball',
      'Track & Field': 'directions-run',
    };
    return icons[sport] || 'sports';
  };

  const renderDrillCard = ({ item: drill }) => {
    const isFavorite = favoritesDrills.includes(drill.id);
    const isCompleted = completedDrills.includes(drill.id);
    const isActive = activeDrillId === drill.id;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          marginBottom: SPACING.medium,
        }}
      >
        <Card style={{ 
          marginHorizontal: SPACING.medium, 
          elevation: 4,
          opacity: isActive ? 0.7 : 1,
        }}>
          <LinearGradient
            colors={[drill.color, drill.color + '80']}
            style={{
              padding: SPACING.medium,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.small }}>
                  <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                    {drill.name}
                  </Text>
                  {isCompleted && (
                    <Badge size={20} style={{ backgroundColor: '#4caf50', marginLeft: SPACING.small }}>
                      ✓
                    </Badge>
                  )}
                </View>
                <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)', marginBottom: SPACING.small }]}>
                  {drill.description}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name={getSportIcon(drill.sport)} size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginLeft: 4 }]}>
                    {drill.sport}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: 'center' }}>
                <IconButton
                  icon={isFavorite ? "favorite" : "favorite-border"}
                  iconColor={isFavorite ? '#ffeb3b' : 'rgba(255,255,255,0.7)'}
                  size={24}
                  onPress={() => handleToggleFavorite(drill.id)}
                />
                <Avatar.Icon
                  size={40}
                  icon={drill.icon}
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginTop: -SPACING.small }}
                />
              </View>
            </View>
          </LinearGradient>

          <Card.Content style={{ padding: SPACING.medium }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.medium }}>
              <View style={{ alignItems: 'center' }}>
                <Icon name="schedule" size={20} color={COLORS.text.secondary} />
                <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>
                  {drill.duration} min
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Icon name="fitness-center" size={20} color={COLORS.text.secondary} />
                <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>
                  {drill.drillCount} drills
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Icon name="people" size={20} color={COLORS.text.secondary} />
                <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>
                  {drill.participants}
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Icon name="build" size={20} color={COLORS.text.secondary} />
                <Text style={[TEXT_STYLES.caption, { marginTop: 4, textAlign: 'center' }]}>
                  {drill.equipment}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', marginBottom: SPACING.medium, flexWrap: 'wrap' }}>
              <Chip
                mode="outlined"
                style={{ 
                  marginRight: SPACING.small,
                  marginBottom: SPACING.small,
                  backgroundColor: getDifficultyColor(drill.difficulty) + '20',
                }}
                textStyle={{ color: getDifficultyColor(drill.difficulty), fontSize: 12 }}
              >
                {drill.difficulty}
              </Chip>
              <Chip
                mode="outlined"
                style={{ 
                  marginRight: SPACING.small,
                  marginBottom: SPACING.small,
                  backgroundColor: COLORS.primary + '20',
                }}
                textStyle={{ color: COLORS.primary, fontSize: 12 }}
              >
                {drill.skillFocus}
              </Chip>
              {isFavorite && (
                <Chip
                  mode="outlined"
                  icon="favorite"
                  style={{ 
                    marginBottom: SPACING.small,
                    backgroundColor: '#ffeb3b20',
                  }}
                  textStyle={{ color: '#f57f17', fontSize: 12 }}
                >
                  Favorite
                </Chip>
              )}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                mode="outlined"
                onPress={() => {
                  setSelectedDrill(drill);
                  setShowDrillModal(true);
                }}
                style={{ flex: 1, marginRight: SPACING.small }}
                icon="visibility"
              >
                Details
              </Button>
              <Button
                mode="contained"
                onPress={() => handleStartDrill(drill)}
                style={{ 
                  flex: 1,
                  backgroundColor: isCompleted ? COLORS.success : drill.color,
                }}
                icon={isActive ? "hourglass-empty" : "play-arrow"}
                loading={isActive}
                disabled={isActive}
              >
                {isCompleted ? 'Practice Again' : 'Start Practice'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const renderDrillModal = () => (
    <Portal>
      <Modal
        visible={showDrillModal}
        onDismiss={() => {
          setShowDrillModal(false);
          setSelectedDrill(null);
        }}
        contentContainerStyle={{
          backgroundColor: COLORS.background.primary,
          margin: SPACING.medium,
          borderRadius: 12,
          maxHeight: '80%',
        }}
      >
        {selectedDrill && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <LinearGradient
              colors={[selectedDrill.color, selectedDrill.color + '80']}
              style={{ padding: SPACING.large, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.h2, { color: 'white', marginBottom: SPACING.small }]}>
                    {selectedDrill.name}
                  </Text>
                  <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
                    {selectedDrill.description}
                  </Text>
                </View>
                <Avatar.Icon
                  size={60}
                  icon={selectedDrill.icon}
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                />
              </View>
            </LinearGradient>

            <View style={{ padding: SPACING.large }}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.medium }]}>
                Practice Overview 📋
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.large }}>
                <Surface style={{ 
                  padding: SPACING.medium, 
                  borderRadius: 8, 
                  alignItems: 'center', 
                  flex: 1, 
                  marginRight: SPACING.small,
                  elevation: 1,
                }}>
                  <Icon name="schedule" size={24} color={COLORS.primary} />
                  <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginTop: 4 }]}>
                    {selectedDrill.duration} min
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                    Duration
                  </Text>
                </Surface>

                <Surface style={{ 
                  padding: SPACING.medium, 
                  borderRadius: 8, 
                  alignItems: 'center', 
                  flex: 1, 
                  marginHorizontal: SPACING.small,
                  elevation: 1,
                }}>
                  <Icon name="fitness-center" size={24} color={COLORS.secondary} />
                  <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginTop: 4 }]}>
                    {selectedDrill.drillCount}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                    Drills
                  </Text>
                </Surface>

                <Surface style={{ 
                  padding: SPACING.medium, 
                  borderRadius: 8, 
                  alignItems: 'center', 
                  flex: 1, 
                  marginLeft: SPACING.small,
                  elevation: 1,
                }}>
                  <Icon name="trending-up" size={24} color={getDifficultyColor(selectedDrill.difficulty)} />
                  <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginTop: 4 }]}>
                    {selectedDrill.difficulty}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                    Level
                  </Text>
                </Surface>
              </View>

              <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.medium }]}>
                Equipment Needed 🛠️
              </Text>
              <Surface style={{ 
                padding: SPACING.medium, 
                borderRadius: 8, 
                marginBottom: SPACING.large,
                backgroundColor: COLORS.primary + '10',
                elevation: 1,
              }}>
                <Text style={[TEXT_STYLES.body, { color: COLORS.primary, fontWeight: 'bold' }]}>
                  {selectedDrill.equipment}
                </Text>
              </Surface>

              <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.medium }]}>
                Drill Breakdown 📊
              </Text>
              {selectedDrill.drills.map((drill, index) => (
                <Surface
                  key={drill.id}
                  style={{
                    padding: SPACING.medium,
                    marginBottom: SPACING.medium,
                    borderRadius: 8,
                    elevation: 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.small }}>
                    <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', flex: 1 }]}>
                      {index + 1}. {drill.name}
                    </Text>
                    <Chip
                      mode="outlined"
                      style={{ backgroundColor: getDifficultyColor(drill.difficulty) + '20' }}
                      textStyle={{ color: getDifficultyColor(drill.difficulty), fontSize: 12 }}
                    >
                      {drill.difficulty}
                    </Chip>
                  </View>
                  
                  <Text style={[TEXT_STYLES.body, { color: COLORS.text.secondary, marginBottom: SPACING.small }]}>
                    {drill.description}
                  </Text>
                  
                  <View style={{ flexDirection: 'row', marginBottom: SPACING.small }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: SPACING.large }}>
                      <Icon name="timer" size={16} color={COLORS.text.secondary} />
                      <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                        {Math.floor(drill.duration / 60)}:{(drill.duration % 60).toString().padStart(2, '0')}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="repeat" size={16} color={COLORS.text.secondary} />
                      <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                        {drill.reps}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.text.primary, fontStyle: 'italic' }]}>
                    💡 {drill.instructions}
                  </Text>
                </Surface>
              ))}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.large }}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowDrillModal(false);
                    setSelectedDrill(null);
                  }}
                  style={{ flex: 1, marginRight: SPACING.small }}
                >
                  Close
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    setShowDrillModal(false);
                    navigation.navigate('DrillSession', { drill: selectedDrill });
                    setSelectedDrill(null);
                  }}
                  style={{ flex: 1 }}
                  icon="play-arrow"
                >
                  Start Practice
                </Button>
              </View>
            </View>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{ paddingTop: StatusBar.currentHeight + SPACING.large, paddingBottom: SPACING.large }}
    >
      <View style={{ paddingHorizontal: SPACING.large }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>
              Drill Practice 🎯
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)' }]}>
              Master your skills with structured practice drills
            </Text>
          </View>
          <IconButton
            icon="video-library"
            iconColor="white"
            size={28}
            onPress={() => Alert.alert('Video Library', 'Video drill tutorials coming soon! 🎥')}
          />
        </View>

        <Searchbar
          placeholder="Search drill practices..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ 
            marginTop: SPACING.medium,
            backgroundColor: 'rgba(255,255,255,0.9)',
            elevation: 0,
          }}
          iconColor={COLORS.primary}
          placeholderTextColor={COLORS.text.secondary}
        />
      </View>
    </LinearGradient>
  );

  const renderFilters = () => (
    <View style={{ paddingVertical: SPACING.medium }}>
      <Text style={[TEXT_STYLES.h4, { marginHorizontal: SPACING.large, marginBottom: SPACING.small }]}>
        Sport
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.large }}
      >
        {sports.map((sport) => (
          <Chip
            key={sport}
            mode={selectedSport === sport ? 'flat' : 'outlined'}
            selected={selectedSport === sport}
            onPress={() => setSelectedSport(sport)}
            style={{ 
              marginRight: SPACING.small,
              backgroundColor: selectedSport === sport ? COLORS.primary : 'transparent',
            }}
            textStyle={{ 
              color: selectedSport === sport ? 'white' : COLORS.text.primary 
            }}
          >
            {sport === 'all' ? 'All Sports' : sport}
          </Chip>
        ))}
      </ScrollView>

      <Text style={[TEXT_STYLES.h4, { marginHorizontal: SPACING.large, marginTop: SPACING.medium, marginBottom: SPACING.small }]}>
        Difficulty
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.large }}
      >
        {difficulties.map((difficulty) => (
          <Chip
            key={difficulty}
            mode={selectedDifficulty === difficulty ? 'flat' : 'outlined'}
            selected={selectedDifficulty === difficulty}
            onPress={() => setSelectedDifficulty(difficulty)}
            style={{ 
              marginRight: SPACING.small,
              backgroundColor: selectedDifficulty === difficulty 
                ? getDifficultyColor(difficulty === 'all' ? 'Intermediate' : difficulty) 
                : 'transparent',
            }}
            textStyle={{ 
              color: selectedDifficulty === difficulty 
                ? 'white' 
                : COLORS.text.primary 
            }}
          >
            {difficulty === 'all' ? 'All Levels' : difficulty}
          </Chip>
        ))}
      </ScrollView>

      <Text style={[TEXT_STYLES.h4, { marginHorizontal: SPACING.large, marginTop: SPACING.medium, marginBottom: SPACING.small }]}>
        Skill Focus
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.large }}
      >
        {skillFocuses.map((skill) => (
          <Chip
            key={skill}
            mode={selectedSkill === skill ? 'flat' : 'outlined'}
            selected={selectedSkill === skill}
            onPress={() => setSelectedSkill(skill)}
            style={{ 
              marginRight: SPACING.small,
              backgroundColor: selectedSkill === skill ? COLORS.secondary : 'transparent',
            }}
            textStyle={{ 
              color: selectedSkill === skill ? 'white' : COLORS.text.primary 
            }}
          >
            {skill === 'all' ? 'All Skills' : skill}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderStats = () => {
    const totalDrills = drillCategories.length;
    const favoriteDrills = favoritesDrills.length;
    const completedDrillsCount = completedDrills.length;
    const completionRate = totalDrills > 0 ? completedDrillsCount / totalDrills : 0;

    return (
      <Surface style={{ 
        margin: SPACING.medium, 
        padding: SPACING.large, 
        borderRadius: 12, 
        elevation: 2 
      }}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.medium, textAlign: 'center' }]}>
          Your Practice Stats 📈
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.medium }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
              {totalDrills}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
              Available
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: '#ffeb3b' }]}>
              {favoriteDrills}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
              Favorites
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
              {completedDrillsCount}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
              Completed
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.secondary }]}>
              {Math.round(completionRate * 100)}%
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
              Progress
            </Text>
          </View>
        </View>

        <ProgressBar
          progress={completionRate}
          color={COLORS.success}
          style={{ height: 8, borderRadius: 4 }}
        />
      </Surface>
    );
  };

  const renderQuickAccess = () => (
    <View style={{ paddingHorizontal: SPACING.medium, marginBottom: SPACING.medium }}>
      <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.small }]}>Quick Access 🚀</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => setSelectedSport('Soccer')}
          style={{
            backgroundColor: '#2ed573',
            padding: SPACING.medium,
            borderRadius: 12,
            marginRight: SPACING.medium,
            alignItems: 'center',
            minWidth: 100,
          }}
        >
          <Icon name="sports-soccer" size={32} color="white" />
          <Text style={[TEXT_STYLES.body, { color: 'white', marginTop: SPACING.small, textAlign: 'center' }]}>
            Soccer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedSport('Basketball')}
          style={{
            backgroundColor: '#ff6b9d',
            padding: SPACING.medium,
            borderRadius: 12,
            marginRight: SPACING.medium,
            alignItems: 'center',
            minWidth: 100,
          }}
        >
          <Icon name="sports-basketball" size={32} color="white" />
          <Text style={[TEXT_STYLES.body, { color: 'white', marginTop: SPACING.small, textAlign: 'center' }]}>
            Basketball
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedSport('Tennis')}
          style={{
            backgroundColor: '#3742fa',
            padding: SPACING.medium,
            borderRadius: 12,
            marginRight: SPACING.medium,
            alignItems: 'center',
            minWidth: 100,
          }}
        >
          <Icon name="sports-tennis" size={32} color="white" />
          <Text style={[TEXT_STYLES.body, { color: 'white', marginTop: SPACING.small, textAlign: 'center' }]}>
            Tennis
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setFavoritesDrills([]);
            setSelectedSkill('all');
            setSelectedSport('all');
            setSelectedDifficulty('all');
            setSearchQuery('');
            Alert.alert('Filters Reset', 'All filters have been cleared! 🧹');
          }}
          style={{
            backgroundColor: COLORS.text.secondary,
            padding: SPACING.medium,
            borderRadius: 12,
            marginRight: SPACING.medium,
            alignItems: 'center',
            minWidth: 100,
          }}
        >
          <Icon name="clear-all" size={32} color="white" />
          <Text style={[TEXT_STYLES.body, { color: 'white', marginTop: SPACING.small, textAlign: 'center' }]}>
            Clear All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Alert.alert('Custom Drill', 'Create custom drill practice coming soon! 🛠️')}
          style={{
            backgroundColor: COLORS.primary,
            padding: SPACING.medium,
            borderRadius: 12,
            alignItems: 'center',
            minWidth: 100,
          }}
        >
          <Icon name="add-circle" size={32} color="white" />
          <Text style={[TEXT_STYLES.body, { color: 'white', marginTop: SPACING.small, textAlign: 'center' }]}>
            Custom
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const filteredDrills = filterDrills();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <FlatList
        data={filteredDrills}
        renderItem={renderDrillCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <>
            {renderHeader()}
            {renderStats()}
            {renderQuickAccess()}
            {renderFilters()}
            {filteredDrills.length === 0 && (
              <View style={{ 
                alignItems: 'center', 
                padding: SPACING.xxLarge,
                marginTop: SPACING.large 
              }}>
                <Icon name="search-off" size={64} color={COLORS.text.secondary} />
                <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.medium, textAlign: 'center' }]}>
                  No drill practices found
                </Text>
                <Text style={[TEXT_STYLES.body, { 
                  color: COLORS.text.secondary, 
                  textAlign: 'center',
                  marginTop: SPACING.small,
                  marginBottom: SPACING.large,
                }]}>
                  Try adjusting your search or filters
                </Text>
                <Button
                  mode="contained"
                  onPress={() => {
                    setSelectedSport('all');
                    setSelectedDifficulty('all');
                    setSelectedSkill('all');
                    setSearchQuery('');
                  }}
                  icon="refresh"
                >
                  Reset Filters
                </Button>
              </View>
            )}
          </>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.background.secondary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <FAB
        icon="video-plus"
        style={{
          position: 'absolute',
          margin: SPACING.large,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('Record Drill', 'Record your own drill practice coming soon! 🎥')}
      />

      {renderDrillModal()}
    </View>
  );
};

export default DrillPractice;