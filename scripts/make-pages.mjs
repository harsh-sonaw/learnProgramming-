import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const PAGES = [
  ['workspace', 'workspace', 'Coding Workspace', 'Solve hands-on exercises with live tests, progressive hints, and instant feedback across Python, JavaScript, TypeScript, Go and SQL.'],
  ['daily-challenge', 'daily', 'Daily Challenge', 'A new short challenge every day. Solve it to keep your streak alive and earn bonus XP.'],
  ['playground', 'sandbox', 'Playground', 'A scratchpad for Python, JavaScript, TypeScript, Go and SQL. Run code, then share the snippet.'],
  ['playground/share', 'sandboxShare', 'Share Snippet', 'Publish a playground snippet to the community as a discussion others can fork.'],
  ['leaderboard', 'leaderboards', 'Leaderboard', 'Weekly and all-time XP standings across DevPulse leagues.'],
  ['community', 'community', 'Community', 'Ask questions, share projects, and find people to build with.'],
  ['community/new', 'communityNew', 'New Discussion', 'Start a question, tip, showcase, or collaborative project.'],
  ['community/post', 'communityPost', 'Discussion', 'Read a discussion and join the thread.'],
  ['profile', 'profile', 'Your Profile', 'Your level, streak, solved exercises, language progress and badges.'],
  ['profile/badges', 'profileBadges', 'Badges', 'Every badge available on DevPulse and which ones you have unlocked.'],
  ['profile/edit', 'profileEdit', 'Edit Profile', 'Change your display name, bio and avatar colour.'],
  ['streak', 'streak', 'Streak', 'Your streak history, freezes and milestones.'],
];

const html = (page, title, description) => `<!doctype html>
<html lang="en" class="dark" data-page="${page}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} - DevPulse</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title} - DevPulse" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

for (const [file, page, title, description] of PAGES) {
  const target = join(process.cwd(), `${file}.html`);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html(page, title, description), 'utf8');
  console.log(`wrote ${file}.html  (data-page="${page}")`);
}
