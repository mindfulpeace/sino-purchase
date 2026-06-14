import { useCallback, useEffect, useRef, useState } from "react"
import {
  Alert,
  AnchorButton,
  Blockquote,
  Button,
  ButtonGroup,
  ButtonVariant,
  Callout,
  Card,
  CardList,
  Checkbox,
  CheckboxCard,
  Code,
  Collapse,
  CompoundTag,
  ControlGroup,
  Dialog,
  DialogBody,
  DialogFooter,
  Divider,
  Drawer,
  DrawerSize,
  EntityTitle,
  FileInput,
  FormGroup,
  H1, H2, H3, H4, H5, H6,
  HTMLSelect,
  InputGroup,
  Intent,
  KeyComboTag,
  Label,
  Menu,
  MenuDivider,
  MenuItem,
  MultiSlider,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  NonIdealState,
  NumericInput,
  OL,
  OverlayToaster,
  Popover,
  PopoverInteractionKind,
  Pre,
  ProgressBar,
  Radio,
  RadioCard,
  RadioGroup,
  RangeSlider,
  SegmentedControl,
  Slider,
  Spinner,
  Switch,
  SwitchCard,
  Tab,
  Tabs,
  Tag,
  TagInput,
  TextArea,
  Tooltip,
  Tree,
  UL,
} from "@blueprintjs/core"
import { Breadcrumbs } from "@blueprintjs/core/lib/esm/components/breadcrumbs/breadcrumbs"
import type { Toaster } from "@blueprintjs/core/lib/esm/components/toast/toaster"
import { IconNames } from "@blueprintjs/icons"
import { Cell, Column, Table2 } from "@blueprintjs/table"
import { SectionBox } from "./showcase/SectionBox"

/* ─────────── 1. Typography ─────────── */

function TypographySection() {
  return (
    <SectionBox title="Typography">
      <div style={{ width: "100%" }}>
        <H1>Heading H1</H1>
        <H2>Heading H2</H2>
        <H3>Heading H3</H3>
        <H4>Heading H4</H4>
        <H5>Heading H5</H5>
        <H6>Heading H6</H6>
      </div>
      <Blockquote>Blockquote — lorem ipsum dolor sit amet</Blockquote>
      <div>Inline <Code>code</Code> and <Pre style={{ display: "inline" }}>pre</Pre>.</div>
      <Label>Styled label element</Label>
      <OL><li>Ordered item</li><li>Another item</li></OL>
      <UL><li>Unordered item</li><li>Another item</li></UL>
    </SectionBox>
  )
}

/* ─────────── 2. Buttons ─────────── */

function ButtonsSection() {
  const intents = [Intent.NONE, Intent.PRIMARY, Intent.SUCCESS, Intent.WARNING, Intent.DANGER]
  return (
    <SectionBox title="Buttons">
      <div style={{ width: "100%", marginBottom: 4, fontWeight: 500, fontSize: 13, color: "var(--text-dim)" }}>Intent &times; Variant</div>
      {intents.map((intent) => (
        <div key={intent} style={{ display: "flex", gap: 8, flexWrap: "wrap", width: "100%", marginBottom: 8 }}>
          <Button intent={intent} text="Solid" />
          <Button intent={intent} variant={ButtonVariant.OUTLINED} text="Outlined" />
          <Button intent={intent} variant={ButtonVariant.MINIMAL} text="Minimal" />
        </div>
      ))}
      <div style={{ width: "100%", marginTop: 4, fontWeight: 500, fontSize: 13, color: "var(--text-dim)" }}>AnchorButton</div>
      <AnchorButton intent={Intent.PRIMARY} icon={IconNames.ARROW_RIGHT} text="Anchor" />
      <AnchorButton variant={ButtonVariant.OUTLINED} icon={IconNames.DOWNLOAD} text="Download" />

      <div style={{ width: "100%", marginTop: 4, fontWeight: 500, fontSize: 13, color: "var(--text-dim)" }}>ButtonGroup</div>
      <ButtonGroup>
        <Button icon={IconNames.EDIT} text="Edit" />
        <Button icon={IconNames.DUPLICATE} text="Copy" />
        <Button icon={IconNames.TRASH} intent={Intent.DANGER} text="Delete" />
      </ButtonGroup>
      <ButtonGroup variant={ButtonVariant.OUTLINED}>
        <Button icon={IconNames.ADD} text="Add" />
        <Button icon={IconNames.REMOVE} text="Remove" />
      </ButtonGroup>
    </SectionBox>
  )
}

