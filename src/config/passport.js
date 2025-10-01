import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github";
import { env } from "~/config/environment";
import { userModel } from "~/models/userModel"; // hoặc User nếu bạn đặt tên khác

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENTID,
      clientSecret: env.GOOGLE_CLIENTSECRECT,
      callbackURL:
        env.BUILD_MODE === "dev"
          ? `${env.BACKEND_DOMAIN_DEVELOPMENT}/v1/auth/google/callback`
          : `${env.BACKEND_DOMAIN_PRODUCTION}/v1/auth/google/callback`,
    },

    async (accessToken, refreshToken, profile, done) => {
      console.log("🔥 Google profile:", profile);

      const email = profile.emails?.[0]?.value || null;
      if (!email) return done(new Error("No email from Google"), null);
      let user = await userModel.findOneByEmail(email);

      if (!user) {
        const createdUser = await userModel.createNew({
          email,
          displayName: profile.displayName,
          avatar: profile.photos[0].value,
          username: profile.displayName
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s/g, ""),
          provider: "google",
          isActive: true,
        });

        user = await userModel.findOneById(createdUser.insertedId);
      }

      return done(null, user);
    }
  )
);

// GitHub OAuth
passport.use(
  new GitHubStrategy(
    {
      clientID:
        env.BUILD_MODE === "dev"
          ? env.GITHUB_CLIENTID_DEV
          : env.GITHUB_CLIENTID_PROD,
      clientSecret:
        env.BUILD_MODE === "dev"
          ? env.GITHUB_CLIENTSECRET_DEV
          : env.GITHUB_CLIENTSECRET_PROD,
      callbackURL:
        env.BUILD_MODE === "dev"
          ? `${env.BACKEND_DOMAIN_DEVELOPMENT}/v1/auth/github/callback`
          : `${env.BACKEND_DOMAIN_PRODUCTION}/v1/auth/github/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("GitHub profile:", profile);

      const email =
        profile.emails?.[0]?.value || `${profile.username}@github.com`;

      let user = await userModel.findOneByEmail(email);

      if (!user) {
        const createdUser = await userModel.createNew({
          email,
          displayName: profile.displayName || profile.username,
          avatar: profile.photos?.[0]?.value,
          username: profile.username,
          provider: "github",
          isActive: true,
        });

        user = await userModel.findOneById(createdUser.insertedId);
      }

      return done(null, user);
    }
  )
);
