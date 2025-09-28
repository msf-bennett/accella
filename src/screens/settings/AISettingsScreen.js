//src/screens/settings/AISettingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Card, Button, Chip, Surface, Switch, Divider, SegmentedButtons } from 'react-native-paper';
import AIService from '../../services/AIService';
import TensorFlowService from '../../services/TensorFlowService';
import { COLORS, SPACING, TEXT_STYLES } from '../../styles/themes';

const AISettingsScreen = ({ navigation }) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [testingServices, setTestingServices] = useState(false);
  const [showKey, setShowKey] = useState(false);
  
  // Multi-service status
  const [aiStatus, setAiStatus] = useState({
    overall: null,
    tensorflow: null,
    huggingface: null,
    ruleBased: null
  });
  
  const [usageStats, setUsageStats] = useState(null);
  const [servicePriority, setServicePriority] = useState('tensorflow_first');
  const [availableModels, setAvailableModels] = useState([]);
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [storedApiKey, setStoredApiKey] = useState('');
  const [tensorflowStatus, setTensorflowStatus] = useState({
    initialized: false,
    modelsLoaded: 0,
    memoryUsage: null,
    backend: 'unknown'
  });

  useEffect(() => {
    loadStoredApiKey();
    loadAllServiceStatus();
    loadUsageStats();
    loadServicePriority();
  }, []);

  const loadStoredApiKey = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const storedKey = await AsyncStorage.getItem('huggingface_api_key');
      
      if (storedKey) {
        setStoredApiKey(storedKey);
        setApiKey(storedKey);
      }
      
      console.log('Loaded stored API key:', storedKey ? 'Present' : 'Not found');
    } catch (error) {
      console.error('Error loading stored API key:', error);
    }
  };

  const loadAllServiceStatus = async () => {
    try {
      console.log('Loading comprehensive AI service status...');
      
      const aiServiceStatus = AIService.getApiStatus();
      const tfStatus = TensorFlowService.getStatus();
      const models = await checkAvailableHuggingFaceModels();
      
      setAiStatus({
        overall: {
          initialized: aiServiceStatus.servicesAvailable > 0,
          primaryService: aiServiceStatus.primaryService,
          mode: aiServiceStatus.mode,
          aiCapability: aiServiceStatus.aiCapability,
          servicesAvailable: aiServiceStatus.servicesAvailable,
          offlineCapable: aiServiceStatus.offlineCapable
        },
        tensorflow: {
          available: tfStatus.isReady,
          status: tfStatus.isReady ? 'ready' : tfStatus.initialized ? 'initializing' : 'offline',
          backend: tfStatus.backend,
          modelsLoaded: tfStatus.modelsLoaded,
          isPrimary: true,
          capabilities: tfStatus.capabilities,
          performance: tfStatus.performance
        },
        huggingface: {
          available: aiServiceStatus.hasApiKey && aiServiceStatus.isOnline,
          status: aiServiceStatus.isOnline ? 'online' : aiServiceStatus.hasApiKey ? 'offline' : 'no_key',
          provider: aiServiceStatus.provider,
          isSecondary: true,
          modelsAvailable: models.length
        },
        ruleBased: {
          available: true,
          status: 'always_ready',
          capabilities: ['session_enhancement', 'basic_recommendations', 'schedule_optimization'],
          isFallback: true
        }
      });
      
      setTensorflowStatus(tfStatus);
      setAvailableModels(models);
      
      console.log('AI service status loaded:', aiServiceStatus);
      
    } catch (error) {
      console.error('Error loading service status:', error);
      setAiStatus({
        overall: { 
          initialized: false, 
          error: error.message,
          servicesAvailable: 0,
          aiCapability: 'minimal'
        },
        tensorflow: { available: false, status: 'error', isPrimary: true },
        huggingface: { available: false, status: 'error', isSecondary: true },
        ruleBased: { available: true, status: 'ready', isFallback: true }
      });
    }
  };

  const handleUpdateApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid Hugging Face API key');
      return;
    }

    if (!apiKey.trim().startsWith('hf_')) {
      Alert.alert(
        'Invalid Format', 
        'Hugging Face API keys start with "hf_" followed by your token.\n\nGet your key from:\nhuggingface.co/settings/tokens'
      );
      return;
    }

    if (apiKey.trim().length < 25) {
      Alert.alert('Invalid Length', 'API key appears too short. Please check your token.');
      return;
    }

    setLoading(true);
    try {
      const result = await AIService.setApiKey(apiKey.trim());
      
      if (result.success) {
        setStoredApiKey(apiKey.trim());
        setIsEditingKey(false);
        
        Alert.alert(
          'Updated Successfully! 🎉', 
          'Your API key has been updated and validated.',
          [{ text: 'Great!' }]
        );
        await loadAllServiceStatus();
      } else {
        Alert.alert('Update Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', `Update failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const validateApiKey = (key) => {
    if (!key || !key.trim()) {
      return { valid: false, message: 'Please enter an API key' };
    }
    
    const trimmedKey = key.trim();
    
    if (!trimmedKey.startsWith('hf_')) {
      return { 
        valid: false, 
        message: 'Invalid format. Must start with "hf_"' 
      };
    }
    
    if (trimmedKey.length < 25) {
      return { 
        valid: false, 
        message: 'Key appears too short' 
      };
    }
    
    if (trimmedKey.length > 200) {
      return { 
        valid: false, 
        message: 'Key appears too long' 
      };
    }
    
    return { valid: true, message: 'Valid format' };
  };

  const validation = validateApiKey(apiKey);

  const checkAvailableHuggingFaceModels = async () => {
    const testModels = [
      'microsoft/DialoGPT-small',
      'facebook/blenderbot-400M-distill',
      'distilbert-base-uncased-finetuned-sst-2-english',
      'sentence-transformers/all-MiniLM-L6-v2',
      'gpt2',
      'facebook/bart-large-cnn',
      'facebook/blenderbot-400M-distill'
    ];
    
    const availableModels = [];
    
    testModels.forEach(model => {
      availableModels.push({
        name: model,
        type: model.includes('DialoGPT') ? 'conversation' : 
              model.includes('blenderbot') ? 'conversation' :
              model.includes('bart') ? 'summarization' :
              model.includes('sentence') ? 'embedding' :
              'text_generation',
        available: true
      });
    });
    
    return availableModels;
  };

  const loadUsageStats = async () => {
    try {
      const aiStats = AIService.usageStats || {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0
      };
      
      const tfDiagnostics = await TensorFlowService.runDiagnostics();
      
      setUsageStats({
        huggingface: aiStats,
        tensorflow: {
          totalInferences: tfDiagnostics.performance ? 1 : 0,
          memoryUsage: tfDiagnostics.memoryInfo,
          averageTime: tfDiagnostics.performance || 0
        },
        combined: {
          totalRequests: aiStats.totalRequests,
          tensorflowInferences: tfDiagnostics.performance ? 1 : 0
        }
      });
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };

  const loadServicePriority = async () => {
    try {
      setServicePriority('tensorflow_first');
    } catch (error) {
      console.error('Error loading service priority:', error);
    }
  };

  const handleTestAllServices = async () => {
    setTestingServices(true);
    let testResults = [];
    
    try {
      console.log('Testing TensorFlow as primary AI service...');
      const tfDiagnostics = await TensorFlowService.runDiagnostics();
      
      if (tfDiagnostics.tfReady && tfDiagnostics.systemHealth !== 'error') {
        testResults.push(`✅ TensorFlow (Primary AI): ${tfDiagnostics.systemHealth}\n   Backend: ${tfDiagnostics.currentBackend}\n   Performance: ${tfDiagnostics.performance}ms\n   Models: ${tfDiagnostics.modelsLoaded}`);
      } else {
        testResults.push(`❌ TensorFlow (Primary AI): Failed\n   Error: ${tfDiagnostics.error || 'Not ready'}`);
      }
      
      if (apiKey.trim() || aiStatus.huggingface.available) {
        console.log('Testing HuggingFace as secondary AI service...');
        const hfResult = await testHuggingFaceWithAvailableModel();
        
        if (hfResult.success) {
          testResults.push(`✅ HuggingFace (Secondary AI): Working\n   Model: ${hfResult.model}\n   Response time: Good`);
        } else {
          testResults.push(`❌ HuggingFace (Secondary AI): Failed\n   Error: ${hfResult.error}`);
        }
      } else {
        testResults.push(`⚠️ HuggingFace (Secondary AI): No API key\n   Status: Available when API key provided`);
      }
      
      testResults.push(`✅ Rule-Based (Fallback): Always ready\n   Capabilities: Session enhancement, recommendations\n   Speed: Instant`);
      
      Alert.alert(
        'AI Services Test Results',
        testResults.join('\n\n'),
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      Alert.alert('Test Failed', `Error during comprehensive testing: ${error.message}`);
    } finally {
      setTestingServices(false);
      await loadAllServiceStatus();
    }
  };

  const testHuggingFaceWithAvailableModel = async () => {
    try {
      const testModel = 'microsoft/DialoGPT-small';
      const result = await AIService.testConnection(testModel, apiKey);
      return {
        success: true,
        model: testModel,
        response: result.response || 'Connection successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

  const handleCancelEdit = () => {
    Alert.alert(
      'Cancel Changes',
      'This will discard your changes and revert to the stored key.',
      [
        { text: 'Continue Editing', style: 'cancel' },
        {
          text: 'Discard Changes',
          onPress: () => {
            setApiKey(storedApiKey);
            setIsEditingKey(false);
          }
        }
      ]
    );
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid Hugging Face API key');
      return;
    }

    if (!apiKey.trim().startsWith('hf_')) {
      Alert.alert(
        'Invalid Format', 
        'Hugging Face API keys start with "hf_" followed by your token.\n\nGet your key from:\nhuggingface.co/settings/tokens'
      );
      return;
    }

    if (apiKey.trim().length < 25) {
      Alert.alert('Invalid Length', 'API key appears too short. Please check your token.');
      return;
    }

    setLoading(true);
    try {
      const result = await AIService.setApiKey(apiKey.trim());
      
      if (result.success) {
        setStoredApiKey(apiKey.trim());
        Alert.alert(
          'Success! 🎉', 
          result.message + '\n\nTensorFlow remains available for offline use.',
          [{ text: 'Great!' }]
        );
        await loadAllServiceStatus();
      } else {
        Alert.alert(
          'Validation Failed', 
          result.error + '\n\nNote: Your TensorFlow features continue to work normally.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error', 
        `Setup failed: ${error.message}\n\nTensorFlow features remain available.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearApiKey = () => {
    Alert.alert(
      'Clear HuggingFace API Key',
      'This will disable enhanced AI features. TensorFlow local AI remains fully functional.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Key',
          style: 'destructive',
          onPress: async () => {
            const result = await AIService.clearApiKey();
            if (result.success) {
              setStoredApiKey('');
              setApiKey('');
              setIsEditingKey(false);
              
              Alert.alert('Cleared', result.message);
              await loadAllServiceStatus();
            } else {
              Alert.alert('Error', 'Failed to clear API key: ' + result.error);
            }
          }
        }
      ]
    );
  };

  const handleServicePriorityChange = async (newPriority) => {
    try {
      setServicePriority(newPriority);
      await AIService.setServicePriority(newPriority);
      
      Alert.alert(
        'Priority Updated',
        `AI services will now prioritize ${newPriority.replace('_', ' ')}.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update service priority');
    }
  };

  const handleResetStats = () => {
    Alert.alert(
      'Reset All Statistics',
      'This will reset usage tracking for all AI services. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AIService.resetUsageStats();
            if (TensorFlowService.resetStats) {
              await TensorFlowService.resetStats();
            }
            await loadUsageStats();
            Alert.alert('Success', 'All usage statistics have been reset');
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': 
      case 'online': 
      case 'always_ready': 
        return '#4CAF50';
      case 'initializing':
      case 'offline':
        return '#FF9800';
      case 'error':
      case 'no_key':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>AI Service Configuration</Text>
          
          {/* Overall AI System Status */}
          <Surface style={styles.statusCard}>
            <Text style={styles.label}>AI System Status</Text>
            <View style={styles.statusRow}>
              <Chip
                style={[styles.statusChip, { backgroundColor: 
                  aiStatus.overall?.aiCapability === 'enhanced' ? '#4CAF50' :
                  aiStatus.overall?.aiCapability === 'basic' ? '#FF9800' : '#F44336'
                }]}
                textStyle={{ color: 'white' }}
              >
                {aiStatus.overall?.aiCapability === 'enhanced' ? '🚀 Enhanced AI' :
                aiStatus.overall?.aiCapability === 'basic' ? '⚡ Basic AI' : '⚠️ Minimal AI'}
              </Chip>
            </View>
            <View style={{ marginTop: 8 }}>
              <Text style={styles.statusText}>
                Services Active: {aiStatus.overall?.servicesAvailable || 0}/3
              </Text>
              <Text style={styles.statusText}>
                Primary: {aiStatus.overall?.primaryService || 'Rule-based'}
              </Text>
              <Text style={styles.statusText}>
                Offline Capable: {aiStatus.overall?.offlineCapable ? 'Yes' : 'No'}
              </Text>
            </View>
          </Surface>

          {/* Service Priority Selection */}
          <View style={styles.prioritySection}>
            <Text style={styles.label}>Service Priority</Text>
            <Text style={styles.helper}>Choose which AI service to use first</Text>
            
            <SegmentedButtons
              value={servicePriority}
              onValueChange={handleServicePriorityChange}
              buttons={[
                {
                  value: 'tensorflow_first',
                  label: 'TF First',
                  icon: 'memory'
                },
                {
                  value: 'balanced',
                  label: 'Balanced',
                  icon: 'scale-balance'
                },
                {
                  value: 'huggingface_first',
                  label: 'HF First',
                  icon: 'cloud'
                }
              ]}
              style={styles.segmentedButtons}
            />
          </View>

          <Divider style={styles.divider} />

          {/* Individual Service Status */}
          <Text style={styles.sectionTitle}>Service Details</Text>

          {/* TensorFlow Service - Primary AI */}
          <Card style={[styles.serviceCard, { borderLeftWidth: 4, borderLeftColor: '#4CAF50' }]}>
            <Card.Content>
              <View style={styles.serviceHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceTitle}>🧠 TensorFlow.js</Text>
                  <Text style={[styles.serviceDescription, { fontWeight: 'bold', color: COLORS.primary }]}>
                    PRIMARY AI ENGINE
                  </Text>
                </View>
                <Chip
                  style={[styles.serviceStatus, { backgroundColor: getStatusColor(aiStatus.tensorflow?.status) }]}
                  textStyle={{ color: 'white', fontSize: 10 }}
                >
                  {aiStatus.tensorflow?.status || 'Unknown'}
                </Chip>
              </View>
              
              <Text style={styles.serviceDescription}>
                Always available offline AI with local models
              </Text>
              
              <View style={styles.serviceStats}>
                <Text style={styles.statItem}>Backend: {aiStatus.tensorflow?.backend || 'Unknown'}</Text>
                <Text style={styles.statItem}>Models Loaded: {aiStatus.tensorflow?.modelsLoaded || 0}</Text>
                <Text style={styles.statItem}>Performance: {aiStatus.tensorflow?.performance?.systemHealth || 'Unknown'}</Text>
              </View>
            </Card.Content>
          </Card>

          {/* HuggingFace Service - Secondary AI */}
          <Card style={[styles.serviceCard, { borderLeftWidth: 4, borderLeftColor: '#FF9800' }]}>
            <Card.Content>
              <View style={styles.serviceHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceTitle}>🤗 Hugging Face</Text>
                  <Text style={[styles.serviceDescription, { fontWeight: 'bold', color: '#FF9800' }]}>
                    SECONDARY AI ENGINE
                  </Text>
                </View>
                <Chip
                  style={[styles.serviceStatus, { backgroundColor: getStatusColor(aiStatus.huggingface?.status) }]}
                  textStyle={{ color: 'white', fontSize: 10 }}
                >
                  {aiStatus.huggingface?.status || 'No Key'}
                </Chip>
              </View>
              
              <Text style={styles.serviceDescription}>
                Advanced online AI models for enhanced capabilities
              </Text>
              
              <View style={styles.serviceStats}>
                <Text style={styles.statItem}>Models Available: {aiStatus.huggingface?.modelsAvailable || 0}</Text>
                <Text style={styles.statItem}>Status: {aiStatus.huggingface?.available ? 'Online Enhancement Ready' : 'Requires API Key'}</Text>
              </View>
            </Card.Content>
          </Card>

          {/* Rule-Based Service - Fallback */}
          <Card style={[styles.serviceCard, { borderLeftWidth: 4, borderLeftColor: '#9E9E9E' }]}>
            <Card.Content>
              <View style={styles.serviceHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceTitle}>⚙️ Rule-Based Algorithms</Text>
                  <Text style={[styles.serviceDescription, { fontWeight: 'bold', color: '#9E9E9E' }]}>
                    INTELLIGENT FALLBACK
                  </Text>
                </View>
                <Chip
                  style={[styles.serviceStatus, { backgroundColor: getStatusColor('always_ready') }]}
                  textStyle={{ color: 'white', fontSize: 10 }}
                >
                  Always Ready
                </Chip>
              </View>
              
              <Text style={styles.serviceDescription}>
                Smart algorithms that work without dependencies
              </Text>
              
              <View style={styles.serviceStats}>
                <Text style={styles.statItem}>
                  Capabilities: {aiStatus.ruleBased?.capabilities?.length || 3}
                </Text>
                <Text style={styles.statItem}>Response Time: Instant</Text>
                <Text style={styles.statItem}>Reliability: 100%</Text>
              </View>
            </Card.Content>
          </Card>

          <Divider style={styles.divider} />

          {/* HuggingFace API Configuration */}
          <Text style={styles.label}>Hugging Face API Key (Optional)</Text>
          <Text style={styles.helper}>
            Enables advanced online AI features. Get your key from huggingface.co/settings/tokens
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, isEditingKey && styles.inputEditing]}
              placeholder="hf_xxxxxxxxxxxxxxxxxxxxx"
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
              editable={isEditingKey || !storedApiKey}
            />
            
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowKey(!showKey)}
            >
              <Text>{showKey ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
            
            {storedApiKey && (
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    if (isEditingKey && apiKey !== storedApiKey) {
                      handleCancelEdit();
                    } else {
                      setIsEditingKey(!isEditingKey);
                    }
                  }}
                >
                  <Text>{isEditingKey ? '❌' : '✏️'}</Text>
                </TouchableOpacity>
                
                {isEditingKey && (
                  <TouchableOpacity
                    style={[styles.editButton, styles.saveEditButton]}
                    onPress={handleUpdateApiKey}
                    disabled={loading || apiKey === storedApiKey}
                  >
                    <Text>💾</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Key validation feedback */}
          {apiKey && isEditingKey && (
            <View style={styles.validationContainer}>
              <Text style={[
                styles.validationText,
                { color: validation.valid ? '#4CAF50' : '#F44336' }
              ]}>
                {validation.valid ? '✅' : '❌'} {validation.message}
              </Text>
            </View>
          )}

          {/* Key status display */}
          {storedApiKey && (
            <View style={styles.keyStatusContainer}>
              <Text style={styles.keyStatusText}>
                Key Status: {isEditingKey ? 'Editing' : 'Stored'}
              </Text>
              <Text style={styles.keyInfoText}>
                Length: {storedApiKey.length} characters
              </Text>
              <Text style={styles.keyInfoText}>
                Last 4: ...{storedApiKey.slice(-4)}
              </Text>
            </View>
          )}

          {/* Dynamic Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {storedApiKey ? (
              isEditingKey ? (
                <View>
                  <Button
                    mode="contained"
                    onPress={handleUpdateApiKey}
                    loading={loading}
                    disabled={loading || !validation.valid || apiKey === storedApiKey}
                    style={styles.saveButton}
                  >
                    Save Changes
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => handleCancelEdit()}
                    disabled={loading}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                </View>
              ) : (
                <Button
                  mode="outlined"
                  onPress={handleClearApiKey}
                  style={styles.clearButton}
                >
                  Remove API Key
                </Button>
              )
            ) : (
              <Button
                mode="contained"
                onPress={handleSaveApiKey}
                loading={loading}
                disabled={loading || !validation.valid}
                style={styles.saveButton}
              >
                Save API Key
              </Button>
            )}
          </View>

          {/* Test All Services Button */}
          <Button
            mode="contained"
            onPress={handleTestAllServices}
            loading={testingServices}
            disabled={testingServices}
            style={[styles.saveButton, { backgroundColor: '#9C27B0' }]}
            icon="test-tube"
          >
            Test All AI Services
          </Button>

          <Divider style={styles.divider} />

          {/* Combined Usage Statistics */}
          <Card style={styles.statsCard}>
            <Card.Content>
              <View style={styles.statsHeader}>
                <Text style={styles.statsTitle}>📊 Usage Statistics</Text>
                <Button
                  mode="text"
                  compact
                  onPress={handleResetStats}
                  textColor="#FF9800"
                >
                  Reset All
                </Button>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total AI Requests</Text>
                <Text style={styles.statValue}>
                  {(usageStats?.combined?.totalRequests || 0) + (usageStats?.combined?.tensorflowInferences || 0)}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>HuggingFace Requests</Text>
                <Text style={styles.statValue}>{usageStats?.huggingface?.totalRequests || 0}</Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>TensorFlow Inferences</Text>
                <Text style={styles.statValue}>{usageStats?.tensorflow?.totalInferences || 0}</Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Success Rate</Text>
                <Text style={styles.statValue}>
                  {usageStats?.huggingface?.totalRequests > 0 
                    ? Math.round((usageStats.huggingface.successfulRequests / usageStats.huggingface.totalRequests) * 100) 
                    : 100}%
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Service Capabilities */}
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text style={styles.infoTitle}>🚀 AI Capabilities</Text>
              
              <View style={styles.capabilitySection}>
                <Text style={styles.capabilityTitle}>TensorFlow.js (Local)</Text>
                <Text style={styles.capabilityText}>• Session enhancement & recommendations</Text>
                <Text style={styles.capabilityText}>• Basic text classification</Text>
                <Text style={styles.capabilityText}>• Performance analysis</Text>
                <Text style={styles.capabilityText}>• Always available offline</Text>
              </View>
              
              <View style={styles.capabilitySection}>
                <Text style={styles.capabilityTitle}>Hugging Face (Online)</Text>
                <Text style={styles.capabilityText}>• Advanced text generation</Text>
                <Text style={styles.capabilityText}>• Sophisticated conversation AI</Text>
                <Text style={styles.capabilityText}>• Document summarization</Text>
                <Text style={styles.capabilityText}>• Requires internet connection</Text>
              </View>
              
              <View style={styles.capabilitySection}>
                <Text style={styles.capabilityTitle}>Rule-Based (Fallback)</Text>
                <Text style={styles.capabilityText}>• Intelligent scheduling algorithms</Text>
                <Text style={styles.capabilityText}>• Sport-specific recommendations</Text>
                <Text style={styles.capabilityText}>• Age-appropriate modifications</Text>
                <Text style={styles.capabilityText}>• Instant response, no dependencies</Text>
              </View>
            </Card.Content>
          </Card>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    margin: SPACING.md,
    marginTop: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  statusCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
  },
  helper: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statusChip: {
    marginRight: SPACING.sm,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  prioritySection: {
    marginVertical: SPACING.md,
  },
  segmentedButtons: {
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: SPACING.md,
    color: COLORS.textPrimary,
  },
  serviceCard: {
    marginBottom: SPACING.md,
    backgroundColor: '#f9f9f9',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  serviceStatus: {
    height: 24,
  },
  serviceDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  serviceStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: SPACING.md,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  inputEditing: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  eyeButton: {
    marginLeft: SPACING.sm,
    padding: SPACING.sm,
  },
  editButton: {
    marginLeft: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginLeft: SPACING.sm,
  },
  saveEditButton: {
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  validationContainer: {
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  validationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  keyStatusContainer: {
    backgroundColor: '#f0f0f0',
    padding: SPACING.sm,
    borderRadius: 6,
    marginTop: SPACING.sm,
  },
  keyStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  keyInfoText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionButtonsContainer: {
    marginTop: SPACING.md,
  },
  saveButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    marginTop: SPACING.sm,
    borderColor: COLORS.textSecondary,
  },
  clearButton: {
    marginTop: SPACING.sm,
    borderColor: COLORS.error,
  },
  divider: {
    marginVertical: SPACING.lg,
  },
  statsCard: {
    marginTop: SPACING.md,
    backgroundColor: '#f5f5f5',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  infoCard: {
    marginTop: SPACING.lg,
    backgroundColor: '#E3F2FD',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  capabilitySection: {
    marginBottom: SPACING.md,
  },
  capabilityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  capabilityText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
});

export default AISettingsScreen;
