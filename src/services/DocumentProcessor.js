//src/services/DocumentProcessor.js
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PlatformUtils from '../utils/PlatformUtils';
import PDFProcessor from './PDFProcessor';
import AIService from './AIService';

// Safe module variables - initialized to null
let DocumentPicker = null;
let RNFS = null;
let mammoth = null;
let XLSX = null;
//let PDFProcessor = null;
let modulesInitialized = false;

// Initialize PDF processor safely
const initializePDFProcessor = () => {
  try {
    if (!PDFProcessor) {
      // Use require instead of dynamic import to avoid Metro issues
      PDFProcessor = require('./PDFProcessor').default;
    }
    return PDFProcessor;
  } catch (error) {
    console.warn('PDFProcessor not available:', error.message);
    return null;
  }
};

// Safe module initialization that won't crash the app
const initializePlatformModules = async () => {
  if (modulesInitialized) return;

  try {
    PlatformUtils.logDebugInfo('Starting module initialization');
    
    if (PlatformUtils.isWeb()) {
      // Web-specific modules only
      try {
        mammoth = await PlatformUtils.loadMammoth();
        XLSX = await PlatformUtils.loadXLSX();
        PlatformUtils.logDebugInfo('Web modules loaded', { 
          mammoth: !!mammoth, 
          xlsx: !!XLSX 
        });
      } catch (error) {
        console.warn('Some web modules failed to load:', error.message);
      }
    } else {
      // Mobile-specific modules
      try {
        DocumentPicker = await PlatformUtils.loadDocumentPicker();
        RNFS = await PlatformUtils.loadFileSystem();
        mammoth = await PlatformUtils.loadMammoth();
        XLSX = await PlatformUtils.loadXLSX();
        PlatformUtils.logDebugInfo('Mobile modules loaded', { 
          documentPicker: !!DocumentPicker,
          rnfs: !!RNFS,
          mammoth: !!mammoth,
          xlsx: !!XLSX
        });
      } catch (error) {
        console.warn('Some mobile modules failed to load:', error.message);
      }
    }
    
    modulesInitialized = true;
    PlatformUtils.logDebugInfo('Module initialization completed');
    
  } catch (error) {
    console.error('Module initialization failed:', error);
    // Don't throw - allow app to continue with fallbacks
    modulesInitialized = true; // Mark as initialized to avoid retry loops
  }
};

class DocumentProcessor {
  constructor() {
    this.initialized = false;
    this.supportedFormats = PlatformUtils.getSupportedFormats();
    this.fileSizeLimit = PlatformUtils.getFileSizeLimit();
    this.initializationPromise = null;
    
    // Start initialization immediately but don't block constructor
    this.init();
  }

  async init() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInit();
    return this.initializationPromise;
  }

  async _performInit() {
    if (this.initialized) return;

    try {
      await initializePlatformModules();
      this.initialized = true;
      
      PlatformUtils.logDebugInfo('DocumentProcessor initialized', {
        platform: Platform.OS,
        supportedFormats: this.supportedFormats.length,
        fileSizeLimit: this.fileSizeLimit,
        modulesAvailable: {
          documentPicker: !!DocumentPicker,
          fileSystem: !!RNFS,
          mammoth: !!mammoth,
          xlsx: !!XLSX
        }
      });
    } catch (error) {
      console.error('DocumentProcessor initialization failed:', error);
      this.initialized = true; // Mark as initialized to avoid retry loops
    }
  }

  // Ensure initialization with timeout to prevent hanging
  async ensureInitialized(timeout = 5000) {
    if (this.initialized) return;

    try {
      await Promise.race([
        this.init(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Initialization timeout')), timeout)
        )
      ]);
    } catch (error) {
      console.warn('Initialization timeout or failed:', error.message);
      // Continue anyway - fallbacks should handle missing modules
      this.initialized = true;
    }
  }

  // Platform-agnostic document selection
// In DocumentProcessor.js, find the selectDocument method and replace it:
async selectDocument() {
  try {
    await this.ensureInitialized();
    
    PlatformUtils.logDebugInfo('Starting document selection');
    
    // Use the new user interaction method instead
    const result = await PlatformUtils.executeUserInteraction(
      () => this._selectDocumentWeb(),
      () => this._selectDocumentMobile()
    );
    
    if (!result) {
      return null; // User cancelled
    }

    // Validate the selected file
    const validation = this.validateFileForPlatform(result);
    if (!validation.isValid) {
      throw PlatformUtils.createError(
        validation.errors.join(', '),
        validation.suggestions
      );
    }

    return result;
  } catch (error) {
    const platformError = PlatformUtils.handlePlatformError(error, 'Document Selection');
    console.error('Document selection error:', platformError);
    throw platformError;
  }
}

// Add this method to your DocumentProcessor class

async processTrainingPlan(documentId, options = {}) {
  try {
    await this.ensureInitialized();
    
    console.log('Processing training plan for document:', documentId);
    
    // Get the document from storage
    const documents = await this.getStoredDocuments();
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
      throw PlatformUtils.createError('Document not found', [
        'The document may have been deleted',
        'Try uploading the document again'
      ]);
    }
    
    // Check if document was already processed (unless force reprocess is enabled)
    if (document.processed && !options.force) {
      console.log('Document already processed, checking for existing plan...');
      
      // Look for existing training plan
      const existingPlans = await this.getTrainingPlans();
      const existingPlan = existingPlans.find(plan => plan.sourceDocument === documentId);
      
      if (existingPlan) {
        console.log('Found existing training plan:', existingPlan.id);
        return existingPlan;
      }
    }
    
    // Process the document to extract text
    console.log('Extracting text from document...');
    const extractionResult = await this.extractDocumentText(document);
    const text = extractionResult.text;
    
    if (!text || text.trim().length < 50) {
      throw PlatformUtils.createError('Insufficient content in document', [
        'Document appears to be empty or very short',
        'Ensure the document contains training plan information'
      ]);
    }
    
    // Use AI-enhanced analysis to create training plan
    console.log('Analyzing document with AI enhancement...');
    const trainingPlan = await this.analyzeDocumentWithAI(text, document, options);
    
    // Save the training plan
    console.log('Saving training plan...');
    const savedPlan = await this.saveTrainingPlan(trainingPlan);
    
    // Mark document as processed
    document.processed = true;
    document.processedAt = new Date().toISOString();
    document.aiProcessed = true;
    await this.updateDocumentMetadata(document);
    
    console.log('Training plan processing completed successfully');
    
    // Add processing stats to the plan (optional enhancement)
    savedPlan.processingStats = {
      textLength: text.length,
      aiAnalyzed: trainingPlan.aiAnalyzed,
      confidence: trainingPlan.aiConfidence,
      extractionMethod: 'ai_enhanced',
      processedAt: new Date().toISOString()
    };
    
    return savedPlan;
    
  } catch (error) {
    console.error('Training plan processing failed:', error);
    throw PlatformUtils.handlePlatformError(error, 'Training Plan Processing');
  }
}

  // Web document selection using HTML input
// In DocumentProcessor.js, replace the _selectDocumentWeb method:
async _selectDocumentWeb() {
  return new Promise((resolve, reject) => {
    try {
      if (typeof document === 'undefined') {
        reject(PlatformUtils.createError('Document API not available'));
        return;
      }

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = PlatformUtils.getFileInputAccept();
      input.style.display = 'none';
      
      let resolved = false;

      const cleanup = () => {
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      };

      const resolveOnce = (value) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        resolve(value);
      };

      input.onchange = async (event) => {
        try {
          const file = event.target.files?.[0];
          if (!file) {
            resolveOnce(null);
            return;
          }

          const result = {
            uri: URL.createObjectURL(file),
            type: file.type,
            name: file.name,
            size: file.size,
            file: file
          };
          
          PlatformUtils.logDebugInfo('Web file selected', {
            name: file.name,
            type: file.type,
            size: file.size
          });
          
          resolveOnce(result);
        } catch (error) {
          resolved = true;
          cleanup();
          reject(PlatformUtils.handlePlatformError(error, 'Web File Selection'));
        }
      };
      
      input.oncancel = () => {
        resolveOnce(null);
      };
      
      document.body.appendChild(input);
      
      // Trigger the file dialog immediately
      setTimeout(() => {
        if (!resolved) {
          input.click();
        }
      }, 10);
      
    } catch (error) {
      reject(PlatformUtils.handlePlatformError(error, 'Web File Input Creation'));
    }
  });
}

// Add this method to the DocumentProcessor class in DocumentProcessor.js
async scheduleIntegrityMaintenance() {
  try {
    // This method runs automatic maintenance checks on stored documents
    const documents = await this.getStoredDocuments();
    
    if (documents.length === 0) {
      PlatformUtils.logDebugInfo('No documents found for integrity maintenance');
      return;
    }
    
    let maintenanceResults = {
      totalDocuments: documents.length,
      checkedDocuments: 0,
      issuesFound: 0,
      repairsAttempted: 0,
      timestamp: new Date().toISOString()
    };
    
    // Check documents that haven't been checked recently
    for (const document of documents) {
      try {
        // Skip recently checked documents (within last 24 hours)
        if (document.integrityCheck && document.integrityCheck.timestamp) {
          const lastCheck = new Date(document.integrityCheck.timestamp);
          const hoursSinceCheck = (Date.now() - lastCheck.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceCheck < 24) {
            continue; // Skip this document
          }
        }
        
        // Run integrity check
        const integrityResult = await this.verifyFileIntegrity(document);
        maintenanceResults.checkedDocuments++;
        
        if (integrityResult.overallStatus === 'failed' || integrityResult.overallStatus === 'error') {
          maintenanceResults.issuesFound++;
          
          // Try to repair if possible
          if (this.canRepairDocument(document)) {
            try {
              await this.repairDocumentIntegrity(document.id);
              maintenanceResults.repairsAttempted++;
            } catch (repairError) {
              console.warn('Could not repair document:', document.id, repairError.message);
            }
          }
        }
        
        // Update document with integrity check results
        document.integrityCheck = {
          timestamp: integrityResult.timestamp,
          status: integrityResult.overallStatus,
          lastChecked: new Date().toISOString()
        };
        
        await this.updateDocumentMetadata(document);
        
      } catch (error) {
        console.warn('Integrity maintenance failed for document:', document.id, error.message);
      }
    }
    
    PlatformUtils.logDebugInfo('Integrity maintenance completed', maintenanceResults);
    return maintenanceResults;
    
  } catch (error) {
    console.error('Integrity maintenance scheduling failed:', error);
    // Don't throw - this is a background operation
    return null;
  }
}

// Add these methods to the DocumentProcessor class

