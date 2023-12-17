# Google Map Web Component to work with Elm

Simple Google Map webcomponent with clickable markers.

## Params

```html
<map-icon
  api-key="abc123"
  center='{"lat":39.47228,"lng":-0.364284}'
  zoom="14"
  options='{"mapTypeId": "satellite"}'
  markers='[{"meta": "itemX", "position": {"lat":39.47228,"lng":-0.364284}}]'
/>
```

`markers` needs to be a list of objects with a `position` field in. On click, the entire object is returned so you can know which one was clicked.

## Development

- `npm run dev` - starts vite dev server with elm debugger
- `npm run start` - starts vite dev server without elm debugger
