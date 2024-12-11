import { Link, type MetaFunction } from 'react-router'

const Page: React.FC = () => {
  return (
    <main className="bg-blue-50">
      <div className="w-[1000px] m-auto p-4">
        <h1 className="font-bold">CoSearch 移植計画 候補地</h1>

        <div className="my-4">
          <h2 className="font-bold">ツール一覧</h2>
          <ul>
            <li>
              <Link to="/gc/xd/starter">XD ID調整</Link>
            </li>
            <li>
              <Link to="/gc/xd/togepii">XD トゲピー</Link>
            </li>
            <li>
              <Link to="/dolphin">DolphinログViewer</Link>
            </li>
          </ul>
        </div>

        <div className="my-4">
          <h2 className="font-bold">ゲーム一覧</h2>
          <ul>
            <li>
              <Link to="/game/blink">ムウマの瞬きを見るゲーム</Link>
            </li>
            <li>
              <Link to="/game/chatot">ペラップの声を聞くゲーム</Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}

export default Page
