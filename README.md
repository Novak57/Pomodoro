# Pomodoro

Small Angular Pomodoro timer (standalone components, signals, local settings).

## Run locally

```bash
npm install
npm start
```

```bash
npm test
```

## GitHub Pages

1. Create a repository on GitHub and push this project (branch `main`).
2. In the repo: **Settings → Pages → Build and deployment**
3. Set **Source** to **GitHub Actions** (not “Deploy from a branch”).
4. Open the **Actions** tab and confirm the “Deploy to GitHub Pages” workflow succeeds.

The app will be at:

`https://<your-username>.github.io/<repository-name>/`

The workflow sets `--base-href` from the repository name, so keep the repo name in sync with that URL path (GitHub’s default is case-insensitive, but the subdirectory usually matches the repo name you chose).

### Try a production-like build locally

Replace `YourRepo` with your GitHub repo name:

```bash
npm run build -- --base-href /YourRepo/
npx --yes serve dist/pomodoro/browser -p 4321
```

Then open `http://localhost:4321/YourRepo/`.
