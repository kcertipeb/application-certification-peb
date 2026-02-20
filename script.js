const STORAGE_KEY = 'peb-terrain-mobile-v2';

const state = {
  dossier: { ref: '', address: '', date: '' },
  floors: [],
  activeFloorId: null,
  activeRoomId: null,
};

const el = {
  dossierRef: document.getElementById('dossierRef'),
  dossierAddress: document.getElementById('dossierAddress'),
  dossierDate: document.getElementById('dossierDate'),
  saveAppBtn: document.getElementById('saveAppBtn'),
  addFloorBtn: document.getElementById('addFloorBtn'),
  floorTabs: document.getElementById('floorTabs'),
  addRoomBtn: document.getElementById('addRoomBtn'),
  planCanvas: document.getElementById('planCanvas'),
  activeRoomHint: document.getElementById('activeRoomHint'),
  roomEditor: document.getElementById('roomEditor'),
  roomName: document.getElementById('roomName'),
  roomArea: document.getElementById('roomArea'),
  roomHeight: document.getElementById('roomHeight'),
  roomNotes: document.getElementById('roomNotes'),
  roomPhotos: document.getElementById('roomPhotos'),
  roomPhotoList: document.getElementById('roomPhotoList'),
  objectsEditor: document.getElementById('objectsEditor'),
  objectsHint: document.getElementById('objectsHint'),
  addWindowBtn: document.getElementById('addWindowBtn'),
  addEmitterBtn: document.getElementById('addEmitterBtn'),
  addWallObsBtn: document.getElementById('addWallObsBtn'),
  windowList: document.getElementById('windowList'),
  emitterList: document.getElementById('emitterList'),
  wallObsList: document.getElementById('wallObsList'),
  alerts: document.getElementById('alerts'),
  exportBtn: document.getElementById('exportBtn'),
  importInput: document.getElementById('importInput'),
  loadBtn: document.getElementById('loadBtn'),
  status: document.getElementById('status'),
};

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function setStatus(message) {
  el.status.textContent = message;
  setTimeout(() => {
    if (el.status.textContent === message) {
      el.status.textContent = '';
    }
  }, 2200);
}

function getActiveFloor() {
  return state.floors.find((f) => f.id === state.activeFloorId);
}

function getActiveRoom() {
  const floor = getActiveFloor();
  if (!floor) {
    return null;
  }
  return floor.rooms.find((r) => r.id === state.activeRoomId) || null;
}

function createDefaultFloor(name = 'Rez-de-chaussée') {
  return { id: uid('floor'), name, rooms: [] };
}

function createDefaultRoom(index = 1) {
  const x = 10 + ((index - 1) % 3) * 30;
  const y = 10 + Math.floor((index - 1) / 3) * 28;
  return {
    id: uid('room'),
    name: `Pièce ${index}`,
    area: '',
    height: '',
    notes: '',
    x,
    y,
    w: 26,
    h: 22,
    photos: [],
    windows: [],
    emitters: [],
    wallObservations: [],
  };
}

function ensureBootstrapState() {
  if (state.floors.length === 0) {
    const floor = createDefaultFloor();
    const room = createDefaultRoom(1);
    floor.rooms.push(room);
    state.floors.push(floor);
    state.activeFloorId = floor.id;
    state.activeRoomId = room.id;
  }
}

function renderFloors() {
  el.floorTabs.innerHTML = '';
  state.floors.forEach((floor, i) => {
    const btn = document.createElement('button');
    btn.className = `chip ${floor.id === state.activeFloorId ? 'active' : ''}`;
    btn.textContent = floor.name || `Étage ${i + 1}`;
    btn.addEventListener('click', () => {
      state.activeFloorId = floor.id;
      state.activeRoomId = floor.rooms[0]?.id || null;
      render();
    });
    el.floorTabs.appendChild(btn);
  });
}

