/* ==========================================================
   ELITES ORGANISATION — Event Management System (front-end demo)
   All data lives in memory for this session (no backend/localStorage).
   Swap the DB.* functions for real fetch() calls to your
   Node/Express + MongoDB API to make this fully functional.
========================================================== */

const DB = {
  events: [],
  tickets: [],
  checkins: [],
  waitlist: [],
  nextEventId: 1,
  nextTicketId: 1001,
};

// Demo attendees used to seed sample bookings (kept separate from event names)
const ATTENDEE_SEED = [
  "Ananya Rao","Vikram Iyer","Priya Menon","Arjun Nair","Sneha Pillai",
  "Rohan Das","Divya Krishnan","Karthik Subramaniam","Meera Bose","Aditya Varma"
];

function seedData(){
  // The 10 event names, each branded as an Elites Organisation show
  const seedEvents = [
    { name:"Kirill Morozov", category:"Concert", date:"2026-08-14", time:"19:00", duration:3, venue:"Elite Grand Hall, Chennai", price:1499, seats:120, desc:"Live performance night headlined by Kirill Morozov." },
    { name:"Landon King", category:"Summit", date:"2026-07-25", time:"10:00", duration:4, venue:"Elite Convention Centre, Chennai", price:999, seats:150, desc:"Keynote summit hosted by Landon King." },
    { name:"Nikolai Sokolov", category:"Gala", date:"2026-09-02", time:"19:30", duration:4, venue:"Elite Ballroom, Chennai", price:2499, seats:80, desc:"An evening gala presented by Nikolai Sokolov." },
    { name:"Brandon King", category:"Networking", date:"2026-07-18", time:"17:00", duration:3, venue:"Elite Rooftop, Chennai", price:499, seats:100, desc:"Networking mixer featuring Brandon King." },
    { name:"Kyle", category:"Concert", date:"2026-08-30", time:"20:00", duration:3, venue:"Elite Arena, Chennai", price:1299, seats:200, desc:"A live show by Kyle." },
    { name:"Rai Sokolov", category:"Hackathon", date:"2026-09-15", time:"09:00", duration:4, venue:"Elite Innovation Center", price:299, seats:150, desc:"Build sprint judged by Rai Sokolov." },
    { name:"Mia Sokolov", category:"Summit", date:"2026-10-05", time:"11:00", duration:4, venue:"Elite Grand Hall, Chennai", price:1199, seats:130, desc:"Leadership summit led by Mia Sokolov." },
    { name:"Dante Russo", category:"Concert", date:"2026-08-22", time:"19:00", duration:3, venue:"Elite Arena, Chennai", price:1599, seats:180, desc:"Live concert featuring Dante Russo." },
    { name:"Josh Chen", category:"Networking", date:"2026-07-28", time:"18:00", duration:3, venue:"Elite Rooftop, Chennai", price:599, seats:90, desc:"Founders' networking evening with Josh Chen." },
    { name:"Shashwat Singhania", category:"Gala", date:"2026-12-06", time:"19:30", duration:4, venue:"Elite Ballroom, Chennai", price:2999, seats:70, desc:"Annual gala hosted by Shashwat Singhania." },
  ];
  seedEvents.forEach(e => createEvent(e));

  // seed a handful of bookings/tickets so the dashboard isn't empty
  const bookings = [
    [0, "Ananya Rao", "ananya@example.com", 2],
    [0, "Vikram Iyer", "vikram@example.com", 1],
    [1, "Priya Menon", "priya@example.com", 1],
    [1, "Arjun Nair", "arjun@example.com", 3],
    [2, "Sneha Pillai", "sneha@example.com", 1],
    [3, "Rohan Das", "rohan@example.com", 2],
    [4, "Divya Krishnan", "divya@example.com", 1],
    [5, "Karthik Subramaniam", "karthik@example.com", 2],
    [6, "Meera Bose", "meera@example.com", 1],
    [7, "Aditya Varma", "aditya@example.com", 1],
  ];
  bookings.forEach(([idx, name, email, qty]) => {
    const ev = DB.events[idx];
    for(let i=0;i<qty;i++) bookTicket(ev.id, name, email);
  });

  // check a couple people in already, for a live-feeling demo
  checkIn(DB.tickets[0].code);
  checkIn(DB.tickets[2].code);
}

/* ---------------- data ops ---------------- */

