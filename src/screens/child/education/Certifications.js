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
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const Certification = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Sample certifications data
  const [certifications, setCertifications] = useState([
    {
      id: 1,
      title: 'Football Fundamentals',
      category: 'Football',
      progress: 85,
      totalLessons: 20,
      completedLessons: 17,
      badge: 'sports_soccer',
      level: 'Bronze',
      points: 850,
      earned: true,
      earnedDate: '2024-08-15',
      color: '#4CAF50',
    },
    {
      id: 2,
      title: 'Basketball Basics',
      category: 'Basketball',
      progress: 60,
      totalLessons: 15,
      completedLessons: 9,
      badge: 'sports_basketball',
      level: 'Bronze',
      points: 600,
      earned: false,
      color: '#FF9800',
    },
    {
      id: 3,
      title: 'Team Leadership',
      category: 'Leadership',
      progress: 100,
      totalLessons: 10,
      completedLessons: 10,
      badge: 'emoji_events',
      level: 'Gold',
      points: 1000,
      earned: true,
      earnedDate: '2024-07-20',
      color: '#FFD700',
    },
    {
      id: 4,
      title: 'Swimming Safety',
      category: 'Swimming',
      progress: 30,
      totalLessons: 12,
      completedLessons: 4,
      badge: 'pool',
      level: 'Bronze',
      points: 300,
      earned: false,
      color: '#2196F3',
    },
    {
      id: 5,
      title: 'Nutrition Basics',
      category: 'Health',
      progress: 75,
      totalLessons: 8,
      completedLessons: 6,
      badge: 'restaurant',
      level: 'Silver',
      points: 750,
      earned: false,
      color: '#9C27B0',
    },
  ]);

  const categories = ['all', 'Football', 'Basketball', 'Swimming', 'Leadership', 'Health'];

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
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      Alert.alert(
        'Feature Update! 🎯',
        'Certification sync functionality is being developed. Your progress will be automatically updated soon!',
        [{ text: 'Awesome!', style: 'default' }]
      );
      setRefreshing(false);
    }, 1000);
  }, []);

  const filteredCertifications = certifications.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || cert.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPoints = certifications.reduce((sum, cert) => sum + cert.points, 0);
  const earnedCertifications = certifications.filter(cert => cert.earned);
  const completionRate = Math.round((earnedCertifications.length / certifications.length) * 100);

  const handleCertificationPress = (certification) => {
    Vibration.vibrate(50);
    if (certification.earned) {
      Alert.alert(
        `🏆 ${certification.title}`,
        `Congratulations! You earned this ${certification.level} certification on ${certification.earnedDate}!\n\nPoints Earned: ${certification.points} 🌟`,
        [{ text: 'Amazing!', style: 'default' }]
      );
    } else {
      Alert.alert(
        'Keep Going! 💪',
        `Continue your training to earn the ${certification.title} certification!\n\nProgress: ${certification.completedLessons}/${certification.totalLessons} lessons\nPoints to earn: ${certification.points} 🌟`,
        [
          { text: 'Continue Training', style: 'default' },
          { text: 'Later', style: 'cancel' }
        ]
      );
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
          My Certifications 🏆
        </Text>
        <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
          Track your learning journey!
        </Text>
        
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{earnedCertifications.length}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalPoints}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completionRate}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search certifications..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((category) => (
          <Chip
            key={category}
            mode={selectedCategory === category ? 'flat' : 'outlined'}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.selectedChip
            ]}
            textStyle={[
              styles.chipText,
              selectedCategory === category && styles.selectedChipText
            ]}
          >
            {category === 'all' ? 'All Sports 🏅' : `${category} ${getCategoryEmoji(category)}`}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const getCategoryEmoji = (category) => {
    const emojis = {
      Football: '⚽',
      Basketball: '🏀',
      Swimming: '🏊‍♂️',
      Leadership: '👑',
      Health: '🍎',
    };
    return emojis[category] || '🏅';
  };

  const renderCertificationCard = (certification) => {
    const progressWidth = (certification.progress / 100) * (width - 60);
    
    return (
      <Card key={certification.id} style={styles.certificationCard}>
        <TouchableOpacity
          onPress={() => handleCertificationPress(certification)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.badgeContainer}>
              <Surface style={[styles.badgeCircle, { backgroundColor: certification.color }]}>
                <Icon
                  name={certification.badge}
                  size={24}
                  color="white"
                />
              </Surface>
              {certification.earned && (
                <View style={styles.earnedBadge}>
                  <Icon name="check-circle" size={16} color={COLORS.success} />
                </View>
              )}
            </View>
            
            <View style={styles.certificationInfo}>
              <Text style={[TEXT_STYLES.h3, styles.certificationTitle]}>
                {certification.title}
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.certificationCategory]}>
                {certification.category} • {certification.level} Level
              </Text>
            </View>
            
            <View style={styles.pointsContainer}>
              <Text style={styles.points}>{certification.points}</Text>
              <Icon name="star" size={16} color="#FFD700" />
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                Progress: {certification.completedLessons}/{certification.totalLessons} lessons
              </Text>
              <Text style={styles.progressPercentage}>
                {certification.progress}%
              </Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg} />
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: certification.color,
                    width: progressWidth * (certification.progress / 100),
                  }
                ]}
              />
            </View>
          </View>
          
          {certification.earned && (
            <View style={styles.earnedContainer}>
              <Icon name="jump-rope" size={16} color="#FFD700" />
              <Text style={styles.earnedText}>
                Earned on {new Date(certification.earnedDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="school" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>
        No Certifications Found
      </Text>
      <Text style={[TEXT_STYLES.body, styles.emptySubtitle]}>
        Try adjusting your search or category filter
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
        style={[styles.scrollView]}
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
          
          <View style={styles.certificationsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                Your Learning Journey 📚
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.sectionSubtitle]}>
                Complete lessons to earn certifications!
              </Text>
            </View>
            
            {filteredCertifications.length > 0 ? (
              filteredCertifications.map(renderCertificationCard)
            ) : (
              renderEmptyState()
            )}
          </View>
        </Animated.View>
      </Animated.ScrollView>
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
  categoryScroll: {
    marginBottom: SPACING.md,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.xs,
  },
  categoryChip: {
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
  certificationsSection: {
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
  certificationCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  badgeContainer: {
    position: 'relative',
  },
  badgeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  earnedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
  certificationInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  certificationTitle: {
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  certificationCategory: {
    color: COLORS.textSecondary,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  points: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginRight: SPACING.xs,
  },
  progressContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  progressPercentage: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    position: 'relative',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  earnedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  earnedText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
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

export default Certification;