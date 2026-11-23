import { useNavigate } from "react-router-dom";

import ChequeForm from "../../components/forms/ChequeForm";
import PageHeader from "../../components/layout/PageHeader";
import { promptNotificationsIfNeeded } from "../../services/notificationService";
import useChequeStore from "../../store/chequeStore";
import useUIStore from "../../store/uiStore";

export default function AddCheque() {
  const navigate = useNavigate();

  const addCheque = useChequeStore((state) => state.addCheque);
  const cheques = useChequeStore((state) => state.cheques);
  const showToast = useUIStore((state) => state.showToast);

  async function handleSubmit(values) {
    await addCheque(values);

    showToast("چک با موفقیت ثبت شد.", "success");
    promptNotificationsIfNeeded();

    navigate("/cheques");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-5 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <PageHeader title="ثبت چک جدید" onBack={() => navigate("/cheques")} />

        <ChequeForm
          submitLabel="ذخیره چک"
          onSubmit={handleSubmit}
          existing={cheques}
        />
      </div>
    </div>
  );
}
