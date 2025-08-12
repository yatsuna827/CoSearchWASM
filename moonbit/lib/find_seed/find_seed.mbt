///|
priv struct Pack(Array[Array[UInt]])

///|
fn make_pack() -> Pack {
  let pack : Array[Array[UInt]] = Array::new(capacity=0x8000)
  for i in 0..<0x8000 {
    pack.push([])
  }
  for lower in 0U..<0x10000 {
    let idx = ((lower * 0x343FDU + 0x269EC3U) >> 16) & 0x7FFF
    pack[idx.reinterpret_as_int()].push(lower)
  }
  pack
}

///|
let cache : Ref[Pack?] = Ref::new(None)

///|
fn Pack::get_or_new() -> Pack {
  match cache.val {
    Some(p) => p
    None => {
      let p = make_pack()
      cache.val = Some(p)
      p
    }
  }
}

///|
pub fn find_seed(
  h : UInt,
  a : UInt,
  b : UInt,
  c : UInt,
  d : UInt,
  s : UInt,
  offset~ : UInt = 5,
) -> Array[@lcg.Lcg32] {
  let hab = h | (a << 5) | (b << 10)
  let scd = s | (c << 5) | (d << 10)
  let key = (scd - 0x43FDU * hab) & 0x7FFF
  let result : Array[@lcg.Lcg32] = []
  let pack = Pack::get_or_new()
  for l16 in pack.inner()[key.reinterpret_as_int()] {
    let seed = @lcg.Lcg32((hab << 16) | l16).jump_back(offset)
    result.push(@lcg.Lcg32(seed.inner()))
    result.push(@lcg.Lcg32(seed.inner() ^ 0x80000000))
  }
  result
}

///|
test {
  let result = find_seed(31, 31, 31, 31, 31, 31).map(fn(s) { s.inner() })
  assert_eq(result.length(), 6)
  assert_true(result.contains(0xa872a1cbU))
  assert_true(result.contains(0x2872a1cbU))
  assert_true(result.contains(0x8fe9f3feU))
  assert_true(result.contains(0x0fe9f3feU))
  assert_true(result.contains(0x77614631U))
  assert_true(result.contains(0xf7614631U))
}
