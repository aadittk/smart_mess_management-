/**
 * @file database.js
 * @description Supabase client singleton configuration.
 */
require('dotenv').config();

// Ensure global WebSocket is available in Node.js 18/20 environments for @supabase/realtime-js
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class DummyWebSocket {
    constructor() {}
    addEventListener() {}
    removeEventListener() {}
    send() {}
    close() {}
  };
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://mock-smartmess-project.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'mock-smartmess-key';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = { supabase };
