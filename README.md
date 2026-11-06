# CheckMaster — یادآور چک و اقساط

برنامه‌ی موبایل برای ثبت و پیگیری **چک‌ها** و **اقساط**، با یادآوری سررسید، گزارش نموداری و تقویم شمسی.
همه‌ی اطلاعات فقط روی گوشی خودت ذخیره می‌شود؛ حساب کاربری و سرور ندارد.

## امکانات

- ثبت چک (بانک، مبلغ، تاریخ شمسی، وضعیت: در انتظار / وصول‌شده / برگشتی)
- پرونده‌ی اقساط برای هر شخص، ثبت پرداخت و برگشت پرداخت
- اعلان یادآوری قبل از سررسید و در روز سررسید (۰، ۱، ۳ یا ۷ روز قبل، قابل تنظیم)
- بخش «سررسیدهای ۷ روز آینده» در صفحه‌ی اصلی
- گزارش‌ها و نمودار
- پشتیبان‌گیری و بازیابی اطلاعات (فایل JSON)
- حالت تیره و روشن
- دکمه‌ی برگشت گوشی: داخل برنامه یک مرحله عقب می‌رود و فقط از صفحه‌ی اصلی خارج می‌شود

## تکنولوژی‌ها

React 18 · Vite · Tailwind CSS 4 · Zustand · React Router · Recharts · Capacitor 6 (اندروید)

## اجرا روی کامپیوتر

```bash
npm install
npm run dev
```

## ساخت APK (بدون Android Studio)

پروژه را روی گیت‌هاب push کن. workflow داخل `.github/workflows/build-apk.yml` خودکار APK می‌سازد:

1. تب **Actions** ← آخرین اجرای «Build Android APK»
2. پایین صفحه، بخش **Artifacts** ← `CheckMaster-debug-apk` را دانلود کن
3. زیپ را باز کن و `app-debug.apk` را روی گوشی نصب کن

همه‌ی نسخه‌های debug با یک کلید ثابت امضا می‌شوند، پس نسخه‌ی جدید روی قبلی نصب می‌شود (بدون پاک کردن برنامه).

## نسخه‌ی انتشار (بازار / مایکت)

برای ساخت APK امضاشده با کلید خودت:

1. یک بار کلید بساز (فایل و رمزش را جایی امن نگه دار؛ اگر گم شود نمی‌توانی آپدیت بدهی):
   ```bash
   keytool -genkeypair -v -keystore release.keystore -alias checkmaster -keyalg RSA -keysize 2048 -validity 10000
   ```
2. فایل را به base64 تبدیل کن (PowerShell):
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("release.keystore")) | Set-Clipboard
   ```
3. در گیت‌هاب: **Settings ← Secrets and variables ← Actions ← New repository secret** و این چهار مورد را بساز:

   | نام | مقدار |
   |---|---|
   | `SIGNING_KEY` | همان متن base64 |
   | `KEY_ALIAS` | `checkmaster` |
   | `KEY_STORE_PASSWORD` | رمز keystore |
   | `KEY_PASSWORD` | رمز کلید |

4. push بعدی، علاوه بر debug، یک **`CheckMaster-release-apk`** هم می‌سازد.

## حریم خصوصی

برنامه هیچ اطلاعاتی را به اینترنت نمی‌فرستد؛ چک‌ها و اقساط فقط روی دستگاه شما می‌مانند.

## ارتباط

تلگرام: [@Z_QQ_S](https://t.me/Z_QQ_S)
