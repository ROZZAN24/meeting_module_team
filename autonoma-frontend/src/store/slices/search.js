import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  query: '',
  filters: {},
  // Configuration for dynamic filters in the search bar
  config: null,
  // Columns from the active BOSDataTable
  tableConfig: null,
  // Page-specific visibility preferences { [path]: [visibleId1, visibleId2] }
  preferences: {}
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
      // Reset filter values and query when a new page sets its config,
      // so each page starts with a clean filter state
      state.filters = {};
      state.query = '';
    },
    resetFilters(state) {
      state.filters = {};
    },
    setTableConfig(state, action) {
      state.tableConfig = action.payload;
    },
    setFilterPreferences(state, action) {
      const { path, visibleIds } = action.payload;
      state.preferences[path] = visibleIds;
    }
  }
});

export default search.reducer;

export const { setQuery, setFilters, setFilterConfig, resetFilters, setFilterPreferences, setTableConfig } = search.actions;
