#!/usr/bin/env bash
# อัปเว็บวันเกิดขึ้น GitHub Pages — ล็อกอินด้วยรหัสสั้น 8 ตัว
#
# ใช้: bash อัปด้วยรหัสสั้น.sh
#
# ต่างจาก อัปอัตโนมัติ.sh ตรงที่อันนั้นต้องไปสร้าง token เองแล้วก๊อป
# ข้อความยาว ๆ มาวาง ซึ่งวางยากในหน้าต่างเทอร์มินัล · อันนี้ใช้วิธีของ
# GitHub CLI แทน — จอจะขึ้นรหัสสั้น ๆ แบบ ABCD-1234 ให้พิมพ์ในเบราว์เซอร์
# ไม่ต้องก๊อปอะไรเลย
#
# หมายเหตุ: ชื่อตัวแปรในไฟล์นี้เป็นอังกฤษทั้งหมดโดยตั้งใจ
# bash บนเครื่องนี้รับชื่อตัวแปรภาษาไทยไม่ได้ จะขึ้น command not found

set -uo pipefail
cd "$(dirname "$0")" || exit 1

export PATH="$HOME/bin:$PATH"
export BROWSER="$HOME/bin/open-url.sh"

REPO="Bday"               # คุณเลือกชื่อนี้เอง 28 ก.ย. 2569
                          # เดิมเป็น oct-notes ตั้งใจให้ดูไม่ออกว่าเป็นอะไร
                          # ชื่อนี้จะไปโผล่ในลิงก์ luckkanj.github.io/Bday/

pause_exit() { echo; read -r -p "กด Enter เพื่อปิดหน้าต่างนี้ " _; exit "${1:-0}"; }

echo "══════════════════════════════════════════════════════"
echo "  อัปเว็บวันเกิดขึ้น GitHub Pages"
echo "══════════════════════════════════════════════════════"
echo

# ── ① ตรวจไฟล์ ───────────────────────────────────────────
echo "▸ ① ตรวจไฟล์"
if ! python3 ตรวจก่อนส่ง.py > /tmp/bday-check.txt 2>&1; then
    tail -12 /tmp/bday-check.txt
    echo
    echo "✘ ตรวจไม่ผ่าน — แก้ก่อนแล้วค่อยรันใหม่"
    pause_exit 1
fi
echo "  ผ่าน"

if [ -n "$(git status --porcelain)" ]; then
    echo
    echo "⚠ มีไฟล์ที่ยังไม่ commit — ของพวกนี้จะไม่ขึ้นเว็บ"
    git -c core.quotepath=false status --short | sed 's/^/    /'
    echo
    read -r -p "  ไปต่อเลยไหม (y = ไปต่อ / อย่างอื่น = หยุด): " GO
    [ "$GO" = "y" ] || pause_exit 1
fi
echo

# ── ② ล็อกอิน ────────────────────────────────────────────
echo "▸ ② ล็อกอิน GitHub"

if gh auth status >/dev/null 2>&1; then
    echo "  ล็อกอินค้างไว้อยู่แล้ว"
else
    echo
    echo "  ┌────────────────────────────────────────────────┐"
    echo "  │  เดี๋ยวจอจะขึ้นรหัสสั้น ๆ แบบ  ABCD-1234         │"
    echo "  │  แล้วเบราว์เซอร์จะเปิดเอง                        │"
    echo "  │                                                │"
    echo "  │  ให้ พิมพ์รหัสนั้น ลงในหน้าเว็บ แล้วกด Continue  │"
    echo "  │  ไม่ต้องก๊อปอะไรทั้งนั้น                          │"
    echo "  │                                                │"
    echo "  │  ถ้าเบราว์เซอร์ไม่เปิดเอง ให้เปิดเองที่           │"
    echo "  │    https://github.com/login/device             │"
    echo "  └────────────────────────────────────────────────┘"
    echo
    echo "  ตรงคำถามข้างล่างนี้ กด Enter ผ่านไปได้เลย"
    echo

    if ! gh auth login --hostname github.com --git-protocol https --web --scopes repo; then
        echo
        echo "✘ ล็อกอินไม่สำเร็จ"
        pause_exit 1
    fi
