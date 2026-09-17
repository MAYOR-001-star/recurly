import Constants from 'expo-constants'
import PostHog from 'posthog-react-native'

type PostHogExtra = {
  posthogProjectToken?: string
  posthogHost?: string
}

const { posthogProjectToken, posthogHost } =
  (Constants.expoConfig?.extra as PostHogExtra | undefined) ?? {}

if (!posthogProjectToken && __DEV__) {
  throw new Error(
    'POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once POSTHOG_PROJECT_TOKEN is configured',
  )
}

if (!posthogHost && __DEV__) {
  throw new Error(
    'POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once POSTHOG_HOST is configured',
  )
}

export const posthog =
  posthogProjectToken && posthogHost
    ? new PostHog(posthogProjectToken, {
        host: posthogHost,
        flushInterval: 30000,
        maxBatchSize: 20,
        errorTracking: {
          autocapture: {
            uncaughtExceptions: true,
            unhandledRejections: true,
            console: [],
          },
        },
      })
    : undefined