function createEvent(data){
  const ev = {
    id: DB.nextEventId++,
    name: data.name,
    category: data.category,
    date: data.date,
    time: data.time,
    duration: Number(data.duration) || 3, // hours — event runs 3 or 4 hrs
    venue: data.venue,
    price: Number(data.price),
    seats: Number(data.seats),
    booked: 0,
    desc: data.desc || "",
  };
  DB.events.push(ev);
  return ev;
}

function bookTicket(eventId, name, email){
  const ev = DB.events.find(e => e.id === eventId);
  if(!ev || ev.booked >= ev.seats) return null;
  const ticket = {
    id: DB.nextTicketId,
    code: "EL-" + DB.nextTicketId,
    eventId: ev.id,
    attendee: name,
    email: email,
    price: ev.price,
    status: "valid", // valid | checked-in
    issuedAt: new Date().toISOString(),
  };
  DB.nextTicketId++;
  DB.tickets.push(ticket);
  ev.booked++;
  return ticket;
}

function joinWaitlist(eventId, name, email){
  DB.waitlist.push({ eventId, name, email, joinedAt: new Date() });
}

function checkIn(code){
  const t = DB.tickets.find(t => t.code.toLowerCase() === code.trim().toLowerCase());
  if(!t) return { ok:false, reason:"No ticket found with that code." };
  if(t.status === "checked-in") return { ok:false, reason:"This ticket was already checked in.", ticket:t };
  t.status = "checked-in";
  DB.checkins.push({ ticketCode:t.code, attendee:t.attendee, time:new Date() });
  return { ok:true, ticket:t };
}

/* ---------------- rendering helpers ---------------- */

function fmtMoney(n){ return "₹" + Number(n).toLocaleString("en-IN"); }
function fmtDate(d,t){
  const dt = new Date(d + "T" + (t||"00:00"));
  return dt.toLocaleDateString("en-IN",{ day:"2-digit", month:"short", year:"numeric" }) + " · " + (t||"");
}
function fmtTime12(dateObj){
  return dateObj.toLocaleTimeString("en-IN",{ hour:"2-digit", minute:"2-digit", hour12:true });
}
function fmtTimeRange(d, t, durationHrs){
  const start = new Date(d + "T" + t);
  const end = new Date(start.getTime() + durationHrs*3600000);
  return `${fmtTime12(start)} – ${fmtTime12(end)} (${durationHrs} hrs)`;
}
function fmtEventDateTime(ev){
  const start = new Date(ev.date + "T" + ev.time);
  return start.toLocaleDateString("en-IN",{ day:"2-digit", month:"short", year:"numeric" }) +
    " · " + fmtTimeRange(ev.date, ev.time, ev.duration);
}
function fmtBookedAt(iso){
  const dt = new Date(iso);
  return dt.toLocaleDateString("en-IN",{ day:"2-digit", month:"short", year:"numeric" }) +
    " · " + fmtTime12(dt);
}

function eventCardHTML(ev, opts={}){
  const left = ev.seats - ev.booked;
  const pct = Math.min(100, Math.round((ev.booked/ev.seats)*100));
  const soldOut = left <= 0;
  const almostGone = !soldOut && (left / ev.seats) <= 0.15;
  const fillClass = soldOut ? "full" : almostGone ? "warn" : "";
  const isHot = pct >= 70 && !soldOut;

  return `
    <div class="event-card" data-event-id="${ev.id}" data-event-date="${ev.date}T${ev.time}" ${opts.selectable ? 'data-selectable="1"' : ''}>
      ${isHot ? `<span class="badge-hot">🔥 Selling Fast</span>` : ""}
      <span class="event-cat">${ev.category}</span>
      <p class="event-name">${ev.name}</p>
      <div class="event-meta">
        ${fmtEventDateTime(ev)}<br/>
        ${ev.venue}
      </div>
      <div class="event-price">
        <span>${fmtMoney(ev.price)} / ticket</span>
        <span class="seats-left">${soldOut ? "Sold Out" : left + " left"}</span>
      </div>
      <div class="seat-progress"><div class="seat-progress-fill ${fillClass}" style="width:${pct}%"></div></div>
      <div class="event-card-countdown" data-countdown="${ev.date}T${ev.time}">⏳ <span>—</span></div>
      ${soldOut ? `<span class="badge-waitlist">Join waitlist to be notified</span>` : ""}
    </div>`;
}

