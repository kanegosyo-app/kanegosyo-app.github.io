const MAX_DELIVERED = 50;

let capital = Number(localStorage.getItem('capital') || 0);
let pending = JSON.parse(localStorage.getItem('pending') || '[]');
let delivered = JSON.parse(localStorage.getItem('delivered') || '[]');
let currentTab = 'forDelivery';
let nameLibrary = JSON.parse(localStorage.getItem('nameLibrary') || '{}');
let areaLibrary = JSON.parse(localStorage.getItem('areaLibrary') || '[]');
const nameSuggestions = document.getElementById('nameSuggestions');
const clearNameBtn = document.getElementById('clearNameBtn');
let searchQuery = '';
let sortByArea = JSON.parse(localStorage.getItem('sortByArea') || 'false');


const listSection = document.getElementById('listSection');

function saveAll() {
  localStorage.setItem('capital', capital);

  localStorage.setItem('pending', JSON.stringify(pending));
  localStorage.setItem('delivered', JSON.stringify(delivered));
}

function todayStr() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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
  <<div><strong>Description:</strong> ${item.desc ? item.desc.replace(/\n/g, '<br>') : '-'}</div>
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
  entryDate.value = todayStr();
  clearNameBtn.classList.add('hidden');
  entryName.focus();
};

entryName.addEventListener('input', () => {
  clearNameBtn.classList.toggle('hidden', !entryName.value);
  const q = entryName.value.trim().toLowerCase();
  nameSuggestions.innerHTML = '';

  if (!q) {
    nameSuggestions.classList.add('hidden');
    return;
  }

  const matches = Object.values(nameLibrary).filter(x =>
    x.name.toLowerCase().includes(q)
  );

  if (!matches.length) {
    nameSuggestions.classList.add('hidden');
    return;
  }

  matches.forEach(data => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.textContent = data.name;

    div.onclick = () => {
      entryName.value = data.name;
      entryDesc.value = data.desc || '';
      entryArea.value = data.area || '';
      nameSuggestions.classList.add('hidden');
    };

    nameSuggestions.appendChild(div);
  });

  nameSuggestions.classList.remove('hidden');
});

const areaSuggestions = document.getElementById('areaSuggestions');

entryArea.addEventListener('input', () => {
  const q = entryArea.value.trim().toLowerCase();
  areaSuggestions.innerHTML = '';

  if (!q) {
    areaSuggestions.classList.add('hidden');
    return;
  }

  const matches = areaLibrary.filter(a =>
    a.toLowerCase().includes(q)
  );

  if (!matches.length) {
    areaSuggestions.classList.add('hidden');
    return;
  }

  matches.forEach(area => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.textContent = area;

    div.onclick = () => {
      entryArea.value = area;
      areaSuggestions.classList.add('hidden');
    };

    areaSuggestions.appendChild(div);
  });

  areaSuggestions.classList.remove('hidden');
});

entryArea.addEventListener('blur', () => {
  setTimeout(() => areaSuggestions.classList.add('hidden'), 150);
});


entryName.addEventListener('blur', () => {
  setTimeout(() => nameSuggestions.classList.add('hidden'), 150);
});


cancelEntry.onclick = () => entryModal.classList.add('hidden');

saveEntry.onclick = () => {
  const name = entryName.value.trim();
  const date = entryDate.value;

  if (!name || !date) return;

  const item = {
    name,
    date,
    amount: Number(entryAmount.value || 0),
    desc: entryDesc.value.trim(),
    area: entryArea.value.trim(),
    status: 'pending'
  };

  pending = pending.filter(x => x.name.toLowerCase() !== name.toLowerCase());
  pending.push(item);

  nameLibrary[name.toLowerCase()] = {
  name,
  desc: item.desc,
  area: item.area
};

localStorage.setItem('nameLibrary', JSON.stringify(nameLibrary));

const area = item.area.trim();
if (area) {
  const exists = areaLibrary.some(
    a => a.toLowerCase() === area.toLowerCase()
  );

  if (!exists) {
    areaLibrary.push(area);
    localStorage.setItem('areaLibrary', JSON.stringify(areaLibrary));
  }
}

saveAll();

  entryName.value = '';
  entryDate.value = todayStr();
  entryAmount.value = '';
  entryDesc.value = '';
  entryArea.value = '';
  areaSuggestions.classList.add('hidden');
  entryName.focus();
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

clearNameBtn.onclick = () => {
  entryName.value = '';
  nameSuggestions.classList.add('hidden');
  clearNameBtn.classList.add('hidden');
  entryName.focus();
};


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js');
  });
}

