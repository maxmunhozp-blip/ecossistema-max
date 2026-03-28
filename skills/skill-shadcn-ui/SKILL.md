---
name: skill-shadcn-ui
description: shadcn/ui component patterns and best practices. Use when building with shadcn/ui, installing components, customizing shadcn components, or building accessible UI with Radix UI primitives. Source: shadcn/ui on skills.sh
---

# shadcn/ui Patterns

Best practices for building with shadcn/ui — beautifully designed, accessible components built on Radix UI primitives.

## Installation

```bash
# Initialize shadcn in project
npx shadcn@latest init

# Add specific components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add table
npx shadcn@latest add toast
```

## Core Concepts

### 1. Component Structure
Components are copied into your project, not imported from npm:
```
src/
  components/
    ui/          ← shadcn components (git-tracked, customizable)
      button.tsx
      card.tsx
      dialog.tsx
    custom/      ← your custom components using shadcn primitives
```

### 2. Styling with cn()
Always use the `cn()` utility for conditional classes:
```tsx
import { cn } from "@/lib/utils"

function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow",
        className
      )}
      {...props}
    />
  )
}
```

### 3. Theming via CSS Variables
```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --accent: 240 4.8% 95.9%;
  --destructive: 0 84.2% 60.2%;
  --border: 240 5.9% 90%;
  --radius: 0.5rem;
}
.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* etc */
}
```

### 4. Common Patterns

**Form with validation (react-hook-form + zod):**
```tsx
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { email: "" },
})
```

**Dialog:**
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

**Toast:**
```tsx
const { toast } = useToast()
toast({ title: "Success", description: "Action completed." })
```

### 5. Customization
Edit the component files directly — they're in your repo:
```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        // Add custom variants here:
        brand: "bg-orange-500 text-white hover:bg-orange-600",
      }
    }
  }
)
```

### 6. Best Practices
- Always use `asChild` prop when wrapping with other components
- Use `Slot` for polymorphic components
- Prefer composing shadcn primitives over building from scratch
- Keep component files in `components/ui/` unmodified when possible
- Create wrapper components in `components/custom/` for customizations
