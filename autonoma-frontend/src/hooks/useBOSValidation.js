import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';

/**
 * BOS SOP #6, #9, #10 — Centralized Form Validation Hook
 *
 * Usage:
 *   const { errors, validate, clearErrors } = useBOSValidation();
 *   const isValid = validate(formData, rules);
 *
 * Rules format:
 *   [
 *     { field: 'departmentName', label: 'Department Name', required: true, maxLength: 100 },
 *     { field: 'departmentNo',   label: 'Department Number', required: true, type: 'number' },
 *     { field: 'email',          label: 'Email', pattern: /^[^@]+@[^@]+$/ },
 *   ]
 */
export default function useBOSValidation() {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});

  const clearErrors = useCallback((fieldName) => {
    if (fieldName) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    } else {
      setErrors({});
    }
  }, []);

  const validate = useCallback(
    (formData, rules) => {
      const newErrors = {};
      let firstError = null;

      for (const rule of rules) {
        const value = formData[rule.field];
        const label = rule.label || rule.field;

        // Required check (SOP #9)
        if (rule.required) {
          if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
            newErrors[rule.field] = `${label} is required *`;
            if (!firstError) firstError = newErrors[rule.field];
            continue;
          }
        }

        // Skip further checks if empty and not required
        if (value === undefined || value === null || value === '') continue;

        // Max length check (SOP #10)
        if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
          newErrors[rule.field] = `${label} must be ${rule.maxLength} characters or less`;
          if (!firstError) firstError = newErrors[rule.field];
        }

        // Min length check
        if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
          newErrors[rule.field] = `${label} must be at least ${rule.minLength} characters`;
          if (!firstError) firstError = newErrors[rule.field];
        }

        // Number type check
        if (rule.type === 'number' && isNaN(Number(value))) {
          newErrors[rule.field] = `${label} must be a valid number`;
          if (!firstError) firstError = newErrors[rule.field];
        }

        // Pattern check
        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
          newErrors[rule.field] = rule.patternMessage || `${label} format is invalid`;
          if (!firstError) firstError = newErrors[rule.field];
        }

        // Custom validator
        if (rule.validate && typeof rule.validate === 'function') {
          const customError = rule.validate(value, formData);
          if (customError) {
            newErrors[rule.field] = customError;
            if (!firstError) firstError = customError;
          }
        }
      }

      setErrors(newErrors);

      if (firstError) {
        dispatch(
          openSnackbar({
            open: true,
            message: firstError,
            variant: 'alert',
            alert: { variant: 'filled' },
            severity: 'error',
            close: false
          })
        );
        return false;
      }

      return true;
    },
    [dispatch]
  );

<<<<<<< HEAD
  const handleInputChange = useCallback((e, setter) => {
    const { name, value } = e.target;
    if (setter) {
      setter(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      clearErrors(name);
    }
  }, [errors, clearErrors]);

  return { errors, validate, clearErrors, setErrors, handleInputChange };
=======
  return { errors, validate, clearErrors, setErrors };
>>>>>>> origin/chore/repo-cleanup
}
