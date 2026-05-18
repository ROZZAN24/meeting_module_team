import { useState, useCallback } from 'react';

/**
 * useBOSForm - A standardized hook to handle form state and validation.
 * Resolves the "uncontrolled to controlled" warning by ensuring safe defaults.
 * 
 * @param {Object} initialValues - The starting data for the form.
 * @returns {Object} { formData, setFormData, handleFormChange, resetForm }
 */
export default function useBOSForm(initialValues = {}) {
    // Ensure all initial values are at least an empty string to avoid "uncontrolled" warnings
    const sanitizedInitial = Object.keys(initialValues).reduce((acc, key) => {
        acc[key] = initialValues[key] ?? '';
        return acc;
    }, {});

    const [formData, setFormData] = useState(sanitizedInitial);

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value ?? ''
        }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData(sanitizedInitial);
    }, [sanitizedInitial]);

    const updateForm = useCallback((newData) => {
        setFormData(prev => ({
            ...prev,
            ...Object.keys(newData).reduce((acc, key) => {
                acc[key] = newData[key] ?? '';
                return acc;
            }, {})
        }));
    }, []);

    return { formData, setFormData, handleFormChange, resetForm, updateForm };
}
