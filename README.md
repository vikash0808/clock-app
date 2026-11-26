# ⏰ Clock App

A sleek, responsive, and full-featured web-based Clock application with smooth animations, dark-mode aesthetics, custom sound synthesis, and real-time utilities.

**🌐 Live Demo:** [https://vikash0808.github.io/clock-app/](https://vikash0808.github.io/clock-app/)  
**📦 GitHub Repository:** [https://github.com/vikash0808/clock-app](https://github.com/vikash0808/clock-app)

---

## 📸 Overview & Features

The application bundles five essential timekeeping tools into a clean single-page interface:

| Module | Features & Capabilities |
| :--- | :--- |
| **🕐 Analog & Digital Clock** | Smooth 60fps sweep hands (hour, minute, second), 12-hour AM/PM digital readout, live date display, and dynamically rendered circular face markers. |
| **⏰ Alarms** | Create multiple recurring or one-time alarms, label customization, day-of-week repeat schedule, four synthesized audio tones, snooze (5 minutes), and toggle on/off. |
| **⏱️ Stopwatch** | Sub-millisecond precision timing with `performance.now()`, lap split tracking, and dynamic visual indicators for fastest (green) and slowest (red) laps. |
| **⏳ Timer (Countdown)** | Configurable hours/minutes/seconds input, quick-select presets (1m, 3m, 5m, 10m, 15m, 30m), interactive animated SVG radial countdown ring, pause/resume, and chime on completion. |
| **🌍 World Clock** | Real-time global time tracker supporting 50+ international cities with time zone offset badges (relative to your local time) and automated 1-second refresh. |

---

## 🏗️ Architecture & Technical Highlights

The project is built entirely with vanilla web standards (**HTML5**, **CSS3**, and **JavaScript ES6+**), requiring zero external runtime frameworks, build tools, or heavy dependencies.

```
┌────────────────────────────────────────────────────────┐
│                        index.html                      │
│     (Single-Page Layout, Semantic Tabs & Modals)       │
└────────────────────────────────────────────────────────┘
          │                                  │
          ▼                                  ▼
┌───────────────────────┐          ┌───────────────────────┐
│      styles.css       │          │        app.js         │
│  - CSS Custom Props   │          │  - State Management   │
│  - Flexbox Layout     │          │  - Animation Loops    │
│  - Glassmorphic UI    │          │  - Web Audio API      │
│  - Keyframe Effects   │          │  - LocalStorage Sync  │
└───────────────────────┘          └───────────────────────┘
```

### 1. Mathematical Clock Dial Generation (Trigonometry)
Rather than using static SVGs or images, the 12 numerical dial hour indicators are computed and rendered dynamically into the DOM on initialization using polar-to-Cartesian trigonometry:

$$\text{angle} = (\text{index} \times 30^\circ - 90^\circ) \times \left(\frac{\pi}{180}\right)$$

$$x = \text{centerX} + r \cdot \cos(\text{angle}) - \frac{\text{elementWidth}}{2}$$
$$y = \text{centerY} + r \cdot \sin(\text{angle}) - \frac{\text{elementHeight}}{2}$$

- Subtracting $90^\circ$ accounts for standard trigonometry starting at 3 o'clock, orienting index 0 (12) directly to the top.
- Markers for every minute ($6^\circ$ increments) and 5-minute ticks are created with dynamic CSS rotational transforms.

### 2. High-Precision Timing Loops
- **Clock**: Synchronized via `requestAnimationFrame` for stutter-free needle rotation that incorporates sub-second millisecond fractions.
- **Stopwatch**: Employs `performance.now()` rather than `setInterval` to eliminate browser timer drift caused by thread latency and background tab throttling.
- **Radial Timer Ring**: An SVG `<circle>` whose `stroke-dashoffset` is computed proportionally against its circumference ($2\pi r = 565.48\text{px}$) to render a clean circular countdown indicator.

### 3. Pure Web Audio API Sound Engine
No external audio files or MP3 downloads are needed. Audio alerts for alarms and timer completions are synthesized on the fly using native browser oscillators (`OscillatorNode`) and gain controls (`GainNode`):
- **Classic**: Alternating dual-frequency tone pulses (800Hz / 1000Hz).
- **Digital**: Sharp tri-frequency electronic beeps (1200Hz / 1400Hz).
- **Gentle**: Softer lower-frequency harmonic chime (400Hz / 500Hz).
- **Urgent**: Rapid cadence staccato alerts (900Hz / 1100Hz).

### 4. Client-Side Persistence
User preferences, active alarms, and customized world clocks persist across page refreshes via the browser's `localStorage` API:
- `clockAppAlarms`
- `clockAppWorldClocks`

---

## 📁 Project Structure

```text
clock-app/
├── index.html     # Application markup, tab containers, modals, and SVG icons
├── styles.css     # Dark mode palette, typography, responsive rules, animations
├── app.js         # Core logic, audio synthesis, clock math, and state handling
└── README.md      # Project documentation and architectural overview
```

---

## 🚀 Getting Started Locally

You can run this project locally without any complex installation steps:

### Option 1: Direct File Access
Simply double-click `index.html` in your file explorer to open it directly in any modern browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server
Using Python:
```bash
# Navigate to the folder
cd clock-app

# Run a local web server
python -m http.server 3000
```
Then visit [http://localhost:3000](http://localhost:3000).

Using Node.js:
```bash
npx serve .
```

---

## 🌐 Deployment

This project is deployed to **GitHub Pages**:
- **Branch**: `main`
- **Root Directory**: `/` (Static site hosting)
- **CI/CD**: Automatic deployment triggered upon every push to the `main` branch.

---

## 📄 License
This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).
