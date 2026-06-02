import { useState } from "react"

/**
 * Left-side panel resize: drag right edge → moving right grows the panel.
 */
export function useSidebarResize(initialWidth = 300, minWidth = 120, maxWidth = 600) {
  const [sidebarWidth, setSidebarWidth] = useState(initialWidth)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setStartX(e.clientX)
    setStartWidth(sidebarWidth)
    const handleMouseMove = (ev: MouseEvent) => {
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + ev.clientX - startX))
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
export function useRightResize(initialWidth = 260, minWidth = 120, maxWidth = 500) {
  const [width, setWidth] = useState(initialWidth)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setStartX(e.clientX)
    setStartWidth(width)
    const handleMouseMove = (ev: MouseEvent) => {
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth - (ev.clientX - startX)))
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
