import React, { useState, useEffect } from 'react';
import { Clock, Trash2, Plus, Pill, Droplet, Footprints, Stethoscope, Bell } from 'lucide-react';
import { api } from '../services/api';

export default function CaregiverRemindersManager({ patientId }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState('medicine');
  const [newTime, setNewTime] = useState('09:00');

  useEffect(() => {
    if (patientId) {
      loadReminders();
    }
  }, [patientId]);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const res = await api.getReminders(patientId);
      if (res?.data) {
        setReminders(res.data);
      }
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!newLabel || !newTime) return;
    
    try {
      await api.createReminder({
        patientId,
        label: newLabel,
        type: newType,
        scheduleTime: newTime,
        recurrence: 'daily'
      });
      setNewLabel('');
      setNewTime('09:00');
      setShowAdd(false);
      loadReminders();
    } catch (err) {
      console.error('Failed to add reminder:', err);
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      // In care_data, updating reminder_text to null deletes the reminder
      await api.updateCareData(id, {
        reminder_text: null,
      });
      loadReminders();
    } catch (err) {
      console.error('Failed to delete reminder:', err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'medicine': return <Pill size={20} color="#0284c7" />;
      case 'hydration': return <Droplet size={20} color="#0ea5e9" />;
      case 'activity': return <Footprints size={20} color="#10b981" />;
      case 'appointment': return <Stethoscope size={20} color="#8b5cf6" />;
      default: return <Bell size={20} color="#f59e0b" />;
    }
  };

  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
          Daily Reminders
        </h3>
        <button 
          onClick={() => setShowAdd(!showAdd)} 
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          <Plus size={16} style={{ marginRight: '6px' }} />
          Add Reminder
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddReminder} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
          <input 
            type="text" 
            placeholder="Reminder text (e.g. Morning Meds)" 
            value={newLabel} 
            onChange={(e) => setNewLabel(e.target.value)} 
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            required
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              value={newType} 
              onChange={(e) => setNewType(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            >
              <option value="medicine">Medicine</option>
              <option value="hydration">Hydration</option>
              <option value="activity">Activity</option>
              <option value="appointment">Appointment</option>
            </select>
            <input 
              type="time" 
              value={newTime} 
              onChange={(e) => setNewTime(e.target.value)} 
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              required
            />
          </div>
          <button type="submit" className="btn-success" style={{ padding: '10px', borderRadius: '8px' }}>Save</button>
        </form>
      )}

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading reminders...</p>
      ) : reminders.length === 0 ? (
        <p style={{ color: '#64748b' }}>No reminders found for this patient.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reminders.map((reminder) => (
            <div key={reminder._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f1f5f9', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {getTypeIcon(reminder.type)}
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{reminder.label}</div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> {reminder.scheduleTime}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteReminder(reminder._id)}
                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                title="Delete Reminder"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
