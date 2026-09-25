import React, { useState, useEffect } from 'react';
import { PhoneCall, Trash2, Plus } from 'lucide-react';
import { api } from '../services/api';

export default function QuickContactsManager({ patientId }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    if (patientId) {
      loadContacts();
    }
  }, [patientId]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const careData = await api.getCareData(patientId);
      const loadedContacts = careData
        .filter((row) => row.quick_number && row.quick_contact_name)
        .map((row) => ({
          id: row.id,
          name: row.quick_contact_name,
          phone: row.quick_number,
        }));
      setContacts(loadedContacts);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    
    try {
      await api.createCareData(patientId, {
        quick_contact_name: newName,
        quick_number: newPhone,
      });
      setNewName('');
      setNewPhone('');
      setShowAdd(false);
      loadContacts();
    } catch (err) {
      console.error('Failed to add contact:', err);
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await api.updateCareData(id, {
        quick_contact_name: null,
        quick_number: null,
      });
      loadContacts();
    } catch (err) {
      console.error('Failed to delete contact:', err);
    }
  };

  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
          Quick Contacts
        </h3>
        <button 
          onClick={() => setShowAdd(!showAdd)} 
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          <Plus size={16} style={{ marginRight: '6px' }} />
          Add Contact
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddContact} style={{ display: 'flex', gap: '12px', marginBottom: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
          <input 
            type="text" 
            placeholder="Name" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            required
          />
          <input 
            type="tel" 
            placeholder="Phone Number" 
            value={newPhone} 
            onChange={(e) => setNewPhone(e.target.value)} 
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            required
          />
          <button type="submit" className="btn-success" style={{ padding: '0 20px', borderRadius: '8px' }}>Save</button>
        </form>
      )}

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading contacts...</p>
      ) : contacts.length === 0 ? (
        <p style={{ color: '#64748b' }}>No quick contacts found for this patient.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {contacts.map((contact) => (
            <div key={contact.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f1f5f9', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <PhoneCall size={20} color="#0284c7" />
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{contact.name}</div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{contact.phone}</div>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteContact(contact.id)}
                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                title="Delete Contact"
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
