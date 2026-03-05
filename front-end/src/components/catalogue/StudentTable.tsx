type StudentItem = {
  item: string;
  quantity: string;
  price: number;
};

type StudentTableProps = {
  studentItems: StudentItem[];
  isStudentsLoading: boolean;
  studentsError: string | null;
};

function StudentTable({
  studentItems,
  isStudentsLoading,
  studentsError,
}: StudentTableProps) {
  return (
    <section className="mt-8 w-full lg:w-8/12">
      <h3 className="text-2xl font-bold">Students</h3>
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-300 dark:border-slate-700">
        <table className="min-w-full bg-white text-left dark:bg-slate-800">
          <thead className="bg-slate-200 text-sm uppercase tracking-wide dark:bg-slate-700">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Price</th>
            </tr>
          </thead>
          <tbody>
            {isStudentsLoading ? (
              <tr className="border-t border-slate-300 dark:border-slate-700">
                <td
                  colSpan={3}
                  className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
                >
                  Loading student items...
                </td>
              </tr>
            ) : studentsError ? (
              <tr className="border-t border-slate-300 dark:border-slate-700">
                <td
                  colSpan={3}
                  className="px-4 py-3 text-sm text-rose-600 dark:text-rose-400"
                >
                  {studentsError}
                </td>
              </tr>
            ) : studentItems.length === 0 ? (
              <tr className="border-t border-slate-300 dark:border-slate-700">
                <td
                  colSpan={3}
                  className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
                >
                  No student items found.
                </td>
              </tr>
            ) : (
              studentItems.map((studentItem) => (
                <tr
                  key={studentItem.item}
                  className="border-t border-slate-300 dark:border-slate-700"
                >
                  <td className="px-4 py-3">{studentItem.item}</td>
                  <td className="px-4 py-3">{studentItem.quantity}</td>
                  <td className="px-4 py-3">{studentItem.price}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default StudentTable;
