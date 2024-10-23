import { useCallback, useMemo, useRef, useState } from 'react'

import { LabeledInput } from '@/components/LabeledInput'
import { LCG } from '@/domain/gc/lcg'
import {
  advanceInNamingScreen,
  backInNamingScreen,
  isValidSeed,
} from '@/domain/gc/starter/namingScreen'
import { type GenerateStarterResult, generateStarter } from '@/domain/gc/starter/starterGenerator'
import { natures, toJapanese } from '@/domain/nature'
import { type SeedInputController, useSeedInput } from '@/hooks/useSeedInput'
import { Ref } from '@/utilities/ref'

import { ChevronLeft } from '@/components/ChevronLeft'
import { Hamburger } from '@/components/Hamburger'
import { Link } from '@remix-run/react'
import { $path } from 'remix-routes'
import { Container, Row } from './components'

export const PageActivated: React.FC<{ targetSeed: LCG }> = ({ targetSeed }) => {
  // TODO: こいつらは開閉するSettingに押し付けて、LocalStorageに保存したい
  const [timerFrames] = useState(1000)
  const [blankFrames] = useState(585)

  const [currentSeed, currentSeedController] = useSeedInput('')

  const namingStart = useMemo(() => {
    if (currentSeed == null) return null

    try {
      return backInNamingScreen(targetSeed, timerFrames + blankFrames)
    } catch {
      return null
    }
  }, [targetSeed, currentSeed, timerFrames, blankFrames])

  const dialogRef = useRef<HTMLDialogElement>(null)
  const handleDialogClick = useCallback((e: React.MouseEvent<HTMLDialogElement, MouseEvent>) => {
    if (!dialogRef.current) return

    if (e.currentTarget === e.target) {
      dialogRef.current.close()
    }
  }, [])
  const handleClickMenu = useCallback(() => {
    dialogRef.current?.showModal()
  }, [])
  const handleDialogClose = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  return (
    <>
      <div className="relative flex items-center justify-center px-4 h-10 border-b">
        <Link className="absolute left-2" to={$path('/gc/xd/starter')}>
          <ChevronLeft className="h-6 w-6 text-gray-500" />
        </Link>
        <h1 className="text-lg font-semibold">PokemonXD ID調整</h1>
        <button type="button" className="absolute right-3 outline-none" onClick={handleClickMenu}>
          <Hamburger className="h-6 w-6 stroke-gray-600" />
        </button>
      </div>
      <Container>
        <div className="w-full overflow-x-auto px-4 py-2">
          <ResultBlock seed={targetSeed} />

          {isValidSeed(targetSeed) && (
            <>
              <div className="mb-6" />

              <DistanceBlock
                seed={currentSeed}
                controller={currentSeedController}
                seedNamingStart={namingStart}
              />

              <div className="mb-6" />

              <DiffListBlock targetSeed={targetSeed} namingStart={namingStart} />
            </>
          )}
        </div>
      </Container>
      <dialog
        ref={dialogRef}
        className="p-0 m-0 h-screen max-h-screen border-l backdrop:bg-black/30 ml-auto"
        onClick={handleDialogClick}
      >
        <div className="w-40 h-full bg-[#f9f9f9]">
          <div className="relative flex items-center px-4 h-10 border-b">
            <h1 className="text-lg font-semibold">設定</h1>
            <button
              type="button"
              className="absolute right-3 outline-none"
              onClick={handleDialogClose}
            >
              <Hamburger className="h-6 w-6 stroke-gray-600" />
            </button>
          </div>
          <div>タイマー入力</div>
          <div>{timerFrames}フレーム</div>
          <div>制動時間</div>
          <div>{blankFrames}フレーム</div>
        </div>
      </dialog>
    </>
  )
}

