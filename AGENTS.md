# AGENTS.md — Matta Nuu

## Project Overview

Session/event management app for Dhamma centers (products, suppliers, recipes, inventories, orders, schedules). Vue 3 frontend with Supabase backend (auth + Postgres + realtime).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Vue 3 — **Options API only** (no Composition API, no `<script setup>`) |
| Build | Vue CLI 4.5 (`vue-cli-service serve/build`) |
| UI Components | PrimeVue 3.10 (`lara-light-indigo` theme) |
| Layout/Spacing | Bootstrap 5.1 **utilities only** (`bootstrap-utilities.css`) |
| Backend | Supabase (auth, Postgres, realtime subscriptions) |
| Router | Vue Router 4, hash mode (`#/path`) |
| Calendar | FullCalendar 6.1 |
| Rich Text | TinyMCE Vue 6 |
| Styles | SCSS |
| Lint | ESLint (Airbnb + Vue 3 essential), Prettier |

## Dev Environment

- **Dev server:** `yarn serve` → `http://localhost:8080/`
- **Test credentials:** `test@dhamma.org` / `behappy`
- **Test session:** ID `235` → `http://localhost:8080/#/sessions/235/overview`
- **Node version:** check `.nvmrc`

## Project Structure

```
src/
├── main.js                  # Entry point, plugins, global components, router guard
├── main.scss                # Global styles
├── App.vue                  # Root component, global state, data fetching, realtime
├── components/              # Reusable input components (Input*.vue, HelpMessage, Spinner)
├── views/
│   ├── Menu.vue             # Main navigation
│   ├── auth/                # Login, Register, ResetPassword, Profile
│   ├── sessions/            # Core feature (~20+ components)
│   ├── products/            # ProductsIndex, ProductForm
│   ├── suppliers/           # SuppliersIndex, SupplierForm
│   ├── recipies/            # RecipiesIndex, RecipieForm (note: "recipies" spelling)
│   ├── categories/          # CategoriesIndex, CategoryForm
│   ├── templates/           # TemplatesIndex, SaveTemplateDialog
│   ├── notes/               # NoteFormDialog
│   └── import/              # Import
├── services/
│   ├── supabase.js          # Supabase client (URL + anon key hardcoded)
│   ├── db-plugin.js         # Vue plugin: $db, CRUD helpers, realtime, toasts
│   ├── router.js            # Vue Router config
│   ├── stocks-mixin.js      # Stock calculation mixin + realtime
│   ├── calendar-mixin.js    # Calendar UI mixin
│   ├── units.js             # Unit conversions (kg/g, L/mL, etc.)
│   ├── utils.js             # Prototype extensions (Date, Number, String, Array)
│   └── debounce.js          # Debounce function + v-debounce directive
└── assets/                  # Images, SVGs
```

## State Management

**No Vuex/Pinia.** All global state lives in `App.vue` data and is accessed via `this.$root`:

- `this.$root.products`, `this.$root.suppliers`, `this.$root.recipies`, `this.$root.sessions`, `this.$root.orders`, `this.$root.notes`, `this.$root.categories`, `this.$root.inventories`
- All are **objects keyed by ID** (e.g., `products[42] = { id: 42, name: "Rice", ... }`)
- Computed arrays: `this.$root.productsArray`, `this.$root.sessionsArray`, etc.
- User: `this.$root.user`, `this.$root.userData`

## Data Layer (db-plugin)

The `$db` plugin (`db-plugin.js`) provides:

- **`this.dbCreate(table, object)`** — insert + toast + update `$root`
- **`this.dbUpdate(table, object)`** — update + toast + update `$root`
- **`this.dbDestroy(table, object)`** — delete + toast + remove from `$root`
- **`this.toastSuccess(msg)`** / **`this.toastError(error)`** — PrimeVue toasts
- **`this.$db.from(table)`** — direct Supabase query builder access
- **`executeWithTimeout(promise)`** — 15s timeout wrapper

All CRUD operations auto-inject `user_id`. Realtime subscriptions sync changes from Supabase to `$root`.

### Supabase Query Patterns

```js
// Select
this.$db.from('products').select().match({ user_id })
// Insert
this.$db.from('products').insert([obj]).select()
// Update
this.$db.from('products').update(obj).eq('id', id).select()
// Delete
this.$db.from('products').delete().eq('id', id)
// Upsert
this.$db.from('products').upsert(array)
```

## Routing

- Hash mode: all URLs use `#/` prefix
- Auth guard in `main.js`: redirects to `/login` if no session
- Public routes: `login`, `register`, `reset-password`
- Session child routes: `/sessions/:id/overview`, `/sessions/:id/schedule`, `/sessions/:id/stocks`, `/sessions/:id/orders`, `/sessions/:id/inventories`

## Component Conventions

### File Naming
- Views: `*Index.vue` (list), `*Form.vue` (create/edit dialog), `Session*.vue` (session sub-views)
- Components: `Input*.vue` (form selectors), `*Dialog.vue` (modal dialogs)
- Spelling: "recipies" (not "recipes") — keep this convention

### Code Style
- **Options API only** — `data()`, `methods`, `computed`, `watch`, `mounted`, `created`
- **Mixins** for shared logic: `StockMixin`, `CalendarMixin`
- **`inject`** for parent-provided data (e.g., `inject: ['sessionInventories']`)
- **No semicolons** (ESLint config)
- **Import alias:** `@/` → `src/`
- **Loading pattern:** `this.loading = true` → fetch → `this.loading = false`

### UI Patterns
- PrimeVue `Dialog` with `v-model:visible` for modals
- PrimeVue `DataTable` + `Column` for tables
- PrimeVue `Button`, `InputText`, `Dropdown`, `InputNumber` for forms
- Bootstrap utilities for layout: `d-flex`, `gap-2`, `mb-3`, `ms-auto`, etc.
- `ConfirmDialog` with `this.$confirm.require(...)` for delete confirmations
- PrimeVue CSS vars: `--primary-color`, `--surface-border`

### Form Dialog Pattern
```vue
<!-- Parent calls: this.$refs.form.show(object) -->
<template>
  <Dialog v-model:visible="visible" :header="title">
    <!-- form fields -->
    <template #footer>
      <Button label="Save" @click="save" />
    </template>
  </Dialog>
</template>
<script>
export default {
  data() { return { visible: false, object: {} } },
  methods: {
    show(obj) { this.object = { ...obj }; this.visible = true },
    async save() {
      if (this.object.id) await this.dbUpdate('table', this.object)
      else await this.dbCreate('table', this.object)
      this.visible = false
    }
  }
}
</script>
```

## Error Handling

- `toastError(error)`: 401 → redirect to login; otherwise PrimeVue toast (8s)
- `executeWithTimeout(promise)`: 15s timeout
- `isNetworkError(error)`: maps to "No internet connection" or "Connection timeout"
- Pattern: `const { data, error } = await ...; if (error) this.toastError(error)`

## Testing Changes

This is a frontend-only project. When making changes, **always verify visually in the browser**:
1. Navigate to `http://localhost:8080/`
2. Login with `test@dhamma.org` / `behappy`
3. For session-related features, use session ID `235`: `http://localhost:8080/#/sessions/235/overview`
4. Use the browser MCP tools to navigate, snapshot, and verify UI changes

## Key Reminders

- No TypeScript — plain JavaScript throughout
- No `.env` files — Supabase credentials are hardcoded in `supabase.js`
- Data objects are keyed by ID, not arrays — use `productsArray` computed for arrays
- Realtime is active — changes sync automatically via Postgres subscriptions
- `user_id` is auto-injected on all DB operations (RLS on Supabase side)
