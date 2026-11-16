/**
 * @file Menu.js
 * @description Menu data access model.
 */
const { supabase } = require('../config/database');

class Menu {
  static async findByDate(date) {
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('date', date)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async findByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async create(menuData) {
    const { data, error } = await supabase
      .from('menus')
      .insert([
        {
          date: menuData.date,
          day: menuData.day,
          breakfast: menuData.breakfast || [],
          lunch: menuData.lunch || [],
          snacks: menuData.snacks || [],
          dinner: menuData.dinner || [],
        },
      ])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id, updates) {
    const payload = {};
    if (updates.breakfast) payload.breakfast = updates.breakfast;
    if (updates.lunch) payload.lunch = updates.lunch;
    if (updates.snacks) payload.snacks = updates.snacks;
    if (updates.dinner) payload.dinner = updates.dinner;
    if (updates.day) payload.day = updates.day;

    const { data, error } = await supabase
      .from('menus')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  static async upsert(menuData) {
    const { data, error } = await supabase
      .from('menus')
      .upsert(
        {
          date: menuData.date,
          day: menuData.day,
          breakfast: menuData.breakfast || [],
          lunch: menuData.lunch || [],
          snacks: menuData.snacks || [],
          dinner: menuData.dinner || [],
        },
        { onConflict: 'date' }
      )
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from('menus')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    if (error) throw error;
    return data;
  }

  static async copyWeek(fromWeekStart, toWeekStart) {
    const fromStart = new Date(fromWeekStart);
    const fromEnd = new Date(fromStart);
    fromEnd.setDate(fromStart.getDate() + 6);

    const fromStartStr = fromStart.toISOString().split('T')[0];
    const fromEndStr = fromEnd.toISOString().split('T')[0];

    const sourceMenus = await this.findByDateRange(fromStartStr, fromEndStr);
    if (!sourceMenus || sourceMenus.length === 0) {
      throw new Error(`No menus found in source week (${fromStartStr} to ${fromEndStr}) to copy.`);
    }

    const toStart = new Date(toWeekStart);
    const copiedResults = [];

    for (let i = 0; i < 7; i++) {
      const currentSourceDate = new Date(fromStart);
      currentSourceDate.setDate(fromStart.getDate() + i);
      const curSourceDateStr = currentSourceDate.toISOString().split('T')[0];

      const matchingMenu = sourceMenus.find((m) => m.date === curSourceDateStr);
      if (matchingMenu) {
        const targetDate = new Date(toStart);
        targetDate.setDate(toStart.getDate() + i);
        const targetDateStr = targetDate.toISOString().split('T')[0];

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const targetDayName = days[targetDate.getDay()];

        const saved = await this.upsert({
          date: targetDateStr,
          day: targetDayName,
          breakfast: matchingMenu.breakfast,
          lunch: matchingMenu.lunch,
          snacks: matchingMenu.snacks,
          dinner: matchingMenu.dinner,
        });
        copiedResults.push(saved);
      }
    }

    return copiedResults;
  }
}

module.exports = Menu;
