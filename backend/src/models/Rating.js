/**
 * @file Rating.js
 * @description Rating data access model.
 */
const { supabase } = require('../config/database');

class Rating {
  static async create(ratingData) {
    const { data, error } = await supabase
      .from('ratings')
      .insert([
        {
          student_id: ratingData.student_id,
          menu_id: ratingData.menu_id,
          meal_type: ratingData.meal_type.toLowerCase(),
          rating: ratingData.rating,
          comment: ratingData.comment || null,
        },
      ])
      .select('*, menus(date, day, breakfast, lunch, snacks, dinner)')
      .single();

    if (error) throw error;
    return data;
  }

  static async findByStudentAndMenuMeal(student_id, menu_id, meal_type) {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('student_id', student_id)
      .eq('menu_id', menu_id)
      .eq('meal_type', meal_type.toLowerCase())
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('ratings')
      .select('*, menus(date, day), students(name, roll_number)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async findByStudent(student_id) {
    const { data, error } = await supabase
      .from('ratings')
      .select('*, menus(date, day, breakfast, lunch, snacks, dinner)')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async findAll({ meal_type, date_from, date_to, rating } = {}) {
    let query = supabase
      .from('ratings')
      .select('*, menus(date, day), students(name, roll_number, hostel_name)')
      .order('created_at', { ascending: false });

    if (meal_type) {
      query = query.eq('meal_type', meal_type.toLowerCase());
    }
    if (rating) {
      query = query.eq('rating', parseInt(rating, 10));
    }
    if (date_from) {
      query = query.gte('created_at', `${date_from}T00:00:00.000Z`);
    }
    if (date_to) {
      query = query.lte('created_at', `${date_to}T23:59:59.999Z`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async update(id, updates) {
    const payload = {};
    if (updates.rating) payload.rating = updates.rating;
    if (typeof updates.comment !== 'undefined') payload.comment = updates.comment;

    const { data, error } = await supabase
      .from('ratings')
      .update(payload)
      .eq('id', id)
      .select('*, menus(date, day)')
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from('ratings')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    if (error) throw error;
    return data;
  }

  static async getAverageRating() {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating');

    if (error) throw error;
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    return parseFloat((sum / data.length).toFixed(2));
  }

  static async getMealAverages() {
    const { data, error } = await supabase
      .from('ratings')
      .select('meal_type, rating');

    if (error) throw error;
    const totals = {
      breakfast: { count: 0, sum: 0 },
      lunch: { count: 0, sum: 0 },
      snacks: { count: 0, sum: 0 },
      dinner: { count: 0, sum: 0 },
    };

    (data || []).forEach((r) => {
      const type = (r.meal_type || '').toLowerCase();
      if (totals[type]) {
        totals[type].count += 1;
        totals[type].sum += r.rating;
      }
    });

    return {
      breakfast: totals.breakfast.count ? parseFloat((totals.breakfast.sum / totals.breakfast.count).toFixed(2)) : 0,
      lunch: totals.lunch.count ? parseFloat((totals.lunch.sum / totals.lunch.count).toFixed(2)) : 0,
      snacks: totals.snacks.count ? parseFloat((totals.snacks.sum / totals.snacks.count).toFixed(2)) : 0,
      dinner: totals.dinner.count ? parseFloat((totals.dinner.sum / totals.dinner.count).toFixed(2)) : 0,
    };
  }

  static async getTopAndBottomDishes() {
    const { data, error } = await supabase
      .from('ratings')
      .select('meal_type, rating, menus(breakfast, lunch, snacks, dinner)');

    if (error) throw error;

    const dishStats = {}; // dishName -> { sum: number, count: number }

    (data || []).forEach((row) => {
      const menu = row.menus;
      if (!menu) return;
      const dishes = menu[row.meal_type] || [];
      dishes.forEach((dish) => {
        const cleanName = dish.trim();
        if (!dishStats[cleanName]) {
          dishStats[cleanName] = { sum: 0, count: 0 };
        }
        dishStats[cleanName].sum += row.rating;
        dishStats[cleanName].count += 1;
      });
    });

    const dishList = Object.entries(dishStats).map(([dish, stat]) => ({
      dish,
      average: parseFloat((stat.sum / stat.count).toFixed(2)),
      ratingsCount: stat.count,
    }));

    dishList.sort((a, b) => b.average - a.average);

    const topDishes = dishList.slice(0, 5);
    const bottomDishes = [...dishList].reverse().slice(0, 5);

    return { topDishes, bottomDishes };
  }
}

module.exports = Rating;
