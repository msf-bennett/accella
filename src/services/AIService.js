//src/services/AIService.js
import axios from 'axios';
import { HfInference } from '@huggingface/inference';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TensorFlowService from './TensorFlowService';
import SecureStorage from '../utils/SecureStorage';

class AIService {
  constructor() {
    this.initialized = false;
    this.apiKey = null;
    this.hfInference = null;
    this.isOnline = false;
    this.fallbackMode = true;
    this.rateLimitCounter = 0;
    this.rateLimitReset = null;
    this.requestQueue = [];
    this.isProcessingQueue = false;
    
    // NEW: Multi-service architecture
    this.servicePriority = 'tensorflow_first'; // tensorflow_first, huggingface_first, balanced
    this.serviceStatus = {
      tensorflow: { available: false, initialized: false },
      huggingface: { available: false, initialized: false },
      ruleBased: { available: true, initialized: true }
    };
    
    // UPDATED: Better model selection for HuggingFace
    // Replace your models object in the AIService constructor with this improved version:

// Emergency fix: Replace your models object in AIService.js with these models that might still work

    this.models = {
      // Try smaller, more reliable models
      textGeneration: 'distilgpt2',
      conversation: 'microsoft/DialoGPT-medium', 
      
      // Backup options that often have providers available
      textGenerationBackup: 'gpt2-medium',
      conversationBackup: 'facebook/blenderbot_small-90M',
      
      // These typically still work during outages
      sentiment: 'distilbert-base-uncased-finetuned-sst-2-english',
      questionAnswering: 'distilbert-base-cased-distilled-squad',
      summarization: 'sshleifer/distilbart-cnn-12-6',
      embedding: 'sentence-transformers/all-MiniLM-L6-v2',
      
      // Very lightweight alternatives
      lightweightText: 'facebook/opt-125m',
      tinyModel: 'EleutherAI/gpt-neo-125M'

      // AVOID: These often have inference provider issues
      // gpt2: 'gpt2', // Remove this - has provider issues
      // flan: 'google/flan-t5-base' // Also problematic
    };
    
    this.sportsKnowledge = {
      soccer: {
        keySkills: ['ball control', 'passing', 'shooting', 'defending', 'dribbling'],
        ageProgression: {
          '4-6': { focus: 'fun', duration: 30, complexity: 'very_simple' },
          '7-9': { focus: 'basic_skills', duration: 45, complexity: 'simple' },
          '10-12': { focus: 'technique', duration: 60, complexity: 'moderate' },
          '13-15': { focus: 'tactics', duration: 75, complexity: 'advanced' },
          '16+': { focus: 'performance', duration: 90, complexity: 'professional' }
        },
        equipment: ['balls', 'cones', 'goals', 'bibs', 'ladders'],
        safetyConsiderations: ['proper warm-up', 'hydration', 'age-appropriate contact']
      },
      basketball: {
        keySkills: ['dribbling', 'shooting', 'passing', 'defense', 'rebounding'],
        ageProgression: {
          '6-8': { focus: 'coordination', duration: 30, complexity: 'basic' },
          '9-11': { focus: 'fundamentals', duration: 45, complexity: 'simple' },
          '12-14': { focus: 'skills', duration: 60, complexity: 'moderate' },
          '15-17': { focus: 'strategy', duration: 75, complexity: 'advanced' },
          '18+': { focus: 'competition', duration: 90, complexity: 'elite' }
        },
        equipment: ['basketballs', 'cones', 'hoops', 'ladders'],
        safetyConsiderations: ['ankle support', 'proper footwork', 'collision awareness']
      }
    };
    
    this.offlineCapabilities = {
      planEnhancement: true,
      sessionPersonalization: true,
      smartScheduling: true,
      progressTracking: true,
      basicCoaching: true
    };

    this.initialize();
  }

async initialize() {
  try {
    console.log('AIService: Starting multi-service initialization...');
    
    // Load stored settings and service priority
    await this.loadStoredSettings();
    
    // PRIORITY 1: Initialize TensorFlow service first (always available)
    console.log('AIService: Initializing TensorFlow as primary service...');
    await this.initializeTensorFlowService();
    
    // PRIORITY 2: Initialize HuggingFace if API key exists
    if (this.apiKey) {
      console.log('AIService: Initializing HuggingFace as secondary service...');
      await this.initializeHuggingFaceService();
    } else {
      console.log('AIService: No HuggingFace API key found, skipping online AI');
    }
    
    // PRIORITY 3: Rule-based is always available as fallback
    this.serviceStatus.ruleBased = { available: true, initialized: true };
    
    this.initialized = true;
    console.log('AIService: Multi-service initialization complete');
    
    return {
      success: true,
      services: this.getServiceSummary(),
      primaryService: this.getPrimaryService(),
      capabilities: this.getAvailableCapabilities()
    };
    
  } catch (error) {
    console.error('AIService: Initialization error:', error);
    this.fallbackMode = true;
    this.initialized = true;
    
    return {
      success: true, // Continue with fallback
      services: { ruleBased: true },
      primaryService: 'ruleBased',
      error: error.message
    };
  }
}


async initializeTensorFlowService() {
  try {
    console.log('AIService: Initializing TensorFlow as primary AI service...');
    const result = await TensorFlowService.initialize();
    
    this.serviceStatus.tensorflow = {
      available: result.success,
      initialized: result.success,
      backend: result.backend,
      modelsLoaded: result.modelsLoaded,
      capabilities: result.capabilities,
      isPrimary: true
    };
    
    if (result.success) {
      console.log('AIService: TensorFlow ready as primary AI service');
      this.fallbackMode = false; // TensorFlow available, not in fallback
    } else {
      console.warn('AIService: TensorFlow initialization failed, will use enhanced fallback');
      this.serviceStatus.tensorflow.available = false;
    }
    
    return result;
  } catch (error) {
    console.error('AIService: TensorFlow initialization failed:', error);
    this.serviceStatus.tensorflow = { 
      available: false, 
      initialized: false, 
      error: error.message,
      isPrimary: true
    };
  }
}

  // UPDATED: Better HuggingFace initialization
  async initializeHuggingFaceService() {
    try {
      console.log('AIService: Initializing HuggingFace service...');
      
      if (this.apiKey) {
        this.hfInference = new HfInference(this.apiKey);
        const isValid = await this.validateHuggingFaceConnection();
        
        this.serviceStatus.huggingface = {
          available: isValid,
          initialized: isValid,
          hasApiKey: true
        };
        
        if (isValid) {
          this.isOnline = true;
          this.fallbackMode = false;
          console.log('AIService: HuggingFace service ready');
        }
      }
    } catch (error) {
      console.error('AIService: HuggingFace initialization failed:', error);
      this.serviceStatus.huggingface = { available: false, initialized: false };
    }
  }

