import "@/global.css"
import {FlatList, Image, Text, View} from "react-native";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "react-native-css";
import images from "@/constants/images";
import {HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS} from "@/constants/data.";
import {icons} from "@/constants/icons";
import {formatCurrency} from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import {useState} from "react";
import {useUser} from "@clerk/expo";
import {usePostHog} from "posthog-react-native";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
    const {user} = useUser();
    const posthog = usePostHog();
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
    const idChecker = (currentId: string) => {
        const isExpanded = expandedSubscriptionId !== currentId;
        posthog.capture("subscription_details_toggled", {
            subscription_id: currentId,
            is_expanded: isExpanded,
        });
        setExpandedSubscriptionId(isExpanded ? currentId : null);
    };

    const displayName = user?.firstName || user?.fullName || HOME_USER.name;
    const avatarSource = user?.imageUrl ? {uri: user.imageUrl} : images.avatar;

    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <FlatList
                ListHeaderComponent={() => (
                    <>
                        <View className="home-header">
                            <View className="home-user">
                                <Image source={avatarSource} className="home-avatar"/>
                                <Text className="home-user-name">{displayName}</Text>
                            </View>
                            <Image source={icons.add} className="home-add-icon"/>
                        </View>
                        <View className="home-balance-card">
                            <Text className="home-balance-label">Balance</Text>
                            <View className="home-balance-row">
                                <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
                                <Text
                                    className="home-balance-amount">{dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}</Text>
                            </View>
                        </View>
                        <View>
                            <ListHeading title="Upcoming"/>
                            <FlatList
                                data={UPCOMING_SUBSCRIPTIONS}
                                renderItem={({item}) => <UpcomingSubscriptionCard {...item} />}
                                keyExtractor={item => item.id}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals
                                    yet.</Text>}
                            />
                        </View>
                        <ListHeading title="All Subscriptions"/>
                    </>
                )}
                data={HOME_SUBSCRIPTIONS}
                renderItem={({item}) =>
                    <SubscriptionCard {...item}
                                      expanded={expandedSubscriptionId === item.id}
                                      onPress={idChecker}/>
                }
                keyExtractor={item => item.id}
                ItemSeparatorComponent={() => <View className="h-4"/>}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet.</Text>}
                contentContainerClassName="pb-30"
            />
        </SafeAreaView>
    );
}