function ticketHTML(t){
  const ev = DB.events.find(e => e.id === t.eventId);
  const statusClass = t.status === "checked-in" ? "status-checked" : "status-valid";
  const statusLabel = t.status === "checked-in" ? "Checked In" : "Valid";
  return `
    <div class="ticket">
      <div class="ticket-body">
        <span class="ticket-eyebrow">Elites Organisation</span>
        <p class="ticket-event">${ev ? ev.name : "Unknown Event"}</p>
        <div class="ticket-meta">
          ${ev ? fmtEventDateTime(ev) : ""}<br/>
          ${ev ? ev.venue : ""}
        </div>
        <p class="ticket-attendee">${t.attendee}</p>
        <span class="ticket-status ${statusClass}">${statusLabel}</span>
        <div class="ticket-booked-at">Booked on ${fmtBookedAt(t.issuedAt)}</div>
      </div>
      <div class="ticket-stub-side">
        <div class="qr-box" id="qr-${t.code}"></div>
        <span class="ticket-id">${t.code}</span>
        <button class="ticket-download" data-download="${t.code}">⬇ Save PNG</button>
      </div>
    </div>`;
}

function renderQR(container, text){
  container.innerHTML = "";
  // eslint-disable-next-line no-undef
  new QRCode(container, { text, width:96, height:96, colorDark:"#111", colorLight:"#ffffff" });
}

/* ---------------- toasts ---------------- */

function toast(message, type="info"){
  const stack = document.getElementById("toastStack");
  const el = document.createElement("div");
  el.className = "toast " + type;
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add("hide");
    setTimeout(() => el.remove(), 250);
  }, 3200);
}

/* ---------------- confetti burst ---------------- */