// Check if a document can be repaired
canRepairDocument(document) {
  try {
    // Basic checks for repairability
    if (!document || !document.id) return false;
    
    // Web documents with missing webFileData usually can't be repaired
    if (PlatformUtils.isWeb() && !document.webFileData) {
      return false;
    }
    
    // Mobile documents with missing local paths usually can't be repaired
    if (PlatformUtils.isMobile() && !document.localPath) {
      return false;
    }
    
    // Check if the document type is supported for repair
    const supportedTypes = [
      'text/plain',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    return supportedTypes.includes(document.type);
  } catch (error) {
    return false;
  }
}

// Repair document integrity issues
async repairDocumentIntegrity(documentId) {
  try {
    const documents = await this.getStoredDocuments();
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
      throw PlatformUtils.createError('Document not found for repair');
    }
    
    const repairActions = [];
    let repaired = false;
    
    // Basic metadata repairs
    if (!document.uploadedAt) {
      document.uploadedAt = new Date().toISOString();
      repairActions.push('Added missing upload timestamp');
      repaired = true;
    }
    
    if (!document.platform) {
      document.platform = PlatformUtils.isWeb() ? 'web' : 'mobile';
      repairActions.push('Added missing platform identifier');
      repaired = true;
    }
    
    if (typeof document.processed !== 'boolean') {
      document.processed = false;
      repairActions.push('Fixed missing processed flag');
      repaired = true;
    }
    
    // Platform-specific repairs
    if (PlatformUtils.isWeb()) {
      // Web-specific repairs
      if (!document.webFileData && document.file) {
        try {
          // Try to restore file data if original file object still exists
          const buffer = await document.file.arrayBuffer();
          document.webFileData = Array.from(new Uint8Array(buffer));
          repairActions.push('Restored missing web file data');
          repaired = true;
        } catch (error) {
          repairActions.push('Could not restore web file data - file may need re-upload');
        }
      }
    } else {
      // Mobile-specific repairs
      if (document.localPath && RNFS) {
        try {
          const exists = await RNFS.exists(document.localPath);
          if (!exists) {
            repairActions.push('Local file missing - document may need re-upload');
          }
        } catch (error) {
          repairActions.push('Could not verify local file existence');
        }
      }
    }
    
    // Update the document if repairs were made
    if (repaired) {
      document.repairedAt = new Date().toISOString();
      await this.updateDocumentMetadata(document);
    }
    
    // Run post-repair integrity check
    const postRepairCheck = await this.verifyFileIntegrity(document);
    
    return {
      repaired,
      actions: repairActions,
      postRepairStatus: postRepairCheck.overallStatus,
      message: repaired 
        ? `Document repaired successfully: ${repairActions.join(', ')}`
        : 'No repairs needed or possible'
    };
    
  } catch (error) {
    throw PlatformUtils.handlePlatformError(error, 'Document Repair');
  }
}

  // Mobile document selection using expo-document-picker
  async _selectDocumentMobile() {
    try {
      if (!DocumentPicker) {
        throw PlatformUtils.createError(
          'Document picker not available',
          [
            'Install expo-document-picker',
            'Restart the app',
            'Update to latest version'
          ]
        );
      }

      const result = await DocumentPicker.pick({
        type: this.supportedFormats,
        allowMultiSelection: false,
      });
      
      const file = result[0];
      
      PlatformUtils.logDebugInfo('Mobile file selected', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      return file;
    } catch (error) {
      if (DocumentPicker?.isCancel && DocumentPicker.isCancel(error)) {
        return null; // User cancelled
      }
      throw PlatformUtils.handlePlatformError(error, 'Mobile File Selection');
    }
  }

  // Platform-agnostic document storage
  async storeDocument(file) {
    try {
      await this.ensureInitialized();
      
      return await PlatformUtils.executePlatformSpecific(
        () => this._storeDocumentWeb(file),
        () => this._storeDocumentMobile(file)
      );
    } catch (error) {
      const platformError = PlatformUtils.handlePlatformError(error, 'Document Storage');
      console.error('Document storage error:', platformError);
      throw platformError;
    }
  }

  // Web document storage
// Web document storage with file data preservation
// Fixed _storeDocumentWeb method
async _storeDocumentWeb(file) {
  try {
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store the file data for later processing - ensure it's properly stored
    let webFileData = null;
    try {
      if (file.file && typeof file.file.arrayBuffer === 'function') {
        webFileData = await file.file.arrayBuffer();
        console.log('File data stored successfully, size:', webFileData.byteLength);
      } else {
        console.warn('File object does not have arrayBuffer method');
      }
    } catch (error) {
      console.error('Could not store file data:', error.message);
      throw PlatformUtils.createError(
        'Could not read file data',
        ['Try selecting the file again', 'Ensure the file is not corrupted']
      );
    }
    
    if (!webFileData) {
      throw PlatformUtils.createError(
        'No file data available for storage',
        ['Try selecting the file again', 'Check if the file is accessible']
      );
    }
    
    const metadata = {
      id: documentId,
      originalName: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      processed: false,
      platform: 'web',
      uri: file.uri,
      // Store as Uint8Array for better serialization
      webFileData: Array.from(new Uint8Array(webFileData)),
      // Keep reference to original file object (won't be serialized to AsyncStorage)
      file: file.file
    };
    
    const existingDocs = await this.getStoredDocuments();
    existingDocs.push(metadata);
    
    await AsyncStorage.setItem('coaching_documents', JSON.stringify(existingDocs));
    
    PlatformUtils.logDebugInfo('Web document stored', { 
      documentId, 
      size: file.size,
      hasFileData: !!webFileData,
      dataSize: webFileData.byteLength
    });
    
    return metadata;
  } catch (error) {
    throw PlatformUtils.handlePlatformError(error, 'Web Document Storage');
  }
}

  // Mobile document storage
  async _storeDocumentMobile(file) {
    try {
      if (!RNFS) {
        throw PlatformUtils.createError(
          'File system not available',
          ['Install expo-file-system', 'Check app permissions']
        );
      }

      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fileName = `${documentId}_${file.name}`;
      const localPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      
      // Copy file to app's document directory
      await RNFS.copyFile(file.uri, localPath);
      
      const metadata = {
        id: documentId,
        originalName: file.name,
        localPath: localPath,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        processed: false,
        platform: 'mobile'
      };
      
      const existingDocs = await this.getStoredDocuments();
      existingDocs.push(metadata);
      await AsyncStorage.setItem('coaching_documents', JSON.stringify(existingDocs));
      
      PlatformUtils.logDebugInfo('Mobile document stored', { 
        documentId, 
        localPath 
      });
      
      return metadata;
    } catch (error) {
      throw PlatformUtils.handlePlatformError(error, 'Mobile Document Storage');
    }
  }

  // Process training plan with enhanced error handling
async generateSportVariations(originalPlanId, targetSports = ['basketball', 'tennis', 'volleyball']) {
  try {
    const plans = await this.getTrainingPlans();
    const originalPlan = plans.find(plan => plan.id === originalPlanId);
    
    if (!originalPlan) {
      throw PlatformUtils.createError('Original plan not found');
    }

    const generatedPlans = [];
    
    for (const sport of targetSports) {
      const variation = await AIService.generatePlanVariations(originalPlan, sport);
      variation.id = `plan_${Date.now()}_${sport}_${Math.random().toString(36).substr(2, 9)}`;
      variation.createdAt = new Date().toISOString();
      variation.isAIGenerated = true;
      variation.originalPlanId = originalPlanId;
      
      generatedPlans.push(variation);
    }

    // Save all generated plans
    for (const plan of generatedPlans) {
      await this.saveTrainingPlan(plan);
    }

    PlatformUtils.logDebugInfo('AI sport variations generated', {
      originalSport: originalPlan.sport,
      generatedSports: targetSports,
      planCount: generatedPlans.length
    });

    return generatedPlans;
  } catch (error) {
    throw PlatformUtils.handlePlatformError(error, 'AI Plan Generation');
  }
}

// Enhanced session extraction and storage
async extractAndStoreSessionsFromPlan(trainingPlan) {
  try {
    console.log('Extracting sessions from plan:', trainingPlan.id);
    
    const documents = await this.getStoredDocuments();
    const sourceDoc = documents.find(doc => doc.id === trainingPlan.sourceDocument);
    
    if (!sourceDoc) {
      throw PlatformUtils.createError('Source document not found');
    }
    
    // Extract sessions using SessionExtractor
    const extractionResult = await SessionExtractor.extractSessionsFromDocument(sourceDoc, trainingPlan);
    
    if (!extractionResult || !extractionResult.sessions) {
      throw PlatformUtils.createError('No sessions could be extracted from document');
    }
    
    // Convert to upcoming sessions format
    const upcomingSessions = SessionExtractor.convertToUpcomingSessions(extractionResult);
    
    // Store sessions with plan reference
    const sessionsWithPlanRef = upcomingSessions.map(session => ({
      ...session,
      linkedPlanId: trainingPlan.id,
      linkedPlanTitle: trainingPlan.title,
      extractedFromDocument: true,
      extractedAt: new Date().toISOString()
    }));
    
    // Store in a separate sessions storage
    await this.storeExtractedSessions(sessionsWithPlanRef);
    
    // Update plan with sessions count
    trainingPlan.extractedSessionsCount = sessionsWithPlanRef.length;
    trainingPlan.hasExtractedSessions = true;
    await this.updateTrainingPlan(trainingPlan);
    
    PlatformUtils.logDebugInfo('Sessions extracted and stored', {
      planId: trainingPlan.id,
      sessionsCount: sessionsWithPlanRef.length
    });
    
    return {
      extractionResult,
      upcomingSessions: sessionsWithPlanRef,
      totalSessions: sessionsWithPlanRef.length
    };
    
  } catch (error) {
    console.error('Session extraction failed:', error);
    throw PlatformUtils.handlePlatformError(error, 'Session Extraction and Storage');
  }
}

async storeExtractedSessions(sessions) {
  try {
    const existingSessions = await this.getExtractedSessions();
    const updatedSessions = [...existingSessions, ...sessions];
    
    await AsyncStorage.setItem('extracted_sessions', JSON.stringify(updatedSessions));
    
    PlatformUtils.logDebugInfo('Extracted sessions stored', {
      newSessions: sessions.length,
      totalSessions: updatedSessions.length
    });
    
  } catch (error) {
    throw PlatformUtils.handlePlatformError(error, 'Extracted Sessions Storage');
  }
}

async getExtractedSessions() {
  try {
    const sessions = await AsyncStorage.getItem('extracted_sessions');
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Error loading extracted sessions:', error);
    return [];
  }
}

async updateTrainingPlan(updatedPlan) {
  try {
    const plans = await this.getTrainingPlans();
    const index = plans.findIndex(plan => plan.id === updatedPlan.id);
    
    if (index !== -1) {
      plans[index] = updatedPlan;
      await AsyncStorage.setItem('training_plans', JSON.stringify(plans));
      
      PlatformUtils.logDebugInfo('Training plan updated', {
        planId: updatedPlan.id,
        hasExtractedSessions: updatedPlan.hasExtractedSessions
      });
    }
  } catch (error) {
    throw PlatformUtils.handlePlatformError(error, 'Training Plan Update');
  }
}

// File Integrity Check System - Add these methods to DocumentProcessor.js

// 1. Main integrity check method - call this after storeDocument
async verifyFileIntegrity(document) {
  try {
    console.log('Starting file integrity check for:', document.id);
    
    const checks = {
      basic: await this.performBasicIntegrityCheck(document),
      storage: await this.performStorageIntegrityCheck(document),
      readability: await this.performReadabilityCheck(document),
      processing: await this.performProcessingReadinessCheck(document)
    };
    
    const overallStatus = this.evaluateIntegrityResults(checks);
    
    const result = {
      documentId: document.id,
      timestamp: new Date().toISOString(),
      platform: document.platform,
      overallStatus,
      checks,
      recommendations: this.generateIntegrityRecommendations(checks)
    };
    
    // Log the results
    PlatformUtils.logDebugInfo('File integrity check completed', {
      documentId: document.id,
      status: overallStatus,
      passed: overallStatus === 'passed',
      failedChecks: Object.keys(checks).filter(key => checks[key].status === 'failed')
    });
    
    return result;
  } catch (error) {
    console.error('File integrity check failed:', error);
    return {
      documentId: document.id,
      timestamp: new Date().toISOString(),
      overallStatus: 'error',
      error: error.message,
      checks: {},
      recommendations: ['Retry file upload', 'Check file format compatibility']
    };
  }
}

// 2. Basic file metadata integrity
async performBasicIntegrityCheck(document) {
  const issues = [];
  const warnings = [];
  
  try {
    // Check required fields
    if (!document.id) issues.push('Missing document ID');
    if (!document.originalName) issues.push('Missing original filename');
    if (!document.type) issues.push('Missing file type');
    if (!document.size || document.size <= 0) issues.push('Invalid file size');
    if (!document.uploadedAt) issues.push('Missing upload timestamp');
    
    // Check file type validity
    if (document.type && !this.supportedFormats.includes(document.type)) {
      issues.push(`Unsupported file type: ${document.type}`);
    }
    
    // Check file size limits
    if (document.size > this.fileSizeLimit) {
      issues.push(`File too large: ${document.size} bytes (limit: ${this.fileSizeLimit})`);
    }
    
    // Check filename extension matches type
    if (document.originalName && document.type) {
      const extensionMatch = this.validateFileExtension(document.originalName, document.type);
      if (!extensionMatch.valid) {
        warnings.push(extensionMatch.message);
      }
    }
    
    return {
      status: issues.length === 0 ? 'passed' : 'failed',
      issues,
      warnings,
      metadata: {
        filename: document.originalName,
        type: document.type,
        size: document.size,
        sizeFormatted: this.formatFileSize(document.size)
      }
    };
  } catch (error) {
    return {
      status: 'error',
      issues: [`Basic check failed: ${error.message}`],
      warnings: [],
      metadata: {}
    };
  }
}

// 3. Storage integrity check
async performStorageIntegrityCheck(document) {
  const issues = [];
  const warnings = [];
  
  try {
    if (PlatformUtils.isWeb()) {
      // Web storage checks
      if (!document.webFileData) {
        issues.push('Web file data missing');
      } else {
        if (!Array.isArray(document.webFileData)) {
          issues.push('Web file data in wrong format (should be array)');
        } else {
          if (document.webFileData.length === 0) {
            issues.push('Web file data is empty');
          } else {
            // Verify data integrity by checking size consistency
            const expectedSize = document.size;
            const actualSize = document.webFileData.length;
            
            if (Math.abs(expectedSize - actualSize) > expectedSize * 0.1) {
              warnings.push(`Size mismatch: expected ${expectedSize}, got ${actualSize}`);
            }
          }
        }
      }
      
      // Check if document can be retrieved from storage
      const storedDocs = await this.getStoredDocuments();
      const retrievedDoc = storedDocs.find(doc => doc.id === document.id);
      if (!retrievedDoc) {
        issues.push('Document not found in storage after save');
      } else {
        if (!retrievedDoc.webFileData) {
          issues.push('File data lost during storage');
        }
      }
      
    } else {
      // Mobile storage checks
      if (!document.localPath) {
        issues.push('Local file path missing');
      } else {
        if (RNFS) {
          const exists = await RNFS.exists(document.localPath);
          if (!exists) {
            issues.push('File does not exist at local path');
          } else {
            // Check file size consistency
            const stat = await RNFS.stat(document.localPath);
            if (Math.abs(stat.size - document.size) > document.size * 0.1) {
              warnings.push(`File size mismatch: expected ${document.size}, got ${stat.size}`);
            }
          }
        } else {
          warnings.push('File system not available for verification');
        }
      }
    }
    
    return {
      status: issues.length === 0 ? 'passed' : 'failed',
      issues,
      warnings,
      platform: document.platform,
      storageType: PlatformUtils.isWeb() ? 'webFileData' : 'localPath'
    };
  } catch (error) {
    return {
      status: 'error',
      issues: [`Storage check failed: ${error.message}`],
      warnings: [],
      platform: document.platform
    };
  }
}

// 4. File readability check
async performReadabilityCheck(document) {
  const issues = [];
  const warnings = [];
  
  try {
    let canRead = false;
    let sampleContent = '';
    let contentLength = 0;
    
    // Try to read a small portion of the file to verify it's accessible
    if (PlatformUtils.isWeb() && document.webFileData) {
      try {
        const buffer = new Uint8Array(document.webFileData).buffer;
        canRead = buffer.byteLength > 0;
        contentLength = buffer.byteLength;
        
        // For text files, try to read first few characters
        if (document.type.includes('text')) {
          const decoder = new TextDecoder('utf-8');
          const sample = new Uint8Array(buffer.slice(0, Math.min(100, buffer.byteLength)));
          sampleContent = decoder.decode(sample);
        }
      } catch (error) {
        issues.push(`Cannot create buffer from web file data: ${error.message}`);
      }
    } else if (!PlatformUtils.isWeb() && document.localPath && RNFS) {
      try {
        const stat = await RNFS.stat(document.localPath);
        canRead = stat.size > 0;
        contentLength = stat.size;
        
        // Try to read first few bytes
        if (document.type.includes('text')) {
          sampleContent = await RNFS.read(document.localPath, 100, 0, 'utf8');
        }
      } catch (error) {
        issues.push(`Cannot read mobile file: ${error.message}`);
      }
    }
    
    if (!canRead) {
      issues.push('File is not readable');
    }
    
    if (contentLength === 0) {
      issues.push('File appears to be empty');
    }
    
    // Check for common file corruption signs
    if (sampleContent) {
      if (sampleContent.includes('\uFFFD')) {
        warnings.push('File may contain corrupted characters');
      }
      if (sampleContent.trim().length === 0 && contentLength > 100) {
        warnings.push('File appears to contain only whitespace or binary data');
      }
    }
    
    return {
      status: issues.length === 0 ? 'passed' : 'failed',
      issues,
      warnings,
      readableSize: contentLength,
      sampleLength: sampleContent.length,
      hasSample: sampleContent.length > 0
    };
  } catch (error) {
    return {
      status: 'error',
      issues: [`Readability check failed: ${error.message}`],
      warnings: [],
      readableSize: 0
    };
  }
}

// 5. Processing readiness check
async performProcessingReadinessCheck(document) {
  const issues = [];
  const warnings = [];
  
  try {
    const fileType = document.type.toLowerCase();
    
    // Check if we have the required libraries for this file type
    if (fileType.includes('word') || fileType.includes('document')) {
      if (!mammoth) {
        issues.push('Mammoth library not available for Word processing');
      }
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      if (!XLSX) {
        issues.push('XLSX library not available for Excel processing');
      }
    } else if (fileType.includes('pdf')) {
      issues.push('PDF processing not supported');
    }
    
    // Check platform-specific requirements
    if (PlatformUtils.isWeb()) {
      if (fileType.includes('pdf')) {
        issues.push('PDF processing not supported on web platform');
      }
      if (document.size > 5 * 1024 * 1024) {
        warnings.push('Large files may cause browser performance issues');
      }
    }
    
    // Try a quick processing test if possible
    let processingTest = false;
    try {
      if (fileType.includes('text') || fileType.includes('csv')) {
        // Simple text processing test
        if (PlatformUtils.isWeb() && document.webFileData) {
          const buffer = new Uint8Array(document.webFileData).buffer;
          const decoder = new TextDecoder('utf-8');
          const sample = decoder.decode(buffer.slice(0, 100));
          processingTest = sample.length > 0;
        } else if (!PlatformUtils.isWeb() && RNFS && document.localPath) {
          const sample = await RNFS.read(document.localPath, 100, 0, 'utf8');
          processingTest = sample.length > 0;
        }
      }
    } catch (error) {
      warnings.push(`Processing test failed: ${error.message}`);
    }
    
    return {
      status: issues.length === 0 ? 'passed' : 'failed',
      issues,
      warnings,
      fileType,
      librariesAvailable: {
        mammoth: !!mammoth,
        xlsx: !!XLSX
      },
      processingTestPassed: processingTest
    };
  } catch (error) {
    return {
      status: 'error',
      issues: [`Processing readiness check failed: ${error.message}`],
      warnings: [],
      fileType: document.type
    };
  }
}

// 6. Helper methods
validateFileExtension(filename, mimeType) {
  const extensionMap = {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls'],
    'text/csv': ['.csv'],
    'text/plain': ['.txt'],
    'application/pdf': ['.pdf']
  };
  
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  const expectedExtensions = extensionMap[mimeType] || [];
  
  if (expectedExtensions.length === 0) {
    return { valid: true, message: 'Unknown file type for extension validation' };
  }
  
  const isValid = expectedExtensions.includes(extension);
  return {
    valid: isValid,
    message: isValid ? 'Extension matches file type' : `Extension ${extension} doesn't match type ${mimeType}`
  };
}

formatFileSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

evaluateIntegrityResults(checks) {
  const statuses = Object.values(checks).map(check => check.status);
  
  if (statuses.includes('error')) return 'error';
  if (statuses.includes('failed')) return 'failed';
  if (statuses.every(status => status === 'passed')) return 'passed';
  return 'warning';
}

generateIntegrityRecommendations(checks) {
  const recommendations = [];
  
  Object.entries(checks).forEach(([checkName, result]) => {
    if (result.status === 'failed') {
      switch (checkName) {
        case 'basic':
          recommendations.push('Fix file metadata issues before processing');
          break;
        case 'storage':
          recommendations.push('Re-upload the file to fix storage issues');
          break;
        case 'readability':
          recommendations.push('Check if file is corrupted or in wrong format');
          break;
        case 'processing':
          recommendations.push('Use a different file format for better compatibility');
          break;
      }
    }
  });
  
  if (recommendations.length === 0) {
    recommendations.push('File integrity verified - ready for processing');
  }
  
  return recommendations;
}

// 7. Enhanced storeDocument with integrity check
// In DocumentProcessor.js, modify storeDocumentWithIntegrityCheck:
async storeDocumentWithIntegrityCheck(file) {
  try {
    console.log('Starting document storage with integrity check...');
    
    // Store the document first
    const document = await this.storeDocument(file);
    console.log('Document stored successfully:', {
      id: document.id,
      name: document.originalName,
      hasWebData: !!document.webFileData
    });
    
    // Perform integrity check
    const integrityResult = await this.verifyFileIntegrity(document);
    console.log('Integrity check completed:', integrityResult.overallStatus);
    
    // Add integrity info to document metadata
    document.integrityCheck = {
      timestamp: integrityResult.timestamp,
      status: integrityResult.overallStatus,
      lastChecked: new Date().toISOString()
    };
    
    // Update document with integrity results
    await this.updateDocumentMetadata(document);
    console.log('Document metadata updated with integrity results');
    
    // Verify the document was stored correctly
    const storedDocs = await this.getStoredDocuments();
    const foundDoc = storedDocs.find(doc => doc.id === document.id);
    console.log('Verification - document found in storage:', !!foundDoc);
    
    // Return both document and integrity results
    return {
      document,
      integrityResult
    };
  } catch (error) {
    console.error('Error in storeDocumentWithIntegrityCheck:', error);
    throw PlatformUtils.handlePlatformError(error, 'Document Storage with Integrity Check');
  }
}



  // Enhanced text extraction with better error handling
async extractWordTextUnified(document) {
  if (!mammoth) {
    return this.generateFormatFallback('Word', document, [
      'Word processing library not available',
      'Try converting to text (.txt) format'
    ]);
  }
  
  // Validate this is actually a Word document
  const type = document.type?.toLowerCase() || '';
  const name = document.originalName?.toLowerCase() || '';
  const isWordFile = type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                     type === 'application/msword' ||
                     name.endsWith('.docx') || 
                     name.endsWith('.doc');
  
  if (!isWordFile) {
    return this.generateFormatFallback('Word', document, [
      `File type mismatch: ${type}`,
      'This appears to be an Excel or other file format',
      'Use the correct document type for processing'
    ]);
  }
  
  try {
    const fileData = await this.readDocumentData(document);
    
    const options = {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
      ]
    };
    
    const result = await mammoth.extractRawText({ 
      arrayBuffer: fileData.data.buffer || fileData.data 
    }, options);
    
    if (!result.value || result.value.trim().length === 0) {
      return this.generateFormatFallback('Word', document, ['Document appears to be empty or corrupted']);
    }
    
    let cleanText = result.value
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\u0000/g, '')
      .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .trim();
    
    return `Word Document: ${document.originalName}\n${'='.repeat(50)}\n\n${cleanText}`;
  } catch (error) {
    console.error('Word extraction failed:', error);
    
    // Check if error suggests wrong file type
    if (error.message.includes('body element') || error.message.includes('docx file')) {
      return this.generateFormatFallback('Word', document, [
        'File is not a valid Word document',
        'This may be an Excel file with .xlsx extension',
        'Check the file type and try again'
      ]);
    }
    
    return this.generateFormatFallback('Word', document, [`Processing failed: ${error.message}`]);
  }
}


