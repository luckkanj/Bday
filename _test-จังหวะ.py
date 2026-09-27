"""สร้างหน้าวัดจังหวะจาก index.html ตัวจริง แล้วรายงานเวลาที่รูปแรกโผล่

ทำไมต้องมีไฟล์นี้ — จะวัดจากหน้าจริงตรง ๆ ไม่ได้ เพราะเบราว์เซอร์แบบ headless
เดินนาฬิกาเสมือนได้เฉพาะตอนที่หน้าว่าง แต่พลุวนลูป rAF ไม่หยุด นาฬิกาเลยค้าง
วิธีนี้จึงสลับเฉพาะ "เครื่องยนต์พลุ" เป็นตัวเปล่า ส่วน app.js / content.js
กับรูปจริงยังเป็นของจริงทั้งหมด จังหวะเวลาที่วัดได้จึงเป็นของจริง

ใช้: python3 _test-จังหวะ.py   (ต้องเปิด python3 -m http.server 8899 ไว้ก่อน)
ไฟล์ที่สร้างเป็นของชั่วคราว ลบทิ้งเองตอนจบ
"""

import pathlib
import re
import subprocess
import urllib.parse
import urllib.request

ที่นี่ = pathlib.Path(__file__).parent
EDGE = "/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
ปลายทางวิน = r"C:\Users\luckkanj\AppData\Local\Temp\bday-check"

พลุเปล่า = """<script>
  // ตัวแทนของ js/fireworks.js — หน้าตาเหมือนกันแต่ไม่วาดอะไร ไม่กิน rAF
  window.พลุ = { เริ่ม(){}, ชุดใหญ่(){}, เบา(){}, หยุด(){} };
</script>"""

ตัววัด = """<script>
  /* ต้องวางก่อน app.js เพื่อให้เห็นการเปลี่ยนคลาสครั้งแรกสุด */
  (function () {
    const จุด = {};
    const จำ = (ชื่อ) => { if (จุด[ชื่อ] == null) จุด[ชื่อ] = performance.now(); };

    function รายงาน() {
      const t0 = จุด['พลุ'];
      const แถว = ['พลุ', 'สไลด์', 'รูปแรก']
        .map((k) => k + ' ' + ((จุด[k] - t0) / 1000).toFixed(2) + 's')
        .join('  |  ');
      const กล่อง = document.createElement('div');
      กล่อง.style.cssText =
        'position:fixed;inset:0;z-index:99999;background:#fff;color:#000;' +
        'font:700 26px monospace;padding:40px';
      กล่อง.textContent = 'วัดได้ >> ' + แถว + ' <<';
      document.body.appendChild(กล่อง);
    }

    new MutationObserver(() => {
      if (document.getElementById('ฉาก-พลุ').classList.contains('แสดง')) จำ('พลุ');
      if (document.getElementById('ฉาก-สไลด์').classList.contains('แสดง')) จำ('สไลด์');
      if (document.querySelector('.สไลด์-ใบ.แสดง') && จุด['รูปแรก'] == null) {
        จำ('รูปแรก');
        setTimeout(รายงาน, 50);
      }
    }).observe(document.documentElement, {
      subtree: true, attributes: true, attributeFilter: ['class'], childList: true,
    });
  })();
</script>"""


def สร้างหน้า():
    ต้นฉบับ = (ที่นี่ / "index.html").read_text(encoding="utf-8")
    หน้า = ต้นฉบับ.replace('<script src="js/fireworks.js"></script>', พลุเปล่า)
    assert พลุเปล่า in หน้า, "ไม่เจอแท็ก fireworks.js ใน index.html"
    แท็กแอป = '<script src="js/app.js"></script>'
    assert แท็กแอป in หน้า, "ไม่เจอแท็ก app.js ใน index.html"
    หน้า = หน้า.replace(แท็กแอป, ตัววัด + "\n" + แท็กแอป)
    (ที่นี่ / "_test-จังหวะ.html").write_text(หน้า, encoding="utf-8")


def วัด(ฉากเริ่ม):
    หน้า = "_test-%E0%B8%88%E0%B8%B1%E0%B8%87%E0%B8%AB%E0%B8%A7%E0%B8%B0.html"
    ลัด = urllib.parse.quote(ฉากเริ่ม)
    url = f"http://localhost:8899/{หน้า}?%E0%B8%94%E0%B8%B9={ลัด}"
    subprocess.run([
        EDGE, "--headless=new", "--disable-gpu", "--no-sandbox",
        "--window-size=390,844", "--virtual-time-budget=60000",
        "--no-pdf-header-footer",
        rf"--print-to-pdf={ปลายทางวิน}\jangwa.pdf", url,
    ], capture_output=True)

    import pymupdf
    d = pymupdf.open("/mnt/c/Users/luckkanj/AppData/Local/Temp/bday-check/jangwa.pdf")
    ทั้งหน้า = " ".join(d[0].get_text().split())
    ผล = re.search(r"วัดได้ >>(.+?)<<", ทั้งหน้า)
    return ผล.group(1).strip() if ผล else None


if __name__ == "__main__":
    urllib.request.urlopen("http://localhost:8899/index.html").read()
    สร้างหน้า()
    for ฉาก in ("สามดาว", "พลุ"):
        print(f"เริ่มที่ฉาก {ฉาก:8s}:", วัด(ฉาก) or "(ตัววัดไม่ทำงาน)")