function fireConfetti(){
  const canvas = document.getElementById("confettiCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");
  const colors = ["#C9A227","#E8C466","#3E7C7C","#5FB3B3","#EDEEF0"];
  const pieces = Array.from({length:120}, () => ({
    x: canvas.width/2 + (Math.random()-0.5)*200,
    y: canvas.height*0.35,
    vx: (Math.random()-0.5)*10,
    vy: Math.random()*-8 - 4,
    size: Math.random()*6+4,
    color: colors[Math.floor(Math.random()*colors.length)],
    rot: Math.random()*360,
    vr: (Math.random()-0.5)*10,
  }));
  let frame = 0;
  function tick(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    frame++;
    pieces.forEach(p => {
      p.vy += 0.28; // gravity
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI/180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      ctx.restore();
    });
    if(frame < 110) requestAnimationFrame(tick);
    else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  tick();
}

/* ---------------- live countdowns ---------------- */

function countdownParts(targetISO){
  const diff = new Date(targetISO) - new Date();
  if(diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs };
}

function tickCountdowns(){
  // hero strip: next upcoming event
  const upcoming = DB.events
    .filter(ev => new Date(ev.date + "T" + ev.time) > new Date())
    .sort((a,b) => new Date(a.date+"T"+a.time) - new Date(b.date+"T"+b.time))[0];

  if(upcoming){
    document.getElementById("countdownName").textContent = upcoming.name;
    const p = countdownParts(upcoming.date + "T" + upcoming.time);
    if(p){
      document.getElementById("cd-days").textContent = String(p.days).padStart(2,"0");
      document.getElementById("cd-hours").textContent = String(p.hours).padStart(2,"0");
      document.getElementById("cd-mins").textContent = String(p.mins).padStart(2,"0");
      document.getElementById("cd-secs").textContent = String(p.secs).padStart(2,"0");
    }
  } else {
    document.getElementById("countdownName").textContent = "No upcoming events";
  }

  // small countdown chip on each visible event card
  document.querySelectorAll("[data-countdown]").forEach(el => {
    const p = countdownParts(el.dataset.countdown);
    const span = el.querySelector("span");
    if(!p){ span.textContent = "Happening now / past"; return; }
    span.textContent = p.days > 0 ? `${p.days}d ${p.hours}h left` : `${p.hours}h ${p.mins}m left`;
  });
}

/* ---------------- count-up animation ---------------- */

function countUp(el, to, opts={}){
  const prefix = opts.prefix || "";
  const isPercent = !!opts.percent;
  const from = 0;
  const duration = 700;
  const start = performance.now();
  function frame(now){
    const t = Math.min(1, (now-start)/duration);
    const eased = 1 - Math.pow(1-t, 3);
    const val = Math.round(from + (to-from)*eased);
    el.textContent = prefix + val.toLocaleString("en-IN") + (isPercent ? "%" : "");
    if(t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------------- view renderers ---------------- */

function renderOverview(){
  countUp(document.getElementById("statEvents"), DB.events.length);
  countUp(document.getElementById("statTickets"), DB.tickets.length);
  countUp(document.getElementById("statRevenue"), DB.tickets.reduce((s,t)=>s+t.price,0), {prefix:"₹"});
  countUp(document.getElementById("statCheckins"), DB.tickets.filter(t=>t.status==="checked-in").length);

  const grid = document.getElementById("overviewEventGrid");
  grid.innerHTML = DB.events.slice(0,4).map(ev => eventCardHTML(ev)).join("") ||
    `<p class="empty-note">No events yet.</p>`;

  const latest = DB.tickets[DB.tickets.length-1];
  document.getElementById("heroCode").textContent = latest ? latest.code : "EL-0000";
}

function filterAndSortEvents(list, searchVal, categoryVal, sortVal){
  let out = list.filter(ev => {
    const matchesSearch = !searchVal || ev.name.toLowerCase().includes(searchVal.toLowerCase());
    const matchesCategory = !categoryVal || ev.category === categoryVal;
    return matchesSearch && matchesCategory;
  });
  if(sortVal === "price-asc") out = out.slice().sort((a,b)=>a.price-b.price);
  else if(sortVal === "price-desc") out = out.slice().sort((a,b)=>b.price-a.price);
  else if(sortVal === "popularity") out = out.slice().sort((a,b)=>(b.booked/b.seats)-(a.booked/a.seats));
  else out = out.slice().sort((a,b)=> new Date(a.date+"T"+a.time) - new Date(b.date+"T"+b.time));
  return out;
}

function renderEvents(){
  const grid = document.getElementById("eventsGrid");
  const searchVal = document.getElementById("eventsSearch")?.value || "";
  const categoryVal = document.getElementById("eventsCategoryFilter")?.value || "";
  const sortVal = document.getElementById("eventsSort")?.value || "date";
  const list = filterAndSortEvents(DB.events, searchVal, categoryVal, sortVal);
  grid.innerHTML = list.map(ev => eventCardHTML(ev)).join("") ||
    `<p class="empty-note">No events match your search.</p>`;
  document.getElementById("eventCountNote").textContent = list.length + " of " + DB.events.length + " events";
  tickCountdowns();
}

let selectedEventId = null;

function renderBookEvents(){
  const grid = document.getElementById("bookEventGrid");
  const searchVal = document.getElementById("bookSearch")?.value || "";
  const categoryVal = document.getElementById("bookCategoryFilter")?.value || "";
  const list = filterAndSortEvents(DB.events, searchVal, categoryVal, "date");
  grid.innerHTML = list.map(ev => eventCardHTML(ev, {selectable:true})).join("") ||
    `<p class="empty-note">No events match your search.</p>`;
  [...grid.querySelectorAll(".event-card")].forEach(card => {
    const evId = Number(card.dataset.eventId);
    const ev = DB.events.find(e => e.id === evId);
    card.classList.toggle("selected", evId === selectedEventId);
    card.addEventListener("click", () => {
      if(ev.booked >= ev.seats){
        toast(`"${ev.name}" is sold out. Enter your details and click "Join Waitlist" below.`, "error");
      }
      selectedEventId = evId;
      renderBookEvents();
      updateSelectedEventBox();
    });
  });
  tickCountdowns();
}

function updateSelectedEventBox(){
  const box = document.getElementById("selectedEventBox");
  const ev = DB.events.find(e => e.id === selectedEventId);
  const submitBtn = document.querySelector("#bookingForm button[type=submit]");
  if(!ev){
    box.innerHTML = `<span class="muted">No event selected yet — pick one from the left.</span>`;
    if(submitBtn) submitBtn.textContent = "Pay & Confirm Booking";
  } else {
    const soldOut = ev.booked >= ev.seats;
    box.innerHTML = `<strong>${ev.name}</strong><br/><span class="muted">${fmtEventDateTime(ev)} · ${fmtMoney(ev.price)}/ticket</span>` +
      (soldOut ? `<br/><span class="badge-waitlist">Sold out — you'll join the waitlist</span>` : "");
    if(submitBtn) submitBtn.textContent = soldOut ? "Join Waitlist" : "Pay & Confirm Booking";
  }
  updateBookTotal();
}

function updateBookTotal(){
  const ev = DB.events.find(e => e.id === selectedEventId);
  const qty = Number(document.getElementById("b-qty").value || 1);
  const total = ev ? ev.price * qty : 0;
  document.getElementById("bookTotal").textContent = fmtMoney(total);
}

function renderTickets(){
  const wall = document.getElementById("ticketWall");
  if(DB.tickets.length === 0){
    wall.innerHTML = `<p class="empty-note">No tickets booked yet. Head to <strong>Book a Ticket</strong> to get one.</p>`;
    return;
  }
  wall.innerHTML = DB.tickets.slice().reverse().map(ticketHTML).join("");
  DB.tickets.forEach(t => {
    const box = document.getElementById("qr-" + t.code);
    if(box) renderQR(box, t.code);
  });
}

function renderCheckinList(){
  const list = document.getElementById("checkinList");
  document.getElementById("checkinCountNote").textContent = DB.checkins.length + " checked in";
  if(DB.checkins.length === 0){
    list.innerHTML = `<p class="empty-note">No check-ins yet.</p>`;
    return;
  }
  list.innerHTML = DB.checkins.slice().reverse().map(c => `
    <div class="checkin-row">
      <span class="ci-name">${c.attendee}</span>
      <span class="ci-meta">${c.ticketCode} · ${c.time.toLocaleTimeString("en-IN",{hour:'2-digit',minute:'2-digit'})}</span>
    </div>
  `).join("");
}

let chartRevenue, chartCheckin;

function renderAnalytics(){
  const totalRevenue = DB.tickets.reduce((s,t)=>s+t.price,0);
  const totalTickets = DB.tickets.length;
  const checkedIn = DB.tickets.filter(t=>t.status==="checked-in").length;
  const rate = totalTickets ? Math.round((checkedIn/totalTickets)*100) : 0;
  const avg = totalTickets ? Math.round(totalRevenue/totalTickets) : 0;

  countUp(document.getElementById("anRevenue"), totalRevenue, {prefix:"₹"});
  countUp(document.getElementById("anTickets"), totalTickets);
  countUp(document.getElementById("anRate"), rate, {percent:true});
  countUp(document.getElementById("anAvg"), avg, {prefix:"₹"});

  const labels = DB.events.map(e => e.name);
  const revenueData = DB.events.map(ev =>
    DB.tickets.filter(t=>t.eventId===ev.id).reduce((s,t)=>s+t.price,0)
  );
  const soldData = DB.events.map(ev => DB.tickets.filter(t=>t.eventId===ev.id).length);
  const checkedData = DB.events.map(ev => DB.tickets.filter(t=>t.eventId===ev.id && t.status==="checked-in").length);

  const gold = "#C9A227", teal = "#3E7C7C", grid = "#242C40", textMuted = "#8A93A6";

  if(chartRevenue) chartRevenue.destroy();
  chartRevenue = new Chart(document.getElementById("chartRevenue"), {
    type:"bar",
    data:{ labels, datasets:[{ label:"Revenue (₹)", data:revenueData, backgroundColor:gold, borderRadius:6 }] },
    options:{
      plugins:{ legend:{display:false} },
      scales:{
        x:{ ticks:{ color:textMuted, font:{size:10} }, grid:{ display:false } },
        y:{ ticks:{ color:textMuted }, grid:{ color:grid } }
      }
    }
  });

  if(chartCheckin) chartCheckin.destroy();
  chartCheckin = new Chart(document.getElementById("chartCheckin"), {
    type:"bar",
    data:{
      labels,
      datasets:[
        { label:"Sold", data:soldData, backgroundColor: grid, borderRadius:6 },
        { label:"Checked-in", data:checkedData, backgroundColor: teal, borderRadius:6 },
      ]
    },
    options:{
      plugins:{ legend:{ labels:{ color:textMuted } } },
      scales:{
        x:{ ticks:{ color:textMuted, font:{size:10} }, grid:{ display:false } },
        y:{ ticks:{ color:textMuted }, grid:{ color:grid } }
      }
    }
  });
}

function renderAll(){
  renderOverview();
  renderEvents();
  renderBookEvents();
  updateSelectedEventBox();
  renderTickets();
  renderCheckinList();
  renderAnalytics();
}

/* ---------------- navigation ---------------- */

function goToView(view){
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById("view-" + view).classList.add("active");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  if(view === "analytics") renderAnalytics();
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => goToView(btn.dataset.view));
});
document.querySelectorAll("[data-goto]").forEach(btn => {
  btn.addEventListener("click", () => goToView(btn.dataset.goto));
});

/* ---------------- form handlers ---------------- */

document.getElementById("eventForm").addEventListener("submit", (e) => {
  e.preventDefault();
  createEvent({
    name: document.getElementById("f-name").value,
    date: document.getElementById("f-date").value,
    time: document.getElementById("f-time").value,
    duration: document.getElementById("f-duration").value,
    venue: document.getElementById("f-venue").value,
    category: document.getElementById("f-category").value,
    price: document.getElementById("f-price").value,
    seats: document.getElementById("f-seats").value,
    desc: document.getElementById("f-desc").value,
  });
  e.target.reset();
  document.getElementById("f-seats").value = 100;
  document.getElementById("f-price").value = 499;
  renderAll();
});

document.getElementById("b-qty").addEventListener("input", updateBookTotal);

document.getElementById("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if(!selectedEventId){
    toast("Pick an event first.", "error");
    return;
  }
  const ev = DB.events.find(ev => ev.id === selectedEventId);
  const name = document.getElementById("b-name").value;
  const email = document.getElementById("b-email").value;
  const qty = Number(document.getElementById("b-qty").value);

  if(ev.booked >= ev.seats){
    joinWaitlist(selectedEventId, name, email);
    toast(`You're on the waitlist for "${ev.name}" — we'll email you if a seat frees up.`, "info");
    e.target.reset();
    document.getElementById("b-qty").value = 1;
    selectedEventId = null;
    renderAll();
    return;
  }

  for(let i=0;i<qty;i++) bookTicket(selectedEventId, name, email);

  toast(`Booked ${qty} ticket${qty>1?"s":""} for "${ev.name}"! 🎉`, "success");
  fireConfetti();

  e.target.reset();
  document.getElementById("b-qty").value = 1;
  selectedEventId = null;
  renderAll();
  goToView("tickets");
});

