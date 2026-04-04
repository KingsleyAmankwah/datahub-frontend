# DataHub Admin

A Next.js admin dashboard for managing data bundles, orders, payments, and fulfillment — built on top of the [datahub-api](../datahub-api).

## Requirements

- Node.js 18+
- npm 9+
- datahub-api running locally or remotely

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in the values:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

> The API runs on port `3000` by default. See the [datahub-api](../datahub-api) README for setup instructions.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

> Run the dev server on a different port to avoid conflicting with the API: `npm run dev -- -p 3001`

## Project Structure

```
app/
├── dashboard/
│   ├── orders/
│   │   └── [id]/         # Order detail page
│   ├── bundles/          # Bundle management page
│   └── layout.tsx        # Shared dashboard layout (sidebar, header)
├── login/                # Login page
├── layout.tsx            # Root layout
└── globals.css

components/
├── ui/                   # shadcn/ui primitives
├── layout/               # Sidebar, Header, Nav
├── dashboard/            # Stats cards, overview widgets
├── orders/               # Orders table, order detail
└── bundles/              # Bundles table, bundle form

hooks/                    # React Query hooks (useOrders, useBundles, etc.)
types/                    # TypeScript interfaces (Order, Bundle, User, etc.)
lib/
├── utils.ts              # cn() and shared utilities
├── api.ts                # Axios instance with auth interceptor
└── auth.ts               # Token helpers (js-cookie)
```

## Key Dependencies

| Package                  | Purpose                              |
| ------------------------ | ------------------------------------ |
| `next`                   | React framework (App Router)         |
| `@tanstack/react-query`  | Server state management              |
| `axios`                  | HTTP client for API calls            |
| `js-cookie`              | JWT token storage                    |
| `shadcn/ui` + `radix-ui` | UI component library                 |
| `tailwindcss`            | Utility-first CSS                    |
| `lucide-react`           | Icon library                         |
| `sonner`                 | Toast notifications                  |
| `next-themes`            | Dark/light mode                      |

## Authentication

The app uses JWT authentication. Tokens are stored in cookies via `js-cookie` and attached to every API request through an Axios interceptor.

## Scripts

| Command          | Description              |
| ---------------- | ------------------------ |
| `npm run dev`    | Start development server |
| `npm run build`  | Production build         |
| `npm run start`  | Start production server  |
| `npm run lint`   | Run ESLint               |
