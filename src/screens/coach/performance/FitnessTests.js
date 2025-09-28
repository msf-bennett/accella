import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Vibration,
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
  TextInput,
  Menu,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design system constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width, height } = Dimensions.get('window');

// Mock data for fitness tests
const FITNESS_TESTS = [
  {
    id: '1',
    name: '40-Yard Dash',
    category: 'Speed',
    unit: 'seconds',
    description: 'Sprint test measuring acceleration and speed',
    icon: 'speed',
    color: '#FF6B6B',
  },
  {
    id: '2',
    name: 'Vertical Jump',
    category: 'Power',
    unit: 'inches',
    description: 'Measures explosive leg power',
    icon: 'trending-up',
    color: '#4ECDC4',
  },
  {
    id: '3',
    name: 'Bench Press',
    category: 'Strength',
    unit: 'lbs',
    description: 'Upper body strength assessment',
    icon: 'fitness-center',
    color: '#45B7D1',
  },
  {
    id: '4',
    name: 'Mile Run',
    category: 'Endurance',
    unit: 'minutes',
    description: 'Cardiovascular endurance test',
    icon: 'directions-run',
    color: '#96CEB4',
  },
  {
    id: '5',
    name: 'Agility T-Test',
    category: 'Agility',
    unit: 'seconds',
    description: 'Measures change of direction ability',
    icon: 'swap-calls',
    color: '#FFEAA7',
  },
  {
    id: '6',
    name: 'Plank Hold',
    category: 'Core',
    unit: 'seconds',
    description: 'Core stability and endurance',
    icon: 'accessibility',
    color: '#DDA0DD',
  },
];

// Mock player data
const MOCK_PLAYERS = [
  {
    id: '1',
    name: 'John Smith',
    position: 'Forward',
    age: 18,
    avatar: null,
    recentTests: 3,
    improvement: '+12%',
  },
  {
    id: '2',
    name: 'Mike Johnson',
    position: 'Midfielder',
    age: 17,
    avatar: null,
    recentTests: 5,
    improvement: '+8%',
  },
  {
    id: '3',
    name: 'David Wilson',
    position: 'Defender',
    age: 19,
    avatar: null,
    recentTests: 2,
    improvement: '+15%',
  },
];