document.getElementById("scanBtn").addEventListener("click", () => {
  const code = document.getElementById("scanCode").value;
  const result = document.getElementById("scanResult");
  if(!code.trim()){ result.innerHTML = `<span class="scan-fail">Enter a ticket code first.</span>`; return; }
  const res = checkIn(code);
  if(res.ok){
    result.innerHTML = `<span class="scan-ok">✔ ${res.ticket.attendee} checked in — ${res.ticket.code}</span>`;
    toast(`${res.ticket.attendee} checked in ✔`, "success");
  } else {
    result.innerHTML = `<span class="scan-fail">✕ ${res.reason}</span>`;
    toast(res.reason, "error");
  }
  document.getElementById("scanCode").value = "";
  renderAll();
});

/* ---------------- search / filter / sort listeners ---------------- */

["eventsSearch","eventsCategoryFilter","eventsSort"].forEach(id => {
  document.getElementById(id).addEventListener("input", renderEvents);
  document.getElementById(id).addEventListener("change", renderEvents);
});
["bookSearch","bookCategoryFilter"].forEach(id => {
  document.getElementById(id).addEventListener("input", renderBookEvents);
  document.getElementById(id).addEventListener("change", renderBookEvents);
});

/* ---------------- ticket download (PNG) ---------------- */

document.getElementById("ticketWall").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-download]");
  if(!btn) return;
  const code = btn.dataset.download;
  const ticketEl = btn.closest(".ticket");
  btn.textContent = "Rendering…";
  html2canvas(ticketEl, { backgroundColor: "#131826", scale: 2 }).then(canvas => {
    const link = document.createElement("a");
    link.download = `${code}-ticket.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    btn.textContent = "⬇ Save PNG";
    toast(`Ticket ${code} saved as image`, "success");
  }).catch(() => {
    btn.textContent = "⬇ Save PNG";
    toast("Couldn't render ticket image — try again.", "error");
  });
});

/* ---------------- init ---------------- */

seedData();
renderAll();
document.getElementById("sessionCode").textContent = "SESSION · EL-" + Math.floor(1000+Math.random()*8999);

tickCountdowns();
setInterval(tickCountdowns, 1000);
