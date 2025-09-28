import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  Alert,
  Animated,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Modal,
  Vibration,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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
} from 'react-native-paper';
import { BlurView } from '@react-native-blur/blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const EquipmentGuide = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const userProgress = useSelector(state => state.progress.equipmentGuide);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [completedItems, setCompletedItems] = useState(new Set());
  const [currentPoints, setCurrentPoints] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Equipment categories and data
  const equipmentCategories = [
    { id: 'all', name: 'All Equipment', icon: 'sports', color: COLORS.primary },
    { id: 'football', name: 'Football ⚽', icon: 'sports-soccer', color: '#4CAF50' },
    { id: 'basketball', name: 'Basketball 🏀', icon: 'sports-basketball', color: '#FF9800' },
    { id: 'tennis', name: 'Tennis 🎾', icon: 'sports-tennis', color: '#2196F3' },
    { id: 'swimming', name: 'Swimming 🏊', icon: 'pool', color: '#00BCD4' },
    { id: 'running', name: 'Running 🏃', icon: 'directions-run', color: '#9C27B0' },
    { id: 'safety', name: 'Safety Gear 🛡️', icon: 'security', color: '#F44336' },
  ];

  const equipmentData = [
    {
      id: 1,
      name: 'Football Boots',
      category: 'football',
      description: 'Special shoes with studs for better grip on the field',
      importance: 'Essential for playing football safely',
      tips: [
        'Choose the right size - not too tight or loose',
        'Different studs for different field types',
        'Clean after each use to maintain grip',
        'Replace when studs wear down'
      ],
      safety: 'Prevents slipping and injuries on the field',
      icon: '👟',
      difficulty: 'beginner',
      points: 10,
      funFact: 'The first football boots were made in 1526!',
      image: 'https://via.placeholder.com/300x200/4CAF50/ffffff?text=Football+Boots',
    },
    {
      id: 2,
      name: 'Shin Guards',
      category: 'football',
      description: 'Protective gear worn under socks to protect your shins',
      importance: 'Required by FIFA rules for all players',
      tips: [
        'Must cover the entire shin area',
        'Choose lightweight but strong materials',
        'Ensure proper fit with ankle guards',
        'Replace if cracked or damaged'
      ],
      safety: 'Protects against kicks and impacts during play',
      icon: '🛡️',
      difficulty: 'beginner',
      points: 15,
      funFact: 'Shin guards became mandatory in football in 1990!',
      image: 'https://via.placeholder.com/300x200/F44336/ffffff?text=Shin+Guards',
    },
    {
      id: 3,
      name: 'Basketball Shoes',
      category: 'basketball',
      description: 'High-top shoes designed for court sports',
      importance: 'Provides ankle support and court grip',
      tips: [
        'High-tops protect your ankles',
        'Choose non-marking soles for indoor courts',
        'Ensure good cushioning for jumping',
        'Tie laces properly for support'
      ],
      safety: 'Reduces ankle injuries and improves performance',
      icon: '👟',
      difficulty: 'beginner',
      points: 10,
      funFact: 'Michael Jordan made basketball shoes a fashion statement!',
      image: 'https://via.placeholder.com/300x200/FF9800/ffffff?text=Basketball+Shoes',
    },
    {
      id: 4,
      name: 'Tennis Racket',
      category: 'tennis',
      description: 'Tool used to hit the tennis ball',
      importance: 'The most important equipment for tennis',
      tips: [
        'Choose right weight for your age and strength',
        'Keep strings at proper tension',
        'Use overgrip for better hold',
        'Store in a case to protect from damage'
      ],
      safety: 'Proper grip prevents wrist injuries',
      icon: '🎾',
      difficulty: 'intermediate',
      points: 20,
      funFact: 'Tennis rackets used to be made of wood until the 1980s!',
      image: 'https://via.placeholder.com/300x200/2196F3/ffffff?text=Tennis+Racket',
    },
    {
      id: 5,
      name: 'Swimming Goggles',
      category: 'swimming',
      description: 'Eye protection for swimming',
      importance: 'Essential for clear underwater vision',
      tips: [
        'Adjust straps for comfort, not tightness',
        'Anti-fog coating helps with clarity',
        'Rinse with fresh water after use',
        'Different tints for indoor/outdoor pools'
      ],
      safety: 'Protects eyes from chlorine and improves vision',
      icon: '🥽',
      difficulty: 'beginner',
      points: 10,
      funFact: 'Swimming goggles were invented in the 14th century!',
      image: 'https://via.placeholder.com/300x200/00BCD4/ffffff?text=Swimming+Goggles',
    },
    {
      id: 6,
      name: 'Running Shoes',
      category: 'running',
      description: 'Specialized footwear for running activities',
      importance: 'Prevents injuries and improves performance',
      tips: [
        'Replace every 300-500 miles',
        'Choose based on your foot type',
        'Break in gradually with short runs',
        'Keep a training log of shoe usage'
      ],
      safety: 'Reduces impact on joints and prevents injuries',
      icon: '🏃',
      difficulty: 'beginner',
      points: 10,
      funFact: 'The first running shoe was created in 1895!',
      image: 'https://via.placeholder.com/300x200/9C27B0/ffffff?text=Running+Shoes',
    },
    {
      id: 7,
      name: 'Helmet',
      category: 'safety',
      description: 'Head protection for contact sports',
      importance: 'Critical for preventing head injuries',
      tips: [
        'Must fit snugly but not too tight',
        'Check for cracks before each use',
        'Replace after any significant impact',
        'Follow sport-specific safety standards'
      ],
      safety: 'Protects against concussions and head trauma',
      icon: '⛑️',
      difficulty: 'beginner',
      points: 25,
      funFact: 'Modern helmets can reduce head injury risk by 85%!',
      image: 'https://via.placeholder.com/300x200/F44336/ffffff?text=Safety+Helmet',
    },
    {
      id: 8,
      name: 'Water Bottle',
      category: 'all',
      description: 'Essential hydration equipment for all sports',
      importance: 'Prevents dehydration during training',
      tips: [
        'Drink before you feel thirsty',
        'Clean regularly to prevent bacteria',
        'Choose BPA-free materials',
        'Bring extra for long training sessions'
      ],
      safety: 'Maintains proper hydration levels',
      icon: '💧',
      difficulty: 'beginner',
      points: 5,
      funFact: 'Your body is 60% water - stay hydrated!',
      image: 'https://via.placeholder.com/300x200/00BCD4/ffffff?text=Water+Bottle',
    },
  ];

  // Filter equipment based on search and category
  const filteredEquipment = equipmentData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate progress
  const totalItems = equipmentData.length;
  const completedCount = completedItems.size;
  const progressPercentage = (completedCount / totalItems) * 100;

  useEffect(() => {
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
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

  useEffect(() => {
    // Update points when items are completed
    const newPoints = Array.from(completedItems).reduce((total, itemId) => {
      const item = equipmentData.find(eq => eq.id === itemId);
      return total + (item ? item.points : 0);
    }, 0);
    setCurrentPoints(newPoints);

    // Check for achievements
    if (completedCount === 5 && completedCount > 0) {
      setShowAchievement(true);
      Vibration.vibrate(200);
    }
  }, [completedItems]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const markAsLearned = (itemId) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
      Vibration.vibrate(100);
    }
    setCompletedItems(newCompleted);
  };

  const openEquipmentDetail = (equipment) => {
    setSelectedEquipment(equipment);
    setShowEquipmentModal(true);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return COLORS.primary;
    }
  };

  const renderEquipmentCard = ({ item }) => {
    const isCompleted = completedItems.has(item.id);
    const categoryInfo = equipmentCategories.find(cat => cat.id === item.category);
    
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          marginBottom: SPACING.md,
        }}
      >
        <Card
          style={{
            marginHorizontal: SPACING.sm,
            elevation: 4,
            borderRadius: 16,
            backgroundColor: isCompleted ? '#E8F5E8' : '#FFFFFF',
          }}
          onPress={() => openEquipmentDetail(item)}
        >
          <LinearGradient
            colors={isCompleted ? ['#4CAF50', '#81C784'] : ['#667eea', '#764ba2']}
            style={{
              height: 120,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: SPACING.xs }}>{item.icon}</Text>
            <Text style={[TEXT_STYLES.h3, { color: '#FFFFFF', textAlign: 'center' }]}>
              {item.name}
            </Text>
            {isCompleted && (
              <View style={{
                position: 'absolute',
                top: 10,
                right: 10,
                backgroundColor: '#4CAF50',
                borderRadius: 15,
                width: 30,
                height: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Icon name="check" size={20} color="#FFFFFF" />
              </View>
            )}
          </LinearGradient>

          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Chip
                mode="outlined"
                style={{ backgroundColor: categoryInfo?.color + '20' }}
                textStyle={{ color: categoryInfo?.color, fontSize: 12 }}
              >
                {categoryInfo?.name}
              </Chip>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: '#FFD700', fontWeight: 'bold' }]}>
                  {item.points} pts
                </Text>
              </View>
            </View>

            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm, color: '#666' }]}>
              {item.description}
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Chip
                mode="flat"
                style={{ 
                  backgroundColor: getDifficultyColor(item.difficulty) + '20',
                }}
                textStyle={{ color: getDifficultyColor(item.difficulty), fontSize: 11 }}
              >
                {item.difficulty.toUpperCase()}
              </Chip>
              
              <Button
                mode={isCompleted ? "contained" : "outlined"}
                onPress={() => markAsLearned(item.id)}
                style={{ borderRadius: 20 }}
                buttonColor={isCompleted ? '#4CAF50' : undefined}
                textColor={isCompleted ? '#FFFFFF' : COLORS.primary}
                compact
              >
                {isCompleted ? '✓ Learned' : 'Mark as Learned'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const renderCategoryChip = (category) => (
    <TouchableOpacity
      key={category.id}
      onPress={() => {
        setSelectedCategory(category.id);
        Vibration.vibrate(50);
      }}
      style={{ marginRight: SPACING.sm }}
    >
      <Surface
        style={{
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm,
          borderRadius: 20,
          elevation: selectedCategory === category.id ? 8 : 2,
          backgroundColor: selectedCategory === category.id ? category.color : '#FFFFFF',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon 
            name={category.icon} 
            size={20} 
            color={selectedCategory === category.id ? '#FFFFFF' : category.color} 
          />
          <Text style={[
            TEXT_STYLES.caption,
            {
              marginLeft: SPACING.xs,
              color: selectedCategory === category.id ? '#FFFFFF' : category.color,
              fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
            }
          ]}>
            {category.name}
          </Text>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderEquipmentModal = () => {
    if (!selectedEquipment) return null;

    return (
      <Modal
        visible={showEquipmentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEquipmentModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={{ paddingTop: 50, paddingBottom: SPACING.lg }}
          >
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: SPACING.lg,
            }}>
              <Text style={[TEXT_STYLES.h2, { color: '#FFFFFF', flex: 1 }]}>
                {selectedEquipment.name}
              </Text>
              <IconButton
                icon="close"
                iconColor="#FFFFFF"
                size={24}
                onPress={() => setShowEquipmentModal(false)}
              />
            </View>
          </LinearGradient>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.lg }}>
            <Card style={{ marginBottom: SPACING.lg, elevation: 4 }}>
              <View style={{
                height: 200,
                backgroundColor: '#E3F2FD',
                justifyContent: 'center',
                alignItems: 'center',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}>
                <Text style={{ fontSize: 80 }}>{selectedEquipment.icon}</Text>
              </View>
              
              <Card.Content style={{ padding: SPACING.lg }}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.primary }]}>
                  What is it? 🤔
                </Text>
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.lg, lineHeight: 24 }]}>
                  {selectedEquipment.description}
                </Text>

                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.primary }]}>
                  Why is it important? ⭐
                </Text>
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.lg, lineHeight: 24 }]}>
                  {selectedEquipment.importance}
                </Text>

                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.primary }]}>
                  Safety First! 🛡️
                </Text>
                <Surface style={{
                  padding: SPACING.md,
                  borderRadius: 12,
                  backgroundColor: '#FFF3E0',
                  marginBottom: SPACING.lg,
                }}>
                  <Text style={[TEXT_STYLES.body, { color: '#E65100', lineHeight: 20 }]}>
                    {selectedEquipment.safety}
                  </Text>
                </Surface>

                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.primary }]}>
                  Pro Tips! 💡
                </Text>
                {selectedEquipment.tips.map((tip, index) => (
                  <View key={index} style={{ flexDirection: 'row', marginBottom: SPACING.sm }}>
                    <Text style={[TEXT_STYLES.body, { color: '#4CAF50', marginRight: SPACING.sm }]}>
                      {index + 1}.
                    </Text>
                    <Text style={[TEXT_STYLES.body, { flex: 1, lineHeight: 20 }]}>
                      {tip}
                    </Text>
                  </View>
                ))}

                <Surface style={{
                  padding: SPACING.md,
                  borderRadius: 12,
                  backgroundColor: '#E8F5E8',
                  marginTop: SPACING.lg,
                }}>
                  <Text style={[TEXT_STYLES.caption, { color: '#2E7D32', fontStyle: 'italic' }]}>
                    🎉 Fun Fact: {selectedEquipment.funFact}
                  </Text>
                </Surface>
              </Card.Content>
            </Card>

            <Button
              mode="contained"
              onPress={() => {
                markAsLearned(selectedEquipment.id);
                setShowEquipmentModal(false);
              }}
              style={{
                borderRadius: 25,
                paddingVertical: SPACING.xs,
                marginBottom: SPACING.xl,
              }}
              buttonColor={completedItems.has(selectedEquipment.id) ? '#4CAF50' : COLORS.primary}
            >
              {completedItems.has(selectedEquipment.id) ? '✓ Learned!' : `Learn & Earn ${selectedEquipment.points} Points!`}
            </Button>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const renderAchievementModal = () => (
    <Modal
      visible={showAchievement}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowAchievement(false)}
    >
      <BlurView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        blurType="light"
        blurAmount={10}
      >
        <Surface style={{
          padding: SPACING.xl,
          borderRadius: 20,
          elevation: 10,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          margin: SPACING.xl,
        }}>
          <Text style={{ fontSize: 60, marginBottom: SPACING.md }}>🏆</Text>
          <Text style={[TEXT_STYLES.h2, { color: '#FFD700', marginBottom: SPACING.sm }]}>
            Amazing Progress!
          </Text>
          <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginBottom: SPACING.lg }]}>
            You've learned about 5 pieces of equipment! Keep going, champion! 🌟
          </Text>
          <Button
            mode="contained"
            onPress={() => setShowAchievement(false)}
            buttonColor="#FFD700"
            textColor="#000000"
            style={{ borderRadius: 25 }}
          >
            Continue Learning!
          </Button>
        </Surface>
      </BlurView>
    </Modal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Header with progress */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: 50,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
        }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: SPACING.md,
          }}>
            <Text style={[TEXT_STYLES.h1, { color: '#FFFFFF' }]}>
              Equipment Guide 🎯
            </Text>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.caption, { color: '#FFFFFF' }]}>Your Points</Text>
              <Text style={[TEXT_STYLES.h2, { color: '#FFD700' }]}>
                {currentPoints} ⭐
              </Text>
            </View>
          </View>

          <Text style={[TEXT_STYLES.body, { color: '#FFFFFF', opacity: 0.9, marginBottom: SPACING.md }]}>
            Learn about sports equipment to become a better athlete! 🚀
          </Text>

          <Surface style={{
            padding: SPACING.md,
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.2)',
            marginBottom: SPACING.md,
          }}>
            <Text style={[TEXT_STYLES.caption, { color: '#FFFFFF', marginBottom: SPACING.xs }]}>
              Progress: {completedCount}/{totalItems} items learned
            </Text>
            <ProgressBar
              progress={progressPercentage / 100}
              color="#FFD700"
              style={{ height: 8, borderRadius: 4 }}
            />
          </Surface>
        </Animated.View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={{ padding: SPACING.md }}>
        <Searchbar
          placeholder="Search equipment... 🔍"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            elevation: 4,
            borderRadius: 25,
            backgroundColor: '#FFFFFF',
          }}
          iconColor={COLORS.primary}
          inputStyle={{ fontSize: 16 }}
        />
      </View>

      {/* Category Filter */}
      <View style={{ marginBottom: SPACING.md }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING.md }}
        >
          {equipmentCategories.map(renderCategoryChip)}
        </ScrollView>
      </View>

      {/* Equipment List */}
      <FlatList
        data={filteredEquipment}
        renderItem={renderEquipmentCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        ListEmptyComponent={() => (
          <Surface style={{
            margin: SPACING.lg,
            padding: SPACING.xl,
            borderRadius: 16,
            elevation: 2,
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 48, marginBottom: SPACING.md }}>🔍</Text>
            <Text style={[TEXT_STYLES.h3, { color: '#666', marginBottom: SPACING.sm }]}>
              No equipment found
            </Text>
            <Text style={[TEXT_STYLES.body, { color: '#999', textAlign: 'center' }]}>
              Try adjusting your search or category filter
            </Text>
          </Surface>
        )}
      />

      {/* Quick Actions FAB */}
      <FAB
        icon="lightbulb"
        label="Get Tips"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 80,
          backgroundColor: COLORS.secondary,
        }}
        color="#FFFFFF"
        onPress={() => {
          Alert.alert(
            "Equipment Tips! 💡",
            "• Always check equipment before use\n• Keep equipment clean and dry\n• Ask your coach if unsure about sizing\n• Safety equipment is never optional!",
            [{ text: "Got it!", style: "default" }]
          );
        }}
      />

      {/* Achievement Floating Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          backgroundColor: '#FFD700',
          borderRadius: 25,
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm,
          elevation: 8,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        onPress={() => {
          Alert.alert(
            "Your Achievements! 🏆",
            `Equipment Learned: ${completedCount}/${totalItems}\nTotal Points: ${currentPoints}\n\nKeep learning to unlock more achievements!`,
            [{ text: "Awesome!", style: "default" }]
          );
        }}
      >
        <Icon name="jump-rope" size={20} color="#000000" />
        <Text style={{
          marginLeft: SPACING.xs,
          fontWeight: 'bold',
          color: '#000000',
          fontSize: 14,
        }}>
          {completedCount}/{totalItems}
        </Text>
      </TouchableOpacity>

      {/* Modals */}
      <Portal>
        {renderEquipmentModal()}
        {renderAchievementModal()}
      </Portal>
    </View>
  );
};

// Screen options for navigation
EquipmentGuide.screenOptions = {
  title: 'Equipment Guide',
  headerShown: false,
};

export default EquipmentGuide;