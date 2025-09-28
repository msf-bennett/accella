import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Alert,
  Vibration,
  ImageBackground,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  Portal,
  Modal,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const FamousAthletes = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [favoriteAthletes, setFavoriteAthletes] = useState(['messi', 'serena']);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Sample famous athletes data
  const [athletes, setAthletes] = useState([
    {
      id: 'messi',
      name: 'Lionel Messi',
      sport: 'Football',
      country: 'Argentina',
      age: 36,
      position: 'Forward',
      achievements: [
        '8× Ballon d\'Or Winner',
        'World Cup Champion 2022',
        '4× Champions League Winner',
        '10× La Liga Champion'
      ],
      funFacts: [
        'Started playing at age 4 🧒',
        'Only 5\'7" tall but mighty! 💪',
        'Has scored 800+ career goals ⚽',
        'Left-footed magician ✨'
      ],
      inspiration: 'Never give up on your dreams, no matter how small you start!',
      quote: 'You have to fight to reach your dream. You have to sacrifice and work hard for it.',
      lessonsForKids: [
        'Practice makes perfect',
        'Size doesn\'t limit your potential',
        'Teamwork wins championships',
        'Stay humble in victory'
      ],
      color: '#1E88E5',
      icon: 'sports_soccer',
      rating: 4.9,
      imageUrl: 'athlete_placeholder_1'
    },
    {
      id: 'serena',
      name: 'Serena Williams',
      sport: 'Tennis',
      country: 'USA',
      age: 42,
      position: 'Singles/Doubles',
      achievements: [
        '23 Grand Slam Singles Titles',
        '4× Olympic Gold Medalist',
        '319 weeks as World No. 1',
        'Career Golden Slam'
      ],
      funFacts: [
        'Started tennis at age 3 🎾',
        'Won first Grand Slam at 17 🏆',
        'Strongest serve in women\'s tennis ⚡',
        'Fashion designer too! 👗'
      ],
      inspiration: 'Believe in yourself and break every barrier in your way!',
      quote: 'I really think a champion is defined not by their wins but by how they can recover when they fall.',
      lessonsForKids: [
        'Confidence is your superpower',
        'Learn from every loss',
        'Support other women',
        'Be yourself always'
      ],
      color: '#E91E63',
      icon: 'sports_tennis',
      rating: 4.8,
      imageUrl: 'athlete_placeholder_2'
    },
    {
      id: 'lebron',
      name: 'LeBron James',
      sport: 'Basketball',
      country: 'USA',
      age: 39,
      position: 'Small Forward',
      achievements: [
        '4× NBA Champion',
        '4× NBA Finals MVP',
        '19× NBA All-Star',
        '2× Olympic Gold Medal'
      ],
      funFacts: [
        'Nicknamed "The King" 👑',
        'Can play all 5 positions 🏀',
        'Opened a school for kids 🏫',
        'Social media star too! 📱'
      ],
      inspiration: 'Use your platform to help others and never stop learning!',
      quote: 'You have to be able to accept failure to get better.',
      lessonsForKids: [
        'Help others succeed',
        'Education is important',
        'Be a leader on and off court',
        'Give back to your community'
      ],
      color: '#FF9800',
      icon: 'sports_basketball',
      rating: 4.9,
      imageUrl: 'athlete_placeholder_3'
    },
    {
      id: 'usain',
      name: 'Usain Bolt',
      sport: 'Track & Field',
      country: 'Jamaica',
      age: 37,
      position: 'Sprinter',
      achievements: [
        '8× Olympic Gold Medalist',
        '11× World Champion',
        '100m World Record Holder',
        '200m World Record Holder'
      ],
      funFacts: [
        'Fastest human ever! ⚡',
        'Loves to dance 💃',
        '6\'5" tall sprinting giant 📏',
        'Lightning bolt celebration ⚡'
      ],
      inspiration: 'Speed comes from within - believe you can be the fastest!',
      quote: 'I know what I can do, so I never give up.',
      lessonsForKids: [
        'Believe in your abilities',
        'Have fun while competing',
        'Set world-changing goals',
        'Stay positive always'
      ],
      color: '#4CAF50',
      icon: 'directions_run',
      rating: 4.8,
      imageUrl: 'athlete_placeholder_4'
    },
    {
      id: 'simone',
      name: 'Simone Biles',
      sport: 'Gymnastics',
      country: 'USA',
      age: 26,
      position: 'All-Around',
      achievements: [
        '7× Olympic Medalist',
        '25× World Championship Medalist',
        '4 Skills Named After Her',
        'Most Decorated Gymnast Ever'
      ],
      funFacts: [
        'Only 4\'8" but flies high! 🦋',
        'Started gymnastics at age 6 🤸‍♀️',
        'Can jump 4 feet in the air! 🚀',
        'Mental health advocate 💚'
      ],
      inspiration: 'Your mental health matters more than any medal!',
      quote: 'Always remember, you are braver than you believe and stronger than you seem.',
      lessonsForKids: [
        'Take care of your mind',
        'It\'s okay to say no',
        'Practice courage every day',
        'You are enough as you are'
      ],
      color: '#9C27B0',
      icon: 'fitness_center',
      rating: 4.9,
      imageUrl: 'athlete_placeholder_5'
    },
    {
      id: 'phelps',
      name: 'Michael Phelps',
      sport: 'Swimming',
      country: 'USA',
      age: 38,
      position: 'Swimmer',
      achievements: [
        '28× Olympic Medalist',
        '23× Olympic Gold Medalist',
        '39× World Championship Medalist',
        'Most Decorated Olympian Ever'
      ],
      funFacts: [
        'Swims 50 miles per week! 🏊‍♂️',
        'Size 14 feet (like flippers!) 🦶',
        'Eats 12,000 calories a day 🍕',
        'Started swimming to burn energy ⚡'
      ],
      inspiration: 'Turn your differences into your superpowers!',
      quote: 'You can\'t put a limit on anything. The more you dream, the farther you get.',
      lessonsForKids: [
        'Differences make you special',
        'Dream without limits',
        'Hard work pays off',
        'Set impossible goals'
      ],
      color: '#00BCD4',
      icon: 'pool',
      rating: 4.8,
      imageUrl: 'athlete_placeholder_6'
    }
  ]);

  const sports = ['all', 'Football', 'Basketball', 'Tennis', 'Track & Field', 'Gymnastics', 'Swimming'];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      Alert.alert(
        'New Athletes Added! 🌟',
        'We\'re constantly adding more inspiring athletes to learn from. Keep checking back!',
        [{ text: 'Exciting!', style: 'default' }]
      );
      setRefreshing(false);
    }, 1000);
  }, []);

  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch = athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         athlete.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         athlete.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'all' || athlete.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  const toggleFavorite = (athleteId) => {
    Vibration.vibrate(50);
    if (favoriteAthletes.includes(athleteId)) {
      setFavoriteAthletes(prev => prev.filter(id => id !== athleteId));
      Alert.alert('💙', 'Removed from favorites!');
    } else {
      setFavoriteAthletes(prev => [...prev, athleteId]);
      Alert.alert('⭐', 'Added to favorites!');
    }
  };

  const openAthleteModal = (athlete) => {
    setSelectedAthlete(athlete);
    setModalVisible(true);
    Vibration.vibrate(50);
  };

  const getSportEmoji = (sport) => {
    const emojis = {
      'Football': '⚽',
      'Basketball': '🏀',
      'Tennis': '🎾',
      'Track & Field': '🏃‍♂️',
      'Gymnastics': '🤸‍♀️',
      'Swimming': '🏊‍♂️',
    };
    return emojis[sport] || '🏅';
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
          Famous Athletes 🌟
        </Text>
        <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
          Learn from the world's greatest champions!
        </Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{athletes.length}</Text>
            <Text style={styles.statLabel}>Athletes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{sports.length - 1}</Text>
            <Text style={styles.statLabel}>Sports</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{favoriteAthletes.length}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search athletes or sports..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sportScroll}
        contentContainerStyle={styles.sportContainer}
      >
        {sports.map((sport) => (
          <Chip
            key={sport}
            mode={selectedSport === sport ? 'flat' : 'outlined'}
            selected={selectedSport === sport}
            onPress={() => setSelectedSport(sport)}
            style={[
              styles.sportChip,
              selectedSport === sport && styles.selectedChip
            ]}
            textStyle={[
              styles.chipText,
              selectedSport === sport && styles.selectedChipText
            ]}
          >
            {sport === 'all' ? 'All Sports 🏅' : `${sport} ${getSportEmoji(sport)}`}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderAthleteCard = (athlete) => {
    const isFavorite = favoriteAthletes.includes(athlete.id);
    
    return (
      <Card key={athlete.id} style={styles.athleteCard}>
        <TouchableOpacity
          onPress={() => openAthleteModal(athlete)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[athlete.color + '20', athlete.color + '10']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Surface style={[styles.avatarContainer, { backgroundColor: athlete.color }]}>
                <Icon
                  name={athlete.icon}
                  size={32}
                  color="white"
                />
              </Surface>
              
              <View style={styles.athleteInfo}>
                <Text style={[TEXT_STYLES.h4, styles.athleteName]}>
                  {athlete.name}
                </Text>
                <Text style={[TEXT_STYLES.caption, styles.athleteDetails]}>
                  {athlete.sport} • {athlete.country}
                </Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      name="star"
                      size={14}
                      color={star <= Math.floor(athlete.rating) ? '#FFD700' : '#E0E0E0'}
                    />
                  ))}
                  <Text style={styles.ratingText}>{athlete.rating}</Text>
                </View>
              </View>
              
              <TouchableOpacity
                onPress={() => toggleFavorite(athlete.id)}
                style={styles.favoriteButton}
              >
                <Icon
                  name={isFavorite ? "favorite" : "favorite_border"}
                  size={24}
                  color={isFavorite ? "#E91E63" : "#757575"}
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.achievementPreview}>
              <Text style={styles.achievementTitle}>🏆 Top Achievement</Text>
              <Text style={styles.achievementText} numberOfLines={1}>
                {athlete.achievements[0]}
              </Text>
            </View>
            
            <View style={styles.inspirationPreview}>
              <Text style={styles.inspirationText} numberOfLines={2}>
                "{athlete.inspiration}"
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderAthleteModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedAthlete && (
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <LinearGradient
              colors={[selectedAthlete.color, selectedAthlete.color + '80']}
              style={styles.modalHeader}
            >
              <IconButton
                icon="close"
                iconColor="white"
                size={24}
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              />
              
              <Surface style={[styles.modalAvatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Icon
                  name={selectedAthlete.icon}
                  size={40}
                  color="white"
                />
              </Surface>
              
              <Text style={[TEXT_STYLES.h2, styles.modalName]}>
                {selectedAthlete.name}
              </Text>
              <Text style={[TEXT_STYLES.body, styles.modalSport]}>
                {selectedAthlete.sport} Champion from {selectedAthlete.country}
              </Text>
            </LinearGradient>
            
            <View style={styles.modalContent}>
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>💬 Inspiring Quote</Text>
                <Text style={styles.quoteText}>"{selectedAthlete.quote}"</Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>🏆 Major Achievements</Text>
                {selectedAthlete.achievements.map((achievement, index) => (
                  <View key={index} style={styles.achievementItem}>
                    <Icon name="jump-rope" size={16} color="#FFD700" />
                    <Text style={styles.achievementItemText}>{achievement}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>🎉 Fun Facts</Text>
                {selectedAthlete.funFacts.map((fact, index) => (
                  <Text key={index} style={styles.funFactText}>• {fact}</Text>
                ))}
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>📚 Lessons for You</Text>
                {selectedAthlete.lessonsForKids.map((lesson, index) => (
                  <View key={index} style={styles.lessonItem}>
                    <Icon name="school" size={16} color={COLORS.primary} />
                    <Text style={styles.lessonText}>{lesson}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="search-off" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>
        No Athletes Found
      </Text>
      <Text style={[TEXT_STYLES.body, styles.emptySubtitle]}>
        Try a different search term or sport category
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {renderHeader()}
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {renderSearchAndFilters()}
          
          <View style={styles.athletesSection}>
            <View style={styles.sectionHeader}>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                Champions to Inspire You 🚀
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.sectionSubtitle]}>
                Tap any athlete to learn their amazing story!
              </Text>
            </View>
            
            {filteredAthletes.length > 0 ? (
              filteredAthletes.map(renderAthleteCard)
            ) : (
              renderEmptyState()
            )}
          </View>
        </Animated.View>
      </Animated.ScrollView>
      
      {renderAthleteModal()}
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
    paddingBottom: SPACING.xl,
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
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  searchBar: {
    marginBottom: SPACING.md,
    backgroundColor: 'white',
  },
  sportScroll: {
    marginBottom: SPACING.md,
  },
  sportContainer: {
    paddingHorizontal: SPACING.xs,
  },
  sportChip: {
    marginHorizontal: SPACING.xs,
    backgroundColor: 'white',
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
  },
  selectedChipText: {
    color: 'white',
  },
  athletesSection: {
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
  },
  athleteCard: {
    marginBottom: SPACING.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  athleteInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  athleteName: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  athleteDetails: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  achievementPreview: {
    marginBottom: SPACING.md,
  },
  achievementTitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  achievementText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  inspirationPreview: {
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
  },
  inspirationText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalContainer: {
    margin: SPACING.md,
    backgroundColor: 'white',
    borderRadius: 16,
    maxHeight: height * 0.9,
    overflow: 'hidden',
  },
  modalScroll: {
    flex: 1,
  },
  modalHeader: {
    padding: SPACING.lg,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    zIndex: 1,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalName: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  modalSport: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  quoteText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: SPACING.md,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  achievementItemText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  funFactText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  lessonText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});

export default FamousAthletes;