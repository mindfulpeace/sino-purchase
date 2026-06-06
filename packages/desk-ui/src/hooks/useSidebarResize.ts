import { useState } from "react"

export function useSidebarResize(initialWidth = 200, minWidth = 120, maxWidth = 600) {
  const [sidebarWidth, setSidebarWidth] = useState(initialWidth)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const initialX = e.clientX
    const startWidth = sidebarWidth
    const handleMouseMove = (ev: MouseEvent) => {
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + ev.clientX - initialX))
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

export function useRightResize(initialWidth = 435, minWidth = 435, maxWidth = 800) {
  const [width, setWidth] = useState(initialWidth)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const initialX = e.clientX
    const startWidth = width
    const handleMouseMove = (ev: MouseEvent) => {
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth - (ev.clientX - initialX)))
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