/* ─────────── 3. Form Inputs ─────────── */

function FormInputsSection() {
  const [text, setText] = useState("")
  const [num, setNum] = useState(0)
  const [sel, setSel] = useState("a")
  return (
    <SectionBox title="Form Inputs">
      <FormGroup label="InputGroup" helperText="With icon">
        <InputGroup leftIcon={IconNames.USER} placeholder="Username" />
      </FormGroup>
      <FormGroup label="InputGroup (intent)">
        <InputGroup intent={Intent.DANGER} placeholder="Invalid value" value={text} onChange={(e) => setText(e.target.value)} />
      </FormGroup>
      <FormGroup label="TextArea">
        <TextArea placeholder="Multi-line text" />
      </FormGroup>
      <FormGroup label="NumericInput">
        <NumericInput value={num} onValueChange={setNum} min={0} max={100} />
      </FormGroup>
      <FormGroup label="FileInput">
        <FileInput text="Choose file..." />
      </FormGroup>
      <FormGroup label="HTMLSelect">
        <HTMLSelect value={sel} onChange={(e) => setSel(e.target.value)}>
          <option value="a">Option A</option>
          <option value="b">Option B</option>
          <option value="c">Option C</option>
        </HTMLSelect>
      </FormGroup>
      <FormGroup label="ControlGroup">
        <ControlGroup>
          <InputGroup placeholder="Search…" />
          <Button icon={IconNames.SEARCH} intent={Intent.PRIMARY} />
        </ControlGroup>
      </FormGroup>
    </SectionBox>
  )
}

/* ─────────── 4. Selection Controls ─────────── */

function SelectionSection() {
  const [checked, setChecked] = useState(false)
  const [radio, setRadio] = useState("one")
  const [seg, setSeg] = useState("day")
  return (
    <SectionBox title="Selection Controls">
      <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} label="Checkbox" />
      <Switch checked={checked} onChange={(e) => setChecked(e.target.checked)} label="Switch" />
      <RadioGroup label="RadioGroup" selectedValue={radio} onChange={(e) => setRadio(e.target.value)}>
        <Radio label="One" value="one" />
        <Radio label="Two" value="two" />
        <Radio label="Three" value="three" />
      </RadioGroup>
      <SegmentedControl
        options={[
          { label: "Day", value: "day" },
          { label: "Week", value: "week" },
          { label: "Month", value: "month" },
        ]}
        value={seg}
        onValueChange={setSeg}
      />
      <CheckboxCard checked={checked} onChange={(e) => setChecked(e.target.checked)} label="CheckboxCard" />
      <RadioCard checked={radio === "one"} label="RadioCard" />
      <SwitchCard checked={checked} onChange={(e) => setChecked(e.target.checked)} label="SwitchCard" />
    </SectionBox>
  )
}

/* ─────────── 5. Sliders ─────────── */

function SlidersSection() {
  const [s, setS] = useState(50)
  const [r, setR] = useState([20, 70] as [number, number])
  const [m, setM] = useState([30, 60, 85])

  const handleChange = useCallback((idx: number) => (v: number) => {
    setM((prev) => {
      const next = [...prev] as number[]
      next[idx] = v
      return next
    })
  }, [])

  return (
    <SectionBox title="Sliders">
      <div style={{ width: "100%" }}>
        <div style={{ marginBottom: 4, fontSize: 12, color: "var(--text-dim)" }}>Slider: {s}</div>
        <Slider value={s} onChange={setS} min={0} max={100} labelStepSize={10} />
      </div>
      <div style={{ width: "100%" }}>
        <div style={{ marginBottom: 4, fontSize: 12, color: "var(--text-dim)" }}>RangeSlider: {r[0]} &ndash; {r[1]}</div>
        <RangeSlider value={r} onChange={setR} min={0} max={100} labelStepSize={10} />
      </div>
      <div style={{ width: "100%" }}>
        <div style={{ marginBottom: 4, fontSize: 12, color: "var(--text-dim)" }}>MultiSlider: [{m.join(", ")}]</div>
        <MultiSlider min={0} max={100} labelStepSize={10}>
          <MultiSlider.Handle value={m[0]} onChange={handleChange(0)} />
          <MultiSlider.Handle value={m[1]} onChange={handleChange(1)} />
          <MultiSlider.Handle value={m[2]} onChange={handleChange(2)} />
        </MultiSlider>
      </div>
    </SectionBox>
  )
}

/* ─────────── 6. TagInput ─────────── */

