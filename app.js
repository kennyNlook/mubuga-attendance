(() => {
const SES = Auth.session();
if (!SES) { location.replace('index.html'); return; }
const isChief = SES.role === 'chief';
const DAYS = ['Mon','Tue','Wed','Thu','Fri'];
const FULLDAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const CYCLE = ['', 'P', 'A', 'L', 'E'];
const LABEL = {P:'Present', A:'Absent', L:'Late', E:'Excused'};
const $ = s => document.querySelector(s);
const el = (t, p = {}, ...kids) => { const e = Object.assign(document.createElement(t), p); kids.flat().forEach(k => e.append(k)); return e; };

// ---------- storage (falls back to memory if blocked) ----------
const mem = {};
const store = {
  get(k){ try { return localStorage.getItem(k); } catch { return mem[k] ?? null; } },
  set(k,v){ try { localStorage.setItem(k,v); } catch { mem[k] = v; } }
};
let roster = JSON.parse(store.get('att.roster') || 'null');
if (!roster) {
  roster = {};
  for (const [c, list] of Object.entries(INITIAL_CLASSES))
    roster[c] = list.map((s, i) => ({ id: c.replace(/\s/g,'') + '-' + (i + 1), n: s.n, s: s.s }));
}
let att = JSON.parse(store.get('att.data') || '{}');   // att[class][weekISO][studentId] = ['P','A','','','']
const saveRoster = () => store.set('att.roster', JSON.stringify(roster));
const saveAtt = () => store.set('att.data', JSON.stringify(att));

// ---------- dates ----------
const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const parse = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); };
const monday = d => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmt = (d, o = {day:'numeric', month:'short'}) => d.toLocaleDateString('en-GB', o);
const dayDates = wk => DAYS.map((_, i) => addDays(parse(wk), i));
const weekRange = wk => { const d = dayDates(wk); return `${fmt(d[0])} – ${fmt(d[4], {day:'numeric', month:'short', year:'numeric'})}`; };

// ---------- state ----------
let cls = isChief ? SES.cls : store.get('att.cls'); if (!roster[cls]) cls = Object.keys(roster)[0];
let wk = iso(monday(new Date()));
let tab = 'register', q = '';

const rec = (c, w, id) => ((att[c] ??= {})[w] ??= {})[id] ?? ['', '', '', '', ''];
const setRec = (c, w, id, i, v) => { const a = [...rec(c, w, id)]; a[i] = v; att[c][w][id] = a; saveAtt(); };
const count = (arr, k) => arr.filter(x => x === k).length;
const termTotal = (c, id, k) => Object.values(att[c] || {}).reduce((n, w) => n + count(w[id] || [], k), 0);

// ---------- header / nav ----------
$('#school').textContent = SCHOOL + ' · 2026–2027';
const sel = $('#classSel');
const fillClasses = () => { sel.replaceChildren(...Object.keys(roster).filter(c => !isChief || c === SES.cls).map(c => el('option', {value:c, textContent:`${c} (${roster[c].length})`, selected:c === cls}))); };
sel.onchange = () => { if (isChief) return; cls = sel.value; store.set('att.cls', cls); render(); };
const shift = n => { wk = iso(addDays(parse(wk), 7 * n)); render(); };
$('#prevWk').onclick = () => shift(-1); $('#nextWk').onclick = () => shift(1);
$('#thisWk').onclick = () => { wk = iso(monday(new Date())); render(); };
$('#datePick').onchange = e => { if (e.target.value) { wk = iso(monday(parse(e.target.value))); render(); } };
document.querySelectorAll('.tabs [data-tab]').forEach(b => { if (isChief && b.dataset.tab !== 'register') b.hidden = true; b.onclick = () => { tab = b.dataset.tab; render(); }; });
$('#search').oninput = e => { q = e.target.value.toLowerCase(); renderRegister(); };

function toast(m){ const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200); }

