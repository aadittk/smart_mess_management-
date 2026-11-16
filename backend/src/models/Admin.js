/**
 * @file Admin.js
 * @description Admin data access model.
 */
const { supabase } = require('../config/database');

class Admin {
  static async create(adminData) {
    const { data, error } = await supabase
      .from('admins')
      .insert([
        {
          name: adminData.name,
          email: adminData.email,
          password: adminData.password,
          role: adminData.role || 'admin',
        },
      ])
      .select('id, name, email, role, created_at')
      .single();

    if (error) throw error;
    return data;
  }

  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('admins')
      .select('id, name, email, role, created_at')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}

module.exports = Admin;
