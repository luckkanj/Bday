#!/usr/bin/env bash
# อัปเว็บวันเกิดขึ้น GitHub Pages — แบบไม่ต้องตอบคำถาม
#
# ใช้: bash อัปอัตโนมัติ.sh
#
# ต่างจาก อัปขึ้นเว็บ.sh ตรงที่อันนั้นถามทีละขั้นให้เลือกเอง ส่วนอันนี้
# ขอ token อย่างเดียวแล้วทำที่เหลือให้หมด — สร้าง repo · push ·
# เปิด GitHub Pages · บอกลิงก์ ไม่ต้องไปคลิกอะไรในหน้าเว็บอีก
#
# ต้องรันในหน้าต่างเทอร์มินัลจริง เพราะการพิมพ์ token ต้องซ่อนตัวอักษร
# ช่องแชทรับไม่ได้
#
# หมายเหตุ: ชื่อตัวแปรในไฟล์นี้เป็นอังกฤษทั้งหมดโดยตั้งใจ
# bash บนเครื่องนี้รับชื่อตัวแปรภาษาไทยไม่ได้ จะขึ้น command not found

set -uo pipefail
cd "$(dirname "$0")" || exit 1

USER_NAME="luckkanj"
REPO="oct-notes"          # ชื่อกลาง ๆ ดูไม่ออกว่าเป็นอะไร
API="https://api.github.com"

pause_exit() { echo; read -r -p "กด Enter เพื่อปิดหน้าต่างนี้ " _; exit "${1:-0}"; }

# ── ที่เก็บ token ชั่วคราว ────────────────────────────────
# ห้ามส่ง token ไปทาง argument ของคำสั่ง เพราะคนอื่นในเครื่องเห็นได้ด้วย ps
# จึงเก็บใส่ไฟล์ชั่วคราวสิทธิ์ 600 แล้วให้ curl กับ git อ่านจากไฟล์แทน
WORK_DIR=$(mktemp -d)
chmod 700 "$WORK_DIR"
trap 'rm -rf "$WORK_DIR"' EXIT

CURL_CONF="$WORK_DIR/curl.conf"
ASKPASS="$WORK_DIR/askpass.sh"

echo "══════════════════════════════════════════════════════"
echo "  อัปเว็บวันเกิดขึ้น GitHub Pages"
echo "══════════════════════════════════════════════════════"
echo

# ── ① ตรวจไฟล์ก่อน ───────────────────────────────────────
echo "▸ ① ตรวจไฟล์"
if ! python3 ตรวจก่อนส่ง.py > "$WORK_DIR/check.txt" 2>&1; then
    tail -12 "$WORK_DIR/check.txt"
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

# ── ② ขอ token ───────────────────────────────────────────
echo "▸ ② ขอ token"
echo
echo "  เปิดลิงก์นี้ในเบราว์เซอร์ (ช่องต่าง ๆ กรอกมาให้แล้ว):"
echo
echo "    https://github.com/settings/tokens/new?scopes=repo&description=bday"
echo
echo "  เลื่อนลงล่างสุด → กดปุ่มเขียว Generate token"
echo "  แล้วก๊อปข้อความยาว ๆ ที่ขึ้นมา (ขึ้นต้นด้วย ghp_) มาวางตรงนี้"
echo "  ตอนวางจะไม่เห็นตัวอักษรใด ๆ บนจอ เป็นเรื่องปกติ วางแล้วกด Enter ได้เลย"
echo
read -r -s -p "  วาง token: " TOKEN
echo
TOKEN=$(printf '%s' "$TOKEN" | tr -d '[:space:]')

if [ -z "$TOKEN" ]; then
    echo "✘ ไม่ได้ใส่ token"
    pause_exit 1
fi

umask 077
printf 'header = "Authorization: Bearer %s"\nsilent\nshow-error\n' "$TOKEN" > "$CURL_CONF"
# git จะเรียกสคริปต์นี้แทนการถามรหัสผ่านทางหน้าจอ
{
    printf '#!/usr/bin/env bash\n'
    printf 'case "$1" in\n'
    printf '  *[Uu]sername*) printf %%s %q ;;\n' "$USER_NAME"
    printf '  *)             printf %%s %q ;;\n' "$TOKEN"
    printf 'esac\n'
} > "$ASKPASS"
chmod 700 "$ASKPASS"

