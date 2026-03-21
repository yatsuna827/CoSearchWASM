///|
pub fn iter_blink(
  seed : @lcg.Lcg32,
  new_blink : () -> BlinkObject,
) -> Iter[(@lcg.Lcg32, Int, Int)] {
  let b = new_blink()
  let lcg = seed.to_ref()
  let mut f_cur = 0
  let mut f_last_blinked = 0
  Iter::new(fn() {
    while true {
      f_cur = f_cur + 1
      if b.count_up(lcg) {
        let elapsed = f_cur - f_last_blinked
        f_last_blinked = f_cur
        break Some((lcg.val, f_cur, elapsed))
      }
    } nobreak {
      None
    }
  })
}
