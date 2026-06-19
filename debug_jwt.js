const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// Helper to manually parse .env without quotes confusion
function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      env[match[1]] = value.trim();
    }
  });
  return env;
}

const frontEnv = parseEnv(path.join(__dirname, '..', 'fiscalize-next', '.env'));
const backEnv = parseEnv(path.join(__dirname, '.env'));

console.log('Frontend SECRET_KEY:', frontEnv.SECRET_KEY);
console.log('Backend JWT_SECRET:', backEnv.JWT_SECRET);

const payload = { id: 'test-user-id' };
const token = jwt.sign(payload, frontEnv.SECRET_KEY || 'fallback');
console.log('Signed token successfully!');

try {
  const verified = jwt.verify(token, backEnv.JWT_SECRET || 'fallback');
  console.log('VERIFICATION SUCCESSFUL:', verified);
} catch (e) {
  console.log('VERIFICATION FAILED:', e.message);
}
