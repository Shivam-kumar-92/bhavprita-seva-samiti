const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DONATIONS_FILE = path.join(DATA_DIR, 'donations.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

// Ensure data directory exists
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read helper
function readJSON(file) {
  ensureDir();
  if (!fs.existsSync(file)) {
    return [];
  }
  try {
    const content = fs.readFileSync(file, 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
    return [];
  }
}

// Write helper
function writeJSON(file, data) {
  ensureDir();
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${file}:`, err.message);
  }
}

// Generate unique fallback ID
function generateId() {
  return 'fb-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// --- Donations ---

function saveFallbackDonation(donation) {
  const donations = readJSON(DONATIONS_FILE);
  const newDonation = {
    _id: generateId(),
    name: donation.name,
    email: donation.email,
    phone: donation.phone || '',
    amount: Number(donation.amount),
    cause: donation.cause || 'Where Most Needed',
    status: donation.status || 'pending',
    createdAt: new Date().toISOString()
  };
  donations.push(newDonation);
  writeJSON(DONATIONS_FILE, donations);
  return newDonation;
}

function getFallbackDonations() {
  return readJSON(DONATIONS_FILE);
}

function updateFallbackDonationStatus(id, status) {
  const donations = readJSON(DONATIONS_FILE);
  const index = donations.findIndex(d => d._id === id);
  if (index !== -1) {
    donations[index].status = status;
    writeJSON(DONATIONS_FILE, donations);
    return donations[index];
  }
  return null;
}

// --- Contacts ---

function saveFallbackContact(contact) {
  const contacts = readJSON(CONTACTS_FILE);
  const newContact = {
    _id: generateId(),
    firstName: contact.firstName,
    lastName: contact.lastName || '',
    email: contact.email,
    subject: contact.subject || 'General Enquiry',
    message: contact.message,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  contacts.push(newContact);
  writeJSON(CONTACTS_FILE, contacts);
  return newContact;
}

function getFallbackContacts() {
  return readJSON(CONTACTS_FILE);
}

function toggleFallbackContactRead(id) {
  const contacts = readJSON(CONTACTS_FILE);
  const index = contacts.findIndex(c => c._id === id);
  if (index !== -1) {
    contacts[index].isRead = !contacts[index].isRead;
    writeJSON(CONTACTS_FILE, contacts);
    return contacts[index];
  }
  return null;
}

function deleteFallbackContact(id) {
  const contacts = readJSON(CONTACTS_FILE);
  const filtered = contacts.filter(c => c._id !== id);
  if (filtered.length !== contacts.length) {
    writeJSON(CONTACTS_FILE, filtered);
    return true;
  }
  return false;
}

module.exports = {
  saveFallbackDonation,
  getFallbackDonations,
  updateFallbackDonationStatus,
  saveFallbackContact,
  getFallbackContacts,
  toggleFallbackContactRead,
  deleteFallbackContact
};
