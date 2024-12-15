pub(readonly) struct OutskirtStand {
  left : MainCounter
  right : MainCounter
  mut lazy_queue : Array[Int]
}

pub fn OutskirtStand::new() -> OutskirtStand {
  { left: MainCounter::new(), right: MainCounter::new(), lazy_queue: [] }
}

pub fn count_up(self : OutskirtStand, lcg : @lcg.Lcg32Ref) -> Unit {
  // 遅延発生するカウンタの処理
  for _ in self.lazy_queue.filter(fn(x) { x == 0 }) {
    self.left.append(SubCounter::new(lcg))
  }

  // カウンタのカウントアップ処理
  if self.left.count_up(lcg) {
    self.lazy_queue.push(10)
  }
  if self.right.count_up(lcg) {
    self.lazy_queue.push(20)
    self.lazy_queue.push(30)
  }
  self.lazy_queue = self.lazy_queue.filter(fn(x) { x > 0 }).map(fn(x) { x - 1 })
}

pub fn to_string(self : OutskirtStand) -> String {
  "\{self.left.value}, \{self.right.value}"
}

struct MainCounter {
  mut value : Float
  mut next : SubCounter?
}

fn to_string(self : MainCounter) -> String {
  self.value.to_string()
}

fn MainCounter::new() -> MainCounter {
  { value: 0.9999999, next: None }
}

fn count_up(self : MainCounter, lcg : @lcg.Lcg32Ref) -> Bool {
  self.value = self.value + lcg.get_rand_f() * 0.01
  let carried = if self.value >= 1.0 {
    self.value = self.value - 1.0
    lcg.advance()
    self.append(SubCounter::new(lcg))
    true
  } else {
    false
  }
  self.remove_dead_nodes()
  match self.next {
    Some(next) => next.count_up(lcg)
    None => ()
  }
  carried
}

fn append(self : MainCounter, next : SubCounter) -> Unit {
  next.next = self.next
  self.next = Some(next)
}

fn remove_dead_nodes(self : MainCounter) -> Unit {
  self.next = loop self.next {
    Some(x) => if x.is_living() { break Some(x) } else { continue x.next }
    None => break None
  }
}

struct SubCounter {
  mut value : Float
  mut next : SubCounter?
  mut lifetime : Int
  mut object_lifetime : Int
}

fn SubCounter::new(lcg : @lcg.Lcg32Ref) -> SubCounter {
  { value: lcg.get_rand_f(), next: None, lifetime: 50, object_lifetime: 0 }
}

fn count_up(self : SubCounter, lcg : @lcg.Lcg32Ref) -> Unit {
  if self.lifetime == 0 {
    lcg.advance()
  } else {
    self.value = self.value + lcg.get_rand_f() * 0.5
    if self.value >= 1.0 {
      self.value = self.value - 1.0
      lcg.advance()
      self.object_lifetime = 21
    }
    self.lifetime = self.lifetime - 1
  }
  self.object_lifetime = self.object_lifetime - 1
  self.remove_dead_nodes()
  match self.next {
    Some(next) => next.count_up(lcg)
    None => ()
  }
}

fn append(self : SubCounter, next : SubCounter) -> Unit {
  next.next = self.next
  self.next = Some(next)
}

fn is_living(self : SubCounter) -> Bool {
  self.lifetime > 0 || self.object_lifetime > 0
}

fn remove_dead_nodes(self : SubCounter) -> Unit {
  self.next = loop self.next {
    Some(x) => if x.is_living() { break Some(x) } else { continue x.next }
    None => break None
  }
}

test "append" {
  let node1 = { value: 1.0, next: None, lifetime: 0, object_lifetime: 0 }
  let node2 = { value: 2.0, next: None, lifetime: 0, object_lifetime: 0 }
  node1.append(node2)
  assert_eq!(node1.next.unwrap().value, node2.value)
}

test "remove_dead_children" {
  let node1 = { value: 1.0, next: None, lifetime: 0, object_lifetime: 0 }
  let node2 = { value: 2.0, next: None, lifetime: 0, object_lifetime: 0 }
  let node3 = { value: 3.0, next: None, lifetime: 1, object_lifetime: 1 }
  // remove dead node2
  node1.append(node3)
  node1.append(node2)
  node1.remove_dead_nodes()
  assert_eq!(node1.next.unwrap().value, node3.value)
  // remove dead node3
  node3.lifetime = 0
  node3.object_lifetime = 0
  node1.remove_dead_nodes()
  assert_eq!(node1.next.is_empty(), true)
}
