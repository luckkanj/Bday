#!/usr/bin/env python3
"""
เตรียมรูปและวิดีโอสำหรับเว็บวันเกิด

วิธีใช้
  1. เอารูปและคลิปจากมือถือมาวางใน  _ต้นฉบับ/
     ตั้งชื่อนำหน้าด้วยเลขเพื่อกำหนดลำดับ เช่น 1-เจอกัน.jpg  2-ทะเล.MOV
  2. รัน:  python3 เตรียมสื่อ.py
  3. สคริปต์สร้าง img/01.jpg · vid/02.mp4 ... ให้ตามลำดับชื่อไฟล์
     แล้วพิมพ์บล็อกโค้ดให้ก๊อปไปวางใน content.js

ทำไมต้องแปลง

  รูป — จากมือถือใบละ 3-5 MB อัปดิบ ๆ แล้วคนเปิดบนเน็ตมือถือรอนาน
        ย่อแล้วเหลือ ~200 KB ตาเปล่าดูไม่ออกว่าต่างกัน
        และไอโฟนชอบบันทึกรูปตะแคงโดยฝากมุมหมุนไว้ใน EXIF ต้องหมุนให้ตั้งแต่ตอนย่อ

  วิดีโอ — คลิปไอโฟนเป็น HEVC ซึ่ง Chrome บน Android เปิดไม่ขึ้น เห็นเป็นจอดำ
        ต้องแปลงเป็น H.264 · ตัดเสียงทิ้ง (มือถืออนุญาตให้เล่นเองเฉพาะคลิปเงียบ
        และเรามีเพลงประกอบอยู่แล้ว) · ใส่ faststart ให้เริ่มเล่นได้ก่อนโหลดจบ
"""

import shutil
import subprocess
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("ไม่มี Pillow — ติดตั้งด้วย:  pip install --user --break-system-packages Pillow")

ที่นี่   = Path(__file__).resolve().parent
ต้นฉบับ = ที่นี่ / "_ต้นฉบับ"
รูปออก  = ที่นี่ / "img"
คลิปออก = ที่นี่ / "vid"

กว้างสุดรูป  = 1400
คุณภาพรูป    = 82
กว้างสุดคลิป = 1280
เตือนถ้ายาวเกิน = 12      # วินาที

นามสกุลรูป  = {".jpg", ".jpeg", ".png", ".heic", ".webp", ".bmp"}
นามสกุลคลิป = {".mov", ".mp4", ".m4v", ".avi", ".mkv", ".3gp", ".webm"}


def ความยาวคลิป(ไฟล์: Path):
    """คืนความยาวเป็นวินาที หรือ None ถ้าอ่านไม่ได้"""
    if not shutil.which("ffprobe"):
        return None
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", str(ไฟล์)],
            capture_output=True, text=True, timeout=60,
        )
        return float(out.stdout.strip())
    except Exception:
        return None


def ทำรูป(ไฟล์: Path, ชื่อออก: str) -> bool:
    try:
        with Image.open(ไฟล์) as im:
            im = ImageOps.exif_transpose(im)        # หมุนตามที่ EXIF บอก
            im = im.convert("RGB")                  # ทิ้งชั้นโปร่งใส ไม่งั้นเซฟ jpg ไม่ได้
            if im.width > กว้างสุดรูป:
                สูงใหม่ = round(im.height * กว้างสุดรูป / im.width)
                im = im.resize((กว้างสุดรูป, สูงใหม่), Image.LANCZOS)
            im.save(รูปออก / ชื่อออก, "JPEG",
                    quality=คุณภาพรูป, optimize=True, progressive=True)
        return True
    except Exception as ผิด:
        print(f"  ✘ {ไฟล์.name} — {ผิด}")
        return False


def ทำคลิป(ไฟล์: Path, ชื่อออก: str) -> bool:
    คำสั่ง = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-i", str(ไฟล์),
        # -2 คือให้คำนวณความสูงเองโดยบังคับให้เป็นเลขคู่ (H.264 ต้องการ)
        "-vf", f"scale=min({กว้างสุดคลิป}\\,iw):-2",
        "-c:v", "libx264", "-preset", "slow", "-crf", "28",
        "-pix_fmt", "yuv420p",        # ขาดอันนี้ Safari เล่นไม่ได้
        "-movflags", "+faststart",    # เริ่มเล่นได้ก่อนโหลดจบ
        "-an",                        # ตัดเสียงทิ้ง
        str(คลิปออก / ชื่อออก),
    ]
    try:
        ผล = subprocess.run(คำสั่ง, capture_output=True, text=True, timeout=900)
        if ผล.returncode != 0:
            print(f"  ✘ {ไฟล์.name} — ffmpeg ล้มเหลว\n     {ผล.stderr.strip()[:300]}")
            return False
        return True
    except FileNotFoundError:
        print("  ✘ ไม่มี ffmpeg — ติดตั้งด้วย:  sudo apt install ffmpeg")
        return False
    except subprocess.TimeoutExpired:
        print(f"  ✘ {ไฟล์.name} — แปลงนานเกิน 15 นาที ข้ามไป")
        return False


