import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  StatusBar,
  Animated,
  Vibration,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  Searchbar,
  Avatar,
  Badge,
  Divider,
  DataTable,
  TextInput,
  HelperText,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  primaryLight: 'rgba(102, 126, 234, 0.1)',
  secondary: '#764ba2',
  success: '#4CAF50',
  warning: '#ed8936',
  error: '#F44336',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#2d3748',
  textPrimary: '#1a202c',
  textSecondary: '#718096',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 32, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  h4: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 14, color: COLORS.text },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('screen');

const SizingGuides = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [savedGuides, setSavedGuides] = useState(new Set());
  const [myMeasurements, setMyMeasurements] = useState({
    height: '',
    weight: '',
    chest: '',
    waist: '',
    hips: '',
    inseam: '',
    shoulders: '',
    neck: '',
  });
  const [calculatorInputs, setCalculatorInputs] = useState({
    currentSize: '',
    brand: '',
    targetBrand: '',
  });
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const dispatch = useDispatch();
  const user = useSelector(state => state?.auth?.user || null);
  
  // Enhanced sizing guide data with comprehensive information
  const [guidesData] = useState([
    {
      id: '1',
      title: 'Nike Athletic Wear',
      category: 'Apparel',
      type: 'clothing',
      brand: 'Nike',
      image: 'checkroom',
      description: 'Complete sizing guide for Nike athletic clothing including tops, bottoms, and accessories.',
      items: ['Shirts', 'Shorts', 'Leggings', 'Jackets', 'Sports Bras'],
      popularSizes: ['M', 'L', 'XL'],
      fitType: 'Athletic Fit',
      sizingChart: {
        headers: ['Size', 'Chest (in)', 'Waist (in)', 'Hips (in)'],
        data: [
          ['XS', '32-34', '26-28', '34-36'],
          ['S', '34-36', '28-30', '36-38'],
          ['M', '36-38', '30-32', '38-40'],
          ['L', '38-40', '32-34', '40-42'],
          ['XL', '40-42', '34-36', '42-44'],
          ['XXL', '42-44', '36-38', '44-46'],
        ]
      },
      tips: [
        'Nike runs true to size for most items',
        'Sports bras tend to run small - size up',
        'Dri-FIT material has minimal stretch',
        'Check specific product reviews for fit'
      ],
      measurements: ['chest', 'waist', 'hips'],
      regions: ['US', 'EU', 'UK'],
      lastUpdated: '2024-01-15',
      accuracy: 95,
      reviews: 1247,
      tags: ['Popular', 'Athletic', 'True to Size'],
    },
    {
      id: '2',
      title: 'Resistance Bands Sizing',
      category: 'Equipment',
      type: 'equipment',
      brand: 'Universal',
      image: 'fitness-center',
      description: 'Guide for selecting the right resistance band strength and size for your fitness level.',
      items: ['Light Bands', 'Medium Bands', 'Heavy Bands', 'Extra Heavy'],
      popularSizes: ['Medium', 'Heavy'],
      fitType: 'Resistance Level',
      sizingChart: {
        headers: ['Level', 'Resistance (lbs)', 'Best For', 'Color Code'],
        data: [
          ['Light', '10-15', 'Beginners, Rehab', 'Yellow'],
          ['Medium', '20-30', 'General Fitness', 'Red'],
          ['Heavy', '35-50', 'Strength Training', 'Black'],
          ['Extra Heavy', '55-80', 'Advanced Users', 'Purple'],
        ]
      },
      tips: [
        'Start with lighter resistance and progress up',
        'Consider your current strength level',
        'Multiple bands allow for progressive training',
        'Band thickness affects durability'
      ],
      measurements: ['strength_level', 'experience'],
      regions: ['Universal'],
      lastUpdated: '2024-01-20',
      accuracy: 92,
      reviews: 834,
      tags: ['Equipment', 'Progressive', 'Universal'],
    },
    {
      id: '3',
      title: 'Adidas Running Shoes',
      category: 'Footwear',
      type: 'shoes',
      brand: 'Adidas',
      image: 'directions-run',
      description: 'Comprehensive sizing guide for Adidas running and training shoes.',
      items: ['UltraBoost', 'NMD', 'Gazelle', 'Stan Smith'],
      popularSizes: ['9', '10', '11'],
      fitType: 'Running Fit',
      sizingChart: {
        headers: ['US Size', 'EU Size', 'UK Size', 'Foot Length (cm)'],
        data: [
          ['7', '40', '6.5', '25.4'],
          ['8', '42', '7.5', '26.7'],
          ['9', '43', '8.5', '27.9'],
          ['10', '44', '9.5', '29.2'],
          ['11', '45', '10.5', '30.5'],
          ['12', '46', '11.5', '31.8'],
        ]
      },
      tips: [
        'Adidas typically runs half size large',
        'Consider width - some models run narrow',
        'Leave thumb width space at toe',
        'Try on shoes in the afternoon when feet are swollen'
      ],
      measurements: ['foot_length', 'foot_width'],
      regions: ['US', 'EU', 'UK'],
      lastUpdated: '2024-01-18',
      accuracy: 88,
      reviews: 2156,
      tags: ['Footwear', 'Size Up', 'Popular'],
    },
    {
      id: '4',
      title: 'Yoga Mat Sizing',
      category: 'Equipment',
      type: 'equipment',
      brand: 'Universal',
      image: 'self-improvement',
      description: 'Guide to choosing the right yoga mat size and thickness for your practice.',
      items: ['Standard Mats', 'Long Mats', 'Wide Mats', 'Travel Mats'],
      popularSizes: ['Standard', 'Long'],
      fitType: 'Practice Type',
      sizingChart: {
        headers: ['Type', 'Length (in)', 'Width (in)', 'Thickness (mm)', 'Best For'],
        data: [
          ['Standard', '68', '24', '4-6', 'Most Users'],
          ['Long', '72-84', '24', '4-6', 'Tall Users (6ft+)'],
          ['Wide', '68', '26-30', '4-6', 'Plus Size/Stability'],
          ['Travel', '68', '24', '1-3', 'Portability'],
          ['Thick', '68', '24', '8-15', 'Joint Support'],
        ]
      },
      tips: [
        'Standard size fits most practitioners',
        'Taller than 6ft? Consider long mats',
        'Thicker mats provide more cushioning',
        'Consider your primary practice style'
      ],
      measurements: ['height', 'practice_style'],
      regions: ['Universal'],
      lastUpdated: '2024-01-22',
      accuracy: 94,
      reviews: 567,
      tags: ['Equipment', 'Universal', 'Practice'],
    },
    {
      id: '5',
      title: 'Under Armour Compression',
      category: 'Apparel',
      type: 'clothing',
      brand: 'Under Armour',
      image: 'checkroom',
      description: 'Sizing guide for Under Armour compression wear and base layers.',
      items: ['Compression Shirts', 'Leggings', 'Base Layers', 'HeatGear'],
      popularSizes: ['M', 'L'],
      fitType: 'Compression Fit',
      sizingChart: {
        headers: ['Size', 'Chest (in)', 'Waist (in)', 'Sleeve (in)'],
        data: [
          ['S', '35-37', '29-31', '32.5'],
          ['M', '38-40', '32-34', '33.5'],
          ['L', '41-43', '35-37', '34.5'],
          ['XL', '44-46', '38-40', '35.5'],
          ['XXL', '47-49', '41-43', '36.5'],
        ]
      },
      tips: [
        'Compression fit should be snug but not restrictive',
        'Size down for maximum compression',
        'HeatGear runs slightly smaller',
        'Consider intended activity level'
      ],
      measurements: ['chest', 'waist', 'sleeve'],
      regions: ['US', 'EU'],
      lastUpdated: '2024-01-14',
      accuracy: 91,
      reviews: 892,
      tags: ['Compression', 'Athletic', 'Performance'],
    },
    {
      id: '6',
      title: 'Dumbbells Weight Selection',
      category: 'Equipment',
      type: 'equipment',
      brand: 'Universal',
      image: 'fitness-center',
      description: 'Guide to selecting appropriate dumbbell weights based on fitness level and goals.',
      items: ['Light Weights', 'Medium Weights', 'Heavy Weights', 'Progressive Sets'],
      popularSizes: ['5-25 lbs', '10-50 lbs'],
      fitType: 'Strength Level',
      sizingChart: {
        headers: ['Level', 'Upper Body (lbs)', 'Lower Body (lbs)', 'Recommended Set'],
        data: [
          ['Beginner', '5-15', '10-25', '5, 8, 10, 12, 15'],
          ['Intermediate', '15-35', '25-50', '15, 20, 25, 30, 35'],
          ['Advanced', '35-75', '50-100', '35, 40, 45, 50, 60+'],
          ['Elite', '75+', '100+', 'Custom Heavy Set'],
        ]
      },
      tips: [
        'Start lighter than you think you need',
        'Focus on form over weight',
        'Progressive overload requires multiple weights',
        'Consider adjustable dumbbells for space'
      ],
      measurements: ['strength_level', 'experience', 'goals'],
      regions: ['Universal'],
      lastUpdated: '2024-01-19',
      accuracy: 89,
      reviews: 1045,
      tags: ['Equipment', 'Strength', 'Progressive'],
    },
  ]);

  const categories = [
    { key: 'all', label: 'All Guides', icon: 'view-list', count: guidesData.length },
    { key: 'Apparel', label: 'Apparel', icon: 'checkroom', count: guidesData.filter(g => g.category === 'Apparel').length },
    { key: 'Footwear', label: 'Footwear', icon: 'directions-run', count: guidesData.filter(g => g.category === 'Footwear').length },
    { key: 'Equipment', label: 'Equipment', icon: 'fitness-center', count: guidesData.filter(g => g.category === 'Equipment').length },
  ];

  const brands = [
    { key: 'all', label: 'All Brands' },
    { key: 'Nike', label: 'Nike' },
    { key: 'Adidas', label: 'Adidas' },
    { key: 'Under Armour', label: 'Under Armour' },
    { key: 'Universal', label: 'Universal' },
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
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Vibration.vibrate(50);
      }
      Alert.alert('✅ Updated!', 'Sizing guides have been refreshed with latest data!');
    }, 2000);
  }, []);

  const filteredGuides = guidesData.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
    const matchesBrand = selectedBrand === 'all' || guide.brand === selectedBrand;
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const toggleSaved = (guideId) => {
    const newSaved = new Set(savedGuides);
    if (newSaved.has(guideId)) {
      newSaved.delete(guideId);
    } else {
      newSaved.add(guideId);
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Vibration.vibrate(50);
      }
    }
    setSavedGuides(newSaved);
  };

  const handleMeasurementSave = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Vibration.vibrate(100);
    }
    Alert.alert('✅ Measurements Saved!', 'Your measurements have been saved for personalized sizing recommendations.');
    setShowMeasurementModal(false);
  };

  const handleSizeCalculation = () => {
    if (!calculatorInputs.currentSize || !calculatorInputs.brand || !calculatorInputs.targetBrand) {
      Alert.alert('Missing Information', 'Please fill in all fields to calculate size conversion.');
      return;
    }
    
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Vibration.vibrate(100);
    }
    Alert.alert(
      '📏 Size Conversion',
      `Based on your ${calculatorInputs.brand} size ${calculatorInputs.currentSize}, we recommend size ${calculatorInputs.currentSize} for ${calculatorInputs.targetBrand}.\n\nNote: This is an estimate. Always check specific sizing charts.`
    );
  };

  const openGuideDetail = (guide) => {
    setSelectedGuide(guide);
    setShowGuideModal(true);
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return COLORS.success;
    if (accuracy >= 80) return COLORS.warning;
    return COLORS.error;
  };

  const renderGuideCard = ({ item: guide }) => {
    const isSaved = savedGuides.has(guide.id);
    
    return (
      <Card style={styles.guideCard} elevation={3}>
        <LinearGradient
          colors={['rgba(102, 126, 234, 0.05)', 'transparent']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Avatar.Icon
                size={50}
                icon={guide.image}
                style={[styles.guideIcon, { backgroundColor: COLORS.primary }]}
              />
              <View style={styles.brandInfo}>
                <Text style={styles.brandName}>{guide.brand}</Text>
                <Chip
                  mode="outlined"
                  compact
                  style={styles.categoryChip}
                  textStyle={styles.categoryText}
                >
                  {guide.category}
                </Chip>
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.accuracyBadge}>
                <Icon 
                  name="verified" 
                  size={14} 
                  color={getAccuracyColor(guide.accuracy)} 
                />
                <Text style={[styles.accuracyText, { color: getAccuracyColor(guide.accuracy) }]}>
                  {guide.accuracy}%
                </Text>
              </View>
              <IconButton
                icon={isSaved ? 'bookmark' : 'bookmark-border'}
                size={20}
                iconColor={isSaved ? COLORS.primary : COLORS.textSecondary}
                onPress={() => toggleSaved(guide.id)}
                style={styles.saveButton}
              />
            </View>
          </View>

          <TouchableOpacity onPress={() => openGuideDetail(guide)}>
            <Text style={styles.guideTitle}>{guide.title}</Text>
            <Text style={styles.guideDescription} numberOfLines={2}>
              {guide.description}
            </Text>

            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Includes:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {guide.items.map((item, index) => (
                  <Chip
                    key={index}
                    mode="flat"
                    compact
                    style={styles.itemChip}
                    textStyle={styles.itemText}
                  >
                    {item}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            <View style={styles.sizingPreview}>
              <Text style={styles.sectionTitle}>Size Chart Preview:</Text>
              <DataTable style={styles.previewTable}>
                <DataTable.Header>
                  {guide.sizingChart.headers.slice(0, 3).map((header, index) => (
                    <DataTable.Title key={index}>
                      <Text style={styles.tableHeader}>{header}</Text>
                    </DataTable.Title>
                  ))}
                </DataTable.Header>
                {guide.sizingChart.data.slice(0, 3).map((row, index) => (
                  <DataTable.Row key={index}>
                    {row.slice(0, 3).map((cell, cellIndex) => (
                      <DataTable.Cell key={cellIndex}>
                        <Text style={styles.tableCell}>{cell}</Text>
                      </DataTable.Cell>
                    ))}
                  </DataTable.Row>
                ))}
              </DataTable>
              <Text style={styles.moreDataText}>+ {guide.sizingChart.data.length - 3} more sizes</Text>
            </View>

            <View style={styles.tipsSection}>
              <Text style={styles.sectionTitle}>Quick Tips:</Text>
              {guide.tips.slice(0, 2).map((tip, index) => (
                <View key={index} style={styles.tipRow}>
                  <Icon name="lightbulb" size={14} color={COLORS.warning} />
                  <Text style={styles.tipText} numberOfLines={1}>{tip}</Text>
                </View>
              ))}
            </View>

            <View style={styles.guideStats}>
              <View style={styles.statItem}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.statText}>{guide.reviews} reviews</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="update" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>Updated {guide.lastUpdated}</Text>
              </View>
            </View>

            <View style={styles.tagsSection}>
              {guide.tags.map((tag, index) => (
                <Chip
                  key={index}
                  mode="flat"
                  compact
                  style={styles.tag}
                  textStyle={styles.tagText}
                >
                  {tag}
                </Chip>
              ))}
            </View>

            <Divider style={styles.divider} />

            <View style={styles.actionsSection}>
              <Button
                mode="outlined"
                onPress={() => openGuideDetail(guide)}
                style={styles.actionButton}
                icon="visibility"
                compact
              >
                View Full Guide
              </Button>
              
              <Button
                mode="contained"
                onPress={() => Alert.alert('🎯 Size Recommendation', 'Personalized size recommendations based on your measurements coming soon!')}
                style={[styles.actionButton, styles.recommendButton]}
                buttonColor={COLORS.primary}
                icon="auto-awesome"
                compact
              >
                Get My Size
              </Button>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </Card>
    );
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedCategory(item.key)}
      style={[
        styles.categoryItem,
        selectedCategory === item.key && styles.selectedCategory
      ]}
    >
      <Icon
        name={item.icon}
        size={24}
        color={selectedCategory === item.key ? 'white' : COLORS.primary}
      />
      <Text style={[
        styles.categoryLabel,
        selectedCategory === item.key && styles.selectedCategoryLabel
      ]}>
        {item.label}
      </Text>
      <Badge
        style={[
          styles.categoryBadge,
          selectedCategory === item.key && styles.selectedCategoryBadge
        ]}
      >
        {item.count}
      </Badge>
    </TouchableOpacity>
  );

  const renderGuideModal = () => {
    if (!selectedGuide) return null;

    return (
      <Modal
        visible={showGuideModal}
        onDismiss={() => setShowGuideModal(false)}
        contentContainerStyle={styles.fullModalContainer}
      >
        <Surface style={styles.fullModalContent}>
          <View style={styles.fullModalHeader}>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowGuideModal(false)}
              iconColor={COLORS.text}
            />
            <Text style={[TEXT_STYLES.h2, styles.fullModalTitle]}>
              {selectedGuide.title}
            </Text>
            <IconButton
              icon={savedGuides.has(selectedGuide.id) ? 'bookmark' : 'bookmark-border'}
              size={24}
              onPress={() => toggleSaved(selectedGuide.id)}
              iconColor={savedGuides.has(selectedGuide.id) ? COLORS.primary : COLORS.textSecondary}
            />
          </View>

          <ScrollView style={styles.fullModalScroll}>
            {/* Complete Size Chart */}
            <View style={styles.fullSizeChart}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Complete Size Chart</Text>
              <DataTable>
                <DataTable.Header>
                  {selectedGuide.sizingChart.headers.map((header, index) => (
                    <DataTable.Title key={index}>
                      <Text style={styles.fullTableHeader}>{header}</Text>
                    </DataTable.Title>
                  ))}
                </DataTable.Header>
                {selectedGuide.sizingChart.data.map((row, index) => (
                  <DataTable.Row key={index}>
                    {row.map((cell, cellIndex) => (
                      <DataTable.Cell key={cellIndex}>
                        <Text style={styles.fullTableCell}>{cell}</Text>
                      </DataTable.Cell>
                    ))}
                  </DataTable.Row>
                ))}
              </DataTable>
            </View>

            {/* All Tips */}
            <View style={styles.fullTipsSection}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>💡 Sizing Tips</Text>
              {selectedGuide.tips.map((tip, index) => (
                <View key={index} style={styles.fullTipRow}>
                  <Icon name="check-circle" size={16} color={COLORS.success} />
                  <Text style={styles.fullTipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </Surface>
      </Modal>
    );
  };

  const renderMeasurementModal = () => (
    <Surface style={styles.modalContent}>
      <Text style={styles.modalTitle}>📏 My Measurements</Text>
      <Text style={styles.modalSubtitle}>Enter your measurements for personalized size recommendations</Text>
      
      <ScrollView style={styles.measurementForm}>
        <View style={styles.measurementRow}>
          <TextInput
            label="Height (ft/in or cm)"
            value={myMeasurements.height}
            onChangeText={(text) => setMyMeasurements(prev => ({ ...prev, height: text }))}
            style={styles.measurementInput}
            mode="outlined"
            placeholder="e.g., 5'8\" or 173cm"
          />
          <TextInput
            label="Weight (lbs or kg)"
            value={myMeasurements.weight}
            onChangeText={(text) => setMyMeasurements(prev => ({ ...prev, weight: text }))}
            style={styles.measurementInput}
            mode="outlined"
            placeholder="e.g., 150 or 68kg"
          />
        </View>
        
        <View style={styles.measurementRow}>
          <TextInput
            label="Chest (in)"
            value={myMeasurements.chest}
            onChangeText={(text) => setMyMeasurements(prev => ({ ...prev, chest: text }))}
            style={styles.measurementInput}
            mode="outlined"
            placeholder="e.g., 38"
          />
          <TextInput
            label="Waist (in)"
            value={myMeasurements.waist}
            onChangeText={(text) => setMyMeasurements(prev => ({ ...prev, waist: text }))}
            style={styles.measurementInput}
            mode="outlined"
            placeholder="e.g., 32"
          />
        </View>
        
        <View style={styles.measurementRow}>
          <TextInput
            label="Hips (in)"
            value={myMeasurements.hips}
            onChangeText={(text) => setMyMeasurements(prev => ({ ...prev, hips: text }))}
            style={styles.measurementInput}
            mode="outlined"
            placeholder="e.g., 36"
          />
          <TextInput
            label="Inseam (in)"
            value={myMeasurements.inseam}
            onChangeText={(text) => setMyMeasurements(prev => ({ ...prev, inseam: text }))}
            style={styles.measurementInput}
            mode="outlined"
            placeholder="e.g., 30"
          />
        </View>
        
        <HelperText type="info" style={styles.helperText}>
          💡 Tip: Measure yourself or use your best-fitting clothing as reference
        </HelperText>
      </ScrollView>
      
      <View style={styles.modalActions}>
        <Button
          mode="outlined"
          onPress={() => setShowMeasurementModal(false)}
          style={styles.modalButton}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleMeasurementSave}
          style={styles.modalButton}
          buttonColor={COLORS.primary}
        >
          Save Measurements
        </Button>
      </View>
    </Surface>
  );

  const renderCalculatorModal = () => (
    <Surface style={styles.modalContent}>
      <Text style={styles.modalTitle}>🧮 Size Calculator</Text>
      <Text style={styles.modalSubtitle}>Convert sizes between brands</Text>
      
      <View style={styles.calculatorForm}>
        <TextInput
          label="Your Current Size"
          value={calculatorInputs.currentSize}
          onChangeText={(text) => setCalculatorInputs(prev => ({ ...prev, currentSize: text }))}
          style={styles.calculatorInput}
          mode="outlined"
          placeholder="e.g., M, L, 10, 42"
        />
        
        <TextInput
          label="Current Brand"
          value={calculatorInputs.brand}
          onChangeText={(text) => setCalculatorInputs(prev => ({ ...prev, brand: text }))}
          style={styles.calculatorInput}
          mode="outlined"
          placeholder="e.g., Nike, Adidas"
        />
        
        <TextInput
          label="Target Brand"
          value={calculatorInputs.targetBrand}
          onChangeText={(text) => setCalculatorInputs(prev => ({ ...prev, targetBrand: text }))}
          style={styles.calculatorInput}
          mode="outlined"
          placeholder="e.g., Under Armour"
        />
        
        <HelperText type="info" style={styles.helperText}>
          🔄 Convert your size from one brand to another
        </HelperText>
      </View>
      
      <View style={styles.modalActions}>
        <Button
          mode="outlined"
          onPress={() => setShowCalculatorModal(false)}
          style={styles.modalButton}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSizeCalculation}
          style={styles.modalButton}
          buttonColor={COLORS.primary}
        >
          Calculate Size
        </Button>
      </View>
    </Surface>
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>📏 Sizing Guides</Text>
              <Text style={styles.headerSubtitle}>Find your perfect fit every time</Text>
            </View>
            <View style={styles.headerActions}>
              <IconButton
                icon="calculate"
                size={24}
                iconColor="white"
                onPress={() => setShowCalculatorModal(true)}
                style={styles.headerButton}
              />
              <IconButton
                icon="straighten"
                size={24}
                iconColor="white"
                onPress={() => setShowMeasurementModal(true)}
                style={styles.headerButton}
              />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search brands, products, sizing guides..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
          {brands.map((brand) => (
            <TouchableOpacity
              key={brand.key}
              onPress={() => setSelectedBrand(brand.key)}
              style={[
                styles.filterChip,
                selectedBrand === brand.key && styles.selectedFilter
              ]}
            >
              <Text style={[
                styles.filterLabel,
                selectedBrand === brand.key && styles.selectedFilterLabel
              ]}>
                {brand.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Animated.View style={[styles.categoriesContainer, { transform: [{ translateY: slideAnim }] }]}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        />
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {filteredGuides.length === 0 ? (
          <Surface style={styles.emptyState}>
            <Icon name="straighten" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No Sizing Guides Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search or filters' : 'Check back later for new sizing guides!'}
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedBrand('all');
              }}
              style={styles.clearFiltersButton}
              buttonColor={COLORS.primary}
            >
              Clear All Filters
            </Button>
          </Surface>
        ) : (
          <FlatList
            data={filteredGuides}
            renderItem={renderGuideCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            contentContainerStyle={styles.guidesContainer}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
          />
        )}
      </Animated.View>

      <Portal>
        <Modal
          visible={showMeasurementModal}
          onDismiss={() => setShowMeasurementModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {Platform.OS === 'ios' ? (
            <BlurView
              style={styles.modalBlur}
              blurType="light"
              blurAmount={10}
            >
              {renderMeasurementModal()}
            </BlurView>
          ) : (
            <View style={styles.modalBlurAndroid}>
              {renderMeasurementModal()}
            </View>
          )}
        </Modal>

        <Modal
          visible={showCalculatorModal}
          onDismiss={() => setShowCalculatorModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {Platform.OS === 'ios' ? (
            <BlurView
              style={styles.modalBlur}
              blurType="light"
              blurAmount={10}
            >
              {renderCalculatorModal()}
            </BlurView>
          ) : (
            <View style={styles.modalBlurAndroid}>
              {renderCalculatorModal()}
            </View>
          )}
        </Modal>

        {renderGuideModal()}
      </Portal>

      <FAB
        icon="add-chart"
        style={styles.fab}
        color="white"
        onPress={() => Alert.alert('📝 Request Guide', 'Request a new sizing guide for your favorite brand. Feature coming soon!')}
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
  },
  headerGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.9,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginLeft: SPACING.sm,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  filtersContainer: {
    paddingVertical: SPACING.sm,
  },
  filtersContent: {
    paddingHorizontal: SPACING.lg,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  selectedFilter: {
    backgroundColor: COLORS.primary,
  },
  filterLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  selectedFilterLabel: {
    color: 'white',
  },
  categoriesContainer: {
    paddingVertical: SPACING.sm,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.lg,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    minWidth: 120,
  },
  selectedCategory: {
    backgroundColor: COLORS.primary,
  },
  categoryLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  selectedCategoryLabel: {
    color: 'white',
  },
  categoryBadge: {
    backgroundColor: COLORS.primaryLight,
    marginLeft: SPACING.xs,
  },
  selectedCategoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  guidesContainer: {
    paddingBottom: 100,
  },
  guideCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  guideIcon: {
    marginRight: SPACING.md,
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    ...TEXT_STYLES.h4,
    marginBottom: SPACING.xs,
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  categoryText: {
    ...TEXT_STYLES.caption,
  },
  headerRight: {
    alignItems: 'center',
  },
  accuracyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  accuracyText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
  },
  saveButton: {
    margin: 0,
  },
  guideTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.sm,
  },
  guideDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  itemsSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    marginBottom: SPACING.sm,
    color: COLORS.primary,
  },
  itemChip: {
    marginRight: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
  },
  itemText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  sizingPreview: {
    marginBottom: SPACING.md,
  },
  previewTable: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  tableCell: {
    ...TEXT_STYLES.caption,
  },
  moreDataText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  tipsSection: {
    marginBottom: SPACING.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  tipText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  guideStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
  },
  tagText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  recommendButton: {
    marginLeft: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    margin: SPACING.lg,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  clearFiltersButton: {
    marginTop: SPACING.md,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalBlurAndroid: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  modalSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  measurementForm: {
    maxHeight: 300,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  measurementInput: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  calculatorForm: {
    marginBottom: SPACING.lg,
  },
  calculatorInput: {
    marginBottom: SPACING.md,
  },
  helperText: {
    textAlign: 'center',
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
  fullModalContainer: {
    flex: 1,
    margin: SPACING.sm,
    marginTop: 50,
  },
  fullModalContent: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  fullModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  fullModalTitle: {
    flex: 1,
    textAlign: 'center',
  },
  fullModalScroll: {
    flex: 1,
    padding: SPACING.lg,
  },
  fullSizeChart: {
    marginBottom: SPACING.xl,
  },
  fullTableHeader: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    fontSize: 12,
  },
  fullTableCell: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
  },
  fullTipsSection: {
    marginBottom: SPACING.xl,
  },
  fullTipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  fullTipText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default SizingGuides;