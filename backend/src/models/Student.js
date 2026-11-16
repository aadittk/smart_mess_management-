/**
 * @file Student.js
 * @description Student data access model.
 */
const { supabase } = require('../config/database');

class Student {
  static async create(studentData) {
    const { data, error } = await supabase
      .from('students')
      .insert([
        {
          name: studentData.name,
          email: studentData.email,
          password: studentData.password,
          roll_number: studentData.roll_number,
          hostel_name: studentData.hostel_name,
          room_number: studentData.room_number,
          phone_number: studentData.phone_number,
          is_verified: false,
          is_blocked: false,
        },
      ])
      .select('id, name, email, roll_number, hostel_name, room_number, phone_number, is_verified, is_blocked, created_at')
      .single();

    if (error) throw error;
    return data;
  }

  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async findByRollNumber(rollNumber) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('roll_number', rollNumber)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('students')
      .select('id, name, email, roll_number, hostel_name, room_number, phone_number, is_verified, is_blocked, created_at')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async findByIdWithPassword(id) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async findAll({ verified, blocked, search, hostel } = {}) {
    let query = supabase
      .from('students')
      .select('id, name, email, roll_number, hostel_name, room_number, phone_number, is_verified, is_blocked, created_at')
      .order('created_at', { ascending: false });

    if (typeof verified === 'boolean') {
      query = query.eq('is_verified', verified);
    }
    if (typeof blocked === 'boolean') {
      query = query.eq('is_blocked', blocked);
    }
    if (hostel) {
      query = query.eq('hostel_name', hostel);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,roll_number.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async updateVerification(id, is_verified) {
    const { data, error } = await supabase
      .from('students')
      .update({ is_verified })
      .eq('id', id)
      .select('id, name, email, roll_number, is_verified, is_blocked')
      .single();

    if (error) throw error;
    return data;
  }

  static async updateBlockedStatus(id, is_blocked) {
    const { data, error } = await supabase
      .from('students')
      .update({ is_blocked })
      .eq('id', id)
      .select('id, name, email, roll_number, is_verified, is_blocked')
      .single();

    if (error) throw error;
    return data;
  }

  static async updateProfile(id, updates) {
    const allowed = {};
    if (updates.room_number) allowed.room_number = updates.room_number;
    if (updates.phone_number) allowed.phone_number = updates.phone_number;

    const { data, error } = await supabase
      .from('students')
      .update(allowed)
      .eq('id', id)
      .select('id, name, email, roll_number, hostel_name, room_number, phone_number')
      .single();

    if (error) throw error;
    return data;
  }

  static async updatePassword(id, hashedPassword) {
    const { data, error } = await supabase
      .from('students')
      .update({ password: hashedPassword })
      .eq('id', id)
      .select('id')
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    if (error) throw error;
    return data;
  }

  static async countAll() {
    const { count, error } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }

  static async countPending() {
    const { count, error } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', false);

    if (error) throw error;
    return count || 0;
  }
}

module.exports = Student;
