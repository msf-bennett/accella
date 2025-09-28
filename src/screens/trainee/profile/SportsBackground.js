import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Dialog,
  Searchbar,
  ProgressBar,
  Divider,
  List,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width, height } = Dimensions.get('window');

const SportsBackground = ({ navigation }) => {
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddSportDialog, setShowAddSportDialog] = useState(false);
  const [showExperienceDialog, setShowExperienceDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState(null);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');

  // Redux state
  const dispatch = useDispatch();
  const { user, sportsBackground } = useSelector(state => state.profile);

  // Mock data - replace with actual data from Redux
  const [userSports, setUserSports] = useState([
    {
      id: 1,
      sport: 'Football',
      level: 'Intermediate',
      years: 5,
      achievements: ['Regional Championship 2022', 'MVP Award 2023'],
      position: 'Midfielder',
      icon: 'sports-soccer',
      progress: 75,
    },
    {
      id: 2,
      sport: 'Basketball',
      level: 'Beginner',
      years: 2,
      achievements: ['Team Captain'],
      position: 'Point Guard',
      icon: 'sports-basketball',
      progress: 40,
    },
  ]);

  const availableSports = [
    { name: 'Football', icon: 'sports-soccer', category: 'Team Sports' },
    { name: 'Basketball', icon: 'sports-basketball', category: 'Team Sports' },
    { name: 'Tennis', icon: 'sports-tennis', category: 'Individual Sports' },
    { name: 'Swimming', icon: 'pool', category: 'Water Sports' },
    { name: 'Running', icon: 'directions-run', category: 'Athletics' },
    { name: 'Cycling', icon: 'directions-bike', category: 'Cycling' },
    { name: 'Boxing', icon: 'sports-mma', category: 'Combat Sports' },
    { name: 'Yoga', icon: 'self-improvement', category: 'Fitness' },
    { name: 'Weightlifting', icon: 'fitness-center', category: 'Strength' },
    { name: 'Baseball', icon: 'sports-baseball', category: 'Team Sports' },
  ];

  const experienceLevels = [
    { label: 'Beginner', value: 'beginner', color: COLORS.success, description: '0-1 years' },
    { label: 'Intermediate', value: 'intermediate', color: COLORS.primary, description: '2-5 years' },
    { label: 'Advanced', value: 'advanced', color: COLORS.secondary, description: '5+ years' },
    { label: 'Professional', value: 'professional', color: '#FF6B35', description: 'Competitive level' },
  ];

  // Component lifecycle
  useEffect(() => {
    startEntranceAnimation();
  }, []);

  const startEntranceAnimation = () => {
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
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Implement refresh logic
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleAddSport = () => {
    if (selectedSport && experienceLevel && yearsOfExperience) {
      const newSport = {
        id: Date.now(),
        sport: selectedSport.name,
        level: experienceLevel,
        years: parseInt(yearsOfExperience),
        achievements: [],
        position: '',
        icon: selectedSport.icon,
        progress: experienceLevel === 'beginner' ? 25 : 
                 experienceLevel === 'intermediate' ? 50 :
                 experienceLevel === 'advanced' ? 75 : 90,
      };
      
      setUserSports([...userSports, newSport]);
      setShowAddSportDialog(false);
      setSelectedSport(null);
      setExperienceLevel('');
      setYearsOfExperience('');
      
      Alert.alert('Success! 🎉', 'Sport added to your profile');
    } else {
      Alert.alert('Missing Information', 'Please fill in all required fields');
    }
  };

  const handleRemoveSport = (sportId) => {
    Alert.alert(
      'Remove Sport',
      'Are you sure you want to remove this sport from your profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setUserSports(userSports.filter(sport => sport.id !== sportId));
          }
        },
      ]
    );
  };

  const renderSportCard = (sport) => (
    <Animated.View
      key={sport.id}
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: fadeAnim,
        marginBottom: SPACING.md,
      }}
    >
      <Card style={{ backgroundColor: 'white', elevation: 4 }}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{
            height: 120,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <IconButton
            icon="close"
            size={20}
            iconColor="white"
            style={{
              position: 'absolute',
              top: 5,
              right: 5,
              backgroundColor: 'rgba(255,255,255,0.2)',
            }}
            onPress={() => handleRemoveSport(sport.id)}
          />
          
          <Avatar.Icon
            size={60}
            icon={sport.icon}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
          <Text style={[TEXT_STYLES.h3, { color: 'white', marginTop: SPACING.sm }]}>
            {sport.sport}
          </Text>
        </LinearGradient>
        
        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
            <Chip
              mode="outlined"
              style={{
                backgroundColor: sport.level === 'Professional' ? '#FF6B35' :
                               sport.level === 'Advanced' ? COLORS.secondary :
                               sport.level === 'Intermediate' ? COLORS.primary : COLORS.success
              }}
            >
              {sport.level}
            </Chip>
            <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
              {sport.years} {sport.years === 1 ? 'year' : 'years'}
            </Text>
          </View>

          <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>
            Progress Level
          </Text>
          <ProgressBar
            progress={sport.progress / 100}
            color={COLORS.primary}
            style={{ height: 6, borderRadius: 3, marginBottom: SPACING.sm }}
          />

          {sport.position && (
            <View style={{ marginBottom: SPACING.sm }}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Position: <Text style={{ fontWeight: 'bold' }}>{sport.position}</Text>
              </Text>
            </View>
          )}

          {sport.achievements.length > 0 && (
            <View>
              <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>
                Achievements 🏆
              </Text>
              {sport.achievements.map((achievement, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  compact
                  style={{ marginRight: SPACING.xs, marginBottom: SPACING.xs }}
                >
                  {achievement}
                </Chip>
              ))}
            </View>
          )}
        </Card.Content>
        
        <Card.Actions>
          <Button
            mode="text"
            onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Edit sport functionality will be available soon.')}
          >
            Edit Details
          </Button>
          <Button
            mode="text"
            onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Add achievements functionality will be available soon.')}
          >
            Add Achievement
          </Button>
        </Card.Actions>
      </Card>
    </Animated.View>
  );

  const renderStatsCard = () => (
    <Card style={{ backgroundColor: 'white', elevation: 4, marginBottom: SPACING.md }}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ padding: SPACING.md, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
      >
        <Text style={[TEXT_STYLES.h3, { color: 'white', textAlign: 'center' }]}>
          Sports Profile Stats 📊
        </Text>
      </LinearGradient>
      
      <Card.Content style={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>{userSports.length}</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Sports</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
              {userSports.reduce((total, sport) => total + sport.years, 0)}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Total Years</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.secondary }]}>
              {userSports.reduce((total, sport) => total + sport.achievements.length, 0)}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Achievements</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderAddSportDialog = () => (
    <Portal>
      <Dialog visible={showAddSportDialog} onDismiss={() => setShowAddSportDialog(false)}>
        <Dialog.Title>Add New Sport 🏃‍♂️</Dialog.Title>
        <Dialog.Content>
          <Searchbar
            placeholder="Search sports..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ marginBottom: SPACING.md }}
          />
          
          <ScrollView style={{ maxHeight: 200, marginBottom: SPACING.md }}>
            {availableSports
              .filter(sport => 
                sport.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !userSports.some(userSport => userSport.sport === sport.name)
              )
              .map((sport, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedSport(sport)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: SPACING.sm,
                    backgroundColor: selectedSport?.name === sport.name ? COLORS.primaryLight : 'transparent',
                    borderRadius: 8,
                    marginBottom: SPACING.xs,
                  }}
                >
                  <MaterialIcons name={sport.icon} size={24} color={COLORS.primary} />
                  <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
                    <Text style={TEXT_STYLES.body}>{sport.name}</Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                      {sport.category}
                    </Text>
                  </View>
                  {selectedSport?.name === sport.name && (
                    <MaterialIcons name="check-circle" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))
            }
          </ScrollView>

          {selectedSport && (
            <View>
              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>
                Experience Level
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md }}>
                {experienceLevels.map((level) => (
                  <Chip
                    key={level.value}
                    mode={experienceLevel === level.value ? 'flat' : 'outlined'}
                    selected={experienceLevel === level.value}
                    onPress={() => setExperienceLevel(level.value)}
                    style={{
                      marginRight: SPACING.xs,
                      marginBottom: SPACING.xs,
                      backgroundColor: experienceLevel === level.value ? level.color : 'transparent',
                    }}
                  >
                    {level.label}
                  </Chip>
                ))}
              </View>
            </View>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowAddSportDialog(false)}>Cancel</Button>
          <Button
            mode="contained"
            onPress={handleAddSport}
            disabled={!selectedSport || !experienceLevel}
          >
            Add Sport
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

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
          paddingTop: Platform.OS === 'ios' ? 50 : 30,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <IconButton
            icon="arrow-back"
            size={24}
            iconColor="white"
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.h2, { color: 'white', flex: 1, textAlign: 'center' }]}>
            Sports Background
          </Text>
          <IconButton
            icon="help-outline"
            size={24}
            iconColor="white"
            onPress={() => Alert.alert('Sports Background', 'Add and manage your sports experience, achievements, and skill levels to help coaches understand your athletic background.')}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md }}
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
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Stats Card */}
          {renderStatsCard()}

          {/* Sports List */}
          <View style={{ marginBottom: SPACING.xl }}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.textPrimary }]}>
              My Sports 🏃‍♂️
            </Text>
            
            {userSports.length === 0 ? (
              <Card style={{ backgroundColor: 'white', elevation: 2, padding: SPACING.lg }}>
                <View style={{ alignItems: 'center' }}>
                  <MaterialIcons name="sports" size={60} color={COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
                    No Sports Added Yet
                  </Text>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm }]}>
                    Add your sports background to help coaches understand your athletic experience
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() => setShowAddSportDialog(true)}
                    style={{ marginTop: SPACING.md }}
                  >
                    Add Your First Sport
                  </Button>
                </View>
              </Card>
            ) : (
              userSports.map(sport => renderSportCard(sport))
            )}
          </View>

          {/* Quick Actions */}
          <Card style={{ backgroundColor: 'white', elevation: 4, marginBottom: SPACING.md }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.textPrimary }]}>
                Quick Actions ⚡
              </Text>
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Button
                  mode="outlined"
                  icon="add"
                  onPress={() => setShowAddSportDialog(true)}
                  style={{ marginRight: SPACING.sm, marginBottom: SPACING.sm }}
                >
                  Add Sport
                </Button>
                <Button
                  mode="outlined"
                  icon="timeline"
                  onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Performance history will be available soon.')}
                  style={{ marginRight: SPACING.sm, marginBottom: SPACING.sm }}
                >
                  View Progress
                </Button>
                <Button
                  mode="outlined"
                  icon="share"
                  onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Share profile functionality will be available soon.')}
                  style={{ marginBottom: SPACING.sm }}
                >
                  Share Profile
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Tips Card */}
          <Card style={{ backgroundColor: 'white', elevation: 2 }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <MaterialIcons name="lightbulb" size={24} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm, color: COLORS.textPrimary }]}>
                  Pro Tips 💡
                </Text>
              </View>
              
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: SPACING.sm }]}>
                • Add all sports you've participated in, even recreationally
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: SPACING.sm }]}>
                • Update your experience level as you progress
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: SPACING.sm }]}>
                • Include achievements to showcase your accomplishments
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
                • Coaches use this info to create personalized training plans
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Add Sport Dialog */}
      {renderAddSportDialog()}

      {/* Floating Action Button */}
      {userSports.length > 0 && (
        <FAB
          icon="add"
          style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0,
            backgroundColor: COLORS.primary,
          }}
          onPress={() => setShowAddSportDialog(true)}
        />
      )}
    </View>
  );
};

export default SportsBackground;