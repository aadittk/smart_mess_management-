import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import {
  IoCalendarOutline,
  IoCopyOutline,
  IoTrashOutline,
  IoSaveOutline,
  IoAddOutline,
  IoCloseOutline,
  IoReorderTwoOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
} from 'react-icons/io5';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';
import styles from './MenuManagement.module.css';

export default function MenuManagement() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [menuId, setMenuId] = useState(null);
  const [dayName, setDayName] = useState('Monday');

  const [breakfast, setBreakfast] = useState([]);
  const [lunch, setLunch] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [dinner, setDinner] = useState([]);

  // New dish input state per meal
  const [newDishInputs, setNewDishInputs] = useState({
    breakfast: '',
    lunch: '',
    snacks: '',
    dinner: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Copy Week Modal
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [fromWeekStart, setFromWeekStart] = useState('');
  const [toWeekStart, setToWeekStart] = useState('');
  const [copying, setCopying] = useState(false);

  // Drag and Drop state
  const [draggedItem, setDraggedItem] = useState(null); // { meal: 'breakfast', index: 0 }

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const fetchMenuForDate = async (dateStr) => {
    setLoading(true);
    try {
      const parsedDate = new Date(dateStr);
      setDayName(daysOfWeek[parsedDate.getDay()]);

      const res = await adminApi.getMenus({ date: dateStr });
      if (res.success && res.data) {
        setMenuId(res.data.id);
        setBreakfast(res.data.breakfast || []);
        setLunch(res.data.lunch || []);
        setSnacks(res.data.snacks || []);
        setDinner(res.data.dinner || []);
      } else {
        // No menu yet for this date, reset arrays
        setMenuId(null);
        setBreakfast([]);
        setLunch([]);
        setSnacks([]);
        setDinner([]);
      }
    } catch (err) {
      toast.error('Failed to load menu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuForDate(selectedDate);
  }, [selectedDate]);

  const handleAddDish = (mealType) => {
    const val = newDishInputs[mealType]?.trim();
    if (!val) return;

    const setterMap = {
      breakfast: setBreakfast,
      lunch: setLunch,
      snacks: setSnacks,
      dinner: setDinner,
    };

    setterMap[mealType]((prev) => [...prev, val]);
    setNewDishInputs((prev) => ({ ...prev, [mealType]: '' }));
  };

  const handleRemoveDish = (mealType, index) => {
    const setterMap = {
      breakfast: setBreakfast,
      lunch: setLunch,
      snacks: setSnacks,
      dinner: setDinner,
    };
    setterMap[mealType]((prev) => prev.filter((_, i) => i !== index));
  };

  // Move dish up/down fallback
  const handleMoveDish = (mealType, index, direction) => {
    const setterMap = {
      breakfast: setBreakfast,
      lunch: setLunch,
      snacks: setSnacks,
      dinner: setDinner,
    };
    setterMap[mealType]((prev) => {
      const arr = [...prev];
      const targetIdx = index + direction;
      if (targetIdx < 0 || targetIdx >= arr.length) return arr;
      const temp = arr[index];
      arr[index] = arr[targetIdx];
      arr[targetIdx] = temp;
      return arr;
    });
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, mealType, index) => {
    setDraggedItem({ mealType, index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, mealType, targetIndex) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.mealType !== mealType) return;
    const sourceIndex = draggedItem.index;
    if (sourceIndex === targetIndex) return;

    const setterMap = {
      breakfast: setBreakfast,
      lunch: setLunch,
      snacks: setSnacks,
      dinner: setDinner,
    };

    setterMap[mealType]((prev) => {
      const arr = [...prev];
      const [removed] = arr.splice(sourceIndex, 1);
      arr.splice(targetIndex, 0, removed);
      return arr;
    });

    setDraggedItem(null);
  };

  const handleSaveMenu = async () => {
    setSaving(true);
    try {
      const payload = {
        date: selectedDate,
        day: dayName,
        breakfast,
        lunch,
        snacks,
        dinner,
      };

      if (menuId) {
        await adminApi.updateMenu(menuId, payload);
        toast.success(`Menu for ${selectedDate} updated successfully!`);
      } else {
        const res = await adminApi.createMenu(payload);
        if (res.data) setMenuId(res.data.id);
        toast.success(`Menu for ${selectedDate} published successfully!`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save menu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMenu = async () => {
    if (!menuId) return;
    if (!window.confirm(`Are you sure you want to delete the menu for ${selectedDate}?`)) return;

    try {
      await adminApi.deleteMenu(menuId);
      toast.success('Menu deleted.');
      setMenuId(null);
      setBreakfast([]);
      setLunch([]);
      setSnacks([]);
      setDinner([]);
    } catch (err) {
      toast.error(err.message || 'Failed to delete menu.');
    }
  };

  const handleCopyWeekSubmit = async (e) => {
    e.preventDefault();
    if (!fromWeekStart || !toWeekStart) {
      toast.error('Please enter both source and destination Monday dates.');
      return;
    }

    setCopying(true);
    try {
      const res = await adminApi.copyWeek({
        from_week_start: fromWeekStart,
        to_week_start: toWeekStart,
      });
      toast.success(res.message || 'Week copied successfully!');
      setCopyModalOpen(false);
      await fetchMenuForDate(selectedDate);
    } catch (err) {
      toast.error(err.message || 'Failed to copy week.');
    } finally {
      setCopying(false);
    }
  };

  const mealSections = [
    { key: 'breakfast', label: 'Breakfast', items: breakfast },
    { key: 'lunch', label: 'Lunch', items: lunch },
    { key: 'snacks', label: 'Evening Snacks', items: snacks },
    { key: 'dinner', label: 'Dinner', items: dinner },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Menu Management & Scheduling</h1>
          <p className={styles.subtitle}>
            Create, update, reorder dishes, and copy weekly meal plans
          </p>
        </div>

        <div className={styles.topActions}>
          <Button variant="outline" size="md" onClick={() => setCopyModalOpen(true)}>
            <IoCopyOutline size={18} /> Copy Previous Week
          </Button>
          {menuId && (
            <Button variant="danger" size="md" onClick={handleDeleteMenu}>
              <IoTrashOutline size={18} /> Delete Menu
            </Button>
          )}
          <Button variant="primary" size="md" loading={saving} onClick={handleSaveMenu}>
            <IoSaveOutline size={18} /> {menuId ? 'Save Changes' : 'Publish Daily Menu'}
          </Button>
        </div>
      </div>

      {/* Date Picker Bar */}
      <div className={styles.dateBar}>
        <div className={styles.datePickerGroup}>
          <label htmlFor="menu-date-select" className={styles.dateLabel}>
            <IoCalendarOutline size={18} /> Select Date:
          </label>
          <input
            id="menu-date-select"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.dateInput}
          />
          <span className={styles.dayBadge}>{dayName}</span>
          {menuId ? (
            <span className={styles.statusSaved}>&bull; Published in Database</span>
          ) : (
            <span className={styles.statusDraft}>&bull; New Draft (Unsaved)</span>
          )}
        </div>
      </div>

      {loading ? (
        <Loader message="Loading menu dishes..." />
      ) : (
        <div className={styles.mealGrid}>
          {mealSections.map(({ key, label, items }) => (
            <Card
              key={key}
              title={label}
              subtitle={`${items.length} items configured`}
              className={styles.mealColumnCard}
            >
              {/* Add dish inline form */}
              <div className={styles.addDishRow}>
                <input
                  type="text"
                  placeholder={`Add dish to ${label}...`}
                  value={newDishInputs[key]}
                  onChange={(e) =>
                    setNewDishInputs((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDish(key);
                    }
                  }}
                  className={styles.dishInput}
                />
                <Button variant="secondary" size="sm" onClick={() => handleAddDish(key)}>
                  <IoAddOutline size={16} /> Add
                </Button>
              </div>

              {/* Dish chips list with Drag and Drop */}
              <div
                className={styles.dishContainer}
                onDragOver={handleDragOver}
              >
                {items.length === 0 ? (
                  <p className={styles.noDishesText}>No dishes added yet.</p>
                ) : (
                  items.map((dish, idx) => (
                    <div
                      key={idx}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, key, idx)}
                      onDrop={(e) => handleDrop(e, key, idx)}
                      className={styles.dishItem}
                    >
                      <div className={styles.dragHandle} title="Drag to reorder">
                        <IoReorderTwoOutline size={18} />
                      </div>
                      <span className={styles.dishTitle}>{dish}</span>

                      <div className={styles.dishActions}>
                        <button
                          type="button"
                          className={styles.orderBtn}
                          disabled={idx === 0}
                          onClick={() => handleMoveDish(key, idx, -1)}
                          title="Move Up"
                        >
                          <IoArrowUpOutline size={14} />
                        </button>
                        <button
                          type="button"
                          className={styles.orderBtn}
                          disabled={idx === items.length - 1}
                          onClick={() => handleMoveDish(key, idx, 1)}
                          title="Move Down"
                        >
                          <IoArrowDownOutline size={14} />
                        </button>
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => handleRemoveDish(key, idx)}
                          title="Remove dish"
                        >
                          <IoCloseOutline size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Copy Previous Week Modal */}
      <Modal
        isOpen={copyModalOpen}
        onClose={() => setCopyModalOpen(false)}
        title="Duplicate 7-Day Menu from Previous Week"
      >
        <form onSubmit={handleCopyWeekSubmit} className={styles.modalForm}>
          <p className={styles.modalHelp}>
            Copies all daily menus from Monday through Sunday of a source week to a target destination week.
          </p>

          <div className={styles.modalField}>
            <label className={styles.fieldLabel}>Source Week Monday (From):</label>
            <input
              type="date"
              value={fromWeekStart}
              onChange={(e) => setFromWeekStart(e.target.value)}
              required
            />
          </div>

          <div className={styles.modalField}>
            <label className={styles.fieldLabel}>Target Week Monday (To):</label>
            <input
              type="date"
              value={toWeekStart}
              onChange={(e) => setToWeekStart(e.target.value)}
              required
            />
          </div>

          <div className={styles.modalActions}>
            <Button variant="outline" size="md" type="button" onClick={() => setCopyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={copying}>
              Copy 7-Day Menu
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
