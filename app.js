const MAX_DELIVERED = 50;

let capital = Number(localStorage.getItem('capital') || 0);
let pending = JSON.parse(localStorage.getItem('pending') || '[]');
let delivered = JSON.parse(localStorage.getItem('delivered') || '[]');
let currentTab = 'forDelivery';
let searchQuery = '';
let sortByArea = JSON.parse(localStorage.getItem('sortByArea') || 'false');


const listSection = document.getElementById('listSection');

function saveAll() {
  localStorage.setItem('capital', capital);

  localStorage.setItem('pending', JSON.stringify(pending));
  localStorage.setItem('delivered', JSON.stringify(delivered));
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}
function autoUpdateStatuses() {
  const today = todayStr();

  pending.forEach(item => {
    if (item.status === 'delivered') return;

    if (item.date === today) {
      item.status = 'forDelivery';
    } else if (item.date < today) {
      item.status = 'overdue';
    } else {
      item.status = 'pending';
    }
  });

  saveAll();
}



function getForDelivery() {
  return pending.filter(x => x.status === 'forDelivery');
}

function getOverdue() {
  return pending.filter(x => x.status === 'overdue');
}

function getPendingFuture() {
  return pending.filter(x => x.status === 'pending');
}

function getAllSearchableItems() {
  return pending; 
}



function updateSummary() {
  totalCapital.value = `₱ ${capital.toLocaleString()}`;

  const pendingTotal = pending.reduce((s, x) => s + x.amount, 0);
  totalReceivable.value = `₱ ${pendingTotal.toLocaleString()}`;

  forDeliveryCount.value = getForDelivery().length;
  pendingCount.value = getPendingFuture().length;
  overdueCount.value = getOverdue().length;
  deliveredCount.value = delivered.length;
}

function render() {
  autoUpdateStatuses();
  listSection.innerHTML = '';
  let list = [];

  if (searchQuery) {
  const q = searchQuery.toLowerCase();

  list = getAllSearchableItems().filter(item =>
    item.name.toLowerCase().includes(q) ||
    item.date.includes(q) ||
    (item.area && item.area.toLowerCase().includes(q)) // ✅ AREA SEARCH
  );
} else {
    if (currentTab === 'forDelivery') {
      list = getForDelivery();
    } else if (currentTab === 'pending') {
      list = getPendingFuture();
    } else if (currentTab === 'overdue') {
      list = getOverdue();
    } else if (currentTab === 'delivered') {
      list = delivered;
    }
  }
  
if (!searchQuery) { 
  if (currentTab === 'forDelivery') {
    list.sort((a, b) => a.name.localeCompare(b.name)); 
  } else if (currentTab === 'pending') {
    list.sort((a, b) => new Date(a.date) - new Date(b.date)); 
  } else if (currentTab === 'overdue') {
    list.sort((a, b) => new Date(b.date) - new Date(a.date)); 
  }
}

if (sortByArea) {
  list.sort((a, b) => {
    const areaA = (a.area || '').toLowerCase();
    const areaB = (b.area || '').toLowerCase();

    if (areaA !== areaB) {
      return areaA.localeCompare(areaB);
    }
    return a.name.localeCompare(b.name);
  });
}



  list.forEach(item => {
  const div = document.createElement('div');
  div.className = 'item';

  const header = document.createElement('div');
header.className = 'item-header';

const title = document.createElement('div');
title.className = 'item-title';
title.innerHTML = `
  <span class="arrow">▼</span>
  <span class="item-name">${item.name}</span>
  <span class="item-date">${item.date}</span>
  ${
    sortByArea && item.area
      ? `<div class="item-area">${item.area}</div>`
      : ''
  }
`;

header.appendChild(title);

let btn;
if (currentTab !== 'delivered') { 
  btn = document.createElement('button');
  btn.textContent = '✔';
  btn.className = 'check-btn';
  btn.onclick = (e) => {
    e.stopPropagation(); 
    confirmDeliver(item);
  };
  header.appendChild(btn);
}


const details = document.createElement('div');
details.className = 'item-details';
details.innerHTML = `
  <div><strong>Name:</strong> ${item.name}</div>
  <div><strong>Date:</strong> ${item.date}</div>
  <div><strong>Amount:</strong> ₱${item.amount.toLocaleString()}</div>
  <div><strong>Description:</strong> ${item.desc || '-'}</div>
`;

header.onclick = () => {
  details.classList.toggle('open');
  const arrow = title.querySelector('.arrow');
  arrow.classList.toggle('rotate'); 
};


  div.appendChild(header);
  div.appendChild(details);
  listSection.appendChild(div);
});

  updateSummary();
}


function confirmDeliver(item) {
  showConfirm(
    'Mark this as delivered?',
    () => {
      item.status = 'delivered';
      pending = pending.filter(x => x !== item);
      delivered.push(item);

      if (delivered.length > MAX_DELIVERED) {
        delivered.shift();
      }

      saveAll();
      render();
    }
  );
}



function showConfirm(text, yes) {
  confirmText.textContent = text;
  confirmModal.classList.remove('hidden');

  confirmYes.onclick = () => {
    confirmModal.classList.add('hidden');
    yes();
  };
  confirmNo.onclick = () => confirmModal.classList.add('hidden');
}



document.querySelectorAll('.tab').forEach(t => {
  t.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    currentTab = t.dataset.tab;
    render();
  };
});

floatingAddBtn.onclick = () => {
  entryModal.classList.remove('hidden');
};

cancelEntry.onclick = () => entryModal.classList.add('hidden');

saveEntry.onclick = () => {
  const item = {
    name: entryName.value.trim(),
    date: entryDate.value,
    amount: Number(entryAmount.value || 0),
    desc: entryDesc.value.trim(),
    area: entryArea.value.trim(),
    status: 'pending' 
  };

  if (!item.name || !item.date) return;

  pending.push(item);
  saveAll();
  entryModal.classList.add('hidden');
  render();
};


addCapitalBtn.onclick = () => openCapital('Add Capital', true);
spendBtn.onclick = () => openCapital('Spend Capital', false);

function openCapital(title, add) {
  capitalTitle.textContent = title;
  capitalInput.value = '';
  capitalModal.classList.remove('hidden');

  confirmCapital.onclick = () => {
    const val = Number(capitalInput.value || 0);
    capital += add ? val : -val;
    saveAll();
    capitalModal.classList.add('hidden');
    updateSummary();
  };
}

cancelCapital.onclick = () => capitalModal.classList.add('hidden');


document.querySelectorAll('.tab').forEach(t => {
  if (t.dataset.tab === currentTab) {
    t.classList.add('active');
  } else {
    t.classList.remove('active');
  }
});

autoUpdateStatuses();
render();

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.trim();
  clearSearchBtn.classList.toggle('hidden', !searchQuery);
  render();
});

clearSearchBtn.onclick = () => {
  searchInput.value = '';
  searchQuery = '';
  clearSearchBtn.classList.add('hidden');
  render();
};


floatingSortBtn.onclick = () => {
  sortModal.classList.remove('hidden');
  areaToggle.className = 'toggle ' + (sortByArea ? 'on' : 'off');
};

areaToggle.onclick = () => {
  sortByArea = !sortByArea;
  localStorage.setItem('sortByArea', JSON.stringify(sortByArea));
  areaToggle.className = 'toggle ' + (sortByArea ? 'on' : 'off');
  render();
};

closeSort.onclick = () => {
  sortModal.classList.add('hidden');
};


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js');
  });
}

