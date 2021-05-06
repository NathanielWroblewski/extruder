import Vector from './models/vector.js'
import FourByFour from './models/four_by_four.js'
import Camera from './models/orthographic.js'
import angles from './isomorphisms/angles.js'
import coordinates from './isomorphisms/coordinates.js'
import renderCircle from './views/circle.js'
import renderLine from './views/line.js'
import { seed, noise } from './utilities/noise.js'
import { remap, clamp } from './utilities/index.js'
import { COLORS } from './constants/colors.js'
import {
  Δθ, Δy, YOFFSET, CULL, FADE, RADII, θresolution, Rresolution, BLUR, LINE_INTERVAL
} from './constants/dimensions.js'

// Copyright (c) 2020 Nathaniel Wroblewski
// I am making my contributions/submissions to this project solely in my personal
// capacity and am not conveying any rights to any intellectual property of any
// third parties.

const canvas = document.querySelector('.canvas')
const context = canvas.getContext('2d')
const { sin, cos } = Math

seed(Math.random())

const perspective = FourByFour
  .identity()
  .rotX(angles.toRadians(10))

const camera = new Camera({
  position: Vector.from([0,0,0]),
  direction: Vector.zeroes(),
  up: Vector.from([0, 1, 0]),
  width: canvas.width,
  height: canvas.height,
  zoom: 0.06
})

let points = []
let θ = 90
let tick = 0

context.shadowBlur = BLUR

const step = () => {
  const projectedPoints = []
  const segments = points.length / RADII.length

  context.clearRect(0, 0, canvas.width, canvas.height)

  // update points, cache projections
  points.forEach((point, index) => {
    const cohort = segments - Math.floor(index / RADII.length)
    const translated = Vector.from([point.x, point.y + (Δy * cohort), point.z])

    points[index] = translated

    projectedPoints.push(camera.project(translated.transform(perspective)))
  })

  // render top to bottom (back to front)
  projectedPoints.reduceRight((memo, projectedPoint, index) => {
    const a = projectedPoint
    const b = projectedPoints[index + RADII.length]

    if (b) {
      const color = COLORS[index % RADII.length]
      const pointy = points[index].y
      const opacity = pointy < 12 ? 1 : (
        clamp(1 - remap(pointy, [12, 15], [0, 1]), [0, 1])
      )

      context.globalAlpha = opacity
      renderLine(context, a, b, color, 2)
    }
  }, '')

  context.globalAlpha = 1

  RADII.forEach((radius, index) => {
    const distortion = θ < 720 ? 0 : noise(radius * Rresolution, θ * θresolution, 0) * 2
    const radians = angles.toRadians(θ)
    const cartesian = coordinates.toCartesian(Vector.from([radius, radians, 0])).add(Vector.from([0, -10 + distortion, 0]))
    const projected = camera.project(cartesian.transform(perspective))
    const color = COLORS[index]

    if (tick === 0) {
      points.push(cartesian)
    }

    const point = projectedPoints[projectedPoints.length - (RADII.length - index)]

    if (point) {
      renderLine(context, projected, point, color, 2)
    }

    renderCircle(context, projected, 1, color, color)
  })

  // cull off-screen points
  let cullTo = 0

  for (let i = 0; i < points.length; i += RADII.length) {
    const cullable = points.slice(i, i * RADII.length).some(point => point.y >= 15)

    if (cullable) {
      cullTo = i * RADII.length
    } else {
      break;
    }
  }

  if (cullTo) {
    points = points.slice(cullTo, -1)
  }

  tick = (tick + 1) % LINE_INTERVAL
  θ += Δθ
  // prevent θ from getting too large
  // expect distortion & repetition when this wraps (360deg x 30 revolutions)
  if (θ === 10800) θ = 0

  window.requestAnimationFrame(step)
}

step()
