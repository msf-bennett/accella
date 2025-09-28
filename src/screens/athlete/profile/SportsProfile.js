import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Vibration,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { 
  Card,
  Button,
  Surface,
  Portal,
  Modal,
  Divider,
  IconButton,
  Chip,
  Avatar,
  ProgressBar,
  Searchbar,
  FAB,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design constants
import { COLORS, SPACING, TEXT_STYLES } from '../../constants/theme';

const SportsProfile = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { athleteProfile } = useSelector((state) => state.athlete);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addPositionModalVisible, setAddPositionModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Sports profile data
  const [sportsProfile, setSportsProfile] = useState({
    primarySport: 'Football',
    secondarySports: ['Basketball', 'Athletics'],
    primaryPosition: 'Midfielder',
    alternativePositions: ['Right Winger', 'Attacking Midfielder'],
    playingLevel: 'Youth Professional',
    experience: '5 years',
    preferredFoot: 'Right',
    height: '175 cm',
    weight: '68 kg',
    currentTeam: 'Arsenal Youth FC',
    previousTeams: ['Nairobi FC Youth', 'Stars Academy'],
    currentCoach: 'Coach Martinez',
    achievements: [
      { id: 1, title: 'Regional Champion 2024', date: '2024', type: 'team' },
      { id: 2, title: 'Best Player Award', date: '2024', type: 'individual' },
      { id: 3, title: 'Youth League Top Scorer', date: '2023', type: 'individual' },
    ],
    personalRecords: [
      { id: 1, metric: '100m Sprint', value: '12.3 seconds', date: '2024-01-15' },
      { id: 2, metric: 'Vertical Jump', value: '68 cm', date: '2024-02-10' },
      { id: 3, metric: 'Endurance Run', value: '45 minutes', date: '2024-01-20' },
    ],
    strengths: ['Dribbling', 'Passing', 'Vision', 'Ball Control'],
    areasForImprovement: ['Finishing', 'Defensive Positioning', 'Aerial Ability'],
    goals: [
      'Improve shooting accuracy by 20%',
      'Increase sprint speed',
      'Master set piece delivery',
    ],
  });

  const [editFormData, setEditFormData] = useState({});
  const [newPositionData, setNewPositionData] = useState('');

  const [availableSports] = useState([
    'Football', 'Basketball', 'Athletics', 'Swimming', 'Tennis', 
    'Rugby', 'Cricket', 'Volleyball', 'Badminton', 'Table Tennis'
  ]);

  const [footballPositions] = useState([
    'Goalkeeper', 'Right Back', 'Left Back', 'Center Back', 'Defensive Midfielder',
    'Central Midfielder', 'Midfielder', 'Right Winger', 'Left Winger', 
    'Attacking Midfielder', 'Striker', 'Center Forward'
  ]);

  const [playingLevels] = useState([
    'Beginner', 'Recreational', 'Amateur', 'Semi-Professional', 
    'Youth Professional', 'Professional', 'Elite'
  ]);

  useEffect(() => {
    // Initialize animations
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
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call to refresh sports profile
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleEditField = (field, value) => {
    setEditingField(field);
    setEditFormData({ [field]: value });
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (editingField && editFormData[editingField]) {
      setSportsProfile(prev => ({
        ...prev,
        [editingField]: editFormData[editingField]
      }));
      setEditModalVisible(false);
      setEditingField(null);
      setEditFormData({});
      Vibration.vibrate(50);
      Alert.alert('Updated! ✅', 'Your sports profile has been updated successfully.');
    }
  };

  const handleAddPosition = () => {
    if (newPositionData.trim()) {
      setSportsProfile(prev => ({
        ...prev,
        alternativePositions: [...prev.alternativePositions, newPositionData.trim()]
      }));
      setNewPositionData('');
      setAddPositionModalVisible(false);
      Vibration.vibrate(50);
    }
  };

  const handleRemovePosition = (position) => {
    setSportsProfile(prev => ({
      ...prev,
      alternativePositions: prev.alternativePositions.filter(p => p !== position)
    }));
    Vibration.vibrate(100);
  };

  const handleAddStrength = () => {
    Alert.alert('Feature Coming Soon! 🚧', 'Adding custom strengths will be available in the next update.');
  };

  const handleAddGoal = () => {
    Alert.alert('Feature Coming Soon! 🚧', 'Goal setting feature will be available in the next update.');
  };

  const getProfileCompletionScore = () => {
    const requiredFields = [
      'primarySport', 'primaryPosition', 'playingLevel', 'currentTeam',
      'height', 'weight', 'experience'
    ];
    const completedFields = requiredFields.filter(field => 
      sportsProfile[field] && sportsProfile[field] !== ''
    ).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  const getCompletionColor = () => {
    const score = getProfileCompletionScore();
    if (score >= 80) return COLORS.success;
    if (score >= 60) return '#FFA726';
    return COLORS.error;
  };

  const SportsCard = ({ title, children, icon, actionText, onAction }) => (
    <Card style={styles.sportsCard}>
      <Surface style={styles.cardHeader}>
        <View style={styles.cardHeaderContent}>
          <MaterialIcons name={icon} size={24} color="white" />
          <Text style={styles.cardTitle}>{title}</Text>
          {onAction && (
            <IconButton
              icon="edit"
              size={20}
              iconColor="white"
              onPress={onAction}
            />
          )}
        </View>
      </Surface>
      <View style={styles.cardContent}>
        {children}
      </View>
    </Card>
  );

  const InfoRow = ({ label, value, onEdit, editable = true }) => (
    <TouchableOpacity 
      style={styles.infoRow} 
      onPress={editable ? onEdit : null}
      disabled={!editable}
    >
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueContainer}>
        <Text style={styles.infoValue}>{value || 'Not set'}</Text>
        {editable && <MaterialIcons name="edit" size={16} color={COLORS.secondary} />}
      </View>
    </TouchableOpacity>
  );

  const AchievementItem = ({ achievement }) => (
    <View style={styles.achievementItem}>
      <View style={[
        styles.achievementIcon,
        { backgroundColor: achievement.type === 'team' ? `${COLORS.primary}20` : `${COLORS.success}20` }
      ]}>
        <MaterialIcons 
          name={achievement.type === 'team' ? 'group' : 'jump-rope'} 
          size={20} 
          color={achievement.type === 'team' ? COLORS.primary : COLORS.success}
        />
      </View>
      <View style={styles.achievementContent}>
        <Text style={styles.achievementTitle}>{achievement.title}</Text>
        <Text style={styles.achievementDate}>{achievement.date}</Text>
      </View>
    </View>
  );

  const RecordItem = ({ record }) => (
    <View style={styles.recordItem}>
      <View style={styles.recordContent}>
        <Text style={styles.recordMetric}>{record.metric}</Text>
        <Text style={styles.recordValue}>{record.value}</Text>
        <Text style={styles.recordDate}>{record.date}</Text>
      </View>
      <MaterialIcons name="trending-up" size={20} color={COLORS.success} />
    </View>
  );

  const SkillChip = ({ skill, type = 'strength', onRemove }) => (
    <Chip
      style={[
        styles.skillChip,
        { backgroundColor: type === 'strength' ? `${COLORS.success}20` : `${COLORS.error}20` }
      ]}
      textStyle={[
        styles.skillChipText,
        { color: type === 'strength' ? COLORS.success : COLORS.error }
      ]}
      onClose={onRemove}
    >
      {skill}
    </Chip>
  );

  const filteredSports = availableSports.filter(sport =>
    sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPositions = footballPositions.filter(position =>
    position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor="white"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>Sports Profile</Text>
          <Text style={styles.headerSubtitle}>Showcase your athletic journey ⚽</Text>
          
          <View style={styles.completionContainer}>
            <Text style={styles.completionLabel}>Profile Completion</Text>
            <ProgressBar 
              progress={getProfileCompletionScore() / 100} 
              color={getCompletionColor()}
              style={styles.completionBar}
            />
            <Text style={styles.completionText}>{getProfileCompletionScore()}% Complete</Text>
          </View>
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          style={styles.scrollView}
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
          {/* Basic Sports Information */}
          <SportsCard 
            title="Basic Information" 
            icon="sports"
            onAction={() => Alert.alert('Edit Mode! ✏️', 'Click on any field to edit it directly.')}
          >
            <InfoRow
              label="Primary Sport"
              value={sportsProfile.primarySport}
              onEdit={() => handleEditField('primarySport', sportsProfile.primarySport)}
            />
            <InfoRow
              label="Playing Level"
              value={sportsProfile.playingLevel}
              onEdit={() => handleEditField('playingLevel', sportsProfile.playingLevel)}
            />
            <InfoRow
              label="Experience"
              value={sportsProfile.experience}
              onEdit={() => handleEditField('experience', sportsProfile.experience)}
            />
            <InfoRow
              label="Current Team"
              value={sportsProfile.currentTeam}
              onEdit={() => handleEditField('currentTeam', sportsProfile.currentTeam)}
            />
            <InfoRow
              label="Current Coach"
              value={sportsProfile.currentCoach}
              onEdit={() => handleEditField('currentCoach', sportsProfile.currentCoach)}
            />
          </SportsCard>

          {/* Position Information */}
          <SportsCard 
            title="Positions" 
            icon="location-on"
            onAction={() => setAddPositionModalVisible(true)}
          >
            <InfoRow
              label="Primary Position"
              value={sportsProfile.primaryPosition}
              onEdit={() => handleEditField('primaryPosition', sportsProfile.primaryPosition)}
            />
            
            <Text style={styles.sectionSubtitle}>Alternative Positions</Text>
            <View style={styles.chipContainer}>
              {sportsProfile.alternativePositions.map((position, index) => (
                <Chip
                  key={index}
                  style={styles.positionChip}
                  onClose={() => handleRemovePosition(position)}
                >
                  {position}
                </Chip>
              ))}
              <Chip
                icon="plus"
                style={styles.addChip}
                onPress={() => setAddPositionModalVisible(true)}
              >
                Add Position
              </Chip>
            </View>
          </SportsCard>

          {/* Physical Attributes */}
          <SportsCard 
            title="Physical Attributes" 
            icon="accessibility"
          >
            <InfoRow
              label="Height"
              value={sportsProfile.height}
              onEdit={() => handleEditField('height', sportsProfile.height)}
            />
            <InfoRow
              label="Weight"
              value={sportsProfile.weight}
              onEdit={() => handleEditField('weight', sportsProfile.weight)}
            />
            <InfoRow
              label="Preferred Foot"
              value={sportsProfile.preferredFoot}
              onEdit={() => handleEditField('preferredFoot', sportsProfile.preferredFoot)}
            />
          </SportsCard>

          {/* Secondary Sports */}
          <SportsCard 
            title="Secondary Sports" 
            icon="sports-basketball"
          >
            <View style={styles.chipContainer}>
              {sportsProfile.secondarySports.map((sport, index) => (
                <Chip key={index} style={styles.sportChip}>
                  {sport}
                </Chip>
              ))}
              <Chip
                icon="plus"
                style={styles.addChip}
                onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Adding secondary sports will be available in the next update.')}
              >
                Add Sport
              </Chip>
            </View>
          </SportsCard>

          {/* Achievements */}
          <SportsCard 
            title="Achievements" 
            icon="jump-rope"
            onAction={() => Alert.alert('Feature Coming Soon! 🚧', 'Achievement management will be available in the next update.')}
          >
            {sportsProfile.achievements.map((achievement) => (
              <AchievementItem key={achievement.id} achievement={achievement} />
            ))}
            
            <Button
              mode="outlined"
              icon="add"
              style={styles.addButton}
              onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Adding achievements will be available in the next update.')}
            >
              Add Achievement
            </Button>
          </SportsCard>

          {/* Personal Records */}
          <SportsCard 
            title="Personal Records" 
            icon="speed"
            onAction={() => Alert.alert('Feature Coming Soon! 🚧', 'Record management will be available in the next update.')}
          >
            {sportsProfile.personalRecords.map((record) => (
              <RecordItem key={record.id} record={record} />
            ))}
            
            <Button
              mode="outlined"
              icon="add"
              style={styles.addButton}
              onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Adding records will be available in the next update.')}
            >
              Add Record
            </Button>
          </SportsCard>

          {/* Skills & Development */}
          <SportsCard 
            title="Strengths" 
            icon="thumb-up"
            onAction={handleAddStrength}
          >
            <View style={styles.chipContainer}>
              {sportsProfile.strengths.map((strength, index) => (
                <SkillChip 
                  key={index} 
                  skill={strength} 
                  type="strength"
                  onRemove={() => {
                    setSportsProfile(prev => ({
                      ...prev,
                      strengths: prev.strengths.filter(s => s !== strength)
                    }));
                  }}
                />
              ))}
            </View>
          </SportsCard>

          <SportsCard 
            title="Areas for Improvement" 
            icon="trending-up"
            onAction={() => Alert.alert('Feature Coming Soon! 🚧', 'Improvement area management will be available in the next update.')}
          >
            <View style={styles.chipContainer}>
              {sportsProfile.areasForImprovement.map((area, index) => (
                <SkillChip 
                  key={index} 
                  skill={area} 
                  type="improvement"
                  onRemove={() => {
                    setSportsProfile(prev => ({
                      ...prev,
                      areasForImprovement: prev.areasForImprovement.filter(a => a !== area)
                    }));
                  }}
                />
              ))}
            </View>
          </SportsCard>

          {/* Goals */}
          <SportsCard 
            title="Training Goals" 
            icon="flag"
            onAction={handleAddGoal}
          >
            {sportsProfile.goals.map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <MaterialIcons name="radio-button-unchecked" size={20} color={COLORS.primary} />
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
            
            <Button
              mode="outlined"
              icon="add"
              style={styles.addButton}
              onPress={handleAddGoal}
            >
              Add Goal
            </Button>
          </SportsCard>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        <FAB
          icon="edit"
          style={styles.fab}
          onPress={() => Alert.alert('Quick Edit! ⚡', 'Tap on any field above to edit it directly, or use the edit icons on each section.')}
          color="white"
        />
      </Animated.View>

      {/* Edit Field Modal */}
      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.blurView}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="white"
          >
            <Card style={styles.editCard}>
              <Text style={styles.editTitle}>Edit {editingField?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Text>
              
              {editingField === 'primarySport' && (
                <View style={styles.editContent}>
                  <Searchbar
                    placeholder="Search sports..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchBar}
                  />
                  <ScrollView style={styles.optionsList}>
                    {filteredSports.map((sport) => (
                      <TouchableOpacity
                        key={sport}
                        style={styles.optionItem}
                        onPress={() => {
                          setEditFormData({ primarySport: sport });
                          setSearchQuery('');
                        }}
                      >
                        <Text style={styles.optionText}>{sport}</Text>
                        {editFormData.primarySport === sport && (
                          <MaterialIcons name="check" size={20} color={COLORS.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {editingField === 'primaryPosition' && (
                <View style={styles.editContent}>
                  <Searchbar
                    placeholder="Search positions..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchBar}
                  />
                  <ScrollView style={styles.optionsList}>
                    {filteredPositions.map((position) => (
                      <TouchableOpacity
                        key={position}
                        style={styles.optionItem}
                        onPress={() => {
                          setEditFormData({ primaryPosition: position });
                          setSearchQuery('');
                        }}
                      >
                        <Text style={styles.optionText}>{position}</Text>
                        {editFormData.primaryPosition === position && (
                          <MaterialIcons name="check" size={20} color={COLORS.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {editingField === 'playingLevel' && (
                <View style={styles.editContent}>
                  {playingLevels.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={styles.optionItem}
                      onPress={() => setEditFormData({ playingLevel: level })}
                    >
                      <Text style={styles.optionText}>{level}</Text>
                      {editFormData.playingLevel === level && (
                        <MaterialIcons name="check" size={20} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {!['primarySport', 'primaryPosition', 'playingLevel'].includes(editingField) && (
                <TextInput
                  style={styles.textInput}
                  value={editFormData[editingField] || ''}
                  onChangeText={(text) => setEditFormData({ [editingField]: text })}
                  placeholder={`Enter ${editingField}`}
                  multiline={editingField === 'experience'}
                />
              )}

              <View style={styles.editActions}>
                <Button
                  mode="outlined"
                  onPress={() => setEditModalVisible(false)}
                  style={styles.editButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveEdit}
                  style={styles.editButton}
                  buttonColor={COLORS.primary}
                >
                  Save
                </Button>
              </View>
            </Card>
          </BlurView>
        </Modal>
      </Portal>

      {/* Add Position Modal */}
      <Portal>
        <Modal
          visible={addPositionModalVisible}
          onDismiss={() => setAddPositionModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.blurView}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="white"
          >
            <Card style={styles.addPositionCard}>
              <Text style={styles.addPositionTitle}>Add Alternative Position 📍</Text>
              
              <Searchbar
                placeholder="Search positions..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchBar}
              />

              <ScrollView style={styles.positionsList}>
                {filteredPositions.map((position) => (
                  <TouchableOpacity
                    key={position}
                    style={styles.positionOption}
                    onPress={() => {
                      setNewPositionData(position);
                      setSearchQuery('');
                    }}
                  >
                    <Text style={styles.positionOptionText}>{position}</Text>
                    {newPositionData === position && (
                      <MaterialIcons name="check" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.addPositionActions}>
                <Button
                  mode="outlined"
                  onPress={() => setAddPositionModalVisible(false)}
                  style={styles.positionButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddPosition}
                  style={styles.positionButton}
                  buttonColor={COLORS.primary}
                  disabled={!newPositionData}
                >
                  Add Position
                </Button>
              </View>
            </Card>
          </BlurView>
        </Modal>
      </Portal>
    </>
  );
};

const styles = {
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.lg,
  },
  completionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  completionLabel: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  completionBar: {
    width: '80%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  completionText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  sportsCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    ...TEXT_STYLES.h4,
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
    marginLeft: SPACING.sm,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  sectionSubtitle: {
    ...TEXT_STYLES.h5,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  positionChip: {
    backgroundColor: `${COLORS.primary}20`,
    marginBottom: SPACING.xs,
  },
  sportChip: {
    backgroundColor: `${COLORS.success}20`,
    marginBottom: SPACING.xs,
  },
  addChip: {
    backgroundColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  skillChip: {
    marginBottom: SPACING.xs,
  },
  skillChipText: {
    fontWeight: '600',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  achievementDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  recordContent: {
    flex: 1,
  },
  recordMetric: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  recordValue: {
    ...TEXT_STYLES.h5,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  recordDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  goalText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.md,
    flex: 1,
  },
  addButton: {
    marginTop: SPACING.md,
    borderColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: SPACING.xl * 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editCard: {
    width: '90%',
    maxHeight: '70%',
    borderRadius: 12,
    padding: SPACING.lg,
  },
  editTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  editContent: {
    maxHeight: 300,
  },
  searchBar: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  optionsList: {
    maxHeight: 200,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.background,
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  editButton: {
    flex: 0.45,
  },
  addPositionCard: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: SPACING.lg,
  },
  addPositionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  positionsList: {
    maxHeight: 300,
    marginVertical: SPACING.md,
  },
  positionOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  positionOptionText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  addPositionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  positionButton: {
    flex: 0.45,
  },
};

export default SportsProfile;