// ---------- register ----------
const todayIdx = () => (new Date().getDay() + 6) % 7;
const isCurrentWeek = () => wk === iso(monday(new Date()));
// A chief may only fill EMPTY cells, for today or earlier days of the current week.
const chiefCanMark = i => isCurrentWeek() && (todayIdx() > 4 || i <= todayIdx());
const pop = $('#popover');
const closePop = () => { pop.hidden = true; };
document.addEventListener('click', e => { if (!pop.contains(e.target) && !e.target.classList.contains('c')) closePop(); });
function chiefPick(btn, id, i) {
  pop.replaceChildren(el('small', {textContent:'Final once saved – only a teacher can change it'}),
    ...['P', 'A', 'L', 'E'].map(k => { const b = el('button', {className:'c ' + k, textContent:k, title:LABEL[k]});
      b.onclick = ev => { ev.stopPropagation(); if (rec(cls, wk, id)[i]) return closePop(); setRec(cls, wk, id, i, k); closePop(); renderRegister(); }; return b; }));
  const r = btn.getBoundingClientRect();
  pop.hidden = false;
  pop.style.left = Math.max(8, Math.min(r.left - 80, innerWidth - 210)) + 'px';
  pop.style.top = Math.min(r.bottom + 6, innerHeight - 110) + 'px';
}
function cell(id, i, v) {
  const lock = isChief && !!v;
  const off = isChief && !v && !chiefCanMark(i);
  const b = el('button', {className:'c ' + (v || 'U') + (lock ? ' lock' : '') + (off ? ' off' : ''), textContent:v || '–',
    title: lock ? LABEL[v] + ' (locked – ask a teacher to change)' : off ? 'Not open for marking' : v ? LABEL[v] : 'Not marked'});
  b.onclick = e => {
    e.stopPropagation();
    if (isChief) { if (lock) return toast('Locked – ask a teacher to change this mark'); if (off) return toast('You can only mark today (or earlier days this week)'); return chiefPick(b, id, i); }
    const cur = rec(cls, wk, id)[i];
    setRec(cls, wk, id, i, CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length]);
    renderRegister();
  };
  return b;
}
function renderRegister() {
  const list = roster[cls], dates = dayDates(wk);
  const head = el('tr', {}, el('th', {textContent:'No'}), el('th', {className:'nm', textContent:'Student name'}), el('th', {textContent:'Sex'}));
  DAYS.forEach((d, i) => {
    const th = el('th', {className:'day', title:`Mark everyone present on ${FULLDAYS[i]}`}, d, el('small', {textContent:fmt(dates[i])}));
    th.onclick = () => { if (isChief && !chiefCanMark(i)) return toast('You can only mark today (or earlier days this week)'); list.forEach(s => { if (!rec(cls, wk, s.id)[i]) setRec(cls, wk, s.id, i, 'P'); }); renderRegister(); toast(`Unmarked students set present for ${FULLDAYS[i]}`); };
    head.append(th);
  });
  ['Absent', 'Late', 'Excused', 'Term abs.'].forEach(h => head.append(el('th', {textContent:h})));
  const rows = [];
  let tot = {P:0, A:0, L:0, E:0, U:0}, shown = 0;
  list.forEach((s, n) => {
    const r = rec(cls, wk, s.id);
    r.forEach(v => tot[v || 'U']++);
    if (q && !s.n.toLowerCase().includes(q)) return;
    shown++;
    const tr = el('tr', {}, el('td', {textContent:n + 1}), el('td', {className:'nm', textContent:s.n}), el('td', {textContent:s.s}));
    r.forEach((v, i) => tr.append(el('td', {}, cell(s.id, i, v))));
    const a = count(r, 'A');
    tr.append(el('td', {className:'tot' + (a >= 3 ? ' hot' : ''), textContent:a}), el('td', {className:'tot', textContent:count(r, 'L')}),
      el('td', {className:'tot', textContent:count(r, 'E')}), el('td', {className:'tot', textContent:termTotal(cls, s.id, 'A')}));
    rows.push(tr);
  });
  $('#reg').replaceChildren(el('thead', {}, head), el('tbody', {}, rows));
  const marked = tot.P + tot.A + tot.L + tot.E;
  const rate = marked ? Math.round(100 * (tot.P + tot.L) / marked) : 0;
  $('#stats').replaceChildren(...[['Students', list.length], ['Present', tot.P], ['Absent', tot.A], ['Late', tot.L], ['Excused', tot.E], ['Attendance rate', marked ? rate + '%' : '–']]
    .map(([k, v]) => el('div', {className:'stat'}, el('b', {textContent:v}), el('span', {textContent:k}))));
}