function renderPlan() {
  const floor = getActiveFloor();
  el.planCanvas.innerHTML = '';
  if (!floor) {
    return;
  }

  floor.rooms.forEach((room) => {
    const roomRect = document.createElement('button');
    roomRect.className = `room-rect ${room.id === state.activeRoomId ? 'active' : ''}`;
    roomRect.style.left = `${room.x}%`;
    roomRect.style.top = `${room.y}%`;
    roomRect.style.width = `${room.w}%`;
    roomRect.style.height = `${room.h}%`;
    roomRect.textContent = room.name;
    roomRect.addEventListener('click', () => {
      state.activeRoomId = room.id;
      render();
    });
    el.planCanvas.appendChild(roomRect);
  });
}

function renderRoomEditor() {
  const room = getActiveRoom();
  if (!room) {
    el.activeRoomHint.textContent = 'Aucune pièce sélectionnée';
    el.roomEditor.classList.add('hidden');
    el.objectsEditor.classList.add('hidden');
    el.objectsHint.classList.remove('hidden');
    return;
  }

  el.activeRoomHint.textContent = `Édition : ${room.name}`;
  el.roomEditor.classList.remove('hidden');
  el.objectsEditor.classList.remove('hidden');
  el.objectsHint.classList.add('hidden');

  el.roomName.value = room.name;
  el.roomArea.value = room.area;
  el.roomHeight.value = room.height;
  el.roomNotes.value = room.notes;

  el.roomPhotoList.innerHTML = '';
  room.photos.forEach((photo) => {
    const img = document.createElement('img');
    img.src = photo.dataUrl;
    img.alt = 'Photo pièce';
    img.className = 'photo-thumb';
    el.roomPhotoList.appendChild(img);
  });

  renderWindows(room);
  renderEmitters(room);
  renderWallObservations(room);
}

function renderWindows(room) {
  el.windowList.innerHTML = '';
  room.windows.forEach((item) => {
    el.windowList.appendChild(makeWindowCard(room, item));
  });
}

function makeWindowCard(room, item) {
  const card = document.createElement('div');
  card.className = 'item';
  card.innerHTML = `
    <label>Type
      <select data-k="type">
        <option ${item.type === 'fenêtre' ? 'selected' : ''}>fenêtre</option>
        <option ${item.type === 'porte-fenêtre' ? 'selected' : ''}>porte-fenêtre</option>
      </select>
    </label>
    <div class="split">
      <label>Largeur (cm)<input type="number" min="0" data-k="width" value="${item.width}" /></label>
      <label>Hauteur (cm)<input type="number" min="0" data-k="height" value="${item.height}" /></label>
    </div>
    <label>Vitrage observé<input type="text" data-k="glazing" value="${item.glazing}" placeholder="Double / Triple / inconnu" /></label>
    <label>Photo (recommandée obligatoire)
      <input type="file" accept="image/*" capture="environment" data-photo="1" />
    </label>
    <div class="photo-list">${item.photo ? `<img class="photo-thumb" src="${item.photo}" alt="Photo châssis"/>` : ''}</div>
  `;

  card.querySelectorAll('[data-k]').forEach((input) => {
    input.addEventListener('input', (event) => {
      item[event.target.dataset.k] = event.target.value;
      saveLocal();
      renderAlerts();
    });
  });

  card.querySelector('[data-photo]').addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      item.photo = String(reader.result);
      saveLocal();
      render();
    };
    reader.readAsDataURL(file);
  });

  return card;
}

function renderEmitters(room) {
  el.emitterList.innerHTML = '';
  room.emitters.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'item';
    card.innerHTML = `
      <label>Type
        <select data-k="type">
          <option ${item.type === 'radiateur' ? 'selected' : ''}>radiateur</option>
          <option ${item.type === 'plancher chauffant' ? 'selected' : ''}>plancher chauffant</option>
          <option ${item.type === 'convecteur' ? 'selected' : ''}>convecteur</option>
        </select>
      </label>
      <label>Vanne thermostatique
        <select data-k="thermostaticValve">
          <option ${item.thermostaticValve === 'oui' ? 'selected' : ''}>oui</option>
          <option ${item.thermostaticValve === 'non' ? 'selected' : ''}>non</option>
          <option ${item.thermostaticValve === 'inconnue' ? 'selected' : ''}>inconnue</option>
        </select>
      </label>
      <label>Photo
        <input type="file" accept="image/*" capture="environment" data-photo="1" />
      </label>
      <div class="photo-list">${item.photo ? `<img class="photo-thumb" src="${item.photo}" alt="Photo émetteur"/>` : ''}</div>
    `;

    card.querySelectorAll('[data-k]').forEach((input) => {
      input.addEventListener('input', (event) => {
        item[event.target.dataset.k] = event.target.value;
        saveLocal();
      });
    });

    card.querySelector('[data-photo]').addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        item.photo = String(reader.result);
        saveLocal();
        render();
      };
      reader.readAsDataURL(file);
    });

    el.emitterList.appendChild(card);
  });
}

