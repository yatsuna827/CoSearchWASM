import { Hono } from 'hono'
import { em } from './data/em'
import { fr } from './data/fr'
import { lg } from './data/lg'
import { ruby } from './data/ruby'
import { sapphire } from './data/sapphire'

const DATA = {
  em,
  ruby,
  fr,
  lg,
  sapphire,
}

const app = new Hono()

app.get('/:game/:type/:id', async (c) => {
  const data = DATA.em.grass[0]

  return c.json(data)
})

export { app }
