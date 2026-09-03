# todo

## move authentication into the `/users` terminal

- make `login`, `signup`, `logout`, and `whoami` real terminal commands backed by the existing GraphQL auth client
- use a dedicated prompt state for email, name, and password instead of accepting credentials in the command itself
- mask password entry and never append passwords to terminal output or command history
- change the shell prompt from `guest@kelev` to the authenticated user's name or email
- restore the signed-in terminal identity from local storage after a refresh
- keep `/welcome` and `/dashboard` as explicit lab routes until the terminal flow is working, then decide whether to remove or redirect them
- revisit `sudo admin` during the roles and permissions lab; replace the current theatrical `sessionStorage` elevation only when the backend can authorize it
