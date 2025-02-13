///|
struct IntArrayBuilder {
  array : FixedArray[Int]
  mut set_len : Int
}

///|
fn IntArrayBuilder::new(length : Int) -> IntArrayBuilder {
  { array: FixedArray::make(length, 0), set_len: 0 }
}

///|
fn IntArrayBuilder::add(self : IntArrayBuilder, value : Int) -> Unit {
  if self.set_len < self.array.length() {
    self.array[self.set_len] = value
    self.set_len = self.set_len + 1
  }
}

///|
fn IntArrayBuilder::build(self : IntArrayBuilder) -> FixedArray[Int]? {
  if self.set_len == self.array.length() {
    Some(self.array)
  } else {
    None
  }
}

///|
pub fn new_array_builder(length : Int) -> IntArrayBuilder {
  IntArrayBuilder::new(length)
}

///|
pub fn add_value(builder : IntArrayBuilder, value : Int) -> Unit {
  builder.add(value)
}
