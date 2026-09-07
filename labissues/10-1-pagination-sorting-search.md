# pagination, sorting, and search lab issues

## step 6's example variables put `query` in the wrong place

compatibility: step 3 defines `query` on `FindManyUsersFilters` and exposes it on `FindManyUsersInput` as the nested `filters` field, but the step 6 query variables set it at the top level of `params`:

```json
{ "params": { "skip": 0, "take": 3, "sortColumn": "name", "sortDirection": "ASC", "query": "admin" } }
```

graphql validates input objects strictly, so the whole request is rejected before it reaches a resolver: `Variable "$params" got invalid value ...; Field "query" is not defined by type "FindManyUsersInput"`. neither `findManyUsers` nor `totalUsers` runs, so the search acceptance tests can't pass with the variables as printed

workaround: nest it under `filters`, matching the input type the lab just built

```json
{ "params": { "skip": 0, "take": 3, "sortColumn": "name", "sortDirection": "ASC", "filters": { "query": "admin" } } }
```

the acceptance test that says `totalUsers(filters: { query: "adm" })` has the same problem — `totalUsers` takes `params`, not `filters`, so it's `totalUsers(params: { filters: { query: "adm" } })`
