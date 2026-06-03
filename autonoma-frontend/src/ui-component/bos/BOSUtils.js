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
 * Resolves the employee photo URL from the uploaded file path.
 */
export const getPhotoUrl = (photoPath) => {
  if (!photoPath) return null;
  if (photoPath.startsWith('http') || photoPath.startsWith('blob:')) return photoPath;
  
  // Use relative path to let Vite proxy handle it correctly (usually to 8081)
  return `/api/files/view?path=${encodeURIComponent(photoPath)}`;
};

/**
 * Maps a list of filenames to the internal BOS file object format
 * @param {Array<string>} fileNames - List of filenames from server
 * @returns {Array<Object>} - Formatted file objects for BOSFileGallery
 */
export const formatBOSFiles = (fileNames = []) => {
  return parseBOSFiles(fileNames).map((raw, idx) => {
    const [name, docDetails] = (raw || '').split('|');
    return {
      id: `server-${idx}-${name}`,
      name,
      docDetails: docDetails || 'Stored on Server',
      isServer: true,
      type: name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'
    };
  });
};

/**
 * Resolves a nested/dotted key (e.g., 'oem.oemShortName') on a target object.
 * Returns the resolved value or undefined if not found.
 */
export const resolveNestedValue = (keyPath, obj) => {
  if (!keyPath || !obj) return undefined;
  if (typeof keyPath !== 'string') return undefined;
  if (!keyPath.includes('.')) return obj[keyPath];
  return keyPath.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : undefined, obj);
};

/**
 * Common date range filter configuration for global filter system.
 */
export const getCommonDateFilters = (createdAtId = 'createdAt', updatedAtId = 'updatedAt') => [
  { id: createdAtId, label: 'CREATED DATE', type: 'dateRange', isStarred: true }
];

/**
 * Checks if a row matches the given date range filters.
 */
export const matchDateRange = (row, globalFilters, filterId, rowDateKey = filterId) => {
  if (!globalFilters) return true;
  const startVal = globalFilters[`${filterId}Start`];
  const endVal = globalFilters[`${filterId}End`];
  const considerVal = globalFilters[`${filterId}Consider`] || 'Yes';

  if (!startVal && !endVal) return true;
  if (considerVal === 'No') return true;

  // Resolve cell value
  let cellVal = resolveNestedValue(rowDateKey, row);
  if (cellVal === undefined || cellVal === null || cellVal === '') {
    const snakeCaseId = rowDateKey.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    cellVal = row[snakeCaseId] || row[`_${rowDateKey}`];
    if (cellVal === undefined || cellVal === null || cellVal === '') {
      if (rowDateKey === 'createdAt' || rowDateKey === 'createdDate') {
        cellVal = row['createdAt'] || row['created_at'] || row['createdDate'] || row['_createdAt'] || row['_createdDate'];
      }
      if (rowDateKey === 'updatedAt' || rowDateKey === 'updatedDate') {
        cellVal = row['updatedAt'] || row['updated_at'] || row['updatedDate'] || row['_updatedAt'] || row['_updatedDate'];
      }
    }
  }

  if (!cellVal || cellVal === '-') return false;

  try {
    const cellDate = new Date(cellVal);
    if (isNaN(cellDate.getTime())) return true;
    const cellDateMidnight = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());

    const startDate = startVal ? new Date(startVal) : null;
    const startDateMidnight = startDate && !isNaN(startDate.getTime()) ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) : null;

    const endDate = endVal ? new Date(endVal) : null;
    const endDateMidnight = endDate && !isNaN(endDate.getTime()) ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : null;

    let inBetween = true;
    if (startDateMidnight && cellDateMidnight < startDateMidnight) {
      inBetween = false;
    }
    if (endDateMidnight && cellDateMidnight > endDateMidnight) {
      inBetween = false;
    }

    return inBetween;
  } catch (e) {
    return true;
  }
};

/**
 * Checks if a row matches both created and updated date range filters.
 */
export const matchCommonDateFilters = (row, globalFilters, createdAtId = 'createdAt', updatedAtId = 'updatedAt') => {
  if (!matchDateRange(row, globalFilters, createdAtId)) return false;
  if (!matchDateRange(row, globalFilters, updatedAtId)) return false;
  return true;
};

