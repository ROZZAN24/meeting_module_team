// third party
import { createSlice } from '@reduxjs/toolkit';

// project imports
import axios from 'utils/axios';
import { dispatch } from '../index';

const normalizeEvent = (e) => ({
  ...e,
  id: e.id || e._id || String(Date.now())
});

const normalizeList = (list = []) => list.map(normalizeEvent);

// ==============================|| SLICE - CALENDAR ||============================== //

const initialState = {
  error: null,
  events: []
};

const slice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    // HAS ERROR
    hasError(state, action) {
      state.error = action.payload;
    },

    // GET EVENTS
    getEventsSuccess(state, action) {
      state.events = action.payload;
    },

    // ADD EVENT
    addEventSuccess(state, action) {
      state.events.push(action.payload);
    },

    // UPDATE EVENT
    updateEventSuccess(state, action) {
      const updated = action.payload;
      state.events = state.events.map((e) => (e.id === updated.id ? { ...e, ...updated } : e));
    },

    // REMOVE EVENT
    removeEventSuccess(state, action) {
      state.events = state.events.filter((e) => e.id !== action.payload);
    }
  }
});

// Reducer
export default slice.reducer;

// ==============================|| SLICE - CALENDAR ACTIONS ||============================== //

export const getEvents = () => async () => {
  try {
    const response = await axios.get('/api/calendar/events');
    dispatch(slice.actions.getEventsSuccess(normalizeList(response.data?.events)));
  } catch (error) {
    dispatch(slice.actions.hasError(error));
  }
};

export const addEvent = (event) => async () => {
  try {
    const response = await axios.post('/api/calendar/events/add', event);
    const created = normalizeEvent(response.data?.event ?? event);
    dispatch(slice.actions.addEventSuccess(created));
  } catch (error) {
    dispatch(slice.actions.hasError(error));
  }
};

export const updateEvent = (event) => async () => {
  try {
    const response = await axios.post('/api/calendar/events/update', event);
    const updated = normalizeEvent(response.data?.event ?? event);
    dispatch(slice.actions.updateEventSuccess(updated));
  } catch (err) {
    dispatch(slice.actions.hasError(err));
  }
};

export const removeEvent = (id) => async () => {
  try {
    await axios.post('/api/calendar/events/delete', { id });
    dispatch(slice.actions.removeEventSuccess(id));
  } catch (err) {
    dispatch(slice.actions.hasError(err));
  }
};
