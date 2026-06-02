import { useState } from "react"

const MIN_WIDTH = 170
const MAX_WIDTH = 500

export function useSidebarResize(initialWidth = 260) {
  const [sidebarWidth, setSidebarWidth] = useState(initialWidth)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setStartX(e.clientX)
    setStartWidth(sidebarWidth)
    const handleMouseMove = (ev: MouseEvent) => {
      const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + ev.clientX - startX))
      setSidebarWidth(newWidth)
    }
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  return { sidebarWidth, handleSidebarResizeStart: handleMouseDown }
}

/**
 * Right-side panel resize: drag left edge → moving right shrinks the panel.
 */
export function useRightResize(initialWidth = 260) {
  const [width, setWidth] = useState(initialWidth)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setStartX(e.clientX)
    setStartWidth(width)
    const handleMouseMove = (ev: MouseEvent) => {
      const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth - (ev.clientX - startX)))
      setWidth(newWidth)
    }
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  return { width, handleResizeStart: handleMouseDown }
}
