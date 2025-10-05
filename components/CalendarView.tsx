import React, { useState, useMemo } from 'react';
import { CalendarNote, User } from '../types';
import { NOTE_COLORS } from '../constants';
import CalendarNoteModal from './CalendarNoteModal';
import { ChevronDownIcon } from './icons';

interface CalendarViewProps {
  currentUser: User;
  users: User[];
  notes: CalendarNote[];
  onSaveNote: (noteData: Omit<CalendarNote, 'id'> & { id?: number }) => void;
  onDeleteNote: (noteId: number) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ currentUser, users, notes, onSaveNote, onDeleteNote }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const notesByDate = useMemo(() => {
    const map = new Map<string, CalendarNote[]>();
    notes.forEach(note => {
      const dateKey = note.date;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(note);
    });
    return map;
  }, [notes]);

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const startingDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = [];
  // Previous month's days
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(<div key={`prev-${i}`} className="border-r border-b border-slate-200 bg-slate-50"></div>);
  }
  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = date.toISOString().split('T')[0];
    const dayNotes = notesByDate.get(dateKey) || [];
    
    calendarDays.push(
      <div 
        key={day}
        className="border-r border-b border-slate-200 p-2 min-h-[120px] cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => {
          setSelectedDate(date);
          setIsModalOpen(true);
        }}
      >
        <span className="font-semibold text-slate-800">{day}</span>
        <div className="mt-1 space-y-1">
          {dayNotes.slice(0, 3).map(note => {
            const color = NOTE_COLORS.find(c => c.name === note.color);
            return (
              <div key={note.id} className={`px-2 py-0.5 rounded-md text-xs truncate ${color?.bg} ${color?.text}`}>
                {note.text}
              </div>
            );
          })}
          {dayNotes.length > 3 && (
            <div className="text-xs text-slate-500 font-medium">+ {dayNotes.length - 3} more</div>
          )}
        </div>
      </div>
    );
  }
  // Next month's days to fill the grid
  const totalCells = calendarDays.length;
  const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
  for (let i = 0; i < remainingCells; i++) {
      calendarDays.push(<div key={`next-${i}`} className="border-r border-b border-slate-200 bg-slate-50"></div>);
  }

  const handleMonthChange = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };
  
  const handleSaveNote = (noteData: Omit<CalendarNote, 'id' | 'userId'> & { id?: number }) => {
    onSaveNote({ ...noteData, userId: currentUser.id });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800">Calendar</h1>
        <div className="flex items-center space-x-4">
          <button onClick={() => handleMonthChange(-1)} className="p-2 rounded-full hover:bg-slate-200">
            <ChevronDownIcon className="w-5 h-5 rotate-90" />
          </button>
          <span className="text-xl font-bold text-slate-700 w-48 text-center">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => handleMonthChange(1)} className="p-2 rounded-full hover:bg-slate-200">
            <ChevronDownIcon className="w-5 h-5 -rotate-90" />
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-7 text-center font-semibold text-slate-500 border-b border-slate-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {calendarDays}
        </div>
      </div>
      
      {isModalOpen && selectedDate && (
        <CalendarNoteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveNote}
          onDelete={onDeleteNote}
          selectedDate={selectedDate}
          notesForDay={notesByDate.get(selectedDate.toISOString().split('T')[0]) || []}
          currentUser={currentUser}
          users={users}
        />
      )}
    </div>
  );
};

export default CalendarView;