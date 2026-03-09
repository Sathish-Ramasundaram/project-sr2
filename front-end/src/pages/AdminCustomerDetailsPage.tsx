import AdminPageLayout from '@/components/admin/AdminPageLayout';

function AdminCustomerDetailsPage() {
  return (
    <AdminPageLayout
      title="Customer Details"
      subtitle="This page is intentionally empty for now."
    >
      <article className="rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          No content yet.
        </p>
      </article>
    </AdminPageLayout>
  );
}

export default AdminCustomerDetailsPage;