function TagInputSection() {
  const [tags, setTags] = useState<string[]>(["apple", "banana", "cherry"])
  return (
    <SectionBox title="TagInput">
      <TagInput values={tags} onChange={(v) => setTags(v as string[])} placeholder="Add tag..." leftIcon={IconNames.TAG} />
      <KeyComboTag combo="mod+s" />
    </SectionBox>
  )
}

/* ─────────── 7. Display ─────────── */

function DisplaySection() {
  return (
    <SectionBox title="Display">
      <Card elevation={0} style={{ width: 130 }}>Elevation 0</Card>
      <Card elevation={1} style={{ width: 130 }}>Elevation 1</Card>
      <Card elevation={2} style={{ width: 130 }}>Elevation 2</Card>
      <Card elevation={3} style={{ width: 130 }}>Elevation 3</Card>
      <CardList style={{ width: 200 }}>
        <Card>CardList #1</Card>
        <Card>CardList #2</Card>
        <Card>CardList #3</Card>
      </CardList>
      <Callout intent={Intent.NONE} title="Default" style={{ width: 220 }}>Default callout.</Callout>
      <Callout intent={Intent.PRIMARY} title="Primary" style={{ width: 220 }}>Primary callout.</Callout>
      <Callout intent={Intent.SUCCESS} title="Success" style={{ width: 220 }}>Success callout.</Callout>
      <Callout intent={Intent.WARNING} title="Warning" style={{ width: 220 }}>Warning callout.</Callout>
      <Callout intent={Intent.DANGER} title="Danger" style={{ width: 220 }}>Danger callout.</Callout>
      <Tag>Default</Tag>
      <Tag intent={Intent.PRIMARY}>Primary</Tag>
      <Tag intent={Intent.SUCCESS}>Success</Tag>
      <Tag intent={Intent.WARNING}>Warning</Tag>
      <Tag intent={Intent.DANGER}>Danger</Tag>
      <Tag minimal intent={Intent.PRIMARY}>Minimal</Tag>
      <Tag large>Large</Tag>
      <CompoundTag leftContent="Left">Right</CompoundTag>
      <Divider />
      <EntityTitle title="Entity Title" subtitle="Subtitle" icon={IconNames.DOCUMENT} />
    </SectionBox>
  )
}

/* ─────────── 8. Feedback & Overlays ─────────── */

function FeedbackSection() {
  const [alertOpen, setAlertOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapseOpen, setCollapseOpen] = useState(false)

  const toasterRef = useRef<Toaster | null>(null)

  useEffect(() => {
    OverlayToaster.create().then((t) => { toasterRef.current = t })
  }, [])

  const showToast = useCallback(() => {
    toasterRef.current?.show({ message: "Toast message!", intent: Intent.SUCCESS, timeout: 3000 })
  }, [])

  return (
    <SectionBox title="Feedback & Overlays">
      <Alert isOpen={alertOpen} onConfirm={() => setAlertOpen(false)} onCancel={() => setAlertOpen(false)}
        cancelButtonText="Cancel" confirmButtonText="OK">
        <p>Are you sure?</p>
      </Alert>
      <Button text="Alert" onClick={() => setAlertOpen(true)} />

      <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Dialog" style={{ paddingBottom: 0 }}>
        <DialogBody><p>Dialog body content.</p></DialogBody>
        <DialogFooter actions={<Button intent={Intent.PRIMARY} text="Close" onClick={() => setDialogOpen(false)} />} />
      </Dialog>
      <Button text="Dialog" onClick={() => setDialogOpen(true)} />

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Drawer" size={DrawerSize.SMALL}>
        <div style={{ padding: 16 }}>Drawer content</div>
      </Drawer>
      <Button text="Drawer" onClick={() => setDrawerOpen(true)} />

      <Button text="Toast" onClick={showToast} />

      <Popover content={<div style={{ padding: 12 }}>Popover content</div>}
        interactionKind={PopoverInteractionKind.CLICK}>
        <Button text="Popover" />
      </Popover>

      <Tooltip content="Tooltip text">
        <Button text="Tooltip" variant={ButtonVariant.OUTLINED} />
      </Tooltip>

      <Spinner intent={Intent.PRIMARY} size={20} />
      <Spinner intent={Intent.SUCCESS} size={20} />
      <Spinner intent={Intent.WARNING} size={20} />
      <Spinner intent={Intent.DANGER} size={20} />

      <ProgressBar value={0.6} intent={Intent.PRIMARY} style={{ width: 160 }} />
      <ProgressBar value={0.8} intent={Intent.SUCCESS} animate={false} style={{ width: 160 }} />

      <Button text="Collapse" onClick={() => setCollapseOpen((p) => !p)} />
      <div style={{ width: "100%" }}>
        <Collapse isOpen={collapseOpen}>
          <Card>This content can be collapsed.</Card>
        </Collapse>
      </div>

      <div style={{ width: "100%" }}>
        <NonIdealState icon={IconNames.SEARCH} title="No results" description="Try adjusting your query." />
      </div>
    </SectionBox>
  )
}

