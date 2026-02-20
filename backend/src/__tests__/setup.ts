// Ensure test environment so app.ts does not start the server
if (process.env.NODE_ENV !== 'test') {
  process.env.NODE_ENV = 'test'
}
