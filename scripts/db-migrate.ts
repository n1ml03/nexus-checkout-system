#!/usr/bin/env bun
/**
 * Database Migration Script
 *
 * This script applies migrations to the PostgreSQL database for the Nexus Checkout System.
 * It reads SQL files from the migrations directory and applies them in order.
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
 * Create migrations table if it doesn't exist
 */
async function createMigrationsTable() {
  try {
    console.log('Creating migrations table if it doesn\'t exist...');

    // Create a temporary file with the CREATE TABLE command
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;
    const tempFile = path.join(__dirname, 'temp_create_migrations.sql');
    fs.writeFileSync(tempFile, createTableSQL);

    // Run the CREATE TABLE command
    const createTableCmd = `PGPASSWORD=${PG_PASSWORD} psql -h ${PG_HOST} -p ${PG_PORT} -U ${PG_USER} -d ${PG_DATABASE} -f ${tempFile}`;
    const { stdout, stderr } = await execAsync(createTableCmd);

    // Remove the temporary file
    fs.unlinkSync(tempFile);

    if (stderr && !stderr.includes('NOTICE') && !stderr.includes('INFO')) {
      console.error('Error creating migrations table:', stderr);
      return false;
    }

    console.log('Migrations table created successfully.');
    return true;
  } catch (error) {
    console.error('Error creating migrations table:', error);
    return false;
  }
}

/**
 * Get applied migrations
 */
async function getAppliedMigrations(): Promise<string[]> {
  try {
    console.log('Getting applied migrations...');

    // Create a temporary file with the SELECT command
    const selectSQL = `SELECT name FROM migrations ORDER BY id;`;
    const tempFile = path.join(__dirname, 'temp_select_migrations.sql');
    fs.writeFileSync(tempFile, selectSQL);

    // Run the SELECT command
    const selectCmd = `PGPASSWORD=${PG_PASSWORD} psql -h ${PG_HOST} -p ${PG_PORT} -U ${PG_USER} -d ${PG_DATABASE} -t -f ${tempFile}`;
    const { stdout, stderr } = await execAsync(selectCmd);

    // Remove the temporary file
    fs.unlinkSync(tempFile);

    if (stderr && !stderr.includes('NOTICE') && !stderr.includes('INFO')) {
      console.error('Error getting applied migrations:', stderr);
      return [];
    }

    // Parse the output
    const appliedMigrations = stdout
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    return appliedMigrations;
  } catch (error) {
    console.error('Error getting applied migrations:', error);
    return [];
  }
}

/**
 * Record a migration as applied
 */
async function recordMigration(migrationName: string) {
  try {
    console.log(`Recording migration: ${migrationName}`);

    // Create a temporary file with the INSERT command
    const insertSQL = `INSERT INTO migrations (name) VALUES ('${migrationName}');`;
    const tempFile = path.join(__dirname, 'temp_insert_migration.sql');
    fs.writeFileSync(tempFile, insertSQL);

    // Run the INSERT command
    const insertCmd = `PGPASSWORD=${PG_PASSWORD} psql -h ${PG_HOST} -p ${PG_PORT} -U ${PG_USER} -d ${PG_DATABASE} -f ${tempFile}`;
    const { stdout, stderr } = await execAsync(insertCmd);

    // Remove the temporary file
    fs.unlinkSync(tempFile);

    if (stderr && !stderr.includes('NOTICE') && !stderr.includes('INFO')) {
      console.error(`Error recording migration ${migrationName}:`, stderr);
      return false;
    }

    console.log(`Migration ${migrationName} recorded successfully.`);
    return true;
  } catch (error) {
    console.error(`Error recording migration ${migrationName}:`, error);
    return false;
  }
}

/**
 * Apply migrations
 */
async function applyMigrations() {
  try {
    console.log('Applying migrations...');

    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations();
    console.log(`Found ${appliedMigrations.length} previously applied migrations.`);

    // Get migration files
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure correct order

    if (migrationFiles.length === 0) {
      console.log('No migration files found.');
      return true;
    }

    console.log(`Found ${migrationFiles.length} migration files.`);

    // Apply each migration that hasn't been applied yet
    for (const file of migrationFiles) {
      if (appliedMigrations.includes(file)) {
        console.log(`Migration ${file} already applied, skipping.`);
        continue;
      }

      console.log(`Applying migration: ${file}`);

      const migrationPath = path.join(migrationsDir, file);
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      // Create a temporary file with the migration SQL
      const tempFile = path.join(__dirname, 'temp_migration.sql');
      fs.writeFileSync(tempFile, migrationSql);

      // Apply the migration
      const applyMigrationCmd = `PGPASSWORD=${PG_PASSWORD} psql -h ${PG_HOST} -p ${PG_PORT} -U ${PG_USER} -d ${PG_DATABASE} -f ${tempFile}`;
      const { stdout, stderr } = await execAsync(applyMigrationCmd);

      // Remove the temporary file
      fs.unlinkSync(tempFile);

      if (stderr && !stderr.includes('NOTICE') && !stderr.includes('INFO')) {
        console.error(`Error applying migration ${file}:`, stderr);
        return false;
      }

      console.log(`Migration ${file} applied successfully.`);

      // Record the migration
      const migrationRecorded = await recordMigration(file);

      if (!migrationRecorded) {
        console.error(`Failed to record migration ${file}.`);
        return false;
      }
    }

    console.log('All migrations applied successfully.');
    return true;
  } catch (error) {
    console.error('Error applying migrations:', error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting database migration...');

  // Create migrations table if it doesn't exist
  const migrationsTableCreated = await createMigrationsTable();

  if (!migrationsTableCreated) {
    console.error('Failed to create migrations table.');
    process.exit(1);
  }

  // Apply migrations
  const migrationsApplied = await applyMigrations();

  if (migrationsApplied) {
    console.log('Database migration completed successfully.');
  } else {
    console.error('Database migration failed.');
    process.exit(1);
  }
}

// Run the main function
main();
