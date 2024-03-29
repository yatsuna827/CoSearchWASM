export const natures = [
  'hardy',
  'lonely',
  'brave',
  'adamant',
  'naughty',
  'bold',
  'docile',
  'relaxed',
  'impish',
  'lax',
  'timid',
  'hasty',
  'serious',
  'jolly',
  'naive',
  'modest',
  'mild',
  'quiet',
  'bashful',
  'rash',
  'calm',
  'gentle',
  'sassy',
  'careful',
  'quirky',
] as const

const toJp = {
  hardy: 'がんばりや',
  lonely: 'さみしがり',
  brave: 'ゆうかん',
  adamant: 'いじっぱり',
  naughty: 'やんちゃ',
  bold: 'ずぶとい',
  docile: 'すなお',
  relaxed: 'のんき',
  impish: 'わんぱく',
  lax: 'のうてんき',
  timid: 'おくびょう',
  hasty: 'せっかち',
  serious: 'まじめ',
  jolly: 'ようき',
  naive: 'むじゃき',
  modest: 'ひかえめ',
  mild: 'おっとり',
  quiet: 'れいせい',
  bashful: 'てれや',
  rash: 'うっかりや',
  calm: 'おだやか',
  gentle: 'おとなしい',
  sassy: 'なまいき',
  careful: 'しんちょう',
  quirky: 'きまぐれ',
} as const satisfies Record<Nature, string>

const fromJp = Object.fromEntries(Object.entries(toJp).map(([k, v]) => [v, k])) as Record<
  NatureJp,
  Nature
>

export type Nature = (typeof natures)[number]
export type NatureJp = (typeof toJp)[Nature]
export const toJapanese = <T extends Nature>(nature: T) => toJp[nature]
export const natureToInt = (nature: NatureJp) => natures.indexOf(fromJp[nature])
