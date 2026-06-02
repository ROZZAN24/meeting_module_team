#!/bin/bash

# Database Migration Version Guard
# Verifies that newly added or modified migration files do not introduce duplicate version numbers.
# Legacy duplicate version numbers are listed as warnings, but won't fail the build.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DBSCRIPTS_DIR="$PROJECT_ROOT/autonoma-backend/src/main/resources/dbscripts"

echo "=================================================="
echo "🛡️  Database Migration Version Guard"
echo "=================================================="

if [ ! -d "$DBSCRIPTS_DIR" ]; then
    echo "❌ Error: dbscripts directory not found at $DBSCRIPTS_DIR"
    exit 1
fi

# Detect added/modified/untracked SQL files in git
echo "🔍 Detecting newly added/modified/untracked migration scripts..."
changed_files=$(git status --porcelain "$DBSCRIPTS_DIR" | grep -E '^(A | M|\?\?|AM)' | awk '{print $2}' | grep '\.sql$')

if [ -z "$changed_files" ]; then
    # Fallback to diffing against main/origin if no local uncommitted changes
    echo "ℹ️  No uncommitted changes in dbscripts/. Checking diff against 'main'..."
    changed_files=$(git diff --name-only main...HEAD "$DBSCRIPTS_DIR" | grep '\.sql$')
fi

# 1. Check all legacy duplicates as warnings
echo "🔍 Scanning entire folder for duplicate versions..."
all_versions=$(find "$DBSCRIPTS_DIR" -maxdepth 1 -name "*.sql" -exec basename {} \; | grep -oE 'V[0-9]+(\.[0-9]+)?' | sort)
all_duplicates=$(echo "$all_versions" | uniq -d)

if [ -n "$all_duplicates" ]; then
    echo "⚠️  WARNING: Legacy duplicate version numbers exist in the repository:"
    for dup in $all_duplicates; do
        count=$(find "$DBSCRIPTS_DIR" -maxdepth 1 -name "*${dup}__*" | wc -l)
        echo "   - [$dup] is used by $count files"
    done
    echo "ℹ️  Note: These legacy duplicates are preserved to avoid breaking already-executed history."
fi

# 2. Check if newly added/modified files introduce any duplicates
if [ -n "$changed_files" ]; then
    echo "🔍 Checking newly added/modified scripts..."
    echo "$changed_files" | while read -r filepath; do
        filename=$(basename "$filepath")
        # Extract version
        version=$(echo "$filename" | grep -oE 'V[0-9]+(\.[0-9]+)?')
        
        if [ -n "$version" ]; then
            # Count occurrences in the entire directory
            match_count=$(find "$DBSCRIPTS_DIR" -maxdepth 1 -name "*${version}__*" | wc -l)
            
            # Since the file itself is in the directory, a count of > 1 means it conflicts with another file!
            if [ "$match_count" -gt 1 ]; then
                conflict_files=$(find "$DBSCRIPTS_DIR" -maxdepth 1 -name "*${version}__*" -exec basename {} \;)
                echo "❌ ERROR: New/modified script '$filename' uses version [$version] which conflicts with:"
                echo "$conflict_files" | grep -v "$filename" | sed 's/^/  - /'
                echo "💡 Fix: Please claim the next free version from NEXT_VERSION.md and rename your new script!"
                exit 1
            else
                echo "✅ Script '$filename' has a unique version [$version]"
            fi
        else
            echo "⚠️  Warning: Could not extract version number from '$filename'"
        fi
    done
    
    # Capture exit code of the while subshell
    if [ ${PIPESTATUS[1]} -ne 0 ]; then
        exit 1
    fi
else
    echo "✅ No new or modified migration scripts found in your local changes or branch."
fi

echo "=================================================="
exit 0