async extractExcelTextUnified(document) {
  if (!XLSX) {
    return this.generateFormatFallback('Excel', document, [
      'Excel processing library not available',
      'Try converting to CSV format'
    ]);
  }
  
  // Validate this is actually an Excel document
  const type = document.type?.toLowerCase() || '';
  const name = document.originalName?.toLowerCase() || '';
  const isExcelFile = type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                      type === 'application/vnd.ms-excel' ||
                      name.endsWith('.xlsx') || 
                      name.endsWith('.xls');
  
  if (!isExcelFile) {
    return this.generateFormatFallback('Excel', document, [
      `File type mismatch: ${type}`,
      'This may not be an Excel file',
      'Check the file extension and type'
    ]);
  }
  
  try {
    const fileData = await this.readDocumentData(document);
    
    const workbook = XLSX.read(fileData.data, { 
      type: fileData.type === 'buffer' ? 'buffer' : 'array',
      cellText: true,
      cellDates: true,
      raw: false
    });
    
    let text = `Excel Document: ${document.originalName}\n${'='.repeat(50)}\n\n`;
    
    workbook.SheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        raw: false
      });
      
      text += `Sheet ${index + 1}: ${sheetName}\n${'-'.repeat(30)}\n`;
      
      data.forEach((row, rowIndex) => {
        if (row && row.length > 0) {
          const rowText = row
            .map(cell => String(cell || '').trim())
            .filter(cell => cell !== '')
            .join(' | ');
          
          if (rowText) {
            text += `${rowText}\n`;
          }
        }
      });
      text += '\n';
    });
    
    return text.trim();
  } catch (error) {
    console.error('Excel extraction failed:', error);
    return this.generateFormatFallback('Excel', document, [`Processing failed: ${error.message}`]);
  }
}

