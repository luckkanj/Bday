#!/usr/bin/env bash
# อัปเว็บวันเกิดขึ้น GitHub Pages
#
# ใช้: bash อัปขึ้นเว็บ.sh
#
# ต้องรันในหน้าต่างเทอร์มินัลจริง เพราะ git จะถามรหัสผ่านซึ่งต้อง
# พิมพ์แบบซ่อนตัวอักษร ช่องแชทรับไม่ได้
#
# หมายเหตุ: ชื่อตัวแปรในไฟล์นี้เป็นอังกฤษทั้งหมดโดยตั้งใจ
# bash บนเครื่องนี้รับชื่อตัวแปรภาษาไทยไม่ได้ จะขึ้น command not found

set -uo pipefail
cd "$(dirname "$0")" || exit 1

USER_NAME="luckkanj"

pause_exit() { echo; read -r -p "กด Enter เพื่อปิดหน้าต่างนี้ " _; exit "${1:-0}"; }

echo "══════════════════════════════════════════════════════"
echo "  อัปเว็บวันเกิดขึ้น GitHub Pages"
echo "══════════════════════════════════════════════════════"
echo

# ── ตรวจไฟล์ก่อน ──────────────────────────────────────────
echo "▸ ตรวจไฟล์ก่อนส่ง"
if ! python3 ตรวจก่อนส่ง.py > /tmp/ผลตรวจ.txt 2>&1; then
    tail -12 /tmp/ผลตรวจ.txt
    echo
    echo "✘ ตรวจไม่ผ่าน — แก้ก่อนแล้วค่อยรันใหม่"
    pause_exit 1
fi
tail -8 /tmp/ผลตรวจ.txt
echo

# ── ของที่ยังไม่ commit ────────────────────────────────────
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠ มีไฟล์ที่ยังไม่ commit — ของพวกนี้จะไม่ขึ้นเว็บ"
    git -c core.quotepath=false status --short | sed 's/^/    /'
    echo
    read -r -p "  commit ให้เลยไหม (y = เอา / อย่างอื่น = ข้าม): " do_commit
    if [ "$do_commit" = "y" ]; then
        # add -u = เฉพาะไฟล์ที่ติดตามอยู่แล้ว ไม่กวาดไฟล์แปลกปลอมเข้ามา
        git add -u && git commit -q -m "แก้เนื้อหาก่อนอัปขึ้นเว็บ" && echo "  commit แล้ว"
    fi
    echo
fi

# ── remote ────────────────────────────────────────────────
OLD_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
KEEP="n"

if [ -n "$OLD_REMOTE" ]; then
    echo "▸ ตั้ง remote ไว้แล้ว: $OLD_REMOTE"
    read -r -p "  ใช้อันนี้ต่อไหม (y = ใช้ / อย่างอื่น = ตั้งใหม่): " KEEP
    echo
fi

if [ "$KEEP" != "y" ]; then
    echo "▸ ถ้ายังไม่ได้สร้าง repo ให้เปิด  https://github.com/new"
    echo "    ชื่ออะไรก็ได้ที่ดูไม่ออกว่าเป็นอะไร เช่น  oct-notes"
    echo "    เลือก Public  ·  อย่าติ๊ก Add a README"
    echo
    echo "  วางลิงก์ repo ทั้งอันได้เลย หรือจะพิมพ์แค่ชื่อก็ได้"
    read -r -p "  ลิงก์หรือชื่อ repo: " REPO
    # ตัดเอาเฉพาะชื่อ รับได้ทั้ง https://github.com/user/repo.git
    # และ git@github.com:user/repo.git และชื่อเปล่า ๆ
    REPO=$(echo "$REPO" | tr -d '[:space:]' | sed 's|/$||; s|.*[/:]||; s|\.git$||')
    if [ -z "$REPO" ]; then
        echo "✘ ไม่ได้ใส่ชื่อ repo"
        pause_exit 1
    fi
    git remote remove origin 2>/dev/null
    git remote add origin "https://github.com/$USER_NAME/$REPO.git"
    echo "  ตั้ง remote แล้ว"
    echo
fi

REPO=$(git remote get-url origin | sed 's|.*/||; s|\.git$||')

# ── ส่งขึ้น ────────────────────────────────────────────────
echo "▸ กำลังส่งขึ้น GitHub"
echo "    ถ้าถาม Username → พิมพ์  $USER_NAME"
echo "    ถ้าถาม Password → วาง token (ไม่ใช่รหัสผ่าน GitHub)"
echo "    สร้าง token: https://github.com/settings/tokens"
echo "      Generate new token (classic) → ติ๊กช่อง repo → Generate"
echo

if git push -u origin main; then
    echo
    echo "══════════════════════════════════════════════════════"
    echo "  ส่งขึ้นสำเร็จ"
    echo "══════════════════════════════════════════════════════"
    echo
    echo "  เหลืออีกขั้นเดียว เปิดหน้านี้:"
    echo "    https://github.com/$USER_NAME/$REPO/settings/pages"
    echo
    echo "  ตั้ง Source เป็น  main / (root)  แล้วกด Save"
    echo "  รอ 1-2 นาที แล้วลิงก์นี้จะใช้ได้:"
    echo
    echo "    https://$USER_NAME.github.io/$REPO/"
    echo
    echo "  ── อย่าลืม ──"
    echo "  · เปิดบนมือถือตัวเองให้ครบหนึ่งรอบก่อนส่งให้เขา"
    echo "  · ใช้เสร็จแล้วลบ repo ทิ้ง วิธีอยู่ใน README.md"
else
    echo
    echo "✘ ส่งไม่สำเร็จ อ่านข้อความด้านบน"
    echo "    Authentication failed  → token ผิดหรือหมดอายุ"
    echo "    Repository not found   → ชื่อ repo ไม่ตรง หรือยังไม่ได้สร้างบนเว็บ"
    echo "    rejected               → repo มีไฟล์อยู่แล้ว (เผลอติ๊ก Add a README)"
fi

pause_exit 0
