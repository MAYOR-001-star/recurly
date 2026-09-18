module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
    posthogHost: process.env.POSTHOG_HOST,
    eas: {
      projectId: "09b1b5c1-5acf-434a-895e-38eb9b0a99b5",
    },
  },
});

