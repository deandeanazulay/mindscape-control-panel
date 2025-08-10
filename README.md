# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/75bb2996-e535-44b9-a4c6-d20c7e096a86

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/75bb2996-e535-44b9-a4c6-d20c7e096a86) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/75bb2996-e535-44b9-a4c6-d20c7e096a86) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

## Mobile (iOS/Android) setup with Capacitor

Follow these steps after cloning your repo locally:

1. npm install
2. npm run build
3. npx cap add ios && npx cap add android
4. npx cap sync
5. iOS: npx cap run ios (or open ios/App.xcworkspace in Xcode)
6. Android: npx cap run android (or open android/ in Android Studio)

Notes
- Hot reload: capacitor.config.ts is preconfigured with the Lovable sandbox URL so the native app loads the live preview. Keep your Lovable preview running.
- After you pull new changes: run npx cap sync again.
- For production builds: remove the server.url from capacitor.config.ts and use the compiled web bundle (dist) by running npm run build before syncing.