  // NEW: Validate HuggingFace with reliable models
// Replace your validateHuggingFaceConnection method with this improved version:
async validateHuggingFaceConnection() {
  try {
    console.log('AIService: Validating HuggingFace as secondary AI service...');
    
    // Check if it's a widespread infrastructure issue
    let allModelsFailedWithNoProvider = true;
    let providerAvailable = false;
    
    // Try primary model first
    const primaryModel = this.models.textGeneration;
    let response = await this.testModelConnection(primaryModel);
    
    if (response.success) {
      this.usageStats.successfulRequests++;
      await this.saveSettings();
      console.log(`AIService: HuggingFace validated with ${primaryModel}`);
      return true;
    } else if (!response.error?.includes('No Inference Provider')) {
      allModelsFailedWithNoProvider = false;
    }
    
    console.log(`AIService: Primary model ${primaryModel} failed, trying backup...`);
    
    // Try backup models
    const modelsToTry = [
      'distilgpt2',
      'facebook/blenderbot_small-90M', 
      'distilbert-base-uncased-finetuned-sst-2-english',
      'sshleifer/distilbart-cnn-12-6'
    ];
    
    for (const model of modelsToTry) {
      response = await this.testModelConnection(model);
      
      if (response.success) {
        // Update to use working model
        this.models.textGeneration = model;
        this.usageStats.successfulRequests++;
        await this.saveSettings();
        console.log(`AIService: HuggingFace validated with working model: ${model}`);
        return true;
      } else if (!response.error?.includes('No Inference Provider')) {
        allModelsFailedWithNoProvider = false;
      }
    }
    
    // If all models failed due to no providers, it's infrastructure issue
    if (allModelsFailedWithNoProvider) {
      console.log('AIService: HuggingFace infrastructure issue detected - no providers available');
      console.log('AIService: This is temporary and will resolve when HF infrastructure recovers');
      
      // Still mark as "available" but with infrastructure warning
      this.serviceStatus.huggingface = {
        available: false,
        initialized: true,
        hasApiKey: true,
        infrastructureIssue: true,
        status: 'provider_outage',
        message: 'HuggingFace inference providers temporarily unavailable'
      };
      
      return false; // But continue with TensorFlow
    }
    
    console.warn('AIService: All HuggingFace models failed validation');
    return false;
    
  } catch (error) {
    console.warn('AIService: HuggingFace validation failed:', error.message);
    this.handleAPIError(error);
    return false;
  }
}

// Add this helper method:
async testModelConnection(modelName) {
  try {
    const response = await this.hfInference.textGeneration({
      model: modelName,
      inputs: 'Hello',
      parameters: {
        max_length: 15,
        temperature: 0.1,
        do_sample: false
      }
    });
    
    if (response && (response.generated_text !== undefined || response[0]?.generated_text !== undefined)) {
      return { 
        success: true, 
        model: modelName, 
        response: response.generated_text || response[0]?.generated_text 
      };
    }
    
    return { success: false, error: 'No valid response from model' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

getBestServiceForTask(task) {
  const primaryService = this.getPrimaryService();
  
  if (primaryService === 'balanced') {
    // Task-specific intelligent routing
    switch (task) {
      case 'session_enhancement':
      case 'schedule_optimization':
      case 'text_classification':
        // TensorFlow is better for these structured tasks
        return this.serviceStatus.tensorflow.available ? 'tensorflow' : 'huggingface';
      
      case 'text_generation':
      case 'conversation':
      case 'creative_content':
        // HuggingFace is better for generative tasks
        return this.serviceStatus.huggingface.available ? 'huggingface' : 'tensorflow';
      
      case 'coaching_tips':
      case 'basic_analysis':
        // Both services work well, prefer TensorFlow for offline capability
        return this.serviceStatus.tensorflow.available ? 'tensorflow' : 'ruleBased';
      
      default:
        return this.serviceStatus.tensorflow.available ? 'tensorflow' : 'ruleBased';
    }
  }
  
  return primaryService;
}

  // NEW: Service priority management
  async setServicePriority(priority) {
    this.servicePriority = priority;
    await AsyncStorage.setItem('ai_service_priority', priority);
    console.log(`AIService: Priority set to ${priority}`);

    // Add this right after the AsyncStorage.setItem line in setApiKey:
console.log('AIService: API key stored, verifying...');
const storedKey = await AsyncStorage.getItem('huggingface_api_key');
console.log('AIService: Verification - stored key exists:', !!storedKey);
console.log('AIService: Verification - key length:', storedKey?.length);

  }

  

  // NEW: Get primary service based on availability and priority
  getPrimaryService() {
    switch (this.servicePriority) {
      case 'tensorflow_first':
        if (this.serviceStatus.tensorflow.available) return 'tensorflow';
        if (this.serviceStatus.huggingface.available) return 'huggingface';
        return 'ruleBased';
      
      case 'huggingface_first':
        if (this.serviceStatus.huggingface.available) return 'huggingface';
        if (this.serviceStatus.tensorflow.available) return 'tensorflow';
        return 'ruleBased';
      
      case 'balanced':
        // Use the best service for the task
        if (this.serviceStatus.tensorflow.available && this.serviceStatus.huggingface.available) {
          return 'balanced'; // Will choose per task
        }
        if (this.serviceStatus.tensorflow.available) return 'tensorflow';
        if (this.serviceStatus.huggingface.available) return 'huggingface';
        return 'ruleBased';
      
      default:
        return 'ruleBased';
    }
  }

  // NEW: Choose best service for specific task
  getBestServiceForTask(task) {
    const primaryService = this.getPrimaryService();
    
    if (primaryService === 'balanced') {
      // Task-specific routing
      switch (task) {
        case 'session_enhancement':
        case 'schedule_optimization':
          return this.serviceStatus.tensorflow.available ? 'tensorflow' : 'huggingface';
        
        case 'text_generation':
        case 'conversation':
          return this.serviceStatus.huggingface.available ? 'huggingface' : 'tensorflow';
        
        default:
          return this.serviceStatus.tensorflow.available ? 'tensorflow' : 'ruleBased';
      }
    }
    
    return primaryService;
  }

// Replace the existing loadStoredSettings method with this:
async loadStoredSettings() {
  try {
    console.log('AIService: Loading stored settings...');
    
    // Use AsyncStorage directly like your login screen does
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    // Load API key directly from AsyncStorage (no encryption for now to debug)
    const apiKey = await AsyncStorage.getItem('huggingface_api_key');
    this.apiKey = apiKey;
    
    // Load other settings
    const settings = await AsyncStorage.multiGet([
      'ai_preferences',
      'ai_usage_stats', 
      'ai_service_priority'
    ]);
    
    this.preferences = settings[0][1] ? JSON.parse(settings[0][1]) : {};
    this.usageStats = settings[1][1] ? JSON.parse(settings[1][1]) : {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0
    };
    this.servicePriority = settings[2][1] || 'tensorflow_first';
    
    console.log(`AIService: Settings loaded. API key: ${apiKey ? 'Present' : 'Not found'}`);
    
  } catch (error) {
    console.warn('Failed to load AI settings:', error);
    this.preferences = {};
    this.usageStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0
    };
    this.servicePriority = 'tensorflow_first';
  }
}

  async saveSettings() {
    try {
      await AsyncStorage.multiSet([
        ['ai_preferences', JSON.stringify(this.preferences)],
        ['ai_usage_stats', JSON.stringify(this.usageStats)]
      ]);
    } catch (error) {
      console.warn('Failed to save AI settings:', error);
    }
  }

  async validateConnection() {
    try {
      console.log('AIService: Validating connection...');
      
      const response = await this.hfInference.textGeneration({
        model: this.models.textGeneration,
        inputs: 'Test connection',
        parameters: {
          max_length: 20,
          temperature: 0.1
        }
      });
      
      if (response && response.generated_text) {
        this.isOnline = true;
        this.fallbackMode = false;
        console.log('AIService: Connection validated');
        
        this.usageStats.successfulRequests++;
        await this.saveSettings();
        
        return true;
      }
      
    } catch (error) {
      console.warn('AIService: Connection validation failed:', error.message);
      this.handleAPIError(error);
      return false;
    }
  }

// Replace your setApiKey method in AIService.js with this version that has proper debugging:
async setApiKey(apiKey, testModel = null) {
  try {
    console.log('AIService: Setting Hugging Face API key...');
    
    // Safe logging - only show length and format validation
    const keyLength = apiKey?.length || 0;
    const startsWithHf = apiKey?.startsWith('hf_') || false;
    console.log('AIService: Key length:', keyLength);
    console.log('AIService: Key starts with hf_:', startsWithHf);
    
    if (!apiKey || !apiKey.trim().startsWith('hf_')) {
      console.log('AIService: Invalid API key format detected');
      return { success: false, error: 'Invalid API key format. Must start with "hf_"' };
    }

    const trimmedKey = apiKey.trim();
    
    // TEMPORARILY SKIP VALIDATION TO TEST STORAGE
    console.log('AIService: Skipping validation, testing storage directly...');
    
    try {
      // Store directly in AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      console.log('AIService: About to store key...');
      
      await AsyncStorage.setItem('huggingface_api_key', trimmedKey);
      console.log('AIService: AsyncStorage.setItem completed');
      
      // Immediately verify storage - safely check without exposing key
      const storedKey = await AsyncStorage.getItem('huggingface_api_key');
      const storedKeyExists = !!storedKey;
      const keysMatch = storedKey === trimmedKey;
      
      console.log('AIService: Verification - stored key exists:', storedKeyExists);
      console.log('AIService: Verification - key matches:', keysMatch);
      
      // Check localStorage but don't log the actual key value
      const browserStorageHasKey = !!localStorage.getItem('huggingface_api_key');
      console.log('AIService: Browser localStorage has key:', browserStorageHasKey);
      
      if (keysMatch) {
        this.apiKey = trimmedKey;
        this.serviceStatus.huggingface = { 
          available: true, 
          initialized: true, 
          hasApiKey: true,
          lastValidated: new Date().toISOString()
        };
        
        console.log('AIService: Key stored successfully');
        console.log('AIService: Service status updated:', {
          available: true,
          initialized: true,
          hasApiKey: true
        });
        
        return { 
          success: true, 
          message: 'API key stored successfully! (Validation skipped for testing)'
        };
      } else {
        console.log('AIService: Storage verification failed - keys do not match');
        return { success: false, error: 'Storage verification failed' };
      }
      
    } catch (storageError) {
      console.error('AIService: Storage error occurred:', storageError.name);
      console.error('AIService: Storage error message:', storageError.message);
      return { success: false, error: 'Failed to store API key: ' + storageError.message };
    }
    
  } catch (error) {
    console.error('AIService: API key setup failed:', error.name);
    console.error('AIService: Error message:', error.message);
    return { success: false, error: error.message };
  }
}
  // NEW: Test connection with specific model
  async testConnection(modelName, apiKey) {
    try {
      const testInference = new HfInference(apiKey);
      
      const response = await testInference.textGeneration({
        model: modelName,
        inputs: 'Test',
        parameters: {
          max_length: 10,
          temperature: 0.1,
          do_sample: false
        }
      });
      
      if (response && (response.generated_text !== undefined || response[0]?.generated_text !== undefined)) {
        return {
          success: true,
          model: modelName,
          response: response.generated_text || response[0]?.generated_text || 'Success'
        };
      }
      
      return { success: false, error: 'No valid response received' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

// Add this new public method right after setApiKey
async clearApiKey() {
  try {
    // Use AsyncStorage directly like the rest of your code
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem('huggingface_api_key');
    
    this.apiKey = null;
    this.hfInference = null;
    this.serviceStatus.huggingface = { 
      available: false, 
      initialized: false, 
      hasApiKey: false 
    };
    
    console.log('AIService: API key cleared successfully');
    return { success: true, message: 'API key cleared. Using TensorFlow-only mode.' };
  } catch (error) {
    console.error('Failed to clear API key:', error);
    return { success: false, error: error.message };
  }
}

// Add this new method to AIService.js
// Replace your testHuggingFaceKey method in AIService.js with this improved version:
async testHuggingFaceKey(apiKey) {
  try {
    console.log('AIService: Testing Hugging Face API key...');
    
    // Try models with better inference availability
    const testEndpoints = [
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-small',
      'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english',
      'https://api-inference.huggingface.co/models/distilgpt2',
      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill'
    ];
    
    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: "Hello, how are you?",
            parameters: {
              max_length: 20,
              temperature: 0.7,
              do_sample: true
            }
          })
        });

        // Handle different response codes
        if (response.status === 401) {
          return { success: false, error: 'Invalid API key - please check your token from huggingface.co' };
        }
        
        if (response.status === 403) {
          return { success: false, error: 'API key lacks required permissions' };
        }
        
        if (response.status === 503) {
          console.log('AIService: Model is loading, key appears valid');
          return { 
            success: true, 
            message: 'API key validated (model loading)',
            modelStatus: 'loading',
            endpoint: endpoint
          };
        }
        
        if (response.status === 429) {
          return { success: false, error: 'Rate limit reached - please try again later' };
        }

        if (response.status === 404) {
          console.log(`Model endpoint ${endpoint} not found, trying next...`);
          continue; // Try next endpoint
        }

        if (!response.ok) {
          console.log(`Endpoint ${endpoint} failed with ${response.status}, trying next...`);
          continue; // Try next endpoint
        }

        const data = await response.json();
        
        // Check for valid response formats
        if (Array.isArray(data) && data.length > 0) {
          const firstResult = data[0];
          if (firstResult.generated_text !== undefined || firstResult.label !== undefined) {
            console.log('AIService: HuggingFace API key validated successfully');
            return { 
              success: true, 
              message: 'API key validated successfully',
              testResult: firstResult,
              endpoint: endpoint,
              workingModel: endpoint.split('/').pop()
            };
          }
        }

        if (data.generated_text !== undefined || data.label !== undefined) {
          return { 
            success: true, 
            message: 'API key validated successfully',
            testResult: data,
            endpoint: endpoint,
            workingModel: endpoint.split('/').pop()
          };
        }

        console.log(`Endpoint ${endpoint} returned unexpected format, trying next...`);
        
      } catch (endpointError) {
        console.log(`Endpoint ${endpoint} failed:`, endpointError.message);
        continue; // Try next endpoint
      }
    }

    return { success: false, error: 'All test endpoints failed - API may be temporarily unavailable' };
    
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
      return { success: false, error: 'Network error - please check your internet connection' };
    }
    
