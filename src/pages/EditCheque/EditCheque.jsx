import { useNavigate, useParams } from "react-router-dom";

import ChequeForm from "../../components/forms/ChequeForm";
import PageHeader from "../../components/layout/PageHeader";
import useChequeStore from "../../store/chequeStore";
import useUIStore from "../../store/uiStore";

export default function EditCheque() {
  const { id } = useParams();
  const navigate = useNavigate();

  const cheque = useChequeStore((state) =>
    state.cheques.find((item) => String(item.id) === String(id)),
  );
  const cheques = useChequeStore((state) => state.cheques);
  const updateCheque = useChequeStore((state) => state.updateCheque);
  const showToast = useUIStore((state) => state.showToast);

  async function handleSubmit(values) {
    await updateCheque(id, values);

    showToast("تغییرات چک ذخیره شد.", "success");

    navigate("/cheques");
  }

  if (!cheque) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
        <h2 className="text-2xl font-bold text-red-400">چک پیدا نشد</h2>

        <button
          type="button"
          onClick={() => navigate("/cheques")}
          className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white"
        >
          بازگشت به لیست
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-5 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <PageHeader title="ویرایش چک" onBack={() => navigate("/cheques")} />

        <ChequeForm
          key={cheque.id}
          initial={cheque}
          editingId={cheque.id}
          submitLabel="ذخیره تغییرات"
          onSubmit={handleSubmit}
          existing={cheques}
        />
      </div>
    </div>
  );
}
