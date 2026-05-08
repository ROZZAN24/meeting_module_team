import { useEffect, useCallback } from 'react';

// ==============================|| KEYBOARD SHORTCUTS HOOK - BOS SOP #4 ||============================== //

/**
 * Reusable hook for keyboard shortcut support (BOS SOP Rule #4).
 *
 * Usage:
 *   useKeyboardShortcuts({
 *     'ctrl+s': handleSave,
 *     'ctrl+e': handleEdit,
 *     'ctrl+d': handleDelete,
 *     'escape': handleClose,
 *     'ctrl+y': handleYes,
 *     'ctrl+enter': handleConfirm,
 *   });
 *
 * @param {Object} shortcuts - Map of shortcut strings to handler functions
 * @param {boolean} enabled - Whether shortcuts are active (default: true)
 */
export default function useKeyboardShortcuts(shortcuts = {}, enabled = true) {
  const handleKeyDown = useCallback(
    (e) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs (unless it's Escape)
      const tag = e.target.tagName.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;

      const parts = [];
      if (e.ctrlKey || e.metaKey) parts.push('ctrl');
      if (e.shiftKey) parts.push('shift');
      if (e.altKey) parts.push('alt');

      const key = e.key.toLowerCase();
      if (!['control', 'meta', 'shift', 'alt'].includes(key)) {
        parts.push(key === 'enter' ? 'enter' : key === 'escape' ? 'escape' : key);
      }

      const combo = parts.join('+');

      // Allow Escape even in inputs
      if (combo === 'escape' && shortcuts['escape']) {
        e.preventDefault();
        shortcuts['escape']();
        return;
      }

      // Skip other shortcuts when in input fields
      if (isInput && combo !== 'escape') return;

      if (shortcuts[combo]) {
        e.preventDefault();
        e.stopPropagation();
        shortcuts[combo]();
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}

/**
 * Helper to generate tooltip text with shortcut hint.
 * @param {string} label - Button label (e.g., "Save")
 * @param {string} shortcut - Shortcut key (e.g., "Ctrl + S")
 * @returns {string} Formatted tooltip string
 */
export function shortcutTooltip(label, shortcut) {
  return `${label} (${shortcut})`;
}
