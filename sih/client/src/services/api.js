import { supabase } from '../config/supabaseClient';

export const api = {
  getToken() {
    return localStorage.getItem('cognicare_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('cognicare_token', token);
    } else {
      localStorage.removeItem('cognicare_token');
    }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('cognicare_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('cognicare_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cognicare_user');
    }
  },

  // Auth Endpoints via Supabase
  async loginCaregiver(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    
    // Check role in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (profileError) throw new Error('Could not fetch profile');
    if (profile.role !== 'caretaker') throw new Error('Not authorized as a caretaker');

    const user = { ...data.user, ...profile, name: profile.associated_email || email };
    return { success: true, token: data.session.access_token, user };
  },

  async loginPatient(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    
    // Check role in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (profileError) throw new Error('Could not fetch profile');
    if (profile.role !== 'elder') throw new Error('Not authorized as an elder');

    const user = { ...data.user, ...profile, name: profile.associated_email || email, patientId: data.user.id };
    return { success: true, token: data.session.access_token, user };
  },

  async registerCaregiver(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: metadata }
    });
    if (error) throw new Error(error.message);

    // Insert profile
    const { error: profileError } = await supabase.from('profiles').insert([
      { id: data.user.id, role: 'caretaker', associated_email: email }
    ]);
    
    if (profileError) {
      console.error("Profile creation error:", profileError);
      throw new Error(`Could not create profile: ${profileError.message || profileError.details || 'Check RLS policies'}`);
    }
    return { success: true };
  },

  async registerPatient(email, password, caregiverEmail, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: metadata }
    });
    if (error) throw new Error(error.message);

    // Insert profile linking to caregiver
    const { error: profileError } = await supabase.from('profiles').insert([
      { id: data.user.id, role: 'elder', associated_email: caregiverEmail }
    ]);
    
    if (profileError) {
      console.error("Profile creation error:", profileError);
      throw new Error(`Could not create profile: ${profileError.message || profileError.details || 'Check RLS policies'}`);
    }
    return { success: true };
  },
  
  async logout() {
      await supabase.auth.signOut();
      this.setToken(null);
      this.setCurrentUser(null);
  },

  async getMe() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw new Error(error.message);
    return data.user;
  },

  // Care Data methods
  async getCareData(elderId) {
    const { data, error } = await supabase
      .from('care_data')
      .select('*')
      .eq('elder_id', elderId);
    if (error) throw new Error(error.message);
    return data;
  },

  async getEldersForCaregiver(caretakerEmail) {
    // Caretaker manages elders whose associated_email is the caretaker's email (or we can just fetch all elders for now if the relation is simple)
    // According to schema: profiles has id, role, associated_email.
    // Let's assume associated_email for an elder is the caretaker's email
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'elder')
      .eq('associated_email', caretakerEmail);
    if (error) throw new Error(error.message);
    return data;
  },

  async updateCareData(careDataId, updates) {
    const { data, error } = await supabase
      .from('care_data')
      .update(updates)
      .eq('id', careDataId)
      .select();
    if (error) throw new Error(error.message);
    return data;
  },
  
  async createCareData(elderId, updates) {
      const { data, error } = await supabase
        .from('care_data')
        .insert({ elder_id: elderId, ...updates })
        .select();
      if (error) throw new Error(error.message);
      return data;
  },

  // Mocked methods for rest of the app so it doesn't crash
  async getCaregiverDashboard() {
    return { data: { totalPatients: 1, patients: [] } };
  },
  async getPatientStats(id) {
    return { data: { sessions: [], adherenceRate: 90 } };
  },
  async getPatientSessions() {
    return { data: [] };
  },
  async saveGameSession() {
    return { success: true };
  },
  
  async getReminders(patientId) {
    const { data, error } = await supabase
      .from('care_data')
      .select('*')
      .eq('elder_id', patientId)
      .not('reminder_text', 'is', null);
      
    if (error) throw new Error(error.message);
    
    // map to app's reminder format
    const reminders = data.map(r => {
      let parsed = { label: r.reminder_text };
      try { parsed = JSON.parse(r.reminder_text); } catch(e) {}
      
      return {
        _id: r.id,
        serverId: r.id,
        label: parsed.label || r.reminder_text,
        type: parsed.type || 'medicine',
        scheduleTime: parsed.scheduleTime || '09:00',
        recurrence: parsed.recurrence || 'daily',
        acknowledgedAt: parsed.acknowledgedAt || null,
        photoUrl: parsed.photoUrl || null
      };
    });
    return { data: reminders };
  },
  
  async createReminder(reminderData) {
    const { data, error } = await supabase
      .from('care_data')
      .insert({ 
        elder_id: reminderData.patientId, 
        reminder_text: JSON.stringify(reminderData) 
      })
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return { data: { _id: data.id } };
  },
  
  async acknowledgeReminder(id) {
    // we would update the care_data row to set acknowledgedAt inside the JSON
    // but for simplicity, we'll just fetch, parse, update and save
    const { data, error } = await supabase.from('care_data').select('*').eq('id', id).single();
    if (data && data.reminder_text) {
        let parsed = { label: data.reminder_text };
        try { parsed = JSON.parse(data.reminder_text); } catch(e) {}
        parsed.acknowledgedAt = new Date().toISOString();
        await supabase.from('care_data').update({ reminder_text: JSON.stringify(parsed) }).eq('id', id);
    }
    return { success: true };
  }
};
