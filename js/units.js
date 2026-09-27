/* ══════════════════════════════════════════════════════════════
   ของเล่นสาย TFT — ตัวละคร กระดานหกเหลี่ยม เหรียญ และการอัป 3 ดาว

   สำคัญ: ตัวละครในนี้ "วาดขึ้นใหม่ทั้งหมด" เป็น SVG
   ไม่มีไฟล์ภาพจากเกม ไม่มีทรัพย์สินทางปัญญาของใครอยู่ในนี้
   เป็นแค่ภาษาภาพแบบเดียวกัน — ตัวกลม ตาโต ขาสั้น

   วาดเป็น SVG แทนรูป เพราะย่อขยายได้ไม่แตก โหลดเร็ว
   และเปลี่ยนสีทั้งตัวได้ด้วยตัวแปร CSS ตัวเดียว
   ══════════════════════════════════════════════════════════════ */

const ของเล่น = (function () {

  /* ───────────── ตัวละคร ─────────────
     สามแบบต่างกันที่หัว: หูกลม · เขา · ปีก
     ส่วนลำตัวใช้โครงเดียวกันหมด จะได้ดูเป็นครอบครัวเดียวกัน   */

  const พันธุ์ = {
    หูกลม: { ตัว: '#7fe3c4', เข้ม: '#46b394', ท้อง: '#dffff5' },
    เขา:   { ตัว: '#b49bff', เข้ม: '#8163dd', ท้อง: '#ece3ff' },
    ปีก:   { ตัว: '#ffb27f', เข้ม: '#df8550', ท้อง: '#ffe6d2' },
    ทอง:   { ตัว: '#ffd97d', เข้ม: '#cf9c33', ท้อง: '#fff6da' },
  };

  function หัวของ(แบบ, s) {
    if (แบบ === 'เขา') return `
      <path d="M32 26 L26 6 L42 20 Z" fill="${s.เข้ม}"/>
      <path d="M68 26 L74 6 L58 20 Z" fill="${s.เข้ม}"/>`;
    if (แบบ === 'ปีก') return `
      <path d="M20 44 q-16 -12 -16 4 q0 14 16 6 Z" fill="${s.เข้ม}" opacity=".9"/>
      <path d="M80 44 q16 -12 16 4 q0 14 -16 6 Z" fill="${s.เข้ม}" opacity=".9"/>`;
    return `
      <ellipse cx="27" cy="28" rx="11" ry="13" fill="${s.เข้ม}" transform="rotate(-18 27 28)"/>
      <ellipse cx="73" cy="28" rx="11" ry="13" fill="${s.เข้ม}" transform="rotate(18 73 28)"/>`;
  }

  /* ───────────── เครื่องแต่งตัว ─────────────
     วาดขึ้นใหม่เป็นทรงพื้นฐาน — มงกุฎ หมวก ดาบ ไม้เท้า ผ้าคลุม
     เป็นของสามัญที่ไม่ได้ลอกแบบมาจากเกมไหน                      */

  const สวมหลัง = {
    // ผ้าคลุมต้องวาดก่อนลำตัว ไม่งั้นจะไปทับหน้าท้อง
    ผ้าคลุม: `<path d="M23 42 q-9 28 3 44 q24 7 48 0 q12 -16 3 -44
                        q-27 11 -54 0 Z" fill="#e0556a" opacity=".92"/>
              <path d="M23 42 q27 11 54 0 q-4 -7 -8 -9 q-19 7 -38 0 q-4 2 -8 9 Z"
                    fill="#c74054"/>`,
  };

  const สวมหน้า = {
    มงกุฎ: `<path d="M33 25 L33 13 L41.5 19.5 L50 8 L58.5 19.5 L67 13 L67 25 Z"
                  fill="#ffd166" stroke="#d29a2e" stroke-width="1.6" stroke-linejoin="round"/>
            <circle cx="50" cy="6" r="2.8" fill="#ff6b8a"/>`,

    หมวก:  `<path d="M50 -2 L70 28 L30 28 Z" fill="#7d63e8"/>
            <path d="M50 -2 L60 13 L40 13 Z" fill="#9781f0" opacity=".7"/>
            <ellipse cx="50" cy="28" rx="24" ry="5.5" fill="#6650cf"/>
            <circle cx="50" cy="0" r="3.2" fill="#ffd166"/>`,

    โบว์:  `<path d="M50 22 l-13 -7 q-5 7 0 14 Z" fill="#ff8fb0"/>
            <path d="M50 22 l13 -7 q5 7 0 14 Z"  fill="#ff8fb0"/>
            <circle cx="50" cy="22" r="4.2" fill="#ff6b8a"/>`,

    ดาบ:   `<g transform="translate(83 32) rotate(22)">
              <rect x="-2" y="0"  width="4"  height="30" rx="2"   fill="#d6dee9"/>
              <rect x="-2" y="0"  width="1.6" height="30"         fill="#fbfdff"/>
              <rect x="-8" y="29" width="16" height="4"  rx="2"   fill="#c99a4a"/>
              <rect x="-2.8" y="33" width="5.6" height="10" rx="2.8" fill="#8a6434"/>
            </g>`,

    ไม้เท้า:`<g transform="translate(82 36) rotate(16)">
              <rect x="-1.7" y="0" width="3.4" height="30" rx="1.7" fill="#9b7448"/>
              <path d="M0 -13 L3.2 -4.8 L12 -3.6 L5.6 2.4 L7.2 11 L0 6.8
                       L-7.2 11 L-5.6 2.4 L-12 -3.6 L-3.2 -4.8 Z" fill="#ffd166"/>
            </g>`,
  };

  /* ไอเทมใต้ตัว — ในเกมนี้ของที่ถืออยู่จะเรียงเป็นช่องเล็ก ๆ ใต้ตัวละคร
     เป็นรายละเอียดที่คนเล่นจำได้ทันที                              */

  const หน้าไอเทม = {
    ดาบ:  `<path d="M8 3.5 L8 11 M5.2 11 h5.6 M8 11 v2.4" stroke="#fff"
                 stroke-width="1.7" stroke-linecap="round" fill="none"/>`,
    โล่:  `<path d="M8 3.6 l4.2 1.8 v3.4 q0 3.6 -4.2 5.4 q-4.2 -1.8 -4.2 -5.4
                 V5.4 Z" fill="#fff"/>`,
    เวทย์:`<circle cx="8" cy="8" r="3.4" fill="#fff"/>
           <path d="M8 1.6 v2 M8 12.4 v2 M1.6 8 h2 M12.4 8 h2" stroke="#fff"
                 stroke-width="1.5" stroke-linecap="round"/>`,
    หัวใจ:`<path d="M8 14 q-6 -4.2 -6 -8 a3.4 3.4 0 0 1 6 -1.8
                 a3.4 3.4 0 0 1 6 1.8 q0 3.8 -6 8 Z" fill="#fff"/>`,
  };

  const สีไอเทม = { ดาบ: '#c94f4f', โล่: '#4f8dc9', เวทย์: '#8d5fd3', หัวใจ: '#d9557a' };

  function แถบไอเทม(รายการ) {
    if (!รายการ || !รายการ.length) return '';
    const n = Math.min(รายการ.length, 3);
    const กว้าง = 16, ช่องว่าง = 3;
    const รวม = n * กว้าง + (n - 1) * ช่องว่าง;
    let x = 50 - รวม / 2;

    return รายการ.slice(0, 3).map((ชื่อ) => {
      const g = `<g transform="translate(${x.toFixed(1)} 88)">
          <rect width="16" height="16" rx="4.5" fill="${สีไอเทม[ชื่อ] || '#666'}"
                stroke="#ffe6a8" stroke-width="1.4"/>
          ${หน้าไอเทม[ชื่อ] || ''}
        </g>`;
      x += กว้าง + ช่องว่าง;
      return g;
    }).join('');
  }

  /* ตัวละคร(แบบ, { สวม: 'มงกุฎ', คลุม: 'ผ้าคลุม', ไอเทม: ['ดาบ','โล่'] }) */
  function ตัวละคร(แบบ, ของ) {
    const s = พันธุ์[แบบ] || พันธุ์.หูกลม;
    const o = ของ || {};
    const มีไอเทม = o.ไอเทม && o.ไอเทม.length;

    return `
<svg class="ตัว" viewBox="0 0 100 ${มีไอเทม ? 108 : 100}"
     xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <ellipse class="ตัว-เงา" cx="50" cy="94" rx="24" ry="4.5"/>
  ${o.คลุม ? (สวมหลัง[o.คลุม] || '') : ''}
  ${หัวของ(แบบ, s)}
  <g class="ตัว-ขา">
    <rect x="33" y="70" width="12" height="19" rx="6" fill="${s.เข้ม}"/>
    <rect x="55" y="70" width="12" height="19" rx="6" fill="${s.เข้ม}"/>
  </g>
  <ellipse cx="50" cy="51" rx="31" ry="29" fill="${s.ตัว}"/>
  <ellipse cx="50" cy="60" rx="19" ry="16" fill="${s.ท้อง}" opacity=".85"/>
  <ellipse cx="39" cy="47" rx="5.2" ry="6.4" fill="#2b2340"/>
  <ellipse cx="61" cy="47" rx="5.2" ry="6.4" fill="#2b2340"/>
  <circle cx="40.6" cy="44.6" r="1.9" fill="#fff"/>
  <circle cx="62.6" cy="44.6" r="1.9" fill="#fff"/>
  <ellipse cx="29" cy="57" rx="5" ry="3.4" fill="${s.เข้ม}" opacity=".45"/>
  <ellipse cx="71" cy="57" rx="5" ry="3.4" fill="${s.เข้ม}" opacity=".45"/>
  <path d="M45 58 q5 5 10 0" stroke="#2b2340" stroke-width="2.2"
        fill="none" stroke-linecap="round"/>
  ${o.สวม ? (สวมหน้า[o.สวม] || '') : ''}
  ${แถบไอเทม(o.ไอเทม)}
</svg>`;
  }

  /* ───────────── กระดานหกเหลี่ยม ─────────────
     วาดเป็นตะแกรงจาง ๆ ไว้หลังปฏิทิน บอกใบ้ว่าเป็นเกมกระดาน
     โดยไม่แย่งสายตาไปจากตัวปฏิทินเอง                          */

  function หกเหลี่ยม(กล่อง, แถว, คอลัมน์) {
    แถว = แถว || 7; คอลัมน์ = คอลัมน์ || 6;
    const r = 30;                          // รัศมีหกเหลี่ยม
    const กว้าง = Math.sqrt(3) * r;
    const สูงก้าว = 1.5 * r;

    let d = '';
    for (let y = 0; y < แถว; y++) {
      for (let x = 0; x < คอลัมน์; x++) {
        const cx = กว้าง * (x + (y % 2 ? 0.5 : 0)) + กว้าง / 2;
        const cy = สูงก้าว * y + r;
        const จุด = [];
        for (let i = 0; i < 6; i++) {
          const a = Math.PI / 180 * (60 * i - 30);
          จุด.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
        }
        // สุ่มให้บางช่องสว่างกว่าเพื่อน เหมือนช่องที่มีตัวยืนอยู่
        const เด่น = Math.random() < 0.13;
        d += `<polygon points="${จุด.join(' ')}" class="${เด่น ? 'ช่องเด่น' : 'ช่อง'}"
                style="--ดีเลย์:${(Math.random() * 6).toFixed(1)}s"/>`;
      }
    }

    กล่อง.innerHTML =
      `<svg viewBox="0 0 ${กว้าง * คอลัมน์ + กว้าง} ${สูงก้าว * แถว + r}"
            preserveAspectRatio="xMidYMid slice" aria-hidden="true">${d}</svg>`;
  }

  /* ───────────── เหรียญทองร่วง ───────────── */

  function เหรียญ(กล่อง, จำนวน) {
    จำนวน = จำนวน || 22;
    const ชิ้น = document.createDocumentFragment();

    for (let i = 0; i < จำนวน; i++) {
      const c = document.createElement('span');
      c.className = 'เหรียญ';
      c.style.left = (Math.random() * 100).toFixed(1) + '%';
      c.style.setProperty('--ดีเลย์', (Math.random() * 1.1).toFixed(2) + 's');
      c.style.setProperty('--นาน',   (1.5 + Math.random() * 1.3).toFixed(2) + 's');
      c.style.setProperty('--หมุน',  (Math.random() * 720 - 360).toFixed(0) + 'deg');
      c.style.setProperty('--ขนาด',  (13 + Math.random() * 12).toFixed(0) + 'px');
      ชิ้น.appendChild(c);
    }

    กล่อง.appendChild(ชิ้น);
    // เก็บกวาดทิ้งเมื่อร่วงหมด ไม่ให้ค้างกินหน่วยความจำ
    setTimeout(() => { กล่อง.innerHTML = ''; }, 3200);
  }

  /* ───────────── ตัวละครวิ่งข้ามจอ ─────────────
     ใช้ตอนเล่นสไลด์ ปล่อยทีละตัวห่าง ๆ ให้เป็นลูกเล่นข้างตา
     ไม่ใช่ตัวเอก                                              */

  let นาฬิกาวิ่ง = null;
  const ชุดพันธุ์ = ['หูกลม', 'เขา', 'ปีก'];

  // แต่ละตัวที่วิ่งผ่านแต่งตัวไม่ซ้ำกัน จะได้ไม่รู้สึกว่าเป็นตัวเดิมวนไปมา
  const ชุดแต่ง = [
    { สวม: 'มงกุฎ',  ไอเทม: ['หัวใจ'] },
    { สวม: 'หมวก',   ไอเทม: ['เวทย์', 'โล่'] },
    { สวม: 'ดาบ',    ไอเทม: ['ดาบ'] },
    { สวม: 'ไม้เท้า', คลุม: 'ผ้าคลุม' },
    { สวม: 'โบว์',   ไอเทม: ['หัวใจ', 'เวทย์'] },
  ];

  function ปล่อยวิ่ง(กล่อง) {
    const ตัว = document.createElement('div');
    const ไปขวา = Math.random() < 0.5;

    ตัว.className = 'วิ่ง ' + (ไปขวา ? 'ไปขวา' : 'ไปซ้าย');
    ตัว.innerHTML = ตัวละคร(
      ชุดพันธุ์[(Math.random() * ชุดพันธุ์.length) | 0],
      ชุดแต่ง[(Math.random() * ชุดแต่ง.length) | 0]
    );
    ตัว.style.setProperty('--นาน', (7 + Math.random() * 4).toFixed(1) + 's');
    ตัว.style.setProperty('--สูงจากพื้น', (11 + Math.random() * 12).toFixed(0) + 'vh');
    ตัว.style.setProperty('--โต', (0.8 + Math.random() * 0.45).toFixed(2));

    กล่อง.appendChild(ตัว);
    ตัว.addEventListener('animationend', () => ตัว.remove());
  }

  function เริ่มวิ่ง(กล่อง) {
    if (นาฬิกาวิ่ง) return;
    setTimeout(() => ปล่อยวิ่ง(กล่อง), 1800);
    นาฬิกาวิ่ง = setInterval(() => ปล่อยวิ่ง(กล่อง), 9000);
  }

  function หยุดวิ่ง() {
    clearInterval(นาฬิกาวิ่ง);
    นาฬิกาวิ่ง = null;
  }

  return { ตัวละคร, หกเหลี่ยม, เหรียญ, เริ่มวิ่ง, หยุดวิ่ง };

})();
