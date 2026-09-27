/* ══════════════════════════════════════════════════════════════
   ตัวคุมจังหวะทั้ง 6 ฉาก

   ซอง → จดหมาย → ปฏิทิน → พลุ → สไลด์ → ปิดท้าย

   ไม่ต้องแก้ไฟล์นี้เพื่อเปลี่ยนเนื้อหา — เนื้อหาอยู่ที่ content.js
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  /* ───────────── ดาวบนท้องฟ้า ───────────── */

  (function โรยดาว() {
    const กล่อง = $('ดาว');
    const จำนวน = window.innerWidth < 600 ? 55 : 95;
    const ชิ้น = document.createDocumentFragment();

    for (let i = 0; i < จำนวน; i++) {
      const ด = document.createElement('i');
      const ขนาด = Math.random() < 0.18 ? 3 : 2;
      ด.style.left   = (Math.random() * 100).toFixed(2) + '%';
      ด.style.top    = (Math.random() * 100).toFixed(2) + '%';
      ด.style.width  = ขนาด + 'px';
      ด.style.height = ขนาด + 'px';
      ด.style.setProperty('--ช่วง',  (2.6 + Math.random() * 4).toFixed(1) + 's');
      ด.style.setProperty('--ดีเลย์', (Math.random() * 5).toFixed(1) + 's');
      ชิ้น.appendChild(ด);
    }
    กล่อง.appendChild(ชิ้น);
  })();

  /* ───────────── เพลง ───────────── */

  const เสียง = $('เพลง');
  const ปุ่มเสียง = $('ปุ่มเสียง');
  let มีเพลง = false;

  if (เนื้อหา.เพลง && เนื้อหา.เพลง.ไฟล์) {
    เสียง.src = เนื้อหา.เพลง.ไฟล์;
    เสียง.volume = เนื้อหา.เพลง.ดัง != null ? เนื้อหา.เพลง.ดัง : 0.6;
    // ถ้าไฟล์เพลงไม่มีจริง ก็แค่ไม่มีเสียง เว็บต้องไม่พัง
    เสียง.addEventListener('canplay', () => { มีเพลง = true; }, { once: true });
    เสียง.addEventListener('error', () => { มีเพลง = false; ปุ่มเสียง.hidden = true; });
  }

  function เริ่มเพลง() {
    if (!เสียง.src) return;
    // มือถือบล็อกการเล่นอัตโนมัติ จึงต้องเรียกตอนที่คนแตะจอเท่านั้น
    const ลอง = เสียง.play();
    if (ลอง && ลอง.catch) ลอง.catch(() => { /* เล่นไม่ได้ก็ปล่อยเงียบไป */ });
    if (มีเพลง !== false) ปุ่มเสียง.hidden = false;
  }

  ปุ่มเสียง.addEventListener('click', () => {
    เสียง.muted = !เสียง.muted;
    ปุ่มเสียง.classList.toggle('เงียบ', เสียง.muted);
    ปุ่มเสียง.setAttribute('aria-label', เสียง.muted ? 'เปิดเสียงเพลง' : 'ปิดเสียงเพลง');
  });

  /* ───────────── สลับฉาก ───────────── */

  function ไปฉาก(id, หน่วง) {
    const เก่า = document.querySelector('.ฉาก.แสดง');
    const รอ = เก่า ? (หน่วง != null ? หน่วง : 900) : 0;
    if (เก่า) เก่า.classList.remove('แสดง');
    setTimeout(() => $(id).classList.add('แสดง'), รอ);
  }

  /* ───────────── ① ซองจดหมาย ───────────── */

  $('คำชวน').textContent = เนื้อหา.ซอง.คำชวน;

  const ซอง = $('ซอง');
  let เปิดแล้ว = false;

  ซอง.addEventListener('click', () => {
    if (เปิดแล้ว) return;
    เปิดแล้ว = true;

    ซอง.classList.add('เปิด');
    $('คำชวน').style.opacity = '0';
    เริ่มเพลง();                       // ต้องอยู่ในจังหวะแตะ ไม่งั้นมือถือบล็อก

    setTimeout(() => ไปฉาก('ฉาก-จดหมาย'), 1250);
  });

  $('ฉาก-ซอง').classList.add('แสดง');

  /* ───────────── ② จดหมาย ───────────── */

  (function เขียนจดหมาย() {
    const กล่อง = $('จดหมาย-เนื้อ');
    เนื้อหา.จดหมาย.บรรทัด.forEach((ข้อความ, i) => {
      const p = document.createElement('p');
      p.textContent = ข้อความ;
      p.style.setProperty('--ดีเลย์', (0.5 + i * 0.85) + 's');
      กล่อง.appendChild(p);
    });

    const ปุ่ม = $('ปุ่มต่อ');
    ปุ่ม.textContent = เนื้อหา.จดหมาย.ปุ่ม;
    ปุ่ม.style.setProperty('--ดีเลย์', (0.9 + เนื้อหา.จดหมาย.บรรทัด.length * 0.85) + 's');
    ปุ่ม.addEventListener('click', () => ไปฉาก('ฉาก-ปฏิทิน'));
  })();

  /* ───────────── ③ ปฏิทิน ───────────── */

  const เดือนไทย = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                    'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

  (function สร้างปฏิทิน() {
    const ตั้ง = เนื้อหา.ปฏิทิน;
    $('ปฏิทิน-คำถาม').textContent = ตั้ง.คำถาม;

    const [ปี, เดือน] = ตั้ง.เดือนที่เปิด.split('-').map(Number);
    $('ปฏิทิน-หัว').textContent = เดือนไทย[เดือน - 1] + ' ' + (ปี + 543);

    const วันแรก = new Date(ปี, เดือน - 1, 1).getDay();      // 0 = อาทิตย์
    const จำนวนวัน = new Date(ปี, เดือน, 0).getDate();

    const ช่อง = $('ปฏิทิน-ช่อง');
    const ชิ้น = document.createDocumentFragment();

    // ช่องว่างก่อนวันที่ 1
    for (let i = 0; i < วันแรก; i++) {
      const ว = document.createElement('span');
      ว.className = 'ว่าง';
      ชิ้น.appendChild(ว);
    }

    for (let d = 1; d <= จำนวนวัน; d++) {
      const ป = document.createElement('button');
      ป.type = 'button';
      ป.textContent = d;
      ป.dataset.วัน = d;
      ชิ้น.appendChild(ป);
    }

    ช่อง.appendChild(ชิ้น);
    ช่อง.addEventListener('click', ตอบ);

    ของเล่น.หกเหลี่ยม($('หกเหลี่ยม'), 8, 6);
    $('ชะโงก').innerHTML = ของเล่น.ตัวละคร('ปีก', { สวม: 'โบว์' });
  })();

  let จบปฏิทินแล้ว = false;

  function ตอบ(e) {
    const ป = e.target.closest('button');
    if (!ป || จบปฏิทินแล้ว) return;

    const ตั้ง = เนื้อหา.ปฏิทิน;

    if (Number(ป.dataset.วัน) === ตั้ง.วันที่ถูก) {
      จบปฏิทินแล้ว = true;
      ป.classList.add('ถูก');
      $('คำหยอก').classList.remove('โชว์');

      ของเล่น.เหรียญ($('เหรียญ-กล่อง'), 24);
      setTimeout(เล่นสามดาว, 1000);

    } else {
      const ปฏิทิน = $('ปฏิทิน');
      ปฏิทิน.classList.remove('ผิด');
      void ปฏิทิน.offsetWidth;          // บังคับให้เบราว์เซอร์เล่นอนิเมชันซ้ำ
      ปฏิทิน.classList.add('ผิด');

      const คำ = ตั้ง.คำหยอกตอนกดผิด;
      const หยอก = $('คำหยอก');
      หยอก.textContent = คำ[(Math.random() * คำ.length) | 0];
      หยอก.classList.add('โชว์');
    }
  }

  /* ───────────── ③½ อัป 3 ดาว ─────────────
     ตัวละครสามตัววิ่งเข้ามารวมร่าง → แสงวาบ → ตัวทอง → ⭐⭐⭐
     คนที่เล่น TFT จะรู้ทันทีว่านี่คือจังหวะที่ฟินที่สุดของเกม     */

  function เล่นสามดาว() {
    const ฉาก = $('ฉาก-สามดาว');

    // ต้องใส่ตัวละครก่อนติดคลาส .เล่น
    // สามตัวแรกถือของคนละอย่าง พอรวมร่างแล้วตัวทองได้ของครบทั้งสาม
    $('ตัวรวม-1').innerHTML = ของเล่น.ตัวละคร('หูกลม', { สวม: 'ดาบ',    ไอเทม: ['ดาบ'] });
    $('ตัวรวม-2').innerHTML = ของเล่น.ตัวละคร('เขา',   { สวม: 'ไม้เท้า', ไอเทม: ['เวทย์'] });
    $('ตัวรวม-3').innerHTML = ของเล่น.ตัวละคร('ปีก',   { สวม: 'โบว์',   ไอเทม: ['โล่'] });
    $('ตัวทอง').innerHTML   = ของเล่น.ตัวละคร('ทอง',   {
      สวม: 'มงกุฎ', คลุม: 'ผ้าคลุม', ไอเทม: ['ดาบ', 'เวทย์', 'โล่'],
    });

    ไปฉาก('ฉาก-สามดาว', 700);

    // คลาส .เล่น คือตัวสั่งให้อนิเมชันทั้งฉากเริ่มเดิน
    // ต้องติดหลังฉากโผล่แล้ว ไม่งั้นเล่นจบตั้งแต่ยังมองไม่เห็น
    setTimeout(() => ฉาก.classList.add('เล่น'), 760);

    setTimeout(() => {
      ไปฉาก('ฉาก-พลุ', 700);
      เล่นฉากพลุ();
    }, 4600);
  }

  /* ───────────── ④ พลุ ───────────── */

  function เล่นฉากพลุ() {
    // แตกคำใหญ่เป็นตัวอักษร ให้โผล่ทีละตัว
    const กล่อง = $('คำใหญ่');
    const คำ = เนื้อหา.พลุ.คำใหญ่;
    กล่อง.textContent = '';
    กล่อง.setAttribute('aria-label', คำ);

    // ต้องห่อเป็น "คำ" ก่อน แล้วค่อยแตกเป็นตัวอักษรข้างใน
    // ไม่งั้นเบราว์เซอร์ตัดบรรทัดกลางคำได้ กลายเป็น HAPPY BIRTHDA / Y
    let ลำดับ = 0;
    คำ.split(' ').forEach((หนึ่งคำ, ที่) => {
      if (ที่ > 0) {
        const ช่อง = document.createElement('span');
        ช่อง.className = 'เว้น';
        ช่อง.innerHTML = '&nbsp;';
        ช่อง.setAttribute('aria-hidden', 'true');
        กล่อง.appendChild(ช่อง);
      }

      const ห่อ = document.createElement('span');
      ห่อ.className = 'คำ';

      [...หนึ่งคำ].forEach((ตัว) => {
        const s = document.createElement('span');
        s.textContent = ตัว;
        s.style.setProperty('--ดีเลย์', (0.55 + ลำดับ * 0.075) + 's');
        s.setAttribute('aria-hidden', 'true');
        ห่อ.appendChild(s);
        ลำดับ++;
      });

      กล่อง.appendChild(ห่อ);
    });

    $('เลขอายุ').textContent = เนื้อหา.พลุ.เลขอายุ;
    $('คำรอง').textContent  = เนื้อหา.พลุ.คำรอง;

    พลุ.เริ่ม();
    พลุ.ชุดใหญ่();

    setTimeout(เริ่มสไลด์, 9800);
  }

  /* ───────────── ⑤ สไลด์ความทรงจำ ───────────── */

  let รายการสไลด์ = [];
  let ดัชนี = 0;
  let นาฬิกา = null;
  let หยุดอยู่ = false;

  // โหลดสื่อล่วงหน้า และคัดเฉพาะชิ้นที่โหลดได้จริง
  // (ถ้าใน content.js อ้างถึงไฟล์ที่ยังไม่ได้ใส่ ต้องข้ามไปเงียบ ๆ ไม่ใช่โชว์กรอบแตก)
  function เตรียมสื่อ() {
    const รายการ = เนื้อหา.สไลด์ || [];
    return Promise.all(รายการ.map((ส) => new Promise((ผ่าน) => {

      if (ส.วิดีโอ) {
        const v = document.createElement('video');
        v.muted = true;
        v.playsInline = true;
        v.preload = 'auto';
        // บางเบราว์เซอร์ไม่ยิง error เลยถ้าไฟล์มีปัญหา ต้องตั้งเวลากันค้างไว้เอง
        const หมดเวลา = setTimeout(() => ผ่าน(null), 9000);
        v.addEventListener('loadeddata', () => { clearTimeout(หมดเวลา); ผ่าน(ส); }, { once: true });
        v.addEventListener('error',      () => { clearTimeout(หมดเวลา); ผ่าน(null); }, { once: true });
        v.src = ส.วิดีโอ;
        return;
      }

      if (!ส.รูป) return ผ่าน(null);
      const im = new Image();
      im.onload  = () => ผ่าน(ส);
      im.onerror = () => ผ่าน(null);
      im.src = ส.รูป;
    }))).then((ผล) => ผล.filter(Boolean));
  }

  function เริ่มสไลด์() {
    เตรียมสื่อ().then((ok) => {
      รายการสไลด์ = ok;

      // ไม่มีรูปสักใบ ก็ข้ามไปฉากปิดท้ายเลย
      if (!รายการสไลด์.length) { ไปปิดท้าย(); return; }

      สร้างชั้นรูป();
      สร้างจุด();
      พลุ.เบา(true);               // พลุเบาลงเป็นฉากหลัง
      ของเล่น.เริ่มวิ่ง($('วิ่ง-กล่อง'));
      ไปฉาก('ฉาก-สไลด์');
      setTimeout(() => โชว์สไลด์(0), 700);
    });
  }

  let ชั้นรูป = [];

  function สร้างชั้นรูป() {
    const เวที = $('สไลด์-เวที');
    ชั้นรูป = รายการสไลด์.map((ส) => {
      if (ส.วิดีโอ) {
        const v = document.createElement('video');
        v.src = ส.วิดีโอ;
        v.muted = true;            // บังคับปิดเสียง ไม่งั้นมือถือไม่ยอมเล่นเอง
        v.loop = true;
        v.preload = 'auto';
        v.playsInline = true;
        v.setAttribute('playsinline', '');        // iOS รุ่นเก่าอ่านแอตทริบิวต์เท่านั้น
        v.setAttribute('webkit-playsinline', '');
        v.setAttribute('muted', '');
        เวที.appendChild(v);
        return v;
      }

      const im = document.createElement('img');
      im.src = ส.รูป;
      im.alt = '';
      เวที.appendChild(im);
      return im;
    });
  }

  function สร้างจุด() {
    const กล่อง = $('สไลด์-จุด');
    กล่อง.innerHTML = '';
    รายการสไลด์.forEach(() => กล่อง.appendChild(document.createElement('i')));
  }

  function โชว์สไลด์(i) {
    ดัชนี = i;
    const ส = รายการสไลด์[i];
    const นาน = (ส.วินาที || 6);

    ชั้นรูป.forEach((el, k) => {
      const เป็นวิดีโอ = el.tagName === 'VIDEO';

      if (k === i) {
        if (เป็นวิดีโอ) {
          // วิดีโอขยับอยู่แล้ว ไม่ต้องใส่ Ken Burns ซ้อนเข้าไปอีก
          el.currentTime = 0;
          const ลอง = el.play();
          if (ลอง && ลอง.catch) ลอง.catch(() => {});
        } else {
          // สุ่มทิศการเลื่อนภาพ ไม่ให้ทุกใบขยับเหมือนกันจนน่าเบื่อ
          el.style.setProperty('--นาน', นาน + 's');
          el.style.setProperty('--เลื่อนx', ((Math.random() * 4 - 2)).toFixed(1) + '%');
          el.style.setProperty('--เลื่อนy', ((Math.random() * 4 - 2)).toFixed(1) + '%');
        }
        el.classList.add('แสดง');
      } else {
        el.classList.remove('แสดง');
        if (เป็นวิดีโอ) el.pause();
      }
    });

    ใส่คำ($('สไลด์-หัว'), ส.หัว);
    ใส่คำ($('สไลด์-รอง'), ส.รอง);

    [...$('สไลด์-จุด').children].forEach((จ, k) => จ.classList.toggle('นี่', k === i));

    clearTimeout(นาฬิกา);
    if (!หยุดอยู่) นาฬิกา = setTimeout(ถัดไป, นาน * 1000);
  }

  function ใส่คำ(el, ข้อความ) {
    el.textContent = ข้อความ || '';
    el.classList.remove('เข้า');
    void el.offsetWidth;
    if (ข้อความ) el.classList.add('เข้า');
  }

  function ถัดไป() {
    if (ดัชนี + 1 < รายการสไลด์.length) โชว์สไลด์(ดัชนี + 1);
    else ไปปิดท้าย();
  }

  $('ปุ่มหยุด').addEventListener('click', function () {
    หยุดอยู่ = !หยุดอยู่;
    this.textContent = หยุดอยู่ ? 'เล่น' : 'หยุด';
    const สื่อ = ชั้นรูป[ดัชนี];
    const เป็นวิดีโอ = สื่อ && สื่อ.tagName === 'VIDEO';

    if (หยุดอยู่) {
      clearTimeout(นาฬิกา);
      if (เป็นวิดีโอ) สื่อ.pause();
      else if (สื่อ) สื่อ.style.animationPlayState = 'paused';
    } else {
      if (เป็นวิดีโอ) { const ล = สื่อ.play(); if (ล && ล.catch) ล.catch(() => {}); }
      else if (สื่อ) สื่อ.style.animationPlayState = 'running';
      นาฬิกา = setTimeout(ถัดไป, 2500);
    }
  });

  $('ปุ่มข้าม').addEventListener('click', () => {
    clearTimeout(นาฬิกา);
    ไปปิดท้าย();
  });

  /* ───────────── ⑥ ปิดท้าย ───────────── */

  let ปิดแล้ว = false;

  /* สร้างกำแพงรูป — เอารูปทุกใบมาเรียงเต็มจอเป็นฉากหลังของจดหมาย
     ถ้ารูปน้อย ก็วนซ้ำจนเต็ม ไม่งั้นกำแพงจะโหว่ครึ่งจอ */
  function สร้างกำแพง() {
    const ใน = $('กำแพง-ใน');
    // เอาเฉพาะรูปนิ่ง — วิดีโอสิบกว่าช่องเล่นพร้อมกันจะทำให้มือถือค้าง
    const รูปนิ่ง = รายการสไลด์.filter((ส) => ส.รูป && !ส.วิดีโอ);
    if (!รูปนิ่ง.length) { $('กำแพง').style.display = 'none'; return; }

    const เป้า = Math.max(18, รูปนิ่ง.length);
    const ชิ้น = document.createDocumentFragment();

    for (let i = 0; i < เป้า; i++) {
      const im = document.createElement('img');
      im.src = รูปนิ่ง[i % รูปนิ่ง.length].รูป;
      im.alt = '';
      im.loading = 'lazy';
      im.style.setProperty('--ดีเลย์', (0.25 + (i % 12) * 0.11).toFixed(2) + 's');
      ชิ้น.appendChild(im);
    }
    ใน.appendChild(ชิ้น);
  }

  function ไปปิดท้าย() {
    if (ปิดแล้ว) return;

    // เข้าฉากนี้ตรง ๆ ได้ (ทางลัด ?ดู=ปิดท้าย) ต้องโหลดรูปเองก่อนสร้างกำแพง
    if (!รายการสไลด์.length) {
      เตรียมสื่อ().then((ok) => { รายการสไลด์ = ok; ปิดท้ายจริง(); });
      return;
    }
    ปิดท้ายจริง();
  }

  function ปิดท้ายจริง() {
    if (ปิดแล้ว) return;
    ปิดแล้ว = true;
    clearTimeout(นาฬิกา);
    ของเล่น.หยุดวิ่ง();          // ฉากปิดท้ายไม่มีตัวละคร ให้เหลือแต่รูปกับคำ

    สร้างกำแพง();
    $('การ์ด-หัว').textContent = เนื้อหา.ปิดท้าย.หัว || '';

    const กล่อง = $('ปิดท้าย-เนื้อ');
    กล่อง.innerHTML = '';

    const บรรทัด = เนื้อหา.ปิดท้าย.บรรทัด || [];
    บรรทัด.forEach((ข้อความ, i) => {
      const p = document.createElement('p');
      p.textContent = ข้อความ;
      p.style.setProperty('--ดีเลย์', (0.6 + i * 1.1) + 's');
      กล่อง.appendChild(p);
    });

    const ท้าย = 0.9 + บรรทัด.length * 1.1;
    const ชื่อ = $('ลงชื่อ');
    ชื่อ.textContent = เนื้อหา.ปิดท้าย.ลงชื่อ || '';
    ชื่อ.style.setProperty('--ดีเลย์', ท้าย + 's');
    $('ปุ่มดูใหม่').style.setProperty('--ดีเลย์', (ท้าย + 1.2) + 's');

    พลุ.เริ่ม();
    พลุ.เบา(true);
    ไปฉาก('ฉาก-ปิดท้าย');
  }

  // เริ่มใหม่ตั้งแต่ซอง — โหลดหน้าใหม่เพื่อให้สถานะสะอาดจริง
  $('ปุ่มดูใหม่').addEventListener('click', () => location.reload());

  /* ───────────── ทางลัดสำหรับตรวจงาน ─────────────
     ต่อท้าย URL ว่า  ?ดู=พลุ  เพื่อกระโดดไปดูฉากนั้นเลย
     ไม่ต้องไล่คลิกใหม่ทุกครั้งตอนแก้ข้อความหรือรูป

     ใช้ได้: จดหมาย · ปฏิทิน · สามดาว · พลุ · สไลด์ · ปิดท้าย
     คนรับจะไม่เจอทางลัดนี้ เพราะลิงก์ที่ส่งไปไม่มี ?ดู=          */

  const พารา = new URLSearchParams(location.search);

  // โหมดหยุดนิ่ง: ข้ามอนิเมชันไปสภาพสุดท้าย ใช้ตรวจเลย์เอาต์
  if (พารา.has('นิ่ง')) document.documentElement.classList.add('นิ่ง');

  const ลัด = พารา.get('ดู');
  if (ลัด) {
    document.querySelectorAll('.ฉาก').forEach((s) => s.classList.remove('แสดง'));
    ปุ่มเสียง.hidden = false;

    if      (ลัด === 'จดหมาย') $('ฉาก-จดหมาย').classList.add('แสดง');
    else if (ลัด === 'ปฏิทิน') $('ฉาก-ปฏิทิน').classList.add('แสดง');
    else if (ลัด === 'สามดาว') เล่นสามดาว();
    else if (ลัด === 'พลุ')    { $('ฉาก-พลุ').classList.add('แสดง'); เล่นฉากพลุ(); }
    else if (ลัด === 'สไลด์')  เริ่มสไลด์();
    else if (ลัด === 'ปิดท้าย') ไปปิดท้าย();
    else $('ฉาก-ซอง').classList.add('แสดง');
  }

})();
