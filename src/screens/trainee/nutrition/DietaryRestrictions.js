import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Animated,
  Alert,
  RefreshControl,
  Vibration,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Surface,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Chip,
  Portal,
  Modal,
  TextInput,
  Switch,
  Searchbar,
  List,
  Divider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system imports (assumed to be available)
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const DietaryRestrictions = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Redux state
  const user = useSelector(state => state.auth.user);
  const dietaryProfile = useSelector(state => state.nutrition.dietaryProfile || {});
  const dispatch = useDispatch();

  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAllergenModal, setShowAllergenModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customRestriction, setCustomRestriction] = useState('');
  
  // Dietary preferences
  const [dietType, setDietType] = useState(dietaryProfile.dietType || 'omnivore');
  const [selectedAllergens, setSelectedAllergens] = useState(dietaryProfile.allergens || []);
  const [selectedRestrictions, setSelectedRestrictions] = useState(dietaryProfile.restrictions || []);
  const [customRestrictions, setCustomRestrictions] = useState(dietaryProfile.customRestrictions || []);
  const [preferences, setPreferences] = useState(dietaryProfile.preferences || {});

  // Diet types with descriptions and icons
  const dietTypes = [
    {
      id: 'omnivore',
      name: 'Omnivore',
      description: 'Eats all types of food',
      icon: '🍽️',
      color: COLORS.primary,
    },
    {
      id: 'vegetarian',
      name: 'Vegetarian',
      description: 'No meat, but includes dairy and eggs',
      icon: '🥬',
      color: '#4CAF50',
    },
    {
      id: 'vegan',
      name: 'Vegan',
      description: 'No animal products',
      icon: '🌱',
      color: '#8BC34A',
    },
    {
      id: 'pescatarian',
      name: 'Pescatarian',
      description: 'Vegetarian diet plus fish and seafood',
      icon: '🐟',
      color: '#00BCD4',
    },
    {
      id: 'keto',
      name: 'Ketogenic',
      description: 'High fat, very low carb',
      icon: '🥑',
      color: '#FF9800',
    },
    {
      id: 'paleo',
      name: 'Paleo',
      description: 'Whole foods, no processed items',
      icon: '🥩',
      color: '#795548',
    },
    {
      id: 'mediterranean',
      name: 'Mediterranean',
      description: 'Based on Mediterranean cuisine',
      icon: '🫒',
      color: '#9C27B0',
    },
    {
      id: 'intermittent',
      name: 'Intermittent Fasting',
      description: 'Time-restricted eating patterns',
      icon: '⏰',
      color: '#E91E63',
    },
  ];

  // Common allergens
  const allergens = [
    { id: 'milk', name: 'Milk/Dairy', icon: '🥛', severity: 'high' },
    { id: 'eggs', name: 'Eggs', icon: '🥚', severity: 'high' },
    { id: 'fish', name: 'Fish', icon: '🐟', severity: 'medium' },
    { id: 'shellfish', name: 'Shellfish', icon: '🦐', severity: 'high' },
    { id: 'nuts', name: 'Tree Nuts', icon: '🥜', severity: 'high' },
    { id: 'peanuts', name: 'Peanuts', icon: '🥜', severity: 'high' },
    { id: 'wheat', name: 'Wheat', icon: '🌾', severity: 'medium' },
    { id: 'soy', name: 'Soy', icon: '🫘', severity: 'medium' },
    { id: 'sesame', name: 'Sesame', icon: '🍤', severity: 'medium' },
    { id: 'gluten', name: 'Gluten', icon: '🍞', severity: 'medium' },
  ];

  // Food restrictions/dislikes
  const commonRestrictions = [
    { id: 'spicy', name: 'Spicy Foods', icon: '🌶️', category: 'preference' },
    { id: 'mushrooms', name: 'Mushrooms', icon: '🍄', category: 'dislike' },
    { id: 'seafood', name: 'Seafood', icon: '🦞', category: 'preference' },
    { id: 'pork', name: 'Pork', icon: '🐷', category: 'dietary' },
    { id: 'beef', name: 'Beef', icon: '🐄', category: 'dietary' },
    { id: 'chicken', name: 'Chicken', icon: '🐔', category: 'dietary' },
    { id: 'onions', name: 'Onions', icon: '🧅', category: 'dislike' },
    { id: 'garlic', name: 'Garlic', icon: '🧄', category: 'dislike' },
    { id: 'tomatoes', name: 'Tomatoes', icon: '🍅', category: 'dislike' },
    { id: 'alcohol', name: 'Alcohol', icon: '🍷', category: 'lifestyle' },
    { id: 'caffeine', name: 'Caffeine', icon: '☕', category: 'lifestyle' },
    { id: 'sugar', name: 'Added Sugar', icon: '🍬', category: 'health' },
  ];

  // Dietary preferences toggles
  const dietaryPreferences = [
    { id: 'organic', name: 'Prefer Organic', description: 'Prioritize organic ingredients' },
    { id: 'local', name: 'Local Foods', description: 'Support local producers' },
    { id: 'seasonal', name: 'Seasonal Eating', description: 'Focus on seasonal ingredients' },
    { id: 'minimal', name: 'Minimal Processing', description: 'Avoid highly processed foods' },
    { id: 'sustainable', name: 'Sustainable Choices', description: 'Environmentally conscious options' },
    { id: 'budget', name: 'Budget Friendly', description: 'Consider cost-effective options' },
  ];

  useEffect(() => {
    // Entrance animations
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const toggleAllergen = useCallback((allergenId) => {
    setSelectedAllergens(prev => 
      prev.includes(allergenId) 
        ? prev.filter(id => id !== allergenId)
        : [...prev, allergenId]
    );
    Vibration.vibrate(30);
  }, []);

  const toggleRestriction = useCallback((restrictionId) => {
    setSelectedRestrictions(prev => 
      prev.includes(restrictionId) 
        ? prev.filter(id => id !== restrictionId)
        : [...prev, restrictionId]
    );
    Vibration.vibrate(30);
  }, []);

  const togglePreference = useCallback((prefId, value) => {
    setPreferences(prev => ({
      ...prev,
      [prefId]: value,
    }));
  }, []);

  const addCustomRestriction = useCallback(() => {
    if (customRestriction.trim()) {
      setCustomRestrictions(prev => [...prev, customRestriction.trim()]);
      setCustomRestriction('');
      setShowCustomModal(false);
      Vibration.vibrate(50);
    }
  }, [customRestriction]);

  const removeCustomRestriction = useCallback((index) => {
    setCustomRestrictions(prev => prev.filter((_, i) => i !== index));
    Vibration.vibrate(30);
  }, []);

  const saveProfile = useCallback(() => {
    setLoading(true);
    Vibration.vibrate(50);

    const dietaryProfileData = {
      dietType,
      allergens: selectedAllergens,
      restrictions: selectedRestrictions,
      customRestrictions,
      preferences,
      updatedAt: new Date().toISOString(),
    };

    // Save to Redux store
    dispatch({
      type: 'UPDATE_DIETARY_PROFILE',
      payload: dietaryProfileData,
    });

    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        '✅ Profile Saved!',
        'Your dietary restrictions have been updated. This will help us provide better meal recommendations.',
        [
          {
            text: 'View Meal Plans',
            onPress: () => navigation.navigate('MealPlanner'),
          },
          { text: 'OK' },
        ]
      );
    }, 1000);
  }, [dietType, selectedAllergens, selectedRestrictions, customRestrictions, preferences, dispatch, navigation]);

  const getDietTypeBySelection = () => {
    return dietTypes.find(diet => diet.id === dietType);
  };

  const filteredRestrictions = commonRestrictions.filter(restriction =>
    restriction.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning || '#FF9800';
      default: return COLORS.primary;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.lg,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.header, { color: 'white', marginLeft: SPACING.sm }]}>
            🥗 Dietary Profile
          </Text>
        </View>
        <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)', marginTop: SPACING.xs }]}>
          Set your dietary preferences and restrictions
        </Text>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
            padding: SPACING.md,
          }}
        >
          {/* Diet Type Selection */}
          <Card style={{ marginBottom: SPACING.md }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
                🍽️ Diet Type
              </Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {dietTypes.map((diet) => (
                  <Surface
                    key={diet.id}
                    style={{
                      padding: SPACING.md,
                      marginRight: SPACING.sm,
                      borderRadius: 12,
                      backgroundColor: dietType === diet.id ? diet.color + '20' : COLORS.surface,
                      borderWidth: dietType === diet.id ? 2 : 1,
                      borderColor: dietType === diet.id ? diet.color : COLORS.surface,
                      minWidth: 140,
                    }}
                  >
                    <Button
                      mode="text"
                      onPress={() => setDietType(diet.id)}
                      contentStyle={{ height: 80, justifyContent: 'center' }}
                    >
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 24, marginBottom: SPACING.xs }}>
                          {diet.icon}
                        </Text>
                        <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', textAlign: 'center' }]}>
                          {diet.name}
                        </Text>
                        <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.xs }]}>
                          {diet.description}
                        </Text>
                      </View>
                    </Button>
                  </Surface>
                ))}
              </ScrollView>

              {getDietTypeBySelection() && (
                <Surface style={{
                  padding: SPACING.md,
                  marginTop: SPACING.md,
                  borderRadius: 8,
                  backgroundColor: getDietTypeBySelection().color + '10',
                  borderLeftWidth: 4,
                  borderLeftColor: getDietTypeBySelection().color,
                }}>
                  <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                    {getDietTypeBySelection().icon} {getDietTypeBySelection().name} Selected
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
                    {getDietTypeBySelection().description}
                  </Text>
                </Surface>
              )}
            </Card.Content>
          </Card>

          {/* Allergens Section */}
          <Card style={{ marginBottom: SPACING.md }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
                  ⚠️ Food Allergies
                </Text>
                <Chip
                  icon="information"
                  onPress={() => setShowAllergenModal(true)}
                  compact
                >
                  {selectedAllergens.length}
                </Chip>
              </View>
              
              <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.md, fontStyle: 'italic' }]}>
                Select any foods you're allergic to for safety
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {allergens.map((allergen) => (
                  <Chip
                    key={allergen.id}
                    selected={selectedAllergens.includes(allergen.id)}
                    onPress={() => toggleAllergen(allergen.id)}
                    style={{
                      marginRight: SPACING.sm,
                      marginBottom: SPACING.sm,
                      backgroundColor: selectedAllergens.includes(allergen.id) 
                        ? getSeverityColor(allergen.severity) + '20' 
                        : undefined,
                    }}
                    icon={() => (
                      <Text style={{ fontSize: 16 }}>{allergen.icon}</Text>
                    )}
                    textStyle={{
                      color: selectedAllergens.includes(allergen.id) 
                        ? getSeverityColor(allergen.severity) 
                        : undefined,
                    }}
                  >
                    {allergen.name}
                  </Chip>
                ))}
              </View>

              {selectedAllergens.length > 0 && (
                <Surface style={{
                  padding: SPACING.md,
                  marginTop: SPACING.md,
                  borderRadius: 8,
                  backgroundColor: COLORS.error + '10',
                  borderLeftWidth: 4,
                  borderLeftColor: COLORS.error,
                }}>
                  <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: COLORS.error }]}>
                    ⚠️ Allergy Alert
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
                    We'll exclude these ingredients from all meal recommendations
                  </Text>
                </Surface>
              )}
            </Card.Content>
          </Card>

          {/* Food Restrictions/Dislikes */}
          <Card style={{ marginBottom: SPACING.md }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
                🚫 Food Restrictions & Dislikes
              </Text>

              <Searchbar
                placeholder="Search restrictions..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={{ marginBottom: SPACING.md }}
                inputStyle={{ fontSize: 14 }}
              />

              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {filteredRestrictions.map((restriction) => (
                  <Chip
                    key={restriction.id}
                    selected={selectedRestrictions.includes(restriction.id)}
                    onPress={() => toggleRestriction(restriction.id)}
                    style={{
                      marginRight: SPACING.sm,
                      marginBottom: SPACING.sm,
                    }}
                    icon={() => (
                      <Text style={{ fontSize: 16 }}>{restriction.icon}</Text>
                    )}
                  >
                    {restriction.name}
                  </Chip>
                ))}
              </View>

              {/* Custom Restrictions */}
              {customRestrictions.length > 0 && (
                <View style={{ marginTop: SPACING.md }}>
                  <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginBottom: SPACING.sm }]}>
                    Custom Restrictions:
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {customRestrictions.map((restriction, index) => (
                      <Chip
                        key={index}
                        onClose={() => removeCustomRestriction(index)}
                        style={{ marginRight: SPACING.sm, marginBottom: SPACING.sm }}
                        icon="account"
                      >
                        {restriction}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}

              <Button
                mode="outlined"
                onPress={() => setShowCustomModal(true)}
                style={{ marginTop: SPACING.md }}
                icon="plus"
              >
                Add Custom Restriction
              </Button>
            </Card.Content>
          </Card>

          {/* Dietary Preferences */}
          <Card style={{ marginBottom: SPACING.md }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
                ✨ Preferences
              </Text>
              
              {dietaryPreferences.map((pref) => (
                <View key={pref.id}>
                  <List.Item
                    title={pref.name}
                    description={pref.description}
                    right={() => (
                      <Switch
                        value={preferences[pref.id] || false}
                        onValueChange={(value) => togglePreference(pref.id, value)}
                        color={COLORS.primary}
                      />
                    )}
                  />
                  <Divider />
                </View>
              ))}
            </Card.Content>
          </Card>

          {/* Profile Summary */}
          <Card style={{ marginBottom: SPACING.xl }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
                📋 Profile Summary
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                <Text style={[TEXT_STYLES.body]}>Diet Type:</Text>
                <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                  {getDietTypeBySelection()?.name || 'Not selected'}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                <Text style={[TEXT_STYLES.body]}>Allergies:</Text>
                <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: selectedAllergens.length > 0 ? COLORS.error : COLORS.success }]}>
                  {selectedAllergens.length}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                <Text style={[TEXT_STYLES.body]}>Restrictions:</Text>
                <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                  {selectedRestrictions.length + customRestrictions.length}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[TEXT_STYLES.body]}>Preferences:</Text>
                <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                  {Object.values(preferences).filter(Boolean).length}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Save FAB */}
      <FAB
        icon="content-save"
        label="Save Profile"
        onPress={saveProfile}
        loading={loading}
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.success,
        }}
      />

      {/* Allergen Info Modal */}
      <Portal>
        <Modal
          visible={showAllergenModal}
          onDismiss={() => setShowAllergenModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: SPACING.lg,
            margin: SPACING.lg,
            borderRadius: 12,
            maxHeight: '80%',
          }}
        >
          <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
            ⚠️ Allergy Information
          </Text>
          <ScrollView>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
              Food allergies are serious medical conditions that require strict avoidance of trigger foods.
            </Text>
            
            <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginBottom: SPACING.sm }]}>
              Severity Levels:
            </Text>
            <View style={{ marginBottom: SPACING.md }}>
              <Text style={[TEXT_STYLES.body, { color: COLORS.error, marginBottom: SPACING.xs }]}>
                🔴 High Risk - Can cause severe reactions
              </Text>
              <Text style={[TEXT_STYLES.body, { color: '#FF9800', marginBottom: SPACING.xs }]}>
                🟡 Medium Risk - May cause moderate reactions
              </Text>
            </View>
            
            <Text style={[TEXT_STYLES.caption, { fontStyle: 'italic' }]}>
              Always consult with healthcare professionals for proper allergy management.
            </Text>
          </ScrollView>
          <Button mode="contained" onPress={() => setShowAllergenModal(false)} style={{ marginTop: SPACING.md }}>
            Got it
          </Button>
        </Modal>
      </Portal>

      {/* Custom Restriction Modal */}
      <Portal>
        <Modal
          visible={showCustomModal}
          onDismiss={() => setShowCustomModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: SPACING.lg,
            margin: SPACING.lg,
            borderRadius: 12,
          }}
        >
          <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
            ➕ Add Custom Restriction
          </Text>
          
          <TextInput
            label="Food or ingredient to avoid"
            value={customRestriction}
            onChangeText={setCustomRestriction}
            mode="outlined"
            placeholder="e.g., Cilantro, Coconut, etc."
            style={{ marginBottom: SPACING.md }}
          />
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button mode="outlined" onPress={() => setShowCustomModal(false)} style={{ flex: 1, marginRight: SPACING.sm }}>
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={addCustomRestriction}
              disabled={!customRestriction.trim()}
              style={{ flex: 1, marginLeft: SPACING.sm }}
            >
              Add
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default DietaryRestrictions;