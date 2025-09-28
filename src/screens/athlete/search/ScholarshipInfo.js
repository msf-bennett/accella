import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
  Dimensions,
  Linking,
  Share,
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
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, SPACING, TEXT_STYLES } from '../styles/theme';

const { width } = Dimensions.get('window');

const ScholarshipInfo = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, scholarships, loading } = useSelector(state => ({
    user: state.auth.user,
    scholarships: state.scholarships.available,
    loading: state.scholarships.loading,
  }));

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedAmount, setSelectedAmount] = useState('All');
  const [selectedDeadline, setSelectedDeadline] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteScholarships, setFavoriteScholarships] = useState(new Set());
  const [appliedScholarships, setAppliedScholarships] = useState(new Set());
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [sortBy, setSortBy] = useState('deadline'); // 'deadline', 'amount', 'match', 'newest'
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const modalSlide = useRef(new Animated.Value(300)).current;

  // Mock data for scholarships
  const [scholarshipsData, setScholarshipsData] = useState([
    {
      id: '1',
      title: 'Kenya Football Federation Youth Scholarship',
      sport: 'Football',
      level: 'High School',
      organization: {
        name: 'Kenya Football Federation',
        logo: 'https://via.placeholder.com/60',
        type: 'Federation',
        verified: true,
        established: '1960',
        website: 'https://kff.co.ke',
      },
      amount: 500000,
      currency: 'KES',
      amountType: 'Full Coverage',
      deadline: '2025-09-15',
      applicants: 1245,
      maxApplicants: 2000,
      region: 'Kenya',
      description: 'Full scholarship program for talented young football players to pursue secondary education while developing their football skills in premier academies.',
      requirements: [
        'Age 14-17 years',
        'Exceptional football talent',
        'Good academic performance (above 300 marks)',
        'Clean disciplinary record',
        'Medical fitness certificate'
      ],
      benefits: [
        'Full school fees coverage',
        'Accommodation and meals',
        'Professional football training',
        'Monthly allowance KES 10,000',
        'Sports equipment and gear',
        'Career guidance and mentorship'
      ],
      eligibility: {
        age: '14-17 years',
        gender: 'All',
        nationality: 'Kenyan',
        academicLevel: 'Form 1-4',
        sportsLevel: 'Regional/National',
      },
      applicationProcess: [
        'Complete online application',
        'Upload academic transcripts',
        'Submit sports achievements',
        'Medical examination',
        'Skills assessment test',
        'Interview (shortlisted candidates)'
      ],
      documents: [
        'Birth certificate',
        'Academic transcripts',
        'Sports certificates',
        'Medical certificate',
        'Recommendation letters (2)',
        'Passport photos'
      ],
      contact: {
        email: 'scholarships@kff.co.ke',
        phone: '+254700123456',
        address: 'Kasarani Sports Complex, Nairobi'
      },
      tags: ['Full Scholarship', 'Football', 'Youth Development', 'Prestigious'],
      matchScore: 92,
      status: 'Open',
      featured: true,
      renewable: true,
      duration: '4 years',
      selectionCriteria: 'Merit + Talent',
    },
    {
      id: '2',
      title: 'University of Nairobi Sports Excellence Scholarship',
      sport: 'Athletics',
      level: 'University',
      organization: {
        name: 'University of Nairobi',
        logo: 'https://via.placeholder.com/60',
        type: 'University',
        verified: true,
        established: '1956',
        website: 'https://uonbi.ac.ke',
      },
      amount: 800000,
      currency: 'KES',
      amountType: 'Full Coverage',
      deadline: '2025-10-30',
      applicants: 567,
      maxApplicants: 100,
      region: 'Kenya',
      description: 'Merit-based scholarship for outstanding athletes pursuing undergraduate programs while representing the university in national and international competitions.',
      requirements: [
        'KCSE mean grade B+ and above',
        'National or international sports achievements',
        'Age 18-23 years',
        'Pass university entrance requirements',
        'Medical fitness'
      ],
      benefits: [
        'Full tuition fees',
        'Accommodation in sports hostels',
        'Training facilities access',
        'Sports gear and equipment',
        'Nutritional support',
        'Medical cover'
      ],
      eligibility: {
        age: '18-23 years',
        gender: 'All',
        nationality: 'Kenyan/East African',
        academicLevel: 'KCSE Graduate',
        sportsLevel: 'National/International',
      },
      applicationProcess: [
        'Online application portal',
        'Academic documents submission',
        'Sports portfolio review',
        'Physical fitness test',
        'Academic interview',
        'Final selection'
      ],
      documents: [
        'KCSE certificate',
        'Birth certificate',
        'National ID',
        'Sports achievements certificates',
        'Medical report',
        'Recommendation letters'
      ],
      contact: {
        email: 'sports@uonbi.ac.ke',
        phone: '+254202318262',
        address: 'University of Nairobi, Main Campus'
      },
      tags: ['University', 'Athletics', 'Academic Excellence', 'Full Coverage'],
      matchScore: 87,
      status: 'Open',
      featured: true,
      renewable: true,
      duration: '4 years',
      selectionCriteria: 'Academic + Sports Merit',
    },
    {
      id: '3',
      title: 'Safaricom Foundation Basketball Development Grant',
      sport: 'Basketball',
      level: 'High School',
      organization: {
        name: 'Safaricom Foundation',
        logo: 'https://via.placeholder.com/60',
        type: 'Foundation',
        verified: true,
        established: '2003',
        website: 'https://safaricomfoundation.org',
      },
      amount: 200000,
      currency: 'KES',
      amountType: 'Partial',
      deadline: '2025-08-30',
      applicants: 892,
      maxApplicants: 500,
      region: 'Kenya',
      description: 'Supporting young basketball talents with partial scholarships to continue their education while developing their basketball skills.',
      requirements: [
        'Age 15-18 years',
        'Basketball team member',
        'Good academic standing',
        'Financial need demonstration',
        'Community involvement'
      ],
      benefits: [
        'Partial school fees support',
        'Basketball training equipment',
        'Coaching clinics access',
        'Tournament participation',
        'Mentorship program'
      ],
      eligibility: {
        age: '15-18 years',
        gender: 'All',
        nationality: 'Kenyan',
        academicLevel: 'Form 1-4',
        sportsLevel: 'County/Regional',
      },
      applicationProcess: [
        'Online application',
        'School endorsement',
        'Community leader recommendation',
        'Skills demonstration',
        'Interview process'
      ],
      documents: [
        'School report forms',
        'Birth certificate',
        'Basketball certificates',
        'Family income statement',
        'Community service proof'
      ],
      contact: {
        email: 'grants@safaricomfoundation.org',
        phone: '+254722000000',
        address: 'Safaricom House, Nairobi'
      },
      tags: ['Partial Scholarship', 'Basketball', 'Community Focus', 'Youth'],
      matchScore: 78,
      status: 'Open',
      featured: false,
      renewable: true,
      duration: '2 years',
      selectionCriteria: 'Need + Talent',
    },
    {
      id: '4',
      title: 'Swimming Kenya International Scholarship',
      sport: 'Swimming',
      level: 'International',
      organization: {
        name: 'Swimming Kenya',
        logo: 'https://via.placeholder.com/60',
        type: 'Federation',
        verified: true,
        established: '1965',
        website: 'https://swimmingkenya.org',
      },
      amount: 2500,
      currency: 'USD',
      amountType: 'Monthly Stipend',
      deadline: '2025-11-15',
      applicants: 123,
      maxApplicants: 50,
      region: 'International',
      description: 'Elite scholarship program for exceptional swimmers to train abroad and represent Kenya in international competitions.',
      requirements: [
        'National swimming records',
        'Age 16-25 years',
        'International competition experience',
        'English proficiency',
        'Commitment to represent Kenya'
      ],
      benefits: [
        'Monthly stipend USD 2,500',
        'Training facility access',
        'International coaching',
        'Competition entry fees',
        'Travel allowances',
        'Medical support'
      ],
      eligibility: {
        age: '16-25 years',
        gender: 'All',
        nationality: 'Kenyan',
        academicLevel: 'Any',
        sportsLevel: 'International',
      },
      applicationProcess: [
        'Swimming Kenya endorsement',
        'International coach evaluation',
        'Performance analysis',
        'Medical clearance',
        'Contract negotiation'
      ],
      documents: [
        'Swimming records certificates',
        'Passport',
        'Medical examination',
        'Performance videos',
        'Coach recommendations'
      ],
      contact: {
        email: 'international@swimmingkenya.org',
        phone: '+254703456789',
        address: 'Aquatic Complex, Kasarani'
      },
      tags: ['International', 'Swimming', 'Elite Level', 'Monthly Stipend'],
      matchScore: 65,
      status: 'Open',
      featured: true,
      renewable: true,
      duration: '2-4 years',
      selectionCriteria: 'Performance + Potential',
    },
    {
      id: '5',
      title: 'Rugby Development Scholarship - Kenya Cup',
      sport: 'Rugby',
      level: 'Club',
      organization: {
        name: 'Kenya Rugby Union',
        logo: 'https://via.placeholder.com/60',
        type: 'Union',
        verified: true,
        established: '1970',
        website: 'https://kru.co.ke',
      },
      amount: 150000,
      currency: 'KES',
      amountType: 'Partial',
      deadline: '2025-09-01',
      applicants: 445,
      maxApplicants: 200,
      region: 'Kenya',
      description: 'Supporting talented rugby players to join Kenya Cup clubs while pursuing their education or career development.',
      requirements: [
        'Age 18-28 years',
        'Provincial/national rugby experience',
        'Physical fitness standards',
        'Clean disciplinary record',
        'Commitment to Kenya Cup'
      ],
      benefits: [
        'Training support allowance',
        'Rugby gear and equipment',
        'Professional coaching',
        'Match allowances',
        'Career development support'
      ],
      eligibility: {
        age: '18-28 years',
        gender: 'Male/Female',
        nationality: 'Kenyan',
        academicLevel: 'Any',
        sportsLevel: 'Provincial/National',
      },
      applicationProcess: [
        'Club nomination',
        'Skills assessment',
        'Fitness testing',
        'Interview with selectors',
        'Contract signing'
      ],
      documents: [
        'Rugby playing certificates',
        'ID copy',
        'Fitness test results',
        'Character references',
        'Medical clearance'
      ],
      contact: {
        email: 'development@kru.co.ke',
        phone: '+254722567890',
        address: 'Rugby House, Nairobi'
      },
      tags: ['Rugby', 'Club Level', 'Career Development', 'Kenya Cup'],
      matchScore: 73,
      status: 'Open',
      featured: false,
      renewable: false,
      duration: '1 year',
      selectionCriteria: 'Performance + Commitment',
    },
  ]);

  const sports = ['All', 'Football', 'Basketball', 'Swimming', 'Athletics', 'Rugby', 'Tennis', 'Volleyball'];
  const levels = ['All', 'High School', 'University', 'Club', 'International', 'Professional'];
  const regions = ['All', 'Kenya', 'East Africa', 'International', 'USA', 'Europe', 'Australia'];
  const amounts = ['All', 'Under KES 100K', 'KES 100K-500K', 'KES 500K-1M', 'Above KES 1M', 'Full Coverage'];
  const deadlines = ['All', 'This Month', 'Next Month', 'This Quarter', 'This Year'];

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    loadScholarships();
  }, []);

  const loadScholarships = useCallback(async () => {
    try {
      // Simulate API call
      // dispatch(fetchAvailableScholarships());
    } catch (error) {
      console.error('Error loading scholarships:', error);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadScholarships();
    setRefreshing(false);
  }, [loadScholarships]);

  const getDeadlineFilter = (scholarship) => {
    const today = new Date();
    const deadline = new Date(scholarship.deadline);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.ceil(diffDays / 30);

    if (diffDays <= 30) return 'This Month';
    if (diffDays <= 60) return 'Next Month';
    if (diffMonths <= 3) return 'This Quarter';
    if (diffMonths <= 12) return 'This Year';
    return 'Later';
  };

  const getAmountRange = (scholarship) => {
    const amount = scholarship.amount;
    if (scholarship.currency === 'USD') {
      const kesAmount = amount * 130; // Approximate conversion
      if (kesAmount < 100000) return 'Under KES 100K';
      if (kesAmount <= 500000) return 'KES 100K-500K';
      if (kesAmount <= 1000000) return 'KES 500K-1M';
      return 'Above KES 1M';
    }
    if (amount < 100000) return 'Under KES 100K';
    if (amount <= 500000) return 'KES 100K-500K';
    if (amount <= 1000000) return 'KES 500K-1M';
    return 'Above KES 1M';
  };

  const filteredScholarships = scholarshipsData.filter(scholarship => {
    const matchesSearch = scholarship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scholarship.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scholarship.organization.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'All' || scholarship.sport === selectedSport;
    const matchesLevel = selectedLevel === 'All' || scholarship.level === selectedLevel;
    const matchesRegion = selectedRegion === 'All' || scholarship.region === selectedRegion;
    const matchesAmount = selectedAmount === 'All' || 
                         (selectedAmount === 'Full Coverage' && scholarship.amountType === 'Full Coverage') ||
                         (selectedAmount !== 'Full Coverage' && getAmountRange(scholarship) === selectedAmount);
    const matchesDeadline = selectedDeadline === 'All' || getDeadlineFilter(scholarship) === selectedDeadline;
    
    return matchesSearch && matchesSport && matchesLevel && matchesRegion && matchesAmount && matchesDeadline;
  });

  // Sort filtered scholarships
  const sortedScholarships = [...filteredScholarships].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        return new Date(a.deadline) - new Date(b.deadline);
      case 'amount':
        const aAmount = a.currency === 'USD' ? a.amount * 130 : a.amount;
        const bAmount = b.currency === 'USD' ? b.amount * 130 : b.amount;
        return bAmount - aAmount;
      case 'match':
        return b.matchScore - a.matchScore;
      case 'newest':
        return b.featured ? 1 : -1; // Featured first, then by ID
      default:
        return 0;
    }
  });

  const toggleFavorite = useCallback((scholarshipId) => {
    setFavoriteScholarships(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(scholarshipId)) {
        newFavorites.delete(scholarshipId);
      } else {
        newFavorites.add(scholarshipId);
      }
      return newFavorites;
    });
  }, []);

  const openApplication = useCallback((scholarship) => {
    setSelectedScholarship(scholarship);
    setShowApplicationModal(true);
    Animated.timing(modalSlide, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const closeApplicationModal = useCallback(() => {
    Animated.timing(modalSlide, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowApplicationModal(false);
      setSelectedScholarship(null);
    });
  }, []);

  const applyToScholarship = useCallback((scholarship) => {
    Alert.alert(
      'Apply for Scholarship',
      `Apply for "${scholarship.title}"?\n\nThis will start your application process. Make sure you have all required documents ready.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Application',
          onPress: () => {
            setAppliedScholarships(prev => new Set([...prev, scholarship.id]));
            closeApplicationModal();
            Alert.alert(
              'Application Started! 🎉',
              'Your scholarship application has been initiated. Check your email for next steps and document requirements.',
              [{ text: 'OK', onPress: () => {} }]
            );
          },
        },
      ]
    );
  }, [closeApplicationModal]);

  const shareScholarship = useCallback((scholarship) => {
    const message = `Check out this scholarship opportunity: ${scholarship.title} by ${scholarship.organization.name}\n\nAmount: ${scholarship.currency} ${scholarship.amount.toLocaleString()}\nDeadline: ${new Date(scholarship.deadline).toLocaleDateString()}\n\nFound on SportsTech Kenya 🏆`;
    
    Share.share({
      message,
      title: 'Scholarship Opportunity',
    });
  }, []);

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineColor = (days) => {
    if (days <= 7) return COLORS.error;
    if (days <= 30) return '#FFA500';
    return COLORS.success;
  };

  const getMatchScoreColor = (score) => {
    if (score >= 90) return COLORS.success;
    if (score >= 75) return '#FFA500';
    return COLORS.primary;
  };

  const renderScholarshipCard = ({ item, index }) => {
    const daysLeft = getDaysUntilDeadline(item.deadline);
    const isApplied = appliedScholarships.has(item.id);
    const isFavorite = favoriteScholarships.has(item.id);

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, 50],
                }),
              },
            ],
          },
        ]}
      >
        <Card style={[styles.scholarshipCard, item.featured && styles.featuredCard]} elevation={4}>
          {item.featured && (
            <View style={styles.featuredBanner}>
              <Icon name="stars" size={16} color="white" />
              <Text style={styles.featuredText}>FEATURED</Text>
            </View>
          )}

          <LinearGradient
            colors={item.featured ? ['#FFD700', '#FFA500'] : ['#667eea', '#764ba2']}
            style={styles.cardHeader}
          >
            <View style={styles.headerContent}>
              <View style={styles.scholarshipInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.scholarshipTitle} numberOfLines={2}>{item.title}</Text>
                  {item.organization.verified && (
                    <Icon name="verified" size={18} color="white" style={styles.verifiedIcon} />
                  )}
                </View>
                <Text style={styles.organizationName}>{item.organization.name}</Text>
                <View style={styles.matchScoreContainer}>
                  <Text style={styles.matchScoreLabel}>Match Score: </Text>
                  <Text style={[styles.matchScore, { color: getMatchScoreColor(item.matchScore) }]}>
                    {item.matchScore}%
                  </Text>
                  <Icon name="psychology" size={14} color="white" style={styles.aiIcon} />
                </View>
              </View>
              <TouchableOpacity
                onPress={() => toggleFavorite(item.id)}
                style={styles.favoriteButton}
              >
                <Icon
                  name={isFavorite ? 'favorite' : 'favorite-border'}
                  size={22}
                  color={isFavorite ? COLORS.error : 'white'}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <Card.Content style={styles.cardContent}>
            {/* Key Info Row */}
            <View style={styles.keyInfoRow}>
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Amount</Text>
                <Text style={styles.amount}>
                  {item.currency} {item.amount.toLocaleString()}
                </Text>
                <Text style={styles.amountType}>{item.amountType}</Text>
              </View>
              
              <View style={styles.deadlineContainer}>
                <Text style={styles.deadlineLabel}>Deadline</Text>
                <Text style={[styles.daysLeft, { color: getDeadlineColor(daysLeft) }]}>
                  {daysLeft > 0 ? `${daysLeft} days` : 'Expired'}
                </Text>
                <Text style={styles.deadlineDate}>
                  {new Date(item.deadline).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.applicantsContainer}>
                <Text style={styles.applicantsLabel}>Applied</Text>
                <Text style={styles.applicantCount}>
                  {item.applicants}/{item.maxApplicants}
                </Text>
                <ProgressBar
                  progress={item.applicants / item.maxApplicants}
                  color={COLORS.primary}
                  style={styles.applicationProgress}
                />
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Details */}
            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <Icon name="sports" size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>{item.sport} • {item.level}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="location-on" size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>{item.region}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="schedule" size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>Duration: {item.duration}</Text>
                {item.renewable && (
                  <Chip
                    mode="outlined"
                    compact
                    style={styles.renewableChip}
                    textStyle={styles.renewableText}
                  >
                    Renewable
                  </Chip>
                )}
              </View>
            </View>

            {/* Key Benefits Preview */}
            <View style={styles.benefitsPreview}>
              <Text style={styles.benefitsTitle}>Key Benefits:</Text>
              <Text style={styles.benefitsText} numberOfLines={2}>
                {item.benefits.slice(0, 3).join(' • ')}
              </Text>
            </View>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, tagIndex) => (
                <Chip
                  key={tagIndex}
                  mode="outlined"
                  compact
                  style={styles.tagChip}
                  textStyle={styles.tagText}
                >
                  {tag}
                </Chip>
              ))}
            </View>

            <Text style={styles.description} numberOfLines={3}>
              {item.description}
            </Text>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={() => openApplication(item)}
                style={styles.viewButton}
                labelStyle={styles.viewButtonText}
                icon="visibility"
              >
                View Details
              </Button>
              
              <Button
                mode="contained"
                onPress={() => openApplication(item)}
                style={[
                  styles.applyButton,
                  isApplied && styles.appliedButton,
                  daysLeft <= 0 && styles.expiredButton
                ]}
                labelStyle={styles.applyButtonText}
                disabled={isApplied || daysLeft <= 0}
                icon={isApplied ? "check-circle" : "send"}
              >
                {isApplied ? 'Applied ✓' : daysLeft <= 0 ? 'Expired' : 'Apply Now'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const renderApplicationModal = () => {
    if (!selectedScholarship) return null;

    return (
      <Portal>
        <Modal visible={showApplicationModal} onDismiss={closeApplicationModal}>
          <BlurView style={styles.modalBlur} blurType="dark" blurAmount={10}>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [
                    {
                      translateY: modalSlide,
                    },
                  ],
                },
              ]}
            >
              <Surface style={styles.modalContent} elevation={8}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedScholarship.title}</Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={closeApplicationModal}
                    iconColor={COLORS.text}
                  />
                </View>

                <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                  {/* Organization Info */}
                  <View style={styles.modalSection}>
                    <View style={styles.organizationHeader}>
                      <Avatar.Image
                        size={50}
                        source={{ uri: selectedScholarship.organization.logo }}
                        style={styles.orgLogo}
                      />
                      <View style={styles.orgInfo}>
                        <Text style={styles.orgName}>{selectedScholarship.organization.name}</Text>
                        <Text style={styles.orgType}>{selectedScholarship.organization.type}</Text>
                        <Text style={styles.established}>Est. {selectedScholarship.organization.established}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Scholarship Details */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Scholarship Details</Text>
                    <View style={styles.detailGrid}>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailLabel}>Amount</Text>
                        <Text style={styles.detailValue}>
                          {selectedScholarship.currency} {selectedScholarship.amount.toLocaleString()}
                        </Text>
                        <Text style={styles.detailSubtext}>{selectedScholarship.amountType}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailLabel}>Duration</Text>
                        <Text style={styles.detailValue}>{selectedScholarship.duration}</Text>
                        <Text style={styles.detailSubtext}>
                          {selectedScholarship.renewable ? 'Renewable' : 'One-time'}
                        </Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailLabel}>Deadline</Text>
                        <Text style={styles.detailValue}>
                          {new Date(selectedScholarship.deadline).toLocaleDateString()}
                        </Text>
                        <Text style={[
                          styles.detailSubtext,
                          { color: getDeadlineColor(getDaysUntilDeadline(selectedScholarship.deadline)) }
                        ]}>
                          {getDaysUntilDeadline(selectedScholarship.deadline)} days left
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Eligibility Requirements */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Eligibility Requirements</Text>
                    {selectedScholarship.requirements.map((req, index) => (
                      <View key={index} style={styles.requirementItem}>
                        <Icon name="check-circle" size={16} color={COLORS.success} />
                        <Text style={styles.requirementText}>{req}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Benefits */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Benefits & Support</Text>
                    {selectedScholarship.benefits.map((benefit, index) => (
                      <View key={index} style={styles.benefitItem}>
                        <Icon name="star" size={16} color={COLORS.primary} />
                        <Text style={styles.benefitText}>{benefit}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Application Process */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Application Process</Text>
                    {selectedScholarship.applicationProcess.map((step, index) => (
                      <View key={index} style={styles.processStep}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Required Documents */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Required Documents</Text>
                    <View style={styles.documentsGrid}>
                      {selectedScholarship.documents.map((doc, index) => (
                        <View key={index} style={styles.documentChip}>
                          <Icon name="description" size={14} color={COLORS.primary} />
                          <Text style={styles.documentText}>{doc}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Contact Information */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    <View style={styles.contactInfo}>
                      <TouchableOpacity 
                        style={styles.contactItem}
                        onPress={() => Linking.openURL(`mailto:${selectedScholarship.contact.email}`)}
                      >
                        <Icon name="email" size={20} color={COLORS.primary} />
                        <Text style={styles.contactText}>{selectedScholarship.contact.email}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.contactItem}
                        onPress={() => Linking.openURL(`tel:${selectedScholarship.contact.phone}`)}
                      >
                        <Icon name="phone" size={20} color={COLORS.primary} />
                        <Text style={styles.contactText}>{selectedScholarship.contact.phone}</Text>
                      </TouchableOpacity>
                      <View style={styles.contactItem}>
                        <Icon name="location-on" size={20} color={COLORS.primary} />
                        <Text style={styles.contactText}>{selectedScholarship.contact.address}</Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => shareScholarship(selectedScholarship)}
                    style={styles.shareButton}
                    icon="share"
                  >
                    Share
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => applyToScholarship(selectedScholarship)}
                    style={styles.modalApplyButton}
                    icon="send"
                  >
                    Start Application
                  </Button>
                </View>
              </Surface>
            </Animated.View>
          </BlurView>
        </Modal>
      </Portal>
    );
  };

  const renderFilterChip = (items, selected, onSelect) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterScrollView}
      contentContainerStyle={styles.filterScrollContent}
    >
      {items.map((item) => (
        <Chip
          key={item}
          mode={selected === item ? 'flat' : 'outlined'}
          selected={selected === item}
          onPress={() => onSelect(item)}
          style={[
            styles.filterChip,
            selected === item && styles.selectedFilterChip
          ]}
          textStyle={[
            styles.filterChipText,
            selected === item && styles.selectedFilterChipText
          ]}
        >
          {item}
        </Chip>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.headerTitle}>Scholarship Hub 🎓</Text>
            <Text style={styles.headerSubtitle}>Discover funding opportunities for your sports journey</Text>
          </View>
          <Avatar.Image
            size={40}
            source={{ uri: user?.avatar || 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
        </View>

        <Searchbar
          placeholder="Search scholarships, sports, organizations..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />

        <View style={styles.sortAndFilter}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              const sortOptions = ['deadline', 'amount', 'match', 'newest'];
              const currentIndex = sortOptions.indexOf(sortBy);
              const nextIndex = (currentIndex + 1) % sortOptions.length;
              setSortBy(sortOptions[nextIndex]);
            }}
          >
            <Icon name="sort" size={16} color="white" />
            <Text style={styles.sortText}>
              Sort: {sortBy === 'deadline' ? 'Deadline' : 
                     sortBy === 'amount' ? 'Amount' : 
                     sortBy === 'match' ? 'Match' : 'Newest'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterToggle}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Icon name="filter-list" size={16} color="white" />
            <Text style={styles.filterToggleText}>Filters</Text>
            <Icon
              name={showFilters ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={16}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <Animated.View style={styles.filtersContainer}>
            <Text style={styles.filterSectionTitle}>Sport</Text>
            {renderFilterChip(sports, selectedSport, setSelectedSport)}
            
            <Text style={styles.filterSectionTitle}>Level</Text>
            {renderFilterChip(levels, selectedLevel, setSelectedLevel)}
            
            <Text style={styles.filterSectionTitle}>Region</Text>
            {renderFilterChip(regions, selectedRegion, setSelectedRegion)}
            
            <Text style={styles.filterSectionTitle}>Amount</Text>
            {renderFilterChip(amounts, selectedAmount, setSelectedAmount)}
            
            <Text style={styles.filterSectionTitle}>Deadline</Text>
            {renderFilterChip(deadlines, selectedDeadline, setSelectedDeadline)}
          </Animated.View>
        )}
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={styles.statNumber}>{sortedScholarships.length}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={styles.statNumber}>{appliedScholarships.size}</Text>
          <Text style={styles.statLabel}>Applied</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={styles.statNumber}>{favoriteScholarships.size}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={2}>
          <Text style={styles.statNumber}>
            {sortedScholarships.filter(s => getDaysUntilDeadline(s.deadline) <= 30).length}
          </Text>
          <Text style={styles.statLabel}>Urgent</Text>
        </Surface>
      </View>

      {sortedScholarships.length > 0 ? (
        <FlatList
          data={sortedScholarships}
          renderItem={renderScholarshipCard}
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
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="school" size={80} color={COLORS.primary} />
          <Text style={styles.emptyTitle}>No scholarships found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search criteria or filters
          </Text>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedSport('All');
              setSelectedLevel('All');
              setSelectedRegion('All');
              setSelectedAmount('All');
              setSelectedDeadline('All');
              setSearchQuery('');
            }}
            style={styles.clearFiltersButton}
          >
            Clear All Filters
          </Button>
        </View>
      )}

      {renderApplicationModal()}

      <FAB
        icon="bookmark"
        style={styles.fab}
        onPress={() => Alert.alert('Favorites', 'View your saved scholarships and application tracking here!')}
        color="white"
        label="My Applications"
      />
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  welcomeContainer: {
    flex: 1,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  avatar: {
    borderWidth: 2,
    borderColor: 'white',
  },
  searchBar: {
    marginVertical: SPACING.md,
    backgroundColor: 'white',
    borderRadius: 25,
    elevation: 4,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  sortAndFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
  },
  sortText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: SPACING.xs,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
  },
  filterToggleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginHorizontal: SPACING.xs,
  },
  filtersContainer: {
    marginTop: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: SPACING.md,
  },
  filterSectionTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  filterScrollView: {
    marginBottom: SPACING.sm,
  },
  filterScrollContent: {
    paddingHorizontal: SPACING.xs,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedFilterChip: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  filterChipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: SPACING.lg,
  },
  scholarshipCard: {
    borderRadius: 15,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  featuredBanner: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    zIndex: 1,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: SPACING.xs,
  },
  cardHeader: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  scholarshipInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  scholarshipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    lineHeight: 24,
  },
  verifiedIcon: {
    marginLeft: SPACING.sm,
    marginTop: 2,
  },
  organizationName: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  matchScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchScoreLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  matchScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  aiIcon: {
    marginLeft: SPACING.xs,
  },
  favoriteButton: {
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardContent: {
    padding: SPACING.lg,
  },
  keyInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  amountContainer: {
    flex: 1,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  amountType: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  deadlineContainer: {
    flex: 1,
    alignItems: 'center',
  },
  deadlineLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  daysLeft: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  deadlineDate: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  applicantsContainer: {
    flex: 1,
    alignItems: 'center',
  },
  applicantsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  applicantCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  applicationProgress: {
    width: 60,
    height: 3,
    marginTop: SPACING.xs,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  detailsSection: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  renewableChip: {
    height: 20,
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.success + '20',
    borderColor: COLORS.success,
  },
  renewableText: {
    fontSize: 10,
    color: COLORS.success,
  },
  benefitsPreview: {
    marginBottom: SPACING.md,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  benefitsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tagChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: 'rgba(102, 126, 234, 0.3)',
    height: 26,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.primary,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    flex: 1,
    marginRight: SPACING.sm,
    borderColor: COLORS.primary,
  },
  viewButtonText: {
    fontSize: 12,
  },
  applyButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  appliedButton: {
    backgroundColor: COLORS.success,
  },
  expiredButton: {
    backgroundColor: COLORS.textSecondary,
  },
  applyButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal Styles
  modalBlur: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  modalScrollView: {
    paddingHorizontal: SPACING.lg,
  },
  modalSection: {
    marginVertical: SPACING.md,
  },
  organizationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orgLogo: {
    marginRight: SPACING.md,
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  orgType: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  established: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailGridItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.xs,
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  detailSubtext: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  requirementText: {
    fontSize: 13,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  benefitText: {
    fontSize: 13,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  stepText: {
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
  },
  documentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  documentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  documentText: {
    fontSize: 12,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  contactInfo: {},
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  contactText: {
    fontSize: 13,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
  },
  shareButton: {
    flex: 1,
    marginRight: SPACING.sm,
    borderColor: COLORS.primary,
  },
  modalApplyButton: {
    flex: 2,
    marginLeft: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  clearFiltersButton: {
    borderColor: COLORS.primary,
    borderRadius: 25,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
  },
});

export default ScholarshipInfo;