///|
pub fn iter_blink(
  seed : @lcg.Lcg32,
  new_blink : () -> BlinkObject,
) -> Iter[(@lcg.Lcg32, Int, Int)] {
  Iter::new(fn(yield_) {
    let b = new_blink()
    let lcg = seed.to_ref()
    let mut f_cur = 0
    let mut f_last_blinked = 0
    while true {
      f_cur = f_cur + 1
      if b.count_up(lcg) {
        if yield_((lcg.seed(), f_cur, f_cur - f_last_blinked)) == IterEnd {
          break IterEnd
        }
        f_last_blinked = f_cur
      }
    } else {
      IterContinue
    }
  })
}
