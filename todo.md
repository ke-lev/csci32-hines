# todo

## move authentication into the `/users` terminal — done

- [x] make `login`, `signup`, `logout`, and `whoami` real terminal commands backed by the existing GraphQL auth client
- [x] prompt for username and password during login; prompt for username, email, and password during signup
- [x] mask password entry and never append passwords to terminal output or command history
- [x] change the shell prompt from `guest@kelev` to the authenticated username
- [x] restore the signed-in terminal identity from local storage after a refresh
- [x] keep `/welcome` and `/dashboard` as explicit lab routes; successful terminal login and signup lead to `/dashboard`
- [x] leave `sudo admin` on its current theatrical `sessionStorage` elevation until the roles and permissions lab can replace it with backend authorization
