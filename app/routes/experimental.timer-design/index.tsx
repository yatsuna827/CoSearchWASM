import { Container } from '@/components/Container'
import { FastForwardIcon, PauseIcon, PlayIcon, RewindIcon, TriangleAlertIcon } from 'lucide-react'

const Index: React.FC = () => {
  return (
    <Container className="flex flex-col">
      <div className="grid place-content-center h-60">
        <div className="text-8xl font-semibold pt-10">12:34</div>
      </div>

      <div className="flex justify-center w-full mb-10">
        <div className="grid place-items-center size-16 rounded-full bg-green-400 relative mt-4">
          <RewindIcon size={20} className="mb-[8px] mr-1" />
          <div className="absolute bottom-[14px] text-xs">1F</div>
        </div>
        <div className="grid place-items-center size-16 rounded-full bg-green-400 relative mt-12">
          <RewindIcon size={20} className="mb-[8px] mr-1" />
          <div className="absolute bottom-[14px] text-xs">10F</div>
        </div>

        <div className="grid place-items-center size-16 rounded-full bg-green-400 mx-4">
          {/* <PlayIcon size={28} /> */}
          <PauseIcon />
        </div>

        <div className="grid place-items-center size-16 rounded-full bg-green-400 relative mt-12">
          <FastForwardIcon size={20} className="mb-[8px] ml-1" />
          <div className="absolute bottom-[14px] text-xs">10F</div>
        </div>
        <div className="grid place-items-center size-16 rounded-full bg-green-400 relative mt-4">
          <FastForwardIcon size={20} className="mb-[8px] ml-1" />
          <div className="absolute bottom-[14px] text-xs">1F</div>
        </div>
      </div>

      <div className="bg-white flex-1 flex flex-col gap-2 px-40">
        <div className="rounded-md flex bg-red-200">
          <div className="w-10 px-4 py-2">16F</div>
          <div className="flex-1 ml-auto px-4 py-2">41C64E6D</div>
        </div>

        <div className="rounded-md flex bg-red-200 opacity-55">
          <div className="w-10 px-4 py-2">195F</div>
          <div className="flex-1 ml-auto px-4 py-2">41C64E6D</div>
          <div className="px-4 grid place-items-center">
            <TriangleAlertIcon />
          </div>
        </div>

        <div className="rounded-md flex bg-red-200 opacity-30">
          <div className="w-10 px-4 py-2">16F</div>
          <div className="flex-1 ml-auto px-4 py-2">41C64E6D</div>
        </div>

        <div className="rounded-md flex bg-red-200 opacity-30">
          <div className="w-10 px-4 py-2">16F</div>
          <div className="flex-1 ml-auto px-4 py-2">41C64E6D</div>
        </div>

        <div className="rounded-md flex bg-red-200 opacity-30">
          <div className="w-10 px-4 py-2">16F</div>
          <div className="flex-1 ml-auto px-4 py-2">41C64E6D</div>
        </div>
      </div>
    </Container>
  )
}

export default Index