# เช็คว่า token ใช้ได้จริงและเป็นของใคร
WHO=$(curl --config "$CURL_CONF" -s "$API/user" | python3 -c \
    'import json,sys; print(json.load(sys.stdin).get("login",""))' 2>/dev/null)

if [ -z "$WHO" ]; then
    echo
    echo "✘ token ใช้ไม่ได้ — อาจก๊อปมาไม่ครบ หรือลืมติ๊กช่อง repo"
    pause_exit 1
fi
echo "  ใช้ได้ · บัญชี $WHO"
USER_NAME="$WHO"
echo

# ── ③ สร้าง repo ─────────────────────────────────────────
echo "▸ ③ สร้าง repo  $USER_NAME/$REPO"

CODE=$(curl --config "$CURL_CONF" -s -o "$WORK_DIR/repo.json" -w '%{http_code}' \
    -X POST "$API/user/repos" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$REPO\",\"private\":false,\"auto_init\":false,\"has_issues\":false,\"has_wiki\":false,\"description\":\"\"}")

if [ "$CODE" = "201" ]; then
    echo "  สร้างแล้ว"
elif [ "$CODE" = "422" ]; then
    echo "  มีอยู่แล้ว ใช้อันเดิม"
else
    echo
    echo "✘ สร้างไม่สำเร็จ (HTTP $CODE)"
    python3 -c 'import json,sys; print("   ",json.load(sys.stdin).get("message",""))' \
        < "$WORK_DIR/repo.json" 2>/dev/null
    pause_exit 1
fi
echo

# ── ④ push ───────────────────────────────────────────────
echo "▸ ④ ส่งไฟล์ขึ้น"

# remote เดิมชื่อเป็นภาษาไทย ใช้ไม่ได้ ตั้งใหม่ทุกครั้งให้ตรงกับ repo จริง
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/$USER_NAME/$REPO.git"
git branch -M main

if ! GIT_ASKPASS="$ASKPASS" GIT_TERMINAL_PROMPT=0 git push -u origin main 2>&1 | sed 's/^/    /'; then
    echo
    echo "✘ ส่งไม่สำเร็จ อ่านข้อความด้านบน"
    pause_exit 1
fi
echo

# ── ⑤ เปิด GitHub Pages ──────────────────────────────────
echo "▸ ⑤ เปิด GitHub Pages"

CODE=$(curl --config "$CURL_CONF" -s -o /dev/null -w '%{http_code}' \
    -X POST "$API/repos/$USER_NAME/$REPO/pages" \
    -H "Content-Type: application/json" \
    -d '{"source":{"branch":"main","path":"/"}}')

case "$CODE" in
    201|204) echo "  เปิดแล้ว" ;;
    409)     echo "  เปิดไว้อยู่แล้ว" ;;
    *)       echo "  ⚠ เปิดอัตโนมัติไม่ได้ (HTTP $CODE)"
             echo "    เปิดเองที่ https://github.com/$USER_NAME/$REPO/settings/pages"
             echo "    ตั้ง Source เป็น main / (root) แล้วกด Save" ;;
esac
echo

# ── ⑥ รอให้ลิงก์ใช้ได้จริง ───────────────────────────────
LINK="https://$USER_NAME.github.io/$REPO/"
echo "▸ ⑥ รอ GitHub สร้างหน้าเว็บ (ปกติ 1-2 นาที)"

READY="n"
for i in $(seq 1 40); do
    sleep 10
    HTTP=$(curl -s -o /dev/null -w '%{http_code}' -L "$LINK")
    if [ "$HTTP" = "200" ]; then READY="y"; break; fi
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
echo "    https://github.com/$USER_NAME/$REPO/settings"
echo "    เลื่อนล่างสุด → Delete this repository"
echo "  · แล้วลบ token ทิ้งด้วยที่ https://github.com/settings/tokens"
echo

pause_exit 0
