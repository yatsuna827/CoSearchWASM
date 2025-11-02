import { Hono } from 'hono'
import { DEX_DATA } from './data'

const app = new Hono()

// TODO: :dexNoを:keyにして、数値なら図鑑番号、それ以外の文字列なら名前として解釈して検索するようにしたい
app.get('/pokemons/:dexNo', async (c) => {
  const param = c.req.param()
  const targetDexNo = Number(param.dexNo)
  if (!Number.isInteger(targetDexNo)) {
    return c.text('BAD REQUEST', 400)
  }

  const poke = DEX_DATA.find(([n]) => n === targetDexNo)
  if (!poke) {
    return c.text('NOT FOUND', 404)
  }

  const [dexNo, name, forme, bs, types, abilities, genderRatio] = poke

  return c.json({
    dexNo,
    name,
    forme,
    bs,
    types,
    abilities,
    genderRatio,
  })
})

export { app }
