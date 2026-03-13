require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const key = process.env.GEMINI_API_KEY;
console.log('Key:', key ? key.substring(0,12)+'...' : 'MISSING');
const genAI = new GoogleGenerativeAI(key || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
model.generateContent({ contents: [{ role: 'user', parts: [{ text: 'hi' }] }] })
  .then(r => { console.log('SUCCESS:', r.response.text()); process.exit(0); })
  .catch(e => { console.error('ERROR:', e.message); process.exit(1); });
