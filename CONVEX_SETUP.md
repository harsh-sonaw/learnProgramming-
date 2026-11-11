# Convex setup

The app stores the current profile/progress, community posts and comments, and
playground drafts in Convex when `VITE_CONVEX_URL` is configured. Existing
browser-local data is copied into an empty deployment on its first connection.
The app continues to use local storage if the variable is missing.

## Create or link the deployment

1. Install dependencies with the repository's package manager.
2. Run `npm run convex:dev` and sign in to Convex when prompted.
3. Create or select the `LearnEasy` project. Convex generates
   `convex/_generated` and adds the deployment settings to `.env.local`. Ensure
   the file includes `VITE_CONVEX_URL` with the deployment's `.convex.cloud` URL.
4. Restart the Vite development server after `.env.local` is created.

The deployment URL is public client configuration, not a secret. Do not put
Convex admin keys or deployment credentials in a `VITE_` variable.

## Cloudflare Pages

In the `learnprogramming` Pages project's build settings, set
`VITE_CONVEX_URL` to the `.convex.cloud` URL for the production deployment.
Set the same build variable for preview deployments if they should use Convex.
Then build and deploy the Pages site using its existing Cloudflare workflow.

## Demo-mode data access

This project currently uses one built-in demo profile and has no authentication.
Convex functions therefore expose the shared demo profile, posts, progress, and
playground code to anyone who can reach the public site. Visitors share and can
modify that data. Add authentication and per-user authorization before using
this deployment for private learner data or a public multi-user leaderboard.
The leaderboard's other entries are currently sample data; real per-learner
rankings also require authenticated user accounts.
