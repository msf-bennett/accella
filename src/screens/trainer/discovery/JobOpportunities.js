import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  Alert,
  Animated,
  FlatList,
  Modal,
  Share,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from '../../../components/shared/BlurView';
import { BlurView } from '../../../components/shared/BlurView';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  ProgressBar,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#FF6B6B',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const JobOpportunities = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJobType, setSelectedJobType] = useState('All');
  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  // Mock data for job opportunities
  const [jobOpportunities, setJobOpportunities] = useState([
    {
      id: '1',
      title: 'Senior Personal Trainer',
      company: 'Elite Fitness Center',
      location: 'Westlands, Nairobi',
      type: 'Full-time',
      salary: 'KES 80,000 - 120,000',
      experience: '3+ years',
      posted: '2 days ago',
      logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      description: 'Lead personal training programs for premium clients. Develop customized fitness plans and maintain high client satisfaction.',
      requirements: ['Certified Personal Trainer', 'Experience with HIIT', 'Nutrition Knowledge', 'Client Management'],
      benefits: ['Health Insurance', 'Performance Bonus', 'Gym Membership', 'Professional Development'],
      verified: true,
      urgent: false,
      remote: false,
      featured: true,
      applicants: 15,
      skills: ['Personal Training', 'HIIT', 'Nutrition', 'Client Relations'],
      companySize: '50-100 employees',
      industry: 'Fitness & Wellness',
    },
    {
      id: '2',
      title: 'Yoga Instructor - Part Time',
      company: 'Zen Wellness Studio',
      location: 'Karen, Nairobi',
      type: 'Part-time',
      salary: 'KES 3,000 per session',
      experience: '1+ years',
      posted: '1 day ago',
      logo: 'https://images.unsplash.com/photo-1544966503-7cc72eaecf9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      description: 'Teach various yoga styles including Hatha, Vinyasa, and restorative yoga to diverse groups.',
      requirements: ['Yoga Alliance Certification', 'Experience with Beginners', 'Mindfulness Training'],
      benefits: ['Flexible Schedule', 'Free Classes', 'Wellness Discounts'],
      verified: true,
      urgent: false,
      remote: false,
      featured: false,
      applicants: 8,
      skills: ['Yoga', 'Mindfulness', 'Group Instruction', 'Flexibility Training'],
      companySize: '10-20 employees',
      industry: 'Wellness & Spa',
    },
    {
      id: '3',
      title: 'Online Fitness Coach',
      company: 'FitTech Solutions',
      location: 'Remote',
      type: 'Contract',
      salary: 'KES 60,000 - 100,000',
      experience: '2+ years',
      posted: '3 hours ago',
      logo: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      description: 'Deliver virtual fitness coaching through our app platform. Create engaging workout programs for global clients.',
      requirements: ['Digital Fitness Experience', 'Video Content Creation', 'App Platform Knowledge'],
      benefits: ['Work from Home', 'Global Client Base', 'Tech Equipment Provided'],
      verified: false,
      urgent: true,
      remote: true,
      featured: true,
      applicants: 23,
      skills: ['Online Coaching', 'Video Production', 'Digital Marketing', 'App Technology'],
      companySize: '20-50 employees',
      industry: 'Technology & Fitness',
    },
    {
      id: '4',
      title: 'Sports Team Trainer',
      company: 'Nairobi Basketball Club',
      location: 'Kasarani, Nairobi',
      type: 'Full-time',
      salary: 'KES 90,000 - 130,000',
      experience: '4+ years',
      posted: '5 days ago',
      logo: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      description: 'Lead conditioning and injury prevention programs for professional basketball team.',
      requirements: ['Sports Science Degree', 'Team Sports Experience', 'Injury Prevention', 'Performance Analysis'],
      benefits: ['Travel Opportunities', 'Sports Medicine Training', 'Performance Bonuses'],
      verified: true,
      urgent: false,
      remote: false,
      featured: false,
      applicants: 6,
      skills: ['Sports Training', 'Injury Prevention', 'Performance Analysis', 'Team Management'],
      companySize: '30-50 employees',
      industry: 'Professional Sports',
    },
    {
      id: '5',
      title: 'Fitness Influencer Partnership',
      company: 'Social Fitness Co.',
      location: 'Nairobi (Flexible)',
      type: 'Freelance',
      salary: 'Commission Based',
      experience: '1+ years',
      posted: '1 week ago',
      logo: 'https://images.unsplash.com/photo-1540206395-68808572332f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      description: 'Create fitness content for social media platforms. Build your personal brand while promoting wellness.',
      requirements: ['Social Media Presence', 'Content Creation', 'Fitness Knowledge'],
      benefits: ['Brand Partnerships', 'Revenue Share', 'Marketing Support'],
      verified: false,
      urgent: false,
      remote: true,
      featured: false,
      applicants: 31,
      skills: ['Content Creation', 'Social Media', 'Brand Marketing', 'Photography'],
      companySize: '5-10 employees',
      industry: 'Digital Marketing',
    },
  ]);

  const jobTypes = ['All', 'Full-time', 'Part-time', 'Contract', 'Freelance'];
  
  const filterOptions = [
    { id: 'verified', label: 'Verified Companies', icon: 'verified' },
    { id: 'remote', label: 'Remote Work', icon: 'home' },
    { id: 'urgent', label: 'Urgent Hiring', icon: 'priority-high' },
    { id: 'featured', label: 'Featured Jobs', icon: 'star' },
    { id: 'entry', label: 'Entry Level', icon: 'school' },
    { id: 'senior', label: 'Senior Level', icon: 'trending-up' },
    { id: 'fitness', label: 'Fitness Centers', icon: 'fitness-center' },
    { id: 'wellness', label: 'Wellness', icon: 'spa' },
    { id: 'sports', label: 'Sports Teams', icon: 'sports' },
    { id: 'tech', label: 'Fitness Tech', icon: 'computer' },
  ];

  // Animation setup
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Filter jobs based on search, filters, and job type
  const filteredJobs = jobOpportunities.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesJobType = selectedJobType === 'All' || job.type === selectedJobType;
    
    const matchesFilters = selectedFilters.length === 0 || selectedFilters.every(filter => {
      switch (filter) {
        case 'verified':
          return job.verified;
        case 'remote':
          return job.remote;
        case 'urgent':
          return job.urgent;
        case 'featured':
          return job.featured;
        case 'entry':
          return job.experience.includes('1+') || job.experience.includes('0+');
        case 'senior':
          return job.experience.includes('3+') || job.experience.includes('4+');
        case 'fitness':
          return job.industry.includes('Fitness');
        case 'wellness':
          return job.industry.includes('Wellness');
        case 'sports':
          return job.industry.includes('Sports');
        case 'tech':
          return job.industry.includes('Technology');
        default:
          return true;
      }
    });

    return matchesSearch && matchesJobType && matchesFilters;
  });

  // Handle filter toggle
  const toggleFilter = (filterId) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  // Handle bookmark job
  const toggleBookmark = (jobId) => {
    setBookmarkedJobs(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(jobId)) {
        newBookmarks.delete(jobId);
      } else {
        newBookmarks.add(jobId);
      }
      return newBookmarks;
    });
  };

  // Handle apply for job
  const handleApply = (job) => {
    Alert.alert(
      'Apply for Job',
      `Apply for ${job.title} at ${job.company}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Apply Now', 
          onPress: () => {
            setAppliedJobs(prev => new Set([...prev, job.id]));
            Alert.alert('Application Submitted! 🎉', 'Your application has been sent successfully. The employer will review it soon.');
          }
        },
      ]
    );
  };

  // Handle share job
  const handleShare = async (job) => {
    try {
      await Share.share({
        message: `Check out this job opportunity: ${job.title} at ${job.company}\nLocation: ${job.location}\nSalary: ${job.salary}`,
        title: 'Job Opportunity',
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share job opportunity');
    }
  };

  // Handle view company
  const handleViewCompany = (job) => {
    Alert.alert('Feature Coming Soon', 'Company profiles will be available in the next update! 🏢');
  };

  // Get salary color based on range
  const getSalaryColor = (salary) => {
    if (salary.includes('100,000') || salary.includes('120,000') || salary.includes('130,000')) {
      return COLORS.success;
    } else if (salary.includes('Commission') || salary.includes('per session')) {
      return COLORS.warning;
    }
    return COLORS.primary;
  };

  // Render job card
  const renderJobCard = ({ item: job, index }) => (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card style={[styles.jobCard, job.featured && styles.featuredCard]} elevation={job.featured ? 6 : 3}>
        {job.featured && (
          <View style={styles.featuredBanner}>
            <Icon name="star" size={16} color="#fff" />
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}

        <Card.Content style={styles.cardContent}>
          {/* Header */}
          <View style={styles.jobHeader}>
            <View style={styles.companyInfo}>
              <Avatar.Image
                size={48}
                source={{ uri: job.logo }}
                style={styles.companyLogo}
              />
              <View style={styles.jobTitleSection}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <TouchableOpacity onPress={() => handleViewCompany(job)}>
                  <Text style={styles.companyName}>{job.company}</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => toggleBookmark(job.id)}
                style={styles.bookmarkButton}
              >
                <Icon
                  name={bookmarkedJobs.has(job.id) ? 'bookmark' : 'bookmark-border'}
                  size={24}
                  color={bookmarkedJobs.has(job.id) ? COLORS.accent : COLORS.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleShare(job)}
                style={styles.shareButton}
              >
                <Icon name="share" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Job Details */}
          <View style={styles.jobDetails}>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{job.location}</Text>
              {job.remote && (
                <Chip
                  icon="home"
                  style={styles.remoteChip}
                  textStyle={styles.remoteChipText}
                  compact
                >
                  Remote
                </Chip>
              )}
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="work" size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{job.type}</Text>
              <Text style={styles.experienceText}>• {job.experience}</Text>
            </View>

            <View style={styles.salaryRow}>
              <Icon name="attach-money" size={16} color={getSalaryColor(job.salary)} />
              <Text style={[styles.salaryText, { color: getSalaryColor(job.salary) }]}>
                {job.salary}
              </Text>
            </View>
          </View>

          {/* Status Indicators */}
          <View style={styles.statusIndicators}>
            {job.verified && (
              <Chip
                icon="verified"
                style={styles.verifiedChip}
                textStyle={styles.verifiedChipText}
                compact
              >
                Verified
              </Chip>
            )}
            {job.urgent && (
              <Chip
                icon="priority-high"
                style={styles.urgentChip}
                textStyle={styles.urgentChipText}
                compact
              >
                Urgent
              </Chip>
            )}
            <View style={styles.applicantCount}>
              <Icon name="people" size={14} color={COLORS.textSecondary} />
              <Text style={styles.applicantText}>{job.applicants} applied</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.jobDescription} numberOfLines={2}>
            {job.description}
          </Text>

          {/* Skills */}
          <View style={styles.skillsContainer}>
            <Text style={styles.skillsLabel}>Required Skills:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {job.skills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{skill}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Posted Time & Actions */}
          <View style={styles.cardFooter}>
            <View style={styles.postedInfo}>
              <Icon name="schedule" size={14} color={COLORS.textSecondary} />
              <Text style={styles.postedText}>Posted {job.posted}</Text>
            </View>

            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                icon="visibility"
                onPress={() => Alert.alert('Feature Coming Soon', 'Detailed job view coming soon! 📋')}
                style={styles.viewButton}
                labelStyle={styles.viewButtonText}
                compact
              >
                View
              </Button>
              <Button
                mode="contained"
                icon={appliedJobs.has(job.id) ? 'check' : 'send'}
                onPress={() => appliedJobs.has(job.id) ? null : handleApply(job)}
                style={[
                  styles.applyButton,
                  appliedJobs.has(job.id) && styles.appliedButton
                ]}
                labelStyle={styles.applyButtonText}
                buttonColor={appliedJobs.has(job.id) ? COLORS.success : COLORS.primary}
                disabled={appliedJobs.has(job.id)}
                compact
              >
                {appliedJobs.has(job.id) ? 'Applied' : 'Apply'}
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  // Render filter modal
  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent
      onRequestClose={() => setShowFilters(false)}
    >
      <BlurView intensity={50} style={styles.modalContainer}>
        <View style={styles.filterModal}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.filterHeader}
          >
            <Text style={styles.filterTitle}>Filter Job Opportunities</Text>
            <IconButton
              icon="close"
              iconColor="#fff"
              onPress={() => setShowFilters(false)}
            />
          </LinearGradient>

          <ScrollView style={styles.filterContent}>
            <Text style={styles.filterSectionTitle}>Job Categories</Text>
            <View style={styles.filterGrid}>
              {filterOptions.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterOption,
                    selectedFilters.includes(filter.id) && styles.selectedFilterOption
                  ]}
                  onPress={() => toggleFilter(filter.id)}
                >
                  <Icon
                    name={filter.icon}
                    size={24}
                    color={selectedFilters.includes(filter.id) ? COLORS.surface : COLORS.primary}
                  />
                  <Text style={[
                    styles.filterOptionText,
                    selectedFilters.includes(filter.id) && styles.selectedFilterText
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterActions}>
              <Button
                mode="outlined"
                onPress={() => setSelectedFilters([])}
                style={styles.clearButton}
              >
                Clear All
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowFilters(false)}
                style={styles.applyFiltersButton}
                buttonColor={COLORS.primary}
              >
                Apply Filters ({selectedFilters.length})
              </Button>
            </View>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={COLORS.primary} translucent />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Job Opportunities</Text>
            <TouchableOpacity onPress={() => Alert.alert('Feature Coming Soon', 'Job alerts will be available soon! 🔔')}>
              <Icon name="notifications" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.headerSubtitle}>Find your next career opportunity 🚀</Text>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{filteredJobs.length}</Text>
              <Text style={styles.statLabel}>Open Positions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{bookmarkedJobs.size}</Text>
              <Text style={styles.statLabel}>Bookmarked</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{appliedJobs.size}</Text>
              <Text style={styles.statLabel}>Applied</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search jobs, companies, skills..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={styles.searchInput}
          elevation={2}
        />
        
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickFilters}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <Icon name="filter-list" size={20} color={COLORS.primary} />
              <Text style={styles.filterButtonText}>Filters</Text>
              {selectedFilters.length > 0 && (
                <Badge style={styles.filterBadge}>{selectedFilters.length}</Badge>
              )}
            </TouchableOpacity>
            
            {jobTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.jobTypeButton,
                  selectedJobType === type && styles.selectedJobTypeButton
                ]}
                onPress={() => setSelectedJobType(type)}
              >
                <Text style={[
                  styles.jobTypeButtonText,
                  selectedJobType === type && styles.selectedJobTypeText
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Job List */}
      <FlatList
        data={filteredJobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id}
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="work-off" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search criteria or filters
            </Text>
            <Button
              mode="outlined"
              icon="refresh"
              onPress={onRefresh}
              style={styles.retryButton}
            >
              Refresh Jobs
            </Button>
          </View>
        }
      />

      {/* Filter Modal */}
      {renderFilterModal()}

      {/* Floating Action Button */}
      <FAB
        icon="upload"
        label="Upload CV"
        style={styles.fab}
        color="#fff"
        onPress={() => Alert.alert('Feature Coming Soon', 'CV upload feature coming soon! 📄')}
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
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    gap: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  searchContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  searchBar: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickFilters: {
    flex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    elevation: 1,
    position: 'relative',
  },
  filterButtonText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.accent,
  },
  jobTypeButton: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    elevation: 1,
  },
  selectedJobTypeButton: {
    backgroundColor: COLORS.primary,
  },
  jobTypeButtonText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  selectedJobTypeText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
  },
  cardContainer: {
    marginBottom: SPACING.md,
  },
  jobCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  featuredBanner: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.warning,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderBottomLeftRadius: 8,
    zIndex: 1,
  },
  featuredText: {
    ...TEXT_STYLES.small,
    color: '#fff',
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  cardContent: {
    padding: SPACING.md,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companyLogo: {
    marginRight: SPACING.sm,
  },
  jobTitleSection: {
    flex: 1,
  },
  jobTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.xs,
    paddingRight: SPACING.lg,
  },
  companyName: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  bookmarkButton: {
    padding: SPACING.xs,
  },
  shareButton: {
    padding: SPACING.xs,
  },
  jobDetails: {
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  experienceText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  remoteChip: {
    backgroundColor: COLORS.success,
    height: 24,
    marginLeft: SPACING.sm,
  },
  remoteChipText: {
    ...TEXT_STYLES.small,
    color: '#fff',
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.xs,
  },
  salaryText: {
    ...TEXT_STYLES.caption,
    fontWeight: '700',
    marginLeft: SPACING.xs,
    fontSize: 16,
  },
  statusIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  verifiedChip: {
    backgroundColor: COLORS.success,
    height: 28,
  },
  verifiedChipText: {
    ...TEXT_STYLES.small,
    color: '#fff',
  },
  urgentChip: {
    backgroundColor: COLORS.error,
    height: 28,
  },
  urgentChipText: {
    ...TEXT_STYLES.small,
    color: '#fff',
    fontWeight: '600',
  },
  applicantCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  applicantText: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.xs,
  },
  jobDescription: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
    marginBottom: SPACING.md,
    color: COLORS.textSecondary,
  },
  skillsContainer: {
    marginBottom: SPACING.md,
  },
  skillsLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  skillTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginRight: SPACING.xs,
  },
  skillTagText: {
    ...TEXT_STYLES.small,
    color: '#fff',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  postedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postedText: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  viewButton: {
    borderColor: COLORS.textSecondary,
    borderRadius: 8,
  },
  viewButtonText: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
  },
  applyButton: {
    borderRadius: 8,
    elevation: 2,
  },
  appliedButton: {
    elevation: 1,
  },
  applyButtonText: {
    ...TEXT_STYLES.small,
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    borderColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  filterTitle: {
    ...TEXT_STYLES.h3,
    color: '#fff',
  },
  filterContent: {
    padding: SPACING.lg,
  },
  filterSectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: '45%',
    gap: SPACING.xs,
  },
  selectedFilterOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterOptionText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    flex: 1,
  },
  selectedFilterText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  filterActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  clearButton: {
    flex: 1,
    borderColor: COLORS.textSecondary,
  },
  applyFiltersButton: {
    flex: 2,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
});

export default JobOpportunities;