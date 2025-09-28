//src/services/PDFProcessor.js
import PlatformUtils from '../utils/PlatformUtils';

class PDFProcessor {
  constructor() {
    this.initialized = false;
    this.pdfLibrary = null;
    this.initializationPromise = null;
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
      if (PlatformUtils.isWeb()) {
        await this._initializeWebPDFLibrary();
      } else {
        await this._initializeMobilePDFLibrary();
      }
      
      this.initialized = true;
      PlatformUtils.logDebugInfo('PDFProcessor initialized', {
        platform: PlatformUtils.isWeb() ? 'web' : 'mobile',
        hasLibrary: !!this.pdfLibrary
      });
    } catch (error) {
      console.error('PDFProcessor initialization failed:', error);
      throw PlatformUtils.createError(
        'PDF processing library initialization failed',
        [
          'Check internet connection for web platform',
          'Ensure pdf-parse is installed for mobile',
          'Try refreshing the page or restarting the app'
        ],
        'pdf_init_error'
      );
    }
  }

  async _initializeWebPDFLibrary() {
    try {
      // For web, we'll use PDF.js which is available via CDN
      if (typeof window !== 'undefined' && !window.pdfjsLib) {
        await this._loadPDFJSFromCDN();
      }
      
      if (window.pdfjsLib) {
        this.pdfLibrary = window.pdfjsLib;
        // Configure worker
        this.pdfLibrary.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        PlatformUtils.logDebugInfo('PDF.js loaded for web platform');
      } else {
        throw new Error('PDF.js failed to load from CDN');
      }
    } catch (error) {
      console.error('Web PDF library initialization failed:', error);
      throw error;
    }
  }

  async _initializeMobilePDFLibrary() {
    try {
      // For mobile, try to use pdf-parse if available
      const pdfParse = await PlatformUtils.safeImport('pdf-parse', null);
      
      if (pdfParse) {
        this.pdfLibrary = pdfParse;
        PlatformUtils.logDebugInfo('pdf-parse loaded for mobile platform');
      } else {
        // Fallback: use a basic text extraction method
        console.warn('pdf-parse not available, using fallback method');
        this.pdfLibrary = { fallback: true };
      }
    } catch (error) {
      console.error('Mobile PDF library initialization failed:', error);
      this.pdfLibrary = { fallback: true };
    }
  }

  async _loadPDFJSFromCDN() {
    return new Promise((resolve, reject) => {
      if (typeof document === 'undefined') {
        reject(new Error('Document not available'));
        return;
      }

      // Check if already loaded
      if (window.pdfjsLib) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        if (window.pdfjsLib) {
          resolve();
        } else {
          reject(new Error('PDF.js loaded but library not available'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load PDF.js from CDN'));
      
      document.head.appendChild(script);
    });
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.init();
    }
  }

  async extractTextFromPDF(document) {
    try {
      await this.ensureInitialized();

      PlatformUtils.logDebugInfo('Starting PDF text extraction', {
        documentId: document.id,
        platform: PlatformUtils.isWeb() ? 'web' : 'mobile',
        hasLibrary: !!this.pdfLibrary
      });

      if (PlatformUtils.isWeb()) {
        return await this._extractTextFromPDFWeb(document);
      } else {
        return await this._extractTextFromPDFMobile(document);
      }
    } catch (error) {
      console.error('PDF text extraction failed:', error);
      throw PlatformUtils.handlePlatformError(error, 'PDF Text Extraction');
    }
  }

async _extractTextFromPDFWeb(document) {
  try {
    if (!this.pdfLibrary || !this.pdfLibrary.getDocument) {
      throw PlatformUtils.createError(
        'PDF.js library not properly initialized',
        ['Refresh the page and try again', 'Check internet connection']
      );
    }

    // Get PDF data buffer
    let pdfBuffer;
    
    const documents = await this._getStoredDocuments();
    const storedDoc = documents.find(doc => doc.id === document.id);
    
    if (storedDoc && storedDoc.webFileData) {
      pdfBuffer = new Uint8Array(storedDoc.webFileData);
    } else if (document.file) {
      pdfBuffer = await document.file.arrayBuffer();
      pdfBuffer = new Uint8Array(pdfBuffer);
    } else {
      throw PlatformUtils.createError(
        'PDF data not accessible',
        ['Try re-uploading the PDF file', 'Process the file immediately after upload']
      );
    }

    // Load PDF document with better error handling
    const loadingTask = this.pdfLibrary.getDocument({ 
      data: pdfBuffer,
      maxImageSize: -1, // No limit on image size
      disableFontFace: false,
      useWorkerFetch: false,
      verbosity: 0 // Reduce console noise
    });
    
    const pdf = await loadingTask.promise;
    let fullText = '';

    PlatformUtils.logDebugInfo('PDF loaded successfully', {
      numPages: pdf.numPages
    });

    // Extract text from each page with better text reconstruction
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent({
          normalizeWhitespace: false,
          disableCombineTextItems: false
        });
        
        // Improved text reconstruction that preserves formatting
        let pageText = '';
        let lastY = null;
        let currentLine = '';
        
        for (const item of textContent.items) {
          if (item.str.trim() === '') continue;
          
          // Detect line breaks based on Y position
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            if (currentLine.trim()) {
              pageText += currentLine.trim() + '\n';
              currentLine = '';
            }
          }
          
          currentLine += item.str + ' ';
          lastY = item.transform[5];
        }
        
        // Add the last line
        if (currentLine.trim()) {
          pageText += currentLine.trim() + '\n';
        }
        
        if (pageText.trim()) {
          fullText += `${pageText}\n`;
        }
        
        PlatformUtils.logDebugInfo(`Page ${pageNum} extracted`, {
          textLength: pageText.length,
          hasContent: pageText.trim().length > 0
        });
        
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${pageNum}:`, pageError);
        // Continue with other pages instead of failing completely
      }
    }

    if (fullText.trim().length === 0) {
      throw PlatformUtils.createError(
        'No text content found in PDF',
        [
          'PDF may be image-based (scanned document)',
          'Try using OCR software to convert to text',
          'Convert PDF to Word format for text extraction'
        ]
      );
    }

    PlatformUtils.logDebugInfo('PDF text extraction completed', {
      pages: pdf.numPages,
      textLength: fullText.length,
      preview: fullText.substring(0, 200)
    });

    return fullText.trim();
  } catch (error) {
    console.error('Web PDF text extraction error:', error);
    throw error;
  }
}

  async _extractTextFromPDFMobile(document) {
    try {
      if (!this.pdfLibrary) {
        throw PlatformUtils.createError(
          'PDF processing library not available on mobile',
          ['Install pdf-parse package', 'Use web version for PDF processing']
        );
      }

      if (this.pdfLibrary.fallback) {
        return this._fallbackPDFExtraction(document);
      }

      // Get file system access
      const RNFS = await PlatformUtils.loadFileSystem();
      if (!RNFS || !document.localPath) {
        throw PlatformUtils.createError('PDF file not accessible on mobile');
      }

      // Read PDF file as buffer
      const pdfData = await RNFS.readFile(document.localPath, 'base64');
      const pdfBuffer = Buffer.from(pdfData, 'base64');

      // Extract text using pdf-parse
      const data = await this.pdfLibrary(pdfBuffer);
      
      if (!data.text || data.text.trim().length === 0) {
        throw PlatformUtils.createError(
          'No text content found in PDF',
          [
            'PDF may be image-based (scanned document)',
            'Try using the web version for better PDF processing',
            'Convert PDF to Word format'
          ]
        );
      }

      PlatformUtils.logDebugInfo('Mobile PDF text extraction completed', {
        pages: data.numpages,
        textLength: data.text.length
      });

      return data.text.trim();
    } catch (error) {
      console.error('Mobile PDF text extraction error:', error);
      
      // Try fallback method if main extraction fails
      if (!this.pdfLibrary.fallback) {
        console.log('Attempting fallback PDF extraction...');
        return this._fallbackPDFExtraction(document);
      }
      
      throw error;
    }
  }

  async _fallbackPDFExtraction(document) {
    // This is a very basic fallback that just returns an instructive message
    const fallbackText = `
PDF Text Extraction Notice
==========================

This PDF document could not be processed for text extraction.

Document Information:
- File Name: ${document.originalName}
- File Size: ${this._formatFileSize(document.size)}
- Upload Date: ${new Date(document.uploadedAt).toLocaleDateString()}

Possible Solutions:
1. Convert the PDF to a Word document (.docx)
2. Use the web version of this app for better PDF processing
3. If this is a scanned document, use OCR software first
4. Save the PDF as a text file (.txt) if possible

Note: This message is shown because PDF processing libraries are not fully available on this platform.
    `.trim();

    return fallbackText;
  }

   // Add timeout to prevent hanging
  async ensureInitialized(timeout = 5000) {
    if (this.initialized) return;

    try {
      await Promise.race([
        this.init(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('PDF initialization timeout')), timeout)
        )
      ]);
    } catch (error) {
      console.warn('PDF initialization timeout or failed:', error.message);
      // Mark as initialized with fallback mode
      this.initialized = true;
      this.pdfLibrary = { fallback: true };
    }
  }


  async _getStoredDocuments() {
    try {
      const DocumentProcessor = await import('./DocumentProcessor');
      return await DocumentProcessor.default.getStoredDocuments();
    } catch (error) {
      console.error('Failed to get stored documents:', error);
      return [];
    }
  }

  _formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Validate PDF document before processing
  async validatePDFDocument(document) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    try {
      // Basic validation
      if (!document || !document.type) {
        validation.isValid = false;
        validation.errors.push('Invalid document object');
        return validation;
      }

      // Check file type
      const isPDF = document.type === 'application/pdf' || 
                   document.originalName?.toLowerCase().endsWith('.pdf');
      
      if (!isPDF) {
        validation.isValid = false;
        validation.errors.push('Document is not a PDF file');
        validation.suggestions.push('Only PDF files are supported by this processor');
        return validation;
      }

      // Check file size (reasonable limits)
      const maxSize = PlatformUtils.isWeb() ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB web, 50MB mobile
      if (document.size > maxSize) {
        validation.isValid = false;
        validation.errors.push(`PDF file too large: ${this._formatFileSize(document.size)} (limit: ${this._formatFileSize(maxSize)})`);
        validation.suggestions.push('Try compressing the PDF or splitting it into smaller files');
        return validation;
      }

      // Platform-specific validation
      if (PlatformUtils.isWeb()) {
        // Check if we have file data
        const documents = await this._getStoredDocuments();
        const storedDoc = documents.find(doc => doc.id === document.id);
        
        if (!storedDoc?.webFileData && !document.file) {
          validation.isValid = false;
          validation.errors.push('PDF file data not available');
          validation.suggestions.push('Try re-uploading the PDF file');
        }
      } else {
        // Check local file path for mobile
        if (!document.localPath) {
          validation.isValid = false;
          validation.errors.push('PDF file path not available');
          validation.suggestions.push('Try re-uploading the PDF file');
        }
      }

      // Add warnings for potential issues
      if (document.size < 1024) {
        validation.warnings.push('PDF file seems very small - may be empty or corrupted');
      }

      if (document.size > 5 * 1024 * 1024) {
        validation.warnings.push('Large PDF file - processing may take longer');
      }

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Validation failed: ${error.message}`);
    }

    return validation;
  }

  // Get processor capabilities
  getCapabilities() {
    return {
      textExtraction: true,
      pageCount: true,
      metadata: PlatformUtils.isWeb(), // Only available with PDF.js
      webSupport: true,
      mobileSupport: true,
      maxFileSize: PlatformUtils.isWeb() ? 10 * 1024 * 1024 : 50 * 1024 * 1024,
      supportedFormats: ['application/pdf'],
      features: {
        multiPage: true,
        pageByPage: PlatformUtils.isWeb(),
        fallbackMode: true,
        progressTracking: PlatformUtils.isWeb()
      }
    };
  }

  // Extract metadata (web only with PDF.js)
  async extractPDFMetadata(document) {
    if (!PlatformUtils.isWeb() || !this.pdfLibrary?.getDocument) {
      return {
        title: document.originalName || 'PDF Document',
        pages: 'Unknown',
        size: document.size,
        type: 'PDF'
      };
    }

    try {
      await this.ensureInitialized();

      // Get PDF data buffer
      let pdfBuffer;
      const documents = await this._getStoredDocuments();
      const storedDoc = documents.find(doc => doc.id === document.id);
      
      if (storedDoc?.webFileData) {
        pdfBuffer = new Uint8Array(storedDoc.webFileData);
      } else if (document.file) {
        pdfBuffer = await document.file.arrayBuffer();
        pdfBuffer = new Uint8Array(pdfBuffer);
      } else {
        throw new Error('PDF data not accessible');
      }

      const pdf = await this.pdfLibrary.getDocument({ data: pdfBuffer }).promise;
      const metadata = await pdf.getMetadata();

      return {
        title: metadata.info?.Title || document.originalName || 'PDF Document',
        author: metadata.info?.Author || 'Unknown',
        subject: metadata.info?.Subject || '',
        creator: metadata.info?.Creator || '',
        producer: metadata.info?.Producer || '',
        creationDate: metadata.info?.CreationDate || null,
        modificationDate: metadata.info?.ModDate || null,
        pages: pdf.numPages,
        size: document.size,
        type: 'PDF'
      };
    } catch (error) {
      console.error('PDF metadata extraction failed:', error);
      return {
        title: document.originalName || 'PDF Document',
        pages: 'Unknown',
        size: document.size,
        type: 'PDF',
        error: error.message
      };
    }
  }

  // Health check for the PDF processor
  async healthCheck() {
    try {
      const capabilities = this.getCapabilities();
      
      return {
        status: 'healthy',
        initialized: this.initialized,
        platform: PlatformUtils.isWeb() ? 'web' : 'mobile',
        hasLibrary: !!this.pdfLibrary,
        libraryType: PlatformUtils.isWeb() ? 'PDF.js' : 'pdf-parse',
        capabilities,
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
}

// Create and export singleton instance
const pdfProcessor = new PDFProcessor();
export default pdfProcessor;