// ---------- weekly summary (all classes) ----------
function classStats(c, w) {
  let t = {P:0, A:0, L:0, E:0}, absStu = new Set();
  roster[c].forEach(s => rec(c, w, s.id).forEach(v => { if (v) t[v]++; if (v === 'A') absStu.add(s.id); }));
  const m = t.P + t.A + t.L + t.E;
  return {...t, n:roster[c].length, absStu:absStu.size, rate: m ? Math.round(100 * (t.P + t.L) / m) + '%' : '–'};
}
function renderSummary() {
  const h = el('tr', {}, ...['Class', 'Students', 'Present', 'Absent', 'Late', 'Excused', 'Students absent', 'Attendance rate'].map(x => el('th', {textContent:x})));
  const rows = Object.keys(roster).map(c => {
    const s = classStats(c, wk);
    const tr = el('tr', {className:'click'}, ...[c, s.n, s.P, s.A, s.L, s.E, s.absStu, s.rate].map(x => el('td', {textContent:x})));
    tr.onclick = () => { cls = c; store.set('att.cls', c); tab = 'register'; render(); };
    return tr;
  });
  $('#sum').replaceChildren(el('thead', {}, h), el('tbody', {}, rows));
}

// ---------- manage ----------
function renderManage() {
  $('#mClass').textContent = cls;
  const rows = roster[cls].map((s, i) => {
    const b = el('button', {className:'x', textContent:'×', title:'Remove student'});
    b.onclick = () => { if (confirm(`Remove ${s.n} from ${cls}? Their attendance records will be deleted.`)) {
      roster[cls].splice(i, 1);
      Object.values(att[cls] || {}).forEach(w => delete w[s.id]);
      saveRoster(); saveAtt(); render(); } };
    return el('tr', {}, el('td', {textContent:i + 1}), el('td', {className:'nm', textContent:s.n}), el('td', {textContent:s.s}), el('td', {}, b));
  });
  $('#roster').replaceChildren(el('tbody', {}, rows));
}
$('#addForm').onsubmit = e => {
  e.preventDefault();
  const n = $('#addName').value.replace(/\s+/g, ' ').trim(); if (!n) return;
  roster[cls].push({id:cls.replace(/\s/g,'') + '-' + Date.now(), n, s:$('#addSex').value});
  saveRoster(); $('#addName').value = ''; render(); toast('Student added');
};
$('#exportBtn').onclick = () => download(new Blob([JSON.stringify({roster, att}, null, 1)], {type:'application/json'}), `attendance-backup-${iso(new Date())}.json`);
$('#importFile').onchange = async e => {
  try {
    const d = JSON.parse(await e.target.files[0].text());
    if (!d.roster || !d.att) throw 0;
    if (!confirm('Replace all current data with this backup?')) return;
    roster = d.roster; att = d.att; saveRoster(); saveAtt(); if (!roster[cls]) cls = Object.keys(roster)[0]; render(); toast('Backup restored');
  } catch { alert('That file is not a valid attendance backup.'); }
  e.target.value = '';
};
$('#clearWeek').onclick = () => { if (confirm(`Clear all marks for ${cls}, week ${weekRange(wk)}?`)) { if (att[cls]) delete att[cls][wk]; saveAtt(); render(); } };
function download(blob, name) { const a = el('a', {href:URL.createObjectURL(blob), download:name}); document.body.append(a); a.click(); a.remove(); }

