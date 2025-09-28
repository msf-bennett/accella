import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Alert,
  RefreshControl,
  Image,
  TextInput,
  Modal,
  Dimensions,
  Platform,
  Vibration,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Searchbar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Design System
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#ffffff',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const { width, height } = Dimensions.get('window');

const ContentCreation = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, theme } = useSelector(state => state.app);
  
  // Animation values
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;
  const scaleValue = useRef(new Animated.Value(0.9)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState('video');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [captionText, setCaptionText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Content types for children
  const contentTypes = [
    { id: 'video', name: 'Training Video', icon: 'videocam', color: COLORS.primary },
    { id: 'photo', name: 'Progress Photo', icon: 'photo-camera', color: COLORS.success },
    { id: 'story', name: 'My Story', icon: 'auto-stories', color: COLORS.warning },
    { id: 'achievement', name: 'Achievement', icon: 'jump-rope', color: '#FFD700' },
  ];

  // Kid-friendly tags
  const availableTags = [
    '💪 Strong', '⚽ Soccer', '🏀 Basketball', '🏊 Swimming', '🏃 Running',
    '🤸 Gymnastics', '🥋 Martial Arts', '🎾 Tennis', '⚾ Baseball', '🏈 Football',
    '🎯 Goal', '🌟 Awesome', '👑 Champion', '🚀 Improving', '🔥 On Fire',
    '💯 Perfect', '🎉 Celebration', '👨‍👩‍👧‍👦 Family', '👥 Team', '🏆 Victory'
  ];

  // Content templates for children
  const templates = [
    {
      id: 1,
      title: 'My Training Day 🌟',
      description: 'Show what you practiced today!',
      icon: 'fitness-center',
      tags: ['💪 Strong', '🎯 Goal'],
      sample: 'Today I practiced my soccer kicks! I scored 8 out of 10 goals! ⚽🎯'
    },
    {
      id: 2,
      title: 'New Skill Learned 🚀',
      description: 'Share a new move you mastered!',
      icon: 'grade',
      tags: ['🌟 Awesome', '🚀 Improving'],
      sample: 'I finally learned how to do a cartwheel! Watch me go! 🤸✨'
    },
    {
      id: 3,
      title: 'Team Spirit 👥',
      description: 'Fun moments with your teammates!',
      icon: 'group',
      tags: ['👥 Team', '🎉 Celebration'],
      sample: 'Our team had so much fun at practice today! We\'re getting stronger together! 💪👥'
    },
    {
      id: 4,
      title: 'Personal Record 🏆',
      description: 'Celebrate your achievements!',
      icon: 'jump-rope',
      tags: ['🏆 Victory', '💯 Perfect'],
      sample: 'New personal best! I ran faster than ever before! So proud of myself! 🏃💨'
    }
  ];

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleContentTypeSelect = (type) => {
    Vibration.vibrate(50);
    setSelectedContentType(type);
    
    if (type === 'video' || type === 'photo') {
      setShowCameraModal(true);
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
      const isSelected = prev.includes(tag);
      if (isSelected) {
        return prev.filter(t => t !== tag);
      } else if (prev.length < 5) { // Limit to 5 tags
        return [...prev, tag];
      }
      return prev;
    });
    Vibration.vibrate(25);
  };

  const startRecording = () => {
    if (isRecording) return;
    
    setIsRecording(true);
    setRecordingDuration(0);
    
    // Simulate recording timer
    const timer = setInterval(() => {
      setRecordingDuration(prev => {
        if (prev >= 30) { // 30 second limit for kids
          clearInterval(timer);
          stopRecording();
          return 30;
        }
        return prev + 1;
      });
    }, 1000);
    
    Vibration.vibrate([100, 50, 100]);
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Simulate media preview
    setMediaPreview({
      type: selectedContentType,
      duration: recordingDuration,
      thumbnail: 'https://via.placeholder.com/300x200/667eea/white?text=Video+Preview'
    });
    setShowCameraModal(false);
    Vibration.vibrate(100);
  };

  const handlePublish = () => {
    if (!captionText.trim()) {
      Alert.alert(
        '✍️ Add a Caption!',
        'Tell us about your awesome content!',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      '🎉 Great Job!',
      'Your content will be shared with your coach and approved by a grown-up first!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share!', 
          style: 'default',
          onPress: () => {
            // Reset form
            setCaptionText('');
            setSelectedTags([]);
            setMediaPreview(null);
            setShowShareModal(true);
            Vibration.vibrate([100, 50, 100, 50, 200]);
          }
        }
      ]
    );
  };

  const renderContentTypeCard = (type) => (
    <TouchableOpacity
      key={type.id}
      onPress={() => handleContentTypeSelect(type.id)}
      style={{ marginRight: SPACING.md }}
    >
      <Surface style={{
        padding: SPACING.lg,
        borderRadius: 20,
        backgroundColor: selectedContentType === type.id ? type.color : COLORS.white,
        elevation: selectedContentType === type.id ? 8 : 3,
        minWidth: 140,
        alignItems: 'center',
      }}>
        <Icon
          name={type.icon}
          size={32}
          color={selectedContentType === type.id ? COLORS.white : type.color}
        />
        <Text style={[
          TEXT_STYLES.caption,
          {
            marginTop: SPACING.sm,
            color: selectedContentType === type.id ? COLORS.white : COLORS.text,
            fontWeight: '600',
            textAlign: 'center',
          }
        ]}>
          {type.name}
        </Text>
      </Surface>
    </TouchableOpacity>
  );

  const renderTagChip = (tag) => (
    <Chip
      key={tag}
      selected={selectedTags.includes(tag)}
      onPress={() => handleTagToggle(tag)}
      style={{
        margin: SPACING.xs,
        backgroundColor: selectedTags.includes(tag) ? COLORS.primary : COLORS.white,
      }}
      textStyle={{
        color: selectedTags.includes(tag) ? COLORS.white : COLORS.text,
        fontSize: 12,
      }}
    >
      {tag}
    </Chip>
  );

  const renderTemplateCard = (template) => (
    <TouchableOpacity
      key={template.id}
      onPress={() => {
        setCaptionText(template.sample);
        setSelectedTags(template.tags);
        setShowTemplatesModal(false);
        Vibration.vibrate(50);
      }}
      style={{ marginBottom: SPACING.md }}
    >
      <Card style={{ backgroundColor: COLORS.white, elevation: 3 }}>
        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
            <Icon name={template.icon} size={24} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.subtitle, { marginLeft: SPACING.sm, flex: 1 }]}>
              {template.title}
            </Text>
          </View>
          <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.sm }]}>
            {template.description}
          </Text>
          <Text style={[TEXT_STYLES.body, { fontStyle: 'italic', color: COLORS.textSecondary }]}>
            "{template.sample}"
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.sm }}>
            {template.tags.map(tag => (
              <Chip
                key={`${template.id}-${tag}`}
                style={{
                  margin: 2,
                  backgroundColor: COLORS.background,
                }}
                textStyle={{ fontSize: 10 }}
              >
                {tag}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: Platform.OS === 'ios' ? 50 : 40,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton
              icon="arrow-back"
              iconColor={COLORS.white}
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Text style={[TEXT_STYLES.title, { color: COLORS.white, marginLeft: SPACING.sm }]}>
              Create & Share 🎨
            </Text>
          </View>
          <IconButton
            icon="help-outline"
            iconColor={COLORS.white}
            size={24}
            onPress={() => Alert.alert(
              '🤔 Need Help?',
              'Ask a grown-up to help you create awesome content safely!',
              [{ text: 'Got it!', style: 'default' }]
            )}
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
        <Animated.View
          style={{
            opacity: fadeIn,
            transform: [
              { translateY: slideUp },
              { scale: scaleValue }
            ],
            padding: SPACING.md,
          }}
        >
          {/* Content Type Selection */}
          <View style={{ marginBottom: SPACING.lg }}>
            <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.md }]}>
              What do you want to create? 🌟
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
            >
              {contentTypes.map(renderContentTypeCard)}
            </ScrollView>
          </View>

          {/* Media Preview */}
          {mediaPreview && (
            <View style={{ marginBottom: SPACING.lg }}>
              <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.md }]}>
                Your Awesome Content! 📸
              </Text>
              <Card style={{ backgroundColor: COLORS.white, elevation: 3 }}>
                <Card.Content style={{ padding: SPACING.md, alignItems: 'center' }}>
                  <Image
                    source={{ uri: mediaPreview.thumbnail }}
                    style={{
                      width: width - 64,
                      height: 200,
                      borderRadius: 12,
                      marginBottom: SPACING.md,
                    }}
                    resizeMode="cover"
                  />
                  {mediaPreview.type === 'video' && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: COLORS.primary,
                      paddingHorizontal: SPACING.md,
                      paddingVertical: SPACING.sm,
                      borderRadius: 20,
                    }}>
                      <Icon name="play-circle-filled" size={20} color={COLORS.white} />
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.white, marginLeft: SPACING.sm }]}>
                        {mediaPreview.duration}s video
                      </Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            </View>
          )}

          {/* Caption Input */}
          <View style={{ marginBottom: SPACING.lg }}>
            <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.md }]}>
              Tell us about it! ✍️
            </Text>
            <Surface style={{
              backgroundColor: COLORS.white,
              borderRadius: 12,
              elevation: 2,
              padding: SPACING.md,
            }}>
              <TextInput
                value={captionText}
                onChangeText={setCaptionText}
                placeholder="Share what makes this special! 🌟"
                multiline
                numberOfLines={4}
                style={[TEXT_STYLES.body, {
                  minHeight: 100,
                  textAlignVertical: 'top',
                }]}
                maxLength={200}
              />
              <Text style={[TEXT_STYLES.caption, {
                textAlign: 'right',
                marginTop: SPACING.sm,
                color: captionText.length > 180 ? COLORS.warning : COLORS.textSecondary,
              }]}>
                {captionText.length}/200
              </Text>
            </Surface>
            <TouchableOpacity
              onPress={() => setShowTemplatesModal(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: SPACING.md,
                padding: SPACING.md,
                backgroundColor: COLORS.white,
                borderRadius: 25,
                elevation: 2,
              }}
            >
              <Icon name="lightbulb-outline" size={20} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.sm, color: COLORS.primary }]}>
                Need ideas? Try our templates! 💡
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tags Selection */}
          <View style={{ marginBottom: SPACING.lg }}>
            <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.md }]}>
              Add fun tags! 🏷️ ({selectedTags.length}/5)
            </Text>
            <Surface style={{
              backgroundColor: COLORS.white,
              borderRadius: 12,
              elevation: 2,
              padding: SPACING.md,
            }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {availableTags.map(renderTagChip)}
              </View>
            </Surface>
          </View>

          {/* Publish Button */}
          {(mediaPreview || captionText.trim()) && (
            <Button
              mode="contained"
              onPress={handlePublish}
              style={{
                backgroundColor: COLORS.success,
                borderRadius: 25,
                paddingVertical: SPACING.sm,
                elevation: 5,
              }}
              labelStyle={[TEXT_STYLES.subtitle, { color: COLORS.white }]}
              icon="send"
            >
              Share My Awesome Content! 🚀
            </Button>
          )}
        </Animated.View>
      </ScrollView>

      {/* Camera Modal */}
      <Portal>
        <Modal
          visible={showCameraModal}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <View style={{ flex: 1, backgroundColor: COLORS.text }}>
            <LinearGradient
              colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.5)']}
              style={{ flex: 1 }}
            >
              {/* Camera Controls */}
              <View style={{
                position: 'absolute',
                top: Platform.OS === 'ios' ? 60 : 40,
                left: SPACING.md,
                right: SPACING.md,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
              }}>
                <IconButton
                  icon="close"
                  iconColor={COLORS.white}
                  size={30}
                  onPress={() => setShowCameraModal(false)}
                />
                <Text style={[TEXT_STYLES.subtitle, { color: COLORS.white }]}>
                  {selectedContentType === 'video' ? '📹 Record Video' : '📸 Take Photo'}
                </Text>
                <IconButton
                  icon="flip-camera-ios"
                  iconColor={COLORS.white}
                  size={26}
                  onPress={() => Vibration.vibrate(50)}
                />
              </View>

              {/* Recording Timer */}
              {isRecording && (
                <View style={{
                  position: 'absolute',
                  top: Platform.OS === 'ios' ? 120 : 100,
                  alignSelf: 'center',
                  backgroundColor: COLORS.error,
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.sm,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  zIndex: 10,
                }}>
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: COLORS.white,
                    marginRight: SPACING.sm,
                  }} />
                  <Text style={[TEXT_STYLES.body, { color: COLORS.white, fontWeight: 'bold' }]}>
                    {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                  </Text>
                </View>
              )}

              {/* Bottom Controls */}
              <View style={{
                position: 'absolute',
                bottom: Platform.OS === 'ios' ? 80 : 60,
                left: 0,
                right: 0,
                alignItems: 'center',
                zIndex: 10,
              }}>
                <TouchableOpacity
                  onPress={selectedContentType === 'video' ? 
                    (isRecording ? stopRecording : startRecording) : 
                    stopRecording
                  }
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: isRecording ? COLORS.error : COLORS.white,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 4,
                    borderColor: COLORS.white,
                  }}
                >
                  <Icon
                    name={selectedContentType === 'video' ? 
                      (isRecording ? 'stop' : 'videocam') : 'photo-camera'
                    }
                    size={32}
                    color={isRecording ? COLORS.white : COLORS.text}
                  />
                </TouchableOpacity>
                <Text style={[TEXT_STYLES.caption, {
                  color: COLORS.white,
                  marginTop: SPACING.sm,
                  textAlign: 'center',
                }]}>
                  {selectedContentType === 'video' ? 
                    (isRecording ? 'Tap to stop (30s max)' : 'Tap to record') : 
                    'Tap to take photo'
                  }
                </Text>
              </View>
            </LinearGradient>
          </View>
        </Modal>

        {/* Templates Modal */}
        <Modal
          visible={showTemplatesModal}
          animationType="slide"
          transparent={true}
        >
          <BlurView
            style={{ flex: 1 }}
            blurType="dark"
            blurAmount={10}
          >
            <View style={{
              flex: 1,
              justifyContent: 'center',
              padding: SPACING.lg,
            }}>
              <Surface style={{
                backgroundColor: COLORS.white,
                borderRadius: 20,
                maxHeight: height * 0.8,
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: SPACING.lg,
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.border,
                }}>
                  <Text style={TEXT_STYLES.title}>
                    Fun Templates! 💡
                  </Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setShowTemplatesModal(false)}
                  />
                </View>
                <ScrollView style={{ maxHeight: height * 0.6, padding: SPACING.lg }}>
                  {templates.map(renderTemplateCard)}
                </ScrollView>
              </Surface>
            </View>
          </BlurView>
        </Modal>

        {/* Success Share Modal */}
        <Modal
          visible={showShareModal}
          animationType="fade"
          transparent={true}
        >
          <BlurView
            style={{ flex: 1 }}
            blurType="light"
            blurAmount={10}
          >
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: SPACING.xl,
            }}>
              <Surface style={{
                backgroundColor: COLORS.white,
                borderRadius: 20,
                padding: SPACING.xl,
                alignItems: 'center',
                elevation: 10,
                minWidth: width * 0.8,
              }}>
                <Icon name="check-circle" size={80} color={COLORS.success} />
                <Text style={[TEXT_STYLES.title, { 
                  textAlign: 'center', 
                  marginVertical: SPACING.lg,
                  color: COLORS.success 
                }]}>
                  Awesome Work! 🎉
                </Text>
                <Text style={[TEXT_STYLES.body, { 
                  textAlign: 'center', 
                  marginBottom: SPACING.lg 
                }]}>
                  Your content is being reviewed by a grown-up and will be shared with your coach soon!
                </Text>
                <Button
                  mode="contained"
                  onPress={() => {
                    setShowShareModal(false);
                    navigation.goBack();
                  }}
                  style={{
                    backgroundColor: COLORS.primary,
                    borderRadius: 25,
                  }}
                >
                  Create More! 🚀
                </Button>
              </Surface>
            </View>
          </BlurView>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          right: SPACING.md,
          bottom: SPACING.md,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => setShowTemplatesModal(true)}
      />
    </View>
  );
};

export default ContentCreation;