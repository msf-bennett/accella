// src/utils/PlatformUtils.js
import { Platform } from 'react-native';
import React from 'react';

class PlatformUtils {
  static isWeb() {
    return Platform.OS === 'web';
  }

  static isMobile() {
    return Platform.OS !== 'web';
  }

  static isIOS() {
    return Platform.OS === 'ios';
  } // Fixed: Added missing closing brace

  static isAndroid() {
    return Platform.OS === 'android';
  }

  // Safe component loaders to prevent requireNativeComponent errors
  static loadMaterialIcons() {
    if (this.isWeb()) {
      // Return a web-compatible icon component
      return ({ name, size = 24, color = '#000', style, ...props }) => {
        // Use Unicode symbols or CSS icons for web
        const iconMap = {
          'cloud-upload': '☁️',
          'picture-as-pdf': '📄',
          'description': '📝',
          'grid-on': '📊',
          'table-chart': '📈',
          'insert-drive-file': '📄',
          'arrow-right': '→',
          'upload': '⬆️',
          'verified': '✓',
          'warning': '⚠️',
          'error': '❌',
          'help-outline': '❓',
          'security': '🔒',
          'refresh': '🔄',
          'delete': '🗑️',
          'delete-outline': '🗑️',
          'check-circle': '✅',
          'info': 'ℹ️',
          'favorite': '❤️',
          'favorite-border': '🤍',
          'push-pin': '📌',
          'outline': '⭕'
        };
        
        return React.createElement('span', {
          style: {
            fontSize: size,
            color: color,
            fontFamily: 'monospace',
            display: 'inline-block',
            textAlign: 'center',
            ...style
          },
          ...props
        }, iconMap[name] || '📄');
      };
    } else {
      try {
        return require('react-native-vector-icons/MaterialIcons').default;
      } catch (error) {
        console.warn('MaterialIcons not available, using fallback');
        return ({ name, size = 24, color = '#000' }) => 
          React.createElement('text', { 
            style: { fontSize: size, color } 
          }, '📄');
      }
    }
  }

  static loadLinearGradient() {
    if (this.isWeb()) {
      // Return a web-compatible gradient component
      return ({ colors = ['#000', '#fff'], style, children, ...props }) => {
        const gradient = colors.length === 2 
          ? `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`
          : `linear-gradient(135deg, ${colors.join(', ')})`;
        
        return React.createElement('div', {
          style: {
            background: gradient,
            ...style
          },
          ...props
        }, children);
      };
    } else {
      try {
        return require('react-native-linear-gradient').default;
      } catch (error) {
        console.warn('LinearGradient not available, using fallback');
        return ({ colors, style, children }) => 
          React.createElement('view', { 
            style: { backgroundColor: colors?.[0] || '#000', ...style } 
          }, children);
      }
    }
  }

  // Safe import wrapper that handles missing modules
  static async safeImport(moduleName, fallback = null) {
    try {
      if (this.isWeb() && this.isWebIncompatible(moduleName)) {
        console.warn(`Module ${moduleName} is not compatible with web platform`);
        return fallback;
      }
      
      const moduleMap = {
        'expo-document-picker': async () => {
          if (this.isMobile()) {
            try {
              const module = require('expo-picker');
              return module.default || module;
            } catch (error) {
              console.warn('expo-document-picker not available');
              return fallback;
            }
          }
          return fallback;
        },
        'expo-file-system': async () => {
          if (this.isMobile()) {
            try {
              const module = require('expo-file-system');
              return module.default || module;
            } catch (error) {
              console.warn('expo-file-system not available');
              return fallback;
            }
          }
          return fallback;
        },
        'mammoth': async () => {
          try {
            const module = require('mammoth');
            return module.default || module;
          } catch (error) {
            console.warn('mammoth not available');
            return fallback;
          }
        },
        'xlsx': async () => {
          try {
            const module = require('xlsx');
            return module.default || module;
          } catch (error) {
            console.warn('xlsx not available');
            return fallback;
          }
        }
      };

      const moduleLoader = moduleMap[moduleName];
      if (moduleLoader) {
        return await moduleLoader();
      }
      
      console.warn(`Unknown module: ${moduleName}`);
      return fallback;
    } catch (error) {
      console.warn(`Failed to import ${moduleName}:`, error.message);
      return fallback;
    }
  }

