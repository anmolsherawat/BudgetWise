const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { prisma } = require('./database');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || 'your-client-id',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret',
            callbackURL: '/api/auth/google/callback',
            proxy: true
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value.toLowerCase();

                let user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            name: profile.displayName,
                            email: email,
                            provider: 'google',
                            providerId: profile.id,
                            avatar: profile.photos[0] ? profile.photos[0].value : null,
                            currency: 'USD',
                        },
                    });
                } else if (user.provider !== 'google') {
                    // If a local user exists with the same email, link accounts
                    user = await prisma.user.update({
                        where: { email },
                        data: {
                            provider: 'google',
                            providerId: profile.id,
                            avatar: user.avatar || (profile.photos[0] ? profile.photos[0].value : null),
                        },
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID || 'your-github-client-id',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || 'your-github-client-secret',
            callbackURL: '/api/auth/github/callback',
            proxy: true
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let email = null;
                if (profile.emails && profile.emails.length > 0) {
                    email = profile.emails[0].value.toLowerCase();
                } else {
                    email = profile.username.toLowerCase() + '@github.placeholder.com';
                }

                let user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            name: profile.displayName || profile.username,
                            email: email,
                            provider: 'github',
                            providerId: profile.id,
                            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                            currency: 'USD',
                        },
                    });
                } else if (user.provider !== 'github') {
                    user = await prisma.user.update({
                        where: { email },
                        data: {
                            provider: 'github',
                            providerId: profile.id,
                            avatar: user.avatar || (profile.photos && profile.photos[0] ? profile.photos[0].value : null),
                        },
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

module.exports = passport;
