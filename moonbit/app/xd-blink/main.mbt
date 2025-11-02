///|
fn cb_find_seed(seed : UInt) = "callback" "find_seed"

///|
pub fn find_seed_by_blink(
  current : UInt,
  min : UInt,
  max : UInt,
  cool_time : Int,
  tolerance : Int,
  input : IntArrayBuilder,
) -> Unit {
  let arr = input.build().unwrap()
  for
    s in @finder.find(@lcg.Lcg32(current), min, max, cool_time, arr, tolerance) {
    cb_find_seed(s.0)
  }
}

///|
pub fn blink_iter_new(current : UInt, cool_time : Int) -> @finder.BlinkIterator {
  @finder.BlinkIterator::new(
    @blink.BlinkObject::new(cool_time, init_cnt=1),
    current,
  )
}

///|
pub fn blink_iter_next(iter : @finder.BlinkIterator) -> Unit {
  let _ = iter.next()

}

///|
pub fn blink_iter_get_interval(iter : @finder.BlinkIterator) -> UInt {
  iter.cur.1.reinterpret_as_uint()
}

///|
pub fn blink_iter_get_seed(iter : @finder.BlinkIterator) -> UInt {
  iter.cur.0.0
}
