#!/usr/bin/env bun
/**
 * Database Optimization Script
 * 
 * This script applies optimization to the PostgreSQL database for the Nexus Checkout System.
 * It adds indexes, materialized views, and functions for better performance.
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
 * Apply optimization SQL
 */
async function applyOptimization() {
  try {
    console.log('Applying database optimizations...');
    
    // Get optimization SQL file
    const optimizationFile = path.join(__dirname, '..', 'migrations', '003_optimize_schema.sql');
    
    if (!fs.existsSync(optimizationFile)) {
      console.error('Optimization SQL file not found.');
      return false;
    }
    
    // Apply optimization SQL
    const applyOptimizationCmd = `PGPASSWORD=${PG_PASSWORD} psql -h ${PG_HOST} -p ${PG_PORT} -U ${PG_USER} -d ${PG_DATABASE} -f ${optimizationFile}`;
    const { stdout, stderr } = await execAsync(applyOptimizationCmd);
    
    if (stderr && !stderr.includes('NOTICE') && !stderr.includes('INFO')) {
      console.error('Error applying optimizations:', stderr);
      return false;
    }
    
    console.log('Database optimizations applied successfully.');
    return true;
  } catch (error) {
    console.error('Error applying optimizations:', error);
    return false;
  }
}

/**
 * Analyze database tables
 */
async function analyzeTables() {
  try {
    console.log('Analyzing database tables...');
    
    // Create a temporary file with the ANALYZE command
    const analyzeSQL = `ANALYZE VERBOSE;`;
    const tempFile = path.join(__dirname, 'temp_analyze.sql');
    fs.writeFileSync(tempFile, analyzeSQL);
    
    // Run the ANALYZE command
    const analyzeCmd = `PGPASSWORD=${PG_PASSWORD} psql -h ${PG_HOST} -p ${PG_PORT} -U ${PG_USER} -d ${PG_DATABASE} -f ${tempFile}`;
    const { stdout, stderr } = await execAsync(analyzeCmd);
    
    // Remove the temporary file
    fs.unlinkSync(tempFile);
    
    if (stderr && !stderr.includes('NOTICE') && !stderr.includes('INFO')) {
      console.error('Error analyzing tables:', stderr);
      return false;
    }
    
    console.log('Database tables analyzed successfully.');
    return true;
  } catch (error) {
    console.error('Error analyzing tables:', error);
    return false;
  }
}

/**
 * Check database performance
 */
async function checkPerformance() {
  try {
    console.log('Checking database performance...');
    
    // Create a temporary file with performance check queries
    const checkSQL = `
      -- Check table sizes
      SELECT 
        relname as "Table",
        pg_size_pretty(pg_total_relation_size(relid)) As "Size",
        pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) as "External Size"
      FROM pg_catalog.pg_statio_user_tables 
      ORDER BY pg_total_relation_size(relid) DESC;
      
      -- Check index usage
      SELECT 
        i.relname as "Table",
        idx.indexrelname as "Index",
        idx_scan as "Index Scans",
        idx_tup_read as "Index Tuples Read",
        idx_tup_fetch as "Index Tuples Fetched"
      FROM pg_stat_user_indexes idx
      JOIN pg_statio_user_indexes i USING (indexrelid)
      ORDER BY idx_scan DESC;
      
      -- Check cache hit ratio
      SELECT 
        sum(heap_blks_read) as heap_read,
        sum(heap_blks_hit) as heap_hit,
        sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
      FROM pg_statio_user_tables;
    `;
    
    const tempFile = path.join(__dirname, 'temp_performance.sql');
    fs.writeFileSync(tempFile, checkSQL);
    
    // Run the performance check queries
    const checkCmd = `PGPASSWORD=${PG_PASSWORD} psql -h ${PG_HOST} -p ${PG_PORT} -U ${PG_USER} -d ${PG_DATABASE} -f ${tempFile}`;
    const { stdout, stderr } = await execAsync(checkCmd);
    
    // Remove the temporary file
    fs.unlinkSync(tempFile);
    
    if (stderr && !stderr.includes('NOTICE') && !stderr.includes('INFO')) {
      console.error('Error checking performance:', stderr);
      return false;
    }
    
    console.log('Performance check results:');
    console.log(stdout);
    
    return true;
  } catch (error) {
    console.error('Error checking performance:', error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting database optimization...');
  
  // Apply optimization SQL
  const optimizationApplied = await applyOptimization();
  
  if (!optimizationApplied) {
    console.error('Failed to apply database optimizations.');
    process.exit(1);
  }
  
  // Analyze tables
  const tablesAnalyzed = await analyzeTables();
  
  if (!tablesAnalyzed) {
    console.error('Failed to analyze database tables.');
    process.exit(1);
  }
  
  // Check performance
  const performanceChecked = await checkPerformance();
  
  if (!performanceChecked) {
    console.error('Failed to check database performance.');
    process.exit(1);
  }
  
  console.log('Database optimization completed successfully.');
}

// Run the main function
main();
