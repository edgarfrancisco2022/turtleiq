# Demo user feature

We need to create a demo user feature. The main purpose of this feature is to allow potential users to test the app without compromising by signing up.

We do not want to create a complex solution where the user later has the option to migrate their data if they choose to sign up.

It is more of a lurk around type of thing. Actually probably the only reason we have to implement this is more so that potential employers may take a quick look at the app without having to sign up.

So the it should be a simple solution where we just create a guest user on the database.

We could also create some initial concepts with MVKs, Im thinking something like React and Spring Boot, we could add the top 50 concepts needed for interviews (for spring boot we could have annotations as concept names for example). The mvks should be intutive and super concise where possible.

Then we need to have links to log in as a guest user, my initial thoughts is that we might need this link on the hero itself somehwere, much less prominent than the sign in / sign up buttons. almost as an afterthought for people that are either looking for it explicitly or users that might be curious if they can test quickly without singning up.. kind of like the user who is looking for a free trial..

then we might need this link on the signup and signin paths.

Please assume required expertise for this, im not an expert, im not sure how this guest login should look like, im not sure what the standard practice is, im not sure about the design is (i assume that the hero section design for this might need to be different from the design for the signin signup paths), im not sure about how to label this link so that its not invasive but it remains intuitive, im not sure about the exact location either.

please create a plan so we can have this feature implemented, feel free to improve on these ideas or expand on them, or simply come up with better ideas, you are the expert.

we just need to think that the design should fit in well with what we already have

it would be good if you can create the initial concepts as well and add them to the database directly, so that potential employers may feel related. we could include React, Spring Boot, and AWS, the top 50 concepts for each, with MVKs (no notes or references), if possible we could create a few different topics for each, and a tags like "React top 50", "Spring Boot top 50", etc...

otherwise, manually entering all of this might take a really long time.

### Deployment steps

Production deployment checklist

Yes, you need a database migration for production. Here's everything in order:

1. Run the migration on production Neon

The is_guest column (0003_nervous_molecule_man.sql) was only applied to your dev Neon branch. Run it against production before deploying the code — if the code deploys first, the app will crash trying to read a column that doesn't exist.

# From tortugaiq-next/

$env:DATABASE_URL="<your-production-neon-connection-string>"
npx drizzle-kit migrate
Your production connection string is in Vercel → project settings → Environment Variables → DATABASE_URL.

2. Add CRON_SECRET in Vercel

Go to Vercel → your project → Settings → Environment Variables → add:

CRON_SECRET = <same value you put in .env.local> 3. Deploy

Push to main — Vercel auto-deploys. The vercel.json cron job is already committed so it activates automatically.

4. Verify after deploy

Click "Try as guest" on the live landing page → should redirect to /app with demo data
Check Vercel → Functions → Cron Jobs → confirm /api/cleanup-guests appears scheduled for 0 3 \* \* \*
