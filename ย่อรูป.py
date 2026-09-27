#!/usr/bin/env python3
"""
ย่อรูปสำหรับเว็บวันเกิด

วิธีใช้
  1. ก๊อปรูปจากมือถือมาวางในโฟลเดอร์  _ต้นฉบับ/
     ตั้งชื่อนำหน้าด้วยเลขเพื่อกำหนดลำดับก็ได้ เช่น 1-เจอกันครั้งแรก.jpg
  2. รัน:  python3 ย่อรูป.py
  3. สคริปต์จะสร้าง img/01.jpg, img/02.jpg ... ให้อัตโนมัติ
     แล้วพิมพ์บล็อกโค้ดให้ก๊อปไปวางใน content.js

ทำไมต้องย่อ
  รูปจากมือถือใบละ 3-5 MB ถ้าอัปดิบ ๆ ขึ้นเว็บ คนเปิดบนเน็ตมือถือจะรอนาน
  ย่อแล้วเหลือใบละประมาณ 200 KB ตาเปล่าดูไม่ออกว่าต่างกัน

  และ iPhone ชอบบันทึกรูปตะแคงแล้วฝากมุมหมุนไว้ใน EXIF
  ถ้าไม่จัดการ รูปจะนอนบนเว็บ สคริปต์นี้หมุนให้ตั้งแต่ตอนย่อ
"""

import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("ไม่มี Pillow — ติดตั้งด้วย:  pip install --user --break-system-packages Pillow")

ที่นี่     = Path(__file__).resolve().parent
ต้นฉบับ   = ที่นี่ / "_ต้นฉบับ"
ปลายทาง   = ที่นี่ / "img"

กว้างสุด  = 1400      # พอสำหรับจอมือถือความละเอียดสูง
คุณภาพ    = 82        # 82 คือจุดที่ไฟล์เล็กแต่ตายังดูไม่ออก
นามสกุล   = {".jpg", ".jpeg", ".png", ".heic", ".webp", ".bmp"}


def main() -> int:
    if not ต้นฉบับ.is_dir():
        print(f"ไม่พบโฟลเดอร์ {ต้นฉบับ.name}/ — สร้างให้แล้ว เอารูปไปวางแล้วรันใหม่")
        ต้นฉบับ.mkdir(exist_ok=True)
        return 1

    รูป = sorted(
        [f for f in ต้นฉบับ.iterdir() if f.suffix.lower() in นามสกุล],
        key=lambda f: f.name.lower(),
    )

    if not รูป:
        print(f"ไม่มีรูปใน {ต้นฉบับ.name}/ เลย")
        return 1

    ปลายทาง.mkdir(exist_ok=True)
    สำเร็จ = []

    for ลำดับ, ไฟล์ in enumerate(รูป, start=1):
        ชื่อออก = f"{ลำดับ:02d}.jpg"
        try:
            with Image.open(ไฟล์) as im:
                im = ImageOps.exif_transpose(im)      # หมุนตามที่ EXIF บอก
                im = im.convert("RGB")                # ทิ้งชั้นโปร่งใส ไม่งั้นเซฟ jpg ไม่ได้

                if im.width > กว้างสุด:
                    สูงใหม่ = round(im.height * กว้างสุด / im.width)
                    im = im.resize((กว้างสุด, สูงใหม่), Image.LANCZOS)

                im.save(ปลายทาง / ชื่อออก, "JPEG",
                        quality=คุณภาพ, optimize=True, progressive=True)

        except Exception as ผิด:
            print(f"  ✘ {ไฟล์.name} — {ผิด}")
            continue

        เดิม = ไฟล์.stat().st_size / 1024
        ใหม่ = (ปลายทาง / ชื่อออก).stat().st_size / 1024
        print(f"  ✔ {ไฟล์.name}  →  img/{ชื่อออก}   {เดิม:.0f} KB → {ใหม่:.0f} KB")
        สำเร็จ.append((ชื่อออก, ไฟล์.stem))

    if not สำเร็จ:
        print("\nไม่มีรูปไหนย่อสำเร็จเลย")
        return 1

    print(f"\nย่อเสร็จ {len(สำเร็จ)} รูป")
    print("\n" + "─" * 62)
    print("ก๊อปบล็อกนี้ไปวางทับส่วน  สไลด์:  ใน content.js")
    print("แล้วเติมข้อความในช่อง หัว: กับ รอง: เอาเอง")
    print("─" * 62 + "\n")

    print("  สไลด์: [")
    for ชื่อออก, เดิม in สำเร็จ:
        print(f'    {{ รูป: "img/{ชื่อออก}", หัว: "", รอง: "", วินาที: 6 }},'
              f'   // {เดิม}')
    print("  ],\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