  // Specific module loaders with better error handling
  static async loadDocumentPicker() {
    if (this.isWeb()) {
      return null; // Not available on web, use HTML input instead
    }
    
    try {
      const DocumentPicker = require('expo-document-picker');
      return DocumentPicker.default || DocumentPicker;
    } catch (error) {
      console.warn('DocumentPicker not available:', error.message);
      return null;
    }
  }

  static async loadFileSystem() {
    if (this.isWeb()) {
      return null; // Not available on web, use browser APIs instead
    }
    
    try {
      const RNFS = require('expo-file-system');
      return RNFS.default || RNFS;
    } catch (error) {
      console.warn('RNFS not available:', error.message);
      return null;
    }
  }

  static async loadMammoth() {
    try {
      const mammoth = require('mammoth');
      return mammoth.default || mammoth;
    } catch (error) {
      console.warn('Mammoth not available:', error.message);
      return null;
    }
  }

  static async loadXLSX() {
    try {
      const XLSX = require('xlsx');
      return XLSX.default || XLSX;
    } catch (error) {
      console.warn('XLSX not available:', error.message);
      return null;
    }
  }

  // Check if module is web incompatible
  static isWebIncompatible(moduleName) {
    const webIncompatibleModules = [
      'expo-document-picker',
      'expo-file-system',
      'react-native-pdf',
      'react-native-image-picker',
      'react-native-permissions',
      'react-native-keychain',
      'react-native-vector-icons',
      'react-native-linear-gradient'
    ];
    
    return webIncompatibleModules.includes(moduleName);
  }

  // Get platform-specific file size limit
  static getFileSizeLimit() {
    return this.isWeb() ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB web, 10MB mobile
  }

    // Update the method to properly include PDF for both platforms:
    static getSupportedFormats() {
      const baseFormats = [
        'text/plain',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/pdf'  // Now properly supported on both platforms
      ];

      if (this.isMobile()) {
        baseFormats.push(
          'application/vnd.ms-excel'
        );
      }

      return baseFormats;
    }

    //check PDF viewing capability:
    static isPDFViewingSupported() {
  if (this.isWeb()) {
    // Web browsers can display PDFs in iframe
    return true;
  } else {
    // Mobile depends on WebView availability
    try {
      require('react-native-webview');
      return true;
    } catch (error) {
      return false;
    }
  }
}

  // Enhanced error creation with platform context and integrity check support
  static createError(message, suggestions = [], errorType = 'general', metadata = {}) {
    const platformSuggestions = this.isWeb() 
      ? [
          'Try using Chrome or Firefox for better compatibility',
          'Ensure file size is under 5MB for web uploads',
          'Use Word (.docx) or Excel (.xlsx) formats for best results',
          ...suggestions
        ]
      : [
          'Check device storage space',
          'Ensure app has storage permissions',
          'Try restarting the app if issues persist',
          ...suggestions
        ];

    const error = new Error(message);
    error.suggestions = platformSuggestions;
    error.platform = this.isWeb() ? 'web' : 'mobile';
    error.errorType = errorType;
    error.timestamp = new Date().toISOString();
    error.metadata = {
      platform: Platform.OS,
      ...metadata
    };
    
    return error;
  }

  // Show platform-appropriate error messages with better categorization
  static getErrorMessage(error, context = '', includeMetadata = false) {
    const baseMessage = error.message || 'An error occurred';
    const platformContext = this.isWeb() ? 'Web' : 'Mobile';
    
    let message = `[${platformContext}] ${context}: ${baseMessage}`;
    
    if (includeMetadata && error.metadata) {
      message += `\nPlatform: ${error.metadata.platform}`;
      if (error.timestamp) {
        message += `\nTimestamp: ${new Date(error.timestamp).toLocaleString()}`;
      }
    }
    
    return message;
  }

  // Platform-specific storage paths
  static getStoragePath() {
    if (this.isWeb()) {
      return 'web-storage'; // Virtual path for web
    }
    return 'documents'; // Mobile document directory
  }

  // Check if feature is supported on current platform
  static isFeatureSupported(feature) {
    const webSupported = {
      fileSelection: true,
      wordProcessing: true,
      excelProcessing: true,
      csvProcessing: true,
      pdfProcessing: true,
      localFileSystem: false,
      nativeFilePicker: false,
      backgroundProcessing: false,
      vectorIcons: false, // Use fallback icons
      gradients: true, // CSS gradients available
      integrityChecking: true, // Browser-based integrity checks
      fileRepair: false, // Limited repair capabilities on web
      batchProcessing: true
    };

    const mobileSupported = {
      fileSelection: true,
      wordProcessing: true,
      excelProcessing: true,
      csvProcessing: true,
      pdfProcessing: true,
      localFileSystem: true,
      nativeFilePicker: true,
      backgroundProcessing: true,
      vectorIcons: true,
      gradients: true,
      integrityChecking: true,
      fileRepair: true,
      batchProcessing: true
    };

    if (this.isWeb()) {
      return webSupported[feature] || false;
    } else {
      return mobileSupported[feature] || false;
    }
  }

