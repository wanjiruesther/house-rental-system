/* =========================================================
   HOUSE RENT PORTAL - DATA LAYER
   No backend yet: users are hardcoded (fixed credentials).
   Houses / payments / maintenance / notices are "seeded"
   into localStorage on first run so they behave like a real
   database (persist across pages + reloads) until a real
   backend/DB is wired in.
   ========================================================= */

/* ---------- HARDCODED USERS (not persisted - fixed logins) ---------- */
const SEED_USERS = [
  { id: 1, username: "owner",   password: "1234", role: "owner",
    name: "James Mwangi", phone: "0722 000 000", email: "owner@rentalportal.co.ke" },

  { id: 2, username: "grace",   password: "1234", role: "tenant",
    name: "Grace Wanjiku", phone: "0711 111 111", email: "grace.wanjiku@gmail.com", houseId: "H001",
    idNumber: "29881234", nextOfKin: "John Wanjiku - 0700 111 222" },

  { id: 3, username: "peter",   password: "1234", role: "tenant",
    name: "Peter Otieno", phone: "0722 222 222", email: "peter.otieno@gmail.com", houseId: "H002",
    idNumber: "30112233", nextOfKin: "Mary Otieno - 0700 222 333" },

  { id: 4, username: "amina",   password: "1234", role: "tenant",
    name: "Amina Hassan", phone: "0733 333 333", email: "amina.hassan@gmail.com", houseId: "H003",
    idNumber: "31445566", nextOfKin: "Fatuma Hassan - 0700 333 444" },
];

/* ---------- SEED DATA (copied into localStorage once) ---------- */
const SEED_HOUSES = [
  { id: "H001", unit: "Block A - House 1", address: "Kileleshwa, Nairobi", rent: 15000, bedrooms: 2, tenantId: 2 },
  { id: "H002", unit: "Block A - House 2", address: "Kileleshwa, Nairobi", rent: 12000, bedrooms: 1, tenantId: 3 },
  { id: "H003", unit: "Block B - House 1", address: "Kilimani, Nairobi",  rent: 20000, bedrooms: 3, tenantId: 4 },
];

const SEED_PAYMENTS = [
  { id: 1, tenantId: 2, houseId: "H001", amount: 15000, date: "2026-05-04", month: "May 2026",  method: "M-Pesa", ref: "QGT4K7L2XN", status: "Paid" },
  { id: 2, tenantId: 2, houseId: "H001", amount: 15000, date: "2026-06-05", month: "June 2026", method: "M-Pesa", ref: "QGT8M2P9RT", status: "Paid" },

  { id: 3, tenantId: 3, houseId: "H002", amount: 12000, date: "2026-05-06", month: "May 2026",  method: "M-Pesa", ref: "QFT2J8K1LM", status: "Paid" },
  { id: 4, tenantId: 3, houseId: "H002", amount: 12000, date: "2026-06-10", month: "June 2026", method: "Bank Transfer", ref: "BT-99213",  status: "Paid" },

  { id: 5, tenantId: 4, houseId: "H003", amount: 20000, date: "2026-05-03", month: "May 2026",  method: "M-Pesa", ref: "QHT1L9P3XZ", status: "Paid" },
];

const SEED_MAINTENANCE = [
  { id: 1, tenantId: 2, houseId: "H001", category: "Plumbing", title: "Leaking kitchen tap",
    description: "The kitchen tap has been leaking for 3 days, water is being wasted.",
    date: "2026-07-10", status: "In Progress", priority: "Medium" },

  { id: 2, tenantId: 4, houseId: "H003", category: "Electrical", title: "Sitting room socket not working",
    description: "One of the sockets in the sitting room sparked and stopped working.",
    date: "2026-07-14", status: "Open", priority: "High" },

  { id: 3, tenantId: 3, houseId: "H002", category: "General", title: "Broken window latch",
    description: "The bedroom window latch is broken and doesn't lock properly.",
    date: "2026-06-20", status: "Resolved", priority: "Low" },
];

const SEED_NOTICES = [
  { id: 1, title: "Scheduled Water Interruption", audience: "all",
    message: "Nairobi Water will be carrying out maintenance on Friday from 9am to 4pm. Please store enough water in advance.",
    date: "2026-07-15" },
  { id: 2, title: "Annual Rent Review", audience: "all",
    message: "Kindly note that rent for all units will be reviewed effective 1st September 2026. A formal letter will follow.",
    date: "2026-07-01" },
];

/* ---------- INITIALISE "DB" (localStorage) ---------- */
function initData() {
  if (!localStorage.getItem("houses"))      localStorage.setItem("houses", JSON.stringify(SEED_HOUSES));
  if (!localStorage.getItem("payments"))    localStorage.setItem("payments", JSON.stringify(SEED_PAYMENTS));
  if (!localStorage.getItem("maintenance")) localStorage.setItem("maintenance", JSON.stringify(SEED_MAINTENANCE));
  if (!localStorage.getItem("notices"))     localStorage.setItem("notices", JSON.stringify(SEED_NOTICES));
  if (!localStorage.getItem("extraUsers"))  localStorage.setItem("extraUsers", JSON.stringify([]));
}
initData();