def main() -> int:
    if not ต้นฉบับ.is_dir():
        ต้นฉบับ.mkdir(exist_ok=True)
        print(f"สร้างโฟลเดอร์ {ต้นฉบับ.name}/ ให้แล้ว เอารูปกับคลิปไปวางแล้วรันใหม่")
        return 1

    สื่อ = sorted(
        [f for f in ต้นฉบับ.iterdir()
         if f.suffix.lower() in นามสกุลรูป | นามสกุลคลิป],
        key=lambda f: f.name.lower(),
    )
    if not สื่อ:
        print(f"ไม่มีรูปหรือคลิปใน {ต้นฉบับ.name}/ เลย")
        return 1

    มีคลิป = any(f.suffix.lower() in นามสกุลคลิป for f in สื่อ)
    if มีคลิป and not shutil.which("ffmpeg"):
        print("พบไฟล์วิดีโอ แต่เครื่องนี้ยังไม่มี ffmpeg")
        print("ติดตั้งก่อนด้วย:  sudo apt install ffmpeg")
        return 1

    รูปออก.mkdir(exist_ok=True)
    คลิปออก.mkdir(exist_ok=True)

    # ล้างผลลัพธ์รอบก่อนทิ้งก่อนเสมอ
    # ถ้าไม่ล้าง พอเพิ่มหรือลบไฟล์แล้วเลขลำดับขยับ ของรอบเก่าจะค้างอยู่
    # แล้วถูกอัปขึ้นเว็บทั้งที่ไม่มีใครเรียกใช้ กินพื้นที่เปล่า ๆ
    เก่า = [f for f in list(รูปออก.iterdir()) + list(คลิปออก.iterdir())
            if f.is_file() and f.suffix.lower() in {".jpg", ".mp4"}]
    for f in เก่า:
        f.unlink()
    if เก่า:
        print(f"ล้างผลลัพธ์รอบก่อน {len(เก่า)} ไฟล์\n")

    สำเร็จ = []

    for ลำดับ, ไฟล์ in enumerate(สื่อ, start=1):
        เป็นคลิป = ไฟล์.suffix.lower() in นามสกุลคลิป
        ชื่อออก = f"{ลำดับ:02d}." + ("mp4" if เป็นคลิป else "jpg")
        ปลาย = (คลิปออก if เป็นคลิป else รูปออก) / ชื่อออก

        if เป็นคลิป:
            วินาที = ความยาวคลิป(ไฟล์)
            if วินาที and วินาที > เตือนถ้ายาวเกิน:
                print(f"  ⚠ {ไฟล์.name} ยาว {วินาที:.0f} วินาที — "
                      f"ยาวกว่า {เตือนถ้ายาวเกิน} วิจะทำให้จังหวะเว็บยืด "
                      f"ควรตัดให้สั้นลงก่อน")
            print(f"  … กำลังแปลง {ไฟล์.name} (อาจใช้เวลาสักครู่)")
            ok = ทำคลิป(ไฟล์, ชื่อออก)
        else:
            ok = ทำรูป(ไฟล์, ชื่อออก)

        if not ok:
            continue

        เดิม = ไฟล์.stat().st_size / 1024
        ใหม่ = ปลาย.stat().st_size / 1024
        ชนิด = "vid" if เป็นคลิป else "img"
        print(f"  ✔ {ไฟล์.name}  →  {ชนิด}/{ชื่อออก}   "
              f"{เดิม:,.0f} KB → {ใหม่:,.0f} KB")
        สำเร็จ.append((เป็นคลิป, ชื่อออก, ไฟล์.stem,
                       ความยาวคลิป(ไฟล์) if เป็นคลิป else None))

    if not สำเร็จ:
        print("\nไม่มีไฟล์ไหนแปลงสำเร็จเลย")
        return 1

    รวมขนาด = sum((คลิปออก if c else รูปออก).joinpath(n).stat().st_size
                  for c, n, _, _ in สำเร็จ) / 1024 / 1024
    print(f"\nเสร็จ {len(สำเร็จ)} ไฟล์ · รวม {รวมขนาด:.1f} MB")
    if รวมขนาด > 8:
        print("⚠ เกิน 8 MB แล้ว คนเปิดบนเน็ตมือถืออาจรอนาน "
              "ลองลดจำนวนคลิปหรือตัดให้สั้นลง")

    print("\n" + "─" * 64)
    print("ก๊อปบล็อกนี้ไปวางทับส่วน  สไลด์:  ใน content.js")
    print("แล้วเติมข้อความในช่อง หัว: กับ รอง: เอาเอง")
    print("─" * 64 + "\n")

    print("  สไลด์: [")
    for เป็นคลิป, ชื่อออก, เดิม, วินาที in สำเร็จ:
        if เป็นคลิป:
            นาน = max(4, round(วินาที)) if วินาที else 8
            print(f'    {{ วิดีโอ: "vid/{ชื่อออก}", หัว: "", รอง: "", '
                  f'วินาที: {นาน} }},   // {เดิม}')
        else:
            print(f'    {{ รูป: "img/{ชื่อออก}", หัว: "", รอง: "", '
                  f'วินาที: 6 }},   // {เดิม}')
    print("  ],\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