    console.error('HuggingFace key test failed:', error);
    return { success: false, error: error.message };
  }
}

// Add this method to check current status
getApiStatus() {
  const primaryService = this.getPrimaryService();
  const servicesAvailable = Object.values(this.serviceStatus).filter(s => s.available).length;
  
  return {
    hasApiKey: !!this.apiKey,
    isOnline: this.isOnline,
    mode: this.fallbackMode ? 'offline-first' : 'hybrid',
    provider: this.getProviderInfo(),
    services: this.serviceStatus,
    primaryService: primaryService,
    servicePriority: this.servicePriority,
    servicesAvailable: servicesAvailable,
    aiCapability: servicesAvailable > 1 ? 'enhanced' : servicesAvailable === 1 ? 'basic' : 'minimal',
    offlineCapable: this.serviceStatus.tensorflow?.available || this.serviceStatus.ruleBased?.available,
    
    // NEW: Infrastructure status info
    infrastructureStatus: {
      huggingfaceOutage: this.serviceStatus.huggingface?.infrastructureIssue || false,
      tensorflowHealthy: this.serviceStatus.tensorflow?.available || false,
      fallbackAvailable: this.serviceStatus.ruleBased?.available || false
    }
  };
}

  // NEW: Get provider information
  getProviderInfo() {
    const providers = [];
    if (this.serviceStatus.tensorflow.available) providers.push('tensorflow');
    if (this.serviceStatus.huggingface.available) providers.push('huggingface');
    if (this.serviceStatus.ruleBased.available) providers.push('rule-based');
    return providers.join(' + ');
  }

  // NEW: Get service summary
  getServiceSummary() {
    return {
      tensorflow: this.serviceStatus.tensorflow.available,
      huggingface: this.serviceStatus.huggingface.available,
      ruleBased: this.serviceStatus.ruleBased.available,
      total: Object.values(this.serviceStatus).filter(s => s.available).length
    };
  }

  // NEW: Get available capabilities
  getAvailableCapabilities() {
    const capabilities = { ...this.offlineCapabilities };
    
    if (this.serviceStatus.tensorflow.available) {
      capabilities.localAI = true;
      capabilities.fastInference = true;
      capabilities.offlineAI = true;
    }
    
    if (this.serviceStatus.huggingface.available) {
      capabilities.advancedAI = true;
      capabilities.textGeneration = true;
      capabilities.conversationAI = true;
    }
    
    return capabilities;
  }

// Add this method to AIService.js
async enhanceExtractedSessions(sessions, context) {
  try {
    console.log('AIService: Enhancing sessions with structure awareness');
    
    if (!this.isOnline && !this.tensorflowAvailable) {
      console.log('AIService: Using rule-based enhancement with structure awareness');
      return this.enhanceSessionsWithStructureRules(sessions, context);
    }

    // Try TensorFlow first, then HuggingFace, then rules
    if (this.tensorflowAvailable) {
      return await this.enhanceSessionsWithTensorFlow(sessions, context);
    } else if (this.isOnline) {
      return await this.enhanceSessionsWithHuggingFace(sessions, context);
    } else {
      return this.enhanceSessionsWithStructureRules(sessions, context);
    }
    
  } catch (error) {
    console.error('AIService: Session enhancement failed, using rules:', error);
    return this.enhanceSessionsWithStructureRules(sessions, context);
  }
}

// NEW: Structure-aware rule-based enhancement
enhanceSessionsWithStructureRules(sessions, context) {
  const { structureContext } = context;
  
  return sessions.map(weekSession => {
    const enhancedWeek = { ...weekSession };
    
    // Enhance based on structure analysis
    if (structureContext) {
      enhancedWeek.structureScore = structureContext.organizationLevel.score;
      enhancedWeek.confidenceLevel = this.calculateConfidenceFromStructure(structureContext);
      
      // Adjust session details based on structure insights
      enhancedWeek.dailySessions = weekSession.dailySessions.map(session => 
        this.enhanceSessionWithStructureInsights(session, structureContext, context)
      );
    }
    
    return enhancedWeek;
  });
}

enhanceSessionWithStructureInsights(session, structureContext, context) {
  const enhanced = { ...session };
  
  // Duration enhancement based on document analysis
  if (structureContext.durationAnalysis.hasDurationInfo) {
    const avgDuration = structureContext.durationAnalysis.averageDuration;
    if (avgDuration && Math.abs(session.duration - avgDuration) > 30) {
      enhanced.duration = avgDuration;
      enhanced.durationAdjusted = true;
      enhanced.originalDuration = session.duration;
    }
  }
  
  // Focus enhancement based on sport and structure
  if (structureContext.organizationLevel.level === 'highly_structured') {
    enhanced.confidence = 'high';
    enhanced.structureQuality = 'excellent';
  } else {
    enhanced.confidence = 'moderate';
    enhanced.structureQuality = 'basic';
  }
  
  // Add structure-derived recommendations
  enhanced.recommendations = this.generateStructureBasedRecommendations(
    session, 
    structureContext, 
    context
  );
  
  return enhanced;
}

generateStructureBasedRecommendations(session, structureContext, context) {
  const recommendations = [];
  
  // Recommendations based on organization level
  switch (structureContext.organizationLevel.level) {
    case 'highly_structured':
      recommendations.push('Well-organized session - follow document structure closely');
      break;
    case 'moderately_structured':
      recommendations.push('Good structure - consider adding warm-up/cool-down if missing');
      break;
    case 'basic_structure':
      recommendations.push('Basic structure - enhance with progressive difficulty');
      break;
    default:
      recommendations.push('Limited structure - follow sport-specific training principles');
  }
  
  // Duration-based recommendations
  if (structureContext.durationAnalysis.hasDurationInfo) {
    if (session.duration > 120) {
      recommendations.push('Long session - ensure adequate rest periods');
    } else if (session.duration < 45) {
      recommendations.push('Short session - focus on high-intensity activities');
    }
  }
  
  // Day-specific recommendations
  if (structureContext.dayStructure.hasSpecificDays) {
    recommendations.push('Document specifies training days - maintain consistent schedule');
  }
  
  return recommendations;
}