/* ─────────── 9. Navigation ─────────── */

function NavigationSection() {
  const [tabId, setTabId] = useState<string | number>("tab-a")
  return (
    <SectionBox title="Navigation">
      <Breadcrumbs items={[
        { text: "Home", href: "#" },
        { text: "Library", href: "#" },
        { text: "Data", current: true },
      ]} />
      <Navbar style={{ width: "100%" }}>
        <NavbarGroup align="left">
          <NavbarHeading>Navbar</NavbarHeading>
          <NavbarDivider />
          <Button minimal icon={IconNames.HOME} text="Home" />
          <Button minimal icon={IconNames.SETTINGS} text="Settings" />
        </NavbarGroup>
      </Navbar>
      <Tabs id="t" selectedTabId={tabId} onChange={(id) => setTabId(id)}>
        <Tab id="tab-a" title="Tab A" panel={<p>Panel A</p>} />
        <Tab id="tab-b" title="Tab B" panel={<p>Panel B</p>} />
        <Tab id="tab-c" title="Tab C" panel={<p>Panel C</p>} />
      </Tabs>
      <Menu style={{ width: 200 }}>
        <MenuItem icon={IconNames.NEW_PERSON} text="New person" />
        <MenuItem icon={IconNames.SETTINGS} text="Settings" />
        <MenuDivider />
        <MenuItem icon={IconNames.TRASH} text="Delete" intent={Intent.DANGER} />
      </Menu>
    </SectionBox>
  )
}

/* ─────────── 10. Table ─────────── */

function TableSection() {
  const rows = [
    { name: "Alice", age: 30, email: "alice@example.com" },
    { name: "Bob", age: 25, email: "bob@example.com" },
    { name: "Charlie", age: 35, email: "charlie@example.com" },
  ]
  return (
    <SectionBox title="Table">
      <Table2 numRows={rows.length} enableGhostCells>
        <Column name="Name" cellRenderer={(r) => <Cell>{rows[r].name}</Cell>} />
        <Column name="Age" cellRenderer={(r) => <Cell>{rows[r].age}</Cell>} />
        <Column name="Email" cellRenderer={(r) => <Cell>{rows[r].email}</Cell>} />
      </Table2>
    </SectionBox>
  )
}

/* ─────────── 11. Tree ─────────── */

function TreeSection() {
  return (
    <SectionBox title="Tree">
      <div style={{ width: "100%", maxWidth: 360 }}>
        <Tree contents={[
          { id: 0, icon: IconNames.FOLDER_CLOSE, label: "src", isExpanded: true, childNodes: [
            { id: 1, icon: IconNames.CODE, label: "App.tsx" },
            { id: 2, icon: IconNames.CODE, label: "main.tsx" },
            { id: 3, icon: IconNames.FOLDER_CLOSE, label: "pages", isExpanded: true, childNodes: [
              { id: 4, icon: IconNames.CODE, label: "CsvEditor.tsx" },
            ]},
          ]},
          { id: 5, icon: IconNames.DOCUMENT, label: "package.json" },
        ]} />
      </div>
    </SectionBox>
  )
}

/* ═══════════════════════════════════════════════
   Main
   ═══════════════════════════════════════════════ */

export default function ComponentShowcase() {
  return (
    <div className="component-showcase" style={{ overflow: "auto", height: "100%" }}>
      <div style={{ padding: "12px 20px 0", fontSize: 12, color: "var(--text-dim)" }}>
        @blueprintjs/core &middot; @blueprintjs/icons &middot; @blueprintjs/table
      </div>
      <div style={{ padding: "0 20px 24px" }}>
        <TypographySection />
        <ButtonsSection />
        <FormInputsSection />
        <SelectionSection />
        <SlidersSection />
        <TagInputSection />
        <DisplaySection />
        <FeedbackSection />
        <NavigationSection />
        <TableSection />
        <TreeSection />
      </div>
    </div>
  )
}
