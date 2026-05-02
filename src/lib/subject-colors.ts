export const SUBJECT_COLORS = [
  'bg-sky-50 text-sky-700',
  'bg-cyan-50 text-cyan-700',
  'bg-green-50 text-green-700',
  'bg-lime-50 text-lime-700',
  'bg-yellow-50 text-yellow-700',
  'bg-orange-50 text-orange-700',
  'bg-indigo-50 text-indigo-700',
] as const

export function getSubjectColor(
  subjectId: string,
  subjects: { id: string; name: string }[]
): string {
  const sorted = [...subjects].sort((a, b) => a.name.localeCompare(b.name))
  const index = sorted.findIndex((s) => s.id === subjectId)
  if (index === -1) return 'bg-gray-100 text-gray-500'
  return SUBJECT_COLORS[index % SUBJECT_COLORS.length]
}
