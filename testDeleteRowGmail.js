// testDeleteRowGmail.js

const XLSX = require('xlsx');
const fs = require('fs');

// 1. Read the Excel file
const workbook = XLSX.readFile('mail.xlsx');
const sheetName = workbook.SheetNames[0]; // Use the first sheet
const worksheet = workbook.Sheets[sheetName];

// 2. Convert sheet to array of emails
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
const emails = data.flat().filter(email => typeof email === 'string' && email.trim() !== '');

// 3. Filter out @gmail.com addresses
const nonGmailEmails = emails.filter(email => !/@gmail\.com$/i.test(email.trim()));

// 4. Remove duplicates (case-insensitive) and extract domain names
const uniqueEmailsWithDomains = Array.from(
  new Set(nonGmailEmails.map(email => email.trim().toLowerCase()))
).map(email => {
  const [_, domain] = email.split('@');
  // Extract domain name without top-level domain (e.g., 'candidzone' from 'candidzone.net')
  const domainName = domain.split('.')[0];
  return { email, domain: domainName };
});

// 5. Write the result to mail.txt with tabulated format
const header = 'Mail\tCompany\n';
const content = uniqueEmailsWithDomains
  .map(({ email, domain }) => `${email}\t${domain}`)
  .join('\n');
fs.writeFileSync('mail.txt', header + content, 'utf8');

console.log(`Done! Saved ${uniqueEmailsWithDomains.length} unique, non-gmail emails with domains to mail.txt`);