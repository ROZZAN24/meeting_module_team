import { useEffect, useRef, useState } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';

// third party
import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import interactionPlugin from '@fullcalendar/interaction';

// project imports
import Toolbar from './Toolbar';
import AddEventForm from './AddEventForm';
import CalendarStyled from './CalendarStyled';

import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';

import { dispatch, useSelector } from 'store';
import { getEvents, addEvent, updateEvent, removeEvent } from 'store/slices/calendar';

// assets
import AddAlarmTwoToneIcon from '@mui/icons-material/AddAlarmTwoTone';

// ==============================|| APPLICATION CALENDAR ||============================== //

export default function Calendar() {
  const calendarRef = useRef(null);
  const matchSm = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(true);

  // pull events from redux
  const { events } = useSelector((state) => state.calendar);

  useEffect(() => {
    dispatch(getEvents()).then(() => setLoading(false));
  }, []);

  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(matchSm ? 'listWeek' : 'dayGridMonth');

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // toolbar handlers
  const handleDateToday = () => {
    const calendarEl = calendarRef.current?.getApi();
    calendarEl?.today();
    setDate(calendarEl?.getDate() ?? new Date());
  };

  const handleViewChange = (newView) => {
    const calendarEl = calendarRef.current?.getApi();
    calendarEl?.changeView(newView);
    setView(newView);
  };

  useEffect(() => {
    handleViewChange(matchSm ? 'listWeek' : 'dayGridMonth');
  }, [matchSm]);

  const handleDatePrev = () => {
    const calendarEl = calendarRef.current?.getApi();
    calendarEl?.prev();
    setDate(calendarEl?.getDate() ?? new Date());
  };

  const handleDateNext = () => {
    const calendarEl = calendarRef.current?.getApi();
    calendarEl?.next();
    setDate(calendarEl?.getDate() ?? new Date());
  };

  // calendar event select/add/edit/delete
  const handleRangeSelect = (arg) => {
    calendarRef.current?.getApi().unselect();
    setSelectedRange({ start: arg.start, end: arg.end });
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventSelect = (arg) => {
    const found = events.find((e) => e.id === arg.event.id);
    setSelectedEvent(found ?? null);
    setSelectedRange(null);
    setIsModalOpen(true);
  };

  const handleEventUpdate = ({ event }) => {
    dispatch(
      updateEvent({
        id: event.id,
        title: event.title,
        allDay: event.allDay,
        start: event.start ? event.start.toISOString() : undefined,
        end: event.end ? event.end.toISOString() : undefined
      })
    );
  };

  // modal actions
  const handleEventCreate = (data) => {
    const payload = {
      ...data,
      start: data.start instanceof Date ? data.start.toISOString() : data.start,
      end: data.end instanceof Date ? data.end.toISOString() : data.end
    };
    dispatch(addEvent(payload));
    handleModalClose();
  };

  const handleUpdateEvent = (eventId, update) => {
    const payload = {
      id: eventId,
      ...update,
      start: update.start instanceof Date ? update.start.toISOString() : update.start,
      end: update.end instanceof Date ? update.end.toISOString() : update.end
    };
    dispatch(updateEvent(payload));
    handleModalClose();
  };

  const handleEventDelete = (id) => {
    dispatch(removeEvent(id));
    handleModalClose();
  };

  const handleAddClick = () => {
    setSelectedEvent(null);
    setSelectedRange(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setSelectedRange(null);
  };

  if (loading) return <Loader />;

  return (
    <MainCard
      title="Event Calendar"
      secondary={
        <Button color="secondary" variant="contained" onClick={handleAddClick}>
          <AddAlarmTwoToneIcon fontSize="small" sx={{ mr: 0.75 }} />
          Add New Event
        </Button>
      }
    >
      <CalendarStyled>
        <Toolbar
          date={date}
          view={view}
          onClickNext={handleDateNext}
          onClickPrev={handleDatePrev}
          onClickToday={handleDateToday}
          onChangeView={handleViewChange}
        />
        <SubCard>
          <FullCalendar
            ref={calendarRef}
            plugins={[listPlugin, dayGridPlugin, timelinePlugin, timeGridPlugin, interactionPlugin]}
            initialView={view}
            initialDate={date}
            events={events}
            selectable
            editable
            droppable
            weekends
            height={matchSm ? 'auto' : 720}
            headerToolbar={false}
            allDayMaintainDuration
            eventResizableFromStart
            select={handleRangeSelect}
            eventDrop={handleEventUpdate}
            eventClick={handleEventSelect}
            eventResize={handleEventUpdate}
            eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
          />
        </SubCard>
      </CalendarStyled>

      {/* Dialog renders its body even if not open */}
      <Dialog maxWidth="sm" fullWidth onClose={handleModalClose} open={isModalOpen} slotProps={{ paper: { sx: { p: 0 } } }}>
        {isModalOpen && (
          <AddEventForm
            event={selectedEvent}
            range={selectedRange}
            onCancel={handleModalClose}
            handleDelete={handleEventDelete}
            handleCreate={handleEventCreate}
            handleUpdate={handleUpdateEvent}
          />
        )}
      </Dialog>
    </MainCard>
  );
}
