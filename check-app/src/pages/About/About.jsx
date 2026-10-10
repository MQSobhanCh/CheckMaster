import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Store,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Bell,
  BarChart3,
  Mail,
  Phone,
  Globe,
  Heart,
} from "lucide-react";

const FEATURES = [
  {
    icon: <ShieldCheck size={20} className="text-green-400" />,
    title: "ثبت و پیگیری چک‌ها",
    desc: "وضعیت هر چک (در انتظار، وصول‌شده، برگشتی) رو دقیق دنبال کن.",
  },
  {
    icon: <Smartphone size={20} className="text-green-400" />,
    title: "مدیریت اقساط",
    desc: "برنامه‌ی اقساطی هر شخص رو بساز و پرداخت‌ها رو ثبت کن.",
  },
  {
    icon: <Bell size={20} className="text-green-400" />,
    title: "یادآوری هوشمند",
    desc: "یک روز قبل از سررسید هر چک یا قسط، اعلان دریافت می‌کنی.",
  },
  {
    icon: <BarChart3 size={20} className="text-green-400" />,
    title: "گزارش‌های کامل",
    desc: "نمای کلی و نموداری از وضعیت مالی‌ات همیشه در دسترسه.",
  },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16 text-slate-900 dark:text-white"
    >
      <div className="mx-auto max-w-2xl p-5">
        {/* Header */}

        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 transition hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <ArrowRight size={20} />
          </button>

          <h1 className="text-2xl font-bold">درباره ما</h1>
        </div>

        {/* Hero */}

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-100 via-slate-50 to-green-50 dark:from-slate-900 dark:via-slate-900 dark:to-green-950 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/15 border border-green-500/30">
            <Store size={30} className="text-green-400" />
          </div>

          <h2 className="text-xl font-bold">CheckMaster</h2>

          <p className="mt-2 text-sm text-slate-500">
            یادآور هوشمند چک و اقساط — ساده، سریع و همیشه همراهت
          </p>

          <p className="mt-4 text-sm leading-7 text-slate-500">
            CheckMaster برای این ساخته شده که دیگه هیچ‌وقت سررسید یه چک یا
            یه قسط رو فراموش نکنی. همه‌چیز رو یک‌جا ثبت کن، وضعیتشون رو
            دنبال کن و با خیال راحت مدیریتشون کن.
          </p>
        </div>

        {/* Features */}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                {item.icon}
              </div>

              <h3 className="font-bold">{item.title}</h3>

              <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Team / contact — replace with your own info */}

        <div className="mt-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="mb-4 flex items-center gap-3">
            <Sparkles size={20} className="text-green-400" />
            <h2 className="font-bold">سازنده</h2>
          </div>

          <p className="text-sm text-slate-500">
            این برنامه توسط{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              [اسم خودت رو اینجا بذار]
            </span>{" "}
            طراحی و توسعه داده شده است.
          </p>

          <div className="mt-5 space-y-3 text-sm">
            <a
              href="mailto:example@email.com"
              className="flex items-center gap-3 text-slate-500 hover:text-green-400 transition"
            >
              <Mail size={17} />
              example@email.com
            </a>

            <a
              href="tel:09120000000"
              className="flex items-center gap-3 text-slate-500 hover:text-green-400 transition"
            >
              <Phone size={17} />
              0912-000-0000
            </a>

            <a
              href="https://example.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-slate-500 hover:text-green-400 transition"
            >
              <Globe size={17} />
              example.com
            </a>
          </div>
        </div>

        <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
          ساخته شده با
          <Heart size={13} className="text-red-400" fill="currentColor" />
          برای مدیریت بهتر مالی شما
        </p>

        <p className="mt-2 text-center text-xs text-slate-600">
          نسخه ۱.۰.۰ (build 3)
        </p>
      </div>
    </div>
  );
}