/* ---------- USERS ----------
   SEED_USERS are the fixed demo logins. "extraUsers" holds any tenant
   the owner adds through the UI, persisted in localStorage, and merged
   in transparently everywhere users are looked up. ---------- */
function getExtraUsers() { return JSON.parse(localStorage.getItem("extraUsers") || "[]"); }
function saveExtraUsers(list) { localStorage.setItem("extraUsers", JSON.stringify(list)); }

function getUsers() { return SEED_USERS.concat(getExtraUsers()); }
function getTenants() { return getUsers().filter(u => u.role === "tenant"); }
function getUserById(id) { return getUsers().find(u => u.id === id); }
function findUser(username, password, role) {
  return getUsers().find(u => u.username === username && u.password === password && u.role === role);
}

/* Add a brand-new tenant account (owner-only action) */
function addTenant(tenant) {
  const all = getUsers();
  tenant.id = all.length ? Math.max(...all.map(u => u.id)) + 1 : 1;
  tenant.role = "tenant";
  const extra = getExtraUsers();
  extra.push(tenant);
  saveExtraUsers(extra);
  return tenant;
}

/* Remove a tenant the owner added (seed demo tenants can't be removed) */
function removeTenant(tenantId) {
  const extra = getExtraUsers().filter(u => u.id !== tenantId);
  saveExtraUsers(extra);
  // free up their house
  const houses = getHouses();
  const house = houses.find(h => h.tenantId === tenantId);
  if (house) { house.tenantId = null; saveHouses(houses); }
}
function isRemovableTenant(tenantId) {
  return getExtraUsers().some(u => u.id === tenantId);
}

/* ---------- HOUSES ---------- */
function getHouses() { return JSON.parse(localStorage.getItem("houses") || "[]"); }
function saveHouses(list) { localStorage.setItem("houses", JSON.stringify(list)); }
function getHouseByTenant(tenantId) { return getHouses().find(h => h.tenantId === tenantId); }
function getHouseById(id) { return getHouses().find(h => h.id === id); }
function getVacantHouses() { return getHouses().filter(h => !h.tenantId); }
function addHouse(house) {
  const list = getHouses();
  const nextNum = list.length + 1;
  house.id = "H" + String(nextNum).padStart(3, "0");
  list.push(house);
  saveHouses(list);
  return house;
}

/* ---------- PAYMENTS ---------- */
function getPayments() { return JSON.parse(localStorage.getItem("payments") || "[]"); }
function savePayments(list) { localStorage.setItem("payments", JSON.stringify(list)); }
function getPaymentsByTenant(tenantId) {
  return getPayments().filter(p => p.tenantId === tenantId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}
function addPayment(payment) {
  const list = getPayments();
  payment.id = list.length ? Math.max(...list.map(x => x.id)) + 1 : 1;
  list.push(payment);
  savePayments(list);
  return payment;
}

/* Current-month rent status for a tenant */
function getRentStatus(tenantId) {
  const house = getHouseByTenant(tenantId);
  if (!house) return null;
  const now = new Date();
  const monthLabel = now.toLocaleString("en-KE", { month: "long", year: "numeric" });
  const paidThisMonth = getPaymentsByTenant(tenantId).find(p => p.month === monthLabel && p.status === "Paid");
  const dueDate = new Date(now.getFullYear(), now.getMonth(), 5);
  let status = "Pending";
  if (paidThisMonth) status = "Paid";
  else if (now > dueDate) status = "Overdue";
  return { house, monthLabel, amount: house.rent, status, dueDate };
}

/* ---------- MAINTENANCE / REQUESTS ---------- */
function getMaintenance() { return JSON.parse(localStorage.getItem("maintenance") || "[]"); }
function saveMaintenance(list) { localStorage.setItem("maintenance", JSON.stringify(list)); }
function getMaintenanceByTenant(tenantId) {
  return getMaintenance().filter(m => m.tenantId === tenantId).sort((a, b) => new Date(b.date) - new Date(a.date));
}
function addMaintenance(req) {
  const list = getMaintenance();
  req.id = list.length ? Math.max(...list.map(x => x.id)) + 1 : 1;
  list.push(req);
  saveMaintenance(list);
  return req;
}
function updateMaintenanceStatus(id, status) {
  const list = getMaintenance();
  const item = list.find(x => x.id === id);
  if (item) { item.status = status; saveMaintenance(list); }
}

/* ---------- NOTICES ---------- */
function getNotices() {
  return JSON.parse(localStorage.getItem("notices") || "[]").sort((a, b) => new Date(b.date) - new Date(a.date));
}
function saveNotices(list) { localStorage.setItem("notices", JSON.stringify(list)); }
function addNotice(notice) {
  const list = getNotices();
  notice.id = list.length ? Math.max(...list.map(x => x.id)) + 1 : 1;
  list.push(notice);
  saveNotices(list);
  return notice;
}

/* ---------- HELPERS ---------- */
function formatKES(amount) { return "KES " + Number(amount).toLocaleString("en-KE"); }
function formatDate(d) { return new Date(d).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" }); }
function badgeClassForStatus(status) {
  const map = {
    Paid: "badge-paid", Pending: "badge-pending", Overdue: "badge-overdue",
    Open: "badge-open", "In Progress": "badge-progress", Resolved: "badge-resolved",
  };
  return map[status] || "badge-pending";
}
