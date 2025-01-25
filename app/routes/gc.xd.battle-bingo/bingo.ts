export type BingoPanel = BonusPanel | PokemonPanel
export type BonusPanel = {
  kind: 'bonus'
  name: 'EP+1' | 'EP+2' | 'マスターボール'
}
export type PokemonPanel = {
  kind: 'pokemon'
  name: string
  ability: string
  move: string
}

export const data = [
  { kind: 'pokemon', name: 'チャーレム', ability: 'ヨガパワー', move: 'とびひざげり' },
  { kind: 'pokemon', name: 'チリーン', ability: 'ふゆう', move: 'シャドーボール' },
  { kind: 'bonus', name: 'マスターボール' },
  { kind: 'pokemon', name: 'ルージュラ', ability: 'どんかん', move: 'れいとうビーム' },
  { kind: 'pokemon', name: 'ナッシー', ability: 'ようりょくそ', move: 'ギガドレイン' },
  { kind: 'pokemon', name: 'ソルロック', ability: 'ふゆう', move: 'かえんほうしゃ' },
  { kind: 'pokemon', name: 'キリンリキ', ability: 'せいしんりょく', move: '10まんボルト' },
  { kind: 'bonus', name: 'EP+1' },
  { kind: 'pokemon', name: 'ヤドラン', ability: 'マイペース', move: 'なみのり' },
  { kind: 'pokemon', name: 'ブーピッグ', ability: 'あついしぼう', move: 'サイコキネシス' },
  { kind: 'pokemon', name: 'ネンドール', ability: 'ふゆう', move: 'じしん' },
  { kind: 'pokemon', name: 'ネイティオ', ability: 'はやおき', move: 'ドリルくちばし' },
  { kind: 'pokemon', name: 'メタグロス', ability: 'クリアボディ', move: 'サイコキネシス' },
  { kind: 'bonus', name: 'EP+2' },
  { kind: 'pokemon', name: 'ルナトーン', ability: 'ふゆう', move: 'いわなだれ' },
  { kind: 'pokemon', name: 'ヤドキング', ability: 'マイペース', move: 'かわらわり' },
] as const satisfies BingoPanel[]
