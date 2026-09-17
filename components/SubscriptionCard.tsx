import {View, Text, Image, Pressable, TouchableOpacity, ActivityIndicator} from 'react-native'
import React from 'react'
import {formatCurrency, formatSubscriptionDateTime} from "@/lib/utils";
import {clsx} from "clsx";
import {colors} from "@/constants/theme";

const SubscriptionCard = ({
                              id,
                              name,
                              status,
                              price,
                              currency,
                              icon,
                              billing,
                              category,
                              plan,
                              expanded,
                              onPress,
                              color,
                              renewalDate,
                              paymentMethod,
                              startDate,
                              onCancelPress,
                              isCancelling,
                          }: SubscriptionCardProps) => {
    return (
        <Pressable onPress={() => onPress(id)} className={clsx('sub-card', expanded ? 'sub-card-expanded' : 'bg-card')}
                   style={!expanded && color ? {backgroundColor: color} : undefined}>
            <View className="sub-head">
                <View className="sub-main">
                    <Image source={icon} className="sub-icon"/>
                    <View className="sub-copy">
                        <Text numberOfLines={1} className="sub-title">
                            {name}
                        </Text>
                        <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
                            {plan?.trim() || category?.trim() || (renewalDate ? formatSubscriptionDateTime(renewalDate) : '')}
                        </Text>
                    </View>
                </View>
                <View className="sub-price-box">
                    <Text className="sub-price">{formatCurrency(price, currency)}</Text>
                    <Text className="sub-billing">{billing}</Text>
                </View>
            </View>
            {expanded && (
                <View className="mt-4 gap-4 pt-2">
                    <View className="gap-3">
                        {/* Payment Info Row */}
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-2">
                                <Text className="text-base font-sans-medium text-muted-foreground">Payment info:</Text>
                                <Text className="text-base font-sans-bold text-primary">
                                    {paymentMethod?.trim() ?? '*****8530'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                className="rounded-full border border-black/30 px-4 py-1"
                            >
                                <Text className="text-sm font-sans-semibold text-primary">Manage</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Plan Details Row */}
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-2">
                                <Text className="text-base font-sans-medium text-muted-foreground">Plan details:</Text>
                                <Text className="text-base font-sans-bold text-primary">
                                    {plan?.trim() || category?.trim() || 'Premium'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                className="rounded-full border border-black/30 px-4 py-1"
                            >
                                <Text className="text-sm font-sans-semibold text-primary">Change</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Cancel Subscription Button */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={onCancelPress}
                            disabled={isCancelling}
                            className={clsx("mt-2 items-center rounded-full bg-primary py-3.5", isCancelling && "bg-primary/35")}
                        >
                            {isCancelling ? (
                                <ActivityIndicator color={colors.background} size="small" />
                            ) : (
                                <Text className="text-base font-sans-bold text-background">Cancel Subscription</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </Pressable>
    )
}
export default SubscriptionCard
