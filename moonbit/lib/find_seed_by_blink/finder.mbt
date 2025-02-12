///|
pub fn find(
  current : @lcg.Lcg32,
  min : UInt,
  max : UInt,
  cool_time : Int,
  input_blank : FixedArray[Int],
  tolerance : Int
) -> Array[@lcg.Lcg32] {
  let modosu = (1400 + input_blank.length() * 180).reinterpret_as_uint()
  let s = if min > modosu { current.jump(min - modosu) } else { current }
  let iter = BlinkIterator::new(
    @blink.BlinkObject::new(cool_time, init_cnt=1),
    s,
  )
  let arr = input_blank.map(fn(_) { iter.next().1 })
  let q = Queue::new(arr)
  while iter.cur.0.get_index(from=current._) < min {
    let (_, b) = iter.next()
    q.push(b)
  }
  let result : Array[@lcg.Lcg32] = Array::new()
  while iter.cur.0.get_index(from=current._) <= max {
    let (s, _) = iter.cur
    if q.approx_eq(input_blank, tolerance) {
      result.push(s)
    }
    let (_, b) = iter.next()
    q.push(b)
  }
  return result
}

test {
  let res = find(@lcg.Lcg32(0), 0, 1000, 4, [55, 184, 165], 0)
  assert_eq!(res.length(), 1)
  assert_eq!(res[0]._, 0x0266B473)
}

test "tolerance" {
  // 1回目は-5F, 2回目は+6Fの入力に対して許容誤差6Fで検索
  let res = find(@lcg.Lcg32(0), 0, 1000, 4, [50, 190, 165], 6)
  assert_eq!(res.length(), 1)
  assert_eq!(res[0]._, 0x0266B473)

  // 許容誤差5だと落ちる
  assert_eq!(find(@lcg.Lcg32(0), 0, 1000, 4, [50, 190, 165], 5).length(), 0)
}

test "min" {
  let input : FixedArray[Int] = [68, 125, 85, 184, 158]
  let res = find(@lcg.Lcg32(0), 10215, 15000, 4, input, 0)
  assert_eq!(res.length(), 1)
  assert_eq!(res[0]._, 0x00BDD309)

  // inputはちょうど末尾のseedが10215消費になっている例
  let res = find(@lcg.Lcg32(0), 10216, 15000, 4, input, 0)
  assert_eq!(res.length(), 0)
}

test "max" {
  let max = @lcg.Lcg32(0x0266B473).get_index()
  assert_eq!(find(@lcg.Lcg32(0), 0, max, 4, [55, 184, 165], 0).length(), 1)
  assert_eq!(find(@lcg.Lcg32(0), 0, max - 1, 4, [55, 184, 165], 0).length(), 0)
}

test "実際に観測してみたサンプル" {
  let res = find(
    @lcg.Lcg32(0xC7B17A8C),
    5000,
    10000,
    8,
    [64, 38, 67, 78, 120, 45, 126, 192, 108, 95],
    20,
  )
  assert_eq!(res.length(), 1)
  assert_eq!(res[0]._, 0x02C81E51)
}