fi

OWNER=$(gh api user --jq .login 2>/dev/null)
if [ -z "$OWNER" ]; then
    echo "✘ อ่านชื่อบัญชีไม่ได้"
    pause_exit 1
fi
echo
echo "  เข้าในนามบัญชี: $OWNER"
echo

# ── ③ สร้าง repo ─────────────────────────────────────────
echo "▸ ③ สร้าง repo  $OWNER/$REPO"

if gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
    echo "  มีอยู่แล้ว ใช้อันเดิม"
elif gh repo create "$REPO" --public --disable-issues --disable-wiki >/dev/null 2>&1; then
    echo "  สร้างแล้ว"
else
    echo "✘ สร้างไม่สำเร็จ"
    pause_exit 1
fi
echo

# ── ④ ส่งไฟล์ขึ้น ────────────────────────────────────────
echo "▸ ④ ส่งไฟล์ขึ้น"

# remote เดิมชื่อเป็นภาษาไทย ใช้ไม่ได้ ตั้งใหม่ให้ตรงกับ repo จริง
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/$OWNER/$REPO.git"
git branch -M main

if ! git push -u origin main 2>&1 | sed 's/^/    /'; then
    echo
    echo "✘ ส่งไม่สำเร็จ อ่านข้อความด้านบน"
    pause_exit 1
fi
echo

# ── ⑤ เปิด GitHub Pages ──────────────────────────────────
echo "▸ ⑤ เปิด GitHub Pages"

if gh api -X POST "repos/$OWNER/$REPO/pages" \
        -f 'source[branch]=main' -f 'source[path]=/' >/dev/null 2>&1; then
    echo "  เปิดแล้ว"
elif gh api "repos/$OWNER/$REPO/pages" >/dev/null 2>&1; then
    echo "  เปิดไว้อยู่แล้ว"
else
    echo "  ⚠ เปิดอัตโนมัติไม่ได้"
    echo "    เปิดเองที่ https://github.com/$OWNER/$REPO/settings/pages"
    echo "    ตั้ง Source เป็น main / (root) แล้วกด Save"
fi
echo

# ── ⑥ รอให้ลิงก์ใช้ได้จริง ───────────────────────────────
LINK="https://$OWNER.github.io/$REPO/"
echo "▸ ⑥ รอ GitHub สร้างหน้าเว็บ (ปกติ 1-2 นาที)"

READY="n"
for i in $(seq 1 40); do
    sleep 10
    if [ "$(curl -s -o /dev/null -w '%{http_code}' -L "$LINK")" = "200" ]; then
        READY="y"; break
    fi
    printf '\r    รอมา %s วินาที...' "$((i * 10))"
done
printf '\r%-40s\r' ' '

echo
echo "══════════════════════════════════════════════════════"
if [ "$READY" = "y" ]; then
    echo "  เสร็จแล้ว ลิงก์ใช้ได้เลย"
else
    echo "  ส่งขึ้นเรียบร้อย แต่ลิงก์ยังไม่ขึ้น รออีกสักครู่แล้วลองเปิดดู"
fi
echo "══════════════════════════════════════════════════════"
echo
echo "    $LINK"
echo
echo "  ── ก่อนส่งให้เขา ──"
echo "  · เปิดบนมือถือตัวเองให้ครบหนึ่งรอบก่อน"
echo
echo "  ── หลังวันเกิด ──"
echo "  · repo เป็นสาธารณะ ใช้เสร็จแล้วลบทิ้ง"
echo "    https://github.com/$OWNER/$REPO/settings"
echo "    เลื่อนล่างสุด → Delete this repository"
echo "  · ตัดสิทธิ์ GitHub CLI ทิ้งด้วยที่"
echo "    https://github.com/settings/applications"
echo

pause_exit 0