async extractCSVTextUnified(document) {
  try {
    const fileData = await this.readDocumentData(document);
    
    // Enhanced CSV text decoding with encoding detection
    let text;
    try {
      // Try UTF-8 first
      const decoder = new TextDecoder('utf-8');
      text = decoder.decode(fileData.data);
    } catch (error) {
      // Fallback to Latin-1 if UTF-8 fails
      const decoder = new TextDecoder('latin1');
      text = decoder.decode(fileData.data);
    }
    
    if (!text || text.trim().length === 0) {
      return this.generateFormatFallback('CSV', document, ['File appears to be empty']);
    }
    
    // Clean up CSV text
    text = text
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\r/g, '\n')    // Handle old Mac line endings
      .trim();
    
    // Format CSV with proper headers and line numbers
    const lines = text.split('\n');
    let formattedText = `CSV Document: ${document.originalName}\n${'='.repeat(50)}\n\n`;
    
    lines.forEach((line, index) => {
      if (line.trim()) {
        formattedText += `${String(index + 1).padStart(3, ' ')}: ${line}\n`;
      }
    });
    
    return formattedText;
  } catch (error) {
    console.error('CSV extraction failed:', error);
    return this.generateFormatFallback('CSV', document, [`Extraction error: ${error.message}`]);
  }
}

async extractTextFileUnified(document) {
  try {
    const fileData = await this.readDocumentData(document);
    
    // Enhanced text decoding with encoding detection
    let text;
    try {
      // Try UTF-8 first
      const decoder = new TextDecoder('utf-8');
      text = decoder.decode(fileData.data);
    } catch (error) {
      // Fallback to Latin-1 if UTF-8 fails
      const decoder = new TextDecoder('latin1');
      text = decoder.decode(fileData.data);
    }
    
    if (!text || text.trim().length === 0) {
      return this.generateFormatFallback('Text', document, ['File appears to be empty']);
    }
    
    // Clean up text
    text = text
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\r/g, '\n')    // Handle old Mac line endings
      .replace(/\u0000/g, '')  // Remove null characters
      .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // Remove control characters
      .trim();
    
    // Add header for consistency with line numbers
    const lines = text.split('\n');
    let formattedText = `Text Document: ${document.originalName}\n${'='.repeat(50)}\n\n`;
    
    lines.forEach((line, index) => {
      formattedText += `${String(index + 1).padStart(3, ' ')}: ${line}\n`;
    });
    
    return formattedText;
  } catch (error) {
    console.error('Text extraction failed:', error);
    return this.generateFormatFallback('Text', document, [`Extraction error: ${error.message}`]);
  }
}

async extractPDFTextUnified(document) {
  try {
    const pdfProcessor = initializePDFProcessor();
    if (!pdfProcessor) {
      return this.generateFormatFallback('PDF', document, [
        'PDF processing requires additional setup',
        'Convert to Word (.docx) for guaranteed processing',
        'Use web version for better PDF support'
      ]);
    }
    
    let text = await pdfProcessor.extractTextFromPDF(document);
    
    if (!text || text.trim().length === 0) {
      return this.generateFormatFallback('PDF', document, [
        'No extractable text found - may be image-based PDF',
        'Try using OCR software first',
        'Convert to Word format'
      ]);
    }

    // Enhanced text cleaning for better session extraction
    text = this.cleanPDFText(text);
    
    return `PDF Document: ${document.originalName}\n${'='.repeat(50)}\n\n${text}`;
  } catch (error) {
    console.warn('PDF processing failed, using enhanced fallback');
    return this.generateFormatFallback('PDF', document, [
      'PDF text extraction failed',
      'Try converting to Word or text format',
      'Ensure PDF contains selectable text (not scanned images)'
    ]);
  }
}

// Add this helper method to DocumentProcessor:

cleanPDFText(text) {
  return text
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    
    // Fix common PDF extraction issues
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add spaces between lowercase and uppercase
    .replace(/(\d)([A-Z])/g, '$1 $2')    // Add spaces between numbers and uppercase
    
    // Normalize week headers
    .replace(/Week\s*(\d+)/gi, 'Week $1')
    .replace(/WEEK\s*(\d+)/gi, 'Week $1')
    
    // Clean up excessive whitespace but preserve paragraph breaks
    .replace(/[ \t]+/g, ' ')  // Multiple spaces/tabs to single space
    .replace(/\n\s+/g, '\n')  // Remove leading whitespace on lines
    .replace(/\s+\n/g, '\n')  // Remove trailing whitespace on lines
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    
    // Ensure proper spacing around important keywords
    .replace(/(Technical Competency Focus|Tactical Competency Focus|Daily Session Structure)/gi, '\n\n$1')
    .replace(/(Warm-Up|Technical Drills|Conditioning Games|Cool-down)/gi, '\n$1')
    
    .trim();
}

  // Keep all your existing parsing methods unchanged but add error handling
async parseTrainingPlanContent(text, document, options = {}) {
  try {
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw PlatformUtils.createError('Document appears to be empty');
    }
    
    // Get enhanced user info
    const userInfo = await this.getUserInfo();
    const timestamp = Date.now();
    
    // Extract title that will serve as academy name
    const extractedTitle = this.extractTitle(lines, document.originalName);
    
    const trainingPlan = {
      id: `plan_${timestamp}`,
      title: extractedTitle, // This becomes the academy name
      academyName: extractedTitle, // Make this explicit
      
      // FIXED: Ensure all possible document name fields are populated
      originalName: document.originalName, // This is the actual uploaded file name
      sourceDocumentName: document.originalName, // Backup field
      documentFileName: document.originalName, // Additional backup
      
      category: this.extractCategory(lines),
      duration: this.extractDuration(lines),
      difficulty: this.extractDifficulty(lines),
      sessionsCount: this.extractSessionsCount(lines),
      description: this.extractDescription(lines),
      creator: userInfo.name || 'Coach', // Display name
      creatorUsername: userInfo.username, // Actual username
      creatorFirstName: userInfo.firstName,
      creatorLastName: userInfo.lastName,
      creatorProfileImage: userInfo.profileImage,
      rating: 0,
      downloads: 0,
      tags: this.extractTags(lines),
      image: null,
      isPublic: false,
      isOwned: true,
      progress: 0,
      price: null,
      
      // Additional metadata
      version: options.force ? 2 : 1,
      isReprocessed: !!options.force,
      originalDocumentProcessedAt: document.processedAt || null,
      createdAt: new Date().toISOString(),
      sourceDocument: document.id, // This links back to the document
      rawContent: text.substring(0, 10000),
      sessions: this.extractDetailedSessions(lines),
      schedule: this.extractSchedule(lines),
      platform: document.platform || (PlatformUtils.isWeb() ? 'web' : 'mobile'),
      
      // Debug information to help troubleshoot
      debugInfo: {
        documentId: document.id,
        documentOriginalName: document.originalName,
        documentType: document.type,
        extractedTitle: extractedTitle,
        createdAt: new Date().toISOString()
      }
    };

    return trainingPlan;
  } catch (error) {
    throw PlatformUtils.handlePlatformError(error, 'Training Plan Content Parsing');
  }
}

// AI-Enhanced document analysis
async analyzeDocumentWithAI(text, document, options = {}) {
  try {
    console.log('DocumentProcessor: Starting AI-enhanced document analysis');
    
    // First, do basic extraction
    const basicPlan = await this.parseTrainingPlanContent(text, document, options);
    
    // Then enhance with AI if available
    const aiAnalysis = await AIService.analyzeDocumentText(text, document);
    
    // Merge AI insights with basic plan
    const enhancedPlan = {
      ...basicPlan,
      aiAnalyzed: true,
      aiInsights: aiAnalysis.insights,
      aiConfidence: aiAnalysis.confidence,
      aiSuggestedImprovements: aiAnalysis.suggestions,
      aiExtractedMetadata: aiAnalysis.metadata
    };
    
    console.log('DocumentProcessor: AI-enhanced analysis complete');
    return enhancedPlan;
    
  } catch (error) {
    console.warn('DocumentProcessor: AI analysis failed, using basic parsing:', error);
    // Fallback to basic parsing if AI fails
    return await this.parseTrainingPlanContent(text, document, options);
  }
}

// Add this new method to DocumentProcessor.js around line 550
async analyzeDocumentStructure(text, document) {
  try {
    console.log('DocumentProcessor: Starting enhanced document structure analysis');
    
    const structureAnalysis = {
      documentType: this.identifyDocumentType(text),
      weekStructure: this.analyzeWeekStructure(text),
      dayStructure: this.analyzeDayStructure(text),
      sessionStructure: this.analyzeSessionStructure(text),
      durationAnalysis: this.analyzeDurations(text),
      schedulePattern: this.analyzeSchedulePattern(text),
      organizationLevel: this.assessOrganizationLevel(text),
      confidence: 0.8
    };
    
    // Use AI enhancement if available
    if (AIService.isReady) {
      try {
        const aiEnhancement = await AIService.enhanceDocumentStructureAnalysis(structureAnalysis, text);
        structureAnalysis.aiEnhanced = true;
        structureAnalysis.aiInsights = aiEnhancement.insights;
        structureAnalysis.confidence = Math.min(structureAnalysis.confidence + 0.1, 1.0);
      } catch (error) {
        console.warn('AI enhancement failed for structure analysis:', error);
      }
    }
    
    console.log('Document structure analysis completed:', {
      type: structureAnalysis.documentType,
      weeks: structureAnalysis.weekStructure.totalWeeks,
      days: structureAnalysis.dayStructure.totalDays,
      sessions: structureAnalysis.sessionStructure.totalSessions
    });
    
    return structureAnalysis;
    
  } catch (error) {
    console.error('Document structure analysis failed:', error);
    return this.getDefaultStructureAnalysis();
  }
}

// Add helper methods for structure analysis
identifyDocumentType(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('coaching plan') || lowerText.includes('training plan')) {
    return 'training_plan';
  } else if (lowerText.includes('weekly') && lowerText.includes('schedule')) {
    return 'weekly_schedule';
  } else if (lowerText.includes('session') && lowerText.includes('program')) {
    return 'session_program';
  } else if (lowerText.includes('curriculum') || lowerText.includes('course')) {
    return 'curriculum';
  }
  
  return 'general_training';
}

