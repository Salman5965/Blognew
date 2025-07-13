import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/User.js";

// JWT Strategy for regular authentication
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.userId);
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if user exists with same email
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.avatar = user.avatar || profile.photos[0]?.value;
            await user.save();
            return done(null, user);
          }

          // Create new user
          const username = await generateUniqueUsername(
            profile.displayName || profile.emails[0].value.split("@")[0],
          );

          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            username: username,
            firstName: profile.name.givenName || "",
            lastName: profile.name.familyName || "",
            avatar: profile.photos[0]?.value || "",
            isEmailVerified: true, // Google emails are verified
            role: "user",
          });

          await user.save();
          return done(null, user);
        } catch (error) {
          console.error("Google OAuth error:", error);
          return done(error, null);
        }
      },
    ),
  );
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/api/auth/github/callback",
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this GitHub ID
          let user = await User.findOne({ githubId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Get primary email from GitHub
          const primaryEmail =
            profile.emails?.find((email) => email.primary)?.value ||
            profile.emails?.[0]?.value;

          if (!primaryEmail) {
            return done(new Error("No email found in GitHub profile"), null);
          }

          // Check if user exists with same email
          user = await User.findOne({ email: primaryEmail });

          if (user) {
            // Link GitHub account to existing user
            user.githubId = profile.id;
            user.avatar = user.avatar || profile.photos[0]?.value;
            await user.save();
            return done(null, user);
          }

          // Create new user
          const username = await generateUniqueUsername(
            profile.username || primaryEmail.split("@")[0],
          );

          user = new User({
            githubId: profile.id,
            email: primaryEmail,
            username: username,
            firstName:
              profile.displayName?.split(" ")[0] || profile.username || "",
            lastName: profile.displayName?.split(" ").slice(1).join(" ") || "",
            avatar: profile.photos[0]?.value || "",
            isEmailVerified: true, // GitHub emails are verified
            role: "user",
          });

          await user.save();
          return done(null, user);
        } catch (error) {
          console.error("GitHub OAuth error:", error);
          return done(error, null);
        }
      },
    ),
  );
}

// Helper function to generate unique username
async function generateUniqueUsername(baseUsername) {
  let username = baseUsername.toLowerCase().replace(/[^a-z0-9_]/g, "");
  let counter = 0;

  while (
    await User.findOne({ username: username + (counter ? counter : "") })
  ) {
    counter++;
  }

  return username + (counter ? counter : "");
}

export default passport;
