const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, "All"];

function PaginationFooter({
  currentPage,
  totalItems,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = ROWS_PER_PAGE_OPTIONS
}) {
  const isShowingAll = rowsPerPage === "all";
  const totalPages = isShowingAll ? 1 : Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const resultStart = totalItems === 0 ? 0 : isShowingAll ? 1 : (currentPage - 1) * rowsPerPage + 1;
  const resultEnd = isShowingAll ? totalItems : Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
        <span>Show rows per page</span>
        <select
          value={rowsPerPage}
          onChange={(event) => {
            const value = event.target.value;
            onRowsPerPageChange(value === "all" ? "all" : Number(value));
          }}
          className="h-10 rounded-md border border-slate-200 bg-white px-4 pr-9 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-[#cdc3ff] focus:ring-2 focus:ring-[#cdc3ff]/40"
        >
          {rowsPerPageOptions.map((option) => {
            const optionValue = option === "All" ? "all" : option;

            return (
              <option key={option} value={optionValue}>
                {option}
              </option>
            );
          })}
        </select>
      </label>

      <div className="flex items-center justify-between gap-5 sm:justify-end">
        <p className="min-w-[6.5rem] text-sm font-medium text-slate-700">
          {resultStart}-{resultEnd} of {totalItems}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none text-slate-700 transition hover:bg-[#f8f7fc] disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Previous page"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none text-slate-700 transition hover:bg-[#f8f7fc] disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaginationFooter;
