# Matta-Nuu

https://matta-nuu.netlify.app/#/

### Stack

- VueJs 3 + Vue CLI
- Database with [Supabase](https://supabase.com/). [Voir la doc](https://supabase.com/docs/reference/javascript/select)
- Component Library : [Primevue](https://primevue.org/)

### Project setup

- Install [NVM](https://github.com/nvm-sh/nvm)
- `git clone https://github.com/dhammaorg/matta-nuu.git`
- `cd matta-nuu`
- `nvm use`
- `npm install -g yarn`
- `yarn install`

### Compiles and hot-reloads for development

```
yarn serve
```

### Production database is used for dev

Be careful, the same database (provided by supabase) is used for production and dev.
So for dev purpose beter create a new user so you'll be sure to not break anything

### Compiles and minifies for production

```
yarn build
```

### Linters

If you are using VSCode, please use the existing configuration
`cp .vscode/settings-example.json .vscode/settings.json` and install the recommended extensions

Otherwise, before pushing you run linters with

```
yarn lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

### Database scheme

```mermaid

classDiagram
    class Session {
        int id
        datetime created_at
        Event[] events
        Row[] rows
    }

    class Event {
        int id
        string[] days
        string name
        datetime start_date
        int people_count
    }

    class Row {
        int id
        string type
        string label
        Map values
        bool printable
        int recipie_id
    }

    class Recipe {
        int id
        datetime created_at
        Product[] products
        string name
        int people_count
        string user_id
        bool? prepare_day_before
        int[]? category_ids
    }

    class Product {
        int id
        datetime created_at
        string name
        string unit
        string user_id
        int supplier_id
        string? packaging_reference
        string? packaging_conditioning
        int category_id
        bool packaging_convert_to_piece
        int[] storage_area_ids
    }

    class Category {
        int id
        string name
        string type
        string user_id
    }

    class Supplier {
        int id
        datetime created_at
        string user_id
        string name
        string description
        string? order_header
        string? order_footer
        string contact_details
    }

    Session --> Event : contains
    Session --> Row : contains
    Row --> Recipe : references
    Recipe --> Product : uses
    Product --> Supplier : provided by
    Product --> Category : belongs to

```