calculateConfidenceFromStructure(structureContext) {
  const { organizationLevel } = structureContext;
  
  switch (organizationLevel.level) {
    case 'highly_structured': return 0.95;
    case 'moderately_structured': return 0.80;
    case 'basic_structure': return 0.65;
    default: return 0.50;
  }
}

// NEW: Structure-aware document analysis enhancement
async enhanceDocumentStructureAnalysis(structureAnalysis, text) {
  try {
    console.log('AIService: Enhancing structure analysis with AI');
    
    if (this.tensorflowAvailable) {
      return await this.enhanceStructureWithTensorFlow(structureAnalysis, text);
    } else if (this.isOnline) {
      return await this.enhanceStructureWithHuggingFace(structureAnalysis, text);
    } else {
      return this.enhanceStructureWithRules(structureAnalysis, text);
    }
    
  } catch (error) {
    console.warn('AI structure enhancement failed:', error);
    return this.enhanceStructureWithRules(structureAnalysis, text);
  }
}

enhanceStructureWithRules(structureAnalysis, text) {
  const insights = [];
  
  // Analyze document completeness
  if (structureAnalysis.weekStructure.totalWeeks >= 12) {
    insights.push('Comprehensive training program with full seasonal planning');
  } else if (structureAnalysis.weekStructure.totalWeeks >= 4) {
    insights.push('Solid training block suitable for skill development phase');
  } else {
    insights.push('Short-term training plan - good for intensive skill focus');
  }
  
  // Analyze session distribution
  if (structureAnalysis.sessionStructure.hasStructuredSessions) {
    insights.push('Well-structured sessions with clear progression');
  }
  
  // Analyze day patterns
  if (structureAnalysis.dayStructure.weeklyPattern === 'weekdays_only') {
    insights.push('School-friendly schedule focusing on weekday training');
  } else if (structureAnalysis.dayStructure.weeklyPattern === 'full_week') {
    insights.push('Intensive training schedule including weekends');
  }
  
  return { insights };
}

  // Add this method to your AIService class (in AIService.js)

// ============= OPTIMAL SCHEDULE GENERATION =============

async generateOptimalSchedule(trainingPlan, preferences = {}) {
  if (!this.initialized) {
    await this.initialize();
  }

  try {
    console.log('AIService: Generating optimal schedule...');
    
    if (this.isOnline && !this.fallbackMode) {
      return await this.generateScheduleWithAI(trainingPlan, preferences);
    } else {
      return await this.generateScheduleWithFallback(trainingPlan, preferences);
    }
  } catch (error) {
    console.error('AIService: Schedule generation failed:', error);
    return await this.generateScheduleWithFallback(trainingPlan, preferences);
  }
}

async generateScheduleWithAI(trainingPlan, preferences) {
  try {
    const prompt = this.createSchedulePrompt(trainingPlan, preferences);
    
    const response = await this.queueRequest({
      model: this.models.planGeneration,
      inputs: prompt,
      parameters: {
        max_length: 300,
        temperature: 0.6,
        do_sample: true,
        top_p: 0.8
      }
    });

    const schedule = this.parseScheduleResponse(response.generated_text, trainingPlan, preferences);
    
    return {
      ...schedule,
      aiGenerated: true,
      aiProvider: 'huggingface',
      confidence: this.calculateConfidence(response.generated_text)
    };

  } catch (error) {
    console.warn('AI schedule generation failed, using fallback:', error);
    return await this.generateScheduleWithFallback(trainingPlan, preferences);
  }
}

async generateScheduleWithFallback(trainingPlan, preferences = {}) {
  console.log('AIService: Using fallback schedule generation');
  
  const defaultPreferences = {
    availableDays: ['monday', 'wednesday', 'friday'],
    preferredTime: '16:00',
    sessionDuration: 90,
    intensity: 'moderate',
    weeksCount: 12,
    sessionsPerWeek: 3
  };

  const prefs = { ...defaultPreferences, ...preferences };
  const schedule = this.createOptimalSessionSchedule(trainingPlan, prefs);
  
  return {
    planId: trainingPlan.id,
    planTitle: trainingPlan.title,
    sessions: schedule,
    totalSessions: schedule.length,
    totalWeeks: prefs.weeksCount,
    generatedAt: new Date().toISOString(),
    preferences: prefs,
    aiGenerated: true,
    aiProvider: 'intelligent_fallback',
    confidence: 0.85,
    scheduleType: 'optimized_progression'
  };
}

createSchedulePrompt(trainingPlan, preferences) {
  const sport = trainingPlan.category || 'general fitness';
  const duration = preferences.sessionDuration || 90;
  const days = preferences.availableDays || ['monday', 'wednesday', 'friday'];
  
  return `Create an optimal training schedule for a ${sport} program:

PROGRAM DETAILS:
- Title: ${trainingPlan.title}
- Duration: ${trainingPlan.duration || '12 weeks'}
- Difficulty: ${trainingPlan.difficulty || 'intermediate'}
- Sessions per week: ${days.length}

PREFERENCES:
- Available days: ${days.join(', ')}
- Session duration: ${duration} minutes
- Intensity: ${preferences.intensity || 'moderate'}

Provide a structured weekly schedule with:
1. Progressive intensity
2. Proper recovery periods
3. Skill development phases
4. Performance peaks

Focus on sustainable long-term development.`;
}

parseScheduleResponse(response, trainingPlan, preferences) {
  // Parse AI response and create schedule structure
  const lines = response.split('\n').filter(line => line.trim());
  const sessions = [];
  
  // If AI response parsing fails, fall back to structured generation
  if (lines.length < 5) {
    return this.createOptimalSessionSchedule(trainingPlan, preferences);
  }
  
  // Try to extract schedule information from AI response
  let currentWeek = 1;
  let sessionId = 1;
  
  lines.forEach(line => {
    const weekMatch = line.match(/week\s*(\d+)/i);
    if (weekMatch) {
      currentWeek = parseInt(weekMatch[1]);
    }
    
    // Look for day and time information
    const dayMatch = line.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    const timeMatch = line.match(/(\d{1,2}):(\d{2})/);
    
    if (dayMatch && currentWeek <= 12) {
      sessions.push({
        id: `optimal_${sessionId++}_${Date.now()}`,
        week: currentWeek,
        day: dayMatch[1].toLowerCase(),
        date: this.calculateOptimalDate(currentWeek, dayMatch[1]),
        time: timeMatch ? timeMatch[0] : preferences.preferredTime || '16:00',
        duration: preferences.sessionDuration || 90,
        type: this.getSessionType(currentWeek, sessions.length % 3),
        intensity: this.calculateProgressiveIntensity(currentWeek, preferences.intensity),
        focus: this.getWeeklyFocus(currentWeek, trainingPlan.category),
        aiSuggested: true
      });
    }
  });
  
  // If no sessions extracted from AI, use fallback generation
  if (sessions.length === 0) {
    return this.createOptimalSessionSchedule(trainingPlan, preferences);
  }
  
  return sessions;
}