// ---------- reports ----------
function model(c) {
  const dates = dayDates(wk);
  const rows = roster[c].map((s, i) => {
    const r = rec(c, wk, s.id);
    return {no:i + 1, name:s.n, sex:s.s, days:r, A:count(r, 'A'), L:count(r, 'L'), E:count(r, 'E'), P:count(r, 'P'), term:termTotal(c, s.id, 'A')};
  });
  const st = classStats(c, wk);
  const absentees = DAYS.map((d, i) => rows.filter(r => r.days[i] === 'A').map(r => r.name));
  return {c, rows, st, absentees, dates};
}
const head = m => ['No', 'Student name', 'Sex', ...DAYS.map((d, i) => `${d} ${fmt(m.dates[i])}`), 'Present', 'Absent', 'Late', 'Excused', 'Term abs.'];
const body = m => m.rows.map(r => [r.no, r.name, r.sex, ...r.days.map(v => v || '-'), r.P, r.A, r.L, r.E, r.term]);

function letterhead(doc) {
  const W = doc.internal.pageSize.getWidth();
  doc.addImage(LOGO_LEFT, 'PNG', 14, 8, 27, 23.4);
  doc.addImage(LOGO_RIGHT, 'PNG', W - 14 - 24.5, 8, 24.5, 25.5);
  doc.setFont('times', 'bold'); doc.setFontSize(17); doc.setTextColor(0);
  doc.text(SCHOOL_FULL, W / 2, 17, {align:'center'});
  doc.setFont('times', 'normal'); doc.setFontSize(11);
  doc.text(SCHOOL_ADDR, W / 2, 24, {align:'center', lineHeightFactor:1.35});
  doc.setLineWidth(0.5); doc.line(24, 37, W - 24, 37);
  doc.setFillColor(0); doc.circle(24, 37, 1.1, 'F'); doc.circle(W - 24, 37, 1.1, 'F');
}
function pdfReport(classes) {
  const J = window.jspdf;
  if (!J) { toast('PDF library not loaded (offline?) – using print dialog'); return printReport(classes); }
  const doc = new J.jsPDF({orientation:'landscape', unit:'mm', format:'a4'});
  const W = doc.internal.pageSize.getWidth();
  classes.forEach((c, k) => {
    const m = model(c); if (k) doc.addPage();
    letterhead(doc);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    doc.text('WEEKLY ATTENDANCE REPORT', W / 2, 46, {align:'center'});
    const tw = doc.getTextWidth('WEEKLY ATTENDANCE REPORT'); doc.setLineWidth(0.3); doc.line(W / 2 - tw / 2, 47.5, W / 2 + tw / 2, 47.5);
    doc.setFontSize(10.5);
    doc.text(`Class: ${c}`, 14, 55); doc.text(`Week: ${weekRange(wk)}`, W / 2, 55, {align:'center'}); doc.text(`Number of students: ${m.st.n}`, W - 14, 55, {align:'right'});
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
    doc.text(`Present: ${m.st.P}    Absent: ${m.st.A}    Late: ${m.st.L}    Excused: ${m.st.E}    Attendance rate: ${m.st.rate}`, 14, 60.5);
    doc.autoTable({
      startY:63, margin:{left:14, right:14, bottom:14}, head:[head(m)], body:body(m), theme:'grid',
      styles:{fontSize:7, cellPadding:0.55, halign:'center', lineColor:[120,120,120], lineWidth:0.1, textColor:0},
      headStyles:{fillColor:[15,107,79], textColor:255, fontSize:7.5}, columnStyles:{1:{halign:'left', cellWidth:62}},
      didParseCell: d => {
        if (d.section !== 'body' || d.column.index < 3 || d.column.index > 7) return;
        const col = {A:[248,201,201], L:[251,232,166], E:[207,224,248]}[d.cell.raw];
        if (col) d.cell.styles.fillColor = col;
      }
    });
    let y = doc.lastAutoTable.finalY + 6;
    const ab = m.absentees.map((l, i) => l.length ? `${FULLDAYS[i]}: ${l.join(', ')}` : null).filter(Boolean);
    const lines = doc.splitTextToSize(ab.length ? ab.join('\n') : 'No absences recorded this week.', 265);
    const need = 6 + lines.length * 4 + 14;
    if (y + need > 200) { doc.addPage(); y = 15; }
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.text('Absentees by day', 14, y);
    doc.setFont('helvetica', 'normal'); doc.text(lines, 14, y + 5);
    doc.text('Teacher signature: ______________________      Head of Department: ______________________', 14, y + 7 + lines.length * 4);
  });
  doc.save(`attendance-${classes.length > 1 ? 'all-classes' : classes[0].replace(/\s/g, '_')}-week-${wk}.pdf`);
}
function printReport(classes) {
  $('#printArea').replaceChildren(...classes.map(c => {
    const m = model(c);
    const t = el('table', {style:'width:100%'}, el('thead', {}, el('tr', {}, head(m).map(h => el('th', {textContent:h})))),
      el('tbody', {}, body(m).map(r => el('tr', {}, r.map((v, i) => el('td', {className:i > 2 && i < 8 ? v : '', textContent:v}))))));
    const lh = el('div', {className:'lh'}, el('img', {src:LOGO_LEFT}),
      el('div', {className:'lt'}, el('b', {textContent:SCHOOL_FULL}), ...SCHOOL_ADDR.map(x => el('div', {textContent:x}))), el('img', {src:LOGO_RIGHT}));
    return el('div', {className:'rep'}, lh, el('hr', {className:'lhr'}), el('h3', {textContent:'WEEKLY ATTENDANCE REPORT'}),
      el('p', {className:'meta', textContent:`Class: ${c} · Week: ${weekRange(wk)} · Students: ${m.st.n} · Present ${m.st.P}, Absent ${m.st.A}, Late ${m.st.L}, Excused ${m.st.E} · Rate ${m.st.rate}`}), t);
  }));
  window.print();
}
$('#pdfClass').onclick = () => pdfReport([cls]);
$('#pdfAll').onclick = () => pdfReport(Object.keys(roster));
if (isChief) $('#pdfAll').hidden = true;