analyzeWeekStructure(text) {
  const weekPatterns = [
    /week\s*(\d+)/gi,
    /training\s*week\s*(\d+)/gi,
    /phase\s*(\d+)/gi,
    /w(\d+)/gi
  ];
  
  const weeks = new Set();
  let weekTitles = [];
  
  weekPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const weekNum = parseInt(match[1]);
      if (weekNum > 0 && weekNum <= 52) {
        weeks.add(weekNum);
        weekTitles.push({
          number: weekNum,
          title: match[0],
          position: match.index
        });
      }
    }
  });
  
  const maxWeek = weeks.size > 0 ? Math.max(...weeks) : 0;
  
  return {
    totalWeeks: maxWeek,
    identifiedWeeks: Array.from(weeks).sort((a, b) => a - b),
    weekTitles: weekTitles,
    hasSequentialWeeks: this.checkSequentialWeeks(Array.from(weeks)),
    weekDistribution: this.analyzeWeekDistribution(weekTitles, text)
  };
}

analyzeDayStructure(text) {
  const dayPatterns = [
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
    /day\s*(\d+)/gi,
    /(mon|tue|wed|thu|fri|sat|sun)[\s\:]/gi
  ];
  
  const days = new Set();
  const dayPositions = [];
  
  dayPatterns.forEach((pattern, patternIndex) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const day = match[1] || match[0];
      days.add(day.toLowerCase());
      dayPositions.push({
        day: day.toLowerCase(),
        position: match.index,
        patternType: patternIndex
      });
    }
  });
  
  return {
    totalDays: days.size,
    identifiedDays: Array.from(days),
    dayPositions: dayPositions,
    weeklyPattern: this.identifyWeeklyPattern(Array.from(days)),
    hasSpecificDays: days.size > 0
  };
}

analyzeSessionStructure(text) {
  const sessionPatterns = [
    /session\s*(\d+)/gi,
    /training\s*session/gi,
    /workout\s*(\d+)/gi,
    /practice\s*(\d+)/gi,
    /(warm[\s-]?up|technical|conditioning|cool[\s-]?down)/gi
  ];
  
  const sessions = [];
  const sessionTypes = new Set();
  
  sessionPatterns.forEach((pattern, patternIndex) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const sessionNumber = match[1] ? parseInt(match[1]) : null;
      const sessionType = this.identifySessionType(match[0]);
      
      sessions.push({
        number: sessionNumber,
        type: sessionType,
        text: match[0],
        position: match.index
      });
      
      sessionTypes.add(sessionType);
    }
  });
  
  return {
    totalSessions: sessions.length,
    numberedSessions: sessions.filter(s => s.number).length,
    sessionTypes: Array.from(sessionTypes),
    sessionDetails: sessions,
    hasStructuredSessions: sessions.length > 3
  };
}

analyzeDurations(text) {
  const durationPatterns = [
    /(\d+)\s*(minutes?|mins?|hours?|hrs?)/gi,
    /(\d+)\s*-\s*(\d+)\s*(minutes?|mins?|hours?|hrs?)/gi,
    /duration[:\s]*(\d+)\s*(minutes?|mins?|hours?|hrs?)/gi
  ];
  
  const durations = [];
  
  durationPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const value1 = parseInt(match[1]);
      const value2 = match[2] && !isNaN(parseInt(match[2])) ? parseInt(match[2]) : null;
      const unit = (match[3] || match[2]).toLowerCase();
      
      durations.push({
        value: value2 ? [value1, value2] : value1,
        unit: unit.includes('hour') ? 'hours' : 'minutes',
        isRange: !!value2,
        context: match[0]
      });
    }
  });
  
  return {
    foundDurations: durations,
    averageDuration: this.calculateAverageDuration(durations),
    durationRange: this.getDurationRange(durations),
    hasDurationInfo: durations.length > 0
  };
}

analyzeSchedulePattern(text) {
  const schedulePatterns = [
    /(\d+)\s*times?\s*per\s*week/gi,
    /(\d+)\s*sessions?\s*per\s*week/gi,
    /every\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
    /(daily|weekly|bi-weekly|monthly)/gi
  ];
  
  const patterns = [];
  
  schedulePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      patterns.push({
        type: this.categorizeSchedulePattern(match[0]),
        text: match[0],
        frequency: match[1] || null
      });
    }
  });
  
  return {
    identifiedPatterns: patterns,
    recommendedFrequency: this.inferFrequency(patterns),
    hasScheduleInfo: patterns.length > 0
  };
}

assessOrganizationLevel(text) {
  const organizationScore = {
    hasWeeks: 0,
    hasDays: 0,
    hasSessions: 0,
    hasDurations: 0,
    hasProgression: 0,
    total: 0
  };
  
  // Score based on structure elements
  if (text.match(/week\s*\d+/gi)) organizationScore.hasWeeks = 2;
  if (text.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi)) organizationScore.hasDays = 2;
  if (text.match(/session\s*\d+/gi)) organizationScore.hasSessions = 2;
  if (text.match(/\d+\s*(minutes?|hours?)/gi)) organizationScore.hasDurations = 2;
  if (text.match(/(beginner|intermediate|advanced|progression)/gi)) organizationScore.hasProgression = 2;
  
  organizationScore.total = Object.values(organizationScore).reduce((sum, val) => sum + val, 0) - organizationScore.total;
  
  const level = organizationScore.total >= 8 ? 'highly_structured' :
                organizationScore.total >= 5 ? 'moderately_structured' :
                organizationScore.total >= 2 ? 'basic_structure' : 'unstructured';
  
  return {
    level,
    score: organizationScore.total,
    breakdown: organizationScore
  };
}

// Helper methods
checkSequentialWeeks(weeks) {
  if (weeks.length <= 1) return true;
  
  weeks.sort((a, b) => a - b);
  for (let i = 1; i < weeks.length; i++) {
    if (weeks[i] - weeks[i-1] !== 1) return false;
  }
  return true;
}

analyzeWeekDistribution(weekTitles, text) {
  const textLength = text.length;
  const avgContentPerWeek = weekTitles.length > 0 ? textLength / weekTitles.length : 0;
  
  return {
    averageContentPerWeek: Math.round(avgContentPerWeek),
    evenlyDistributed: this.checkEvenDistribution(weekTitles, textLength)
  };
}

identifyWeeklyPattern(days) {
  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const weekendDays = ['saturday', 'sunday'];
  
  const hasWeekdays = days.some(day => weekDays.includes(day));
  const hasWeekends = days.some(day => weekendDays.includes(day));
  
  if (hasWeekdays && hasWeekends) return 'full_week';
  if (hasWeekdays) return 'weekdays_only';
  if (hasWeekends) return 'weekends_only';
  return 'specific_days';
}

identifySessionType(sessionText) {
  const lowerText = sessionText.toLowerCase();
  
  if (lowerText.includes('warm')) return 'warm_up';
  if (lowerText.includes('cool')) return 'cool_down';
  if (lowerText.includes('technical')) return 'technical';
  if (lowerText.includes('conditioning')) return 'conditioning';
  if (lowerText.includes('tactical')) return 'tactical';
  
  return 'general';
}

calculateAverageDuration(durations) {
  if (durations.length === 0) return null;
  
  let totalMinutes = 0;
  let count = 0;
  
  durations.forEach(d => {
    if (Array.isArray(d.value)) {
      const avg = (d.value[0] + d.value[1]) / 2;
      totalMinutes += d.unit === 'hours' ? avg * 60 : avg;
    } else {
      totalMinutes += d.unit === 'hours' ? d.value * 60 : d.value;
    }
    count++;
  });
  
  return Math.round(totalMinutes / count);
}

getDurationRange(durations) {
  if (durations.length === 0) return null;
  
  const allValues = [];
  durations.forEach(d => {
    if (Array.isArray(d.value)) {
      allValues.push(...d.value.map(v => d.unit === 'hours' ? v * 60 : v));
    } else {
      allValues.push(d.unit === 'hours' ? d.value * 60 : d.value);
    }
  });
  
  return {
    min: Math.min(...allValues),
    max: Math.max(...allValues)
  };
}

categorizeSchedulePattern(patternText) {
  const lower = patternText.toLowerCase();
  
  if (lower.includes('per week')) return 'frequency_per_week';
  if (lower.includes('every')) return 'recurring_day';
  if (lower.includes('daily')) return 'daily';
  if (lower.includes('weekly')) return 'weekly';
  
  return 'custom';
}

inferFrequency(patterns) {
  const frequencies = patterns.filter(p => p.frequency).map(p => parseInt(p.frequency));
  if (frequencies.length === 0) return null;
  
  return Math.round(frequencies.reduce((sum, freq) => sum + freq, 0) / frequencies.length);
}

checkEvenDistribution(weekTitles, textLength) {
  if (weekTitles.length <= 1) return true;
  
  const expectedDistance = textLength / weekTitles.length;
  const actualDistances = [];
  
  for (let i = 1; i < weekTitles.length; i++) {
    actualDistances.push(weekTitles[i].position - weekTitles[i-1].position);
  }
  
  const avgDistance = actualDistances.reduce((sum, d) => sum + d, 0) / actualDistances.length;
  const deviation = Math.abs(avgDistance - expectedDistance) / expectedDistance;
  
  return deviation < 0.3; // 30% tolerance
}

getDefaultStructureAnalysis() {
  return {
    documentType: 'general_training',
    weekStructure: { totalWeeks: 0, identifiedWeeks: [], hasSequentialWeeks: false },
    dayStructure: { totalDays: 0, identifiedDays: [], hasSpecificDays: false },
    sessionStructure: { totalSessions: 0, sessionTypes: [], hasStructuredSessions: false },
    durationAnalysis: { foundDurations: [], hasDurationInfo: false },
    schedulePattern: { identifiedPatterns: [], hasScheduleInfo: false },
    organizationLevel: { level: 'unstructured', score: 0 },
    confidence: 0.3
  };
}


async performAIDocumentAnalysis(text) {
  try {
    // Analyze document structure and content
    const analysis = {
      insights: [],
      confidence: 0,
      suggestions: [],
      metadata: {}
    };
    
    // Use AI to identify key sections
    const sections = await this.identifyDocumentSections(text);
    analysis.metadata.sections = sections;
    
    // Extract training-specific information
    const trainingInfo = await this.extractTrainingInformation(text);
    analysis.insights = trainingInfo.insights;
    analysis.confidence = trainingInfo.confidence;
    
    // Generate improvement suggestions
    analysis.suggestions = await this.generateImprovementSuggestions(text, trainingInfo);
    
    return analysis;
    
  } catch (error) {
    console.error('AI document analysis failed:', error);
    return {
      insights: ['AI analysis unavailable - using rule-based extraction'],
      confidence: 0.5,
      suggestions: [],
      metadata: { aiError: error.message }
    };
  }
}

async identifyDocumentSections(text) {
  // Rule-based section identification with AI enhancement potential
  const sections = {
    title: null,
    overview: null,
    weeks: [],
    sessions: [],
    equipment: [],
    notes: []
  };
  
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Enhanced pattern recognition
  const weekPattern = /^(week\s*\d+|training\s*week\s*\d+|phase\s*\d+)/i;
  const sessionPattern = /(session\s*\d+|day\s*\d+|training\s*day)/i;
  const equipmentPattern = /(equipment|materials|required|needed):/i;
  
  let currentSection = 'overview';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (weekPattern.test(line)) {
      currentSection = 'weeks';
      sections.weeks.push({
        lineNumber: i,
        title: line,
        content: []
      });
    } else if (sessionPattern.test(line)) {
      currentSection = 'sessions';
      sections.sessions.push({
        lineNumber: i,
        title: line,
        content: []
      });
    } else if (equipmentPattern.test(line)) {
      currentSection = 'equipment';
      sections.equipment.push(line);
    } else {
      // Add content to current section
      if (currentSection === 'overview' && !sections.overview) {
        sections.overview = line;
      } else if (currentSection === 'weeks' && sections.weeks.length > 0) {
        sections.weeks[sections.weeks.length - 1].content.push(line);
      } else if (currentSection === 'sessions' && sections.sessions.length > 0) {
        sections.sessions[sections.sessions.length - 1].content.push(line);
      }
    }
  }
  
  return sections;
}

