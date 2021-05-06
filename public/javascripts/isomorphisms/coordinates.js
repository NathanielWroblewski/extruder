import Vector from '../models/vector.js'

// Copyright (c) 2020 Nathaniel Wroblewski
// I am making my contributions/submissions to this project solely in my personal
// capacity and am not conveying any rights to any intellectual property of any
// third parties.

const coordinates = {
  toCartesian ([r, θ, φ]) {
    const sinθ = Math.sin(θ)
    const rsinθ = r * sinθ

    return Vector.from([
      Math.cos(φ) * rsinθ,
      Math.sin(φ) * rsinθ,
      r * Math.cos(θ),
    ])
  },

  // cheats a bit: static r, otherwise r = Math.sqrt(cartesian.magnitude)
  toSpherical (cartesian) {
    return Vector.from([
      Math.sqrt(cartesian.magnitude),
      Math.acos(cartesian.z / SPHERE_RADIUS),
      Math.atan((cartesian.y - HALF_HEIGHT) / cartesian.z)
    ])
  }
}

export default coordinates
