export const DEVELOPER_TIERS = [
  { name: 'Hello World', minPoints: 0, level: 1, color: 'text-brand-muted' },
  { name: 'Link Scout', minPoints: 51, level: 2, color: 'text-blue-400' },
  { name: 'Resource Finder', minPoints: 151, level: 3, color: 'text-emerald-400' },
  { name: 'Tech Curator', minPoints: 351, level: 4, color: 'text-yellow-400' },
  { name: 'Knowledge Navigator', minPoints: 701, level: 5, color: 'text-purple-400' },
  { name: 'Reference Master', minPoints: 1201, level: 6, color: 'text-brand-primary' },
  { name: 'Stack Architect', minPoints: 2001, level: 7, color: 'text-brand-accent' },
  { name: 'Community Sage', minPoints: 3501, level: 8, color: 'text-red-400' },
  { name: 'Ecosystem Builder', minPoints: 6001, level: 9, color: 'text-orange-400' },
  { name: 'The Grand Indexer', minPoints: 10001, level: 10, color: 'text-brand-primary animate-pulse' },
];

export function getTierFromPoints(points: number = 0) {
  return [...DEVELOPER_TIERS].reverse().find(tier => points >= tier.minPoints) || DEVELOPER_TIERS[0];
}