async extractTrainingInformation(text) {
  try {
    const info = {
      insights: [],
      confidence: 0.7 // Default confidence for rule-based extraction
    };
    
    // Analyze training structure
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const totalLines = lines.length;
    
    // Check for structured training content
    const weekCount = (text.match(/week\s*\d+/gi) || []).length;
    const sessionCount = (text.match(/session\s*\d+|day\s*\d+/gi) || []).length;
    const exerciseCount = (text.match(/exercise|drill|workout|training/gi) || []).length;
    
    if (weekCount >= 4) {
      info.insights.push(`Structured ${weekCount}-week training program detected`);
      info.confidence += 0.1;
    }
    
    if (sessionCount >= 10) {
      info.insights.push(`${sessionCount} training sessions identified`);
      info.confidence += 0.1;
    }
    
    if (exerciseCount >= 20) {
      info.insights.push(`Exercise-rich content with ${exerciseCount} training references`);
      info.confidence += 0.1;
    }
    
    // Check for training terminology
    const trainingTerms = ['warm-up', 'cool-down', 'conditioning', 'strength', 'cardio', 'flexibility'];
    const foundTerms = trainingTerms.filter(term => 
      text.toLowerCase().includes(term.toLowerCase())
    );
    
    if (foundTerms.length >= 3) {
      info.insights.push(`Professional training terminology found: ${foundTerms.join(', ')}`);
      info.confidence += 0.1;
    }
    
    // Check document completeness
    if (totalLines > 100) {
      info.insights.push('Comprehensive document with detailed content');
    } else if (totalLines < 30) {
      info.insights.push('Brief document - may need additional details');
      info.confidence -= 0.1;
    }
    
    // Ensure minimum insights
    if (info.insights.length === 0) {
      info.insights.push('Basic training document structure detected');
    }
    
    // Cap confidence between 0.3 and 1.0
    info.confidence = Math.max(0.3, Math.min(1.0, info.confidence));
    
    return info;
    
  } catch (error) {
    console.error('Training information extraction failed:', error);
    return {
      insights: ['AI analysis unavailable - using basic extraction'],
      confidence: 0.5
    };
  }
}

