/* script.js — interaksi portofolio (JavaScript murni) */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  /* ===== 1. Mode terang / gelap =====
     Pilihan disimpan di localStorage; jika belum ada, ikuti pengaturan perangkat. */
  var themeBtn = document.getElementById('themeBtn');
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    themeBtn.querySelector('use').setAttribute('href', t === 'dark' ? '#i-sun' : '#i-moon');
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
  }
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  applyTheme(saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ===== 2. Menu mobile ===== */
  var menu = document.getElementById('menu');
  var menuBtn = document.getElementById('menuBtn');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ===== 3. Animasi muncul saat scroll + penanda menu aktif ===== */
  var items = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });

    var links = document.querySelectorAll('#menu a');
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* ===== 4. Formulir kontak =====
     Belum ada backend, jadi pesan TIDAK dikirim otomatis. Setelah valid,
     aplikasi email di perangkat dibuka dengan draf pesan yang sudah terisi.
     Untuk backend sungguhan, isi FORM_ENDPOINT (mis. URL dari Formspree). */
  var FORM_ENDPOINT = ''; // contoh: 'https://formspree.io/f/xxxxxxx'
  var EMAIL_TUJUAN = '26051204196@mhs.unesa.ac.id';
  var form = document.getElementById('form');
  var statusEl = document.getElementById('status');

  function setError(id, msg) {
    document.getElementById('e-' + id).textContent = msg;
    var f = document.getElementById(id);
    f.classList.toggle('invalid', !!msg);
    f.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  function validate() {
    var n = document.getElementById('name').value.trim(), m = document.getElementById('email').value.trim(), t = document.getElementById('message').value.trim();
    var ok = setError('name', n.length < 2 ? 'Isi nama minimal 2 karakter.' : '');
    ok = setError('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m) ? '' : 'Masukkan alamat email yang valid.') && ok;
    ok = setError('message', t.length < 10 ? 'Tulis pesan minimal 10 karakter.' : '') && ok;
    return ok;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    statusEl.textContent = '';
    if (!validate()) { statusEl.textContent = 'Periksa kembali kolom yang ditandai.'; return; }
    var data = { name: document.getElementById('name').value.trim(), email: document.getElementById('email').value.trim(), message: document.getElementById('message').value.trim() };

    if (FORM_ENDPOINT) {
      statusEl.textContent = 'Mengirim...';
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) {
          if (!r.ok) throw new Error();
          form.reset();
          statusEl.textContent = 'Pesan diterima oleh layanan pengiriman.';
        })
        .catch(function () { statusEl.textContent = 'Pesan gagal dikirim. Coba lagi atau kirim lewat email langsung.'; });
      return;
    }
    var body = data.message + '\n\nDari: ' + data.name + ' (' + data.email + ')';
    window.location.href = 'mailto:' + EMAIL_TUJUAN + '?subject=' + encodeURIComponent('Pesan dari portofolio: ' + data.name) + '&body=' + encodeURIComponent(body);
    statusEl.textContent = 'Draf email dibuka di aplikasi email Anda. Pesan baru terkirim setelah Anda menekan kirim di sana.';
  });
  form.addEventListener('input', function (e) { if (e.target.id) setError(e.target.id, ''); });

  /* ===== 5. Tahun otomatis di footer ===== */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
