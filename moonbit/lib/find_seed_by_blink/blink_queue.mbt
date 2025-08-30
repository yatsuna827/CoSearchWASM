///|
/// 固定長キュー。pushするたびに先頭の要素が押し出されて消える。
struct Queue {
  array : FixedArray[Int]
  mut start : Int
}

///|
pub fn Queue::new(array : FixedArray[Int]) -> Queue {
  { array, start: 0 }
}

///|
pub fn Queue::push(self : Queue, t : Int) -> Unit {
  self.array[self.start] = t
  self.start = (self.start + 1) % self.array.length()
}

///|
pub fn Queue::at(self : Queue, i : Int) -> Int {
  self.array[(i + self.start) % self.array.length()]
}

///|
pub fn Queue::to_array(self : Queue) -> Array[Int] {
  let arr = Array::new()
  for i in 0..<self.array.length() {
    arr.push(self.at(i))
  }
  arr
}

///|
pub fn Queue::approx_eq(
  self : Queue,
  array : FixedArray[Int],
  tolerance : Int,
) -> Bool {
  for i in 0..<self.array.length() {
    if (self.at(i) - array[i]).abs() > tolerance {
      return false
    }
  } else {
    true
  }
}

///|
test "push" {
  let q = Queue::new([1, 2, 3])
  assert_eq(q.to_array(), [1, 2, 3])
  q.push(4)
  assert_eq(q.to_array(), [2, 3, 4])
}

///|
test "approx_eq" {
  let q = Queue::new([0, 100, 200])
  assert_eq(q.approx_eq([101, 199, 300], 1), false)
  q.push(300)
  assert_eq(q.approx_eq([101, 199, 300], 1), true)
  assert_eq(q.approx_eq([101, 199, 300], 0), false)
}
