// Copyright (c) 2020 Nathaniel Wroblewski
// I am making my contributions/submissions to this project solely in my personal
// capacity and am not conveying any rights to any intellectual property of any
// third parties.

const render = (context, [x1, y1], [x2, y2], stroke = '#444444', width = 1) => {
  context.beginPath()
  context.moveTo(x1, y1)
  context.lineTo(x2, y2)

  context.shadowColor = stroke

  context.lineWidth = width
  context.strokeStyle = stroke
  context.stroke()
}

export default render
