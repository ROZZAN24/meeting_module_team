import { useEffect, useRef } from 'react';

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
  // Use a ref so the event listener always reads the latest handlers
  // without needing to be re-registered on every render.
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!enabledRef.current) return;

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
      const currentShortcuts = shortcutsRef.current;

      // Allow Escape even in inputs
      if (combo === 'escape' && currentShortcuts['escape']) {
        e.preventDefault();
        currentShortcuts['escape']();
        return;
      }

      // Allow ctrl/meta combos (e.g., ctrl+s, ctrl+backspace) even in inputs
      // Only block bare key presses (no modifier) to avoid interfering with typing
      const hasModifier = e.ctrlKey || e.metaKey || e.altKey;
      if (isInput && !hasModifier) return;

      if (currentShortcuts[combo]) {
        e.preventDefault();
        e.stopPropagation();
        currentShortcuts[combo]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []); // Empty deps — listener is registered once and uses refs for latest values
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
