import { createSlice } from '@reduxjs/toolkit';

// Load preferences from localStorage
const savedPrefs = JSON.parse(localStorage.getItem('bos_search_prefs') || '{}');

const initialState = {
  query: '',
  filters: {},
  // Configuration for dynamic filters in the search bar
  config: null,
  // Page-specific visibility preferences { [path]: [visibleId1, visibleId2] }
  preferences: savedPrefs
};

const search = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery(state, action) {
      state.query = action.payload;
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setFilterConfig(state, action) {
      state.config = action.payload;
    },
    resetFilters(state) {
      state.filters = {};
    },
    setFilterPreferences(state, action) {
      const { path, visibleIds } = action.payload;
      state.preferences[path] = visibleIds;
      localStorage.setItem('bos_search_prefs', JSON.stringify(state.preferences));
    }
  }
});

export default search.reducer;

export const { setQuery, setFilters, setFilterConfig, resetFilters, setFilterPreferences } = search.actions;
