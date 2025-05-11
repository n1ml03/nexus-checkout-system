#!/usr/bin/env bun
/**
 * Database Seed Script
 * 
 * This script seeds the PostgreSQL database with sample data for the Nexus Checkout System.
 * It applies the seed data SQL file.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config();

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL configuration
const PG_HOST = process.env.VITE_PG_HOST || 'localhost';
const PG_PORT = process.env.VITE_PG_PORT || '5432';
const PG_DATABASE = process.env.VITE_PG_DATABASE || 'nexus_checkout';
const PG_USER = process.env.VITE_PG_USER || 'postgres';
const PG_PASSWORD = process.env.VITE_PG_PASSWORD || 'postgres';

// Promisify exec
const execAsync = promisify(exec);

/**
 * Apply seed data
 */
async function applySeedData() {
  try {
    console.log('Applying seed data...');
    
    // Get seed data file
    const seedFile = path.join(__dirname, '..', 'migrations', '002_seed_data.sql');
    
    if (!fs.existsSync(seedFile)) {
      console.error('Seed data file not found.');
      return false;
    }
    
    // Apply seed data
    const applySeedCmd = `PGPASSWORD=${PG_PASSWORD} psql -h ${PG_HOST} -p ${PG_PORT} -U ${PG_USER} -d ${PG_DATABASE} -f ${seedFile}`;
    const { stdout, stderr } = await execAsync(applySeedCmd);
    
    if (stderr && !stderr.includes('NOTICE')) {
      console.error('Error applying seed data:', stderr);
      return false;
    }
    
    console.log('Seed data applied successfully.');
    return true;
  } catch (error) {
    console.error('Error applying seed data:', error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting database seeding...');
  
  // Apply seed data
  const seedDataApplied = await applySeedData();
  
  if (seedDataApplied) {
    console.log('Database seeding completed successfully.');
  } else {
    console.error('Database seeding failed.');
    process.exit(1);
  }
}

// Run the main function
main();
