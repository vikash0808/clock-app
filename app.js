// ============================================================
//  CLOCK APP — Full-featured: Clock, Alarm, Stopwatch, Timer, World Clock
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ===== TAB NAVIGATION =====
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabs = document.querySelectorAll('.tab');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      navBtns.forEach(b => b.classList.remove('active'));
      tabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });

  // ===== CLOCK =====
  const hourHand = document.getElementById('hourHand');
  const minuteHand = document.getElementById('minuteHand');
  const secondHand = document.getElementById('secondHand');
  const digitalTime = document.getElementById('digitalTime');
  const dateDisplay = document.getElementById('dateDisplay');
  const markersContainer = document.querySelector('.clock-markers');

  // Create clock markers & numbers
  function createClockFace() {
    for (let i = 0; i < 60; i++) {
      const marker = document.createElement('div');
      marker.classList.add('clock-marker');
      marker.classList.add(i % 5 === 0 ? 'major' : 'minor');
      marker.style.transform = `translateX(-50%) rotate(${i * 6}deg)`;
      markersContainer.appendChild(marker);
    }
    // Numbers
    const nums = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const clockFace = document.querySelector('.clock-face');
    const r = 95;
    nums.forEach((num, idx) => {
      const angle = (idx * 30 - 90) * (Math.PI / 180);
      const x = 130 + r * Math.cos(angle) - 12;
      const y = 130 + r * Math.sin(angle) - 12;
      const el = document.createElement('div');
      el.className = 'clock-number';
      el.textContent = num;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      clockFace.appendChild(el);
    });
  }
  createClockFace();

  function updateClock() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    const ms = now.getMilliseconds();

    const secDeg = (s + ms / 1000) * 6;
    const minDeg = (m + s / 60) * 6;
    const hourDeg = ((h % 12) + m / 60) * 30;

    secondHand.style.transform = `rotate(${secDeg}deg)`;
    minuteHand.style.transform = `rotate(${minDeg}deg)`;
    hourHand.style.transform = `rotate(${hourDeg}deg)`;

    // Digital time
    const h12 = h % 12 || 12;
    const ampm = h < 12 ? 'AM' : 'PM';
    digitalTime.textContent = `${pad(h12)}:${pad(m)}:${pad(s)} ${ampm}`;

    // Date
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    dateDisplay.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

    // Check alarms
    checkAlarms(h, m, s);

    requestAnimationFrame(updateClock);
  }
  updateClock();

  function pad(n) { return String(n).padStart(2, '0'); }

  // ===== ALARM SYSTEM =====
  let alarms = JSON.parse(localStorage.getItem('clockAppAlarms') || '[]');
  let editingAlarmId = null;
  let ringingAlarmId = null;
  let alarmAudioCtx = null;
  let alarmOscillator = null;

  const alarmModal = document.getElementById('alarmModal');
  const alarmList = document.getElementById('alarmList');
  const noAlarms = document.getElementById('noAlarms');
  const addAlarmBtn = document.getElementById('addAlarmBtn');
  const cancelAlarmBtn = document.getElementById('cancelAlarm');
  const saveAlarmBtn = document.getElementById('saveAlarm');
  const alarmModalTitle = document.getElementById('alarmModalTitle');
  const alarmHourInput = document.getElementById('alarmHour');
  const alarmMinuteInput = document.getElementById('alarmMinute');
  const alarmAmPmInput = document.getElementById('alarmAmPm');
  const alarmLabelInput = document.getElementById('alarmLabel');
  const alarmSoundSelect = document.getElementById('alarmSound');
  const dayBtns = document.querySelectorAll('.day-btn');
  const alarmRingOverlay = document.getElementById('alarmRingOverlay');
  const ringAlarmTime = document.getElementById('ringAlarmTime');
  const ringAlarmLabel = document.getElementById('ringAlarmLabel');
  const snoozeBtn = document.getElementById('snoozeBtn');
  const dismissBtn = document.getElementById('dismissBtn');

  addAlarmBtn.addEventListener('click', () => {
    editingAlarmId = null;
    alarmModalTitle.textContent = 'Set Alarm';
    alarmHourInput.value = '07';
    alarmMinuteInput.value = '00';
    alarmAmPmInput.value = 'AM';
    alarmLabelInput.value = '';
    alarmSoundSelect.value = 'classic';
    dayBtns.forEach(b => b.classList.remove('active'));
    alarmModal.classList.add('show');
  });

  cancelAlarmBtn.addEventListener('click', () => alarmModal.classList.remove('show'));

  // Picker arrows
  document.querySelectorAll('.picker-arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      const dir = btn.dataset.dir === 'up' ? 1 : -1;

      if (btn.dataset.target === 'alarmAmPm') {
        target.value = target.value === 'AM' ? 'PM' : 'AM';
      } else if (btn.dataset.target === 'alarmHour') {
        let v = parseInt(target.value) + dir;
        if (v < 1) v = 12; if (v > 12) v = 1;
        target.value = pad(v);
      } else if (btn.dataset.target === 'alarmMinute') {
        let v = parseInt(target.value) + dir;
        if (v < 0) v = 59; if (v > 59) v = 0;
        target.value = pad(v);
      } else if (btn.dataset.target === 'timerHours') {
        let v = parseInt(target.value) + dir;
        if (v < 0) v = 23; if (v > 23) v = 0;
        target.value = pad(v);
      } else if (btn.dataset.target === 'timerMinutes' || btn.dataset.target === 'timerSeconds') {
        let v = parseInt(target.value) + dir;
        if (v < 0) v = 59; if (v > 59) v = 0;
        target.value = pad(v);
      }
    });
  });

  // Day buttons
  dayBtns.forEach(btn => {
    btn.addEventListener('click', () => btn.classList.toggle('active'));
  });

  // Save alarm
  saveAlarmBtn.addEventListener('click', () => {
    const hour = parseInt(alarmHourInput.value);
    const minute = parseInt(alarmMinuteInput.value);
    const ampm = alarmAmPmInput.value;
    const label = alarmLabelInput.value.trim();
    const sound = alarmSoundSelect.value;
    const days = [];
    dayBtns.forEach(b => { if (b.classList.contains('active')) days.push(parseInt(b.dataset.day)); });

    // Convert to 24h for storage
    let h24 = hour;
    if (ampm === 'AM' && hour === 12) h24 = 0;
    else if (ampm === 'PM' && hour !== 12) h24 = hour + 12;

    const alarm = {
      id: editingAlarmId || Date.now(),
      hour: h24,
      minute,
      label,
      sound,
      days,
      active: true,
      lastTriggered: null
    };

    if (editingAlarmId) {
      const idx = alarms.findIndex(a => a.id === editingAlarmId);
      if (idx !== -1) alarms[idx] = alarm;
    } else {
      alarms.push(alarm);
    }

    saveAlarms();
    renderAlarms();
    alarmModal.classList.remove('show');
  });

  function saveAlarms() {
    localStorage.setItem('clockAppAlarms', JSON.stringify(alarms));
  }

  function renderAlarms() {
    // Clear all alarm cards but keep the empty state
    document.querySelectorAll('.alarm-card').forEach(el => el.remove());

    if (alarms.length === 0) {
      noAlarms.style.display = 'flex';
      return;
    }
    noAlarms.style.display = 'none';

    alarms.forEach(alarm => {
      const card = document.createElement('div');
      card.className = `alarm-card ${alarm.active ? 'active' : 'inactive'}`;

      const h12 = alarm.hour % 12 || 12;
      const ampm = alarm.hour < 12 ? 'AM' : 'PM';
      const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

      let daysHTML = '';
      if (alarm.days.length > 0) {
        daysHTML = '<div class="alarm-days">' +
          dayNames.map((d, i) => `<span class="alarm-day ${alarm.days.includes(i) ? 'active' : ''}">${d}</span>`).join('') +
          '</div>';
      }

      card.innerHTML = `
        <div class="alarm-info">
          <div class="alarm-time">${pad(h12)}:${pad(alarm.minute)} <small style="font-size:14px;color:var(--text-dim)">${ampm}</small></div>
          <div class="alarm-meta">
            ${alarm.label ? `<span class="alarm-label">${alarm.label}</span>` : ''}
            ${daysHTML}
            ${alarm.days.length === 0 ? '<span>Once</span>' : ''}
          </div>
        </div>
        <div class="alarm-actions">
          <button class="alarm-delete" title="Delete alarm">✕</button>
          <label class="toggle">
            <input type="checkbox" ${alarm.active ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      `;

      // Toggle
      card.querySelector('.toggle input').addEventListener('change', (e) => {
        alarm.active = e.target.checked;
        card.classList.toggle('active', alarm.active);
        card.classList.toggle('inactive', !alarm.active);
        saveAlarms();
      });

      // Delete
      card.querySelector('.alarm-delete').addEventListener('click', () => {
        alarms = alarms.filter(a => a.id !== alarm.id);
        saveAlarms();
        renderAlarms();
      });

      // Edit on click
      card.querySelector('.alarm-info').addEventListener('click', () => {
        editingAlarmId = alarm.id;
        alarmModalTitle.textContent = 'Edit Alarm';
        const h = alarm.hour % 12 || 12;
        alarmHourInput.value = pad(h);
        alarmMinuteInput.value = pad(alarm.minute);
        alarmAmPmInput.value = alarm.hour < 12 ? 'AM' : 'PM';
        alarmLabelInput.value = alarm.label;
        alarmSoundSelect.value = alarm.sound;
        dayBtns.forEach(b => {
          b.classList.toggle('active', alarm.days.includes(parseInt(b.dataset.day)));
        });
        alarmModal.classList.add('show');
      });

      alarmList.appendChild(card);
    });
  }
  renderAlarms();

  // Check alarms
  function checkAlarms(h, m, s) {
    if (s !== 0) return; // only check on exact second
    const now = new Date();
    const dayOfWeek = now.getDay();

    alarms.forEach(alarm => {
      if (!alarm.active) return;
      if (alarm.hour !== h || alarm.minute !== m) return;

      // Check day
      if (alarm.days.length > 0 && !alarm.days.includes(dayOfWeek)) return;

      // Prevent re-triggering within same minute
      const triggerKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${h}-${m}`;
      if (alarm.lastTriggered === triggerKey) return;
      alarm.lastTriggered = triggerKey;
      saveAlarms();

      triggerAlarm(alarm);
    });
  }

  function triggerAlarm(alarm) {
    ringingAlarmId = alarm.id;
    const h12 = alarm.hour % 12 || 12;
    const ampm = alarm.hour < 12 ? 'AM' : 'PM';
    ringAlarmTime.textContent = `${pad(h12)}:${pad(alarm.minute)} ${ampm}`;
    ringAlarmLabel.textContent = alarm.label || 'Alarm';
    alarmRingOverlay.classList.add('show');
    playAlarmSound(alarm.sound);

    // If one-time alarm, disable it
    if (alarm.days.length === 0) {
      alarm.active = false;
      saveAlarms();
      renderAlarms();
    }
  }

  function playAlarmSound(type) {
    try {
      alarmAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      playBeepPattern(type);
    } catch (e) {}
  }

  function playBeepPattern(type) {
    if (!alarmAudioCtx || !alarmRingOverlay.classList.contains('show')) return;

    const patterns = {
      classic: { freq: [800, 1000], interval: 300, duration: 150 },
      digital: { freq: [1200, 1400, 1200], interval: 200, duration: 100 },
      gentle: { freq: [400, 500], interval: 600, duration: 300 },
      urgent: { freq: [900, 1100, 900, 1100], interval: 150, duration: 80 }
    };
    const p = patterns[type] || patterns.classic;

    p.freq.forEach((f, i) => {
      const osc = alarmAudioCtx.createOscillator();
      const gain = alarmAudioCtx.createGain();
      osc.connect(gain);
      gain.connect(alarmAudioCtx.destination);
      osc.frequency.value = f;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, alarmAudioCtx.currentTime + i * p.interval / 1000);
      osc.start(alarmAudioCtx.currentTime + i * p.interval / 1000);
      osc.stop(alarmAudioCtx.currentTime + i * p.interval / 1000 + p.duration / 1000);
    });

    setTimeout(() => playBeepPattern(type), p.freq.length * p.interval + 500);
  }

  function stopAlarmSound() {
    if (alarmAudioCtx) {
      alarmAudioCtx.close();
      alarmAudioCtx = null;
    }
  }

  dismissBtn.addEventListener('click', () => {
    alarmRingOverlay.classList.remove('show');
    stopAlarmSound();
    ringingAlarmId = null;
  });

  snoozeBtn.addEventListener('click', () => {
    alarmRingOverlay.classList.remove('show');
    stopAlarmSound();

    // Snooze: create a one-time alarm 5 min from now
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const snoozeAlarm = {
      id: Date.now(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      label: 'Snooze',
      sound: 'classic',
      days: [],
      active: true,
      lastTriggered: null
    };
    alarms.push(snoozeAlarm);
    saveAlarms();
    renderAlarms();
    ringingAlarmId = null;
  });

  // ===== STOPWATCH =====
  let swRunning = false;
  let swStartTime = 0;
  let swElapsed = 0;
  let swAnimFrame = null;
  let laps = [];
  let lapStart = 0;

  const swTimeEl = document.getElementById('swTime');
  const swStartStopBtn = document.getElementById('swStartStop');
  const swResetBtn = document.getElementById('swReset');
  const swLapBtn = document.getElementById('swLap');
  const lapListEl = document.getElementById('lapList');

  swStartStopBtn.addEventListener('click', () => {
    if (!swRunning) {
      swRunning = true;
      swStartTime = performance.now() - swElapsed;
      lapStart = lapStart || swStartTime;
      swStartStopBtn.textContent = 'Stop';
      swStartStopBtn.classList.add('running');
      swResetBtn.disabled = true;
      swLapBtn.disabled = false;
      updateStopwatch();
    } else {
      swRunning = false;
      swElapsed = performance.now() - swStartTime;
      cancelAnimationFrame(swAnimFrame);
      swStartStopBtn.textContent = 'Start';
      swStartStopBtn.classList.remove('running');
      swResetBtn.disabled = false;
      swLapBtn.disabled = true;
    }
  });

  swResetBtn.addEventListener('click', () => {
    swRunning = false;
    swElapsed = 0;
    swStartTime = 0;
    lapStart = 0;
    laps = [];
    cancelAnimationFrame(swAnimFrame);
    swTimeEl.textContent = '00:00.00';
    swStartStopBtn.textContent = 'Start';
    swStartStopBtn.classList.remove('running');
    swResetBtn.disabled = true;
    swLapBtn.disabled = true;
    lapListEl.innerHTML = '';
  });

  swLapBtn.addEventListener('click', () => {
    if (!swRunning) return;
    const now = performance.now();
    const totalMs = now - swStartTime;
    const lapMs = now - lapStart;
    lapStart = now;
    laps.unshift({ total: totalMs, diff: lapMs });
    renderLaps();
  });

  function updateStopwatch() {
    if (!swRunning) return;
    const elapsed = performance.now() - swStartTime;
    swTimeEl.textContent = formatSW(elapsed);
    swAnimFrame = requestAnimationFrame(updateStopwatch);
  }

  function formatSW(ms) {
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const centis = Math.floor((ms % 1000) / 10);
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const m = mins % 60;
      return `${pad(hrs)}:${pad(m)}:${pad(secs)}.${pad(centis)}`;
    }
    return `${pad(mins)}:${pad(secs)}.${pad(centis)}`;
  }

  function renderLaps() {
    if (laps.length < 2) {
      lapListEl.innerHTML = laps.map((lap, i) => `
        <div class="lap-item">
          <span class="lap-num">Lap ${laps.length - i}</span>
          <span class="lap-diff">${formatSW(lap.diff)}</span>
          <span class="lap-time">${formatSW(lap.total)}</span>
        </div>
      `).join('');
      return;
    }

    const diffs = laps.map(l => l.diff);
    const best = Math.min(...diffs);
    const worst = Math.max(...diffs);

    lapListEl.innerHTML = laps.map((lap, i) => {
      let cls = '';
      if (lap.diff === best) cls = 'best';
      else if (lap.diff === worst) cls = 'worst';
      return `
        <div class="lap-item ${cls}">
          <span class="lap-num">Lap ${laps.length - i}</span>
          <span class="lap-diff">${formatSW(lap.diff)}</span>
          <span class="lap-time">${formatSW(lap.total)}</span>
        </div>
      `;
    }).join('');
  }

  // ===== TIMER =====
  let timerTotal = 0;
  let timerRemaining = 0;
  let timerRunning = false;
  let timerInterval = null;
  let timerAudioCtx = null;

  const timerSetup = document.getElementById('timerSetup');
  const timerRunningEl = document.getElementById('timerRunning');
  const timerDone = document.getElementById('timerDone');
  const timerHoursInput = document.getElementById('timerHours');
  const timerMinutesInput = document.getElementById('timerMinutes');
  const timerSecondsInput = document.getElementById('timerSeconds');
  const startTimerBtn = document.getElementById('startTimerBtn');
  const timerDisplay = document.getElementById('timerDisplay');
  const timerProgress = document.getElementById('timerProgress');
  const timerCancelBtn = document.getElementById('timerCancel');
  const timerPauseResumeBtn = document.getElementById('timerPauseResume');
  const timerDismissBtn = document.getElementById('timerDismiss');

  // Presets
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const secs = parseInt(btn.dataset.seconds);
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      timerHoursInput.value = pad(h);
      timerMinutesInput.value = pad(m);
      timerSecondsInput.value = pad(s);
    });
  });

  startTimerBtn.addEventListener('click', () => {
    const h = parseInt(timerHoursInput.value) || 0;
    const m = parseInt(timerMinutesInput.value) || 0;
    const s = parseInt(timerSecondsInput.value) || 0;
    timerTotal = h * 3600 + m * 60 + s;
    if (timerTotal <= 0) return;
    timerRemaining = timerTotal;
    timerRunning = true;

    timerSetup.classList.add('hidden');
    timerRunningEl.classList.remove('hidden');
    timerDone.classList.add('hidden');

    timerPauseResumeBtn.textContent = 'Pause';
    timerPauseResumeBtn.classList.remove('running');
    timerPauseResumeBtn.classList.add('start');
    updateTimerDisplay();
    startTimerInterval();
  });

  function startTimerInterval() {
    timerInterval = setInterval(() => {
      if (!timerRunning) return;
      timerRemaining--;
      updateTimerDisplay();
      if (timerRemaining <= 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        timerRunningEl.classList.add('hidden');
        timerDone.classList.remove('hidden');
        playTimerDoneSound();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const h = Math.floor(timerRemaining / 3600);
    const m = Math.floor((timerRemaining % 3600) / 60);
    const s = timerRemaining % 60;

    if (h > 0) {
      timerDisplay.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
    } else {
      timerDisplay.textContent = `${pad(m)}:${pad(s)}`;
    }

    // Update progress ring
    const circumference = 2 * Math.PI * 90; // r=90
    const progress = timerRemaining / timerTotal;
    timerProgress.style.strokeDashoffset = circumference * (1 - progress);
  }

  timerPauseResumeBtn.addEventListener('click', () => {
    if (timerRunning) {
      timerRunning = false;
      clearInterval(timerInterval);
      timerPauseResumeBtn.textContent = 'Resume';
      timerPauseResumeBtn.classList.add('running');
    } else {
      timerRunning = true;
      timerPauseResumeBtn.textContent = 'Pause';
      timerPauseResumeBtn.classList.remove('running');
      startTimerInterval();
    }
  });

  timerCancelBtn.addEventListener('click', () => {
    timerRunning = false;
    clearInterval(timerInterval);
    timerRunningEl.classList.add('hidden');
    timerSetup.classList.remove('hidden');
  });

  timerDismissBtn.addEventListener('click', () => {
    timerDone.classList.add('hidden');
    timerSetup.classList.remove('hidden');
    stopTimerSound();
  });

  function playTimerDoneSound() {
    try {
      timerAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      timerBeep();
    } catch (e) {}
  }

  function timerBeep() {
    if (!timerAudioCtx || timerSetup.classList.contains('hidden') === false) return;
    const freqs = [800, 1000, 800];
    freqs.forEach((f, i) => {
      const osc = timerAudioCtx.createOscillator();
      const gain = timerAudioCtx.createGain();
      osc.connect(gain);
      gain.connect(timerAudioCtx.destination);
      osc.frequency.value = f;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.25, timerAudioCtx.currentTime + i * 0.2);
      osc.start(timerAudioCtx.currentTime + i * 0.2);
      osc.stop(timerAudioCtx.currentTime + i * 0.2 + 0.15);
    });
    setTimeout(timerBeep, 1500);
  }

  function stopTimerSound() {
    if (timerAudioCtx) {
      timerAudioCtx.close();
      timerAudioCtx = null;
    }
  }

  // ===== WORLD CLOCK =====
  const timezones = [
    { city: 'New York', tz: 'America/New_York', country: 'USA' },
    { city: 'Los Angeles', tz: 'America/Los_Angeles', country: 'USA' },
    { city: 'Chicago', tz: 'America/Chicago', country: 'USA' },
    { city: 'London', tz: 'Europe/London', country: 'UK' },
    { city: 'Paris', tz: 'Europe/Paris', country: 'France' },
    { city: 'Berlin', tz: 'Europe/Berlin', country: 'Germany' },
    { city: 'Moscow', tz: 'Europe/Moscow', country: 'Russia' },
    { city: 'Dubai', tz: 'Asia/Dubai', country: 'UAE' },
    { city: 'Mumbai', tz: 'Asia/Kolkata', country: 'India' },
    { city: 'Delhi', tz: 'Asia/Kolkata', country: 'India' },
    { city: 'Kolkata', tz: 'Asia/Kolkata', country: 'India' },
    { city: 'Bangkok', tz: 'Asia/Bangkok', country: 'Thailand' },
    { city: 'Singapore', tz: 'Asia/Singapore', country: 'Singapore' },
    { city: 'Hong Kong', tz: 'Asia/Hong_Kong', country: 'China' },
    { city: 'Shanghai', tz: 'Asia/Shanghai', country: 'China' },
    { city: 'Beijing', tz: 'Asia/Shanghai', country: 'China' },
    { city: 'Tokyo', tz: 'Asia/Tokyo', country: 'Japan' },
    { city: 'Seoul', tz: 'Asia/Seoul', country: 'South Korea' },
    { city: 'Sydney', tz: 'Australia/Sydney', country: 'Australia' },
    { city: 'Auckland', tz: 'Pacific/Auckland', country: 'New Zealand' },
    { city: 'São Paulo', tz: 'America/Sao_Paulo', country: 'Brazil' },
    { city: 'Cairo', tz: 'Africa/Cairo', country: 'Egypt' },
    { city: 'Johannesburg', tz: 'Africa/Johannesburg', country: 'South Africa' },
    { city: 'Istanbul', tz: 'Europe/Istanbul', country: 'Turkey' },
    { city: 'Toronto', tz: 'America/Toronto', country: 'Canada' },
    { city: 'Vancouver', tz: 'America/Vancouver', country: 'Canada' },
    { city: 'Mexico City', tz: 'America/Mexico_City', country: 'Mexico' },
    { city: 'Denver', tz: 'America/Denver', country: 'USA' },
    { city: 'Honolulu', tz: 'Pacific/Honolulu', country: 'USA' },
    { city: 'Anchorage', tz: 'America/Anchorage', country: 'USA' },
    { city: 'Karachi', tz: 'Asia/Karachi', country: 'Pakistan' },
    { city: 'Dhaka', tz: 'Asia/Dhaka', country: 'Bangladesh' },
    { city: 'Jakarta', tz: 'Asia/Jakarta', country: 'Indonesia' },
    { city: 'Taipei', tz: 'Asia/Taipei', country: 'Taiwan' },
    { city: 'Riyadh', tz: 'Asia/Riyadh', country: 'Saudi Arabia' },
    { city: 'Nairobi', tz: 'Africa/Nairobi', country: 'Kenya' },
    { city: 'Lagos', tz: 'Africa/Lagos', country: 'Nigeria' },
    { city: 'Rome', tz: 'Europe/Rome', country: 'Italy' },
    { city: 'Madrid', tz: 'Europe/Madrid', country: 'Spain' },
    { city: 'Amsterdam', tz: 'Europe/Amsterdam', country: 'Netherlands' },
    { city: 'Lisbon', tz: 'Europe/Lisbon', country: 'Portugal' },
    { city: 'Athens', tz: 'Europe/Athens', country: 'Greece' },
    { city: 'Helsinki', tz: 'Europe/Helsinki', country: 'Finland' },
    { city: 'Stockholm', tz: 'Europe/Stockholm', country: 'Sweden' },
    { city: 'Oslo', tz: 'Europe/Oslo', country: 'Norway' },
    { city: 'Warsaw', tz: 'Europe/Warsaw', country: 'Poland' },
    { city: 'Zurich', tz: 'Europe/Zurich', country: 'Switzerland' },
    { city: 'Buenos Aires', tz: 'America/Argentina/Buenos_Aires', country: 'Argentina' },
    { city: 'Lima', tz: 'America/Lima', country: 'Peru' },
    { city: 'Bogota', tz: 'America/Bogota', country: 'Colombia' },
  ];

  let worldClocks = JSON.parse(localStorage.getItem('clockAppWorldClocks') || '[]');
  // Default clocks if empty
  if (worldClocks.length === 0) {
    worldClocks = [
      { city: 'New York', tz: 'America/New_York', country: 'USA' },
      { city: 'London', tz: 'Europe/London', country: 'UK' },
      { city: 'Tokyo', tz: 'Asia/Tokyo', country: 'Japan' },
      { city: 'Sydney', tz: 'Australia/Sydney', country: 'Australia' },
    ];
    localStorage.setItem('clockAppWorldClocks', JSON.stringify(worldClocks));
  }

  const wcList = document.getElementById('wcList');
  const addCityBtn = document.getElementById('addCityBtn');
  const cityModal = document.getElementById('cityModal');
  const cancelCityBtn = document.getElementById('cancelCity');
  const citySearch = document.getElementById('citySearch');
  const cityResults = document.getElementById('cityResults');

  addCityBtn.addEventListener('click', () => {
    citySearch.value = '';
    renderCityResults('');
    cityModal.classList.add('show');
    setTimeout(() => citySearch.focus(), 100);
  });

  cancelCityBtn.addEventListener('click', () => cityModal.classList.remove('show'));

  citySearch.addEventListener('input', () => {
    renderCityResults(citySearch.value.toLowerCase());
  });

  function renderCityResults(query) {
    const addedTzCities = worldClocks.map(w => w.city);
    const filtered = timezones.filter(tz =>
      !addedTzCities.includes(tz.city) &&
      (tz.city.toLowerCase().includes(query) ||
       tz.tz.toLowerCase().includes(query) ||
       tz.country.toLowerCase().includes(query))
    ).slice(0, 10);

    cityResults.innerHTML = filtered.map(tz => `
      <div class="city-result-item" data-city="${tz.city}" data-tz="${tz.tz}" data-country="${tz.country}">
        <span class="city-name">${tz.city}, ${tz.country}</span>
        <span class="city-tz">${tz.tz}</span>
      </div>
    `).join('');

    cityResults.querySelectorAll('.city-result-item').forEach(item => {
      item.addEventListener('click', () => {
        worldClocks.push({
          city: item.dataset.city,
          tz: item.dataset.tz,
          country: item.dataset.country
        });
        localStorage.setItem('clockAppWorldClocks', JSON.stringify(worldClocks));
        renderWorldClocks();
        cityModal.classList.remove('show');
      });
    });
  }

  function renderWorldClocks() {
    wcList.innerHTML = '';
    const localOffset = new Date().getTimezoneOffset();

    worldClocks.forEach((wc, idx) => {
      const now = new Date();
      const options = { timeZone: wc.tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
      const dateOptions = { timeZone: wc.tz, weekday: 'short', month: 'short', day: 'numeric' };

      const timeStr = now.toLocaleTimeString('en-US', options);
      const dateStr = now.toLocaleDateString('en-US', dateOptions);

      // Calculate offset difference
      const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(now.toLocaleString('en-US', { timeZone: wc.tz }));
      const localDate = new Date(now.toLocaleString('en-US'));
      const diffHours = Math.round((tzDate - localDate) / (1000 * 60 * 60));

      let diffStr = '';
      let diffClass = 'same';
      if (diffHours > 0) { diffStr = `+${diffHours}h`; diffClass = 'ahead'; }
      else if (diffHours < 0) { diffStr = `${diffHours}h`; diffClass = 'behind'; }
      else { diffStr = 'Same'; }

      const card = document.createElement('div');
      card.className = 'wc-card';
      card.innerHTML = `
        <div class="wc-info">
          <div class="wc-city">${wc.city}</div>
          <div class="wc-offset">
            <span class="wc-diff ${diffClass}">${diffStr}</span>
          </div>
        </div>
        <div class="wc-right">
          <div>
            <div class="wc-time">${timeStr.replace(/:\d{2}\s/, ' ')}</div>
            <div class="wc-date-sm">${dateStr}</div>
          </div>
          <button class="wc-delete" title="Remove">✕</button>
        </div>
      `;

      card.querySelector('.wc-delete').addEventListener('click', () => {
        worldClocks.splice(idx, 1);
        localStorage.setItem('clockAppWorldClocks', JSON.stringify(worldClocks));
        renderWorldClocks();
      });

      wcList.appendChild(card);
    });
  }

  renderWorldClocks();
  setInterval(renderWorldClocks, 1000);

  // ===== INPUT VALIDATION for picker inputs =====
  document.querySelectorAll('.picker-input:not(.ampm)').forEach(input => {
    input.addEventListener('blur', () => {
      let v = parseInt(input.value) || 0;
      const id = input.id;
      if (id === 'alarmHour') { v = Math.max(1, Math.min(12, v)); }
      else if (id === 'alarmMinute') { v = Math.max(0, Math.min(59, v)); }
      else if (id === 'timerHours') { v = Math.max(0, Math.min(23, v)); }
      else { v = Math.max(0, Math.min(59, v)); }
      input.value = pad(v);
    });

    input.addEventListener('focus', () => input.select());
  });

});
