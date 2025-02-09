///|
fn cb_find_seed(seed : UInt) = "callback" "find_seed"

///|
pub fn find_seed_by_blink(
  current : UInt,
  min : UInt,
  max : UInt,
  cool_time : Int,
  tolerance : Int,
  input : IntArrayBuilder
) -> Unit {
  let arr = input.build().unwrap()
  for
    s in @finder.find(@lcg.Lcg32(current), min, max, cool_time, arr, tolerance) {
    cb_find_seed(s._)
  }
}
