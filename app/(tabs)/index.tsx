import "@/global.css"
import {Text, View} from "react-native";
import {Link} from "expo-router";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "react-native-css";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <Text className="text-xl font-bold text-blue-500">
                Welcome to Native wind!
            </Text>
            <Link href="/onboarding" className="mt-4 rounded bg-primary text-white p-4">
                Go to Onboarding
            </Link>
            <Link href="/(auth)/sign-in" className="mt-4 rounded bg-primary text-white p-4">
                Go to Sign in
            </Link>
            <Link href="/(auth)/sign-up" className="mt-4 rounded bg-primary text-white p-4">
                Go to Sign up
            </Link>

            {/*<Link href="/app/subscriptions/spotify">Spotify Subscriptuion</Link>*/}
            <Link href={{
                pathname: "/subscriptions/[id]",
                params: {id: "claude"}
            }}>Claude max Subscription</Link>
        </SafeAreaView>
    );
}

