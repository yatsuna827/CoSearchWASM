fn cb_search_togepii(
  f_blink : Int,
  seed_blink : UInt,
  f_smoke : Int,
  seed_smoke : UInt
) = "callback" "search_togepii"

fn cb_iter_smoke(i : Int, seed : UInt) = "callback" "iter_smoke"

pub fn search_togepii(
  seed : UInt,
  target : UInt,
  obj : @blink.BlinkObject,
  minInterval : Int,
  maxInterval : Int,
  minBlinkFrames : Int,
  maxBlinkFrames : Int,
  minFrames : Int,
  maxFrames : Int
) -> Unit {
  let _ = _iter_blink(Lcg32(seed), fn() { obj })
    .drop_while(fn(p) { minBlinkFrames <= p.1 })
    .take_while(fn(p) { p.1 <= maxBlinkFrames })
    .filter(fn(p) { minInterval <= p.2 && p.2 <= maxInterval })
    .flat_map(
      fn(p) {
        _iter_smoke(p.0, @togepii.OutskirtStand::new)
        .iter()
        .drop(minFrames)
        .take(maxFrames - minFrames + 1)
        .filter(fn(p) { p.1._ == target })
        .map(fn(q) { ((p.1, p.0), q) })
      },
    )
    .each(
      fn(p) {
        let (blink, smoke) = p
        cb_search_togepii(blink.0, blink.1._, smoke.0, smoke.1._)
      },
    )

}

pub fn new_blink(cooltime : Int, delay~ : Int = 0) -> @blink.BlinkObject {
  @blink.BlinkObject::new(cooltime, delay_at_maturity=delay)
}

pub fn iter_smoke(seed : UInt, take : Int) -> Unit {
  _iter_smoke(Lcg32(seed), @togepii.OutskirtStand::new)
  .iter()
  .take(take)
  .each(fn(p) { cb_iter_smoke(p.0, p.1._) })
}

fn _iter_blink(
  seed : @pk_rng.Lcg32,
  new_blink : () -> @blink.BlinkObject
) -> Iter[(@pk_rng.Lcg32, Int, Int)] {
  Iter::new(
    fn(yield_) {
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
    },
  )
}

fn _iter_smoke(
  seed : @pk_rng.Lcg32,
  new_obj : () -> @togepii.OutskirtStand
) -> Iter2[Int, @pk_rng.Lcg32] {
  Iter2::new(
    fn(yield_) {
      let obj = new_obj()
      let lcg = seed.to_ref()
      let mut i = 0
      while true {
        if yield_(i, lcg.seed()) == IterEnd {
          break IterEnd
        }

        // マップロード消費が決まったタイミングで割り込む
        if i < 6 {
          if i == 2 {
            lcg.advance(n=2)
          } else if i == 5 {
            lcg.advance(n=8)
          }
        }
        i = i + 1
        obj.count_up(lcg)
      } else {
        IterContinue
      }
    },
  )
}
