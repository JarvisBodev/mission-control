'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon, Clock, MapPin, Users, ChevronRight } from 'lucide-react';

interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: string;
  end: string;
  location: string;
  attendees: string[];
  isAllDay: boolean;
}

export default function CalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar?days=7');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      setEvents(data.events || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load calendar events');
      console.error('Failed to fetch calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string, isAllDay: boolean) => {
    if (isAllDay) return 'All day';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-zinc-400">Loading calendar events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">⚠️</div>
        <p className="text-zinc-400 mb-4">{error}</p>
        <button
          onClick={fetchEvents}
          className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-8 text-center">
        <CalendarIcon className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-zinc-300 mb-2">No upcoming events</h3>
        <p className="text-zinc-500">You have no events scheduled for the next 7 days.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-zinc-300">Upcoming Events</h3>
        <span className="text-xs text-zinc-500 bg-zinc-900/50 px-3 py-1 rounded-full">
          Next 7 days
        </span>
      </div>
      
      <div className="space-y-3">
        {events.slice(0, 5).map((event) => (
          <div
            key={event.id}
            className="group bg-zinc-900/30 border border-white/5 p-4 rounded-2xl hover:bg-zinc-900/50 hover:border-white/10 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <h4 className="font-semibold text-zinc-200 group-hover:text-white">
                    {event.summary}
                  </h4>
                </div>
                
                <div className="space-y-2 pl-5">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock size={14} className="text-zinc-500" />
                    <span className="text-zinc-400">
                      {formatDate(event.start)} • {formatTime(event.start, event.isAllDay)}
                      {!event.isAllDay && ` – ${formatTime(event.end, false)}`}
                    </span>
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin size={14} className="text-zinc-500" />
                      <span className="text-zinc-400 truncate">{event.location}</span>
                    </div>
                  )}
                  
                  {event.attendees.length > 0 && (
                    <div className="flex items-center gap-3 text-sm">
                      <Users size={14} className="text-zinc-500" />
                      <span className="text-zinc-400">
                        {event.attendees.length} attendee{event.attendees.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <ChevronRight size={16} className="text-zinc-700 group-hover:text-zinc-400 ml-4" />
            </div>
          </div>
        ))}
      </div>
      
      {events.length > 5 && (
        <div className="pt-4 border-t border-white/5 text-center">
          <p className="text-sm text-zinc-500">
            +{events.length - 5} more events
          </p>
        </div>
      )}
    </div>
  );
}