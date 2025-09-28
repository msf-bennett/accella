import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  Vibration,
  Animated,
  Platform,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { 
  Card,
  Button,
  Text,
  Surface,
  Portal,
  Modal,
  ProgressBar,
  Chip,
  IconButton,
  Avatar,
  FAB,
  TextInput,
  Divider,
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Constants
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
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: '600' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14 },
  small: { fontSize: 12 },
};

const { width: screenWidth } = Dimensions.get('window');

const CREDENTIAL_TYPES = [
  'Certification',
  'Degree',
  'License',
  'Award',
  'Workshop',
  'Course',
  'Seminar',
];

const SPORTS_CATEGORIES = [
  'Football', 'Basketball', 'Soccer', 'Tennis', 'Swimming',
  'Track & Field', 'Baseball', 'Volleyball', 'Gymnastics',
  'Martial Arts', 'Fitness', 'Strength Training', 'Yoga',
  'CrossFit', 'Boxing', 'Wrestling', 'Golf', 'Other',
];

const Credentials = ({ navigation }) => {
  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const isLoading = useSelector(state => state.ui.isLoading);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date'); // date, name, type

  const [newCredential, setNewCredential] = useState({
    title: '',
    organization: '',
    type: 'Certification',
    category: 'Fitness',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    description: '',
    image: null,
    verified: false,
  });

  const [credentials, setCredentials] = useState([
    {
      id: 1,
      title: 'Certified Strength & Conditioning Specialist',
      organization: 'NSCA',
      type: 'Certification',
      category: 'Strength Training',
      issueDate: '2023-01-15',
      expiryDate: '2026-01-15',
      credentialId: 'CSCS-2023-001234',
      description: 'Advanced certification in strength and conditioning for athletes',
      image: null,
      verified: true,
      points: 50,
    },
    {
      id: 2,
      title: 'Master of Sports Science',
      organization: 'University of Sports Excellence',
      type: 'Degree',
      category: 'Sports Science',
      issueDate: '2022-05-20',
      expiryDate: null,
      credentialId: null,
      description: 'Advanced degree focusing on exercise physiology and performance optimization',
      image: null,
      verified: true,
      points: 100,
    },
    {
      id: 3,
      title: 'Youth Football Coaching License',
      organization: 'National Football Association',
      type: 'License',
      category: 'Football',
      issueDate: '2023-06-10',
      expiryDate: '2025-06-10',
      credentialId: 'YFL-2023-5678',
      description: 'Specialized license for coaching youth football teams',
      image: null,
      verified: false,
      points: 30,
    },
    {
      id: 4,
      title: 'CPR & First Aid Certified',
      organization: 'Red Cross',
      type: 'Certification',
      category: 'Safety',
      issueDate: '2023-08-01',
      expiryDate: '2025-08-01',
      credentialId: 'CPR-FA-2023-9012',
      description: 'Emergency response certification for sports environments',
      image: null,
      verified: true,
      points: 20,
    },
  ]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Entrance animations
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    try {
      // Simulate API call to refresh credentials
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchCoachCredentials());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh credentials');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleAddCredential = useCallback(async () => {
    if (!newCredential.title || !newCredential.organization) {
      Alert.alert('Missing Information', 'Please fill in the required fields');
      return;
    }

    try {
      const credential = {
        ...newCredential,
        id: Date.now(),
        verified: false,
        points: getCredentialPoints(newCredential.type),
      };

      setCredentials(prev => [credential, ...prev]);
      setAddModalVisible(false);
      setNewCredential({
        title: '',
        organization: '',
        type: 'Certification',
        category: 'Fitness',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        description: '',
        image: null,
        verified: false,
      });

      Vibration.vibrate(100);
      Alert.alert('Success! 🎉', 'Credential added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add credential');
    }
  }, [newCredential]);

  const handleEditCredential = useCallback((credential) => {
    setSelectedCredential(credential);
    setNewCredential(credential);
    setEditModalVisible(true);
    Vibration.vibrate(50);
  }, []);

  const handleUpdateCredential = useCallback(async () => {
    try {
      setCredentials(prev => prev.map(cred => 
        cred.id === selectedCredential.id ? { ...newCredential, points: cred.points } : cred
      ));
      
      setEditModalVisible(false);
      setSelectedCredential(null);
      setNewCredential({
        title: '',
        organization: '',
        type: 'Certification',
        category: 'Fitness',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        description: '',
        image: null,
        verified: false,
      });

      Vibration.vibrate(100);
      Alert.alert('Success! 🎉', 'Credential updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update credential');
    }
  }, [selectedCredential, newCredential]);

  const handleDeleteCredential = useCallback((credentialId) => {
    Alert.alert(
      'Delete Credential',
      'Are you sure you want to delete this credential?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCredentials(prev => prev.filter(cred => cred.id !== credentialId));
            Vibration.vibrate(50);
            Alert.alert('Deleted! 🗑️', 'Credential removed successfully');
          },
        },
      ]
    );
  }, []);

  const handleVerifyCredential = useCallback((credentialId) => {
    Alert.alert(
      'Verify Credential',
      'Submit this credential for verification? Our team will review and verify your credential within 2-3 business days.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit for Verification',
          onPress: () => {
            // In real app, this would send to verification service
            Alert.alert('Submitted! 📋', 'Your credential has been submitted for verification');
            Vibration.vibrate(100);
          },
        },
      ]
    );
  }, []);

  const getCredentialPoints = (type) => {
    const pointsMap = {
      'Degree': 100,
      'Certification': 50,
      'License': 30,
      'Award': 40,
      'Workshop': 15,
      'Course': 20,
      'Seminar': 10,
    };
    return pointsMap[type] || 20;
  };

  const getCredentialIcon = (type) => {
    const iconMap = {
      'Degree': 'school',
      'Certification': 'verified',
      'License': 'assignment',
      'Award': 'jump-rope',
      'Workshop': 'groups',
      'Course': 'menu-book',
      'Seminar': 'event',
    };
    return iconMap[type] || 'card-membership';
  };

  const getTypeColor = (type) => {
    const colorMap = {
      'Degree': '#9c27b0',
      'Certification': COLORS.primary,
      'License': COLORS.success,
      'Award': '#ff9800',
      'Workshop': '#2196f3',
      'Course': '#795548',
      'Seminar': '#607d8b',
    };
    return colorMap[type] || COLORS.textSecondary;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    return expiry <= sixMonthsFromNow;
  };

  const filteredCredentials = credentials
    .filter(cred => {
      const matchesSearch = cred.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cred.organization.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || cred.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'date':
        default:
          return new Date(b.issueDate) - new Date(a.issueDate);
      }
    });

  const totalCredentialPoints = credentials.reduce((sum, cred) => sum + (cred.verified ? cred.points : 0), 0);
  const verificationRate = Math.round((credentials.filter(cred => cred.verified).length / credentials.length) * 100);

  const renderHeader = () => (
    <Surface style={styles.header} elevation={2}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <MaterialIcons name="workspace-premium" size={40} color="white" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[TEXT_STYLES.h2, { color: 'white', marginBottom: SPACING.xs }]}>
              My Credentials 🏆
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
              Showcase your expertise & qualifications
            </Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h3, { color: 'white', fontWeight: 'bold' }]}>
              {credentials.length}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Total Credentials
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h3, { color: 'white', fontWeight: 'bold' }]}>
              {totalCredentialPoints}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Credential Points
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h3, { color: 'white', fontWeight: 'bold' }]}>
              {verificationRate}%
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Verified
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Surface>
  );

  const renderFilters = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Searchbar
          placeholder="Search credentials..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
          placeholderTextColor={COLORS.textSecondary}
        />
        
        <View style={styles.filtersRow}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterCategory === 'All' && styles.activeFilterChip
              ]}
              onPress={() => setFilterCategory('All')}
            >
              <Text style={[
                styles.filterText,
                filterCategory === 'All' && styles.activeFilterText
              ]}>
                All
              </Text>
            </TouchableOpacity>
            
            {SPORTS_CATEGORIES.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  filterCategory === category && styles.activeFilterChip
                ]}
                onPress={() => setFilterCategory(category)}
              >
                <Text style={[
                  styles.filterText,
                  filterCategory === category && styles.activeFilterText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCredentialCard = (credential) => (
    <Card key={credential.id} style={styles.credentialCard}>
      <Card.Content>
        <View style={styles.credentialHeader}>
          <View style={styles.credentialIcon}>
            <MaterialIcons
              name={getCredentialIcon(credential.type)}
              size={24}
              color={getTypeColor(credential.type)}
            />
          </View>
          
          <View style={styles.credentialInfo}>
            <Text style={[TEXT_STYLES.body, { color: COLORS.text, fontWeight: '600' }]}>
              {credential.title}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              {credential.organization}
            </Text>
          </View>
          
          <View style={styles.credentialActions}>
            {credential.verified && (
              <Chip
                icon="verified"
                style={[styles.verifiedChip, { backgroundColor: `${COLORS.success}20` }]}
                textStyle={{ color: COLORS.success, fontSize: 10 }}
                compact
              >
                Verified
              </Chip>
            )}
            <IconButton
              icon="dots-vertical"
              iconColor={COLORS.textSecondary}
              size={20}
              onPress={() => {
                Alert.alert(
                  'Credential Options',
                  'Choose an action:',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Edit', onPress: () => handleEditCredential(credential) },
                    !credential.verified && {
                      text: 'Submit for Verification',
                      onPress: () => handleVerifyCredential(credential.id)
                    },
                    { text: 'Delete', style: 'destructive', onPress: () => handleDeleteCredential(credential.id) },
                  ].filter(Boolean)
                );
              }}
            />
          </View>
        </View>
        
        <View style={styles.credentialDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="category" size={16} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: SPACING.xs }]}>
              {credential.type} • {credential.category}
            </Text>
          </View>
          
          {credential.credentialId && (
            <View style={styles.detailRow}>
              <MaterialIcons name="confirmation-number" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: SPACING.xs }]}>
                ID: {credential.credentialId}
              </Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <MaterialIcons name="event" size={16} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: SPACING.xs }]}>
              Issued: {formatDate(credential.issueDate)}
              {credential.expiryDate && ` • Expires: ${formatDate(credential.expiryDate)}`}
            </Text>
          </View>
          
          {credential.expiryDate && isExpiringSoon(credential.expiryDate) && (
            <Chip
              icon="warning"
              style={[styles.warningChip, { backgroundColor: `${COLORS.warning}20` }]}
              textStyle={{ color: COLORS.warning, fontSize: 10 }}
              compact
            >
              Expires Soon
            </Chip>
          )}
        </View>
        
        {credential.description && (
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: SPACING.sm }]}>
            {credential.description}
          </Text>
        )}
        
        {credential.verified && (
          <View style={styles.pointsBadge}>
            <MaterialIcons name="stars" size={16} color={COLORS.warning} />
            <Text style={[TEXT_STYLES.caption, { color: COLORS.warning, marginLeft: SPACING.xs }]}>
              +{credential.points} Points
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderAddModal = () => (
    <Portal>
      <Modal
        visible={addModalVisible || editModalVisible}
        onDismiss={() => {
          setAddModalVisible(false);
          setEditModalVisible(false);
          setSelectedCredential(null);
          setNewCredential({
            title: '',
            organization: '',
            type: 'Certification',
            category: 'Fitness',
            issueDate: '',
            expiryDate: '',
            credentialId: '',
            description: '',
            image: null,
            verified: false,
          });
        }}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={styles.blurView}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        >
          <Card style={styles.modalCard}>
            <Card.Content>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.text, marginBottom: SPACING.lg }]}>
                {editModalVisible ? 'Edit Credential 📝' : 'Add New Credential 🆕'}
              </Text>
              
              <ScrollView style={styles.formContainer}>
                <TextInput
                  label="Credential Title *"
                  value={newCredential.title}
                  onChangeText={(text) => setNewCredential(prev => ({ ...prev, title: text }))}
                  style={styles.input}
                  mode="outlined"
                  activeOutlineColor={COLORS.primary}
                />
                
                <TextInput
                  label="Issuing Organization *"
                  value={newCredential.organization}
                  onChangeText={(text) => setNewCredential(prev => ({ ...prev, organization: text }))}
                  style={styles.input}
                  mode="outlined"
                  activeOutlineColor={COLORS.primary}
                />
                
                <View style={styles.dropdownRow}>
                  <View style={styles.dropdownContainer}>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Type</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {CREDENTIAL_TYPES.map(type => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.typeChip,
                            newCredential.type === type && styles.selectedTypeChip
                          ]}
                          onPress={() => setNewCredential(prev => ({ ...prev, type }))}
                        >
                          <Text style={[
                            styles.typeText,
                            newCredential.type === type && styles.selectedTypeText
                          ]}>
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
                
                <TextInput
                  label="Category"
                  value={newCredential.category}
                  onChangeText={(text) => setNewCredential(prev => ({ ...prev, category: text }))}
                  style={styles.input}
                  mode="outlined"
                  activeOutlineColor={COLORS.primary}
                />
                
                <TextInput
                  label="Issue Date (YYYY-MM-DD)"
                  value={newCredential.issueDate}
                  onChangeText={(text) => setNewCredential(prev => ({ ...prev, issueDate: text }))}
                  style={styles.input}
                  mode="outlined"
                  activeOutlineColor={COLORS.primary}
                  placeholder="2023-01-15"
                />
                
                <TextInput
                  label="Expiry Date (Optional)"
                  value={newCredential.expiryDate}
                  onChangeText={(text) => setNewCredential(prev => ({ ...prev, expiryDate: text }))}
                  style={styles.input}
                  mode="outlined"
                  activeOutlineColor={COLORS.primary}
                  placeholder="2026-01-15"
                />
                
                <TextInput
                  label="Credential ID (Optional)"
                  value={newCredential.credentialId}
                  onChangeText={(text) => setNewCredential(prev => ({ ...prev, credentialId: text }))}
                  style={styles.input}
                  mode="outlined"
                  activeOutlineColor={COLORS.primary}
                />
                
                <TextInput
                  label="Description"
                  value={newCredential.description}
                  onChangeText={(text) => setNewCredential(prev => ({ ...prev, description: text }))}
                  style={styles.input}
                  mode="outlined"
                  activeOutlineColor={COLORS.primary}
                  multiline
                  numberOfLines={3}
                />
              </ScrollView>
              
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setAddModalVisible(false);
                    setEditModalVisible(false);
                    setSelectedCredential(null);
                  }}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={editModalVisible ? handleUpdateCredential : handleAddCredential}
                  style={styles.modalButton}
                  buttonColor={COLORS.primary}
                  icon={editModalVisible ? "check" : "plus"}
                >
                  {editModalVisible ? 'Update' : 'Add Credential'}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
              title="Updating credentials..."
              titleColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          {renderFilters()}
          
          <View style={styles.credentialsContainer}>
            {filteredCredentials.length > 0 ? (
              filteredCredentials.map(renderCredentialCard)
            ) : (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <MaterialIcons name="workspace-premium" size={60} color={COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
                    No credentials found
                  </Text>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm }]}>
                    {searchQuery || filterCategory !== 'All' 
                      ? 'Try adjusting your search or filters'
                      : 'Add your first credential to showcase your expertise'}
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>
        </ScrollView>
      </Animated.View>
      
      <FAB
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        icon="plus"
        onPress={() => {
          setAddModalVisible(true);
          Vibration.vibrate(50);
        }}
        label="Add Credential"
      />
      
      {renderAddModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl * 3,
  },
  header: {
    marginBottom: SPACING.md,
  },
  gradientHeader: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + SPACING.lg : SPACING.xl * 2,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerIcon: {
    marginRight: SPACING.md,
  },
  headerInfo: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  card: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchbar: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterScroll: {
    flexGrow: 1,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  activeFilterText: {
    color: 'white',
    fontWeight: '600',
  },
  credentialsContainer: {
    paddingHorizontal: SPACING.md,
  },
  credentialCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  credentialHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  credentialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  credentialInfo: {
    flex: 1,
  },
  credentialActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedChip: {
    marginRight: SPACING.xs,
    height: 24,
  },
  credentialDetails: {
    marginLeft: 40 + SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  warningChip: {
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
    height: 24,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: `${COLORS.warning}15`,
    borderRadius: 12,
  },
  emptyCard: {
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    maxHeight: '90%',
  },
  formContainer: {
    maxHeight: 400,
    marginBottom: SPACING.lg,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  dropdownRow: {
    marginBottom: SPACING.md,
  },
  dropdownContainer: {
    flex: 1,
  },
  typeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    marginTop: SPACING.xs,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedTypeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  selectedTypeText: {
    color: 'white',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    elevation: 8,
  },
});

export default Credentials;