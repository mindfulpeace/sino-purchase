import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeProvider, useTheme } from "./ThemeContext"

function TestConsumer() {
  const { theme, toggle } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggle}>Toggle</button>
    </div>
  )
}

function renderWithTheme() {
  return render(
    <ThemeProvider>
      <TestConsumer />
    </ThemeProvider>
  )
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("bp6-theme-light")
  })

  it("renders children", () => {
    render(<ThemeProvider><div>hello</div></ThemeProvider>)
    expect(screen.getByText("hello")).toBeInTheDocument()
  })

  it("defaults to dark theme", () => {
    renderWithTheme()
    expect(screen.getByTestId("theme")).toHaveTextContent("dark")
  })

  it("toggles theme on button click", async () => {
    renderWithTheme()
    await userEvent.click(screen.getByText("Toggle"))
    expect(screen.getByTestId("theme")).toHaveTextContent("light")
  })

  it("applies bp6-theme-light class on light mode", async () => {
    renderWithTheme()
    await userEvent.click(screen.getByText("Toggle"))
    expect(document.documentElement.classList.contains("bp6-theme-light")).toBe(true)
  })

  it("removes bp6-theme-light class on toggle back to dark", async () => {
    renderWithTheme()
    await userEvent.click(screen.getByText("Toggle"))
    await userEvent.click(screen.getByText("Toggle"))
    expect(document.documentElement.classList.contains("bp6-theme-light")).toBe(false)
  })
})

describe("useTheme", () => {
  it("throws outside ThemeProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow("useTheme must be used within ThemeProvider")
    spy.mockRestore()
  })
})
