import {Text, TouchableOpacity, View} from 'react-native'
import React from 'react'

const ListHeading = ({title, onPress, showAction = true, actionText = "View All"}: ListHeadingProps) => {
    return (
        <View className="list-head">
            <Text className="list-title">{title}</Text>
            {showAction && (
                <TouchableOpacity className="list-action" onPress={onPress} activeOpacity={0.7}>
                    <Text className="list-action-text">{actionText}</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}
export default ListHeading