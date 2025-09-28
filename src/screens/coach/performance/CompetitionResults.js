import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  StatusBar,
  Animated,
  FlatList,
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
  Modal,
  TextInput,
  RadioButton,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width } = Dimensions.get('window');

const CompetitionResults = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const teams = useSelector(state => state.teams.teams);
  const players = useSelector(state => state.players.players);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Form state for adding/editing competition results
  const [formData, setFormData] = useState({
    competitionName: '',
    date: '',
    opponent: '',
    homeAway: 'home',
    result: '',
    score: '',
    playerStats: [],
    notes: '',
    category: 'league'
  });

  // Mock data for competition results
  const [competitionResults, setCompetitionResults] = useState([
    {
      id: 1,
      competitionName: 'Premier League',
      date: '2024-08-15',
      opponent: 'Manchester City',
      homeAway: 'away',
      result: 'loss',
      score: '1-3',
      category: 'league',
      attendance: 45000,
      playerStats: [
        { playerId: 1, playerName: 'John Doe', goals: 1, assists: 0, yellowCards: 1, redCards: 0, rating: 7.5 },
        { playerId: 2, playerName: 'Mike Johnson', goals: 0, assists: 1, yellowCards: 0, redCards: 0, rating: 8.0 }
      ],
      notes: 'Good performance despite the loss. Need to work on defensive positioning.',
      highlights: ['Goal in 23rd minute', 'Strong midfield control', 'Defensive lapses cost us']
    },
    {
      id: 2,
      competitionName: 'FA Cup',
      date: '2024-08-10',
      opponent: 'Liverpool FC',
      homeAway: 'home',
      result: 'win',
      score: '2-1',
      category: 'cup',
      attendance: 38000,
      playerStats: [
        { playerId: 1, playerName: 'John Doe', goals: 2, assists: 0, yellowCards: 0, redCards: 0, rating: 9.0 },
        { playerId: 2, playerName: 'Mike Johnson', goals: 0, assists: 2, yellowCards: 0, redCards: 0, rating: 8.5 }
      ],
      notes: 'Excellent team performance! Great attacking display.',
      highlights: ['Two brilliant goals', 'Solid defensive display', 'Great team spirit']
    },
    {
      id: 3,
      competitionName: 'Champions League',
      date: '2024-08-05',
      opponent: 'Barcelona',
      homeAway: 'away',
      result: 'draw',
      score: '2-2',
      category: 'european',
      attendance: 85000,
      playerStats: [
        { playerId: 1, playerName: 'John Doe', goals: 1, assists: 1, yellowCards: 0, redCards: 0, rating: 8.5 },
        { playerId: 2, playerName: 'Mike Johnson', goals: 1, assists: 0, yellowCards: 1, redCards: 0, rating: 7.8 }
      ],
      notes: 'Fantastic comeback from 2-0 down. Character shown by the team.',
      highlights: ['Incredible comeback', 'Late equalizer', 'Away goals advantage']
    }
  ]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Simulate loading competition results
    loadCompetitionResults();
  }, []);

  const loadCompetitionResults = useCallback(async () => {
    try {
      // In real app, fetch from API
      // const results = await competitionAPI.getResults(user.id);
      // setCompetitionResults(results);
    } catch (error) {
      console.error('Error loading competition results:', error);
      Alert.alert('Error', 'Failed to load competition results');
    }
  }, [user.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCompetitionResults().finally(() => setRefreshing(false));
  }, [loadCompetitionResults]);

  const filteredResults = competitionResults.filter(result => {
    const matchesSearch = result.competitionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.opponent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || result.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getResultColor = (result) => {
    switch (result) {
      case 'win': return COLORS.success;
      case 'loss': return COLORS.error;
      case 'draw': return COLORS.warning;
      default: return COLORS.secondary;
    }
  };

  const getResultIcon = (result) => {
    switch (result) {
      case 'win': return 'trending-up';
      case 'loss': return 'trending-down';
      case 'draw': return 'trending-flat';
      default: return 'help';
    }
  };

  const handleAddResult = () => {
    setFormData({
      competitionName: '',
      date: '',
      opponent: '',
      homeAway: 'home',
      result: '',
      score: '',
      playerStats: [],
      notes: '',
      category: 'league'
    });
    setEditModalVisible(true);
  };

  const handleEditResult = (competition) => {
    setFormData(competition);
    setSelectedCompetition(competition);
    setEditModalVisible(true);
  };

  const handleSaveResult = () => {
    if (!formData.competitionName || !formData.opponent || !formData.result) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (selectedCompetition) {
      // Edit existing result
      setCompetitionResults(prev =>
        prev.map(result =>
          result.id === selectedCompetition.id ? { ...formData, id: selectedCompetition.id } : result
        )
      );
    } else {
      // Add new result
      const newResult = {
        ...formData,
        id: Date.now(),
        playerStats: [],
        highlights: []
      };
      setCompetitionResults(prev => [newResult, ...prev]);
    }

    setEditModalVisible(false);
    setSelectedCompetition(null);
  };

  const handleDeleteResult = (resultId) => {
    Alert.alert(
      'Delete Competition Result',
      'Are you sure you want to delete this competition result?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCompetitionResults(prev => prev.filter(result => result.id !== resultId));
          }
        }
      ]
    );
  };

  const renderCompetitionCard = ({ item }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Card style={styles.competitionCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.competitionInfo}>
              <Text style={styles.competitionName}>{item.competitionName}</Text>
              <Text style={styles.competitionDate}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.resultContainer}>
              <Chip 
                mode="flat"
                style={[styles.resultChip, { backgroundColor: getResultColor(item.result) + '20' }]}
                textStyle={{ color: getResultColor(item.result), fontWeight: 'bold' }}
                icon={getResultIcon(item.result)}
              >
                {item.result.toUpperCase()}
              </Chip>
            </View>
          </View>

          <View style={styles.matchDetails}>
            <View style={styles.matchScore}>
              <Text style={styles.opponent}>{item.opponent}</Text>
              <Text style={styles.score}>{item.score}</Text>
              <Chip 
                mode="outlined" 
                compact 
                style={styles.venueChip}
                textStyle={styles.venueText}
              >
                {item.homeAway.toUpperCase()}
              </Chip>
            </View>
          </View>

          {item.highlights && item.highlights.length > 0 && (
            <View style={styles.highlightsContainer}>
              <Text style={styles.highlightsTitle}>Key Highlights:</Text>
              {item.highlights.slice(0, 2).map((highlight, index) => (
                <Text key={index} style={styles.highlight}>• {highlight}</Text>
              ))}
            </View>
          )}

          {item.playerStats && item.playerStats.length > 0 && (
            <View style={styles.statsPreview}>
              <Text style={styles.statsTitle}>Top Performers:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {item.playerStats.slice(0, 3).map((stat, index) => (
                  <Surface key={index} style={styles.playerStatCard}>
                    <Avatar.Text size={32} label={stat.playerName.split(' ').map(n => n[0]).join('')} />
                    <Text style={styles.playerStatName}>{stat.playerName.split(' ')[0]}</Text>
                    <Text style={styles.playerRating}>⭐ {stat.rating}</Text>
                  </Surface>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.cardActions}>
            <Button 
              mode="outlined" 
              compact 
              onPress={() => {
                setSelectedCompetition(item);
                setModalVisible(true);
              }}
              style={styles.actionButton}
            >
              View Details
            </Button>
            <Button 
              mode="contained" 
              compact 
              onPress={() => handleEditResult(item)}
              style={styles.actionButton}
            >
              Edit
            </Button>
            <IconButton
              icon="delete"
              size={20}
              iconColor={COLORS.error}
              onPress={() => handleDeleteResult(item.id)}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderDetailModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="dark" blurAmount={10}>
          <ScrollView style={styles.modalContent}>
            {selectedCompetition && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedCompetition.competitionName}</Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setModalVisible(false)}
                  />
                </View>

                <View style={styles.modalMatchInfo}>
                  <Text style={styles.modalOpponent}>{selectedCompetition.opponent}</Text>
                  <Text style={styles.modalScore}>{selectedCompetition.score}</Text>
                  <Chip
                    mode="flat"
                    style={[styles.modalResultChip, { backgroundColor: getResultColor(selectedCompetition.result) + '20' }]}
                    textStyle={{ color: getResultColor(selectedCompetition.result), fontWeight: 'bold' }}
                  >
                    {selectedCompetition.result.toUpperCase()}
                  </Chip>
                </View>

                <Divider style={styles.divider} />

                {selectedCompetition.playerStats && selectedCompetition.playerStats.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Player Statistics</Text>
                    {selectedCompetition.playerStats.map((stat, index) => (
                      <Surface key={index} style={styles.playerDetailCard}>
                        <View style={styles.playerDetailHeader}>
                          <Avatar.Text size={40} label={stat.playerName.split(' ').map(n => n[0]).join('')} />
                          <View style={styles.playerDetailInfo}>
                            <Text style={styles.playerDetailName}>{stat.playerName}</Text>
                            <Text style={styles.playerDetailRating}>Rating: {stat.rating}/10</Text>
                          </View>
                        </View>
                        <View style={styles.playerDetailStats}>
                          <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stat.goals}</Text>
                            <Text style={styles.statLabel}>Goals</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stat.assists}</Text>
                            <Text style={styles.statLabel}>Assists</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stat.yellowCards}</Text>
                            <Text style={styles.statLabel}>Yellow</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stat.redCards}</Text>
                            <Text style={styles.statLabel}>Red</Text>
                          </View>
                        </View>
                      </Surface>
                    ))}
                  </>
                )}

                {selectedCompetition.notes && (
                  <>
                    <Text style={styles.sectionTitle}>Coach Notes</Text>
                    <Surface style={styles.notesContainer}>
                      <Text style={styles.notesText}>{selectedCompetition.notes}</Text>
                    </Surface>
                  </>
                )}
              </>
            )}
          </ScrollView>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderEditModal = () => (
    <Portal>
      <Modal
        visible={editModalVisible}
        onDismiss={() => setEditModalVisible(false)}
        contentContainerStyle={styles.editModalContainer}
      >
        <ScrollView style={styles.editModalContent}>
          <Text style={styles.editModalTitle}>
            {selectedCompetition ? 'Edit Competition Result' : 'Add Competition Result'}
          </Text>

          <TextInput
            label="Competition Name *"
            value={formData.competitionName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, competitionName: text }))}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Opponent *"
            value={formData.opponent}
            onChangeText={(text) => setFormData(prev => ({ ...prev, opponent: text }))}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Date"
            value={formData.date}
            onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
            style={styles.input}
            mode="outlined"
            placeholder="YYYY-MM-DD"
          />

          <TextInput
            label="Score"
            value={formData.score}
            onChangeText={(text) => setFormData(prev => ({ ...prev, score: text }))}
            style={styles.input}
            mode="outlined"
            placeholder="2-1"
          />

          <Text style={styles.radioGroupTitle}>Result *</Text>
          <RadioButton.Group
            onValueChange={value => setFormData(prev => ({ ...prev, result: value }))}
            value={formData.result}
          >
            <View style={styles.radioContainer}>
              <View style={styles.radioOption}>
                <RadioButton value="win" />
                <Text>Win</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="draw" />
                <Text>Draw</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="loss" />
                <Text>Loss</Text>
              </View>
            </View>
          </RadioButton.Group>

          <Text style={styles.radioGroupTitle}>Venue</Text>
          <RadioButton.Group
            onValueChange={value => setFormData(prev => ({ ...prev, homeAway: value }))}
            value={formData.homeAway}
          >
            <View style={styles.radioContainer}>
              <View style={styles.radioOption}>
                <RadioButton value="home" />
                <Text>Home</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="away" />
                <Text>Away</Text>
              </View>
            </View>
          </RadioButton.Group>

          <TextInput
            label="Notes"
            value={formData.notes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
          />

          <View style={styles.editModalActions}>
            <Button
              mode="outlined"
              onPress={() => setEditModalVisible(false)}
              style={styles.modalActionButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveResult}
              style={styles.modalActionButton}
            >
              Save
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>Competition Results 🏆</Text>
        <Text style={styles.headerSubtitle}>Track and analyze match performances</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Searchbar
          placeholder="Search competitions or opponents..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {[
            { key: 'all', label: 'All', icon: 'sports-soccer' },
            { key: 'league', label: 'League', icon: 'jump-rope' },
            { key: 'cup', label: 'Cup', icon: 'military-tech' },
            { key: 'european', label: 'European', icon: 'public' },
          ].map(filter => (
            <Chip
              key={filter.key}
              mode={selectedFilter === filter.key ? 'flat' : 'outlined'}
              selected={selectedFilter === filter.key}
              onPress={() => setSelectedFilter(filter.key)}
              style={[
                styles.filterChip,
                selectedFilter === filter.key && { backgroundColor: COLORS.primary + '20' }
              ]}
              icon={filter.icon}
            >
              {filter.label}
            </Chip>
          ))}
        </ScrollView>

        <FlatList
          data={filteredResults}
          renderItem={renderCompetitionCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="sports-soccer" size={64} color={COLORS.secondary} />
              <Text style={styles.emptyTitle}>No Competition Results</Text>
              <Text style={styles.emptySubtitle}>Add your first competition result to get started</Text>
            </View>
          )}
        />
      </View>

      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={handleAddResult}
      />

      {renderDetailModal()}
      {renderEditModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  searchbar: {
    marginVertical: SPACING.md,
    elevation: 2,
  },
  filterContainer: {
    marginBottom: SPACING.md,
  },
  filterContent: {
    paddingHorizontal: SPACING.xs,
  },
  filterChip: {
    marginHorizontal: SPACING.xs,
  },
  listContainer: {
    paddingBottom: SPACING.xl * 2,
  },
  competitionCard: {
    marginBottom: SPACING.md,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  competitionInfo: {
    flex: 1,
  },
  competitionName: {
    ...TEXT_STYLES.subheading,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  competitionDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  resultContainer: {
    alignItems: 'flex-end',
  },
  resultChip: {
    borderRadius: SPACING.sm,
  },
  matchDetails: {
    marginBottom: SPACING.sm,
  },
  matchScore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  opponent: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    flex: 1,
  },
  score: {
    ...TEXT_STYLES.heading,
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginHorizontal: SPACING.sm,
  },
  venueChip: {
    borderRadius: SPACING.xs,
  },
  venueText: {
    fontSize: 12,
  },
  highlightsContainer: {
    marginBottom: SPACING.sm,
  },
  highlightsTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    color: COLORS.primary,
  },
  highlight: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginBottom: 2,
  },
  statsPreview: {
    marginBottom: SPACING.sm,
  },
  statsTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    color: COLORS.primary,
  },
  playerStatCard: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: SPACING.sm,
    alignItems: 'center',
    minWidth: 80,
  },
  playerStatName: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  playerRating: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    marginRight: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.subheading,
    color: COLORS.secondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: SPACING.md,
    borderRadius: SPACING.md,
    maxHeight: '90%',
    width: width - SPACING.md * 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.subheading,
    fontWeight: 'bold',
    flex: 1,
  },
  modalMatchInfo: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  modalOpponent: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  modalScore: {
    ...TEXT_STYLES.heading,
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  modalResultChip: {
    borderRadius: SPACING.sm,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheading,
    fontWeight: 'bold',
    margin: SPACING.md,
    color: COLORS.primary,
  },
  playerDetailCard: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
  },
  playerDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  playerDetailInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  playerDetailName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  playerDetailRating: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  playerDetailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.subheading,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  notesContainer: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
  },
  notesText: {
    ...TEXT_STYLES.body,
    lineHeight: 20,
  },
  editModalContainer: {
    backgroundColor: 'white',
    margin: SPACING.md,
    borderRadius: SPACING.md,
    maxHeight: '90%',
  },
  editModalContent: {
    padding: SPACING.md,
  },
  editModalTitle: {
    ...TEXT_STYLES.subheading,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  input: {
    marginBottom: SPACING.md,
  },
  radioGroupTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    color: COLORS.primary,
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  editModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalActionButton: {
    flex: 0.45,
  },
});

export default CompetitionResults;