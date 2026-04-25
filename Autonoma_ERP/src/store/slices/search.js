import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    query: ''
};

const search = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setQuery(state, action) {
            state.query = action.payload;
        }
    }
});

export default search.reducer;

export const { setQuery } = search.actions;
