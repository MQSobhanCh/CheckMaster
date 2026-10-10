import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import {
  FaWallet,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaChartPie,
} from "react-icons/fa";

import useChequeStore from "../../store/chequeStore";
import BottomNav from "../../components/layout/BottomNav";

const COLORS = ["#f59e0b", "#22c55e", "#ef4444"];

function formatMoney(value) {
  return Number(value || 0).toLocaleString("fa-IR");
}

export default function Reports() {
  const cheques = useChequeStore((state) => state.cheques);

  const pending = useChequeStore((state) => state.getPendingCount());

  const paid = useChequeStore((state) => state.getPaidCount());

  const returned = useChequeStore((state) => state.getReturnedCount());

  const total = useChequeStore((state) => state.getTotalAmount());

  const paidAmount = useChequeStore((state) =>
    state.getPaidAmount
      ? state.getPaidAmount()
      : cheques
          .filter((item) => item.status === "paid")
          .reduce((sum, item) => sum + Number(item.amount || 0), 0),
  );

  const pendingAmount = useChequeStore((state) =>
    state.getPendingAmount
      ? state.getPendingAmount()
      : cheques
          .filter((item) => item.status === "pending")
          .reduce((sum, item) => sum + Number(item.amount || 0), 0),
  );

  const returnedAmount = useChequeStore((state) =>
    state.getReturnedAmount
      ? state.getReturnedAmount()
      : cheques
          .filter((item) => item.status === "returned")
          .reduce((sum, item) => sum + Number(item.amount || 0), 0),
  );

  const totalCount = pending + paid + returned;

  const paidPercentage =
    totalCount > 0 ? Math.round((paid / totalCount) * 100) : 0;

  const data = [
    {
      name: "در انتظار",
      value: pending,
    },
    {
      name: "وصول شده",
      value: paid,
    },
    {
      name: "برگشتی",
      value: returned,
    },
  ];

  const amountData = [
    {
      name: "در انتظار",
      amount: pendingAmount,
    },
    {
      name: "وصول شده",
      amount: paidAmount,
    },
    {
      name: "برگشتی",
      amount: returnedAmount,
    },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 text-slate-900 dark:text-white">
      <div className="mx-auto max-w-7xl p-5">
        {/* Header */}

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">گزارش‌ها</h1>

          <p className="mt-2 text-sm text-slate-500">
            گزارش کامل وضعیت چک‌ها و مبالغ
          </p>
        </div>

        {/* Summary Cards */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">مجموع مبالغ</p>

                <h2 className="mt-2 text-xl font-bold text-blue-400">
                  {formatMoney(total)}
                </h2>

                <p className="mt-1 text-xs text-slate-400">تومان</p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                <FaWallet size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">وصول شده</p>

                <h2 className="mt-2 text-xl font-bold text-green-400">
                  {formatMoney(paidAmount)}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {paid.toLocaleString("fa-IR")} چک
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
                <FaCheckCircle size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">در انتظار</p>

                <h2 className="mt-2 text-xl font-bold text-amber-400">
                  {formatMoney(pendingAmount)}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {pending.toLocaleString("fa-IR")} چک
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                <FaClock size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">برگشتی</p>

                <h2 className="mt-2 text-xl font-bold text-red-400">
                  {formatMoney(returnedAmount)}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {returned.toLocaleString("fa-IR")} چک
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                <FaExclamationTriangle size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Status Chart */}

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                <FaChartPie />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  وضعیت چک‌ها
                </h2>

                <p className="text-sm text-slate-500">
                  تعداد چک‌ها بر اساس وضعیت
                </p>
              </div>
            </div>

            {totalCount === 0 ? (
              <div className="flex h-80 items-center justify-center text-slate-400">
                هنوز چکی ثبت نشده است.
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={105}
                      innerRadius={55}
                      paddingAngle={4}
                      label
                    >
                      {data.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index]} />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                      formatter={(value) =>
                        `${Number(value).toLocaleString("fa-IR")} چک`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Amount Chart */}

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">مقایسه مبالغ</h2>

              <p className="mt-1 text-sm text-slate-500">
                مبلغ چک‌ها بر اساس وضعیت
              </p>
            </div>

            {totalCount === 0 ? (
              <div className="flex h-80 items-center justify-center text-slate-400">
                اطلاعاتی برای نمایش وجود ندارد.
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={amountData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 10,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />

                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 12,
                        fill: "#94a3b8",
                      }}
                      axisLine={{ stroke: "#334155" }}
                      tickLine={{ stroke: "#334155" }}
                    />

                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: "#94a3b8",
                      }}
                      axisLine={{ stroke: "#334155" }}
                      tickLine={{ stroke: "#334155" }}
                      tickFormatter={(value) =>
                        Number(value).toLocaleString("fa-IR")
                      }
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                      formatter={(value) => `${formatMoney(value)} تومان`}
                    />

                    <Bar
                      dataKey="amount"
                      radius={[8, 8, 0, 0]}
                      fill="#22c55e"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Collection Progress */}

        <div className="mt-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">درصد وصول</h2>

              <p className="mt-1 text-sm text-slate-500">
                نسبت چک‌های وصول‌شده به کل چک‌ها
              </p>
            </div>

            <div className="text-3xl font-bold text-green-400">
              {paidPercentage.toLocaleString("fa-IR")}٪
            </div>
          </div>

          <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
              style={{
                width: `${paidPercentage}%`,
              }}
            />
          </div>

          <div className="mt-3 flex justify-between text-xs text-slate-400">
            <span>{paid.toLocaleString("fa-IR")} وصول شده</span>

            <span>{totalCount.toLocaleString("fa-IR")} کل چک‌ها</span>
          </div>
        </div>

        {/* Detailed Status */}

        <div className="mt-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">جزئیات وضعیت</h2>

          <div className="mt-5 space-y-4">
            {/* Pending */}

            <div className="rounded-2xl bg-amber-500/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                    <FaClock />
                  </div>

                  <div>
                    <p className="font-bold text-amber-300">در انتظار</p>

                    <p className="text-xs text-amber-400">
                      چک‌های هنوز وصول نشده
                    </p>
                  </div>
                </div>

                <div className="text-left">
                  <p className="font-bold text-amber-400">
                    {pending.toLocaleString("fa-IR")} چک
                  </p>

                  <p className="text-xs text-amber-400">
                    {formatMoney(pendingAmount)} تومان
                  </p>
                </div>
              </div>
            </div>

            {/* Paid */}

            <div className="rounded-2xl bg-green-500/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15 text-green-400">
                    <FaCheckCircle />
                  </div>

                  <div>
                    <p className="font-bold text-green-300">وصول شده</p>

                    <p className="text-xs text-green-400">چک‌های وصول شده</p>
                  </div>
                </div>

                <div className="text-left">
                  <p className="font-bold text-green-400">
                    {paid.toLocaleString("fa-IR")} چک
                  </p>

                  <p className="text-xs text-green-400">
                    {formatMoney(paidAmount)} تومان
                  </p>
                </div>
              </div>
            </div>

            {/* Returned */}

            <div className="rounded-2xl bg-red-500/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
                    <FaExclamationTriangle />
                  </div>

                  <div>
                    <p className="font-bold text-red-300">برگشتی</p>

                    <p className="text-xs text-red-400">چک‌های برگشت خورده</p>
                  </div>
                </div>

                <div className="text-left">
                  <p className="font-bold text-red-400">
                    {returned.toLocaleString("fa-IR")} چک
                  </p>

                  <p className="text-xs text-red-400">
                    {formatMoney(returnedAmount)} تومان
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
