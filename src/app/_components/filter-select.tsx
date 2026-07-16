import { Combobox } from "~/app/_components/ui/combobox";

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  searchable = false,
  loading = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  /** Use a search-to-filter combobox instead of a native select — for option lists that can grow. */
  searchable?: boolean;
  loading?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      {searchable ? (
        <Combobox
          value={value}
          onChange={onChange}
          options={options}
          clearLabel="All"
          loading={loading}
          placeholder={`Search ${label.toLowerCase()}...`}
        />
      ) : (
        <select
          className="border-accent rounded-[8px] border px-3 py-2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">All</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </label>
  );
}
