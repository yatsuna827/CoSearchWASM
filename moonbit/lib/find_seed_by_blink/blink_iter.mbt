///|
struct BlinkIterator {
  blinker : @blink.BlinkObject
  lcg : @lcg.Lcg32Ref
  mut f_cur : Int
  mut cur : (@lcg.Lcg32, Int, Int)
}

///|
fn BlinkIterator::new(
  blinker : @blink.BlinkObject,
  lcg : @lcg.Lcg32
) -> BlinkIterator {
  { blinker, lcg: lcg.to_ref(), f_cur: 0, cur: (lcg, 0, 0) }
}

///|
fn BlinkIterator::inc(self : BlinkIterator) -> Bool {
  self.f_cur = self.f_cur + 1
  self.blinker.count_up(self.lcg)
}

///|
fn BlinkIterator::next(self : BlinkIterator) -> (@lcg.Lcg32, Int, Int) {
  let f_last_blinked = self.f_cur
  while self.inc() == false {

  }
  self.cur = (self.lcg.seed(), self.f_cur, self.f_cur - f_last_blinked)
  self.cur
}

test {
  let iter = BlinkIterator::new(
    @blink.BlinkObject::new(4, init_cnt=1),
    @lcg.Lcg32(0),
  )
  let exp = [
    (0x00269EC3U, 10, 10),
    (0x00EFCB07, 108, 98),
    (0x03D06529, 172, 64),
    (0x02CFA830, 227, 55),
    (0xBE2151D2, 411, 184),
    (0x0266B473, 576, 165),
    (0x0162A48F, 666, 90),
    (0x0E33A209, 850, 184),
    (0x01C9FCC7, 910, 60),
    (0x014CA09E, 973, 63),
  ]
  for i in 0..<10 {
    let (s, f, interval) = iter.next()
    assert_eq!(exp[i], (s._, f, interval))
  }
}
