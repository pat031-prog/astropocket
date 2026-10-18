(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const stage = $('#stage');
  const position = $('#nova-position');
  const body = $('#nova-body');
  const hit = $('#nova-hit');
  const bubble = $('#speech');
  const output = $('#state-output');
  const input = $('#signal-input');
  const states = {
    idle: ['EN ESPERA', 'Respira, parpadea y registra el entorno.'],
    curious: ['CURIOSO', 'La mirada se adelanta al gesto.'],
    listening: ['ESCUCHANDO', 'Se acerca un poco cuando le prestás atención.'],
    scanning: ['CONCENTRADO', 'El esfuerzo se lee en los ojos y las antenas.'],
    happy: ['CONTENTO', 'Reconoce tu gesto con una respuesta breve.'],
    surprised: ['SORPRENDIDO', 'Se sobresalta y recupera el equilibrio.'],
    dragging: ['EN TUS MANOS', 'La inclinación acompaña el movimiento.'],
    sleeping: ['DORMIDO', 'Respira lento. Un toque alcanza para despertarlo.'],
  };
  let state = 'idle';
  let returnTimer = 0;
  let bubbleTimer = 0;
  let idleTimer = 0;
  let sequence = 0;
  let audio = null;
  let sound = false;
  let drag = null;
  let suppressClick = false;
  const startedAt = performance.now();
  const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

  function log(text) {
    const seconds = Math.floor((performance.now() - startedAt) / 1000);
    const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    const item = document.createElement('li');
    const stamp = document.createElement('time'); stamp.textContent = time;
    item.append(stamp, ` ${text}`);
    $('#event-log').prepend(item);
    while ($('#event-log').children.length > 3) $('#event-log').lastElementChild.remove();
  }
  function say(text, duration = 2400) {
    clearTimeout(bubbleTimer);
    bubble.textContent = text; bubble.classList.remove('quiet');
    bubbleTimer = setTimeout(() => bubble.classList.add('quiet'), duration);
  }
  function setState(next, duration = 0) {
    clearTimeout(returnTimer);
    state = next;
    body.dataset.state = next;
    output.textContent = states[next][0];
    $('#state-description').textContent = states[next][1];
    if (duration) returnTimer = setTimeout(() => setState(document.activeElement === input ? 'listening' : 'idle'), duration);
  }
  function idleSoon() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (state === 'idle' && !document.hidden && document.activeElement !== input) {
        setState('sleeping'); say('Un ratito de silencio…', 2300); log('Se quedó dormido.');
      }
    }, 35000);
  }
  function soundNotes(notes) {
    if (!sound || !audio) return;
    notes.forEach((frequency, index) => {
      const oscillator = audio.createOscillator(); const gain = audio.createGain();
      oscillator.type = 'triangle'; oscillator.frequency.value = frequency;
      const time = audio.currentTime + index * .075;
      gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(.035, time + .006); gain.gain.exponentialRampToValueAtTime(.001, time + .09);
      oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(time); oscillator.stop(time + .1);
    });
  }
  $('#audio').addEventListener('change', async event => {
    sound = event.target.checked;
    if (sound) {
      try { audio ??= new AudioContext(); await audio.resume(); soundNotes([440, 660]); }
      catch { sound = false; event.target.checked = false; }
    }
    $('#audio-label').textContent = sound ? 'ON' : 'OFF';
  });
  function pet() {
    sequence++; idleSoon();
    if (state === 'sleeping') {
      setState('surprised', 700); say('¿Ya salió el Sol?'); soundNotes([330, 440]); log('Un toque lo despierta.'); return;
    }
    setState('happy', 1400); say(['¡Ey! Eso estuvo bien.', 'Antenas contentas.', 'Recibido, piloto.'][Math.floor(Math.random() * 3)]);
    soundNotes([523, 659, 784]); log('Toque → pequeño salto → reposo.');
  }
  function scan() {
    if (state === 'scanning' || state === 'dragging') return;
    idleSoon();
    const token = ++sequence;
    setState('curious'); say('A ver esa señal…', 4000); soundNotes([392, 440]); log('Anticipa la señal.');
    setTimeout(() => {
      if (token !== sequence) return;
      setState('scanning'); say('Un segundo, estoy con esto.', 2500); log('Concentra la atención.');
    }, 260);
    setTimeout(() => {
      if (token !== sequence) return;
      setState('happy', 1600); say('Ahí está. Te estaba escuchando.'); soundNotes([523, 659, 784]); log('Reconoce y vuelve al reposo.');
    }, 1850);
  }
  function surprise() { sequence++; idleSoon(); setState('surprised', 1000); say('¡Eh! ¿Qué fue eso?'); soundNotes([440, 660, 440]); log('Sobresalto y recuperación.'); }
  function sleep() { sequence++; clearTimeout(idleTimer); setState('sleeping'); say('Me quedo por acá… zzz.', 2200); soundNotes([392, 330, 262]); log('Entra en reposo.'); }
  const actions = { pet, scan, surprise, sleep };
  document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => actions[button.dataset.action]()));

  function lookAt(x, y) {
    if (state === 'sleeping' || state === 'dragging' || state === 'scanning') return;
    const rectangle = hit.getBoundingClientRect();
    position.style.setProperty('--look-x', `${clamp((x - rectangle.left - rectangle.width / 2) / 35, -7, 7)}px`);
    position.style.setProperty('--look-y', `${clamp((y - rectangle.top - rectangle.height / 2) / 40, -4, 4)}px`);
  }
  stage.addEventListener('pointermove', event => { if (!drag) lookAt(event.clientX, event.clientY); });
  stage.addEventListener('pointerleave', () => { if (!drag) { position.style.setProperty('--look-x', '0px'); position.style.setProperty('--look-y', '0px'); } });
  document.querySelectorAll('[data-planet]').forEach(planet => {
    const inspect = () => {
      if (state === 'scanning' || state === 'dragging' || state === 'sleeping') return;
      idleSoon(); setState('curious', 1400);
      const rectangle = planet.getBoundingClientRect(); lookAt(rectangle.left + rectangle.width / 2, rectangle.top + rectangle.height / 2);
    };
    planet.addEventListener('pointerenter', inspect); planet.addEventListener('focus', inspect);
    planet.addEventListener('click', () => { sequence++; idleSoon(); setState('curious', 1800); say(`¿Vamos a mirar ${planet.dataset.planet}?`); soundNotes([440, 554]); log(`Mira hacia ${planet.dataset.planet}.`); inspect(); });
  });

  hit.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    sequence++; clearTimeout(idleTimer);
    const rectangle = position.getBoundingClientRect(); const bounds = stage.getBoundingClientRect();
    drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: rectangle.left + rectangle.width / 2 - bounds.left, y: rectangle.top + rectangle.height / 2 - bounds.top, moved: false };
    hit.setPointerCapture(event.pointerId);
  });
  hit.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.startX; const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) > 6) { drag.moved = true; setState('dragging'); say('¡Mis antenas! Con cuidado.'); }
    if (!drag.moved) return;
    const bounds = stage.getBoundingClientRect();
    position.style.left = `${clamp(drag.x + dx, 76, bounds.width - 76)}px`;
    position.style.top = `${clamp(drag.y + dy, 150, bounds.height - 95)}px`;
    position.style.setProperty('--tilt', `${clamp(dx / 10, -17, 17)}deg`);
  });
  function release(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const moved = drag.moved;
    if (hit.hasPointerCapture(event.pointerId)) hit.releasePointerCapture(event.pointerId);
    drag = null; idleSoon();
    if (moved) { suppressClick = true; setState('surprised', 750); position.style.setProperty('--tilt', '0deg'); log('Recupera el equilibrio al soltarlo.'); }
  }
  hit.addEventListener('pointerup', release); hit.addEventListener('pointercancel', release);
  hit.addEventListener('click', () => { if (suppressClick) { suppressClick = false; return; } pet(); });
  window.addEventListener('resize', () => { if (!drag) { position.style.left = '50%'; position.style.top = '48%'; } });

  input.addEventListener('focus', () => { if (state !== 'scanning') { sequence++; idleSoon(); setState('listening'); say('Soy todo oídos. Bueno, antenas.'); log('Se prepara para escuchar.'); } });
  input.addEventListener('input', () => { idleSoon(); if (state !== 'scanning') { setState('listening'); const amount = input.value.length % 5; position.style.setProperty('--look-x', `${amount - 2}px`); } });
  input.addEventListener('blur', () => { if (state === 'listening') setState('idle'); });
  $('#signal-form').addEventListener('submit', event => { event.preventDefault(); if (!input.value.trim()) { surprise(); return; } if (state === 'scanning') return; input.value = ''; input.blur(); scan(); });

  setInterval(() => {
    if (document.hidden || !['idle', 'curious', 'listening'].includes(state)) return;
    body.classList.add('blink'); setTimeout(() => body.classList.remove('blink'), 130);
  }, 4100);
  setInterval(() => {
    if (document.hidden || state !== 'idle' || drag) return;
    position.style.setProperty('--look-x', `${Math.random() > .5 ? 5 : -5}px`);
    setTimeout(() => { if (state === 'idle') position.style.setProperty('--look-x', '0px'); }, 1100);
  }, 9200);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) idleSoon(); });
  setTimeout(() => bubble.classList.add('quiet'), 3500);
  idleSoon();
})();
