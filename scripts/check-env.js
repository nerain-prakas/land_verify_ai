#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Verifies all required environment variables are set before deployment
 */

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

function loadEnvFile(filename) {
  const envPath = path.join(process.cwd(), filename);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      }
    });
    return true;
  }
  return false;
}

// Try to load .env.local
const envLoaded = loadEnvFile('.env.local') || loadEnvFile('.env');

const chalk = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

const REQUIRED_VARS = [
  {
    name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    description: 'Clerk authentication (public key)',
    example: 'pk_test_... or pk_live_...',
    critical: true,
  },
  {
    name: 'CLERK_SECRET_KEY',
    description: 'Clerk authentication (secret key)',
    example: 'sk_test_... or sk_live_...',
    critical: true,
  },
  {
    name: 'GOOGLE_GEMINI_API_KEY',
    description: 'Gemini AI API for document/video analysis',
    example: 'AIzaSy...',
    critical: true,
  },
  {
    name: 'DATABASE_URL',
    description: 'PostgreSQL connection (transaction pooler)',
    example: 'postgresql://user:pass@host:6543/db?pgbouncer=true',
    critical: true,
  },
  {
    name: 'DIRECT_URL',
    description: 'PostgreSQL direct connection (for migrations)',
    example: 'postgresql://user:pass@host:5432/db',
    critical: true,
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Supabase project URL',
    example: 'https://xxxxx.supabase.co',
    critical: true,
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous key',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    critical: true,
  },
  {
    name: 'CLERK_WEBHOOK_SECRET',
    description: 'Clerk webhook secret for user sync',
    example: 'whsec_...',
    critical: false,
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase service role key (admin)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    critical: false,
  },
  {
    name: 'NEXT_PUBLIC_MAPTILER_KEY',
    description: 'MapTiler API key (optional satellite view)',
    example: 'xxxxx',
    critical: false,
  },
];

console.log('\n' + chalk.bold(chalk.blue('🔍 Environment Variables Check\n')));

let missingCritical = [];
let missingOptional = [];
let invalidValues = [];
let validCount = 0;

REQUIRED_VARS.forEach((varConfig) => {
  const value = process.env[varConfig.name];
  const isSet = value && value.trim() !== '';
  const isPlaceholder = value && (
    value.includes('your_') || 
    value.includes('xxxxx') ||
    value.includes('placeholder')
  );

  if (!isSet) {
    if (varConfig.critical) {
      missingCritical.push(varConfig);
      console.log(`${chalk.red('❌')} ${chalk.bold(varConfig.name)}`);
    } else {
      missingOptional.push(varConfig);
      console.log(`${chalk.yellow('⚠️ ')} ${chalk.bold(varConfig.name)} ${chalk.yellow('(optional)')}`);
    }
    console.log(`   ${chalk.yellow('→')} ${varConfig.description}`);
    console.log(`   ${chalk.yellow('→')} Example: ${varConfig.example}\n`);
  } else if (isPlaceholder) {
    invalidValues.push(varConfig);
    console.log(`${chalk.yellow('⚠️ ')} ${chalk.bold(varConfig.name)} ${chalk.yellow('(placeholder value)')}`);
    console.log(`   ${chalk.yellow('→')} Replace: "${value.substring(0, 30)}..."`);
    console.log(`   ${chalk.yellow('→')} With actual: ${varConfig.example}\n`);
  } else {
    validCount++;
    const displayValue = value.length > 20 ? value.substring(0, 20) + '...' : value;
    console.log(`${chalk.green('✅')} ${chalk.bold(varConfig.name)}: ${chalk.green(displayValue)}`);
  }
});

// Summary
console.log('\n' + chalk.bold('━'.repeat(60)) + '\n');
console.log(chalk.bold('Summary:'));
console.log(`  ${chalk.green('✅ Valid:')} ${validCount}/${REQUIRED_VARS.length}`);
console.log(`  ${chalk.red('❌ Missing (Critical):')} ${missingCritical.length}`);
console.log(`  ${chalk.yellow('⚠️  Missing (Optional):')} ${missingOptional.length}`);
console.log(`  ${chalk.yellow('⚠️  Invalid/Placeholder:')} ${invalidValues.length}`);

// Recommendations
if (missingCritical.length > 0 || invalidValues.filter(v => v.critical).length > 0) {
  console.log('\n' + chalk.bold(chalk.red('🚨 Action Required:\n')));
  
  if (missingCritical.length > 0) {
    console.log(chalk.red('Critical environment variables are missing!'));
    console.log('1. Create/update your .env.local file:');
    console.log(chalk.blue('   cp .env.example .env.local'));
    console.log('2. Fill in the actual values for:');
    missingCritical.forEach(v => console.log(`   - ${v.name}`));
  }
  
  const criticalInvalid = invalidValues.filter(v => v.critical);
  if (criticalInvalid.length > 0) {
    console.log(chalk.red('\nCritical placeholder values detected!'));
    console.log('Replace these with actual API keys:');
    criticalInvalid.forEach(v => console.log(`   - ${v.name}`));
  }
  
  console.log('\n' + chalk.blue('📖 See DEPLOYMENT_GUIDE.md for instructions on getting API keys\n'));
  process.exit(1);
} else if (missingOptional.length > 0 || invalidValues.length > 0) {
  if (invalidValues.length > 0) {
    console.log('\n' + chalk.yellow('⚠️  Optional placeholder values detected!\n'));
    console.log('Replace these with actual API keys when needed:');
    invalidValues.forEach(v => console.log(`   - ${v.name}`));
  }
  console.log('\n' + chalk.yellow('ℹ️  Optional variables have placeholder values, but app should work.\n'));
  process.exit(0);
} else {
  console.log('\n' + chalk.bold(chalk.green('✅ All environment variables are properly configured!\n')));
  process.exit(0);
}