const FitnessTests = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showTestModal, setShowTestModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [testResult, setTestResult] = useState('');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('tests'); // tests, results, analytics
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  // Filter and search logic
  const filteredTests = FITNESS_TESTS.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(FITNESS_TESTS.map(test => test.category))];

  // Animation setup
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

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Handle test selection
  const handleTestSelect = (test) => {
    setSelectedTest(test);
    setShowTestModal(true);
    Vibration.vibrate(50);
  };

  // Handle recording test result
  const handleRecordResult = (player) => {
    setSelectedPlayer(player);
    setShowResultModal(true);
    setShowTestModal(false);
  };

  // Submit test result
  const submitTestResult = () => {
    if (!testResult.trim()) {
      Alert.alert('Error', 'Please enter a test result');
      return;
    }

    Alert.alert(
      'Success! 🎉',
      `Test result recorded for ${selectedPlayer?.name}\n${selectedTest?.name}: ${testResult} ${selectedTest?.unit}`,
      [{ text: 'OK', onPress: () => {
        setShowResultModal(false);
        setTestResult('');
        setNotes('');
        setSelectedTest(null);
        setSelectedPlayer(null);
      }}]
    );
  };

  // Render test card
  const renderTestCard = (test, index) => (
    <Animated.View
      key={test.id}
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        onPress={() => handleTestSelect(test)}
        activeOpacity={0.7}
      >
        <Card style={{
          marginHorizontal: SPACING.md,
          marginVertical: SPACING.sm,
          elevation: 4,
          borderRadius: 12,
        }}>
          <LinearGradient
            colors={[test.color + '20', test.color + '10']}
            style={{ borderRadius: 12 }}
          >
            <Card.Content style={{ padding: SPACING.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                <Surface style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: test.color,
                  justifyContent: 'center',
                  alignItems: 'center',
                  elevation: 2,
                }}>
                  <Icon name={test.icon} size={24} color="#FFFFFF" />
                </Surface>
                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>
                    {test.name}
                  </Text>
                  <Chip
                    mode="flat"
                    style={{
                      backgroundColor: test.color + '20',
                      alignSelf: 'flex-start',
                      marginTop: SPACING.xs,
                    }}
                    textStyle={{ color: test.color, fontSize: 12 }}
                  >
                    {test.category}
                  </Chip>
                </View>
                <IconButton
                  icon="chevron-right"
                  size={24}
                  iconColor={COLORS.primary}
                />
              </View>
              
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: SPACING.sm }]}>
                {test.description}
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Unit: {test.unit}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="group" size={16} color={COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 4 }]}>
                    {Math.floor(Math.random() * 15) + 5} tested
                  </Text>
                </View>
              </View>
            </Card.Content>
          </LinearGradient>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render player card for test results
  const renderPlayerCard = (player, index) => (
    <TouchableOpacity
      key={player.id}
      onPress={() => handleRecordResult(player)}
      activeOpacity={0.7}
    >
      <Card style={{
        marginHorizontal: SPACING.md,
        marginVertical: SPACING.sm,
        elevation: 2,
      }}>
        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar.Text
              size={50}
              label={player.name.split(' ').map(n => n[0]).join('')}
              style={{ backgroundColor: COLORS.primary }}
            />
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={[TEXT_STYLES.h4, { color: COLORS.text }]}>
                {player.name}
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
                {player.position} • Age {player.age}
              </Text>
              <View style={{ flexDirection: 'row', marginTop: SPACING.xs }}>
                <Chip
                  mode="flat"
                  style={{ backgroundColor: COLORS.success + '20', marginRight: SPACING.xs }}
                  textStyle={{ color: COLORS.success, fontSize: 10 }}
                >
                  {player.recentTests} recent tests
                </Chip>
                <Chip
                  mode="flat"
                  style={{ backgroundColor: COLORS.primary + '20' }}
                  textStyle={{ color: COLORS.primary, fontSize: 10 }}
                >
                  {player.improvement} improvement
                </Chip>
              </View>
            </View>
            <IconButton
              icon="add-circle"
              size={24}
              iconColor={COLORS.success}
            />
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  // Render analytics placeholder
  const renderAnalytics = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }}>
      <Icon name="analytics" size={64} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h3, { color: COLORS.text, marginTop: SPACING.lg, textAlign: 'center' }]}>
        Analytics Dashboard
      </Text>
      <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.md }]}>
        Detailed performance analytics and progress tracking coming soon! 📊
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={{ paddingTop: StatusBar.currentHeight + SPACING.lg }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          paddingHorizontal: SPACING.lg,
          paddingBottom: SPACING.lg 
        }}>
          <View>
            <Text style={[TEXT_STYLES.h1, { color: '#FFFFFF' }]}>
              Fitness Tests 💪
            </Text>
            <Text style={[TEXT_STYLES.body, { color: '#FFFFFF80' }]}>
              Track and analyze performance
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon="sort"
              size={24}
              iconColor="#FFFFFF"
              onPress={() => setMenuVisible(true)}
            />
            <IconButton
              icon="filter-list"
              size={24}
              iconColor="#FFFFFF"
              onPress={() => Alert.alert('Filter', 'Advanced filtering coming soon!')}
            />
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={{ 
          flexDirection: 'row', 
          marginHorizontal: SPACING.lg,
          marginBottom: SPACING.lg,
          backgroundColor: '#FFFFFF20',
          borderRadius: 25,
          padding: 4,
        }}>
          {['tests', 'results', 'analytics'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: SPACING.sm,
                borderRadius: 20,
                backgroundColor: activeTab === tab ? '#FFFFFF' : 'transparent',
              }}
            >
              <Text style={[
                TEXT_STYLES.button,
                { 
                  textAlign: 'center',
                  color: activeTab === tab ? COLORS.primary : '#FFFFFF80'
                }
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Search Bar */}
      {activeTab !== 'analytics' && (
        <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md }}>
          <Searchbar
            placeholder={`Search ${activeTab}...`}
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ elevation: 2 }}
            iconColor={COLORS.primary}
          />
        </View>
      )}

      {/* Category Filter for Tests */}
      {activeTab === 'tests' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm }}
        >
          {categories.map((category) => (
            <Chip
              key={category}
              mode={selectedCategory === category ? 'flat' : 'outlined'}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              style={{
                marginRight: SPACING.sm,
                backgroundColor: selectedCategory === category ? COLORS.primary : 'transparent',
              }}
              textStyle={{
                color: selectedCategory === category ? '#FFFFFF' : COLORS.textSecondary,
              }}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>
      )}

      {/* Content */}
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
        {activeTab === 'tests' && filteredTests.map((test, index) => renderTestCard(test, index))}
        {activeTab === 'results' && MOCK_PLAYERS.map((player, index) => renderPlayerCard(player, index))}
        {activeTab === 'analytics' && renderAnalytics()}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('Add Test', 'Create custom fitness test coming soon! 🚀')}
      />

      {/* Test Selection Modal */}
      <Portal>
        <Modal
          visible={showTestModal}
          onDismiss={() => setShowTestModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.lg,
            borderRadius: 16,
            padding: SPACING.lg,
          }}
        >
          {selectedTest && (
            <>
              <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
                <Surface style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: selectedTest.color,
                  justifyContent: 'center',
                  alignItems: 'center',
                  elevation: 4,
                  marginBottom: SPACING.md,
                }}>
                  <Icon name={selectedTest.icon} size={30} color="#FFFFFF" />
                </Surface>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.text }]}>
                  {selectedTest.name}
                </Text>
                <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center' }]}>
                  {selectedTest.description}
                </Text>
              </View>

              <Text style={[TEXT_STYLES.h4, { color: COLORS.text, marginBottom: SPACING.md }]}>
                Select Player to Test:
              </Text>

              {MOCK_PLAYERS.map((player) => (
                <TouchableOpacity
                  key={player.id}
                  onPress={() => handleRecordResult(player)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: SPACING.md,
                    backgroundColor: COLORS.background,
                    marginBottom: SPACING.sm,
                    borderRadius: 8,
                  }}
                >
                  <Avatar.Text
                    size={40}
                    label={player.name.split(' ').map(n => n[0]).join('')}
                    style={{ backgroundColor: COLORS.primary }}
                  />
                  <View style={{ flex: 1, marginLeft: SPACING.md }}>
                    <Text style={[TEXT_STYLES.h4, { color: COLORS.text }]}>
                      {player.name}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                      {player.position}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ))}
            </>
          )}
        </Modal>
      </Portal>

      {/* Test Result Modal */}
      <Portal>
        <Modal
          visible={showResultModal}
          onDismiss={() => setShowResultModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.lg,
            borderRadius: 16,
            padding: SPACING.lg,
          }}
        >
          {selectedTest && selectedPlayer && (
            <>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.text, textAlign: 'center', marginBottom: SPACING.lg }]}>
                Record Test Result
              </Text>

              <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
                <Avatar.Text
                  size={50}
                  label={selectedPlayer.name.split(' ').map(n => n[0]).join('')}
                  style={{ backgroundColor: COLORS.primary, marginBottom: SPACING.sm }}
                />
                <Text style={[TEXT_STYLES.h4, { color: COLORS.text }]}>
                  {selectedPlayer.name}
                </Text>
                <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
                  {selectedTest.name}
                </Text>
              </View>

              <TextInput
                label={`Result (${selectedTest.unit})`}
                value={testResult}
                onChangeText={setTestResult}
                keyboardType="numeric"
                mode="outlined"
                style={{ marginBottom: SPACING.md }}
              />

              <TextInput
                label="Notes (Optional)"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                mode="outlined"
                style={{ marginBottom: SPACING.lg }}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button
                  mode="outlined"
                  onPress={() => setShowResultModal(false)}
                  style={{ flex: 1, marginRight: SPACING.sm }}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={submitTestResult}
                  style={{ flex: 1, marginLeft: SPACING.sm }}
                  buttonColor={COLORS.success}
                >
                  Save Result
                </Button>
              </View>
            </>
          )}
        </Modal>
      </Portal>

      {/* Sort Menu */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: width - SPACING.lg, y: 100 }}
      >
        <Menu.Item onPress={() => { setSortBy('name'); setMenuVisible(false); }} title="Sort by Name" />
        <Menu.Item onPress={() => { setSortBy('category'); setMenuVisible(false); }} title="Sort by Category" />
        <Menu.Item onPress={() => { setSortBy('recent'); setMenuVisible(false); }} title="Most Recent" />
        <Divider />
        <Menu.Item onPress={() => { setMenuVisible(false); }} title="Export Data" />
      </Menu>
    </View>
  );
};

export default FitnessTests;