createOptimalSessionSchedule(trainingPlan, preferences) {
  const sessions = [];
  const { availableDays, preferredTime, sessionDuration, weeksCount = 12 } = preferences;
  
  for (let week = 1; week <= weeksCount; week++) {
    availableDays.forEach((day, dayIndex) => {
      const sessionDate = this.calculateOptimalDate(week, day);
      
      sessions.push({
        id: `optimal_${week}_${dayIndex}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        week: week,
        day: day.toLowerCase(),
        date: sessionDate,
        time: preferredTime,
        duration: sessionDuration,
        type: this.getSessionType(week, dayIndex),
        intensity: this.calculateProgressiveIntensity(week, preferences.intensity),
        focus: this.getWeeklyFocus(week, trainingPlan.category),
        phase: this.getTrainingPhase(week, weeksCount),
        objectives: this.getWeeklyObjectives(week, trainingPlan.category),
        equipment: this.getSessionEquipment(trainingPlan.category),
        aiOptimized: true
      });
    });
  }
  
  return sessions;
}

calculateOptimalDate(weekNumber, dayName) {
  const today = new Date();
  const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    .indexOf(dayName.toLowerCase());
  
  // Start from next Monday if today is weekend, otherwise start from today
  const startDate = new Date(today);
  const currentDay = startDate.getDay();
  
  if (currentDay === 0 || currentDay === 6) { // Sunday or Saturday
    const daysUntilMonday = currentDay === 0 ? 1 : 2;
    startDate.setDate(startDate.getDate() + daysUntilMonday);
  }
  
  // Calculate target date for this week and day
  const targetDate = new Date(startDate);
  targetDate.setDate(startDate.getDate() + (weekNumber - 1) * 7);
  
  // Adjust to correct day of week
  const targetDay = targetDate.getDay();
  const daysToAdd = (dayIndex - targetDay + 7) % 7;
  targetDate.setDate(targetDate.getDate() + daysToAdd);
  
  return targetDate.toISOString().split('T')[0];
}

getSessionType(week, dayIndex) {
  const types = ['technique', 'conditioning', 'tactical', 'strength', 'recovery'];
  
  // Progressive session type selection based on week
  if (week <= 4) {
    return ['technique', 'conditioning', 'technique'][dayIndex % 3];
  } else if (week <= 8) {
    return ['tactical', 'strength', 'technique'][dayIndex % 3];
  } else {
    return ['tactical', 'conditioning', 'strength'][dayIndex % 3];
  }
}

calculateProgressiveIntensity(week, baseIntensity) {
  const intensityMap = { 
    low: 0.5, 
    moderate: 0.7, 
    high: 0.85,
    very_high: 0.95 
  };
  
  const baseLevel = intensityMap[baseIntensity] || 0.7;
  
  // Progressive intensity with periodization
  let weeklyMultiplier;
  if (week <= 3) {
    weeklyMultiplier = 0.7 + (week * 0.1); // Build-up phase
  } else if (week <= 8) {
    weeklyMultiplier = 0.9 + (week * 0.02); // Development phase
  } else if (week <= 10) {
    weeklyMultiplier = 1.0; // Peak phase
  } else {
    weeklyMultiplier = 0.8; // Recovery phase
  }
  
  const finalIntensity = Math.min(baseLevel * weeklyMultiplier, 1.0);
  return Math.round(finalIntensity * 100);
}

getWeeklyFocus(week, sport) {
  const sportFocus = {
    soccer: {
      1: ['ball control', 'basic passing'],
      2: ['dribbling', 'first touch'],
      3: ['shooting', 'finishing'],
      4: ['defending', 'tackling'],
      5: ['tactical awareness', 'positioning'],
      6: ['crossing', 'heading'],
      7: ['set pieces', 'free kicks'],
      8: ['match simulation', 'decision making'],
      9: ['advanced tactics', 'team play'],
      10: ['peak performance', 'competition prep'],
      11: ['match readiness', 'strategy'],
      12: ['performance review', 'next level prep']
    },
    basketball: {
      1: ['dribbling basics', 'ball handling'],
      2: ['shooting form', 'free throws'],
      3: ['passing', 'court vision'],
      4: ['defense', 'positioning'],
      5: ['rebounding', 'boxing out'],
      6: ['offensive plays', 'screens'],
      7: ['fast break', 'transition'],
      8: ['half court offense', 'spacing'],
      9: ['defensive systems', 'help defense'],
      10: ['game situations', 'clutch performance'],
      11: ['team chemistry', 'execution'],
      12: ['championship prep', 'mental toughness']
    },
    fitness: {
      1: ['foundation building', 'form'],
      2: ['strength development', 'endurance'],
      3: ['cardiovascular fitness', 'stamina'],
      4: ['flexibility', 'mobility'],
      5: ['power development', 'explosiveness'],
      6: ['functional movement', 'stability'],
      7: ['high intensity training', 'intervals'],
      8: ['compound movements', 'strength'],
      9: ['sport specific', 'performance'],
      10: ['peak conditioning', 'testing'],
      11: ['competition prep', 'tapering'],
      12: ['maintenance', 'recovery']
    }
  };
  
  const focuses = sportFocus[sport] || sportFocus.fitness;
  return focuses[week] || ['general training', 'skill development'];
}

getTrainingPhase(week, totalWeeks) {
  const phaseLength = Math.floor(totalWeeks / 4);
  
  if (week <= phaseLength) return 'foundation';
  if (week <= phaseLength * 2) return 'development';
  if (week <= phaseLength * 3) return 'intensification';
  return 'peaking';
}

getWeeklyObjectives(week, sport) {
  const baseObjectives = {
    1: ['Establish baseline fitness', 'Learn fundamental movements'],
    2: ['Improve basic skills', 'Build endurance base'],
    3: ['Develop coordination', 'Increase strength'],
    4: ['Master basic techniques', 'Assess progress'],
    5: ['Introduce advanced skills', 'Build power'],
    6: ['Combine skills in drills', 'Improve speed'],
    7: ['Practice under pressure', 'Peak strength phase'],
    8: ['Tactical understanding', 'Maintain fitness'],
    9: ['Advanced tactical play', 'Fine-tune skills'],
    10: ['Peak performance', 'Competition simulation'],
    11: ['Mental preparation', 'Strategy execution'],
    12: ['Performance evaluation', 'Set future goals']
  };
  
  return baseObjectives[week] || ['Skill development', 'Fitness maintenance'];
}

getSessionEquipment(sport) {
  const equipment = {
    soccer: ['soccer balls', 'cones', 'goals', 'bibs'],
    basketball: ['basketballs', 'hoops', 'cones', 'agility ladder'],
    fitness: ['dumbbells', 'resistance bands', 'mats', 'cones'],
    tennis: ['tennis balls', 'rackets', 'cones', 'net'],
    general: ['basic equipment', 'cones', 'markers', 'balls']
  };
  
  return equipment[sport] || equipment.general;
}

// 2. Add this method to AIService.js to support single session improvement

async improveSingleSession(sessionData, userProfile = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log('AIService: Improving single session with service routing');
      const bestService = this.getBestServiceForTask('session_enhancement');
      
      switch (bestService) {
        case 'tensorflow':
          return await this.improveSingleSessionWithTensorFlow(sessionData, userProfile);
        
        case 'huggingface':
          return await this.improveSingleSessionWithHuggingFace(sessionData, userProfile);
        
        default:
          return await this.improveSingleSessionWithFallback(sessionData, userProfile);
      }
    } catch (error) {
      console.error('AIService: Single session improvement error:', error);
      return await this.improveSingleSessionWithFallback(sessionData, userProfile);
    }
  }

  // NEW: TensorFlow-based single session improvement
  async improveSingleSessionWithTensorFlow(sessionData, userProfile) {
    try {
      console.log('AIService: Using TensorFlow for single session improvement');
      
      const tfResult = await TensorFlowService.enhanceSession(sessionData, userProfile);
      
      return {
        originalSession: sessionData,
        enhancedSession: {
          ...sessionData,
          title: sessionData.title + ' (AI Enhanced)',
          ...tfResult.enhancedSession,
          aiEnhanced: true,
          aiProvider: 'tensorflow',
          enhancedAt: new Date().toISOString()
        },
        improvements: tfResult.improvements || [],
        confidence: tfResult.confidence || 0.85
      };
      
    } catch (error) {
      console.warn('TensorFlow single session improvement failed:', error);
      throw error; // Let it fallback to rule-based
    }
  }

// Add these missing helper methods to your AIService class

generateSportSpecificDrills(sport, ageGroup, duration) {
  const baseDrills = {
    soccer: [
      'Ball control and first touch practice',
      'Passing accuracy in pairs',
      'Dribbling through cones',
      'Shooting technique from various angles',
      'Defensive positioning and tackling'
    ],
    basketball: [
      'Dribbling with both hands',
      'Chest and bounce passing',
      'Free throw shooting technique',
      'Layup from both sides',
      'Defensive stance and movement'
    ],
    general: [
      'Agility ladder exercises',
      'Coordination drills with equipment',
      'Team-building activities',
      'Fitness stations rotation',
      'Stretching and mobility work'
    ]
  };

  const drills = baseDrills[sport] || baseDrills.general;
  const drillDuration = Math.round(duration * 0.1); // Each drill ~10% of session

  return drills.map((drill, index) => ({
    id: `drill_${index}`,
    name: drill,
    duration: drillDuration,
    description: `${drill} - adapted for ${ageGroup} level`,
    equipment: this.getBasicEquipment(sport),
    instructions: `Focus on proper technique and safety`
  }));
}

getBasicEquipment(sport) {
  const equipment = {
    soccer: ['soccer balls', 'cones', 'goals'],
    basketball: ['basketballs', 'hoops', 'cones'],
    general: ['cones', 'markers', 'basic equipment']
  };
  return equipment[sport] || equipment.general;
}

// Also add this method if it's missing:
async improveSingleSessionWithHuggingFace(sessionData, userProfile) {
  try {
    const prompt = `As an expert sports coach, enhance this training session:

SESSION DETAILS:
Title: ${sessionData.title}
Duration: ${sessionData.duration} minutes
Sport: ${sessionData.sport || 'General'}
Age Group: ${sessionData.ageGroup || 'Youth'}
Participants: ${sessionData.participants || 15}

CURRENT CONTENT:
${sessionData.rawContent || sessionData.documentContent || 'Basic training session'}

FOCUS AREAS: ${sessionData.focus?.join(', ') || 'General fitness'}

Please provide:
1. Enhanced session structure
2. Specific drill improvements
3. Safety considerations
4. Progression tips
5. Equipment alternatives

Make it actionable and age-appropriate.`;

    const response = await this.queueRequest({
      model: this.models.textGeneration,
      inputs: prompt,
      parameters: {
        max_length: 400,
        temperature: 0.7,
        do_sample: true,
        top_p: 0.9
      }
    });

    const enhancements = this.parseSessionImprovements(response.generated_text);
    
    return {
      originalSession: sessionData,
      enhancedSession: {
        ...sessionData,
        title: sessionData.title + ' (AI Enhanced)',
        description: enhancements.description || sessionData.description,
        structure: enhancements.structure || [],
        drills: enhancements.drills || sessionData.drills || [],
        safety: enhancements.safety || [],
        progression: enhancements.progression || [],
        equipment: enhancements.equipment || sessionData.equipment || [],
        coachingTips: enhancements.coachingTips || [],
        aiEnhanced: true,
        enhancedAt: new Date().toISOString()
      },
      improvements: enhancements.improvements || [],
      confidence: this.calculateConfidence(response.generated_text)
    };

  } catch (error) {
    throw error;
  }
}

parseSessionImprovements(response) {
  const improvements = {
    description: '',
    structure: [],
    drills: [],
    safety: [],
    progression: [],
    equipment: [],
    coachingTips: [],
    improvements: []
  };

  const lines = response.split('\n').filter(line => line.trim());
  let currentSection = null;

  lines.forEach(line => {
    const cleanLine = line.trim();
    
    if (cleanLine.toLowerCase().includes('structure')) {
      currentSection = 'structure';
    } else if (cleanLine.toLowerCase().includes('drill') || cleanLine.toLowerCase().includes('exercise')) {
      currentSection = 'drills';
    } else if (cleanLine.toLowerCase().includes('safety')) {
      currentSection = 'safety';
    } else if (cleanLine.toLowerCase().includes('progression') || cleanLine.toLowerCase().includes('advance')) {
      currentSection = 'progression';
    } else if (cleanLine.toLowerCase().includes('equipment')) {
      currentSection = 'equipment';
    } else if (cleanLine.toLowerCase().includes('tip') || cleanLine.toLowerCase().includes('coach')) {
      currentSection = 'coachingTips';
    } else if (currentSection && cleanLine.length > 10) {
      improvements[currentSection].push(cleanLine);
    }
  });

  return improvements;
}

async improveSingleSessionWithFallback(sessionData, userProfile) {
  console.log('AIService: Using fallback session improvement');
  
  const sport = sessionData.sport?.toLowerCase() || 'general';
  const ageGroup = sessionData.ageGroup || 'Youth';
  const duration = sessionData.duration || 90;
  
  const improvements = {
    structure: [
      `Warm-up (${Math.round(duration * 0.15)} min): Dynamic stretching and activation`,
      `Technical Skills (${Math.round(duration * 0.35)} min): ${sport}-specific skill development`,
      `Tactical Work (${Math.round(duration * 0.25)} min): Game situations and decision making`,
      `Conditioning (${Math.round(duration * 0.15)} min): Fitness and endurance work`,
      `Cool-down (${Math.round(duration * 0.10)} min): Recovery and flexibility`
    ],
    drills: this.generateSportSpecificDrills(sport, ageGroup, duration),
    safety: [
      'Ensure proper warm-up before intense activities',
      'Monitor hydration throughout the session',
      'Check all equipment before use',
      'Maintain appropriate work-to-rest ratios',
      'Watch for signs of fatigue and adjust intensity'
    ],
    progression: [
      'Start with basic movements, progress to complex skills',
      'Gradually increase intensity throughout the session',
      'Provide modifications for different skill levels',
      'Focus on quality over quantity of repetitions'
    ],
    coachingTips: [
      'Use positive reinforcement to maintain motivation',
      'Demonstrate proper technique before each drill',
      'Encourage peer learning and team support',
      'Focus on effort and improvement, not just outcomes',
      'Provide specific, actionable feedback'
    ]
  };

  return {
    originalSession: sessionData,
    enhancedSession: {
      ...sessionData,
      title: sessionData.title + ' (AI Enhanced)',
      structure: improvements.structure,
      drills: improvements.drills,
      safety: improvements.safety,
      progression: improvements.progression,
      coachingTips: improvements.coachingTips,
      aiEnhanced: true,
      enhancementMethod: 'intelligent_fallback',
      enhancedAt: new Date().toISOString()
    },
    improvements: [
      'Added structured session timeline',
      'Included sport-specific drill recommendations',
      'Enhanced safety considerations',
      'Provided progression guidelines',
      'Added coaching tips for better engagement'
    ],
    confidence: 0.85
  };
}

  // ============= SESSION ENHANCEMENT =============

async enhanceExtractedSessions(sessions, userProfile = {}) {
  if (!this.initialized) {
    await this.initialize();
  }

  try {
    console.log('AIService: Enhancing sessions with intelligent service routing');
    const bestService = this.getBestServiceForTask('session_enhancement');
    
    console.log(`AIService: Using ${bestService} service for session enhancement`);
    
    switch (bestService) {
      case 'tensorflow':
        console.log('AIService: Enhancing with TensorFlow (primary offline AI)');
        return await this.enhanceWithTensorFlow(sessions, userProfile);
      
      case 'huggingface':
        console.log('AIService: Enhancing with HuggingFace (secondary online AI)');
        return await this.enhanceWithHuggingFace(sessions, userProfile);
      
      default:
        console.log('AIService: Enhancing with rule-based algorithms (fallback)');
        return await this.enhanceWithAdvancedFallback(sessions, userProfile);
    }
  } catch (error) {
    console.error('AIService: Session enhancement error:', error);
    console.log('AIService: Falling back to rule-based enhancement');
    return await this.enhanceWithAdvancedFallback(sessions, userProfile);
  }
}

  // NEW: TensorFlow-based session enhancement
  async enhanceWithTensorFlow(sessions, userProfile) {
    console.log('AIService: Using TensorFlow for session enhancement');
    
    const enhancedSessions = [];
    
    for (const weekSession of sessions) {
      try {
        const tfEnhancement = await TensorFlowService.enhanceSession(weekSession, userProfile);
        
        const enhanced = {
          ...weekSession,
          aiEnhanced: true,
          aiProvider: 'tensorflow',
          aiConfidence: tfEnhancement.confidence,
          aiEnhancements: tfEnhancement.improvements,
          dailySessions: weekSession.dailySessions.map(session => 
            this.applyTensorFlowEnhancements(session, tfEnhancement, userProfile)
          ),
          processedAt: new Date().toISOString()
        };
        
        enhancedSessions.push(enhanced);
        
      } catch (error) {
        console.warn(`TensorFlow enhancement failed for week ${weekSession.weekNumber}, using fallback:`, error);
        const fallbackEnhanced = await this.enhanceWeekWithAdvancedFallback(weekSession, userProfile);
        enhancedSessions.push(fallbackEnhanced);
      }
    }
    
    this.usageStats.tensorflowInferences = (this.usageStats.tensorflowInferences || 0) + sessions.length;
    await this.saveSettings();
    
    return enhancedSessions;
  }

  // NEW: Apply TensorFlow enhancements to individual sessions
  applyTensorFlowEnhancements(session, tfEnhancement, userProfile) {
    return {
      ...session,
      aiEnhanced: true,
      aiProvider: 'tensorflow',
      aiSuggestions: tfEnhancement.improvements || {},
      enhancedAt: new Date().toISOString(),
      
      // Apply TensorFlow-specific improvements
      duration: tfEnhancement.enhancedSession?.duration || session.duration,
      structure: tfEnhancement.enhancedSession?.structure || session.structure,
      safetyTips: tfEnhancement.enhancedSession?.safety || [],
      coachingTips: tfEnhancement.enhancedSession?.coachingTips || [],
      
      // Keep original data for reference
      originalSession: session
    };
  }

  async enhanceWithHuggingFace(sessions, userProfile) {
    console.log('AIService: Using Hugging Face for enhancement');
    
    const enhancedSessions = [];
    const batchSize = 3;
    
    for (let i = 0; i < sessions.length; i += batchSize) {
      const batch = sessions.slice(i, i + batchSize);
      const batchPromises = batch.map(async (weekSession) => {
        
        try {
          const prompt = this.createAdvancedTrainingPrompt(weekSession, userProfile);
          
          const aiResponse = await this.queueRequest({
            model: this.models.textGeneration,
            inputs: prompt,
            parameters: {
              max_length: 300,
              temperature: 0.7,
              do_sample: true,
              top_p: 0.9,
              repetition_penalty: 1.1
            }
          });

          const aiEnhancements = this.parseTrainingResponse(aiResponse.generated_text);
          
          return {
            ...weekSession,
            aiEnhanced: true,
            aiProvider: 'huggingface',
            aiModel: this.models.textGeneration,
            aiConfidence: this.calculateConfidence(aiResponse.generated_text),
            aiEnhancements: aiEnhancements,
            dailySessions: weekSession.dailySessions.map(session => 
              this.applyAIEnhancements(session, aiEnhancements, userProfile)
            ),
            processedAt: new Date().toISOString()
          };
          
        } catch (error) {
          console.warn(`HF enhancement failed for week ${weekSession.weekNumber}:`, error);
          return await this.enhanceWeekWithAdvancedFallback(weekSession, userProfile);
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      enhancedSessions.push(...batchResults);
      
      if (i + batchSize < sessions.length) {
        await this.delay(1000);
      }
    }

    this.usageStats.successfulRequests += sessions.length;
    await this.saveSettings();
    
    return enhancedSessions;
  }

  createAdvancedTrainingPrompt(weekSession, userProfile) {
    const sport = userProfile.sport || 'general sports';
    const ageGroup = userProfile.ageGroup || 'youth';
    const experience = userProfile.experience || 'beginner';
    const sportsData = this.sportsKnowledge[sport.toLowerCase()] || this.sportsKnowledge.soccer;
    
    return `As an expert ${sport} coach, enhance this training session for ${ageGroup} ${experience} players:

CURRENT SESSION:
Week ${weekSession.weekNumber}: ${weekSession.title}
Duration: ${weekSession.totalDuration} minutes
Focus Areas: ${weekSession.focus?.join(', ') || 'General training'}

PLAYER CONTEXT:
- Age Group: ${ageGroup}
- Experience: ${experience}
- Sport: ${sport}
- Key Skills: ${sportsData.keySkills.join(', ')}

PROVIDE ENHANCEMENTS FOR:
1. Age-Appropriate Modifications
2. Progressive Skill Development
3. Safety Considerations
4. Engagement Techniques
5. Assessment Methods

Be specific and actionable.`;
  }

  parseTrainingResponse(response) {
    try {
      const enhancements = {
        ageModifications: [],
        skillProgression: [],
        safetyTips: [],
        engagementTechniques: [],
        assessmentMethods: [],
        equipmentTips: [],
        individualAdaptations: []
      };

      const sections = response.split('\n').filter(line => line.trim());
      let currentSection = null;

      sections.forEach(line => {
        const cleanLine = line.trim();
        
        if (cleanLine.toLowerCase().includes('age') || cleanLine.toLowerCase().includes('modification')) {
          currentSection = 'ageModifications';
        } else if (cleanLine.toLowerCase().includes('skill') || cleanLine.toLowerCase().includes('progress')) {
          currentSection = 'skillProgression';
        } else if (cleanLine.toLowerCase().includes('safety') || cleanLine.toLowerCase().includes('injury')) {
          currentSection = 'safetyTips';
        } else if (cleanLine.toLowerCase().includes('engagement') || cleanLine.toLowerCase().includes('motivat')) {
          currentSection = 'engagementTechniques';
        } else if (cleanLine.toLowerCase().includes('assess') || cleanLine.toLowerCase().includes('measure')) {
          currentSection = 'assessmentMethods';
        } else if (cleanLine.toLowerCase().includes('equipment')) {
          currentSection = 'equipmentTips';
        } else if (cleanLine.toLowerCase().includes('individual') || cleanLine.toLowerCase().includes('adapt')) {
          currentSection = 'individualAdaptations';
        } else if (currentSection && cleanLine.length > 10) {
          enhancements[currentSection].push(cleanLine);
        }
      });

      return enhancements;
    } catch (error) {
      console.warn('Failed to parse AI response:', error);
      return { general: [response.substring(0, 200)] };
    }
  }

  applyAIEnhancements(session, aiEnhancements, userProfile) {
    const enhanced = {
      ...session,
      aiEnhanced: true,
      aiSuggestions: aiEnhancements,
      originalDuration: session.duration,
      enhancedAt: new Date().toISOString()
    };

    if (aiEnhancements.ageModifications?.length > 0) {
      const ageGroup = userProfile.ageGroup || 'youth';
      const sport = userProfile.sport || 'soccer';
      const sportsData = this.sportsKnowledge[sport.toLowerCase()];
      
      if (sportsData?.ageProgression[ageGroup]) {
        enhanced.duration = Math.min(
          session.duration,
          sportsData.ageProgression[ageGroup].duration
        );
      }
    }

    if (aiEnhancements.safetyTips?.length > 0) {
      enhanced.safetyNotes = aiEnhancements.safetyTips.join('. ');
    }

    if (aiEnhancements.engagementTechniques?.length > 0) {
      enhanced.engagementTips = aiEnhancements.engagementTechniques;
    }

    if (aiEnhancements.assessmentMethods?.length > 0) {
      enhanced.assessmentCriteria = aiEnhancements.assessmentMethods;
    }

    return enhanced;
  }

  // ============= ADVANCED FALLBACK =============

  async enhanceWithAdvancedFallback(sessions, userProfile) {
    console.log('AIService: Using intelligent fallback enhancement');
    
    return sessions.map(weekSession => ({
      ...weekSession,
      aiEnhanced: true,
      enhancementMethod: 'advanced_fallback',
      aiProvider: 'internal_intelligence',
      aiConfidence: 0.85,
      dailySessions: weekSession.dailySessions.map(session => 
        this.personalizeSessionAdvanced(session, userProfile, weekSession.weekNumber)
      ),
      aiEnhancements: this.generateFallbackEnhancements(weekSession, userProfile)
    }));
  }

  async enhanceWeekWithAdvancedFallback(weekSession, userProfile) {
    return {
      ...weekSession,
      aiEnhanced: true,
      enhancementMethod: 'advanced_fallback',
      aiProvider: 'internal_intelligence',
      aiConfidence: 0.85,
      dailySessions: weekSession.dailySessions.map(session => 
        this.personalizeSessionAdvanced(session, userProfile, weekSession.weekNumber)
      ),
      aiEnhancements: this.generateFallbackEnhancements(weekSession, userProfile)
    };
  }

  personalizeSessionAdvanced(session, userProfile, weekNumber) {
    const { ageGroup = 'youth', experience = 'beginner', sport = 'soccer', preferences = [], injuries = [] } = userProfile;
    const sportsData = this.sportsKnowledge[sport.toLowerCase()] || this.sportsKnowledge.soccer;
    
    let enhancedSession = { ...session };
    const modifications = [];
    const progressionFactor = Math.min(weekNumber / 12, 1);

    const ageConfig = sportsData.ageProgression[ageGroup] || sportsData.ageProgression['10-12'];
    
    enhancedSession.duration = Math.min(session.duration, ageConfig.duration);
    enhancedSession.complexity = ageConfig.complexity;
    modifications.push(`Duration adjusted to ${enhancedSession.duration} minutes for ${ageGroup}`);

    if (experience === 'beginner') {
      enhancedSession.title = session.title.replace(/Advanced|Expert/gi, 'Beginner-Friendly');
      enhancedSession.repetitions = Math.max(1, Math.floor((session.repetitions || 3) * 0.7));
      modifications.push('Reduced repetitions for skill building focus');
    } else if (experience === 'advanced') {
      enhancedSession.repetitions = Math.ceil((session.repetitions || 3) * (1 + progressionFactor * 0.3));
      modifications.push('Increased repetitions for advanced skill refinement');
    }

    const intensityMultiplier = 0.7 + (progressionFactor * 0.4);
    if (session.intensity) {
      enhancedSession.intensity = Math.round(session.intensity * intensityMultiplier);
    }

    if (injuries.length > 0) {
      enhancedSession.injuryModifications = this.generateInjuryModifications(injuries, sport);
      modifications.push(`Modified for ${injuries.join(', ')} considerations`);
    }

    const weeklySkillFocus = sportsData.keySkills[weekNumber % sportsData.keySkills.length];
    enhancedSession.primarySkillFocus = weeklySkillFocus;
    modifications.push(`Week focus: ${weeklySkillFocus} development`);

    if (preferences.includes('gamification') || ageGroup.includes('4-') || ageGroup.includes('6') || ageGroup.includes('7-9')) {
      enhancedSession.gamificationElements = this.generateGameElements(session, sport, ageGroup);
      modifications.push('Added game-based learning');
    }

    enhancedSession.weatherAlternatives = this.generateWeatherAlternatives(session);
    
    enhancedSession.equipmentOptimization = {
      required: sportsData.equipment.slice(0, 3),
      alternatives: this.generateEquipmentAlternatives(sportsData.equipment),
      setupTips: ['Ensure safe spacing', 'Check equipment condition', 'Have backup options']
    };

    enhancedSession.assessmentCriteria = this.generateAssessmentCriteria(weeklySkillFocus, ageGroup);
    enhancedSession.aiModifications = modifications;
    enhancedSession.enhancedAt = new Date().toISOString();
    
    return enhancedSession;
  }

  generateInjuryModifications(injuries, sport) {
    const modifications = {};
    
    injuries.forEach(injury => {
      switch (injury.toLowerCase()) {
        case 'knee':
          modifications.knee = [
            'Avoid deep lunges and sharp direction changes',
            'Focus on straight-line movements',
            'Include knee strengthening exercises'
          ];
          break;
        case 'ankle':
          modifications.ankle = [
            'Minimize jumping and landing exercises',
            'Emphasize balance and stability work',
            'Include proprioception exercises'
          ];
          break;
        case 'shoulder':
          modifications.shoulder = [
            'Limit overhead movements',
            'Focus on pain-free range of motion',
            'Include gentle stretching'
          ];
          break;
        default:
          modifications.general = [
            'Monitor pain levels throughout',
            'Modify intensity based on comfort',
            'Consult medical team for clearance'
          ];
      }
    });
    
    return modifications;
  }

  generateGameElements(session, sport, ageGroup) {
    const baseGames = {
      soccer: [
        'King of the Ring - ball control',
        'Traffic Light - stop/go work',
        'Sharks and Minnows - dribbling',
        'Red Light Green Light - skills'
      ],
      basketball: [
        'Dribble Tag - handling fun',
        'Shooting Stars - point-based',
        'Mirror Match - coordination',
        'Musical Basketballs - fundamentals'
      ]
    };

    const ageMultiplier = ageGroup.includes('4-') || ageGroup.includes('6') ? 1.5 : 1.0;
    const games = baseGames[sport.toLowerCase()] || baseGames.soccer;
    
    return {
      primaryGame: games[0],
      alternatives: games.slice(1, 3),
      points: Math.round(session.duration * ageMultiplier / 10),
      rewards: ['High-five', 'Team cheer', 'Skill badge'],
      progressLevels: ['Bronze', 'Silver', 'Gold', 'Champion']
    };
  }

  generateAssessmentCriteria(skillFocus, ageGroup) {
    const criteria = {
      technical: [],
      tactical: [],
      physical: [],
      mental: []
    };

    switch (skillFocus) {
      case 'ball control':
        criteria.technical = ['Touch consistency', 'Balance during control', 'Speed of control'];
        criteria.tactical = ['Body positioning', 'First touch direction', 'Awareness of space'];
        break;
      case 'passing':
        criteria.technical = ['Accuracy', 'Appropriate weight', 'Technique consistency'];
        criteria.tactical = ['Target selection', 'Timing', 'Communication'];
        break;
      case 'shooting':
        criteria.technical = ['Contact with ball', 'Follow-through', 'Body position'];
        criteria.tactical = ['Shot selection', 'Placement vs power', 'Quick release'];
        break;
      default:
        criteria.technical = ['Skill execution', 'Consistency', 'Form improvement'];
        criteria.tactical = ['Decision making', 'Awareness', 'Application'];
    }

    if (ageGroup.includes('4-') || ageGroup.includes('6') || ageGroup.includes('7-9')) {
      criteria.fun = ['Enjoyment level', 'Participation', 'Effort shown'];
      criteria.social = ['Cooperation', 'Encouragement', 'Following instructions'];
    }

    criteria.physical = ['Movement quality', 'Stamina', 'Coordination'];
    criteria.mental = ['Focus level', 'Confidence', 'Resilience'];

    return criteria;
  }

  generateWeatherAlternatives(session) {
    return {
      rain: ['Move to indoor facility', 'Focus on covered areas', 'Tactical discussions'],
      heat: ['Increase water breaks', 'Reduce duration by 20%', 'Seek shaded areas'],
      cold: ['Extended warm-up', 'Keep players moving', 'Have indoor backup'],
      wind: ['Adjust ball work', 'Use wind for challenges', 'Focus on ground-based']
    };
  }

  generateEquipmentAlternatives(standardEquipment) {
    const alternatives = {};
    
    standardEquipment.forEach(item => {
      switch (item) {
        case 'cones':
          alternatives[item] = ['water bottles', 'shoes', 'shirts'];
          break;
        case 'balls':
          alternatives[item] = ['tennis balls', 'balloons', 'rolled socks'];
          break;
        case 'goals':
          alternatives[item] = ['cones as posts', 'trees', 'chalk lines'];
          break;
        case 'bibs':
          alternatives[item] = ['colored shirts', 'armbands', 'colored tape'];
          break;
        case 'ladders':
          alternatives[item] = ['chalk lines', 'rope', 'cones in line'];
          break;
        default:
          alternatives[item] = ['improvise with available materials'];
      }
    });
    
    return alternatives;
  }

  generateFallbackEnhancements(weekSession, userProfile) {
    const sport = userProfile.sport || 'soccer';
    const ageGroup = userProfile.ageGroup || 'youth';
    const experience = userProfile.experience || 'beginner';
    
    return {
      ageModifications: [
        `Session adapted for ${ageGroup} players`,
        experience === 'beginner' ? 'Extra demonstration time' : 'Advanced variations',
        'Duration optimized for attention span'
      ],
      skillProgression: [
        `Week ${weekSession.weekNumber} builds on previous skills`,
        'Progressive difficulty scaling',
        'Clear learning objectives'
      ],
      safetyTips: [
        'Proper warm-up and cool-down',
        'Age-appropriate intensity',
        'Equipment safety checks'
      ],
      engagementTechniques: [
        ageGroup.includes('4-') || ageGroup.includes('6-') || ageGroup.includes('7-9') ? 
          'Game-based learning' : 'Skill challenges',
        'Positive reinforcement',
        'Activity variety'
      ],
      assessmentMethods: [
        'Track skill improvements',
        'Recognize effort and attitude',
        'Monitor individual progress'
      ],
      equipmentTips: [
        'Setup for maximum participation',
        'Safety positioning',
        'Backup options available'
      ],
      individualAdaptations: [
        'Modifications for skill levels',
        'Physical limitation accommodations',
        'Confidence-building approaches'
      ]
    };
  }

  // ============= REQUEST MANAGEMENT =============

  async queueRequest(requestParams) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        params: requestParams,
        resolve,
        reject,
        timestamp: Date.now()
      });

      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      
      try {
        if (this.rateLimitCounter >= 100 && this.rateLimitReset && Date.now() < this.rateLimitReset) {
          const waitTime = this.rateLimitReset - Date.now();
          console.log(`Rate limit reached, waiting ${waitTime}ms`);
          await this.delay(waitTime);
        }

        const response = await this.hfInference.textGeneration(request.params);
        this.rateLimitCounter++;
        this.usageStats.totalRequests++;
        request.resolve(response);

        await this.delay(500);

      } catch (error) {
        this.handleAPIError(error);
        request.reject(error);
      }
    }

    this.isProcessingQueue = false;
  }

  handleAPIError(error) {
    if (error.message.includes('rate limit')) {
      this.rateLimitReset = Date.now() + (60 * 1000);
      console.warn('Rate limit hit, implementing backoff');
    } else if (error.message.includes('quota')) {
      this.fallbackMode = true;
      console.warn('API quota exceeded, switching to fallback');
    } else {
      console.warn('API error:', error.message);
    }
    
    this.usageStats.failedRequests++;
  }

  // ============= UTILITY METHODS =============

  calculateConfidence(response) {
    if (!response || response.length < 20) return 0.3;
    
    const lengthScore = Math.min(response.length / 200, 0.4);
    const coherenceScore = response.split('.').length > 1 ? 0.3 : 0.1;
    const specificityScore = /\d+/.test(response) ? 0.2 : 0.1;
    const contextScore = response.toLowerCase().includes('training') || 
                        response.toLowerCase().includes('coach') ? 0.2 : 0.0;
    
    return Math.min(lengthScore + coherenceScore + specificityScore + contextScore, 1.0);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  startQueueProcessor() {
    setInterval(() => {
      if (this.requestQueue.length > 0 && !this.isProcessingQueue) {
        this.processQueue();
      }
    }, 2000);
  }

  // ============= PUBLIC METHODS =============

  getStatus() {
    return {
      initialized: this.initialized,
      isOnline: this.isOnline,
      fallbackMode: this.fallbackMode,
      hasApiKey: !!this.apiKey,
      queueLength: this.requestQueue.length,
      usageStats: this.usageStats,
      rateLimitStatus: {
        current: this.rateLimitCounter,
        resetTime: this.rateLimitReset
      },
      capabilities: this.offlineCapabilities,
      supportedSports: Object.keys(this.sportsKnowledge)
    };
  }

  async resetUsageStats() {
    this.usageStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0
    };
    await this.saveSettings();
  }

  async clearApiKey() {
    try {
      await AsyncStorage.removeItem('huggingface_api_key');
      this.apiKey = null;
      this.hfInference = null;
      this.isOnline = false;
      this.fallbackMode = true;
      return { success: true, message: 'API key cleared' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  addSportKnowledge(sport, knowledge) {
    this.sportsKnowledge[sport.toLowerCase()] = knowledge;
    console.log(`Added knowledge for ${sport}`);
  }

  getSportKnowledge(sport) {
    return this.sportsKnowledge[sport.toLowerCase()] || null;
  }
}

export default new AIService();
