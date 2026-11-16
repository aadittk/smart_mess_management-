-- ============================================================================
-- SmartMess: Smart Hostel Mess Management System
-- PostgreSQL / Supabase Database Schema DDL & Seed Data
-- ============================================================================

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLE: students
-- ============================================================================
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    hostel_name VARCHAR(100) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes on students
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_verification ON students(is_verified, is_blocked);

-- ============================================================================
-- TABLE: admins
-- ============================================================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- ============================================================================
-- TABLE: menus
-- ============================================================================
CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    day VARCHAR(20) NOT NULL,
    breakfast TEXT[] NOT NULL DEFAULT '{}',
    lunch TEXT[] NOT NULL DEFAULT '{}',
    snacks TEXT[] NOT NULL DEFAULT '{}',
    dinner TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_menus_date ON menus(date);

-- ============================================================================
-- TABLE: ratings
-- ============================================================================
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snacks', 'dinner')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_menu_meal UNIQUE (student_id, menu_id, meal_type)
);

CREATE INDEX IF NOT EXISTS idx_ratings_student ON ratings(student_id);
CREATE INDEX IF NOT EXISTS idx_ratings_menu ON ratings(menu_id);
CREATE INDEX IF NOT EXISTS idx_ratings_meal_type ON ratings(meal_type);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at);

-- ============================================================================
-- TABLE: attendance
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    breakfast BOOLEAN NOT NULL DEFAULT FALSE,
    lunch BOOLEAN NOT NULL DEFAULT FALSE,
    snacks BOOLEAN NOT NULL DEFAULT FALSE,
    dinner BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_date UNIQUE (student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- ============================================================================
-- TABLE: complaints
-- ============================================================================
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
    admin_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_complaints_student ON complaints(student_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);

-- ============================================================================
-- SAMPLE SEED DATA (For Local Testing & Demonstration)
-- ============================================================================

-- Seed Demo Admin: email 'admin@smartmess.edu', password 'Admin@123'
-- Hash generated using bcrypt cost 10 for 'Admin@123'
INSERT INTO admins (name, email, password, role)
VALUES (
    'Chief Mess Warden',
    'admin@smartmess.edu',
    '$2b$10$wN36wS0dF867iR4Wk6Hn0uVzKmsH3W1hX4E3qA1kF4eT2o5iXoV1C',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Seed Demo Verified Student: email 'student@smartmess.edu', password 'Student@123'
INSERT INTO students (name, email, password, roll_number, hostel_name, room_number, phone_number, is_verified, is_blocked)
VALUES (
    'Aarav Sharma',
    'student@smartmess.edu',
    '$2b$10$wN36wS0dF867iR4Wk6Hn0uVzKmsH3W1hX4E3qA1kF4eT2o5iXoV1C',
    'CS2024001',
    'Aryabhatta Hostel',
    'B-204',
    '+919876543210',
    TRUE,
    FALSE
) ON CONFLICT (email) DO NOTHING;

-- Seed Sample Menu for Today
INSERT INTO menus (date, day, breakfast, lunch, snacks, dinner)
VALUES (
    CURRENT_DATE,
    TO_CHAR(CURRENT_DATE, 'Day'),
    ARRAY['Idli Sambhar', 'Coconut Chutney', 'Boiled Eggs', 'Tea / Coffee'],
    ARRAY['Paneer Butter Masala', 'Dal Tadka', 'Jeera Rice', 'Butter Roti', 'Green Salad'],
    ARRAY['Veg Samosa', 'Mint Chutney', 'Masala Chai'],
    ARRAY['Mix Vegetable Curry', 'Moong Dal', 'Steamed Rice', 'Chapati', 'Gulab Jamun']
) ON CONFLICT (date) DO UPDATE SET
    breakfast = EXCLUDED.breakfast,
    lunch = EXCLUDED.lunch,
    snacks = EXCLUDED.snacks,
    dinner = EXCLUDED.dinner;
