// FIXME: いいかんじの名前がきまらないし戻り値の型もキモい
export const slice = (
  durations: number[],
  elapsed: number,
): [lapIndex: number, lapRemain: number] => {
  let sum = 0
  for (let i = 0; i < durations.length; i++) {
    sum += durations[i]

    if (elapsed < sum) {
      return [i, sum - elapsed]
    }
  }

  return [durations.length, 0]
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('LapDurations#slice', () => {
    const arr = [10, 20, 8, 5, 28]

    it('', () => {
      // 第1区間(10)、10-5
      expect(slice(arr, 5)).toEqual([0, 5])

      // 第2区間(20)、(10 + 20) - 20 = 10
      expect(slice(arr, 20)).toEqual([1, 10])

      // 第3区間(8)に切り替わった (10 + 20 = 30)
      expect(slice(arr, 30)).toEqual([2, 8])

      // ちょうど全区間が完了したタイミング(10 + 20 + 8 + 5 + 28 = 71)
      expect(slice(arr, 70)).toEqual([4, 1])
      expect(slice(arr, 71)).toEqual([5, 0])

      // 計測完了をオーバーした場合
      expect(slice(arr, 100)).toEqual([5, 0])
    })
  })
}
