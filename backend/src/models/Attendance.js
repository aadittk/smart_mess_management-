/**
 * @file Attendance.js
 * @description Attendance data access model.
 */
const { supabase } = require('../config/database');

class Attendance {
  static async findByStudentAndDate(student_id, date) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', student_id)
      .eq('date', date)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async markMeal(student_id, date, meal_type) {
    const normalizedMeal = meal_type.toLowerCase();
    const existing = await this.findByStudentAndDate(student_id, date);

    if (!existing) {
      const payload = {
        student_id,
        date,
        breakfast: normalizedMeal === 'breakfast',
        lunch: normalizedMeal === 'lunch',
        snacks: normalizedMeal === 'snacks',
        dinner: normalizedMeal === 'dinner',
      };

      const { data, error } = await supabase
        .from('attendance')
        .insert([payload])
        .select('*')
        .single();

      if (error) throw error;
      return data;
    }

    if (existing[normalizedMeal] === true) {
      const error = new Error(`Attendance for ${normalizedMeal} has already been marked for today.`);
      error.statusCode = 409;
      throw error;
    }

    const { data, error } = await supabase
      .from('attendance')
      .update({ [normalizedMeal]: true })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  static async findByStudent(student_id, month, year) {
    let query = supabase
      .from('attendance')
      .select('*')
      .eq('student_id', student_id)
      .order('date', { ascending: false });

    if (month && year) {
      const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const endOfMonth = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

      query = query.gte('date', startOfMonth).lt('date', endOfMonth);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getReport({ date_from, date_to } = {}) {
    let query = supabase
      .from('attendance')
      .select('*, students(name, roll_number, hostel_name, room_number)')
      .order('date', { ascending: false });

    if (date_from) {
      query = query.gte('date', date_from);
    }
    if (date_to) {
      query = query.lte('date', date_to);
    }

    const { data, error } = await query;
    if (error) throw error;

    const summary = {
      totalRecords: (data || []).length,
      breakfastCount: (data || []).filter((r) => r.breakfast).length,
      lunchCount: (data || []).filter((r) => r.lunch).length,
      snacksCount: (data || []).filter((r) => r.snacks).length,
      dinnerCount: (data || []).filter((r) => r.dinner).length,
    };

    return { records: data || [], summary };
  }

  static async getAttendanceTrends(days = 7) {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);

    const pastDateStr = pastDate.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance')
      .select('date, breakfast, lunch, snacks, dinner')
      .gte('date', pastDateStr)
      .lte('date', todayStr)
      .order('date', { ascending: true });

    if (error) throw error;

    const dateMap = {};
    (data || []).forEach((row) => {
      const d = row.date;
      if (!dateMap[d]) {
        dateMap[d] = { date: d, breakfast: 0, lunch: 0, snacks: 0, dinner: 0, total: 0 };
      }
      if (row.breakfast) {
        dateMap[d].breakfast += 1;
        dateMap[d].total += 1;
      }
      if (row.lunch) {
        dateMap[d].lunch += 1;
        dateMap[d].total += 1;
      }
      if (row.snacks) {
        dateMap[d].snacks += 1;
        dateMap[d].total += 1;
      }
      if (row.dinner) {
        dateMap[d].dinner += 1;
        dateMap[d].total += 1;
      }
    });

    return Object.values(dateMap);
  }

  static async getMovingAverageForecast(windowDays = 7) {
    const trends = await this.getAttendanceTrends(windowDays * 2);
    if (!trends || trends.length === 0) {
      return {
        forecastDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        forecastTotal: 0,
        forecastMealWise: { breakfast: 0, lunch: 0, snacks: 0, dinner: 0 },
        historicalBasisDays: 0,
      };
    }

    const recentSlice = trends.slice(-windowDays);
    const n = recentSlice.length;

    const sum = recentSlice.reduce(
      (acc, curr) => ({
        breakfast: acc.breakfast + curr.breakfast,
        lunch: acc.lunch + curr.lunch,
        snacks: acc.snacks + curr.snacks,
        dinner: acc.dinner + curr.dinner,
        total: acc.total + curr.total,
      }),
      { breakfast: 0, lunch: 0, snacks: 0, dinner: 0, total: 0 }
    );

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      forecastDate: tomorrow.toISOString().split('T')[0],
      forecastTotal: Math.round(sum.total / n),
      forecastMealWise: {
        breakfast: Math.round(sum.breakfast / n),
        lunch: Math.round(sum.lunch / n),
        snacks: Math.round(sum.snacks / n),
        dinner: Math.round(sum.dinner / n),
      },
      historicalBasisDays: n,
    };
  }
}

module.exports = Attendance;
