import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';

/**
 * Automatically infers the storage module based on the current browser URL.
 * Syncs with BosDocConstants.java backend mapping.
 */
export const getModuleFromPath = () => {
    const path = window.location.pathname.toLowerCase();
    
    // Check specific sub-modules first
    if (path.includes('/qms/checklist')) return 'QMS_CHECKLIST';
    if (path.includes('/qms/audit')) return 'QMS_AUDIT';
    if (path.includes('/qms/ncr')) return 'QMS_NCR';
    if (path.includes('/sm/customers')) return 'SALES_CUSTOMER';
    if (path.includes('/sm/enquiries')) return 'SALES_ENQUIRY';
    if (path.includes('/sm/quotations')) return 'SALES_QUOTATION';
    
    // Check HRA modules
    if (path.includes('/hra/employee/master')) return 'HRA_PROFILE';
    if (path.includes('/hra/')) return 'HRA';
    
    // Then general modules
    if (path.includes('/user-overview') || path.includes('/profile')) return 'USER_PROFILE';
    if (path.includes('/finance/')) return 'FINANCE';
    if (path.includes('/production/')) return 'PRODUCTION';
    if (path.includes('/purchase/')) return 'PURCHASE';
    if (path.includes('/maintenance/')) return 'MAINTENANCE';
    if (path.includes('/quality/')) return 'QUALITY';
    if (path.includes('/assets/')) return 'ASSETS';
    if (path.includes('/npd/')) return 'NPD';
    if (path.includes('/stores/')) return 'STORES';
    if (path.includes('/ocr/')) return 'OCR';
    
    return 'DEFAULT';
};

/**
 * Automated File Upload Helper
 * Handles FormData creation and module auto-detection.
 * @param {File} file - The file object to upload
 * @param {String} overrideModule - Optional module override
 * @returns {Promise<String>} - The relative path of the uploaded file (e.g. "QMS/uuid_name.pdf")
 */
export const autoUploadFile = async (file, overrideModule = null, onProgress = null) => {
    if (!file) return null;

    const module = overrideModule || getModuleFromPath();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('module', module);

    try {
        console.debug(`[AutoUpload] Uploading to module: ${module}`);
        const response = await axios.post(`${API_PATHS.FILES}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            }
        });
        if (response.data && response.data.path) {
            return response.data.path;
        } else if (typeof response.data === 'string') {
            return response.data;
        }
        return response.data; // fallback
    } catch (error) {
        console.error(`[AutoUpload] Failed for module ${module}:`, error);
        throw error;
    }
};

/**
 * Uploads an array of files concurrently.
 */
export const autoUploadFiles = async (files, overrideModule = null, onProgress = null) => {
    if (!files || files.length === 0) return [];
    
    let totalProgress = 0;
    const progressMap = new Array(files.length).fill(0);
    
    const uploadPromises = files.map((file, index) => {
        return autoUploadFile(file, overrideModule, (progress) => {
            progressMap[index] = progress;
            if (onProgress) {
                const total = progressMap.reduce((a, b) => a + b, 0) / files.length;
                onProgress(total);
            }
        });
    });

    return Promise.all(uploadPromises);
};

export const getFileViewUrl = (serverFileName) => {
    if (!serverFileName) return '';
    const baseUrl = (axios.defaults.baseURL || '').replace(/\/+$/, '');
    const filesPath = API_PATHS.FILES.startsWith('/') ? API_PATHS.FILES : `/${API_PATHS.FILES}`;
    
    // Use query parameter to avoid Tomcat path variable restrictions (spaces, slashes, etc.)
    return `${baseUrl}${filesPath}/view?path=${encodeURIComponent(serverFileName)}`;
};

export const getFileDownloadUrl = (serverFileName) => {
    if (!serverFileName) return '';
    const baseUrl = (axios.defaults.baseURL || '').replace(/\/+$/, '');
    const filesPath = API_PATHS.FILES.startsWith('/') ? API_PATHS.FILES : `/${API_PATHS.FILES}`;
    
    return `${baseUrl}${filesPath}/download?path=${encodeURIComponent(serverFileName)}`;
};

export const getUserImageUrl = (imgName) => {
    if (!imgName) return '';
    if (imgName.startsWith('http') || imgName.startsWith('blob:')) return imgName;
    const baseUrl = (axios.defaults.baseURL || '').replace(/\/+$/, '');
    return `${baseUrl}/api/users/image?fileNameParam=${encodeURIComponent(imgName)}`;
};

export const getCompanyImageUrl = (imgName) => {
    if (!imgName) return '';
    if (imgName.startsWith('http') || imgName.startsWith('blob:')) return imgName;
    const baseUrl = (axios.defaults.baseURL || '').replace(/\/+$/, '');
    return `${baseUrl}/api/company-profile/image?fileNameParam=${encodeURIComponent(imgName)}`;
};
