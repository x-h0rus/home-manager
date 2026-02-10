# Home Manager

A personal home management application built with React and Vite. Manage chores, finances, food planning, and family members in one place.

## Features

- **Dashboard** - Overview of today's chores and key metrics
- **Chores Management** - Track household chores with calendar view, assignments, and completion tracking
- **Finances** - Manage expenses, income, budgets, savings goals, and subscriptions with charts
- **Food Planning** - Menu planning, shopping lists, and pantry management
- **People** - Manage family members and household profiles

## Tech Stack

- **Frontend:** React 19, Vite 7, Tailwind CSS 4
- **State Management:** Zustand
- **Charts:** Recharts
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **Backend:** Supabase (Authentication & Database)

## Prerequisites

- Node.js 18+ 
- npm or bun
- Supabase account

## Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd home-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Configuration**
   
   Copy the example environment file:
   ```bash
   cp example.env .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

5. **Open in browser**
   
   Navigate to `http://localhost:5173`

## Build for Production

```bash
npm run build
# or
bun run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── layout/       # Layout components (Header, Navigation)
│   └── PrivateRoute.jsx
├── contexts/         # React contexts (Auth)
├── hooks/            # Custom React hooks
├── lib/              # External service configurations (Supabase)
├── pages/            # Page components
│   ├── chores/       # Chores management pages
│   ├── finances/     # Finance management pages
│   ├── food/         # Food planning pages
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   └── People.jsx
├── stores/           # Zustand state management stores
├── App.jsx           # Main app component with routing
├── index.css         # Global styles
└── main.jsx          # Application entry point
```

## Database Schema

The app uses Supabase with the following tables:

- `profiles` - User profiles and family members
- `chores` - Chore definitions with frequency and assignments
- `chore_completions` - Chore completion history
- `expenses` - Expense tracking
- `incomes` - Income tracking
- `budgets` - Monthly budgets by category
- `savings_goals` - Savings goals tracking
- `subscriptions` - Recurring subscriptions

## Authentication

This is a single-user application. New user registration has been disabled - only existing users can sign in.

## Security Notes

- Never commit `.env.local` or any files containing API keys
- The `.gitignore` is configured to exclude sensitive files
- Rotate your Supabase keys if they have been exposed

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

Private - Personal use only
