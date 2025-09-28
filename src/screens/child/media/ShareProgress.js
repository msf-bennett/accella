import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  Share,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Card,
  Button,
  Text,
  Avatar,
  Surface,
  IconButton,
  Chip,
  ProgressBar,
  Portal,
  Modal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
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
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const ShareProgress = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedProgressType, setSelectedProgressType] = useState('overall');
  const [animatedValue] = useState(new Animated.Value(0));

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const progressData = useSelector(state => state.progress.data);
  const achievements = useSelector(state => state.achievements.badges);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleShareNative = async () => {
    try {
      const result = await Share.share({
        message: `🏆 Check out my training progress! I've completed ${progressData?.completedSessions || 25} sessions and earned ${achievements?.length || 8} achievements! 💪 #FitnessJourney #TrainingProgress`,
        title: 'My Training Progress',
      });
    } catch (error) {
      Alert.alert('Share Error', 'Unable to share progress at this time.');
    }
  };

  const handleShareToCoach = () => {
    Alert.alert(
      'Share with Coach',
      'Your progress has been shared with your coach! 📊',
      [{ text: 'OK' }]
    );
    setShareModalVisible(false);
  };

  const handleShareToParents = () => {
    Alert.alert(
      'Share with Parents',
      'Your amazing progress has been shared with your parents! 🌟',
      [{ text: 'OK' }]
    );
    setShareModalVisible(false);
  };

  const handleShareSocial = (platform) => {
    Alert.alert(
      `Share to ${platform}`,
      `Progress shared to ${platform}! Keep up the great work! 🚀`,
      [{ text: 'OK' }]
    );
    setShareModalVisible(false);
  };

  const generateProgressReport = () => {
    return {
      overall: {
        title: '🎯 Overall Progress',
        completion: 78,
        sessions: 25,
        streak: 12,
        points: 2850,
      },
      fitness: {
        title: '💪 Fitness Level',
        completion: 85,
        improvements: ['Speed +15%', 'Endurance +22%', 'Strength +18%'],
        level: 'Advanced',
      },
      skills: {
        title: '⚽ Skills Progress',
        completion: 72,
        mastered: ['Dribbling', 'Passing', 'Ball Control'],
        learning: ['Free Kicks', 'Headers'],
      },
    };
  };

  const progressReport = generateProgressReport();

  const renderProgressCard = (type, data) => (
    <Animated.View
      style={{
        opacity: animatedValue,
        transform: [{
          translateY: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          }),
        }],
      }}
    >
      <Card style={{ margin: SPACING.md, elevation: 4 }}>
        <LinearGradient
          colors={type === selectedProgressType ? ['#667eea', '#764ba2'] : ['#f8f9fa', '#e9ecef']}
          style={{ borderRadius: 8 }}
        >
          <Card.Content style={{ padding: SPACING.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
              <Text style={[
                TEXT_STYLES.h3,
                { color: type === selectedProgressType ? '#fff' : COLORS.text, flex: 1 }
              ]}>
                {data.title}
              </Text>
              <IconButton
                icon="share-variant"
                iconColor={type === selectedProgressType ? '#fff' : COLORS.primary}
                size={24}
                onPress={() => {
                  setSelectedProgressType(type);
                  setShareModalVisible(true);
                }}
              />
            </View>

            <ProgressBar
              progress={data.completion / 100}
              color={type === selectedProgressType ? '#fff' : COLORS.success}
              style={{ height: 8, borderRadius: 4, marginBottom: SPACING.md }}
            />

            <Text style={[
              TEXT_STYLES.body,
              { color: type === selectedProgressType ? '#fff' : COLORS.text, marginBottom: SPACING.sm }
            ]}>
              {data.completion}% Complete
            </Text>

            {data.sessions && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[TEXT_STYLES.h3, { color: type === selectedProgressType ? '#fff' : COLORS.primary }]}>
                    {data.sessions}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: type === selectedProgressType ? '#fff' : COLORS.textSecondary }]}>
                    Sessions
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[TEXT_STYLES.h3, { color: type === selectedProgressType ? '#fff' : COLORS.accent }]}>
                    {data.streak}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: type === selectedProgressType ? '#fff' : COLORS.textSecondary }]}>
                    Day Streak 🔥
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[TEXT_STYLES.h3, { color: type === selectedProgressType ? '#fff' : COLORS.warning }]}>
                    {data.points}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: type === selectedProgressType ? '#fff' : COLORS.textSecondary }]}>
                    Points ⭐
                  </Text>
                </View>
              </View>
            )}

            {data.improvements && (
              <View style={{ marginTop: SPACING.md }}>
                <Text style={[TEXT_STYLES.body, { color: type === selectedProgressType ? '#fff' : COLORS.text, marginBottom: SPACING.sm }]}>
                  Recent Improvements:
                </Text>
                {data.improvements.map((improvement, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    style={{
                      margin: 2,
                      backgroundColor: type === selectedProgressType ? 'rgba(255,255,255,0.2)' : COLORS.surface,
                    }}
                    textStyle={{ color: type === selectedProgressType ? '#fff' : COLORS.text }}
                  >
                    {improvement}
                  </Chip>
                ))}
              </View>
            )}

            {data.mastered && (
              <View style={{ marginTop: SPACING.md }}>
                <Text style={[TEXT_STYLES.body, { color: type === selectedProgressType ? '#fff' : COLORS.text, marginBottom: SPACING.sm }]}>
                  Skills Mastered:
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {data.mastered.map((skill, index) => (
                    <Chip
                      key={index}
                      icon="check-circle"
                      mode="outlined"
                      style={{
                        margin: 2,
                        backgroundColor: type === selectedProgressType ? 'rgba(255,255,255,0.2)' : COLORS.success + '20',
                      }}
                      textStyle={{ color: type === selectedProgressType ? '#fff' : COLORS.success }}
                    >
                      {skill}
                    </Chip>
                  ))}
                </View>
              </View>
            )}
          </Card.Content>
        </LinearGradient>
      </Card>
    </Animated.View>
  );

  const renderAchievements = () => (
    <Card style={{ margin: SPACING.md, elevation: 4 }}>
      <Card.Content style={{ padding: SPACING.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.h3, { flex: 1 }]}>🏆 Recent Achievements</Text>
          <IconButton
            icon="share-variant"
            iconColor={COLORS.primary}
            size={24}
            onPress={() => setShareModalVisible(true)}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { icon: '🥇', title: 'First Place', desc: 'Sprint Challenge' },
            { icon: '💯', title: 'Perfect Week', desc: '7 Days Complete' },
            { icon: '🚀', title: 'Level Up', desc: 'Reached Level 15' },
            { icon: '⚡', title: 'Speed Demon', desc: 'Personal Best' },
          ].map((achievement, index) => (
            <Surface
              key={index}
              style={{
                padding: SPACING.md,
                margin: SPACING.xs,
                borderRadius: 12,
                minWidth: 120,
                alignItems: 'center',
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 32, marginBottom: SPACING.xs }}>
                {achievement.icon}
              </Text>
              <Text style={[TEXT_STYLES.caption, { fontWeight: '600', textAlign: 'center' }]}>
                {achievement.title}
              </Text>
              <Text style={[TEXT_STYLES.caption, { textAlign: 'center', fontSize: 12 }]}>
                {achievement.desc}
              </Text>
            </Surface>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ paddingTop: 50, paddingBottom: SPACING.lg }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md }}>
          <IconButton
            icon="arrow-left"
            iconColor="#fff"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.h2, { color: '#fff', flex: 1, marginLeft: SPACING.sm }]}>
            Share Progress
          </Text>
          <IconButton
            icon="share"
            iconColor="#fff"
            size={24}
            onPress={handleShareNative}
          />
        </View>

        <View style={{ alignItems: 'center', paddingHorizontal: SPACING.md }}>
          <Avatar.Text
            size={80}
            label={user?.name?.substring(0, 2) || 'PL'}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
          <Text style={[TEXT_STYLES.h3, { color: '#fff', marginTop: SPACING.sm }]}>
            {user?.name || 'Player Name'}
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: '#fff', opacity: 0.9 }]}>
            Show off your amazing progress! 🌟
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        style={{ flex: 1 }}
      >
        {renderProgressCard('overall', progressReport.overall)}
        {renderProgressCard('fitness', progressReport.fitness)}
        {renderProgressCard('skills', progressReport.skills)}
        {renderAchievements()}

        {/* Quick Share Actions */}
        <Card style={{ margin: SPACING.md, elevation: 4 }}>
          <Card.Content style={{ padding: SPACING.lg }}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
              Quick Share 📱
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Button
                mode="outlined"
                icon="account-supervisor"
                onPress={handleShareToCoach}
                style={{ flex: 1, marginHorizontal: SPACING.xs }}
              >
                Coach
              </Button>
              <Button
                mode="outlined"
                icon="heart"
                onPress={handleShareToParents}
                style={{ flex: 1, marginHorizontal: SPACING.xs }}
              >
                Parents
              </Button>
            </View>
          </Card.Content>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Share Modal */}
      <Portal>
        <Modal
          visible={shareModalVisible}
          onDismiss={() => setShareModalVisible(false)}
          contentContainerStyle={{ margin: SPACING.md }}
        >
          <BlurView
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            blurType="light"
            blurAmount={10}
          />
          <Surface style={{ borderRadius: 16, padding: SPACING.lg }}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
              Share Your Progress 🚀
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.lg }}>
              <IconButton
                icon="whatsapp"
                iconColor="#25D366"
                size={40}
                onPress={() => handleShareSocial('WhatsApp')}
                style={{ backgroundColor: '#25D36620' }}
              />
              <IconButton
                icon="instagram"
                iconColor="#E4405F"
                size={40}
                onPress={() => handleShareSocial('Instagram')}
                style={{ backgroundColor: '#E4405F20' }}
              />
              <IconButton
                icon="facebook"
                iconColor="#1877F2"
                size={40}
                onPress={() => handleShareSocial('Facebook')}
                style={{ backgroundColor: '#1877F220' }}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleShareToCoach}
              style={{ marginBottom: SPACING.sm }}
              buttonColor={COLORS.primary}
            >
              Share with Coach 🏃‍♂️
            </Button>

            <Button
              mode="contained"
              onPress={handleShareToParents}
              style={{ marginBottom: SPACING.sm }}
              buttonColor={COLORS.success}
            >
              Share with Parents 👨‍👩‍👧‍👦
            </Button>

            <Button
              mode="outlined"
              onPress={() => setShareModalVisible(false)}
            >
              Cancel
            </Button>
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
};

export default ShareProgress;