  // Add this new method to PlatformUtils:
static async loadPDFProcessor() {
  try {
    const PDFProcessor = await import('../services/PDFProcessor');
    return PDFProcessor.default;
  } catch (error) {
    console.warn('PDFProcessor not available:', error.message);
    return null;
  }
}

  // Get platform-appropriate loading messages
  static getLoadingMessage(operation) {
    const messages = {
      web: {
        fileSelection: 'Opening file browser...',
        processing: 'Processing document in browser...',
        saving: 'Saving to browser storage...',
        loading: 'Loading from browser storage...',
        integrityCheck: 'Verifying file integrity...',
        repair: 'Attempting to repair file...',
        batch: 'Processing multiple files...'
      },
      mobile: {
        fileSelection: 'Opening native file picker...',
        processing: 'Processing document...',
        saving: 'Saving to device storage...',
        loading: 'Loading from device storage...',
        integrityCheck: 'Running integrity checks...',
        repair: 'Repairing file integrity...',
        batch: 'Batch processing documents...'
      }
    };

    const platform = this.isWeb() ? 'web' : 'mobile';
    return messages[platform][operation] || `${operation}...`;
  }

  // Handle platform-specific permissions
  static async checkPermissions() {
    if (this.isWeb()) {
      // Check if File API and other web APIs are available
      const hasFileAPI = typeof File !== 'undefined' && typeof FileReader !== 'undefined';
      const hasArrayBuffer = typeof ArrayBuffer !== 'undefined';
      const hasBlob = typeof Blob !== 'undefined';
      
      return {
        granted: hasFileAPI && hasArrayBuffer && hasBlob,
        message: hasFileAPI ? 'Web file APIs available' : 'Web file APIs not supported',
        details: {
          fileAPI: hasFileAPI,
          arrayBuffer: hasArrayBuffer,
          blob: hasBlob
        }
      };
    }
    
    try {
      // On mobile, we assume permissions are handled by the libraries
      return { 
        granted: true, 
        message: 'Storage permissions assumed granted',
        details: { platform: 'mobile' }
      };
    } catch (error) {
      return { 
        granted: false, 
        message: 'Storage permissions required',
        error: error.message
      };
    }
  }

  // Get appropriate file input accept attribute for web
  static getFileInputAccept() {
    if (!this.isWeb()) return null;
    
    return '.pdf,.docx,.xlsx,.xls,.csv,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,text/plain';
  }

  // Log platform-specific debug info with enhanced metadata
  static logDebugInfo(context, data = {}) {
    if (__DEV__) {
      const logData = {
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
        context,
        ...data
      };
      
      // Add platform-specific metadata
      if (this.isWeb()) {
        logData.userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
        logData.webAPI = {
          fileAPI: typeof File !== 'undefined',
          arrayBuffer: typeof ArrayBuffer !== 'undefined',
          blob: typeof Blob !== 'undefined'
        };
      }
      
      console.log(`[${this.isWeb() ? 'WEB' : 'MOBILE'}] ${context}:`, logData);
    }
  }

  // Helper method to safely execute platform-specific code with error handling
  // In PlatformUtils.js, replace the existing executePlatformSpecific method:
static async executePlatformSpecific(webFn, mobileFn, fallback = null, timeout = 30000) {
  try {
    const operation = this.isWeb() && webFn 
      ? webFn()
      : this.isMobile() && mobileFn 
      ? mobileFn()
      : fallback;
        
    // Don't apply timeout to user interaction operations
    if (operation && typeof operation.then === 'function') {
      // Check if this is a user interaction operation (file selection)
      const isUserInteraction = webFn && webFn.toString().includes('selectDocument');
      
      if (isUserInteraction) {
        // No timeout for user interactions - let them take as long as needed
        return await operation;
      } else {
        // Apply timeout only for automated operations
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Platform operation timeout')), timeout)
        );
        return await Promise.race([operation, timeoutPromise]);
      }
    }
    
    return operation;
  } catch (error) {
    console.warn('Platform-specific execution failed:', error.message);
    
    if (error.message.includes('timeout')) {
      throw this.createError(
        'Operation timed out',
        ['Try again with a smaller file', 'Check your connection'],
        'timeout'
      );
    }
    
    return fallback;
  }
}

