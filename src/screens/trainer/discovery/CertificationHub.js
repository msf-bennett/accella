import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  FlatList,
  Vibration,
  Dimensions,
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
  Divider,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth } = Dimensions.get('window');

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
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
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body1: { fontSize: 16, color: COLORS.text },
  body2: { fontSize: 14, color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const CertificationHub = ({ navigation }) => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('current'); // current, discover, achievements
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock certifications data
  const currentCertifications = [
    {
      id: '1',
      name: 'ACSM Certified Personal Trainer',
      provider: 'American College of Sports Medicine',
      issueDate: '2022-03-15',
      expiryDate: '2025-03-15',
      status: 'active',
      level: 'professional',
      category: 'Personal Training',
      logo: 'https://via.placeholder.com/60x60/4CAF50/white?text=ACSM',
      credentialId: 'ACSM-CPT-2022-001234',
      ceuRequired: 20,
      ceuCompleted: 15,
      documents: ['certificate.pdf', 'transcript.pdf'],
    },
    {
      id: '2',
      name: 'NASM Corrective Exercise Specialist',
      provider: 'National Academy of Sports Medicine',
      issueDate: '2023-01-20',
      expiryDate: '2025-01-20',
      status: 'active',
      level: 'specialist',
      category: 'Corrective Exercise',
      logo: 'https://via.placeholder.com/60x60/2196F3/white?text=NASM',
      credentialId: 'NASM-CES-2023-005678',
      ceuRequired: 15,
      ceuCompleted: 8,
      documents: ['certificate.pdf'],
    },
    {
      id: '3',
      name: 'CPR/AED Certification',
      provider: 'American Red Cross',
      issueDate: '2023-06-10',
      expiryDate: '2024-12-10',
      status: 'expiring_soon',
      level: 'basic',
      category: 'Safety',
      logo: 'https://via.placeholder.com/60x60/F44336/white?text=ARC',
      credentialId: 'ARC-CPR-2023-009876',
      ceuRequired: 0,
      ceuCompleted: 0,
      documents: ['cpr_card.pdf'],
    },
  ];

  const availableCertifications = [
    {
      id: '4',
      name: 'NSCA Certified Strength & Conditioning Specialist',
      provider: 'National Strength and Conditioning Association',
      category: 'Strength & Conditioning',
      level: 'professional',
      duration: '3-6 months',
      cost: '$435',
      difficulty: 'Advanced',
      rating: 4.8,
      reviews: 2847,
      description: 'Premier certification for strength and conditioning professionals working with athletes.',
      requirements: ['Bachelor\'s degree', '2+ years experience'],
      logo: 'https://via.placeholder.com/60x60/FF9800/white?text=NSCA',
      featured: true,
    },
    {
      id: '5',
      name: 'Precision Nutrition Level 1',
      provider: 'Precision Nutrition',
      category: 'Nutrition',
      level: 'beginner',
      duration: '6 months',
      cost: '$999',
      difficulty: 'Intermediate',
      rating: 4.9,
      reviews: 5231,
      description: 'World\'s most respected nutrition coaching certification program.',
      requirements: ['No prerequisites'],
      logo: 'https://via.placeholder.com/60x60/4CAF50/white?text=PN',
      featured: true,
    },
    {
      id: '6',
      name: 'TRX Suspension Training Course',
      provider: 'TRX Training',
      category: 'Functional Training',
      level: 'beginner',
      duration: '2 days',
      cost: '$295',
      difficulty: 'Beginner',
      rating: 4.7,
      reviews: 1456,
      description: 'Learn to effectively use TRX Suspension Trainer for total-body workouts.',
      requirements: ['Current fitness certification'],
      logo: 'https://via.placeholder.com/60x60/2196F3/white?text=TRX',
      featured: false,
    },
    {
      id: '7',
      name: 'Yoga Alliance RYT-200',
      provider: 'Yoga Alliance',
      category: 'Yoga',
      level: 'professional',
      duration: '4-8 weeks',
      cost: '$2500',
      difficulty: 'Intermediate',
      rating: 4.6,
      reviews: 3892,
      description: 'Foundational yoga teacher training certification recognized worldwide.',
      requirements: ['Regular yoga practice'],
      logo: 'https://via.placeholder.com/60x60/9C27B0/white?text=YA',
      featured: false,
    },
  ];

  const achievements = [
    {
      id: 'a1',
      name: 'Certification Pioneer',
      description: 'Earned your first professional certification',
      icon: '🏆',
      unlockedDate: '2022-03-15',
      type: 'milestone',
    },
    {
      id: 'a2',
      name: 'Specialist Status',
      description: 'Obtained a specialized certification',
      icon: '🎯',
      unlockedDate: '2023-01-20',
      type: 'milestone',
    },
    {
      id: 'a3',
      name: 'Safety First',
      description: 'Maintained valid CPR/AED certification',
      icon: '🚨',
      unlockedDate: '2023-06-10',
      type: 'safety',
    },
    {
      id: 'a4',
      name: 'Lifelong Learner',
      description: 'Complete 50 CEUs in a single year',
      icon: '📚',
      progress: 23,
      total: 50,
      type: 'progress',
    },
  ];

  const certificationCategories = [
    'All',
    'Personal Training',
    'Strength & Conditioning',
    'Nutrition',
    'Corrective Exercise',
    'Functional Training',
    'Yoga',
    'Safety',
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'expiring_soon': return COLORS.warning;
      case 'expired': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.warning;
      case 'advanced': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCertificationPress = (certification, isDiscovery = false) => {
    Vibration.vibrate(30);
    setSelectedCertification({ ...certification, isDiscovery });
    setShowDetailModal(true);
  };

  const handleQuickAction = (action, certification = null) => {
    Vibration.vibrate(30);
    const message = certification 
      ? `${action} for ${certification.name} is under development!`
      : `${action} feature is under development!`;
    
    Alert.alert(
      'Feature Coming Soon',
      `${message} 🚀`,
      [{ text: 'Got it!' }]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{
        paddingTop: StatusBar.currentHeight + SPACING.md,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
        <View>
          <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
            Certification Hub 🎓
          </Text>
          <Text style={[TEXT_STYLES.body2, { color: 'rgba(255,255,255,0.8)' }]}>
            Manage your professional credentials
          </Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <IconButton
            icon="notifications"
            size={24}
            iconColor="white"
            onPress={() => handleQuickAction('Notifications')}
          />
          <IconButton
            icon="filter-list"
            size={24}
            iconColor="white"
            onPress={() => setShowFilterModal(true)}
          />
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        {[
          { key: 'current', label: 'Current', icon: 'verified' },
          { key: 'discover', label: 'Discover', icon: 'explore' },
          { key: 'achievements', label: 'Achievements', icon: 'jump-rope' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              marginHorizontal: SPACING.xs,
              backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.3)' : 'transparent',
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Icon
              name={tab.icon}
              size={16}
              color="white"
              style={{ marginRight: SPACING.xs }}
            />
            <Text style={{
              color: 'white',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );

  const renderCurrentCertifications = () => (
    <View style={{ padding: SPACING.md }}>
      {/* Quick Stats */}
      <Surface style={{
        padding: SPACING.md,
        borderRadius: 12,
        elevation: 3,
        marginBottom: SPACING.md,
      }}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          Certification Status 📊
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
              {currentCertifications.filter(c => c.status === 'active').length}
            </Text>
            <Text style={TEXT_STYLES.caption}>Active</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.warning }]}>
              {currentCertifications.filter(c => c.status === 'expiring_soon').length}
            </Text>
            <Text style={TEXT_STYLES.caption}>Expiring Soon</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.info }]}>
              {currentCertifications.reduce((sum, c) => sum + c.ceuCompleted, 0)}
            </Text>
            <Text style={TEXT_STYLES.caption}>CEUs Earned</Text>
          </View>
        </View>
      </Surface>

      {/* Certifications List */}
      {currentCertifications.map((cert) => {
        const daysUntilExpiry = getDaysUntilExpiry(cert.expiryDate);
        const ceuProgress = cert.ceuRequired > 0 ? cert.ceuCompleted / cert.ceuRequired : 1;

        return (
          <TouchableOpacity
            key={cert.id}
            onPress={() => handleCertificationPress(cert)}
          >
            <Card style={{ marginBottom: SPACING.md, elevation: 3 }}>
              <Card.Content style={{ padding: SPACING.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Avatar.Image
                    size={60}
                    source={{ uri: cert.logo }}
                    style={{ marginRight: SPACING.md }}
                  />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                      <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold', flex: 1 }]}>
                        {cert.name}
                      </Text>
                      <Chip
                        style={{ backgroundColor: getStatusColor(cert.status) }}
                        textStyle={{ color: 'white', fontSize: 10 }}
                      >
                        {cert.status === 'expiring_soon' ? `${daysUntilExpiry}d left` : cert.status.toUpperCase()}
                      </Chip>
                    </View>
                    
                    <Text style={TEXT_STYLES.body2} numberOfLines={1}>
                      {cert.provider}
                    </Text>
                    
                    <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
                      Expires: {formatDate(cert.expiryDate)}
                    </Text>

                    {cert.ceuRequired > 0 && (
                      <View style={{ marginTop: SPACING.sm }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
                          <Text style={TEXT_STYLES.caption}>CEU Progress</Text>
                          <Text style={TEXT_STYLES.caption}>
                            {cert.ceuCompleted}/{cert.ceuRequired}
                          </Text>
                        </View>
                        <ProgressBar
                          progress={ceuProgress}
                          color={ceuProgress >= 1 ? COLORS.success : COLORS.primary}
                          style={{ height: 6, borderRadius: 3 }}
                        />
                      </View>
                    )}
                  </View>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderDiscoverCertifications = () => (
    <View style={{ padding: SPACING.md }}>
      {/* Search Bar */}
      <Searchbar
        placeholder="Search certifications..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{ marginBottom: SPACING.md }}
      />

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: SPACING.md }}
      >
        {certificationCategories.map((category) => (
          <Chip
            key={category}
            selected={selectedFilters.includes(category)}
            onPress={() => {
              if (selectedFilters.includes(category)) {
                setSelectedFilters(selectedFilters.filter(f => f !== category));
              } else {
                setSelectedFilters([...selectedFilters, category]);
              }
            }}
            style={{
              marginRight: SPACING.sm,
              backgroundColor: selectedFilters.includes(category) ? COLORS.primary : COLORS.surface,
            }}
            textStyle={{
              color: selectedFilters.includes(category) ? 'white' : COLORS.text,
            }}
          >
            {category}
          </Chip>
        ))}
      </ScrollView>

      {/* Featured Section */}
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        Featured Certifications ⭐
      </Text>

      {availableCertifications
        .filter(cert => cert.featured)
        .map((cert) => (
          <TouchableOpacity
            key={cert.id}
            onPress={() => handleCertificationPress(cert, true)}
          >
            <Card style={{ marginBottom: SPACING.md, elevation: 3 }}>
              <LinearGradient
                colors={['rgba(102, 126, 234, 0.1)', 'transparent']}
                style={{ padding: SPACING.md }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Avatar.Image
                    size={60}
                    source={{ uri: cert.logo }}
                    style={{ marginRight: SPACING.md }}
                  />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                      <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold', flex: 1 }]}>
                        {cert.name}
                      </Text>
                      <Badge style={{ backgroundColor: COLORS.gold }}>
                        FEATURED
                      </Badge>
                    </View>
                    
                    <Text style={TEXT_STYLES.body2} numberOfLines={1}>
                      {cert.provider}
                    </Text>
                    
                    <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]} numberOfLines={2}>
                      {cert.description}
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm, alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="star" size={16} color={COLORS.warning} />
                        <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                          {cert.rating} ({cert.reviews})
                        </Text>
                      </View>
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Chip
                          style={{ backgroundColor: getDifficultyColor(cert.difficulty), marginRight: SPACING.xs }}
                          textStyle={{ color: 'white', fontSize: 10 }}
                        >
                          {cert.difficulty}
                        </Chip>
                        <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold', color: COLORS.primary }]}>
                          {cert.cost}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </Card>
          </TouchableOpacity>
        ))}

      {/* All Certifications */}
      <Text style={[TEXT_STYLES.h3, { marginVertical: SPACING.md }]}>
        All Certifications 📚
      </Text>

      {availableCertifications.map((cert) => (
        <TouchableOpacity
          key={cert.id}
          onPress={() => handleCertificationPress(cert, true)}
        >
          <Card style={{ marginBottom: SPACING.md, elevation: 2 }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Avatar.Image
                  size={50}
                  source={{ uri: cert.logo }}
                  style={{ marginRight: SPACING.md }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold' }]} numberOfLines={1}>
                    {cert.name}
                  </Text>
                  
                  <Text style={TEXT_STYLES.body2} numberOfLines={1}>
                    {cert.provider}
                  </Text>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm, alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="schedule" size={14} color={COLORS.textSecondary} />
                      <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                        {cert.duration}
                      </Text>
                    </View>
                    
                    <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold', color: COLORS.primary }]}>
                      {cert.cost}
                    </Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAchievements = () => (
    <View style={{ padding: SPACING.md }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        Your Achievements 🏆
      </Text>

      {achievements.map((achievement) => (
        <Card key={achievement.id} style={{ marginBottom: SPACING.md, elevation: 2 }}>
          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 40, marginRight: SPACING.md }}>
                {achievement.icon}
              </Text>
              
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold' }]}>
                  {achievement.name}
                </Text>
                
                <Text style={TEXT_STYLES.body2}>
                  {achievement.description}
                </Text>

                {achievement.type === 'progress' ? (
                  <View style={{ marginTop: SPACING.sm }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
                      <Text style={TEXT_STYLES.caption}>Progress</Text>
                      <Text style={TEXT_STYLES.caption}>
                        {achievement.progress}/{achievement.total}
                      </Text>
                    </View>
                    <ProgressBar
                      progress={achievement.progress / achievement.total}
                      color={COLORS.primary}
                      style={{ height: 6, borderRadius: 3 }}
                    />
                  </View>
                ) : (
                  <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs, color: COLORS.success }]}>
                    Unlocked: {formatDate(achievement.unlockedDate)}
                  </Text>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderDetailModal = () => (
    <Portal>
      <Modal
        visible={showDetailModal}
        onDismiss={() => setShowDetailModal(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.surface,
          margin: SPACING.md,
          borderRadius: 12,
          maxHeight: '80%',
        }}
      >
        {selectedCertification && (
          <ScrollView>
            <View style={{ padding: SPACING.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                <Avatar.Image
                  size={60}
                  source={{ uri: selectedCertification.logo }}
                  style={{ marginRight: SPACING.md }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={TEXT_STYLES.h3}>{selectedCertification.name}</Text>
                  <Text style={TEXT_STYLES.body2}>{selectedCertification.provider}</Text>
                  {!selectedCertification.isDiscovery && (
                    <Chip
                      style={{
                        backgroundColor: getStatusColor(selectedCertification.status),
                        marginTop: SPACING.xs,
                        alignSelf: 'flex-start',
                      }}
                      textStyle={{ color: 'white' }}
                    >
                      {selectedCertification.status.toUpperCase()}
                    </Chip>
                  )}
                </View>
              </View>

              <Divider style={{ marginVertical: SPACING.md }} />

              {selectedCertification.isDiscovery ? (
                <View>
                  <Text style={TEXT_STYLES.body1} numberOfLines={null}>
                    {selectedCertification.description}
                  </Text>
                  
                  <View style={{ marginTop: SPACING.md }}>
                    <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold' }]}>Details:</Text>
                    <Text style={TEXT_STYLES.body1}>💰 Cost: {selectedCertification.cost}</Text>
                    <Text style={TEXT_STYLES.body1}>⏱️ Duration: {selectedCertification.duration}</Text>
                    <Text style={TEXT_STYLES.body1}>📊 Difficulty: {selectedCertification.difficulty}</Text>
                    <Text style={TEXT_STYLES.body1}>⭐ Rating: {selectedCertification.rating}/5 ({selectedCertification.reviews} reviews)</Text>
                  </View>

                  {selectedCertification.requirements && (
                    <View style={{ marginTop: SPACING.md }}>
                      <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold' }]}>Requirements:</Text>
                      {selectedCertification.requirements.map((req, index) => (
                        <Text key={index} style={TEXT_STYLES.body1}>• {req}</Text>
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View>
                  <Text style={TEXT_STYLES.body1}>
                    📅 Issued: {formatDate(selectedCertification.issueDate)}
                  </Text>
                  <Text style={TEXT_STYLES.body1}>
                    🗓️ Expires: {formatDate(selectedCertification.expiryDate)}
                  </Text>
                  <Text style={TEXT_STYLES.body1}>
                    🆔 Credential ID: {selectedCertification.credentialId}
                  </Text>
                  
                  {selectedCertification.ceuRequired > 0 && (
                    <View style={{ marginTop: SPACING.md }}>
                      <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold' }]}>
                        CEU Requirements:
                      </Text>
                      <Text style={TEXT_STYLES.body1}>
                        Completed: {selectedCertification.ceuCompleted}/{selectedCertification.ceuRequired} CEUs
                      </Text>
                      <ProgressBar
                        progress={selectedCertification.ceuCompleted / selectedCertification.ceuRequired}
                        color={COLORS.primary}
                        style={{ height: 6, borderRadius: 3, marginTop: SPACING.xs }}
                      />
                    </View>
                  )}

                  {selectedCertification.documents && (
                    <View style={{ marginTop: SPACING.md }}>
                      <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold' }]}>Documents:</Text>
                      {selectedCertification.documents.map((doc, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleQuickAction('View Document', selectedCertification)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: SPACING.xs,
                            padding: SPACING.sm,
                            backgroundColor: COLORS.background,
                            borderRadius: 8,
                          }}
                        >
                          <Icon name="description" size={20} color={COLORS.primary} />
                          <Text style={[TEXT_STYLES.body1, { marginLeft: SPACING.sm, color: COLORS.primary }]}>
                            {doc}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                marginTop: SPACING.lg,
                flexWrap: 'wrap',
              }}>
                {selectedCertification.isDiscovery ? (
                  <>
                    <Button
                      mode="contained"
                      onPress={() => {
                        setShowDetailModal(false);
                        handleQuickAction('Enroll Now', selectedCertification);
                      }}
                      buttonColor={COLORS.primary}
                      icon="school"
                      style={{ marginBottom: SPACING.sm }}
                    >
                      Enroll Now
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        setShowDetailModal(false);
                        handleQuickAction('Save for Later', selectedCertification);
                      }}
                      icon="bookmark"
                      style={{ marginBottom: SPACING.sm }}
                    >
                      Save for Later
                    </Button>
                    <Button
                      mode="text"
                      onPress={() => {
                        setShowDetailModal(false);
                        handleQuickAction('Share Certification', selectedCertification);
                      }}
                      icon="share"
                    >
                      Share
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      mode="contained"
                      onPress={() => {
                        setShowDetailModal(false);
                        handleQuickAction('Renew Certification', selectedCertification);
                      }}
                      buttonColor={COLORS.success}
                      icon="refresh"
                      style={{ marginBottom: SPACING.sm }}
                    >
                      Renew
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        setShowDetailModal(false);
                        handleQuickAction('View Certificate', selectedCertification);
                      }}
                      icon="certificate"
                      style={{ marginBottom: SPACING.sm }}
                    >
                      View Certificate
                    </Button>
                    <Button
                      mode="text"
                      onPress={() => {
                        setShowDetailModal(false);
                        handleQuickAction('Add CEUs', selectedCertification);
                      }}
                      icon="add"
                    >
                      Add CEUs
                    </Button>
                  </>
                )}
              </View>
            </View>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilterModal}
        onDismiss={() => setShowFilterModal(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.surface,
          margin: SPACING.md,
          borderRadius: 12,
          padding: SPACING.lg,
        }}
      >
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          Filter Certifications
        </Text>

        <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold', marginBottom: SPACING.sm }]}>
          Categories:
        </Text>
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.lg }}>
          {certificationCategories.slice(1).map((category) => (
            <Chip
              key={category}
              selected={selectedFilters.includes(category)}
              onPress={() => {
                if (selectedFilters.includes(category)) {
                  setSelectedFilters(selectedFilters.filter(f => f !== category));
                } else {
                  setSelectedFilters([...selectedFilters, category]);
                }
              }}
              style={{
                margin: SPACING.xs,
                backgroundColor: selectedFilters.includes(category) ? COLORS.primary : COLORS.background,
              }}
              textStyle={{
                color: selectedFilters.includes(category) ? 'white' : COLORS.text,
              }}
            >
              {category}
            </Chip>
          ))}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: SPACING.lg }}>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedFilters([]);
              setShowFilterModal(false);
            }}
          >
            Clear All
          </Button>
          <Button
            mode="contained"
            onPress={() => setShowFilterModal(false)}
            buttonColor={COLORS.primary}
          >
            Apply Filters
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'current':
        return renderCurrentCertifications();
      case 'discover':
        return renderDiscoverCertifications();
      case 'achievements':
        return renderAchievements();
      default:
        return renderCurrentCertifications();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          flex: 1,
        }}
      >
        {renderHeader()}
        
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {renderTabContent()}
          
          {/* Bottom spacing for FAB */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </Animated.View>

      {renderDetailModal()}
      {renderFilterModal()}

      <FAB
        icon={activeTab === 'current' ? 'add' : activeTab === 'discover' ? 'search' : 'star'}
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => {
          if (activeTab === 'current') {
            handleQuickAction('Add New Certification');
          } else if (activeTab === 'discover') {
            handleQuickAction('Advanced Search');
          } else {
            handleQuickAction('Achievement Details');
          }
        }}
      />
    </View>
  );
};

export default CertificationHub;