function renderWallObservations(room) {
  el.wallObsList.innerHTML = '';
  room.wallObservations.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'item';
    card.innerHTML = `
      <label>Type de paroi
        <select data-k="type">
          <option ${item.type === 'mur' ? 'selected' : ''}>mur</option>
          <option ${item.type === 'façade' ? 'selected' : ''}>façade</option>
          <option ${item.type === 'plancher' ? 'selected' : ''}>plancher</option>
          <option ${item.type === 'plafond' ? 'selected' : ''}>plafond</option>
        </select>
      </label>
      <label>Épaisseur totale (cm)
        <input type="number" min="0" data-k="thicknessCm" value="${item.thicknessCm}" />
      </label>
      <label>Isolation visible
        <select data-k="visibleInsulation">
          <option ${item.visibleInsulation === 'oui' ? 'selected' : ''}>oui</option>
          <option ${item.visibleInsulation === 'non' ? 'selected' : ''}>non</option>
          <option ${item.visibleInsulation === 'inconnue' ? 'selected' : ''}>inconnue</option>
        </select>
      </label>
      <label>Justification / notes
        <textarea rows="2" data-k="note">${item.note}</textarea>
      </label>
      <label>Photo justificative
        <input type="file" accept="image/*" capture="environment" data-photo="1" />
      </label>
      <div class="photo-list">${item.photo ? `<img class="photo-thumb" src="${item.photo}" alt="Photo paroi"/>` : ''}</div>
    `;

    card.querySelectorAll('[data-k]').forEach((input) => {
      input.addEventListener('input', (event) => {
        item[event.target.dataset.k] = event.target.value;
        saveLocal();
        renderAlerts();
      });
    });

    card.querySelector('[data-photo]').addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        item.photo = String(reader.result);
        saveLocal();
        renderAlerts();
        render();
      };
      reader.readAsDataURL(file);
    });

    el.wallObsList.appendChild(card);
  });
}

function renderAlerts() {
  el.alerts.innerHTML = '';
  const reminders = [];

  state.floors.forEach((floor) => {
    floor.rooms.forEach((room) => {
      room.windows.forEach((w, i) => {
        if (!w.width || !w.height) {
          reminders.push(`${floor.name} · ${room.name} · Châssis ${i + 1} : mesure manquante.`);
        }
        if (!w.photo) {
          reminders.push(`${floor.name} · ${room.name} · Châssis ${i + 1} : preuve photo recommandée.`);
        }
      });
      room.wallObservations.forEach((o, i) => {
        if (!o.thicknessCm) {
          reminders.push(`${floor.name} · ${room.name} · Paroi ${i + 1} : épaisseur non renseignée.`);
        }
        if (o.visibleInsulation === 'oui' && !o.photo && !o.note.trim()) {
          reminders.push(`${floor.name} · ${room.name} · Paroi ${i + 1} : ajouter photo ou justification d'isolation.`);
        }
      });
    });
  });

  if (!reminders.length) {
    const ok = document.createElement('div');
    ok.className = 'muted';
    ok.textContent = 'Aucun rappel critique pour le moment.';
    el.alerts.appendChild(ok);
    return;
  }

  reminders.forEach((text) => {
    const alert = document.createElement('div');
    alert.className = 'alert';
    alert.textContent = text;
    el.alerts.appendChild(alert);
  });
}

function render() {
  renderFloors();
  renderPlan();
  renderRoomEditor();
  renderAlerts();
}

function saveLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadLocal() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    setStatus('Aucune sauvegarde locale.');
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed);
    ensureBootstrapState();
    bindHeaderFields();
    render();
    setStatus('Données locales chargées.');
  } catch {
    setStatus('Sauvegarde locale invalide.');
  }
}

function bindHeaderFields() {
  el.dossierRef.value = state.dossier.ref;
  el.dossierAddress.value = state.dossier.address;
  el.dossierDate.value = state.dossier.date;
}

function boot() {
  ensureBootstrapState();
  bindHeaderFields();
  render();
}

el.addFloorBtn.addEventListener('click', () => {
  const floor = createDefaultFloor(`Étage ${state.floors.length}`);
  state.floors.push(floor);
  state.activeFloorId = floor.id;
  state.activeRoomId = null;
  saveLocal();
  render();
});

el.addRoomBtn.addEventListener('click', () => {
  const floor = getActiveFloor();
  if (!floor) {
    return;
  }
  const room = createDefaultRoom(floor.rooms.length + 1);
  floor.rooms.push(room);
  state.activeRoomId = room.id;
  saveLocal();
  render();
});

el.roomName.addEventListener('input', (event) => {
  const room = getActiveRoom();
  if (!room) {
    return;
  }
  room.name = event.target.value;
  saveLocal();
  render();
});

el.roomArea.addEventListener('input', (event) => {
  const room = getActiveRoom();
  if (!room) {
    return;
  }
  room.area = event.target.value;
  saveLocal();
});

el.roomHeight.addEventListener('input', (event) => {
  const room = getActiveRoom();
  if (!room) {
    return;
  }
  room.height = event.target.value;
  saveLocal();
});

el.roomNotes.addEventListener('input', (event) => {
  const room = getActiveRoom();
  if (!room) {
    return;
  }
  room.notes = event.target.value;
  saveLocal();
});

el.roomPhotos.addEventListener('change', (event) => {
  const room = getActiveRoom();
  const files = [...(event.target.files || [])];
  if (!room || !files.length) {
    return;
  }
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      room.photos.push({ id: uid('photo'), dataUrl: String(reader.result) });
      saveLocal();
      renderRoomEditor();
    };
    reader.readAsDataURL(file);
  });
});

el.addWindowBtn.addEventListener('click', () => {
  const room = getActiveRoom();
  if (!room) {
    return;
  }
  room.windows.push({ id: uid('w'), type: 'fenêtre', width: '', height: '', glazing: '', photo: '' });
  saveLocal();
  render();
});

el.addEmitterBtn.addEventListener('click', () => {
  const room = getActiveRoom();
  if (!room) {
    return;
  }
  room.emitters.push({ id: uid('e'), type: 'radiateur', thermostaticValve: 'inconnue', photo: '' });
  saveLocal();
  render();
});

el.addWallObsBtn.addEventListener('click', () => {
  const room = getActiveRoom();
  if (!room) {
    return;
  }
  room.wallObservations.push({
    id: uid('p'),
    type: 'mur',
    thicknessCm: '',
    visibleInsulation: 'inconnue',
    note: '',
    photo: '',
  });
  saveLocal();
  render();
});

[el.dossierRef, el.dossierAddress, el.dossierDate].forEach((input) => {
  input.addEventListener('input', () => {
    state.dossier.ref = el.dossierRef.value;
    state.dossier.address = el.dossierAddress.value;
    state.dossier.date = el.dossierDate.value;
    saveLocal();
  });
});

el.saveAppBtn.addEventListener('click', () => {
  saveLocal();
  setStatus('Sauvegarde locale effectuée.');
});

el.loadBtn.addEventListener('click', loadLocal);

el.exportBtn.addEventListener('click', () => {
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${state.dossier.ref || 'dossier-peb-terrain'}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  setStatus('Export JSON prêt.');
});

el.importInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }
  try {
    const parsed = JSON.parse(await file.text());
    Object.assign(state, parsed);
    ensureBootstrapState();
    bindHeaderFields();
    saveLocal();
    render();
    setStatus('Import JSON appliqué.');
  } catch {
    setStatus('Import impossible (JSON invalide).');
  }
});

boot();
