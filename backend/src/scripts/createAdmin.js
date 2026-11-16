/**
 * @file createAdmin.js
 * @description Standalone CLI script to securely provision an administrator account.
 * Reads credentials from CLI arguments or environment variables. Never hardcodes secrets.
 *
 * Usage:
 *   node src/scripts/createAdmin.js --name "Mess Manager" --email "manager@smartmess.edu" --password "SecurePass123"
 * Or via env variables:
 *   ADMIN_NAME="..." ADMIN_EMAIL="..." ADMIN_PASSWORD="..." node src/scripts/createAdmin.js
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const { supabase } = require('../config/database');

const BCRYPT_SALT_ROUNDS = 10;

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) parsed.name = args[++i];
    else if (args[i] === '--email' && args[i + 1]) parsed.email = args[++i];
    else if (args[i] === '--password' && args[i + 1]) parsed.password = args[++i];
  }
  return parsed;
}

async function createAdmin() {
  const cliArgs = parseArgs();
  const name = cliArgs.name || process.env.ADMIN_NAME;
  const email = cliArgs.email || process.env.ADMIN_EMAIL;
  const password = cliArgs.password || process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error('Error: Missing admin credentials.');
    console.error('Usage: node src/scripts/createAdmin.js --name "<name>" --email "<email>" --password "<password>"');
    console.error('Or set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD environment variables.');
    process.exit(1);
  }

  try {
    console.log(`Checking existing account for: ${email}...`);
    const { data: existing, error: checkError } = await supabase
      .from('admins')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    if (existing) {
      console.log(`Admin account with email "${email}" already exists (ID: ${existing.id}).`);
      process.exit(0);
    }

    console.log('Hashing password with bcrypt...');
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    console.log('Inserting admin record into Supabase...');
    const { data, error: insertError } = await supabase
      .from('admins')
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          role: 'admin',
        },
      ])
      .select('id, name, email, role, created_at')
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log('=============================================');
    console.log(' Admin account successfully created!');
    console.log(` ID:    ${data.id}`);
    console.log(` Name:  ${data.name}`);
    console.log(` Email: ${data.email}`);
    console.log(` Role:  ${data.role}`);
    console.log('=============================================');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  createAdmin();
}

module.exports = { createAdmin };
