
export const visibleHeightAtZDepth = (depth, camera) => {
  // compensate for cameras not positioned at z=0
  const cameraOffset = camera.position.z
  if (depth < cameraOffset) depth -= cameraOffset
  else depth += cameraOffset

  // vertical fov in radians
  const vFOV = camera.fov * Math.PI / 180

  // Math.abs to ensure the result is always positive
  return 2 * Math.tan(vFOV / 2) * Math.abs(depth)
}

export const visibleWidthAtZDepth = (depth, camera) => {
  const height = visibleHeightAtZDepth(depth, camera)
  return height * camera.aspect
}

export const getScreen = ({ camera, depth = camera.position.z }) => {
  const width = visibleWidthAtZDepth(depth, camera)
  const height = visibleHeightAtZDepth(depth, camera)
  const min = Math.min(width, height)
  const max = Math.max(width, height)
  return {
    min,
    max,
    isVertical: height > width,
    isLandscape: width > height,
    width,
    height
  }
}