async generateImprovementSuggestions(text, trainingInfo) {
  try {
    const suggestions = [];
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Check document structure
    const weekCount = (text.match(/week\s*\d+/gi) || []).length;
    const sessionCount = (text.match(/session\s*\d+|day\s*\d+/gi) || []).length;
    
    if (weekCount < 4) {
      suggestions.push('Consider extending to at least 4 weeks for better progression tracking');
    }
    
    if (sessionCount === 0) {
      suggestions.push('Add specific session structures with daily breakdowns');
    }
    
    // Check for missing components
    if (!text.toLowerCase().includes('warm-up') && !text.toLowerCase().includes('warm up')) {
      suggestions.push('Include warm-up routines for injury prevention');
    }
    
    if (!text.toLowerCase().includes('cool-down') && !text.toLowerCase().includes('cool down')) {
      suggestions.push('Add cool-down activities for proper recovery');
    }
    
    // Check for progression indicators
    if (!text.toLowerCase().includes('progress') && !text.toLowerCase().includes('advance')) {
      suggestions.push('Define progression metrics and advancement criteria');
    }
    
    // Check for equipment mentions
    if (!text.toLowerCase().includes('equipment') && !text.toLowerCase().includes('materials')) {
      suggestions.push('List required equipment and materials for each session');
    }
    
    // Check for safety considerations
    if (!text.toLowerCase().includes('safety') && !text.toLowerCase().includes('injury')) {
      suggestions.push('Include safety guidelines and injury prevention tips');
    }
    
    // Performance tracking suggestions
    if (!text.toLowerCase().includes('track') && !text.toLowerCase().includes('measure')) {
      suggestions.push('Add performance tracking and measurement guidelines');
    }
    
    // Age group considerations
    const hasAgeGroup = /\b(\d+[-–]\d+\s*years?|under\s*\d+|u\d+|\d+\s*years?|youth|adult)\b/i.test(text);
    if (!hasAgeGroup) {
      suggestions.push('Specify target age groups for better program customization');
    }
    
    // Ensure we have some suggestions
    if (suggestions.length === 0) {
      suggestions.push('Document structure looks good - consider adding more detailed session breakdowns');
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
    
  } catch (error) {
    console.error('Suggestion generation failed:', error);
    return ['Consider reviewing document structure and adding more detailed training information'];
  }
}

// ============= SINGLE SESSION IMPROVEMENT (FOR FAB) =============

async improveSingleSession(sessionData, userProfile = {}) {
  if (!this.initialized) {
    await this.initialize();
  }

  try {
    console.log('AIService: Improving single session with AI');
    
    if (this.isOnline && !this.fallbackMode) {
      return await this.improveSingleSessionWithHuggingFace(sessionData, userProfile);
    } else {
      return await this.improveSingleSessionWithFallback(sessionData, userProfile);
    }
  } catch (error) {
    console.error('AIService: Single session improvement error:', error);
    return await this.improveSingleSessionWithFallback(sessionData, userProfile);
  }
}

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

async improveSingleSessionWithFallback(sessionData, userProfile) {
  console.log('AIService: Using fallback session improvement');
  
  const sport = sessionData.sport?.toLowerCase() || 'general';
  const ageGroup = sessionData.ageGroup || 'Youth';
  const duration = sessionData.duration || 90;
  
  // Intelligent fallback improvements
  const improvements = {
    structure: [
      `Warm-up (${Math.round(duration * 0.15)} min): Dynamic stretching and light jogging`,
      `Technical Skills (${Math.round(duration * 0.35)} min): ${sport}-specific drills`,
      `Tactical Work (${Math.round(duration * 0.25)} min): Game situations and strategy`,
      `Conditioning (${Math.round(duration * 0.15)} min): Fitness and endurance`,
      `Cool-down (${Math.round(duration * 0.10)} min): Stretching and recovery`
    ],
    drills: this.generateSportSpecificDrills(sport, ageGroup, duration),
    safety: [
      'Ensure proper warm-up before intense activities',
      'Monitor hydration levels throughout session',
      'Check equipment condition before use',
      'Maintain appropriate work-to-rest ratios'
    ],
    progression: [
      'Start with basic movements, progress to complex',
      'Increase intensity gradually throughout session',
      'Provide individual modifications as needed'
    ],
    coachingTips: [
      'Use positive reinforcement to maintain motivation',
      'Demonstrate proper technique before each drill',
      'Encourage peer learning and support',
      'Focus on effort over outcome'
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

// ============= HELPER METHODS =============

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

// ============= OPTIMAL SCHEDULE GENERATION =============

async generateOptimalSchedule(trainingPlan, preferences = {}) {
  try {
    const defaultPreferences = {
      availableDays: ['monday', 'wednesday', 'friday'],
      preferredTime: '16:00',
      sessionDuration: 90,
      intensity: 'moderate'
    };

    const prefs = { ...defaultPreferences, ...preferences };
    
    return {
      planId: trainingPlan.id,
      sessions: this.createOptimalSessionSchedule(trainingPlan, prefs),
      generatedAt: new Date().toISOString(),
      preferences: prefs,
      aiGenerated: true
    };
  } catch (error) {
    console.error('Schedule generation failed:', error);
    return null;
  }
}

createOptimalSessionSchedule(trainingPlan, preferences) {
  const sessions = [];
  const { availableDays, preferredTime, sessionDuration } = preferences;
  
  // Generate 12 weeks of sessions
  for (let week = 1; week <= 12; week++) {
    availableDays.forEach((day, dayIndex) => {
      const sessionDate = this.calculateOptimalDate(week, day);
      
      sessions.push({
        id: `optimal_${week}_${dayIndex}_${Date.now()}`,
        week: week,
        day: day,
        date: sessionDate,
        time: preferredTime,
        duration: sessionDuration,
        type: this.getSessionType(week, dayIndex),
        intensity: this.calculateIntensity(week, preferences.intensity),
        focus: this.getWeeklyFocus(week, trainingPlan.category)
      });
    });
  }
  
  return sessions;
}

calculateOptimalDate(weekNumber, dayName) {
  const today = new Date();
  const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    .indexOf(dayName.toLowerCase());
  
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + (weekNumber - 1) * 7);
  
  const currentDay = targetDate.getDay();
  const daysToAdd = (dayIndex + 1 - currentDay + 7) % 7;
  targetDate.setDate(targetDate.getDate() + daysToAdd);
  
  return targetDate.toISOString().split('T')[0];
}

getSessionType(week, dayIndex) {
  const types = ['technique', 'tactics', 'fitness'];
  return types[dayIndex % types.length];
}

calculateIntensity(week, baseIntensity) {
  const intensityMap = { low: 0.6, moderate: 0.75, high: 0.9 };
  const base = intensityMap[baseIntensity] || 0.75;
  
  // Progressive intensity throughout the program
  const progression = Math.min(1.0, base + (week / 24));
  return Math.round(progression * 100);
}

getWeeklyFocus(week, sport) {
  const focusProgression = {
    soccer: ['ball control', 'passing', 'shooting', 'defending', 'tactics'],
    basketball: ['dribbling', 'shooting', 'passing', 'defense', 'game play'],
    general: ['coordination', 'strength', 'endurance', 'agility', 'teamwork']
  };
  
  const focuses = focusProgression[sport] || focusProgression.general;
  return [focuses[(week - 1) % focuses.length]];
}

extractAcademyName(text, trainingPlan) {
  const lines = text.split('\n').slice(0, 25); // Check first 25 lines
  
  // Enhanced academy extraction patterns
  const academyPatterns = [
    /^([A-Z][A-Z\s]+ACADEMY)/i,
    /^([A-Z][A-Z\s]+FOOTBALL\s+CLUB)/i,
    /^([A-Z][A-Z\s]+TRAINING\s+CENTER)/i,
    /^([A-Z][A-Z\s]+SPORTS\s+CLUB)/i,
    /academy[:\s]+([^.\n]+)/i,
    /club[:\s]+([^.\n]+)/i,
    /presented by[:\s]+([^.\n]+)/i,
    /coaching plan for[:\s]+([^.\n]+)/i,
    /^([A-Z][a-zA-Z\s]{10,50}(?:academy|football|training|sports|club))/im
  ];
  
  // First, try to find explicit academy mentions
  for (const line of lines) {
    for (const pattern of academyPatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        let academyName = match[1].trim();
        // Clean up the name
        academyName = academyName
          .replace(/[:\-–—]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (academyName.length >= 5 && academyName.length <= 50) {
          console.log('Found academy name:', academyName);
          return academyName;
        }
      }
    }
  }
  
  // Fallback: use training plan title or default
  return trainingPlan.academyName || trainingPlan.title || 'Training Academy';
}

// NEW METHOD: Academy info preview
async previewAcademyInfo(document) {
  try {
    const extractionResult = await this.extractDocumentText(document);
    const text = extractionResult.text;
    
    return {
      academyName: this.extractAcademyNameFromText(text),
      weeksCount: this.extractWeeksCount(text),
      sessionsCount: this.extractSessionsCount(text),
      estimatedHours: this.calculateTotalHours(text),
      sport: this.extractSportFromText(text),
      ageGroup: this.extractAgeGroupFromText(text)
    };
  } catch (error) {
    console.error('Academy info preview failed:', error);
    return {
      academyName: 'Training Academy',
      weeksCount: 12,
      sessionsCount: 36,
      estimatedHours: 54,
      sport: 'General',
      ageGroup: 'Youth'
    };
  }
}

extractAcademyNameFromText(text) {
  // Use the enhanced extraction logic
  return this.extractAcademyName(text, { title: 'Training Academy' });
}

extractWeeksCount(text) {
  const weekMatches = text.match(/week\s*\d+/gi) || [];
  const maxWeek = Math.max(...weekMatches.map(match => {
    const num = match.match(/\d+/);
    return num ? parseInt(num[0]) : 0;
  }));
  return maxWeek > 0 ? maxWeek : 12;
}

calculateTotalHours(text) {
  const weeksCount = this.extractWeeksCount(text);
  const avgSessionsPerWeek = 3;
  const avgHoursPerSession = 1.5;
  return weeksCount * avgSessionsPerWeek * avgHoursPerSession;
}

extractSportFromText(text) {
  const sportPatterns = {
    soccer: /soccer|football(?!\s+club)|fifa|pitch/gi,
    basketball: /basketball|nba|court|hoop|dribbl/gi,
    tennis: /tennis|racket|serve|volley/gi,
    swimming: /swim|pool|stroke|lap/gi
  };
  
  for (const [sport, pattern] of Object.entries(sportPatterns)) {
    if (pattern.test(text)) {
      return sport.charAt(0).toUpperCase() + sport.slice(1);
    }
  }
  return 'General';
}

extractAgeGroupFromText(text) {
  const agePatterns = [
    /(\d+[-–]\d+\s*years?)/i,
    /(under\s*\d+)/i,
    /(u\d+)/i,
    /(\d+\s*years?)/i,
    /(youth|junior|senior|adult)/i
  ];
  
  for (const pattern of agePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return 'Youth';
}

  // Document validation specific to platform
validateFileForPlatform(file) {
  const errors = [];
  
  // Basic validation
  if (!file || !file.size || !file.type || !file.name) {
    errors.push('Invalid file data');
    return { isValid: false, errors, suggestions: ['Select a valid file'] };
  }
  
  // Size validation
  if (file.size > this.fileSizeLimit) {
    errors.push(`File size exceeds ${Math.round(this.fileSizeLimit / 1024 / 1024)}MB limit`);
  }
  
  // Type validation
  if (!this.supportedFormats.includes(file.type)) {
    errors.push(`Unsupported file type: ${file.type}`);
  }
  
  // Platform-specific validations - REMOVE PDF blocking for web
  if (PlatformUtils.isWeb()) {
    if (file.size > 5 * 1024 * 1024) {
      errors.push('File too large for web platform (5MB limit)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    suggestions: errors.length > 0 ? [
      'Use supported file formats (.docx, .xlsx, .csv, .txt, .pdf)',
      `Keep file size under ${Math.round(this.fileSizeLimit / 1024 / 1024)}MB`,
      'Try compressing the file if it\'s too large'
    ] : []
  };
}



// ADD this entirely new method
async readDocumentData(document) {
  try {
    if (PlatformUtils.isWeb()) {
      // For web, prioritize stored webFileData
      if (document.webFileData && Array.isArray(document.webFileData)) {
        return {
          type: 'array',
          data: new Uint8Array(document.webFileData)
        };
      } else if (document.file && typeof document.file.arrayBuffer === 'function') {
        const buffer = await document.file.arrayBuffer();
        return {
          type: 'array', 
          data: new Uint8Array(buffer)
        };
      } else {
        throw PlatformUtils.createError('File data not accessible - document may need to be re-uploaded');
      }
    } else {
      // Mobile file reading
      if (!RNFS || !document.localPath) {
        throw PlatformUtils.createError('Mobile file not accessible');
      }
      
      const base64Data = await RNFS.readFile(document.localPath, 'base64');
      return {
        type: 'buffer',
        data: Buffer.from(base64Data, 'base64')
      };
    }
  } catch (error) {
    throw PlatformUtils.handlePlatformError(error, 'Document Data Reading');
  }
}

// ADD this entirely new method
generateFormatFallback(formatName, document, issues = []) {
  const timestamp = new Date().toLocaleDateString();
  
  return `
${formatName} Document Processing Notice
${'='.repeat(40)}

Document: ${document.originalName}
Size: ${this.formatFileSize(document.size)}
Uploaded: ${timestamp}
Platform: ${document.platform}

${issues.length > 0 ? 'Issues:\n' + issues.map(issue => `• ${issue}`).join('\n') : ''}

This document could not be processed automatically. 
Please convert to a supported text format for full processing capabilities.

Recommended formats:
- Word Document (.docx) - Best compatibility
- Plain Text (.txt) - Universal support  
- CSV (.csv) - For structured data

Document Information Available:
- Original filename: ${document.originalName}
- File type: ${document.type}
- Upload date: ${new Date(document.uploadedAt).toLocaleDateString()}
- File size: ${this.formatFileSize(document.size)}
  `.trim();
}

getDocumentFormat(document) {
  const type = document.type?.toLowerCase() || '';
  const name = document.originalName?.toLowerCase() || '';
  
  // More specific MIME type checking first
  if (type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || name.endsWith('.docx')) return 'word';
  if (type === 'application/msword' || name.endsWith('.doc')) return 'word';
  if (type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || name.endsWith('.xlsx')) return 'excel';
  if (type === 'application/vnd.ms-excel' || name.endsWith('.xls')) return 'excel';
  if (type === 'text/csv' || name.endsWith('.csv')) return 'csv';
  if (type === 'text/plain' || name.endsWith('.txt')) return 'text';
  
  // Fallback to generic checks
  if (type.includes('word') || type.includes('document')) return 'word';
  if (type.includes('excel') || type.includes('sheet')) return 'excel';
  if (type.includes('text') || type.includes('plain')) return 'text';
  
  return 'unknown';
}

// ADD this entirely new method
async extractDocumentText(document) {
  const format = this.getDocumentFormat(document);
  
  try {
    let extractedText = '';
    
    switch (format) {
      case 'word':
        extractedText = await this.extractWordTextUnified(document);
        break;
      case 'excel':
        extractedText = await this.extractExcelTextUnified(document);
        break;
      case 'csv':
        extractedText = await this.extractCSVTextUnified(document);
        break;
      case 'text':
        extractedText = await this.extractTextFileUnified(document);
        break;
      case 'pdf':
        extractedText = await this.extractPDFTextUnified(document);
        break;
      default:
        throw PlatformUtils.createError(`Unsupported format: ${format}`);
    }
    
    if (!extractedText || extractedText.trim().length === 0) {
      throw PlatformUtils.createError('No text content found in document');
    }
    
    return {
      text: extractedText,
      format,
      metadata: {
        originalFormat: format,
        extractedLength: extractedText.length,
        processingMethod: this.getProcessingMethod(format),
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error(`Text extraction failed for ${format}:`, error);
    throw error;
  }
}

getProcessingMethod(format) {
  const methods = {
    pdf: 'PDF.js / pdf-parse',
    word: 'Mammoth library',
    excel: 'XLSX library',
    csv: 'Direct text reading',
    text: 'Direct text reading'
  };
  return methods[format] || 'Unknown';
}

  // All your existing extraction methods remain the same
  extractTitle(lines, filename) {
    const titlePatterns = [
      /^title:\s*(.+)/i,
      /^program:\s*(.+)/i,
      /^plan:\s*(.+)/i,
      /^(.+)\s*(training|program|plan|workout|routine)/i,
      /^week\s*1.*?[-:]?\s*(.+)/i,
      /^session\s*1.*?[-:]?\s*(.+)/i
    ];

    for (const line of lines.slice(0, 15)) {
      const trimmed = line.trim();
      if (trimmed.length < 5 || trimmed.length > 100) continue;
      
      for (const pattern of titlePatterns) {
        const match = trimmed.match(pattern);
        if (match && match[1]) {
          let title = match[1].trim();
          title = title.replace(/[:\-–—]/g, '').trim();
          if (title.length > 5) {
            return title;
          }
        }
      }
      
      if (/^[A-Z][a-zA-Z\s]+/.test(trimmed) && trimmed.length > 10 && trimmed.length < 80) {
        return trimmed;
      }
    }

    return filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  extractCategory(lines) {
    const text = lines.join(' ').toLowerCase();
    
    const categories = {
      football: ['football', 'american football', 'nfl', 'gridiron', 'tackle'],
      soccer: ['soccer', 'football', 'fifa', 'futbol', 'pitch'],
      basketball: ['basketball', 'nba', 'court', 'hoop', 'dribble'],
      tennis: ['tennis', 'racket', 'court', 'serve', 'volley'],
      fitness: ['fitness', 'gym', 'workout', 'exercise', 'strength', 'cardio', 'conditioning']
    };

    let bestCategory = 'fitness';
    let bestScore = 0;
    
    for (const [category, keywords] of Object.entries(categories)) {
      const score = keywords.reduce((sum, keyword) => {
        const matches = (text.match(new RegExp(keyword, 'gi')) || []).length;
        return sum + matches;
      }, 0);
      
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }
    
    return bestCategory;
  }

  extractDuration(lines) {
    const text = lines.join(' ');
    
    const patterns = [
      /(\d+)\s*weeks?/i,
      /(\d+)\s*months?/i,
      /(\d+)\s*days?/i,
      /week\s*(\d+)/i,
      /month\s*(\d+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const num = parseInt(match[1]);
        if (pattern.toString().includes('month')) {
          return `${num} month${num > 1 ? 's' : ''}`;
        } else if (pattern.toString().includes('week') || pattern.toString().includes('Week')) {
          return `${num} week${num > 1 ? 's' : ''}`;
        } else {
          const weeks = Math.ceil(num / 7);
          return `${weeks} week${weeks > 1 ? 's' : ''}`;
        }
      }
    }
    
    return '8 weeks';
  }

  extractDifficulty(lines) {
    const text = lines.join(' ').toLowerCase();
    
    const difficultyKeywords = {
      beginner: ['beginner', 'basic', 'starter', 'introductory', 'novice', 'easy', 'foundation'],
      intermediate: ['intermediate', 'moderate', 'standard', 'regular', 'medium'],
      advanced: ['advanced', 'expert', 'professional', 'elite', 'pro', 'competitive', 'hard', 'intense']
    };
    
    let bestDifficulty = 'intermediate';
    let bestScore = 0;
    
    for (const [difficulty, keywords] of Object.entries(difficultyKeywords)) {
      const score = keywords.reduce((sum, keyword) => {
        return sum + (text.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > bestScore) {
        bestScore = score;
        bestDifficulty = difficulty;
      }
    }
    
    return bestDifficulty;
  }

// Fix the extractSessionsCount method in DocumentProcessor.js
extractSessionsCount(lines) {
  // Ensure lines is an array
  if (!Array.isArray(lines)) {
    if (typeof lines === 'string') {
      lines = lines.split('\n');
    } else {
      console.warn('extractSessionsCount received invalid input:', typeof lines);
      return 12; // default fallback
    }
  }
  
  const text = lines.join(' ');
  
  const sessionPatterns = [
    /(\d+)\s*sessions?/i,
    /session\s*(\d+)/i,
    /day\s*(\d+)/i,
    /workout\s*(\d+)/i
  ];
  
  let maxSessions = 0;
  
  for (const pattern of sessionPatterns) {
    const matches = text.matchAll(new RegExp(pattern, 'gi'));
    for (const match of matches) {
      const num = parseInt(match[1]);
      maxSessions = Math.max(maxSessions, num);
    }
  }
  
  if (maxSessions === 0) {
    const durationMatch = text.match(/(\d+)\s*weeks?/i);
    if (durationMatch) {
      const weeks = parseInt(durationMatch[1]);
      maxSessions = weeks * 3;
    }
  }
  
  return Math.max(maxSessions, 12);
}

  extractDescription(lines) {
    const descriptionLines = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.length < 30 || /^(week|day|session)\s*\d+/i.test(trimmed)) {
        continue;
      }
      
      if (/[.!?]$/.test(trimmed) && trimmed.length > 50) {
        descriptionLines.push(trimmed);
        if (descriptionLines.length >= 2) break;
      }
    }
    
    let description = descriptionLines.join(' ');
    
    if (description.length < 50) {
      const category = this.extractCategory(lines);
      const difficulty = this.extractDifficulty(lines);
      description = `A comprehensive ${difficulty} level ${category} training program designed to improve performance and achieve fitness goals.`;
    }
    
    return description.length > 200 ? description.substring(0, 197) + '...' : description;
  }

  extractTags(lines) {
    const text = lines.join(' ').toLowerCase();
    
    const possibleTags = [
      'strength', 'cardio', 'endurance', 'flexibility', 'power',
      'speed', 'agility', 'conditioning', 'core', 'upper body',
      'lower body', 'full body', 'recovery', 'warm up', 'cool down',
      'plyometric', 'resistance', 'bodyweight', 'weights', 'running',
      'jumping', 'balance', 'coordination', 'explosive', 'stamina',
      'youth', 'adult', 'professional', 'team', 'individual',
      'indoor', 'outdoor', 'gym', 'field', 'court'
    ];
    
    const foundTags = possibleTags.filter(tag => text.includes(tag));
    
    const category = this.extractCategory(lines);
    if (!foundTags.includes(category)) {
      foundTags.unshift(category);
    }
    
    return foundTags.slice(0, 5);
  }

  extractDetailedSessions(lines) {
    const sessions = [];
    let currentSession = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      const sessionMatch = trimmed.match(/^(week\s*\d+,?\s*)?(day\s*\d+|session\s*\d+|workout\s*\d+)/i);
      if (sessionMatch) {
        if (currentSession) {
          sessions.push(currentSession);
        }
        currentSession = {
          id: sessions.length + 1,
          title: trimmed,
          exercises: [],
          duration: null,
          notes: []
        };
      } else if (currentSession && trimmed.length > 10) {
        if (/\d+\s*(reps?|sets?|minutes?|seconds?)/.test(trimmed)) {
          currentSession.exercises.push(trimmed);
        } else {
          currentSession.notes.push(trimmed);
        }
      }
    }
    
    if (currentSession) {
      sessions.push(currentSession);
    }
    
    return sessions;
  }

  extractSchedule(lines) {
    const text = lines.join(' ').toLowerCase();
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const foundDays = days.filter(day => text.includes(day));
    
    if (foundDays.length > 0) {
      return {
        type: 'weekly',
        days: foundDays,
        pattern: `${foundDays.length} days per week`
      };
    }
    
    return {
      type: 'flexible',
      days: [],
      pattern: 'User-defined schedule'
    };
  }

  // Utility methods with enhanced error handling
// In DocumentProcessor.js, update the getUserInfo method:
// In DocumentProcessor.js, update the getUserInfo method:
async getUserInfo() {
  try {
    // Try multiple storage keys to find user data
    const storageKeys = [
      'authenticatedUser',
      'user_data', 
      'user_profile'
    ];
    
    for (const key of storageKeys) {
      try {
        const userInfo = await AsyncStorage.getItem(key);
        if (userInfo) {
          const parsed = JSON.parse(userInfo);
          
          return {
            username: parsed.username || null,
            firstName: parsed.firstName || null,
            lastName: parsed.lastName || null,
            fullName: `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || null,
            name: parsed.username || `${parsed.firstName || 'Coach'} ${parsed.lastName || ''}`.trim(),
            profileImage: parsed.profileImage || null
          };
        }
      } catch (error) {
        continue; // Try next key
      }
    }
  } catch (error) {
    console.log('Could not load user info:', error.message);
  }
  
  return { 
    username: null,
    firstName: 'Coach',
    lastName: '',
    fullName: 'Coach',
    name: 'Coach',
    profileImage: null
  };
}

// Fixed getStoredDocuments method
async getStoredDocuments() {
  try {
    const documents = await AsyncStorage.getItem('coaching_documents');
    const parsed = documents ? JSON.parse(documents) : [];
    
    // Validate document structure and restore web file data
    return parsed.map(doc => {
      const processedDoc = {
        id: doc.id || `doc_${Date.now()}`,
        originalName: doc.originalName || 'Unknown Document',
        type: doc.type || 'text/plain',
        size: doc.size || 0,
        uploadedAt: doc.uploadedAt || new Date().toISOString(),
        processed: doc.processed || false,
        platform: doc.platform || 'unknown',
        localPath: doc.localPath,
        uri: doc.uri,
        processedAt: doc.processedAt
      };
      
      // Restore web file data if available
      if (PlatformUtils.isWeb() && doc.webFileData) {
        try {
          // Ensure webFileData is properly restored
          if (Array.isArray(doc.webFileData)) {
            processedDoc.webFileData = doc.webFileData;
            console.log('Restored web file data for document:', doc.id, 'size:', doc.webFileData.length);
          } else {
            console.warn('webFileData is not in expected array format for document:', doc.id);
          }
        } catch (error) {
          console.warn('Could not restore web file data for document:', doc.id, error.message);
        }
      }
      
      return processedDoc;
    });
  } catch (error) {
    console.error('Error loading stored documents:', error);
    return [];
  }
}

  async getTrainingPlans() {
    try {
      const plans = await AsyncStorage.getItem('training_plans');
      const parsedPlans = plans ? JSON.parse(plans) : [];
      
      return parsedPlans.map(plan => ({
        id: plan.id || `plan_${Date.now()}`,
        title: plan.title || 'Untitled Plan',
        category: plan.category || 'fitness',
        duration: plan.duration || '8 weeks',
        difficulty: plan.difficulty || 'intermediate',
        sessionsCount: plan.sessionsCount || 12,
        description: plan.description || 'Training program description',
        creator: plan.creator || 'Coach',
        rating: plan.rating || 0,
        downloads: plan.downloads || 0,
        tags: plan.tags || [],
        image: plan.image || null,
        isPublic: plan.isPublic !== undefined ? plan.isPublic : false,
        isOwned: plan.isOwned !== undefined ? plan.isOwned : true,
        progress: plan.progress || 0,
        price: plan.price || null,
        createdAt: plan.createdAt || new Date().toISOString(),
        sourceDocument: plan.sourceDocument || null,
        sessions: plan.sessions || [],
        schedule: plan.schedule || { type: 'flexible', days: [], pattern: 'User-defined' },
        platform: plan.platform || 'unknown'
      }));
    } catch (error) {
      console.error('Error loading training plans:', error);
      return [];
    }
  }

  async saveTrainingPlan(trainingPlan) {
    try {
      const existingPlans = await this.getTrainingPlans();
      existingPlans.push(trainingPlan);
      await AsyncStorage.setItem('training_plans', JSON.stringify(existingPlans));
      
      PlatformUtils.logDebugInfo('Training plan saved', { 
        planId: trainingPlan.id,
        platform: trainingPlan.platform 
      });
      
      return trainingPlan;
    } catch (error) {
      throw PlatformUtils.handlePlatformError(error, 'Training Plan Save');
    }
  }

  async updateDocumentMetadata(updatedDoc) {
    try {
      const documents = await this.getStoredDocuments();
      const index = documents.findIndex(doc => doc.id === updatedDoc.id);
      if (index !== -1) {
        documents[index] = updatedDoc;
        await AsyncStorage.setItem('coaching_documents', JSON.stringify(documents));
        
        PlatformUtils.logDebugInfo('Document metadata updated', { 
          documentId: updatedDoc.id 
        });
      }
    } catch (error) {
      throw PlatformUtils.handlePlatformError(error, 'Document Metadata Update');
    }
  }

async deleteDocument(documentId) {
  try {
    const documents = await this.getStoredDocuments();
    const document = documents.find(doc => doc.id === documentId);
    
    if (document) {
      // Clean up platform-specific resources
      if (PlatformUtils.isMobile() && document.localPath && RNFS) {
        try {
          await RNFS.unlink(document.localPath);
        } catch (error) {
          console.warn('Could not delete local file:', error.message);
        }
      } else if (PlatformUtils.isWeb()) {
        // Clean up web resources
        if (document.uri && document.uri.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(document.uri);
          } catch (error) {
            console.warn('Could not revoke blob URL:', error.message);
          }
        }
        // No need to explicitly clean up webFileData - it will be garbage collected
      }
      
      const filteredDocs = documents.filter(doc => doc.id !== documentId);
      
      // Convert web file data for storage
      const docsToStore = filteredDocs.map(doc => {
        if (PlatformUtils.isWeb() && doc.webFileData) {
          return {
            ...doc,
            webFileData: Array.from(new Uint8Array(doc.webFileData))
          };
        }
        return doc;
      });
      
      await AsyncStorage.setItem('coaching_documents', JSON.stringify(docsToStore));
      
      PlatformUtils.logDebugInfo('Document deleted', { documentId });
    }
    
    return true;
  } catch (error) {
    throw PlatformUtils.handlePlatformError(error, 'Document Deletion');
  }
}

  // Health check with comprehensive status
  async healthCheck() {
    try {
      const capabilities = this.getCapabilities();
      const storageInfo = await this.getStorageInfo();
      const permissions = await PlatformUtils.checkPermissions();
      const moduleAvailability = PlatformUtils.checkModuleAvailability();
      
      return {
        status: 'healthy',
        initialized: this.initialized,
        capabilities,
        storage: storageInfo,
        permissions,
        moduleAvailability,
        platform: PlatformUtils.isWeb() ? 'web' : 'mobile',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        platform: PlatformUtils.isWeb() ? 'web' : 'mobile',
        timestamp: new Date().toISOString()
      };
    }
  }

  async getStorageInfo() {
    try {
      const documents = await this.getStoredDocuments();
      const plans = await this.getTrainingPlans();
      
      let totalSize = 0;
      documents.forEach(doc => {
        totalSize += doc.size || 0;
      });
      
      return {
        documentsCount: documents.length,
        plansCount: plans.length,
        totalStorageUsed: totalSize,
        platform: PlatformUtils.isWeb() ? 'web' : 'mobile',
        storageLimit: this.fileSizeLimit,
        supportedFormats: this.supportedFormats
      };
    } catch (error) {
      throw PlatformUtils.handlePlatformError(error, 'Storage Info Retrieval');
    }
  }

  getCapabilities() {
    return {
      fileSelection: PlatformUtils.isFeatureSupported('fileSelection'),
      wordProcessing: PlatformUtils.isFeatureSupported('wordProcessing') && !!mammoth,
      excelProcessing: PlatformUtils.isFeatureSupported('excelProcessing') && !!XLSX,
      csvProcessing: PlatformUtils.isFeatureSupported('csvProcessing'),
      pdfProcessing: PlatformUtils.isFeatureSupported('pdfProcessing'),
      localFileSystem: PlatformUtils.isFeatureSupported('localFileSystem') && !!RNFS,
      maxFileSize: this.fileSizeLimit,
      supportedFormats: this.supportedFormats,
      platform: PlatformUtils.isWeb() ? 'web' : 'mobile',
      modulesLoaded: {
        documentPicker: !!DocumentPicker,
        fileSystem: !!RNFS,
        mammoth: !!mammoth,
        xlsx: !!XLSX
      }
    };
  }

  // Clean shutdown method
  async shutdown() {
    try {
      PlatformUtils.logDebugInfo('DocumentProcessor shutting down');
      
      // Clean up any resources if needed
      if (PlatformUtils.isWeb()) {
        // Revoke any blob URLs that might still be active
        const documents = await this.getStoredDocuments();
        documents.forEach(doc => {
          if (doc.uri && doc.uri.startsWith('blob:')) {
            try {
              URL.revokeObjectURL(doc.uri);
            } catch (error) {
              console.warn('Error revoking blob URL:', error.message);
            }
          }
        });
      }
      
      this.initialized = false;
      modulesInitialized = false;
      
      return true;
    } catch (error) {
      console.warn('Error during shutdown:', error.message);
      return false;
    }
  }
}

// Create and export singleton instance
const documentProcessorInstance = new DocumentProcessor();

export default documentProcessorInstance;
