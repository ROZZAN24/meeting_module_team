import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  query: '',
  filters: {
    type: 'All',
    date: '',
    status: 'All'
  },
  // Configuration for dynamic filters in the search bar
  config: null
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
      // Optionally reset filters that aren't in the new config?
      // For now, let's just update the config.
    },
    resetFilters(state) {
      state.filters = {};
    }
  }
});

export default search.reducer;

export const { setQuery, setFilters, setFilterConfig, resetFilters } = search.actions;
