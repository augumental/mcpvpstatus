const SERVER_ADDRESS = "blaysmp.net";
const API_URL = `https://api.mcstatus.io/v2/status/java/${SERVER_ADDRESS}`;
const POLL_INTERVAL_MS = 30_000;
const $ = (selector) => document.querySelector(selector);

const featureData = [
  ["💰", "Economy", "Trade, grind, auction, and build your empire with polished money systems."],
  ["⚔️", "Arena", "Queue into holographic arenas with fair combat presets and seasonal rewards."],
  ["🛡️", "PvP", "Smooth duels, clans, bounties, and anti-cheat backed competitive combat."],
  ["🛒", "Shop", "A sleek player market for resources, cosmetics, boosters, and upgrades."],
  ["🎆", "Events", "Live drops, boss fights, weekend tournaments, and community challenges."],
  ["🕶️", "Black Market", "Rotating rare items, risky deals, and late-night exclusive offers."],
  ["📦", "Crates", "Animated reward crates with keys, ranks, tags, trails, and cosmetics."],
  ["🎥", "Media", "Share screenshots, clips, creator spotlights, and featured builds."],
];

const productData = [
  ["Most Popular", "Nebula Rank", "Premium perks, cosmetics, homes, and chat identity.", "$19.99"],
  ["", "Cyber Keys", "Open futuristic crates loaded with seasonal rewards.", "$4.99"],
  ["", "Royale Pass", "Unlock Royale Games missions and exclusive progression.", "$9.99"],
  ["Limited", "Holo Wings", "Animated Royale cosmetic set with cyan particle trails.", "$7.99"],
];

function renderCards() {
  $("#feature-grid").innerHTML = featureData.map(([icon, title, text]) => `<article class="card"><div class="icon">${icon}</div><h3>${title}</h3><p>${text}</p></article>`).join("");
  $("#product-grid").innerHTML = productData.map(([ribbon, title, text, price]) => `<article class="card product"><div class="product-img"></div>${ribbon ? `<span class="ribbon">${ribbon}</span>` : ""}<h3>${title}</h3><p>${text}</p><strong class="price">${price}</strong><br><button class="btn small primary" type="button">Buy</button></article>`).join("");
}

function copyIp() {
  navigator.clipboard?.writeText(SERVER_ADDRESS).catch(() => {});
  ["#server-address", "#hero-copy", "#final-copy"].forEach((selector) => {
    const el = $(selector);
    if (!el) return;
    const original = el.dataset.original || el.textContent;
    el.dataset.original = original;
    el.textContent = "Copied blaysmp.net";
    setTimeout(() => { el.textContent = original; }, 1300);
  });
}

function formatTime() {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" }).format(new Date());
}

let previousPlayers = null;
async function checkServer() {
  const button = $("#refresh-button");
  button.disabled = true;
  try {
    const started = performance.now();
    const response = await fetch(`${API_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const latency = Math.round(performance.now() - started);
    const data = await response.json();
    const online = Boolean(data.online);
    const players = data.players?.online ?? 0;
    const max = data.players?.max ?? 0;
    const card = $("#status-card");
    card.classList.toggle("online", online);
    card.classList.toggle("offline", !online);
    $("#status-kicker").textContent = online ? "Online indicator: active" : "Offline indicator: standby";
    $("#status-title").textContent = online ? "Server Online" : "Server Offline";
    $("#status-detail").textContent = online ? "BlaySMP is responding to public Minecraft status pings." : "The server did not report online through the status API.";
    $("#players-online").textContent = players;
    $("#players-max").textContent = max || "--";
    $("#stat-online").textContent = players;
    $("#stat-online").dataset.target = players;
    $("#version").textContent = data.version?.name_clean || data.version?.name || data.version || "Unknown";
    $("#latency").textContent = `${latency} ms`;
    $("#uptime").textContent = online ? "99.9%" : "Checking";
    $("#checked-at").textContent = formatTime();
    if (previousPlayers !== null && previousPlayers !== players) {
      $(".player-counter").classList.add("bump");
      setTimeout(() => $(".player-counter").classList.remove("bump"), 520);
    }
    previousPlayers = players;
  } catch (error) {
    $("#status-card").classList.add("offline");
    $("#status-kicker").textContent = "Status relay error";
    $("#status-title").textContent = "Telemetry Lost";
    $("#status-detail").textContent = error.message;
    $("#players-online").textContent = "--";
    $("#players-max").textContent = "--";
    $("#latency").textContent = "-- ms";
    $("#checked-at").textContent = formatTime();
  } finally {
    button.disabled = false;
  }
}

function animateCounters() {
  const counters = document.querySelectorAll(".count");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.dataset.done) return;
      entry.target.dataset.done = "true";
      const target = Number(entry.target.dataset.target || 0);
      const duration = 1200;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        entry.target.textContent = Math.floor(target * progress).toLocaleString();
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.3 });
  counters.forEach((counter) => observer.observe(counter));
}

function revealOnScroll() {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.target.classList.toggle("visible", entry.isIntersecting)), { threshold: 0.14 });
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

function initParticles() {
  const canvas = $("#particle-canvas");
  const ctx = canvas.getContext("2d");
  const particles = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 2 + .5, s: Math.random() * .35 + .12 }));
  const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.y -= p.s / canvas.height;
      if (p.y < -0.02) p.y = 1.02;
      ctx.fillStyle = Math.random() > .5 ? "rgba(52,245,255,.7)" : "rgba(255,36,72,.55)";
      ctx.beginPath(); ctx.arc(p.x * canvas.width, p.y * canvas.height, p.r, 0, Math.PI * 2); ctx.fill();
    });
    requestAnimationFrame(draw);
  };
  resize(); addEventListener("resize", resize); draw();
}

window.addEventListener("pointermove", (event) => {
  document.documentElement.style.setProperty("--x", `${event.clientX}px`);
  document.documentElement.style.setProperty("--y", `${event.clientY}px`);
});

window.addEventListener("load", () => setTimeout(() => $("#loader").classList.add("done"), 900));

document.addEventListener("DOMContentLoaded", () => {
  renderCards(); revealOnScroll(); animateCounters(); initParticles(); checkServer();
  ["#copy-address", "#hero-copy", "#final-copy"].forEach((selector) => $(selector)?.addEventListener("click", copyIp));
  $("#refresh-button")?.addEventListener("click", checkServer);
  setInterval(checkServer, POLL_INTERVAL_MS);
});
