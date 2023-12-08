function xoshiro128ss(a, b, c, d) {
  return function () {
    var t = b << 9,
      r = b * 5;
    r = ((r << 7) | (r >>> 25)) * 9;
    c ^= a;
    d ^= b;
    b ^= c;
    a ^= d;
    c ^= t;
    d = (d << 11) | (d >>> 21);
    return (r >>> 0) / 4294967296;
  };
}

// function mathrand() {
//   return () => Math.random();
// }

export const rand = xoshiro128ss(600, 983, 273,4230);