// ---------- user bar / password ----------
$('#userBadge').textContent = (isChief ? 'Chief · ' + SES.cls : 'Teacher · ' + SES.name);
$('#outBtn').onclick = () => { Auth.logout(); location.href = 'index.html'; };
const pwDlg = $('#pwDlg');
const openPw = first => { $('#pwForm').reset(); $('#pwErr').hidden = true;
  $('#pwMsg').textContent = first ? 'You are using a default password. Please choose your own password now.' : 'Enter your current password, then choose a new one.';
  $('#pwCancel').textContent = first ? 'Later' : 'Cancel'; pwDlg.showModal(); };
$('#pwBtn').onclick = () => openPw(false);
$('#pwCancel').onclick = () => pwDlg.close();
$('#pwForm').onsubmit = e => {
  const o = $('#pwOld').value, n = $('#pwNew').value, n2 = $('#pwNew2').value, er = $('#pwErr');
  const fail = m => { e.preventDefault(); er.textContent = m; er.hidden = false; };
  if (!Auth.verify(SES.u, o)) return fail('Current password is wrong.');
  if (n.length < 6) return fail('New password must be at least 6 characters.');
  if (n !== n2) return fail('The new passwords do not match.');
  Auth.setPassword(SES.u, n); toast('Password changed');
};
const rv = $('#revealDlg');
function reveal(title, u, p) { $('#rvTitle').textContent = title; $('#rvU').textContent = u; $('#rvP').textContent = p; rv.showModal(); }
$('#rvClose').onclick = () => rv.close();
$('#rvCopy').onclick = () => { try { navigator.clipboard.writeText(`Username: ${$('#rvU').textContent}\nPassword: ${$('#rvP').textContent}`); toast('Copied'); } catch { toast('Select and copy manually'); } };

