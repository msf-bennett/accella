import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Vibration,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
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
  Portal,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const SupplementTracker = ({ navigation }) => {
  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const supplements = useSelector(state => state.supplements.supplements || []);
  const dailyIntake = useSelector(state => state.supplements.dailyIntake || []);
  const streak = useSelector(state => state.supplements.streak || 0);

  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSupplementModal, setShowSupplementModal] = useState(false);
  const [selectedSupplement, setSelectedSupplement] = useState(null);
  const [newSupplement, setNewSupplement] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    time: 'morning',
    notes: '',
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const streakAnim = useRef(new Animated.Value(1)).current;

  // Sample data for demonstration
  const [localSupplements] = useState([
    {
      id: 1,
      name: 'Protein Powder',
      dosage: '30g',
      frequency: 'daily',
      time: 'post-workout',
      taken: true,
      category: 'protein',
      color: '#4CAF50',
      icon: 'fitness-center',
      notes: 'Post-workout recovery'
    },
    {
      id: 2,
      name: 'Creatine',
      dosage: '5g',
      frequency: 'daily',
      time: 'anytime',
      taken: false,
      category: 'performance',
      color: '#FF9800',
      icon: 'bolt',
      notes: 'Strength and power'
    },
    {
      id: 3,
      name: 'Multivitamin',
      dosage: '1 tablet',
      frequency: 'daily',
      time: 'morning',
      taken: true,
      category: 'health',
      color: '#2196F3',
      icon: 'local-pharmacy',
      notes: 'General health support'
    },
    {
      id: 4,
      name: 'Fish Oil',
      dosage: '1000mg',
      frequency: 'daily',
      time: 'with-meal',
      taken: false,
      category: 'health',
      color: '#009688',
      icon: 'waves',
      notes: 'Omega-3 fatty acids'
    },
  ]);

  // Calculate completion percentage
  const completionPercentage = localSupplements.length > 0 
    ? (localSupplements.filter(s => s.taken).length / localSupplements.length) * 100 
    : 0;

  const takenCount = localSupplements.filter(s => s.taken).length;
  const totalCount = localSupplements.length;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Streak animation when it changes
    if (streak > 0) {
      Animated.sequence([
        Animated.timing(streakAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(streakAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fadeAnim, slideAnim, streak]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchSupplements());
    } catch (error) {
      console.error('Error refreshing supplements:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const toggleSupplement = useCallback((supplementId) => {
    Vibration.vibrate(50);
    // Toggle logic would go here
    Alert.alert(
      '🎉 Great Job!',
      'Supplement tracking updated successfully!',
      [{ text: 'OK', onPress: () => {} }]
    );
  }, []);

  const addSupplement = useCallback(() => {
    if (!newSupplement.name.trim()) {
      Alert.alert('❌ Error', 'Please enter a supplement name');
      return;
    }
    
    // Add supplement logic would go here
    setShowAddModal(false);
    setNewSupplement({
      name: '',
      dosage: '',
      frequency: 'daily',
      time: 'morning',
      notes: '',
    });
    
    Alert.alert(
      '✅ Success',
      'New supplement added to your tracker!',
      [{ text: 'OK', onPress: () => {} }]
    );
  }, [newSupplement]);

  const openSupplementDetail = (supplement) => {
    setSelectedSupplement(supplement);
    setShowSupplementModal(true);
  };

  const filteredSupplements = localSupplements.filter(supplement =>
    supplement.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSupplementCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 50],
              outputRange: [0, index * 10],
            }),
          },
        ],
      }}
    >
      <Card
        style={{
          marginHorizontal: SPACING.md,
          marginBottom: SPACING.md,
          elevation: item.taken ? 2 : 4,
          opacity: item.taken ? 0.8 : 1,
        }}
        onPress={() => openSupplementDetail(item)}
      >
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Surface
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: item.color,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <Icon name={item.icon} size={24} color="white" />
              </Surface>
              
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: 4 }]}>
                  {item.name}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  {item.dosage} • {item.frequency} • {item.time.replace('-', ' ')}
                </Text>
                <Chip
                  mode="outlined"
                  compact
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: 4,
                    height: 24,
                  }}
                  textStyle={{ fontSize: 10 }}
                >
                  {item.category}
                </Chip>
              </View>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => toggleSupplement(item.id)}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: item.taken ? COLORS.success : COLORS.background,
                  borderWidth: 2,
                  borderColor: item.taken ? COLORS.success : COLORS.border,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Icon
                  name={item.taken ? 'check-circle' : 'radio-button-unchecked'}
                  size={30}
                  color={item.taken ? 'white' : COLORS.textSecondary}
                />
              </TouchableOpacity>
              
              {item.taken && (
                <Text style={[TEXT_STYLES.caption, { color: COLORS.success, marginTop: 4 }]}>
                  ✅ Taken
                </Text>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderStatsCard = () => (
    <Card style={{ margin: SPACING.md, elevation: 6 }}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ borderRadius: 8 }}
      >
        <Card.Content style={{ padding: SPACING.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
              Today's Progress
            </Text>
            <Animated.View style={{ transform: [{ scale: streakAnim }] }}>
              <Badge
                size={24}
                style={{ backgroundColor: COLORS.success }}
              >
                {streak} 🔥
              </Badge>
            </Animated.View>
          </View>
          
          <Text style={[TEXT_STYLES.h1, { color: 'white', marginBottom: SPACING.sm }]}>
            {takenCount}/{totalCount} Complete
          </Text>
          
          <ProgressBar
            progress={completionPercentage / 100}
            color="white"
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255,255,255,0.3)',
              marginBottom: SPACING.md,
            }}
          />
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                {Math.round(completionPercentage)}%
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Completion
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                {streak}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Day Streak
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                {localSupplements.length}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Supplements
              </Text>
            </View>
          </View>
        </Card.Content>
      </LinearGradient>
    </Card>
  );

  const renderAddModal = () => (
    <Portal>
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.lg,
          borderRadius: 12,
          padding: SPACING.lg,
          maxHeight: '80%',
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
            <Text style={TEXT_STYLES.h2}>Add New Supplement</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowAddModal(false)}
            />
          </View>
          
          <TextInput
            placeholder="Supplement Name"
            value={newSupplement.name}
            onChangeText={(text) => setNewSupplement({...newSupplement, name: text})}
            style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 8,
              padding: SPACING.md,
              marginBottom: SPACING.md,
              fontSize: 16,
            }}
          />
          
          <TextInput
            placeholder="Dosage (e.g., 5g, 1 tablet)"
            value={newSupplement.dosage}
            onChangeText={(text) => setNewSupplement({...newSupplement, dosage: text})}
            style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 8,
              padding: SPACING.md,
              marginBottom: SPACING.md,
              fontSize: 16,
            }}
          />
          
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Frequency:</Text>
          <View style={{ flexDirection: 'row', marginBottom: SPACING.md }}>
            {['daily', 'weekly', 'as-needed'].map((freq) => (
              <Chip
                key={freq}
                selected={newSupplement.frequency === freq}
                onPress={() => setNewSupplement({...newSupplement, frequency: freq})}
                style={{ marginRight: SPACING.sm }}
              >
                {freq.replace('-', ' ')}
              </Chip>
            ))}
          </View>
          
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Best Time:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md }}>
            {['morning', 'afternoon', 'evening', 'post-workout', 'with-meal'].map((time) => (
              <Chip
                key={time}
                selected={newSupplement.time === time}
                onPress={() => setNewSupplement({...newSupplement, time: time})}
                style={{ marginRight: SPACING.sm, marginBottom: SPACING.sm }}
              >
                {time.replace('-', ' ')}
              </Chip>
            ))}
          </View>
          
          <TextInput
            placeholder="Notes (optional)"
            value={newSupplement.notes}
            onChangeText={(text) => setNewSupplement({...newSupplement, notes: text})}
            multiline
            numberOfLines={3}
            style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 8,
              padding: SPACING.md,
              marginBottom: SPACING.lg,
              fontSize: 16,
              textAlignVertical: 'top',
            }}
          />
          
          <Button
            mode="contained"
            onPress={addSupplement}
            style={{ backgroundColor: COLORS.primary }}
            contentStyle={{ paddingVertical: SPACING.sm }}
          >
            Add Supplement
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderSupplementDetailModal = () => (
    <Portal>
      <Modal
        visible={showSupplementModal}
        onDismiss={() => setShowSupplementModal(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.lg,
          borderRadius: 12,
          padding: SPACING.lg,
        }}
      >
        {selectedSupplement && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
              <Text style={TEXT_STYLES.h2}>{selectedSupplement.name}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowSupplementModal(false)}
              />
            </View>
            
            <Surface
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: selectedSupplement.color,
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                marginBottom: SPACING.lg,
              }}
            >
              <Icon name={selectedSupplement.icon} size={40} color="white" />
            </Surface>
            
            <View style={{ marginBottom: SPACING.md }}>
              <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>Dosage:</Text>
              <Text style={TEXT_STYLES.body}>{selectedSupplement.dosage}</Text>
            </View>
            
            <View style={{ marginBottom: SPACING.md }}>
              <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>Frequency:</Text>
              <Text style={TEXT_STYLES.body}>{selectedSupplement.frequency}</Text>
            </View>
            
            <View style={{ marginBottom: SPACING.md }}>
              <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>Best Time:</Text>
              <Text style={TEXT_STYLES.body}>{selectedSupplement.time.replace('-', ' ')}</Text>
            </View>
            
            <View style={{ marginBottom: SPACING.lg }}>
              <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>Notes:</Text>
              <Text style={TEXT_STYLES.body}>{selectedSupplement.notes}</Text>
            </View>
            
            <Button
              mode="contained"
              onPress={() => {
                toggleSupplement(selectedSupplement.id);
                setShowSupplementModal(false);
              }}
              style={{ 
                backgroundColor: selectedSupplement.taken ? COLORS.success : COLORS.primary,
                marginBottom: SPACING.sm,
              }}
              contentStyle={{ paddingVertical: SPACING.sm }}
            >
              {selectedSupplement.taken ? '✅ Mark as Not Taken' : '✅ Mark as Taken'}
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => {
                Alert.alert(
                  '🚧 Feature Coming Soon',
                  'Supplement editing and deletion features will be available in a future update!',
                  [{ text: 'OK', onPress: () => {} }]
                );
              }}
              style={{ borderColor: COLORS.error }}
              textColor={COLORS.error}
            >
              Edit Supplement
            </Button>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );

  if (localSupplements.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{ paddingTop: 50, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg }}
        >
          <Text style={[TEXT_STYLES.h1, { color: 'white', textAlign: 'center' }]}>
            Supplement Tracker
          </Text>
        </LinearGradient>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }}>
          <Icon name="local-pharmacy" size={80} color={COLORS.textSecondary} style={{ marginBottom: SPACING.lg }} />
          <Text style={[TEXT_STYLES.h2, { textAlign: 'center', marginBottom: SPACING.md }]}>
            No Supplements Yet
          </Text>
          <Text style={[TEXT_STYLES.body, { textAlign: 'center', color: COLORS.textSecondary, marginBottom: SPACING.xl }]}>
            Start tracking your supplements to optimize your performance and health! 💪
          </Text>
          <Button
            mode="contained"
            onPress={() => setShowAddModal(true)}
            style={{ backgroundColor: COLORS.primary }}
            contentStyle={{ paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg }}
          >
            Add Your First Supplement
          </Button>
        </View>
        
        {renderAddModal()}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ paddingTop: 50, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>
            Supplement Tracker
          </Text>
          <IconButton
            icon="history"
            size={24}
            iconColor="white"
            onPress={() => {
              Alert.alert(
                '🚧 Feature Coming Soon',
                'Supplement history and analytics will be available in a future update!',
                [{ text: 'OK', onPress: () => {} }]
              );
            }}
          />
        </View>
      </LinearGradient>

      <ScrollView
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
        {renderStatsCard()}
        
        <Searchbar
          placeholder="Search supplements..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            margin: SPACING.md,
            elevation: 2,
          }}
          inputStyle={{ fontSize: 16 }}
        />

        <FlatList
          data={filteredSupplements}
          renderItem={renderSupplementCard}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => setShowAddModal(true)}
      />

      {renderAddModal()}
      {renderSupplementDetailModal()}
    </View>
  );
};

export default SupplementTracker;