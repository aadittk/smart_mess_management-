/**
 * @file Complaint.js
 * @description Complaint data access model.
 */
const { supabase } = require('../config/database');

class Complaint {
  static async create(complaintData) {
    const { data, error } = await supabase
      .from('complaints')
      .insert([
        {
          student_id: complaintData.student_id,
          title: complaintData.title,
          description: complaintData.description,
          status: 'pending',
          admin_response: null,
        },
      ])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('complaints')
      .select('*, students(name, roll_number, hostel_name, room_number)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async findByStudent(student_id) {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async findAll({ status } = {}) {
    let query = supabase
      .from('complaints')
      .select('*, students(name, roll_number, hostel_name, room_number)')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async updateStatus(id, { status, admin_response }) {
    const payload = {
      status,
      admin_response: admin_response || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('complaints')
      .update(payload)
      .eq('id', id)
      .select('*, students(name, roll_number)')
      .single();

    if (error) throw error;
    return data;
  }

  static async countOpen() {
    const { count, error } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'in_progress']);

    if (error) throw error;
    return count || 0;
  }
}

module.exports = Complaint;
