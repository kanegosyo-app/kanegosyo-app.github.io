<div align="center">

# 📦 KaNegosyo App  
### Offline-First Delivery & Micro-Finance Tracker

![PWA](https://img.shields.io/badge/PWA-Enabled-blue)
![Offline](https://img.shields.io/badge/Offline-100%25-green)
![Storage](https://img.shields.io/badge/Storage-LocalStorage-orange)
![License](https://img.shields.io/badge/Open--Source-Yes-brightgreen)

> A fully offline, client-side delivery tracking and micro-finance management app designed for small negosyo owners.

</div>

---

# 🚀 Overview

**KaNegosyo App** is a powerful offline-first web application built for small business owners who manage:

- 📦 Deliveries  
- 💰 Capital  
- 📊 Cash Flow  
- 📈 Interest-based transactions  
- 🔐 Secure encrypted backups  

No server. No backend. No tracking.  
Everything runs **locally inside your browser**.

---

# 🔒 Offline-First & Network Locked

```js
if (!navigator.onLine) {
  console.log("Offline mode active");
}

window.fetch = function () {
  return Promise.reject(new Error("Network disabled in offline-locked mode"));
};
```

### ✔ What This Means

- Completely blocks network requests.
- Prevents accidental data leaks.
- Works fully without internet.
- All data stored in `localStorage`.

This guarantees **maximum privacy and control**.

---

# 📦 Delivery Management System

## Core Structure

```js
const MAX_DELIVERED = 50;
```

- Keeps only the latest **50 delivered records**
- Automatically removes oldest delivered items

---

## 📅 Automatic Status System

The app auto-classifies items based on date:

| Status        | Condition |
|--------------|-----------|
| `forDelivery` | Date = Today |
| `overdue`     | Date < Today |
| `pending`     | Date > Today |
| `delivered`   | Manually confirmed |

### Function:
```js
autoUpdateStatuses()
```

Runs automatically before rendering.

---

## 🔎 Smart Search

Search works across:

- 👤 Name  
- 📅 Date  
- 📍 Area  

```js
getAllSearchableItems()
```

---

## 🧠 Smart Name & Area Suggestions

- Remembers previous names
- Remembers previous areas
- Auto-suggest dropdown
- Auto-fills description & area

Libraries:
```js
nameLibrary
areaLibrary
```

---

## ✔ Mark as Delivered

```js
confirmDeliver(item)
```

- Shows confirmation modal
- Moves item from `pending` → `delivered`
- Enforces MAX_DELIVERED limit
- Saves automatically

---

# 💰 Capital Management

## Add or Spend Capital

```js
openCapital(title, add)
```

Features:

- Add capital
- Deduct expenses
- Live summary updates
- Persistent storage

---

# 📊 Finance Panel (Micro-Finance System)

A built-in mini finance system inside the app.

---

## 💳 Wallet Balances

Tracks:

- `gcashBal`
- `cohBal` (Cash on Hand)

---

## 📈 Interest System

```js
interestPercent
```

- Configurable interest rate
- Minimum fixed ₱5 interest if amount < ₱500
- Otherwise percentage-based

---

## 🔄 Cash-In / Cash-Out Logic

```js
openCashModal(type)
```

When saving:

- Calculates interest
- Transfers between GCash & COH
- Logs transaction
- Auto-limits history to 100 entries

Transaction object:

```js
{
  type,
  amount,
  interest,
  date
}
```

---

## 📉 Capital vs Profit Tracking

The app separates:

- 💵 Base Capital
- 📈 Profit

```js
baseCapital
```

Calculates:

- Remaining Capital
- Remaining Profit

---

# 🔐 Encrypted Backup & Restore

## Encryption Logic

```js
simpleEncrypt(text, password)
simpleDecrypt(encoded, password)
```

Uses:

- XOR cipher
- Base64 encoding

---

## 🔒 Create Backup

- Encrypts entire `localStorage`
- Generates downloadable `.json` file
- Requires password

File name:
```
KaNegosyo_Backup.json
```

---

## 🔄 Restore Backup

- Requires correct password
- Clears existing storage
- Reloads app
- Handles corrupted file detection

---

# 📲 PWA (Progressive Web App)

## Install Banner System

Handles:

```js
beforeinstallprompt
appinstalled
```

Features:

- Install button
- Dismiss option
- Auto-hide in standalone mode

---

## Service Worker

```js
navigator.serviceWorker.register('./service-worker.js')
```

Enables:

- Offline caching
- Faster loading
- App-like experience

---

# 🎨 UI Features

- Tab navigation (For Delivery, Pending, Overdue, Delivered)
- Expandable item cards
- Sorting by area
- Floating action buttons
- Finance side panel toggle
- Custom confirmation modal
- Guide modal
- Backup modal

---

# 🗂 Data Storage Model

Everything stored in:

```js
localStorage
```

Keys include:

- capital
- pending
- delivered
- nameLibrary
- areaLibrary
- gcashBal
- cohBal
- interestPercent
- transactions
- baseCapital
- sortByArea

No external database required.

---

# ⚡ Performance Design

- Pure Vanilla JavaScript
- No frameworks
- No dependencies
- Lightweight
- Instant load
- Mobile optimized

---

# 🛡 Security Philosophy

- 🚫 No network calls
- 🚫 No analytics
- 🚫 No server storage
- 🔐 Encrypted backup system
- 🔒 Local-only execution

User controls everything.

---

# 📱 Designed For

- Small sari-sari store owners
- Delivery-based businesses
- Micro-lending operators
- Personal finance tracking
- Offline-first users

---

# 🧩 Technical Stack

| Component | Technology |
|-----------|------------|
| Language | Vanilla JavaScript |
| Storage | localStorage |
| Encryption | XOR + Base64 |
| Offline | Service Worker |
| UI | HTML + CSS |
| Platform | PWA |

---

# 🏁 Conclusion

**KaNegosyo App** is more than a delivery tracker.

It is:

- 📦 A logistics manager  
- 💰 A capital tracker  
- 📊 A mini finance system  
- 🔐 A private offline vault  
- 📲 A Progressive Web App  

All in one.

---

<div align="center">

### 💡 Built for real negosyo.  
### 🔒 100% Offline.  
### 🚀 Fully in your control.

</div>
