import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  Vibration,
  Animated,
  Dimensions,
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
  Badge,
} from 'react-native-paper';
import { Text } from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const CertificatePrograms = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { certificatePrograms, loading } = useSelector(state => state.learning);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Mock data for certificate programs
  const mockPrograms = [
    {
      id: 1,
      title: 'Athletic Performance Fundamentals',
      provider: 'SportScience Institute',
      duration: '6 weeks',
      level: 'Beginner',
      category: 'Performance',
      price: 149,
      rating: 4.8,
      studentsEnrolled: 1247,
      description: 'Master the basics of athletic performance optimization',
      badges: ['Popular', 'Trending'],
      modules: 12,
      completionRate: 0,
      isEnrolled: false,
      certificate: true,
      image: 'fitness_center',
      color: COLORS.primary,
      difficulty: 2,
      skills: ['Strength Training', 'Endurance', 'Recovery'],
    },
    {
      id: 2,
      title: 'Sports Nutrition Specialist',
      provider: 'Elite Nutrition Academy',
      duration: '8 weeks',
      level: 'Intermediate',
      category: 'Nutrition',
      price: 199,
      rating: 4.9,
      studentsEnrolled: 892,
      description: 'Learn advanced nutrition strategies for peak performance',
      badges: ['Certified', 'Expert-Led'],
      modules: 16,
      completionRate: 0.65,
      isEnrolled: true,
      certificate: true,
      image: 'restaurant',
      color: '#4CAF50',
      difficulty: 3,
      skills: ['Meal Planning', 'Supplements', 'Hydration'],
    },
    {
      id: 3,
      title: 'Injury Prevention & Recovery',
      provider: 'Rehab Pro Institute',
      duration: '4 weeks',
      level: 'Beginner',
      category: 'Health',
      price: 99,
      rating: 4.7,
      studentsEnrolled: 634,
      description: 'Prevent injuries and optimize recovery protocols',
      badges: ['Essential'],
      modules: 8,
      completionRate: 1.0,
      isEnrolled: true,
      certificate: true,
      image: 'healing',
      color: '#FF5722',
      difficulty: 1,
      skills: ['Mobility', 'Stretching', 'Recovery Methods'],
    },
    {
      id: 4,
      title: 'Mental Performance Mastery',
      provider: 'MindSport Academy',
      duration: '10 weeks',
      level: 'Advanced',
      category: 'Psychology',
      price: 249,
      rating: 4.9,
      studentsEnrolled: 456,
      description: 'Develop mental toughness and peak performance mindset',
      badges: ['Premium', 'Advanced'],
      modules: 20,
      completionRate: 0,
      isEnrolled: false,
      certificate: true,
      image: 'psychology',
      color: '#9C27B0',
      difficulty: 4,
      skills: ['Visualization', 'Focus', 'Stress Management'],
    },
    {
      id: 5,
      title: 'Youth Coaching Certification',
      provider: 'Youth Sports Alliance',
      duration: '12 weeks',
      level: 'Intermediate',
      category: 'Coaching',
      price: 299,
      rating: 4.8,
      studentsEnrolled: 789,
      description: 'Specialized certification for coaching young athletes',
      badges: ['Accredited', 'Popular'],
      modules: 24,
      completionRate: 0,
      isEnrolled: false,
      certificate: true,
      image: 'group',
      color: '#FF9800',
      difficulty: 3,
      skills: ['Child Development', 'Safety', 'Communication'],
    },
  ];

  const categories = ['All', 'Performance', 'Nutrition', 'Health', 'Psychology', 'Coaching'];

  useEffect(() => {
    // Animate screen entrance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Filter programs based on search and category
    filterPrograms();
  }, [searchQuery, selectedCategory]);

  const filterPrograms = useCallback(() => {
    let filtered = mockPrograms;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(program => program.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(program =>
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredPrograms(filtered);
  }, [searchQuery, selectedCategory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  const handleEnroll = (program) => {
    if (program.isEnrolled) {
      navigation.navigate('ProgramDetails', { programId: program.id });
    } else {
      Alert.alert(
        'Enroll in Program 🎓',
        `Would you like to enroll in "${program.title}" for $${program.price}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enroll',
            onPress: () => {
              Vibration.vibrate(100);
              Alert.alert('Success! 🎉', 'You have been enrolled in the program. Start learning now!');
            }
          }
        ]
      );
    }
  };

  const renderDifficultyStars = (difficulty) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name="star"
        size={14}
        color={i < difficulty ? '#FFD700' : '#E0E0E0'}
      />
    ));
  };

  const renderCertificateCard = (program) => (
    <Card key={program.id} style={[styles.programCard, { borderLeftColor: program.color }]}>
      <LinearGradient
        colors={[program.color + '10', program.color + '05']}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Surface style={[styles.iconContainer, { backgroundColor: program.color + '20' }]}>
              <Icon name={program.image} size={24} color={program.color} />
            </Surface>
            <View style={styles.titleContainer}>
              <Text style={TEXT_STYLES.heading3}>{program.title}</Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {program.provider}
              </Text>
            </View>
          </View>
          <View style={styles.cardHeaderRight}>
            {program.badges.map((badge, index) => (
              <Chip
                key={index}
                mode="flat"
                compact
                style={[styles.badge, { backgroundColor: program.color + '20' }]}
                textStyle={{ color: program.color, fontSize: 10 }}
              >
                {badge}
              </Chip>
            ))}
          </View>
        </View>

        <Text style={[TEXT_STYLES.body, styles.description]}>
          {program.description}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="access-time" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{program.duration}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="school" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{program.modules} modules</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="people" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{program.studentsEnrolled}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.statText}>{program.rating}</Text>
          </View>
        </View>

        <View style={styles.skillsContainer}>
          <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>
            Skills you'll learn:
          </Text>
          <View style={styles.skillsRow}>
            {program.skills.map((skill, index) => (
              <Chip
                key={index}
                mode="outlined"
                compact
                style={styles.skillChip}
                textStyle={{ fontSize: 10 }}
              >
                {skill}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.difficultyContainer}>
          <Text style={TEXT_STYLES.caption}>Difficulty: </Text>
          {renderDifficultyStars(program.difficulty)}
          <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
            {program.level}
          </Text>
        </View>

        {program.isEnrolled && program.completionRate > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={TEXT_STYLES.caption}>Progress</Text>
              <Text style={[TEXT_STYLES.caption, { color: program.color }]}>
                {Math.round(program.completionRate * 100)}%
              </Text>
            </View>
            <ProgressBar
              progress={program.completionRate}
              color={program.color}
              style={styles.progressBar}
            />
          </View>
        )}

        <View style={styles.cardActions}>
          <View style={styles.priceContainer}>
            {program.isEnrolled ? (
              <Chip
                mode="flat"
                icon="check-circle"
                style={{ backgroundColor: COLORS.success + '20' }}
                textStyle={{ color: COLORS.success }}
              >
                Enrolled
              </Chip>
            ) : (
              <Text style={[TEXT_STYLES.heading3, { color: program.color }]}>
                ${program.price}
              </Text>
            )}
          </View>
          <Button
            mode={program.isEnrolled ? "contained" : "outlined"}
            onPress={() => handleEnroll(program)}
            style={[
              styles.actionButton,
              program.isEnrolled && { backgroundColor: program.color }
            ]}
            contentStyle={styles.buttonContent}
          >
            {program.isEnrolled ? 'Continue' : 'Enroll Now'}
          </Button>
        </View>
      </LinearGradient>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.heading2, { color: 'white' }]}>
            Certificate Programs 🎓
          </Text>
          <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
            Enhance your skills with certified courses
          </Text>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search programs, skills..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
            inputStyle={{ color: COLORS.text }}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              mode={selectedCategory === category ? "flat" : "outlined"}
              style={[
                styles.categoryChip,
                selectedCategory === category && { backgroundColor: COLORS.primary }
              ]}
              textStyle={[
                styles.categoryChipText,
                selectedCategory === category && { color: 'white' }
              ]}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>

        <ScrollView
          style={styles.programsList}
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
          <View style={styles.programsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={TEXT_STYLES.heading3}>
                Available Programs ({filteredPrograms.length})
              </Text>
              <IconButton
                icon="filter-list"
                size={20}
                iconColor={COLORS.primary}
                onPress={() => Alert.alert('Filter', 'Advanced filtering coming soon! 🔧')}
              />
            </View>

            {filteredPrograms.map(renderCertificateCard)}

            <View style={styles.bottomSpacing} />
          </View>
        </ScrollView>
      </Animated.View>
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginTop: -SPACING.md,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.lg,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  categoriesContainer: {
    marginBottom: SPACING.md,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.lg,
  },
  categoryChip: {
    marginRight: SPACING.xs,
  },
  categoryChipText: {
    fontSize: 12,
  },
  programsList: {
    flex: 1,
  },
  programsContainer: {
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  programCard: {
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    elevation: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  titleContainer: {
    flex: 1,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  badge: {
    height: 24,
  },
  description: {
    marginBottom: SPACING.sm,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  skillsContainer: {
    marginBottom: SPACING.sm,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillChip: {
    height: 24,
    marginBottom: 4,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressContainer: {
    marginBottom: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  actionButton: {
    borderRadius: 20,
  },
  buttonContent: {
    paddingHorizontal: SPACING.md,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default CertificatePrograms;