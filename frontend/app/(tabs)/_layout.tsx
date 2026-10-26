import { Stack } from "expo-router"

export default function TabsLayout() {
    return (
        <Stack>
            <Stack.Screen name="home"/>
            <Stack.Screen name="diary"/>
            <Stack.Screen name="graph"/>
            <Stack.Screen name="profile"/>
        </Stack>
    )
}