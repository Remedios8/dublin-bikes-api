# Process Data API

A small Node/TypeScript project that fetches a public dataset, infers a standardized schema, and exposes HTTP endpoints to inspect the schema and query the data with simple filters.

## Endpoints

- GET `/` — health / greeting.
- GET `/schema?url=<dataset_url>` — fetches the dataset (or the default configured source) and returns an inferred schema. The schema is an array of Field objects with properties `display`, `name`, `originalName`, `type`, and `options`. Use the `name` property (standardized field name) when querying.
- POST `/data?url=<dataset_url>` — returns the dataset records mapped to the schema's standardized field names and filtered according to the request body.

  Request body shape:
  ```json
  {
    "where": {
      "<schemaFieldName>": { "<operator>": <value> },
      "anotherField": { "eq": "value" }
    }
  }
  ```

  Supported operators:
  - `eq` — equal
  - `lt` — less than
  - `gt` — greater than

  Example: filter records where `availableBikes` > 5 and `stationName` equals "Portobello Harbour"
  ```bash
  curl -X POST 'http://localhost:4000/data' \ -H 'Content-Type: application/json' \ -d "{\"where\":{\"Available Bikes\":{\"gt\":5},\"Address\":{\"eq\":\"Portobello Harbour\"}}}"
  ```

  Note: Field names in the `where` object must match the schema `name` values returned by `/schema` (these are standardized names, not display/original dataset column headers).

## Configuration

Defaults are read from `config/default.json`:
- `port` — server port (default: 4000)
- `dataSource` — default dataset URL used when `?url=` is omitted

## Development

Install dependencies first. Provide the dataset URL in one of three ways: 
- set the `dataSource` field in `config/default.json`, 
- export the `DATASOURCE` environment variable, 
- pass `?url=<dataset_url>` as a query parameter to the endpoints. Then start the server:

```bash
npm install
DATASOURCE=YOUR.DATA.SOURCE.URL npm run start
```

The server uses Inversify and `inversify-express-utils` to register controllers. JSON request bodies are parsed automatically.

## Linting

ESLint is configured via `eslint.config.mts`. The rule `@typescript-eslint/no-explicit-any` is set to `warn` for TypeScript files to reduce noise while developing.

Run the linter:

```bash
npm run lint
```

## Notes

- The `/schema` endpoint returns the standardized field names to use with `/data` filtering — always inspect `/schema` first if you plan to filter by field.
- Filtering is applied after mapping dataset fields to the standardized schema names. Multiple field filters are combined with logical AND.
