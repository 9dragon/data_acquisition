/**
 * File utility functions for validation and formatting
 */

// Supported file types for upload
export const SUPPORTED_FILE_TYPES = {
  // Documents
  pdf: { mimeType: 'application/pdf', extensions: ['.pdf'], category: 'document' },
  doc: { mimeType: 'application/msword', extensions: ['.doc'], category: 'document' },
  docx: { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extensions: ['.docx'], category: 'document' },
  xls: { mimeType: 'application/vnd.ms-excel', extensions: ['.xls'], category: 'document' },
  xlsx: { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extensions: ['.xlsx'], category: 'document' },

  // Images
  png: { mimeType: 'image/png', extensions: ['.png'], category: 'image' },
  jpg: { mimeType: 'image/jpeg', extensions: ['.jpg', '.jpeg'], category: 'image' },
  gif: { mimeType: 'image/gif', extensions: ['.gif'], category: 'image' },
  svg: { mimeType: 'image/svg+xml', extensions: ['.svg'], category: 'image' },
  bmp: { mimeType: 'image/bmp', extensions: ['.bmp'], category: 'image' },

  // Text
  txt: { mimeType: 'text/plain', extensions: ['.txt'], category: 'text' },
};

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  default: 50 * 1024 * 1024, // 50MB
  image: 10 * 1024 * 1024,   // 10MB
  document: 50 * 1024 * 1024, // 50MB
};

// File type categories
export const FILE_TYPE_CATEGORIES = {
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
  image: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp'],
  text: ['txt'],
} as const;

export type FileTypeCategory = keyof typeof FILE_TYPE_CATEGORIES;

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

/**
 * Get file type from File object
 */
export const getFileType = (file: File): string => {
  const extension = getFileExtension(file.name);
  return extension;
};

/**
 * Check if file type is supported
 */
export const isFileTypeSupported = (file: File): boolean => {
  const extension = getFileExtension(file.name);
  return Object.keys(SUPPORTED_FILE_TYPES).some(type =>
    SUPPORTED_FILE_TYPES[type as keyof typeof SUPPORTED_FILE_TYPES].extensions.includes(`.${extension}`)
  );
};

/**
 * Get file category
 */
export const getFileCategory = (file: File): FileTypeCategory | null => {
  const extension = getFileExtension(file.name);

  for (const [category, types] of Object.entries(FILE_TYPE_CATEGORIES)) {
    if (types.includes(extension as any)) {
      return category as FileTypeCategory;
    }
  }

  return null;
};

/**
 * Check if file size is within limit
 */
export const isFileSizeValid = (file: File): boolean => {
  const category = getFileCategory(file);
  const limit = category ? FILE_SIZE_LIMITS[category] : FILE_SIZE_LIMITS.default;
  return file.size <= limit;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * Get file size limit for category
 */
export const getFileSizeLimit = (category: FileTypeCategory | null): string => {
  const limit = category ? FILE_SIZE_LIMITS[category] : FILE_SIZE_LIMITS.default;
  return formatFileSize(limit);
};

/**
 * Validate file for upload
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!isFileTypeSupported(file)) {
    const extension = getFileExtension(file.name);
    return {
      valid: false,
      error: `不支持的文件类型: .${extension}。支持的类型: ${Object.values(SUPPORTED_FILE_TYPES).flatMap(t => t.extensions).join(', ')}`
    };
  }

  // Check file size
  if (!isFileSizeValid(file)) {
    const category = getFileCategory(file);
    const limit = getFileSizeLimit(category);
    return {
      valid: false,
      error: `文件大小超过限制（最大 ${limit}）`
    };
  }

  return { valid: true };
};

/**
 * Check if file can be previewed
 */
export const canPreviewFile = (fileType: string): boolean => {
  const type = fileType.toLowerCase();
  return ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp', 'txt'].includes(type);
};

/**
 * Get MIME type from file extension
 */
export const getMimeType = (filename: string): string => {
  const extension = getFileExtension(filename);
  const fileType = Object.keys(SUPPORTED_FILE_TYPES).find(type =>
    SUPPORTED_FILE_TYPES[type as keyof typeof SUPPORTED_FILE_TYPES].extensions.includes(`.${extension}`)
  );

  return fileType ? SUPPORTED_FILE_TYPES[fileType as keyof typeof SUPPORTED_FILE_TYPES].mimeType : 'application/octet-stream';
};

/**
 * Generate unique file name
 */
export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = getFileExtension(originalName);
  const nameWithoutExtension = originalName.replace(`.${extension}`, '');

  return `${nameWithoutExtension}_${timestamp}_${random}.${extension}`;
};

/**
 * Get file icon based on type
 */
export const getFileIcon = (fileType: string): string => {
  const type = fileType.toLowerCase();

  if (FILE_TYPE_CATEGORIES.document.includes(type as any)) {
    return '📄';
  }
  if (FILE_TYPE_CATEGORIES.image.includes(type as any)) {
    return '🖼️';
  }
  if (FILE_TYPE_CATEGORIES.text.includes(type as any)) {
    return '📝';
  }

  return '📎';
};
