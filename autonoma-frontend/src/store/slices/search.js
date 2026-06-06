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
      console.log('REDUX REDUCER - setFilters called with:', JSON.stringify(action.payload));
      state.filters = { ...state.filters, ...action.payload };
      console.log('REDUX REDUCER - new state.filters is:', JSON.stringify(state.filters));
    },
    setFilterConfig(state, action) {
      console.log('REDUX REDUCER - setFilterConfig called with:', JSON.stringify(action.payload));
      state.config = action.payload;
      if (action.payload === null) {
        state.filters = {};
        state.query = '';
        return;
      }
      // Preserve existing filters where possible to prevent loops and losing user inputs on config change.
      const nextFilters = { ...state.filters };
      if (Array.isArray(action.payload)) {
        action.payload.forEach((field) => {
          if (field) {
            if (field.type === 'dateRange') {
              const today = new Date();
              const yyyy = today.getFullYear();
              const mm = String(today.getMonth() + 1).padStart(2, '0');
              const dd = String(today.getDate()).padStart(2, '0');
              const todayStr = `${yyyy}-${mm}-${dd}`;
              if (nextFilters[`${field.id}Start`] === undefined) {
                nextFilters[`${field.id}Start`] = todayStr;
              }
              if (nextFilters[`${field.id}End`] === undefined) {
                nextFilters[`${field.id}End`] = todayStr;
              }
            } else if (field.defaultValue !== undefined) {
              if (nextFilters[field.id] === undefined) {
                nextFilters[field.id] = field.defaultValue;
              }
            }
          }
        });
      }
      state.filters = nextFilters;
    },
    resetFilters(state) {
      const nextFilters = {};
      if (Array.isArray(state.config)) {
        state.config.forEach((field) => {
          if (field) {
            if (field.type === 'dateRange') {
              const today = new Date();
              const yyyy = today.getFullYear();
              const mm = String(today.getMonth() + 1).padStart(2, '0');
              const dd = String(today.getDate()).padStart(2, '0');
              const todayStr = `${yyyy}-${mm}-${dd}`;
              nextFilters[`${field.id}Start`] = todayStr;
              nextFilters[`${field.id}End`] = todayStr;
            } else if (field.defaultValue !== undefined) {
              nextFilters[field.id] = field.defaultValue;
            }
          }
        });
      }
      state.filters = nextFilters;
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
