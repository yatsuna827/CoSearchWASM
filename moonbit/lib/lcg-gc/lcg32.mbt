///|
pub(all) type Lcg32 UInt

///|
const MUL_CONST : UInt = 0x343FD

///|
const ADD_CONST : UInt = 0x269EC3

///|
const REV_MUL_CONST : UInt = 0xB9B33155

///|
const REV_ADD_CONST : UInt = 0xA170F641

///|
pub fn Lcg32::next(self : Lcg32) -> Lcg32 {
  self._ * MUL_CONST + ADD_CONST
}

///|
pub fn Lcg32::prev(self : Lcg32) -> Lcg32 {
  self._ * REV_MUL_CONST + REV_ADD_CONST
}

///|
priv struct Booster {
  a_t : Array[UInt]
  b_t : Array[UInt]
  ar_t : Array[UInt]
  br_t : Array[UInt]
}

///|
let cache : Ref[Booster?] = Ref::new(None)

///|
fn setup() -> Booster {
  let a_t : Array[UInt] = Array::new(capacity=32)
  let b_t : Array[UInt] = Array::new(capacity=32)
  let ar_t : Array[UInt] = Array::new(capacity=32)
  let br_t : Array[UInt] = Array::new(capacity=32)
  let one : UInt = 1
  a_t.push(MUL_CONST)
  b_t.push(ADD_CONST)
  ar_t.push(REV_MUL_CONST)
  br_t.push(REV_ADD_CONST)
  for i = 1; i < 32; i = i + 1 {
    a_t.push(a_t[i - 1] * a_t[i - 1])
    b_t.push(b_t[i - 1] * (one + a_t[i - 1]))
    ar_t.push(ar_t[i - 1] * ar_t[i - 1])
    br_t.push(br_t[i - 1] * (one + ar_t[i - 1]))
  }
  let booster = { a_t, b_t, ar_t, br_t }
  cache.val = Some(booster)
  booster
}

///|
pub fn Lcg32::jump(self : Lcg32, n : UInt) -> Lcg32 {
  let mut seed = self._
  let { a_t, b_t, .. } = cache.val.or_else(setup)
  let mut i = 0
  let mut n = n
  while n > 0 {
    if (n & 1) == 1 {
      seed = seed * a_t[i] + b_t[i]
    }
    i = i + 1
    n = n >> 1
  }
  Lcg32(seed)
}

///|
pub fn Lcg32::jump_back(self : Lcg32, n : UInt) -> Lcg32 {
  let mut seed = self._
  let { ar_t, br_t, .. } = cache.val.or_else(setup)
  let mut i = 0
  let mut n = n
  while n > 0 {
    if (n & 1) == 1 {
      seed = seed * ar_t[i] + br_t[i]
    }
    i = i + 1
    n = n >> 1
  }
  Lcg32(seed)
}

///|
pub fn Lcg32::to_string(self : Lcg32) -> String {
  @fmt.to_hex(self._).pad_start(8, '0')
}

///|
fn get_index_from_zero(seed : UInt) -> UInt {
  let mut a = MUL_CONST
  let mut b = ADD_CONST
  let mut result : UInt = 0
  let mut seed = seed * a + b
  let mut mask : UInt = 1
  for i = 0; i < 32; i = i + 1 {
    if (seed & mask) == 0 {
      result = result | mask
    } else {
      seed = seed * a + b
    }
    b = (a + 1) * b
    a = a * a
    mask = mask << 1
  }
  result
}

///|
fn get_index_from_base(seed : UInt, from : UInt) -> UInt {
  let mut a = MUL_CONST
  let mut b = ADD_CONST
  let mut result : UInt = 0
  let mut seed = seed * a + b
  let mut mask : UInt = 1
  for i = 0; i < 32; i = i + 1 {
    if ((seed ^ from) & mask) == 0 {
      result = result | mask
    } else {
      seed = seed * a + b
    }
    b = (a + 1) * b
    a = a * a
    mask = mask << 1
  }
  result
}

///|
pub fn Lcg32::get_index(self : Lcg32, from~ : UInt = 0) -> UInt {
  if from == 0 {
    get_index_from_zero(self._)
  } else {
    get_index_from_base(self._, from)
  }
}

///|
test "jump" {
  let lcg = Lcg32(0x08270827)
  assert_eq!(lcg.next().next().next()._, lcg.jump(3)._)
  assert_eq!(lcg.prev().prev().prev()._, lcg.jump_back(3)._)
}

///|
test "prev" {
  let lcg = Lcg32(0xBEEFFACE)
  assert_eq!(lcg.next().prev()._, lcg._)
  assert_eq!(lcg.prev().next()._, lcg._)
}
