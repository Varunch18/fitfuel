/**
 * Renders a titled card listing food items for a macro group.
 * `items` is an array of { name, note }.
 */
export default function FoodList({ icon: Icon, title, items, tone = 'brand' }) {
  const toneMap = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
    sky: 'bg-sky-50 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300',
  }

  return (
    <div className="card">
      <div className="mb-4 flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneMap[tone]}`}>
          {Icon && <Icon size={20} />}
        </span>
        <h3 className="font-bold text-slate-800 dark:text-white">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60"
          >
            <span className="font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
            <span className="text-xs text-slate-400">{item.note}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
