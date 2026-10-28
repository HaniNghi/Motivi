import { StyleSheet, View, Text, DimensionValue } from "react-native";
import keys from "../styles/keys";
import { ReactNode } from "react";
import colors from "../styles/colors";





export default function WhiteContainer({ title, children, width }: { title?: string, children?: ReactNode, width?: DimensionValue }) {
    return (
        <View style={[styles.heroCard, {width: width}]}>
            <View>
                <Text style={styles.title}>{title}</Text>
                {children}
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    heroCard: keys.heroCard,
    
    title: {
        color: colors.textSoft,
        fontSize: 12,
        width: '100%',
        fontFamily: "PlusJakartaSans-Bold",
    }
})