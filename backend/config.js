const dotenv = require('dotenv');
const path = require('path');

const env = process.env.NODE_ENV || 'development';

// Charger depuis la racine du projet
const rootEnvPath = env === 'production'
  ? path.join(__dirname, '..', '.env.production')
  : path.join(__dirname, '..', '.env');
dotenv.config({ path: rootEnvPath });
function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const config = {
    app_name: process.env['APP_NAME'] || 'ppm-follow',
    port: process.env['PORT'] || 3000,
    // Par défaut: base locale si DB_URI n'est pas fournie
    db_uri: process.env['DB_URI'] || 'mongodb://127.0.0.1:27017/PPMe',
    environment: env,
    
    db_options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
}

module.exports = config