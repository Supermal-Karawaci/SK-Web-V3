// scripts/inject-seo.js
// Run during build to inject SEO settings into index.html

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get project root (scripts is one level down from root)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Load .env file manually (no external dependencies)
function loadEnv() {
  const envPath = resolve(projectRoot, '.env');
  const envLocalPath = resolve(projectRoot, '.env.local');

  const envFile = existsSync(envLocalPath) ? envLocalPath : existsSync(envPath) ? envPath : null;

  if (!envFile) {
    return;
  }
  const content = readFileSync(envFile, 'utf-8');
  // Handle Windows line endings
  for (const line of content.split(/\r?\n/)) {
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) continue;

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    // Remove surrounding quotes
    value = value.replace(/^["']|["']$/g, '');

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('⚠️ Supabase credentials not found, skipping SEO injection');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function injectSEO() {
  console.log('🔍 Fetching site settings from Supabase...');

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['settings_seo', 'settings_general'])
      .eq('is_active', true);

    if (error) {
      console.error('❌ Failed to fetch settings:', error);
      process.exit(0);
    }

    // Parse settings
    let seo = {};
    let general = {};

    for (const row of data || []) {
      if (row.key === 'settings_seo' && row.value) {
        seo = JSON.parse(row.value);
      }
      if (row.key === 'settings_general' && row.value) {
        general = JSON.parse(row.value);
      }
    }

    // Read index.html
    const indexPath = resolve(projectRoot, 'index.html');
    let html = readFileSync(indexPath, 'utf-8');

    // Replace meta tags
    const replacements = [
      // Title
      [/<title>.*?<\/title>/i, `<title>${seo.meta_title || 'Supermal Karawaci'}</title>`],
      // Description
      [/<meta name="description" content=".*?">/i, `<meta name="description" content="${seo.meta_description || ''}">`],
      // Canonical
      [/<link rel="canonical" href=".*?">/i, `<link rel="canonical" href="${seo.canonical_url || 'https://supermalkarawaci.co.id'}">`],
      // OG Title
      [/<meta property="og:title" content=".*?">/i, `<meta property="og:title" content="${seo.og_title || seo.meta_title || 'Supermal Karawaci'}">`],
      // OG Description
      [/<meta property="og:description" content=".*?">/i, `<meta property="og:description" content="${seo.og_description || seo.meta_description || ''}">`],
      // OG Image
      [/<meta property="og:image" content=".*?">/i, `<meta property="og:image" content="${seo.og_image_url || ''}">`],
      // Twitter Title
      [/<meta name="twitter:title" content=".*?">/i, `<meta name="twitter:title" content="${seo.og_title || seo.meta_title || 'Supermal Karawaci'}">`],
      // Twitter Description
      [/<meta name="twitter:description" content=".*?">/i, `<meta name="twitter:description" content="${seo.og_description || seo.meta_description || ''}">`],
      // Twitter Image
      [/<meta name="twitter:image" content=".*?">/i, `<meta name="twitter:image" content="${seo.og_image_url || ''}">`],
      // Favicon (handles various icon formats)
      [/<link rel="icon"[^>]*href="[^"]*"[^>]*>/i, `<link rel="icon" href="${general.favicon_url || '/vite.svg'}">`],
    ];

    for (const [pattern, replacement] of replacements) {
      html = html.replace(pattern, replacement);
    }

    // Write back
    writeFileSync(indexPath, html);
    console.log('✅ SEO settings injected into index.html');
    console.log(`   Title: ${seo.meta_title || '(default)'}`);
    console.log(`   Favicon: ${general.favicon_url || '(default)'}`);

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(0);
  }
}

injectSEO();
