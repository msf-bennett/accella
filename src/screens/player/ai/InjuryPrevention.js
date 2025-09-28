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
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const InjuryPreventionScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { players } = useSelector(state => state.players);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Mock data for injury prevention
  const [injuryData, setInjuryData] = useState({
    riskAssessments: [
      {
        id: '1',
        playerName: 'Marcus Johnson',
        avatar: 'MJ',
        riskLevel: 'high',
        riskScore: 85,
        mainRisks: ['Ankle instability', 'Hamstring tightness'],
        lastAssessment: '2 days ago',
        recommendations: 3,
      },
      {
        id: '2',
        playerName: 'Sarah Williams',
        avatar: 'SW',
        riskLevel: 'medium',
        riskScore: 45,
        mainRisks: ['Knee tracking', 'Core weakness'],
        lastAssessment: '1 week ago',
        recommendations: 2,
      },
      {
        id: '3',
        playerName: 'David Chen',
        avatar: 'DC',
        riskLevel: 'low',
        riskScore: 20,
        mainRisks: ['Minor flexibility issues'],
        lastAssessment: '3 days ago',
        recommendations: 1,
      },
    ],
    preventionPrograms: [
      {
        id: '1',
        title: 'FIFA 11+ Warm-up',
        description: 'Complete injury prevention warm-up routine',
        duration: '20 min',
        bodyParts: ['Knee', 'Ankle', 'Core'],
        difficulty: 'Beginner',
        effectiveness: 92,
        icon: 'sports-soccer',
      },
      {
        id: '2',
        title: 'ACL Prevention Protocol',
        description: 'Specialized program to prevent ACL injuries',
        duration: '30 min',
        bodyParts: ['Knee', 'Hip', 'Glutes'],
        difficulty: 'Intermediate',
        effectiveness: 87,
        icon: 'healing',
      },
      {
        id: '3',
        title: 'Shoulder Stability Series',
        description: 'Exercises to prevent shoulder injuries',
        duration: '15 min',
        bodyParts: ['Shoulder', 'Rotator Cuff'],
        difficulty: 'Advanced',
        effectiveness: 84,
        icon: 'accessibility',
      },
    ],
    teamStats: {
      totalPlayers: 24,
      highRisk: 3,
      mediumRisk: 8,
      lowRisk: 13,
      injuryReduction: 68,
      complianceRate: 82,
    },
  });

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
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'high':
        return COLORS.error;
      case 'medium':
        return '#ff9800';
      case 'low':
        return COLORS.success;
      default:
        return COLORS.primary;
    }
  };

  const getRiskLevelIcon = (level) => {
    switch (level) {
      case 'high':
        return 'warning';
      case 'medium':
        return 'error-outline';
      case 'low':
        return 'check-circle';
      default:
        return 'help-outline';
    }
  };

  const filteredPlayers = injuryData.riskAssessments.filter(player => {
    const matchesSearch = player.playerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = selectedRiskLevel === 'all' || player.riskLevel === selectedRiskLevel;
    return matchesSearch && matchesRisk;
  });

  const handlePlayerPress = (player) => {
    Alert.alert(
      'Player Risk Assessment',
      `Detailed injury risk analysis for ${player.playerName} will be available in the full app.`,
      [{ text: 'OK' }]
    );
  };

  const handleProgramPress = (program) => {
    Alert.alert(
      'Prevention Program',
      `${program.title} details and implementation guide will be available in the full app.`,
      [{ text: 'OK' }]
    );
  };

  const handleStartAssessment = () => {
    Alert.alert(
      'AI Risk Assessment',
      'The AI-powered injury risk assessment tool will be available in the full app.',
      [{ text: 'OK' }]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>
          🛡️ AI Injury Prevention
        </Text>
        <Text style={[TEXT_STYLES.caption, styles.headerSubtitle]}>
          Prevent injuries before they happen
        </Text>
      </View>
    </LinearGradient>
  );

  const renderStatsOverview = () => (
    <Animated.View
      style={[
        styles.statsContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="group" size={24} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.h2, styles.statNumber]}>
                {injuryData.teamStats.totalPlayers}
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.statLabel]}>
                Total Players
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="trending-down" size={24} color={COLORS.success} />
              <Text style={[TEXT_STYLES.h2, styles.statNumber]}>
                {injuryData.teamStats.injuryReduction}%
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.statLabel]}>
                Injury Reduction
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="assignment-turned-in" size={24} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.h2, styles.statNumber]}>
                {injuryData.teamStats.complianceRate}%
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.statLabel]}>
                Compliance Rate
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderRiskDistribution = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Icon name="donut-large" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, styles.cardTitle]}>
            Risk Distribution
          </Text>
        </View>
        
        <View style={styles.riskDistribution}>
          <View style={styles.riskItem}>
            <View style={[styles.riskIndicator, { backgroundColor: COLORS.error }]} />
            <Text style={TEXT_STYLES.body}>High Risk</Text>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.error }]}>
              {injuryData.teamStats.highRisk}
            </Text>
          </View>
          
          <View style={styles.riskItem}>
            <View style={[styles.riskIndicator, { backgroundColor: '#ff9800' }]} />
            <Text style={TEXT_STYLES.body}>Medium Risk</Text>
            <Text style={[TEXT_STYLES.h3, { color: '#ff9800' }]}>
              {injuryData.teamStats.mediumRisk}
            </Text>
          </View>
          
          <View style={styles.riskItem}>
            <View style={[styles.riskIndicator, { backgroundColor: COLORS.success }]} />
            <Text style={TEXT_STYLES.body}>Low Risk</Text>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
              {injuryData.teamStats.lowRisk}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search players..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.primary}
        inputStyle={TEXT_STYLES.body}
      />
      
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'high', 'medium', 'low'].map((risk) => (
            <Chip
              key={risk}
              selected={selectedRiskLevel === risk}
              onPress={() => setSelectedRiskLevel(risk)}
              style={[
                styles.filterChip,
                selectedRiskLevel === risk && styles.selectedChip,
              ]}
              textStyle={[
                TEXT_STYLES.caption,
                selectedRiskLevel === risk && styles.selectedChipText,
              ]}
            >
              {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
            </Chip>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderPlayerRiskCard = (player) => (
    <TouchableOpacity
      key={player.id}
      onPress={() => handlePlayerPress(player)}
      activeOpacity={0.7}
    >
      <Card style={styles.playerCard}>
        <Card.Content>
          <View style={styles.playerHeader}>
            <Avatar.Text
              size={48}
              label={player.avatar}
              style={styles.avatar}
            />
            
            <View style={styles.playerInfo}>
              <Text style={[TEXT_STYLES.h4, styles.playerName]}>
                {player.playerName}
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.lastAssessment]}>
                Last assessment: {player.lastAssessment}
              </Text>
            </View>
            
            <View style={styles.riskBadge}>
              <Icon
                name={getRiskLevelIcon(player.riskLevel)}
                size={20}
                color={getRiskLevelColor(player.riskLevel)}
              />
              <Text style={[TEXT_STYLES.caption, { color: getRiskLevelColor(player.riskLevel) }]}>
                {player.riskLevel.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.riskScoreContainer}>
            <Text style={[TEXT_STYLES.caption, styles.riskScoreLabel]}>
              Risk Score: {player.riskScore}/100
            </Text>
            <ProgressBar
              progress={player.riskScore / 100}
              color={getRiskLevelColor(player.riskLevel)}
              style={styles.progressBar}
            />
          </View>
          
          <View style={styles.mainRisks}>
            <Text style={[TEXT_STYLES.caption, styles.risksLabel]}>
              Main Risk Areas:
            </Text>
            <View style={styles.riskTags}>
              {player.mainRisks.map((risk, index) => (
                <Chip
                  key={index}
                  compact
                  style={styles.riskTag}
                  textStyle={styles.riskTagText}
                >
                  {risk}
                </Chip>
              ))}
            </View>
          </View>
          
          <View style={styles.recommendationsCount}>
            <Icon name="lightbulb-outline" size={16} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.caption, styles.recommendationsText]}>
              {player.recommendations} AI recommendations available
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderPreventionPrograms = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon name="fitness-center" size={24} color={COLORS.primary} />
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
          Prevention Programs
        </Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {injuryData.preventionPrograms.map((program) => (
          <TouchableOpacity
            key={program.id}
            onPress={() => handleProgramPress(program)}
            activeOpacity={0.7}
          >
            <Card style={styles.programCard}>
              <Card.Content>
                <View style={styles.programHeader}>
                  <Icon
                    name={program.icon}
                    size={32}
                    color={COLORS.primary}
                    style={styles.programIcon}
                  />
                  <View style={styles.effectivenessContainer}>
                    <Text style={[TEXT_STYLES.caption, styles.effectivenessLabel]}>
                      Effectiveness
                    </Text>
                    <Text style={[TEXT_STYLES.h4, { color: COLORS.success }]}>
                      {program.effectiveness}%
                    </Text>
                  </View>
                </View>
                
                <Text style={[TEXT_STYLES.h4, styles.programTitle]}>
                  {program.title}
                </Text>
                
                <Text style={[TEXT_STYLES.caption, styles.programDescription]}>
                  {program.description}
                </Text>
                
                <View style={styles.programDetails}>
                  <View style={styles.detailItem}>
                    <Icon name="schedule" size={16} color={COLORS.primary} />
                    <Text style={[TEXT_STYLES.caption, styles.detailText]}>
                      {program.duration}
                    </Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Icon name="trending-up" size={16} color={COLORS.primary} />
                    <Text style={[TEXT_STYLES.caption, styles.detailText]}>
                      {program.difficulty}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.bodyParts}>
                  {program.bodyParts.map((part, index) => (
                    <Chip
                      key={index}
                      compact
                      style={styles.bodyPartChip}
                      textStyle={styles.bodyPartText}
                    >
                      {part}
                    </Chip>
                  ))}
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" translucent />
      
      {renderHeader()}
      
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
        {renderStatsOverview()}
        {renderRiskDistribution()}
        {renderSearchAndFilters()}
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="person-search" size={24} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              Player Risk Assessment
            </Text>
          </View>
          
          {filteredPlayers.map(renderPlayerRiskCard)}
        </View>
        
        {renderPreventionPrograms()}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      <FAB
        style={styles.fab}
        icon="add"
        onPress={handleStartAssessment}
        color="white"
        customSize={56}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    margin: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statsCard: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    marginTop: SPACING.xs,
    color: COLORS.primary,
  },
  statLabel: {
    marginTop: SPACING.xs,
    textAlign: 'center',
    opacity: 0.7,
  },
  card: {
    margin: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    marginLeft: SPACING.sm,
    color: COLORS.primary,
  },
  riskDistribution: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  riskItem: {
    alignItems: 'center',
    flex: 1,
  },
  riskIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchbar: {
    elevation: 2,
    marginBottom: SPACING.sm,
  },
  filterContainer: {
    marginTop: SPACING.sm,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  selectedChipText: {
    color: 'white',
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    marginLeft: SPACING.sm,
    color: COLORS.primary,
  },
  playerCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    backgroundColor: COLORS.primary,
  },
  playerInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  playerName: {
    marginBottom: SPACING.xs,
  },
  lastAssessment: {
    opacity: 0.7,
  },
  riskBadge: {
    alignItems: 'center',
  },
  riskScoreContainer: {
    marginBottom: SPACING.md,
  },
  riskScoreLabel: {
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  mainRisks: {
    marginBottom: SPACING.sm,
  },
  risksLabel: {
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  riskTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  riskTag: {
    backgroundColor: '#f5f5f5',
  },
  riskTagText: {
    fontSize: 12,
  },
  recommendationsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  recommendationsText: {
    marginLeft: SPACING.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  programCard: {
    width: width * 0.8,
    marginRight: SPACING.md,
    elevation: 2,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  programIcon: {
    marginBottom: SPACING.xs,
  },
  effectivenessContainer: {
    alignItems: 'flex-end',
  },
  effectivenessLabel: {
    opacity: 0.7,
  },
  programTitle: {
    marginBottom: SPACING.xs,
    color: COLORS.primary,
  },
  programDescription: {
    marginBottom: SPACING.md,
    opacity: 0.8,
  },
  programDetails: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  detailText: {
    marginLeft: SPACING.xs,
  },
  bodyParts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  bodyPartChip: {
    backgroundColor: '#e3f2fd',
  },
  bodyPartText: {
    fontSize: 11,
    color: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  bottomPadding: {
    height: 100,
  },
};

export default InjuryPreventionScreen;