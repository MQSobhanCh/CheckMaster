import {
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlineWallet,
  HiOutlineChartBar,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";

import { NavLink, useLocation } from "react-router-dom";

const items = [
  {
    title: "خانه",
    path: "/dashboard",
    icon: <HiOutlineHome />,
  },
  {
    title: "چک‌ها",
    path: "/cheques",
    icon: <HiOutlineDocumentText />,
  },
  {
    title: "اقساط",
    path: "/installments",
    icon: <HiOutlineWallet />,
  },
  {
    title: "گزارش",
    path: "/reports",
    icon: <HiOutlineChartBar />,
  },
  {
    title: "تنظیمات",
    path: "/settings",
    icon: <HiOutlineCog6Tooth />,
  },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      dir="rtl"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800/80 bg-slate-950/95 shadow-2xl backdrop-blur-xl"
    >
      <div className="mx-auto grid h-[76px] max-w-2xl grid-cols-5 px-2">
        {items.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center"
            >
              <div
                className={`flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 transition-all duration-300 ${
                  isActive
                    ? "bg-green-500/10 text-green-400"
                    : "text-slate-500 hover:bg-slate-800/60 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <div
                  className={`text-[23px] transition-transform duration-300 ${
                    isActive ? "scale-110" : ""
                  }`}
                >
                  {item.icon}
                </div>

                <span
                  className={`text-[11px] font-bold ${
                    isActive ? "text-green-400" : "text-slate-500"
                  }`}
                >
                  {item.title}
                </span>
              </div>

              {isActive && (
                <div className="absolute bottom-0 h-1 w-8 rounded-t-full bg-green-500" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
