// Runtime twin of identity.dev.ts for bundlers that resolve the .js import literally.
// Keep values in sync with identity.dev.ts when changing the simulated viewer.

export const DEV_VIEWER = {
  sub: "user:dev",
  email: "dev@example.com",
  name: "Dev Viewer",
  teamId: 1,
  teamRole: "admin",
};
