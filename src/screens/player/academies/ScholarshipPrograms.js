import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
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
  Badge,
  TextInput,
  RadioButton,
  Checkbox,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const ScholarshipProgram = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('available');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Redux state
  const user = useSelector(state => state.auth.user);
  const scholarships = useSelector(state => state.scholarships?.available || []);
  const applications = useSelector(state => state.scholarships?.applications || []);
  const dispatch = useDispatch();

  // Mock data for demonstration
  const [availableScholarships] = useState([
    {
      id: 1,
      title: 'Elite Football Academy Merit Scholarship',
      academy: 'Elite Football Academy',
      academyLogo: 'https://via.placeholder.com/60',
      sport: 'Football',
      type: 'Merit-Based',
      amount: '100%',
      coverage: 'Full Tuition + Equipment',
      duration: '2 Years',
      deadline: '2025-09-15',
      requirements: {
        minAge: 14,
        maxAge: 18,
        academicGPA: 3.5,
        sportExperience: '2+ years',
        physicalTests: ['Speed Test', 'Endurance Test', 'Technical Skills'],
      },
      description: 'Full scholarship for exceptional young football talents with academic excellence.',
      eligibility: [
        '🎯 Age 14-18 years',
        '📚 Minimum 3.5 GPA',
        '⚽ 2+ years football experience',
        '🏃‍♂️ Pass physical assessments',
        '📄 Submit academic transcripts',
      ],
      benefits: [
        '💰 100% tuition coverage',
        '🎽 Complete equipment package',
        '🏥 Medical insurance',
        '🍽️ Meal allowances',
        '🚌 Transportation support',
      ],
      applicationCount: 45,
      maxApplications: 20,
      status: 'Open',
      priority: 'High',
    },
    {
      id: 2,
      title: 'Rising Stars Basketball Scholarship',
      academy: 'Phoenix Basketball Academy',
      academyLogo: 'https://via.placeholder.com/60',
      sport: 'Basketball',
      type: 'Need-Based',
      amount: '75%',
      coverage: 'Partial Tuition',
      duration: '1 Year',
      deadline: '2025-08-30',
      requirements: {
        minAge: 13,
        maxAge: 17,
        academicGPA: 3.0,
        sportExperience: '1+ years',
        physicalTests: ['Height Assessment', 'Shooting Test', 'Agility Test'],
      },
      description: 'Supporting talented young basketball players from underprivileged backgrounds.',
      eligibility: [
        '🎯 Age 13-17 years',
        '📚 Minimum 3.0 GPA',
        '🏀 1+ years basketball experience',
        '💼 Demonstrate financial need',
        '📋 Complete application form',
      ],
      benefits: [
        '💰 75% tuition coverage',
        '🏀 Training equipment',
        '📖 Academic support',
        '🎓 Career guidance',
      ],
      applicationCount: 32,
      maxApplications: 15,
      status: 'Open',
      priority: 'Medium',
    },
    {
      id: 3,
      title: 'Excellence in Tennis Scholarship',
      academy: 'Champions Tennis Club',
      academyLogo: 'https://via.placeholder.com/60',
      sport: 'Tennis',
      type: 'Performance-Based',
      amount: '50%',
      coverage: 'Training Fees',
      duration: '18 Months',
      deadline: '2025-10-01',
      requirements: {
        minAge: 12,
        maxAge: 16,
        academicGPA: 3.2,
        sportExperience: '3+ years',
        physicalTests: ['Technical Skills', 'Match Performance', 'Physical Fitness'],
      },
      description: 'For dedicated tennis players showing exceptional potential and technique.',
      eligibility: [
        '🎯 Age 12-16 years',
        '📚 Minimum 3.2 GPA',
        '🎾 3+ years tennis experience',
        '🏆 Tournament participation',
        '📹 Submit video portfolio',
      ],
      benefits: [
        '💰 50% training fee coverage',
        '🎾 Professional coaching',
        '🏆 Tournament opportunities',
        '📊 Performance analytics',
      ],
      applicationCount: 28,
      maxApplications: 12,
      status: 'Open',
      priority: 'Medium',
    },
    {
      id: 4,
      title: 'Future Champions Swimming Grant',
      academy: 'Aquatic Excellence Center',
      academyLogo: 'https://via.placeholder.com/60',
      sport: 'Swimming',
      type: 'Talent Development',
      amount: '60%',
      coverage: 'Training + Equipment',
      duration: '2 Years',
      deadline: '2025-09-30',
      requirements: {
        minAge: 10,
        maxAge: 15,
        academicGPA: 3.0,
        sportExperience: '2+ years',
        physicalTests: ['Swimming Times', 'Technique Assessment', 'Endurance Test'],
      },
      description: 'Developing the next generation of competitive swimmers with comprehensive support.',
      eligibility: [
        '🎯 Age 10-15 years',
        '📚 Minimum 3.0 GPA',
        '🏊‍♂️ 2+ years swimming experience',
        '⏱️ Meet time standards',
        '🏥 Medical clearance',
      ],
      benefits: [
        '💰 60% program coverage',
        '🏊‍♂️ Professional coaching',
        '🥽 Complete swim gear',
        '🏆 Competition support',
      ],
      applicationCount: 18,
      maxApplications: 10,
      status: 'Closing Soon',
      priority: 'High',
    },
  ]);

  const [myApplications] = useState([
    {
      id: 1,
      scholarshipId: 1,
      title: 'Elite Football Academy Merit Scholarship',
      academy: 'Elite Football Academy',
      appliedDate: '2025-08-10',
      status: 'Under Review',
      stage: 'Document Review',
      progress: 60,
      nextStep: 'Physical Assessment',
      nextStepDate: '2025-08-25',
      documents: [
        { name: 'Academic Transcripts', status: 'Approved', uploadDate: '2025-08-10' },
        { name: 'Sports Certificate', status: 'Approved', uploadDate: '2025-08-10' },
        { name: 'Medical Certificate', status: 'Pending', uploadDate: '2025-08-12' },
      ],
      feedback: 'Excellent academic record. Proceed to physical assessment phase.',
    },
    {
      id: 2,
      scholarshipId: 2,
      title: 'Rising Stars Basketball Scholarship',
      academy: 'Phoenix Basketball Academy',
      appliedDate: '2025-08-05',
      status: 'Interview Scheduled',
      stage: 'Final Interview',
      progress: 80,
      nextStep: 'Virtual Interview',
      nextStepDate: '2025-08-20',
      documents: [
        { name: 'Application Form', status: 'Approved', uploadDate: '2025-08-05' },
        { name: 'Financial Documents', status: 'Approved', uploadDate: '2025-08-05' },
        { name: 'Recommendation Letter', status: 'Approved', uploadDate: '2025-08-07' },
      ],
      feedback: 'Strong candidate. Final interview scheduled to assess fit and commitment.',
    },
  ]);

  const [applicationStats] = useState({
    totalApplications: 2,
    underReview: 1,
    interviewScheduled: 1,
    approved: 0,
    rejected: 0,
    successRate: 0,
  });

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Sports' },
    { value: 'football', label: 'Football' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'tennis', label: 'Tennis' },
    { value: 'swimming', label: 'Swimming' },
  ];

  const typeFilters = [
    { value: 'all', label: 'All Types' },
    { value: 'merit', label: 'Merit-Based' },
    { value: 'need', label: 'Need-Based' },
    { value: 'performance', label: 'Performance-Based' },
    { value: 'talent', label: 'Talent Development' },
  ];

  // Effects
  useEffect(() => {
    const initializeScreen = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Animate screen entrance
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
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing screen:', error);
        setLoading(false);
      }
    };

    initializeScreen();
  }, []);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API refresh
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Scholarships Updated! 🎓',
        'Latest scholarship opportunities have been loaded successfully.',
        [{ text: 'Great!', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh scholarships. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleScholarshipPress = (scholarship) => {
    setSelectedScholarship(scholarship);
    setShowApplicationModal(true);
  };

  const handleApplyScholarship = () => {
    Alert.alert(
      'Apply for Scholarship 🎓',
      `Are you sure you want to apply for "${selectedScholarship?.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => {
            setShowApplicationModal(false);
            Alert.alert(
              'Application Started! 📝',
              'Your scholarship application has been initiated. Please complete all required documents.',
              [
                { 
                  text: 'Continue', 
                  onPress: () => navigation.navigate('ScholarshipApplication', { 
                    scholarshipId: selectedScholarship.id 
                  })
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleViewApplication = (application) => {
    navigation.navigate('ApplicationDetails', { applicationId: application.id });
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setShowFilters(false);
  };

  const getFilteredScholarships = () => {
    let filtered = availableScholarships;

    // Filter by sport
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(s => 
        s.sport.toLowerCase().includes(selectedFilter) ||
        s.type.toLowerCase().includes(selectedFilter)
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.academy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sport.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open': return COLORS.success;
      case 'closing soon': return COLORS.warning;
      case 'closed': return COLORS.error;
      case 'under review': return COLORS.warning;
      case 'interview scheduled': return COLORS.primary;
      case 'approved': return COLORS.success;
      case 'rejected': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  // Render methods
  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Scholarship Programs</Text>
          
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <MaterialIcons name="filter-list" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{availableScholarships.length}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{applicationStats.totalApplications}</Text>
            <Text style={styles.statLabel}>Applied</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{applicationStats.underReview}</Text>
            <Text style={styles.statLabel}>In Review</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSearchBar = () => (
    <Surface style={styles.searchContainer}>
      <Searchbar
        placeholder="Search scholarships..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
        inputStyle={styles.searchInput}
      />
    </Surface>
  );

  const renderTabBar = () => (
    <Surface style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'available' && styles.activeTab]}
        onPress={() => setSelectedTab('available')}
      >
        <Text style={[styles.tabText, selectedTab === 'available' && styles.activeTabText]}>
          Available ({availableScholarships.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'applications' && styles.activeTab]}
        onPress={() => setSelectedTab('applications')}
      >
        <Text style={[styles.tabText, selectedTab === 'applications' && styles.activeTabText]}>
          My Applications ({myApplications.length})
        </Text>
      </TouchableOpacity>
    </Surface>
  );

  const renderScholarshipCard = (scholarship) => {
    const daysLeft = getDaysUntilDeadline(scholarship.deadline);
    const isClosingSoon = daysLeft <= 7;
    
    return (
      <TouchableOpacity
        key={scholarship.id}
        onPress={() => handleScholarshipPress(scholarship)}
        style={styles.scholarshipCard}
      >
        <Surface style={styles.cardSurface}>
          <View style={styles.cardHeader}>
            <Avatar.Image 
              size={50} 
              source={{ uri: scholarship.academyLogo }}
            />
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.scholarshipTitle} numberOfLines={2}>
                {scholarship.title}
              </Text>
              <Text style={styles.academyName}>{scholarship.academy}</Text>
            </View>
            {scholarship.priority === 'High' && (
              <Chip
                icon="star"
                mode="flat"
                style={styles.priorityChip}
                textStyle={styles.priorityChipText}
              >
                Priority
              </Chip>
            )}
          </View>

          <View style={styles.cardContent}>
            <View style={styles.scholarshipDetails}>
              <View style={styles.detailRow}>
                <MaterialIcons name="sports" size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>{scholarship.sport}</Text>
                <MaterialIcons name="category" size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>{scholarship.type}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <MaterialIcons name="attach-money" size={16} color={COLORS.success} />
                <Text style={styles.amountText}>{scholarship.amount} Coverage</Text>
                <MaterialIcons name="schedule" size={16} color={COLORS.warning} />
                <Text style={styles.detailText}>{scholarship.duration}</Text>
              </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {scholarship.description}
            </Text>

            <View style={styles.cardFooter}>
              <View style={styles.deadlineInfo}>
                <MaterialIcons 
                  name="event" 
                  size={16} 
                  color={isClosingSoon ? COLORS.error : COLORS.textSecondary} 
                />
                <Text style={[
                  styles.deadlineText,
                  isClosingSoon && styles.urgentDeadline
                ]}>
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                </Text>
              </View>
              
              <Chip
                mode="outlined"
                style={[styles.statusChip, { borderColor: getStatusColor(scholarship.status) }]}
                textStyle={[styles.statusChipText, { color: getStatusColor(scholarship.status) }]}
              >
                {scholarship.status}
              </Chip>
            </View>

            <ProgressBar
              progress={scholarship.applicationCount / scholarship.maxApplications}
              color={COLORS.primary}
              style={styles.applicationProgress}
            />
            <Text style={styles.applicationCount}>
              {scholarship.applicationCount}/{scholarship.maxApplications} applications received
            </Text>
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  const renderApplicationCard = (application) => (
    <TouchableOpacity
      key={application.id}
      onPress={() => handleViewApplication(application)}
      style={styles.applicationCard}
    >
      <Surface style={styles.cardSurface}>
        <View style={styles.applicationHeader}>
          <View style={styles.applicationInfo}>
            <Text style={styles.applicationTitle} numberOfLines={2}>
              {application.title}
            </Text>
            <Text style={styles.applicationAcademy}>{application.academy}</Text>
            <Text style={styles.applicationDate}>
              Applied: {new Date(application.appliedDate).toLocaleDateString()}
            </Text>
          </View>
          
          <Chip
            mode="flat"
            style={[styles.statusChip, { backgroundColor: `${getStatusColor(application.status)}15` }]}
            textStyle={[styles.statusChipText, { color: getStatusColor(application.status) }]}
          >
            {application.status}
          </Chip>
        </View>

        <View style={styles.applicationProgress}>
          <View style={styles.progressHeader}>
            <Text style={styles.stageText}>Stage: {application.stage}</Text>
            <Text style={styles.progressText}>{application.progress}%</Text>
          </View>
          
          <ProgressBar
            progress={application.progress / 100}
            color={getStatusColor(application.status)}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.nextStepInfo}>
          <MaterialIcons name="next-plan" size={18} color={COLORS.primary} />
          <Text style={styles.nextStepText}>
            Next: {application.nextStep} on {new Date(application.nextStepDate).toLocaleDateString()}
          </Text>
        </View>

        {application.feedback && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>💬 {application.feedback}</Text>
          </View>
        )}
      </Surface>
    </TouchableOpacity>
  );

  const renderScholarshipModal = () => (
    <Modal
      visible={showApplicationModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowApplicationModal(false)}
    >
      <BlurView
        style={styles.modalOverlay}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="rgba(0,0,0,0.5)"
      >
        <Surface style={styles.scholarshipModal}>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedScholarship?.title}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowApplicationModal(false)}
              />
            </View>

            {selectedScholarship && (
              <>
                <View style={styles.modalAcademyInfo}>
                  <Avatar.Image 
                    size={60} 
                    source={{ uri: selectedScholarship.academyLogo }}
                  />
                  <View style={styles.modalAcademyDetails}>
                    <Text style={styles.modalAcademyName}>{selectedScholarship.academy}</Text>
                    <Text style={styles.modalSportType}>
                      {selectedScholarship.sport} • {selectedScholarship.type}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalStats}>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatValue}>{selectedScholarship.amount}</Text>
                    <Text style={styles.modalStatLabel}>Coverage</Text>
                  </View>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatValue}>{selectedScholarship.duration}</Text>
                    <Text style={styles.modalStatLabel}>Duration</Text>
                  </View>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatValue}>
                      {getDaysUntilDeadline(selectedScholarship.deadline)}
                    </Text>
                    <Text style={styles.modalStatLabel}>Days Left</Text>
                  </View>
                </View>

                <Text style={styles.modalDescription}>{selectedScholarship.description}</Text>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>🎯 Eligibility Requirements</Text>
                  {selectedScholarship.eligibility.map((req, index) => (
                    <Text key={index} style={styles.modalListItem}>{req}</Text>
                  ))}
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>💰 Benefits</Text>
                  {selectedScholarship.benefits.map((benefit, index) => (
                    <Text key={index} style={styles.modalListItem}>{benefit}</Text>
                  ))}
                </View>

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowApplicationModal(false)}
                    style={styles.modalButton}
                  >
                    Close
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleApplyScholarship}
                    style={styles.modalButton}
                    buttonColor={COLORS.primary}
                  >
                    Apply Now
                  </Button>
                </View>
              </>
            )}
          </ScrollView>
        </Surface>
      </BlurView>
    </Modal>
  );

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <BlurView
        style={styles.modalOverlay}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="rgba(0,0,0,0.5)"
      >
        <Surface style={styles.filtersModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Scholarships 🔍</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowFilters(false)}
            />
          </View>

          <ScrollView style={styles.filtersContent}>
            <Text style={styles.filterSectionTitle}>Sport Categories</Text>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.filterOption}
                onPress={() => handleFilterChange(option.value)}
              >
                <RadioButton
                  value={option.value}
                  status={selectedFilter === option.value ? 'checked' : 'unchecked'}
                  color={COLORS.primary}
                />
                <Text style={styles.filterOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Surface>
      </BlurView>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.loadingGradient}
        >
          <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
          <MaterialIcons name="school" size={60} color="#ffffff" />
          <Text style={styles.loadingText}>Loading Scholarships...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        {renderHeader()}
        {renderSearchBar()}
        {renderTabBar()}
        
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            {selectedTab === 'available' ? (
              <>
                {getFilteredScholarships().length > 0 ? (
                  getFilteredScholarships().map(renderScholarshipCard)
                ) : (
                  <Surface style={styles.emptyState}>
                    <MaterialIcons name="search-off" size={60} color={COLORS.textSecondary} />
                    <Text style={styles.emptyTitle}>No Scholarships Found</Text>
                    <Text style={styles.emptyMessage}>
                      Try adjusting your search or filter criteria
                    </Text>
                  </Surface>
                )}
              </>
            ) : (
              <>
                {myApplications.length > 0 ? (
                  myApplications.map(renderApplicationCard)
                ) : (
                  <Surface style={styles.emptyState}>
                    <MaterialIcons name="assignment" size={60} color={COLORS.textSecondary} />
                    <Text style={styles.emptyTitle}>No Applications Yet</Text>
                    <Text style={styles.emptyMessage}>
                      Start applying for scholarships to track your progress here
                    </Text>
                    <Button
                      mode="contained"
                      onPress={() => setSelectedTab('available')}
                      style={styles.emptyButton}
                      buttonColor={COLORS.primary}
                    >
                      Browse Scholarships
                    </Button>
                  </Surface>
                )}
              </>
            )}
            
            <View style={styles.bottomSpacing} />
          </View>
        </ScrollView>

        {selectedTab === 'available' && (
          <FAB
            icon="add"
            label="Apply Now"
            style={styles.fab}
            onPress={() => {
              if (getFilteredScholarships().length > 0) {
                handleScholarshipPress(getFilteredScholarships()[0]);
              }
            }}
            color="#ffffff"
          />
        )}
      </Animated.View>

      {renderScholarshipModal()}
      {renderFiltersModal()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TEXT_STYLES.h3,
    color: '#ffffff',
    marginTop: SPACING.md,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  filterButton: {
    padding: SPACING.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#ffffff',
    opacity: 0.9,
  },
  searchContainer: {
    margin: SPACING.md,
    borderRadius: 8,
    elevation: 2,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
    elevation: 0,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.md,
  },
  scholarshipCard: {
    marginBottom: SPACING.md,
  },
  cardSurface: {
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  scholarshipTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  academyName: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  priorityChip: {
    backgroundColor: COLORS.warning,
  },
  priorityChipText: {
    color: '#ffffff',
    fontSize: 12,
  },
  cardContent: {
    padding: SPACING.md,
  },
  scholarshipDetails: {
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    marginRight: SPACING.md,
  },
  amountText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: '600',
    marginLeft: SPACING.xs,
    marginRight: SPACING.md,
  },
  description: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  deadlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.xs,
  },
  urgentDeadline: {
    color: COLORS.error,
    fontWeight: '600',
  },
  statusChip: {
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 12,
  },
  applicationProgress: {
    height: 4,
    borderRadius: 2,
    marginBottom: SPACING.xs,
  },
  applicationCount: {
    ...TEXT_STYLES.small,
    textAlign: 'center',
  },
  applicationCard: {
    marginBottom: SPACING.md,
  },
  applicationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  applicationInfo: {
    flex: 1,
  },
  applicationTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  applicationAcademy: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  applicationDate: {
    ...TEXT_STYLES.small,
  },
  applicationProgress: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stageText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  nextStepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: `${COLORS.primary}08`,
  },
  nextStepText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  feedbackContainer: {
    padding: SPACING.md,
    backgroundColor: `${COLORS.success}08`,
  },
  feedbackText: {
    ...TEXT_STYLES.caption,
    fontStyle: 'italic',
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderRadius: 12,
    elevation: 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    marginTop: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  scholarshipModal: {
    width: width * 0.95,
    maxHeight: height * 0.9,
    borderRadius: 12,
    elevation: 10,
  },
  modalContent: {
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    flex: 1,
    marginRight: SPACING.md,
  },
  modalAcademyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalAcademyDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  modalAcademyName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  modalSportType: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
  },
  modalStatLabel: {
    ...TEXT_STYLES.small,
    marginTop: SPACING.xs,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    padding: SPACING.md,
    lineHeight: 24,
  },
  modalSection: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalSectionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  modalListItem: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  modalButton: {
    flex: 1,
  },
  filtersModal: {
    width: width * 0.9,
    maxHeight: height * 0.7,
    borderRadius: 12,
    elevation: 10,
  },
  filtersContent: {
    padding: SPACING.md,
  },
  filterSectionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  filterOptionText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
  },
  bottomSpacing: {
    height: 100,
  },
};

export default ScholarshipProgram;