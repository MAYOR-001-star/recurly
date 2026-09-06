import "@/global.css"
import {Text, View} from "react-native";
import {Link} from "expo-router";
import id from "@/app/(tabs)/subscriptions/[id]";

const  SignUp = () => {
    return (
        <View className="flex-1 items-center justify-center bg-white">
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
            
            <Link href="/subscriptions/spotify">Spotify Subscriptuion</Link>
            <Link href={{
                pathname:"/subscriptions/[id]",
                params:{id:"claude"}
            }}>Claude max Subscriptuion</Link>
        </View>
    );
}

export default SignUp;