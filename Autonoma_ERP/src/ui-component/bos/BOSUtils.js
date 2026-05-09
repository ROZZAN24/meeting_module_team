/**
 * BOS Utilities
 * Shared helper functions for data normalization and UI logic.
 */

/**
 * Parses file lists from various formats (Array, JSON String, CSV String)
 * into a standardized array of file objects.
 * @param {any} files - The raw file data from the server
 * @returns {Array<string>} - A clean array of filenames
 */
export const parseBOSFiles = (files) => {
  if (!files) return [];
  if (Array.isArray(files)) return files;
  
  if (typeof files === 'string' && files.trim()) {
    const trimmed = files.trim();
    // Handle JSON strings like '["file1.jpg", "file2.pdf"]'
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        return [];
      }
    }
    // Handle CSV strings like 'file1.jpg, file2.pdf'
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }
  
  return [];
};

/**
 * Maps a list of filenames to the internal BOS file object format
 * @param {Array<string>} fileNames - List of filenames from server
 * @returns {Array<Object>} - Formatted file objects for BOSFileGallery
 */
export const formatBOSFiles = (fileNames = []) => {
  return parseBOSFiles(fileNames).map(name => ({
    name,
    isServer: true,
    type: name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'
  }));
};
