import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Vibration,
  Platform,
  Animated,
  TouchableOpacity,
  FlatList,
  Image
} from 'react-native';
import { 
  Card,
  Text,
  Button,
  Chip,
  Surface,
  IconButton,
  Portal,
  Modal,
  Divider,
  TextInput,
  ProgressBar,
  Avatar,
  FAB,
  Badge,
  Searchbar
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your app's design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const Specialization = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, trainerProfile } = useSelector(state => state.auth);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCertModal, setCertModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  // Form states
  const [newSpecialization, setNewSpecialization] = useState({
    name: '',
    category: 'fitness',
    experienceYears: '',
    description: ''
  });
  
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    dateObtained: '',
    expiryDate: '',
    credentialId: '',
    image: null
  });

  // Specializations data
  const [specializations, setSpecializations] = useState([
    {
      id: 1,
      name: 'Strength Training',
      category: 'fitness',
      level: 'expert',
      experienceYears: 8,
      clientsCount: 45,
      description: 'Advanced powerlifting and Olympic lifting techniques',
      color: '#FF6B6B',
      icon: 'fitness-center'
    },
    {
      id: 2,
      name: 'HIIT Training',
      category: 'cardio',
      level: 'advanced',
      experienceYears: 5,
      clientsCount: 62,
      description: 'High-intensity interval training for fat loss',
      color: '#4ECDC4',
      icon: 'speed'
    },
    {
      id: 3,
      name: 'Yoga & Flexibility',
      category: 'flexibility',
      level: 'intermediate',
      experienceYears: 3,
      clientsCount: 28,
      description: 'Hatha and Vinyasa yoga for all skill levels',
      color: '#95E1D3',
      icon: 'self-improvement'
    },
    {
      id: 4,
      name: 'Sports Performance',
      category: 'sports',
      level: 'expert',
      experienceYears: 10,
      clientsCount: 35,
      description: 'Athletic performance enhancement for football players',
      color: '#FFA726',
      icon: 'sports-football'
    }
  ]);

  const [certifications, setCertifications] = useState([
    {
      id: 1,
      name: 'NASM Certified Personal Trainer',
      issuer: 'National Academy of Sports Medicine',
      dateObtained: '2018-03-15',
      expiryDate: '2026-03-15',
      credentialId: 'NASM-CPT-2018-4567',
      status: 'active',
      image: null
    },
    {
      id: 2,
      name: 'Precision Nutrition Level 1',
      issuer: 'Precision Nutrition',
      dateObtained: '2020-06-20',
      expiryDate: '2025-06-20',
      credentialId: 'PN1-2020-8901',
      status: 'active',
      image: null
    },
    {
      id: 3,
      name: 'USA Powerlifting Level 2',
      issuer: 'USA Powerlifting',
      dateObtained: '2019-09-10',
      expiryDate: '2024-09-10',
      credentialId: 'USAPL-L2-2019-1234',
      status: 'expiring',
      image: null
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Areas', icon: 'apps', color: COLORS.primary },
    { id: 'fitness', name: 'Fitness', icon: 'fitness-center', color: '#FF6B6B' },
    { id: 'cardio', name: 'Cardio', icon: 'favorite', color: '#4ECDC4' },
    { id: 'strength', name: 'Strength', icon: 'trending-up', color: '#FFA726' },
    { id: 'flexibility', name: 'Flexibility', icon: 'self-improvement', color: '#95E1D3' },
    { id: 'sports', name: 'Sports', icon: 'sports', color: '#A78BFA' },
    { id: 'nutrition', name: 'Nutrition', icon: 'restaurant', color: '#34D399' },
    { id: 'rehabilitation', name: 'Rehab', icon: 'healing', color: '#F472B6' }
  ];

  useEffect(() => {
    // Entrance animation
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

    // Pulse animation for completion progress
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    calculateCompletionPercentage();
    loadSpecializations();
  }, []);

  const calculateCompletionPercentage = useCallback(() => {
    const totalFields = 10;
    let completedFields = 0;
    
    if (specializations.length > 0) completedFields += 3;
    if (certifications.length > 0) completedFields += 3;
    if (trainerProfile?.bio) completedFields += 1;
    if (trainerProfile?.experience) completedFields += 1;
    if (trainerProfile?.specialties) completedFields += 2;
    
    const percentage = (completedFields / totalFields) * 100;
    setCompletionPercentage(Math.round(percentage));
  }, [specializations, certifications, trainerProfile]);

  const loadSpecializations = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to load specializations');
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSpecializations();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadSpecializations]);

  const handleAddSpecialization = useCallback(async () => {
    if (!newSpecialization.name.trim()) {
      Alert.alert('Error', 'Please enter a specialization name');
      return;
    }

    try {
      setLoading(true);
      Vibration.vibrate(50);

      const newSpec = {
        id: Date.now(),
        ...newSpecialization,
        level: 'beginner',
        clientsCount: 0,
        color: categories.find(cat => cat.id === newSpecialization.category)?.color || COLORS.primary,
        icon: categories.find(cat => cat.id === newSpecialization.category)?.icon || 'star'
      };

      setSpecializations(prev => [...prev, newSpec]);
      setNewSpecialization({ name: '', category: 'fitness', experienceYears: '', description: '' });
      setShowAddModal(false);
      setLoading(false);

      Alert.alert('✅ Success', 'Specialization added successfully!');
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to add specialization');
    }
  }, [newSpecialization, categories]);

  const handleAddCertification = useCallback(async () => {
    if (!newCertification.name.trim() || !newCertification.issuer.trim()) {
      Alert.alert('Error', 'Please enter certification name and issuer');
      return;
    }

    try {
      setLoading(true);
      Vibration.vibrate(50);

      const newCert = {
        id: Date.now(),
        ...newCertification,
        status: 'active'
      };

      setCertifications(prev => [...prev, newCert]);
      setNewCertification({
        name: '',
        issuer: '',
        dateObtained: '',
        expiryDate: '',
        credentialId: '',
        image: null
      });
      setCertModal(false);
      setLoading(false);

      Alert.alert('✅ Success', 'Certification added successfully!');
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to add certification');
    }
  }, [newCertification]);

  const handleDeleteSpecialization = useCallback((id) => {
    Alert.alert(
      'Delete Specialization',
      'Are you sure you want to remove this specialization?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSpecializations(prev => prev.filter(spec => spec.id !== id));
            Vibration.vibrate(50);
          }
        }
      ]
    );
  }, []);

  const filteredSpecializations = specializations.filter(spec => 
    selectedCategory === 'all' || spec.category === selectedCategory
  ).filter(spec =>
    spec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spec.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLevelColor = (level) => {
    switch (level) {
      case 'expert': return '#10B981';
      case 'advanced': return '#F59E0B';
      case 'intermediate': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'expert': return '⭐⭐⭐';
      case 'advanced': return '⭐⭐';
      case 'intermediate': return '⭐';
      default: return '🌱';
    }
  };

  const getCertificationStatus = (cert) => {
    const expiryDate = new Date(cert.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', color: '#EF4444', text: 'Expired' };
    if (daysUntilExpiry < 90) return { status: 'expiring', color: '#F59E0B', text: `${daysUntilExpiry} days left` };
    return { status: 'active', color: '#10B981', text: 'Active' };
  };

  const SpecializationCard = ({ item }) => {
    const statusInfo = getCertificationStatus(item);
    
    return (
      <Card style={[styles.specializationCard, { borderLeftColor: item.color }]} elevation={3}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Icon name={item.icon} size={24} color={item.color} />
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelEmoji}>{getLevelIcon(item.level)}</Text>
                <Text style={[styles.levelText, { color: getLevelColor(item.level) }]}>
                  {item.level}
                </Text>
              </View>
            </View>
            <IconButton
              icon="delete"
              iconColor={COLORS.error}
              size={20}
              onPress={() => handleDeleteSpecialization(item.id)}
            />
          </View>
          
          <Text style={styles.cardDescription}>{item.description}</Text>
          
          <View style={styles.cardStats}>
            <View style={styles.statItem}>
              <Icon name="schedule" size={16} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{item.experienceYears} years</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="group" size={16} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{item.clientsCount} clients</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const CertificationCard = ({ item }) => {
    const statusInfo = getCertificationStatus(item);
    
    return (
      <Card style={styles.certificationCard} elevation={2}>
        <Card.Content>
          <View style={styles.certHeader}>
            <View style={styles.certIconContainer}>
              <Icon name="verified" size={28} color={statusInfo.color} />
            </View>
            <View style={styles.certInfo}>
              <Text style={styles.certName}>{item.name}</Text>
              <Text style={styles.certIssuer}>{item.issuer}</Text>
              <Badge
                style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}
                size={20}
              >
                {statusInfo.text}
              </Badge>
            </View>
          </View>
          
          <View style={styles.certDetails}>
            <Text style={styles.certDetail}>
              <Text style={styles.certLabel}>Obtained:</Text> {new Date(item.dateObtained).toLocaleDateString()}
            </Text>
            <Text style={styles.certDetail}>
              <Text style={styles.certLabel}>Expires:</Text> {new Date(item.expiryDate).toLocaleDateString()}
            </Text>
            {item.credentialId && (
              <Text style={styles.certDetail}>
                <Text style={styles.certLabel}>ID:</Text> {item.credentialId}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={28}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Specializations 🎯</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        {/* Profile Completion */}
        <Animated.View 
          style={[
            styles.completionContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <View style={styles.completionHeader}>
            <Text style={styles.completionTitle}>Profile Completion</Text>
            <Text style={styles.completionPercentage}>{completionPercentage}%</Text>
          </View>
          <ProgressBar
            progress={completionPercentage / 100}
            color="white"
            style={styles.progressBar}
          />
          <Text style={styles.completionSubtitle}>
            {completionPercentage < 80 
              ? 'Add more specializations to boost your profile! 🚀'
              : 'Your profile looks amazing! 🌟'
            }
          </Text>
        </Animated.View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Search and Categories */}
        <Surface style={styles.searchContainer} elevation={2}>
          <Searchbar
            placeholder="Search specializations..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
            inputStyle={styles.searchInput}
          />
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => {
                  setSelectedCategory(category.id);
                  Vibration.vibrate(30);
                }}
              >
                <Chip
                  mode={selectedCategory === category.id ? 'flat' : 'outlined'}
                  selected={selectedCategory === category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id && { 
                      backgroundColor: category.color,
                      borderColor: category.color
                    }
                  ]}
                  textStyle={[
                    styles.chipText,
                    selectedCategory === category.id && { color: 'white' }
                  ]}
                  icon={({ size, color }) => (
                    <Icon 
                      name={category.icon} 
                      size={size} 
                      color={selectedCategory === category.id ? 'white' : color} 
                    />
                  )}
                >
                  {category.name}
                </Chip>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Surface>

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
          {/* Specializations Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Specializations 💪</Text>
              <Badge style={styles.countBadge} size={24}>
                {filteredSpecializations.length}
              </Badge>
            </View>
            
            {filteredSpecializations.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Icon name="search-off" size={64} color={COLORS.textSecondary} />
                  <Text style={styles.emptyTitle}>
                    {searchQuery ? 'No matching specializations' : 'No specializations yet'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Add your first specialization to get started!'
                    }
                  </Text>
                  {!searchQuery && (
                    <Button
                      mode="contained"
                      onPress={() => setShowAddModal(true)}
                      style={styles.emptyButton}
                      icon="add"
                    >
                      Add Specialization
                    </Button>
                  )}
                </Card.Content>
              </Card>
            ) : (
              <FlatList
                data={filteredSpecializations}
                renderItem={({ item }) => <SpecializationCard item={item} />}
                keyExtractor={item => item.id.toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {/* Certifications Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Certifications 🏆</Text>
              <Badge style={styles.countBadge} size={24}>
                {certifications.length}
              </Badge>
            </View>
            
            <FlatList
              data={certifications}
              renderItem={({ item }) => <CertificationCard item={item} />}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Floating Action Buttons */}
        <FAB.Group
          open={false}
          icon="add"
          actions={[
            {
              icon: 'school',
              label: 'Add Certification',
              onPress: () => setCertModal(true),
              color: COLORS.primary,
            },
            {
              icon: 'fitness-center',
              label: 'Add Specialization',
              onPress: () => setShowAddModal(true),
              color: COLORS.primary,
            },
          ]}
          onStateChange={() => {}}
          style={styles.fab}
          color="white"
          fabStyle={{ backgroundColor: COLORS.primary }}
        />
      </Animated.View>

      {/* Add Specialization Modal */}
      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={10}
            reducedTransparencyFallbackColor="rgba(0,0,0,0.5)"
          />
          <Card style={styles.modalCard}>
            <Card.Content>
              <Text style={styles.modalTitle}>✨ Add New Specialization</Text>
              
              <TextInput
                label="Specialization Name"
                value={newSpecialization.name}
                onChangeText={(text) => setNewSpecialization(prev => ({ ...prev, name: text }))}
                style={styles.input}
                mode="outlined"
                outlineColor={COLORS.primary}
                activeOutlineColor={COLORS.primary}
              />
              
              <View style={styles.inputRow}>
                <TextInput
                  label="Experience (Years)"
                  value={newSpecialization.experienceYears}
                  onChangeText={(text) => setNewSpecialization(prev => ({ ...prev, experienceYears: text }))}
                  style={[styles.input, styles.halfInput]}
                  mode="outlined"
                  keyboardType="numeric"
                  outlineColor={COLORS.primary}
                  activeOutlineColor={COLORS.primary}
                />
              </View>
              
              <TextInput
                label="Description"
                value={newSpecialization.description}
                onChangeText={(text) => setNewSpecialization(prev => ({ ...prev, description: text }))}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
                outlineColor={COLORS.primary}
                activeOutlineColor={COLORS.primary}
              />
              
              <Text style={styles.categoryLabel}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.modalCategoriesScroll}
              >
                {categories.filter(cat => cat.id !== 'all').map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setNewSpecialization(prev => ({ ...prev, category: category.id }))}
                  >
                    <Chip
                      mode={newSpecialization.category === category.id ? 'flat' : 'outlined'}
                      selected={newSpecialization.category === category.id}
                      style={[
                        styles.modalCategoryChip,
                        newSpecialization.category === category.id && { 
                          backgroundColor: category.color,
                          borderColor: category.color
                        }
                      ]}
                      textStyle={[
                        styles.chipText,
                        newSpecialization.category === category.id && { color: 'white' }
                      ]}
                      icon={({ size, color }) => (
                        <Icon 
                          name={category.icon} 
                          size={size} 
                          color={newSpecialization.category === category.id ? 'white' : color} 
                        />
                      )}
                    >
                      {category.name}
                    </Chip>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setShowAddModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddSpecialization}
                  loading={loading}
                  disabled={loading}
                  style={styles.modalButton}
                >
                  Add Specialization
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* Add Certification Modal */}
      <Portal>
        <Modal
          visible={showCertModal}
          onDismiss={() => setCertModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={10}
            reducedTransparencyFallbackColor="rgba(0,0,0,0.5)"
          />
          <Card style={styles.modalCard}>
            <Card.Content>
              <Text style={styles.modalTitle}>🏆 Add Certification</Text>
              
              <TextInput
                label="Certification Name"
                value={newCertification.name}
                onChangeText={(text) => setNewCertification(prev => ({ ...prev, name: text }))}
                style={styles.input}
                mode="outlined"
                outlineColor={COLORS.primary}
                activeOutlineColor={COLORS.primary}
              />
              
              <TextInput
                label="Issuing Organization"
                value={newCertification.issuer}
                onChangeText={(text) => setNewCertification(prev => ({ ...prev, issuer: text }))}
                style={styles.input}
                mode="outlined"
                outlineColor={COLORS.primary}
                activeOutlineColor={COLORS.primary}
              />
              
              <View style={styles.inputRow}>
                <TextInput
                  label="Date Obtained"
                  value={newCertification.dateObtained}
                  onChangeText={(text) => setNewCertification(prev => ({ ...prev, dateObtained: text }))}
                  style={[styles.input, styles.halfInput]}
                  mode="outlined"
                  placeholder="YYYY-MM-DD"
                  outlineColor={COLORS.primary}
                  activeOutlineColor={COLORS.primary}
                />
                <TextInput
                  label="Expiry Date"
                  value={newCertification.expiryDate}
                  onChangeText={(text) => setNewCertification(prev => ({ ...prev, expiryDate: text }))}
                  style={[styles.input, styles.halfInput]}
                  mode="outlined"
                  placeholder="YYYY-MM-DD"
                  outlineColor={COLORS.primary}
                  activeOutlineColor={COLORS.primary}
                />
              </View>
              
              <TextInput
                label="Credential ID (Optional)"
                value={newCertification.credentialId}
                onChangeText={(text) => setNewCertification(prev => ({ ...prev, credentialId: text }))}
                style={styles.input}
                mode="outlined"
                outlineColor={COLORS.primary}
                activeOutlineColor={COLORS.primary}
              />
              
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setCertModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddCertification}
                  loading={loading}
                  disabled={loading}
                  style={styles.modalButton}
                >
                  Add Certification
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  headerSpacer: {
    width: 28,
  },
  completionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  completionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  completionPercentage: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  completionSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  searchContainer: {
    margin: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'white',
    padding: SPACING.sm,
  },
  searchBar: {
    backgroundColor: 'rgba(103, 126, 234, 0.1)',
    borderRadius: 8,
    elevation: 0,
  },
  searchInput: {
    fontSize: 16,
  },
  categoriesScroll: {
    marginTop: SPACING.sm,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.xs,
  },
  categoryChip: {
    marginRight: SPACING.xs,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  countBadge: {
    backgroundColor: COLORS.primary,
  },
  specializationCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'white',
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: '600',
    marginLeft: SPACING.xs,
    flex: 1,
    color: COLORS.textPrimary,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 12,
  },
  levelEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  certificationCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  certHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  certIconContainer: {
    marginRight: SPACING.sm,
  },
  certInfo: {
    flex: 1,
  },
  certName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  certIssuer: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
  },
  certDetails: {
    paddingLeft: 36,
  },
  certDetail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  certLabel: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  emptyCard: {
    borderRadius: 12,
    backgroundColor: 'white',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    borderRadius: 20,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    backgroundColor: 'white',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: 'white',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  modalCategoriesScroll: {
    marginBottom: SPACING.lg,
  },
  modalCategoryChip: {
    marginRight: SPACING.xs,
    borderRadius: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
  },
  modalButton: {
    flex: 0.48,
  },
  bottomSpacing: {
    height: 100, 
  },
});

export default Specialization;