// New method specifically for user interactions 
static async executeUserInteraction(webFn, mobileFn, fallback = null) {
  try {
    const operation = this.isWeb() && webFn 
      ? webFn()
      : this.isMobile() && mobileFn 
      ? mobileFn()
      : fallback;
        
    // No timeout for user interactions
    if (operation && typeof operation.then === 'function') {
      return await operation;
    }
    
    return operation;
  } catch (error) {
    console.warn('User interaction failed:', error.message);
    throw error; // Don't wrap user cancellations
  }
}

  // Enhanced module availability check with integrity status
  static checkModuleAvailability() {
    const availability = {
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
      modules: {},
      components: {},
      integritySupport: {}
    };

    // Check native modules
    const moduleCheckers = {
      'expo-document-picker': () => {
        if (this.isWeb()) {
          return { available: false, reason: 'web-incompatible', alternative: 'HTML file input' };
        }
        try {
          require('expo-document-picker');
          return { available: true, reason: 'loaded' };
        } catch (error) {
          return { available: false, reason: error.message };
        }
      },
      'expo-file-system': () => {
        if (this.isWeb()) {
          return { available: false, reason: 'web-incompatible', alternative: 'Browser APIs' };
        }
        try {
          require('expo-file-system');
          return { available: true, reason: 'loaded' };
        } catch (error) {
          return { available: false, reason: error.message };
        }
      },
      'mammoth': () => {
        try {
          require('mammoth');
          return { available: true, reason: 'loaded' };
        } catch (error) {
          return { available: false, reason: error.message };
        }
      },
      'xlsx': () => {
        try {
          require('xlsx');
          return { available: true, reason: 'loaded' };
        } catch (error) {
          return { available: false, reason: error.message };
        }
      }
    };

    // Check UI components
    const componentCheckers = {
      'react-native-vector-icons': () => {
        if (this.isWeb()) {
          return { available: false, reason: 'web-incompatible', alternative: 'Unicode/CSS icons' };
        }
        try {
          require('react-native-vector-icons/MaterialIcons');
          return { available: true, reason: 'loaded' };
        } catch (error) {
          return { available: false, reason: error.message, alternative: 'Text fallback' };
        }
      },
      'react-native-linear-gradient': () => {
        if (this.isWeb()) {
          return { available: false, reason: 'web-incompatible', alternative: 'CSS gradients' };
        }
        try {
          require('react-native-linear-gradient');
          return { available: true, reason: 'loaded' };
        } catch (error) {
          return { available: false, reason: error.message, alternative: 'Solid colors' };
        }
      }
    };

    // Check integrity support capabilities
    availability.integritySupport = {
      basicChecks: true,
      storageVerification: true,
      readabilityTests: true,
      processingReadiness: true,
      fileRepair: this.isFeatureSupported('fileRepair'),
      batchProcessing: this.isFeatureSupported('batchProcessing'),
      realTimeValidation: this.isWeb() // Real-time validation works better on web
    };

    // Check each module
    Object.keys(moduleCheckers).forEach(moduleName => {
      availability.modules[moduleName] = moduleCheckers[moduleName]();
    });

    // Check each component
    Object.keys(componentCheckers).forEach(componentName => {
      availability.components[componentName] = componentCheckers[componentName]();
    });

    return availability;
  }

  // Safe component loader with fallbacks
  static getSafeComponent(componentName, fallbackProps = {}) {
    try {
      switch (componentName) {
        case 'MaterialIcons':
          return this.loadMaterialIcons();
        case 'LinearGradient':
          return this.loadLinearGradient();
        default:
          console.warn(`Unknown component: ${componentName}`);
          return null;
      }
    } catch (error) {
      console.warn(`Failed to load component ${componentName}:`, error.message);
      return null;
    }
  }

  // Initialize all platform-specific components and modules with integrity support
  static async initializePlatform() {
    const results = {
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
      initialized: {
        components: {},
        modules: {},
        integrityChecks: {}
      },
      errors: []
    };

    // Initialize components
    try {
      results.initialized.components.MaterialIcons = !!this.loadMaterialIcons();
      results.initialized.components.LinearGradient = !!this.loadLinearGradient();
    } catch (error) {
      results.errors.push(`Component initialization failed: ${error.message}`);
    }

    // Initialize modules
    try {
      results.initialized.modules.DocumentPicker = !!(await this.loadDocumentPicker());
      results.initialized.modules.FileSystem = !!(await this.loadFileSystem());
      results.initialized.modules.Mammoth = !!(await this.loadMammoth());
      results.initialized.modules.XLSX = !!(await this.loadXLSX());
    } catch (error) {
      results.errors.push(`Module initialization failed: ${error.message}`);
    }

    // Initialize integrity check capabilities
    try {
      const permissions = await this.checkPermissions();
      results.initialized.integrityChecks = {
        permissionsGranted: permissions.granted,
        basicChecksEnabled: true,
        storageVerificationEnabled: true,
        readabilityTestsEnabled: true,
        repairCapabilitiesEnabled: this.isFeatureSupported('fileRepair'),
        batchProcessingEnabled: this.isFeatureSupported('batchProcessing')
      };
    } catch (error) {
      results.errors.push(`Integrity checks initialization failed: ${error.message}`);
    }

    this.logDebugInfo('Platform initialized', results);
    return results;
  }

  // Get platform-specific style adjustments
  static getPlatformStyles() {
    if (this.isWeb()) {
      return {
        // Web-specific style adjustments
        shadowOffset: undefined, // Use boxShadow instead
        elevation: undefined, // Use boxShadow instead
        // Add web-specific styles
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        userSelect: 'none'
      };
    } else {
      return {
        // Mobile-specific styles
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
      };
    }
  }

  // Enhanced error handling with platform context and integrity check support
  static handlePlatformError(error, context = '', includeIntegrityInfo = false) {
    const platformContext = this.isWeb() ? 'Web' : 'Mobile';
    let errorMessage = `[${platformContext}] ${context}: ${error.message}`;
    
    console.error(errorMessage, error);
    
    // Add this new case for timeout errors:
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      return this.createError(
        'Operation timed out - file selection took too long',
        [
          'Click the upload button again to retry',
          'Make sure to select a file when the browser dialog opens',
          'Check if popup blockers are preventing the file dialog',
          'Try using a smaller file if the issue persists',
          'Refresh the page and try again'
        ],
        'timeout_error',
        { originalError: error.message, context }
      );
    }
    
    if (error.message.includes('Could not find file')) {
      return this.createError(
        'File data not accessible',
        [
          'File may have been cleared from memory',
          'Try uploading the file again',
          'Process files immediately after upload for better reliability'
        ],
        'file_access_error',
        { originalError: error.message, context }
      );
    }
    
    if (error.message.includes('arrayBuffer') || error.message.includes('buffer')) {
      return this.createError(
        'File processing error - invalid file data',
        [
          'File may be corrupted or in an unsupported format',
          'Try re-saving the file in the native application',
          'Ensure the file is not password protected'
        ],
        'file_processing_error',
        { originalError: error.message, context }
      );
    }
    
    if (error.message.includes('timeout')) {
      return this.createError(
        'Operation timed out',
        [
          'Try again with a smaller file',
          'Check your internet connection',
          'Close other applications to free up resources'
        ],
        'timeout_error',
        { originalError: error.message, context }
      );
    }
    
    // Include integrity information if requested
    if (includeIntegrityInfo) {
      const integritySupport = this.checkModuleAvailability().integritySupport;
      errorMessage += `\nIntegrity Support: ${JSON.stringify(integritySupport)}`;
    }
    
    return this.createError(errorMessage, [], 'general_error', {
      originalError: error.message,
      context,
      platform: platformContext
    });
  }

  // Validate file integrity requirements for platform
  static validateIntegrityRequirements(fileData) {
    const requirements = {
      valid: true,
      errors: [],
      warnings: []
    };
    
    // Platform-specific validations
    if (this.isWeb()) {
      if (!fileData.file && !fileData.webFileData) {
        requirements.valid = false;
        requirements.errors.push('No web file data available for integrity checking');
      }
      
      if (fileData.size > this.getFileSizeLimit()) {
        requirements.valid = false;
        requirements.errors.push('File too large for web platform integrity checking');
      }
    } else {
      if (!fileData.localPath) {
        requirements.valid = false;
        requirements.errors.push('No local file path available for integrity checking');
      }
    }
    
    return requirements;
  }
}

export default PlatformUtils;