# Matta-Nuu

https://matta-nuu.netlify.app/#/

## Project setup

```
yarn install
```

### Compiles and hot-reloads for development

```
yarn serve
```

### Compiles and minifies for production

```
yarn build
```

### Lints and fixes files

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
