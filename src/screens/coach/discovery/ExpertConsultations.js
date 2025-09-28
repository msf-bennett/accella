import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Text,
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width } = Dimensions.get('window');

const ExpertConsultations = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for expert consultations
  const [experts, setExperts] = useState([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Sports Psychology',
      rating: 4.9,
      reviews: 128,
      price: 75,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616c65c17e9?w=150&h=150&fit=crop&crop=face',
      experience: '15+ years',
      availability: 'Available Today',
      tags: ['Mental Performance', 'Confidence Building', 'Anxiety Management'],
      description: 'Specializing in helping athletes overcome mental barriers and achieve peak performance.',
      sessionsCompleted: 450,
      responseTime: '< 2 hours',
      languages: ['English', 'Spanish']
    },
    {
      id: '2',
      name: 'Coach Mike Rodriguez',
      specialty: 'Strength & Conditioning',
      rating: 4.8,
      reviews: 95,
      price: 65,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      experience: '12+ years',
      availability: 'Available Tomorrow',
      tags: ['Olympic Lifting', 'Injury Prevention', 'Athletic Performance'],
      description: 'Former Olympic trainer with expertise in developing elite athletes.',
      sessionsCompleted: 320,
      responseTime: '< 4 hours',
      languages: ['English']
    },
    {
      id: '3',
      name: 'Dr. Emma Chen',
      specialty: 'Sports Nutrition',
      rating: 4.9,
      reviews: 156,
      price: 80,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      experience: '10+ years',
      availability: 'Available Now',
      tags: ['Performance Nutrition', 'Weight Management', 'Supplements'],
      description: 'PhD in Sports Nutrition helping athletes optimize their dietary performance.',
      sessionsCompleted: 280,
      responseTime: '< 1 hour',
      languages: ['English', 'Mandarin']
    }
  ]);

  const categories = [
    'All', 'Sports Psychology', 'Strength & Conditioning', 
    'Sports Nutrition', 'Injury Recovery', 'Technical Skills'
  ];

  const ratings = ['All', '4.5+', '4.0+', '3.5+'];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent', true);
  }, []);

  const handleBookConsultation = (expert) => {
    Alert.alert(
      '🚀 Feature Development',
      `Booking consultation with ${expert.name} is coming soon! This will include calendar integration, payment processing, and video call setup.`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleExpertProfile = (expert) => {
    Alert.alert(
      '👨‍💼 Expert Profile',
      `Detailed profile for ${expert.name} coming soon! This will show full bio, credentials, availability calendar, and client testimonials.`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleMessageExpert = (expert) => {
    Alert.alert(
      '💬 Direct Messaging',
      `Chat with ${expert.name} is coming soon! This will include real-time messaging, file sharing, and consultation scheduling.`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} name="star" size={14} color="#FFD700" />);
    }
    if (hasHalfStar) {
      stars.push(<Icon key="half" name="star-half" size={14} color="#FFD700" />);
    }
    return stars;
  };

  const renderExpertCard = ({ item: expert }) => (
    <Card style={styles.expertCard} elevation={3}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.cardHeader}
      >
        <View style={styles.expertHeader}>
          <Avatar.Image 
            source={{ uri: expert.avatar }} 
            size={60}
            style={styles.avatar}
          />
          <View style={styles.expertInfo}>
            <Text style={styles.expertName}>{expert.name}</Text>
            <Text style={styles.expertSpecialty}>{expert.specialty}</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {renderStars(expert.rating)}
              </View>
              <Text style={styles.ratingText}>
                {expert.rating} ({expert.reviews})
              </Text>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Per hour</Text>
            <Text style={styles.price}>${expert.price}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.cardContent}>
        <Text style={styles.description}>{expert.description}</Text>
        
        <View style={styles.tagsContainer}>
          {expert.tags.map((tag, index) => (
            <Chip
              key={index}
              mode="outlined"
              textStyle={styles.chipText}
              style={styles.chip}
            >
              {tag}
            </Chip>
          ))}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Icon name="school" size={16} color={COLORS.primary} />
            <Text style={styles.statText}>{expert.experience}</Text>
          </View>
          <View style={styles.stat}>
            <Icon name="access-time" size={16} color={COLORS.primary} />
            <Text style={styles.statText}>{expert.responseTime}</Text>
          </View>
          <View style={styles.stat}>
            <Icon name="check-circle" size={16} color={COLORS.success} />
            <Text style={styles.statText}>{expert.sessionsCompleted} sessions</Text>
          </View>
        </View>

        <View style={styles.availabilityContainer}>
          <Icon name="schedule" size={16} color={COLORS.success} />
          <Text style={styles.availabilityText}>{expert.availability}</Text>
        </View>

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => handleExpertProfile(expert)}
            style={styles.profileButton}
            labelStyle={styles.buttonLabel}
          >
            View Profile
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleMessageExpert(expert)}
            style={styles.messageButton}
            icon="chat"
            labelStyle={styles.buttonLabel}
          >
            Message
          </Button>
          <Button
            mode="contained"
            onPress={() => handleBookConsultation(expert)}
            style={styles.bookButton}
            labelStyle={styles.bookButtonLabel}
          >
            Book Now
          </Button>
        </View>
      </View>
    </Card>
  );

  const renderCategoryChip = ({ item: category }) => (
    <Chip
      selected={selectedCategory === category}
      onPress={() => setSelectedCategory(category)}
      style={[
        styles.categoryChip,
        selectedCategory === category && styles.selectedCategoryChip
      ]}
      textStyle={[
        styles.categoryChipText,
        selectedCategory === category && styles.selectedCategoryChipText
      ]}
    >
      {category}
    </Chip>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Expert Consultations 🎯</Text>
          <Text style={styles.headerSubtitle}>
            Get personalized advice from industry professionals
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search experts by name or specialty..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
        <IconButton
          icon="filter-list"
          size={24}
          iconColor={COLORS.primary}
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        />
      </View>

      {showFilters && (
        <Surface style={styles.filtersContainer} elevation={2}>
          <Text style={styles.filterTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryChip}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryList}
          />
          
          <Text style={styles.filterTitle}>Rating</Text>
          <View style={styles.ratingFilters}>
            {ratings.map((rating) => (
              <Chip
                key={rating}
                selected={selectedRating === rating}
                onPress={() => setSelectedRating(rating)}
                style={[
                  styles.ratingChip,
                  selectedRating === rating && styles.selectedRatingChip
                ]}
                textStyle={[
                  styles.ratingChipText,
                  selectedRating === rating && styles.selectedRatingChipText
                ]}
              >
                {rating}
              </Chip>
            ))}
          </View>
        </Surface>
      )}

      <FlatList
        data={experts}
        renderItem={renderExpertCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />

      <FAB
        icon="video-call"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            '📹 Instant Consultation',
            'Quick video consultation feature coming soon! Connect with available experts immediately.',
            [{ text: 'Got it!', style: 'default' }]
          );
        }}
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
    paddingTop: SPACING.xl * 2,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    elevation: 2,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterButton: {
    marginLeft: SPACING.sm,
  },
  filtersContainer: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
  },
  filterTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  categoryList: {
    marginBottom: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.text,
  },
  selectedCategoryChipText: {
    color: 'white',
  },
  ratingFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ratingChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: 'white',
  },
  selectedRatingChip: {
    backgroundColor: COLORS.primary,
  },
  ratingChipText: {
    color: COLORS.text,
  },
  selectedRatingChipText: {
    color: 'white',
  },
  listContainer: {
    padding: SPACING.md,
  },
  expertCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  expertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: SPACING.md,
  },
  expertInfo: {
    flex: 1,
  },
  expertName: {
    ...TEXT_STYLES.subtitle,
    color: 'white',
    fontWeight: 'bold',
  },
  expertSpecialty: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: SPACING.xs,
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  priceContainer: {
    alignItems: 'center',
  },
  priceLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  price: {
    ...TEXT_STYLES.heading,
    color: 'white',
    fontWeight: 'bold',
  },
  cardContent: {
    padding: SPACING.md,
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  chip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  chipText: {
    ...TEXT_STYLES.caption,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
  },
  availabilityText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    color: COLORS.success,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  messageButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  bookButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  buttonLabel: {
    ...TEXT_STYLES.caption,
  },
  bookButtonLabel: {
    ...TEXT_STYLES.caption,
    color: 'white',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
};

export default ExpertConsultations;