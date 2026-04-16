# CLAUDE.md

## ⚠️ CLAUDE - READ YOUR BRAIN FIRST!

**Your persistent memory system is located at: `/mnt/c/Users/Napo/Desktop/claude-brain/`**

Before working on this project, load your context:

1. **Read**: `/mnt/c/Users/Napo/Desktop/claude-brain/README.md` - How your brain works
2. **Read**: `/mnt/c/Users/Napo/Desktop/claude-brain/projects/intitech-main.md` - This project's full context
3. **Read**: `/mnt/c/Users/Napo/Desktop/claude-brain/context/current-focus.md` - What we're currently working on
4. **Read**: `/mnt/c/Users/Napo/Desktop/claude-brain/patterns/user-preferences.md` - How Napo likes to work

This ensures you have full context and continuity from previous conversations.

---

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NextMerce is a Next.js 15 eCommerce template built with TypeScript, React 19, Redux Toolkit, and Tailwind CSS. This is the free/lite version with static pages and basic eCommerce functionality without backend integrations.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Architecture

### App Structure (Next.js App Router)

- `src/app/(site)/` - Main site pages with shared layout
  - `(pages)/` - Route group for standard pages (cart, checkout, contact, shop variants, auth)
  - `blogs/` - Blog-related pages
  - `layout.tsx` - Root layout with providers and global components
  - `page.tsx` - Home page entry point

### State Management (Redux Toolkit)

The application uses Redux Toolkit for client-side state. Store configuration is in `src/redux/store.ts`.

**Redux Slices:**
- `cart-slice.ts` - Shopping cart state (add/remove items, update quantities, calculate totals)
- `wishlist-slice.ts` - Wishlist functionality
- `quickView-slice.ts` - Quick view modal state
- `product-details.ts` - Product detail view state

**Provider Setup:** Redux is wrapped via `ReduxProvider` in the root layout, which must be a client component ("use client").

### Context Providers

Three React Context providers manage modal/UI state (located in `src/app/context/`):
- `CartSidebarModalContext` - Controls cart sidebar visibility
- `QuickViewModalContext` - Controls product quick view modal
- `PreviewSliderContext` - Controls image preview slider modal

**Provider Nesting Order (in layout.tsx):**
```
ReduxProvider
  → CartModalProvider
    → ModalProvider
      → PreviewSliderProvider
```

### Component Organization

- `src/components/` - All React components organized by feature/page
  - `Common/` - Shared components (modals, scroll-to-top, preloader)
  - `Header/` and `Footer/` - Layout components
  - `Home/` - Home page sections (Hero, Categories, BestSeller, NewArrivals, Testimonials, etc.)
  - `Shop*/` - Shop page variants with/without sidebar
  - `Cart/`, `Checkout/`, `Wishlist/` - eCommerce flow components
  - `Auth/` - Sign in/up components
  - `Blog*/` - Blog-related components

### Type Definitions

Located in `src/types/`:
- `product.ts` - Product interface with title, price, discountedPrice, reviews, id, and optional imgs
- `category.ts`, `blogItem.ts`, `testimonial.ts`, `Menu.ts` - Other type definitions

### Styling

- **Tailwind CSS** with custom configuration in `tailwind.config.ts`
- Custom color palette (dark, gray, blue, red, green, yellow, teal, orange variants)
- Extended spacing scale (4.5 through 230)
- Custom font sizes (heading-1 through heading-6, custom-xl, custom-lg, etc.)
- Custom font family: "Euclid Circular A" (loaded via `src/app/css/euclid-circular-a-font.css`)
- Global styles in `src/app/css/style.css`

### Path Aliases

TypeScript path mapping configured in `tsconfig.json`:
- `@/*` maps to `./src/*`

Example: `import Header from "@/components/Header"`

## Key Patterns

### Client vs Server Components

- Layout and provider components use `"use client"` directive
- Page components (routes) are server components by default
- Context providers and Redux integration require client components

### Product Data Flow

1. Products are typed with the `Product` interface from `@/types/product`
2. Cart uses a derived `CartItem` type that includes `quantity` field
3. Redux selectors like `selectCartItems` and `selectTotalPrice` provide derived state
4. Cart calculations use `discountedPrice * quantity` for totals

### Modal Management

Modals are globally available but controlled via context hooks:
- `useCartModalContext()` - Access cart sidebar controls
- `useModalContext()` - Access quick view modal controls
- `usePreviewSliderContext()` - Access image preview controls

## Important Notes

- This is a static template without database or authentication integrations
- Product data is currently static/mock data within components
- No API routes or backend functionality included
- Cart state is client-side only (not persisted)
- ESLint configured with Next.js core web vitals rules