// ---------- chief export / teacher import of marks ----------
if (isChief) { $('#expMarks').hidden = false; }
if (isChief) { const lg = document.querySelector('.legend small'); if (lg) lg.textContent = 'Tap an empty cell to mark · saved marks are locked'; }
$('#expMarks').onclick = () => download(new Blob([JSON.stringify({type:'marks', cls, att:att[cls] || {}})], {type:'application/json'}), `marks-${cls.replace(/\s/g, '_')}-${iso(new Date())}.json`);
$('#importMarks').onchange = async e => {
  try {
    const d = JSON.parse(await e.target.files[0].text());
    if (d.type !== 'marks' || !roster[d.cls]) throw 0;
    let added = 0;
    for (const [w, studs] of Object.entries(d.att)) for (const [id, days] of Object.entries(studs)) {
      if (!roster[d.cls].some(s => s.id === id)) continue;
      const cur = [...rec(d.cls, w, id)];
      days.forEach((v, i) => { if (v && !cur[i]) { cur[i] = v; added++; } });
      att[d.cls][w][id] = cur;
    }
    saveAtt(); render(); toast(`Imported ${added} new marks for ${d.cls}`);
  } catch { alert('That file is not a valid class marks export.'); }
  e.target.value = '';
};

// ---------- accounts (teachers) ----------
function renderAccounts() {
  const list = Auth.all();
  const mk = (a, canDel) => {
    const rs = el('button', {className:'sm', textContent:'Reset password'});
    rs.onclick = () => { if (confirm(`Reset the password for ${a.u}?`)) reveal('Password reset', a.u, Auth.reset(a.u)); };
    const acts = el('td', {}, rs);
    if (canDel && a.u !== SES.u) { const d = el('button', {className:'sm x', textContent:'Remove'}); d.onclick = () => { if (confirm(`Remove ${a.name}?`)) { Auth.remove(a.u); renderAccounts(); } }; acts.append(' ', d); }
    return el('tr', {}, el('td', {textContent:a.cls || a.name}), el('td', {textContent:a.u}), acts);
  };
  const hd = t => el('thead', {}, el('tr', {}, ...[t, 'Username', ''].map(x => el('th', {textContent:x}))));
  $('#accChief').replaceChildren(hd('Class'), el('tbody', {}, list.filter(a => a.role === 'chief').map(a => mk(a, false))));
  $('#accTeach').replaceChildren(hd('Teacher'), el('tbody', {}, list.filter(a => a.role === 'teacher').map(a => mk(a, true))));
}
$('#addTeacher').onsubmit = e => {
  e.preventDefault(); const n = $('#tName').value.trim(); if (!n) return;
  const r = Auth.addTeacher(n); $('#tName').value = ''; renderAccounts(); reveal('Teacher account created', r.u, r.p);
};
$('#resetAllChiefs').onclick = () => {
  if (!confirm('Generate NEW passwords for all class chiefs? Their current passwords will stop working.')) return;
  const rows = [['Class', 'Username', 'New password']];
  Auth.all().filter(a => a.role === 'chief').forEach(a => rows.push([a.cls, a.u, Auth.reset(a.u)]));
  download(new Blob([rows.map(r => r.join(',')).join('\n')], {type:'text/csv'}), `class-chief-passwords-${iso(new Date())}.csv`);
  toast('New passwords downloaded');
};

// ---------- main render ----------
function render() {
  fillClasses();
  $('#weekText').textContent = weekRange(wk);
  $('#datePick').value = wk;
  document.querySelectorAll('.tabs [data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  if (isChief) tab = 'register';
  ['register', 'summary', 'manage', 'accounts'].forEach(t => $('#v-' + t).hidden = t !== tab);
  const nt = $('#chiefNote'); nt.hidden = !isChief;
  if (isChief) nt.textContent = isCurrentWeek() ? 'Tap a cell to mark. Saved marks are final and can only be changed by a teacher.' : 'Viewing only. You can mark attendance in the current week.';
  $('#classSel').closest('label').style.visibility = (tab === 'summary' || tab === 'accounts') ? 'hidden' : '';
  $('#classSel').disabled = isChief;
  if (tab === 'register') renderRegister();
  if (tab === 'summary') renderSummary();
  if (tab === 'manage') renderManage();
  if (tab === 'accounts') renderAccounts();
}
render();
if (Auth.needsChange(SES.u)) openPw(true);
})();