type ResultBlockProps = {
  seed: LCG
}
const ResultBlock: React.FC<ResultBlockProps> = ({ seed }) => {
  const { tid, sid, eevee } = generateStarter(seed)
  const isValid = isValidSeed(seed)
  const isShiny = (tid ^ sid ^ (eevee.pid & 0xffff) ^ (eevee.pid >>> 16)) < 8

  return (
    <div className={isValid ? 'text-black' : 'text-gray-400'}>
      <div>目標seed: {seed.toString(16).toUpperCase().padStart(8, '0')}</div>
      <div>
        <span className="mr-4">TID: {tid.toString().padStart(5, '0')}</span>
        <span>SID: {sid.toString().padStart(5, '0')}</span>
      </div>
      <div>
        <span className="mr-2">{toJapanese(natures[eevee.pid % 25])}</span>
        <span className="mr-2">
          {eevee.ivs.map((_) => _.toString().padStart(2, '0')).join('-')}
        </span>
        <span>{isShiny && '☆'}</span>
      </div>
      {!isValid && <span className="text-red-600 font-semibold">到達不可能なseedです</span>}
    </div>
  )
}

type DistanceBlockProps = {
  seed: LCG | null
  controller: SeedInputController

  seedNamingStart: LCG | null
}
const DistanceBlock: React.FC<DistanceBlockProps> = ({ seed, controller, seedNamingStart }) => {
  const nokoriShouhi = useMemo(() => {
    if (seedNamingStart == null || seed == null) return null

    return LCG.getIndex(seedNamingStart, seed)
  }, [seedNamingStart, seed])

  return (
    <>
      <LabeledInput className="px-2" label="現在のseed" placeholder="1234ABCD" {...controller} />
      {nokoriShouhi != null ? <div>残り {nokoriShouhi >>> 0} 消費必要です</div> : <></>}
    </>
  )
}

type DiffListBlockProps = {
  targetSeed: LCG | null
  namingStart: LCG | null
}
const DiffListBlock: React.FC<DiffListBlockProps> = ({ targetSeed, namingStart }) => {
  const searchResult = useMemo(() => {
    if (targetSeed == null) return []
    if (!isValidSeed(targetSeed)) return []

    const start = backInNamingScreen(targetSeed, 100)

    const lcg = Ref.from(start)
    const result: [number, GenerateStarterResult][] = []
    for (let i = -100; i <= 100; i++) {
      result.push([i, lcg.map(generateStarter)])

      lcg.update(advanceInNamingScreen)
    }

    return result
  }, [targetSeed])
  const ref = useCallback((ref: HTMLDivElement | null) => {
    if (!ref) return

    if (ref.dataset.i === '-2') ref.scrollIntoView()
  }, [])

  const filterInputRef = useRef<HTMLInputElement>(null)
  const [filterTid, setFilter] = useState<number | null>(null)

  if (namingStart == null) return null

  return (
    <>
      <div>
        <span>突入時のseed: {namingStart.toString(16).padStart(8, '0').toUpperCase()}</span>
      </div>
      <div className="h-[200px] overflow-y-scroll mb-4">
        {searchResult
          .filter(([_, { tid }]) => filterTid == null || tid === filterTid)
          .map(([i, { tid, sid }]) => (
            <div key={i} data-i={i} ref={ref} className="flex items-center gap-2 border-b h-10">
              <div className="w-16 text-center text-gray-500">{i}</div>
              <div className="align-baseline">
                <span className="text-lg text-[#333]">{tid.toString().padStart(5, '0')}</span>
                <span className="text-xs text-[#333] ml-2">{sid.toString().padStart(5, '0')}</span>
              </div>
            </div>
          ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()

          if (!filterInputRef.current) return

          const tid = Number.parseInt(filterInputRef.current.value)
          if (!Number.isInteger(tid) || tid < 0 || 0xffff < tid) return

          setFilter(tid)
        }}
      >
        <div className="flex items-end gap-4">
          <LabeledInput
            ref={filterInputRef}
            className="w-40 px-2"
            label="TIDフィルタ"
            type="number"
            min={0}
            max={65535}
          />
          <button type="button" className="w-24 h-8 text-sm border font-semibold bg-white">
            絞り込む
          </button>
          <button
            type="reset"
            className="w-24 h-8 text-sm border font-semibold bg-white"
            onClick={() => {
              if (!filterInputRef.current) return

              filterInputRef.current.value = ''
              setFilter(null)
            }}
          >
            リセット
          </button>
        </div>
      </form>
    </>
  )
}
