---
name: skill-ui-component-patterns
description: Reusable UI component patterns for building scalable component libraries. Use when creating design systems, component libraries, or reusable UI components. Triggers on component architecture, compound components, headless UI, polymorphic components. Source: skills.sh community
---

# UI Component Patterns

Patterns for building scalable, reusable, and accessible UI component libraries.

## Core Patterns

### 1. Polymorphic Components (as-prop)
Allow components to render as different HTML elements:
```tsx
type PolymorphicProps<E extends React.ElementType> = {
  as?: E
} & React.ComponentPropsWithoutRef<E>

function Text<E extends React.ElementType = 'span'>({
  as,
  ...props
}: PolymorphicProps<E>) {
  const Tag = as || 'span'
  return <Tag {...props} />
}

// Usage
<Text as="h1" className="text-4xl">Heading</Text>
<Text as="p" className="text-base">Paragraph</Text>
```

### 2. Compound Components
Share state between parent and child without prop drilling:
```tsx
const TabsContext = React.createContext<TabsContextType | null>(null)

function Tabs({ children, defaultValue }: TabsProps) {
  const [active, setActive] = useState(defaultValue)
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div>{children}</div>
    </TabsContext.Provider>
  )
}

Tabs.List = function TabsList({ children }) { return <div role="tablist">{children}</div> }
Tabs.Tab = function Tab({ value, children }) {
  const { active, setActive } = useContext(TabsContext)!
  return <button role="tab" aria-selected={active === value} onClick={() => setActive(value)}>{children}</button>
}
```

### 3. Render Props
Maximum flexibility for consumers:
```tsx
function DataFetcher({ url, children }: { url: string, children: (data: any, loading: boolean) => ReactNode }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch(url).then(r => r.json()).then(d => { setData(d); setLoading(false) }) }, [url])
  return <>{children(data, loading)}</>
}

// Usage
<DataFetcher url="/api/users">
  {(users, loading) => loading ? <Spinner /> : <UserList users={users} />}
</DataFetcher>
```

### 4. Headless Components
Logic without styles — consumer provides the UI:
```tsx
function useAccordion(items: AccordionItem[]) {
  const [openId, setOpenId] = useState<string | null>(null)
  const toggle = (id: string) => setOpenId(current => current === id ? null : id)
  return { openId, toggle, isOpen: (id: string) => openId === id }
}
```

### 5. Controlled vs Uncontrolled
Support both patterns:
```tsx
function Input({ value, defaultValue, onChange }: InputProps) {
  const [internal, setInternal] = useState(defaultValue ?? '')
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internal

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternal(e.target.value)
    onChange?.(e)
  }

  return <input value={currentValue} onChange={handleChange} />
}
```

### 6. Variants with CVA (Class Variance Authority)
```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const button = cva('inline-flex items-center justify-center rounded-md font-medium transition-colors', {
  variants: {
    variant: {
      primary: 'bg-blue-500 text-white hover:bg-blue-600',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      ghost: 'hover:bg-gray-100 text-gray-700',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    }
  },
  defaultVariants: { variant: 'primary', size: 'md' }
})
```

### 7. Accessibility Requirements
- All components must have proper ARIA roles
- Focus management for modals and dropdowns
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Screen reader announcements for dynamic content
