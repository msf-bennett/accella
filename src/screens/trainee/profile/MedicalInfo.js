import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Vibration,
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
  Portal,
  Modal,
  TextInput,
  Switch,
  ProgressBar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Design System
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  border: '#e1e8ed',
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

const MedicalInfo = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, medicalInfo, loading } = useSelector(state => state.trainee);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));
  
  // Medical info state
  const [medicalData, setMedicalData] = useState({
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: '',
    },
    allergies: [],
    medications: [],
    conditions: [],
    injuries: [],
    bloodType: '',
    height: '',
    weight: '',
    restingHeartRate: '',
    maxHeartRate: '',
    bodyFatPercentage: '',
    fitnessLevel: 'beginner',
    exerciseRestrictions: [],
    doctorClearance: false,
    lastPhysical: '',
    insuranceProvider: '',
    policyNumber: '',
  });

  // Form states for modals
  const [newItem, setNewItem] = useState({
    type: '',
    name: '',
    details: '',
    severity: 'low',
    date: '',
  });

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setTranslucent(true);
    
    // Animate screen entrance
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
    
    loadMedicalInfo();
  }, []);

  const loadMedicalInfo = useCallback(async () => {
    try {
      // Load medical info from Redux/API
      // This would integrate with your actual data source
      setMedicalData(medicalInfo || medicalData);
    } catch (error) {
      console.error('Error loading medical info:', error);
    }
  }, [medicalInfo]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    await loadMedicalInfo();
    setRefreshing(false);
  }, [loadMedicalInfo]);

  const handleAddItem = useCallback((type) => {
    setNewItem({ ...newItem, type });
    setShowAddModal(true);
    Vibration.vibrate(50);
  }, [newItem]);

  const saveNewItem = useCallback(() => {
    if (!newItem.name.trim()) {
      Alert.alert('Error', 'Please enter a name for this item');
      return;
    }

    const itemData = {
      id: Date.now().toString(),
      name: newItem.name,
      details: newItem.details,
      severity: newItem.severity,
      date: newItem.date || new Date().toISOString().split('T')[0],
    };

    setMedicalData(prev => ({
      ...prev,
      [newItem.type]: [...prev[newItem.type], itemData],
    }));

    setShowAddModal(false);
    setNewItem({ type: '', name: '', details: '', severity: 'low', date: '' });
    Vibration.vibrate(100);
  }, [newItem]);

  const removeItem = useCallback((type, itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setMedicalData(prev => ({
              ...prev,
              [type]: prev[type].filter(item => item.id !== itemId),
            }));
            Vibration.vibrate(50);
          },
        },
      ]
    );
  }, []);

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Medical Information 🏥</Text>
          <Text style={styles.headerSubtitle}>Keep your health data updated</Text>
        </View>
        
        <TouchableOpacity
          onPress={() => setShowEmergencyModal(true)}
          style={styles.emergencyButton}
        >
          <Icon name="local-hospital" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderVitalStats = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="favorite" size={20} color={COLORS.error} />
          <Text style={styles.sectionTitle}>Vital Statistics</Text>
        </View>
        
        <View style={styles.vitalsGrid}>
          <Surface style={styles.vitalItem}>
            <Text style={styles.vitalValue}>{medicalData.height || '--'}</Text>
            <Text style={styles.vitalLabel}>Height (cm)</Text>
          </Surface>
          
          <Surface style={styles.vitalItem}>
            <Text style={styles.vitalValue}>{medicalData.weight || '--'}</Text>
            <Text style={styles.vitalLabel}>Weight (kg)</Text>
          </Surface>
          
          <Surface style={styles.vitalItem}>
            <Text style={styles.vitalValue}>{medicalData.restingHeartRate || '--'}</Text>
            <Text style={styles.vitalLabel}>Resting HR</Text>
          </Surface>
          
          <Surface style={styles.vitalItem}>
            <Text style={styles.vitalValue}>{medicalData.bloodType || '--'}</Text>
            <Text style={styles.vitalLabel}>Blood Type</Text>
          </Surface>
        </View>
        
        <Button
          mode="outlined"
          onPress={() => handleEditVitals()}
          style={styles.editButton}
          icon="edit"
        >
          Update Vitals
        </Button>
      </Card.Content>
    </Card>
  );

  const renderMedicalSection = (title, icon, type, items, color = COLORS.primary) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name={icon} size={20} color={color} />
          <Text style={styles.sectionTitle}>{title}</Text>
          <IconButton
            icon="add"
            size={20}
            onPress={() => handleAddItem(type)}
          />
        </View>
        
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="info-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No {title.toLowerCase()} recorded</Text>
            <Button
              mode="contained"
              onPress={() => handleAddItem(type)}
              style={[styles.addButton, { backgroundColor: color }]}
            >
              Add {title.slice(0, -1)}
            </Button>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.itemsContainer}>
              {items.map((item, index) => (
                <Chip
                  key={item.id || index}
                  mode="flat"
                  onClose={() => removeItem(type, item.id)}
                  style={[
                    styles.medicalChip,
                    { backgroundColor: `${color}15` }
                  ]}
                  textStyle={{ color: color }}
                >
                  {item.name}
                </Chip>
              ))}
            </View>
          </ScrollView>
        )}
      </Card.Content>
    </Card>
  );

  const renderFitnessLevel = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="trending-up" size={20} color={COLORS.success} />
          <Text style={styles.sectionTitle}>Fitness Level</Text>
        </View>
        
        <View style={styles.fitnessLevelContainer}>
          {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => setMedicalData(prev => ({ ...prev, fitnessLevel: level }))}
              style={[
                styles.fitnessLevel,
                medicalData.fitnessLevel === level && styles.activeFitnessLevel
              ]}
            >
              <Text style={[
                styles.fitnessLevelText,
                medicalData.fitnessLevel === level && styles.activeFitnessLevelText
              ]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <ProgressBar
          progress={
            medicalData.fitnessLevel === 'beginner' ? 0.25 :
            medicalData.fitnessLevel === 'intermediate' ? 0.5 :
            medicalData.fitnessLevel === 'advanced' ? 0.75 : 1
          }
          color={COLORS.success}
          style={styles.progressBar}
        />
      </Card.Content>
    </Card>
  );

  const renderEmergencyContact = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="contact-phone" size={20} color={COLORS.error} />
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <IconButton
            icon="edit"
            size={20}
            onPress={() => setShowEmergencyModal(true)}
          />
        </View>
        
        {medicalData.emergencyContact.name ? (
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{medicalData.emergencyContact.name}</Text>
            <Text style={styles.contactDetail}>{medicalData.emergencyContact.relationship}</Text>
            <Text style={styles.contactDetail}>{medicalData.emergencyContact.phone}</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="contact-phone" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No emergency contact set</Text>
            <Button
              mode="contained"
              onPress={() => setShowEmergencyModal(true)}
              style={[styles.addButton, { backgroundColor: COLORS.error }]}
            >
              Add Emergency Contact
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderAddItemModal = () => (
    <Portal>
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Card style={styles.modalCard}>
            <Card.Title
              title={`Add ${newItem.type}`}
              left={(props) => <Avatar.Icon {...props} icon="add" />}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="close"
                  onPress={() => setShowAddModal(false)}
                />
              )}
            />
            <Card.Content>
              <TextInput
                label="Name"
                value={newItem.name}
                onChangeText={(text) => setNewItem(prev => ({ ...prev, name: text }))}
                style={styles.modalInput}
                mode="outlined"
              />
              
              <TextInput
                label="Details (Optional)"
                value={newItem.details}
                onChangeText={(text) => setNewItem(prev => ({ ...prev, details: text }))}
                style={styles.modalInput}
                mode="outlined"
                multiline
              />
              
              <View style={styles.severityContainer}>
                <Text style={styles.modalLabel}>Severity:</Text>
                {['low', 'medium', 'high'].map((severity) => (
                  <Chip
                    key={severity}
                    selected={newItem.severity === severity}
                    onPress={() => setNewItem(prev => ({ ...prev, severity }))}
                    style={styles.severityChip}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </Chip>
                ))}
              </View>
            </Card.Content>
            
            <Card.Actions>
              <Button onPress={() => setShowAddModal(false)}>Cancel</Button>
              <Button mode="contained" onPress={saveNewItem}>
                Add Item
              </Button>
            </Card.Actions>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  const handleEditVitals = () => {
    Alert.alert(
      'Feature Development',
      'Vital statistics editing is currently under development. This feature will be available in the next update! 🚧',
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <Animated.View 
        style={[
          styles.animatedContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {renderHeader()}
        
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
          {renderVitalStats()}
          {renderFitnessLevel()}
          {renderEmergencyContact()}
          
          {renderMedicalSection(
            'Allergies',
            'warning',
            'allergies',
            medicalData.allergies,
            COLORS.warning
          )}
          
          {renderMedicalSection(
            'Medications',
            'local-pharmacy',
            'medications',
            medicalData.medications,
            COLORS.success
          )}
          
          {renderMedicalSection(
            'Medical Conditions',
            'healing',
            'conditions',
            medicalData.conditions,
            COLORS.error
          )}
          
          {renderMedicalSection(
            'Previous Injuries',
            'personal-injury',
            'injuries',
            medicalData.injuries,
            COLORS.secondary
          )}
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
        
        {renderAddItemModal()}
      </Animated.View>
      
      <FAB
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        small={false}
        icon="add"
        onPress={() => {
          Alert.alert(
            'Add Medical Info',
            'What would you like to add?',
            [
              { text: 'Allergy', onPress: () => handleAddItem('allergies') },
              { text: 'Medication', onPress: () => handleAddItem('medications') },
              { text: 'Condition', onPress: () => handleAddItem('conditions') },
              { text: 'Injury', onPress: () => handleAddItem('injuries') },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  animatedContainer: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  emergencyButton: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  card: {
    marginVertical: SPACING.sm,
    elevation: 4,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  vitalItem: {
    width: '48%',
    padding: SPACING.md,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  vitalValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
  },
  vitalLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  editButton: {
    marginTop: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    marginVertical: SPACING.md,
    textAlign: 'center',
  },
  addButton: {
    marginTop: SPACING.sm,
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  medicalChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  fitnessLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  fitnessLevel: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: COLORS.border,
  },
  activeFitnessLevel: {
    backgroundColor: COLORS.success,
  },
  fitnessLevelText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  activeFitnessLevelText: {
    color: 'white',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  contactInfo: {
    paddingVertical: SPACING.sm,
  },
  contactName: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.xs,
  },
  contactDetail: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
  },
  modalCard: {
    marginHorizontal: SPACING.md,
    borderRadius: 12,
  },
  modalInput: {
    marginBottom: SPACING.md,
  },
  modalLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  severityContainer: {
    marginVertical: SPACING.md,
  },
  severityChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default MedicalInfo;