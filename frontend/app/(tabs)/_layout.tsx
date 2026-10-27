import { Stack, Tabs } from "expo-router"

export default function TabsLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="home"/>
            <Tabs.Screen name="diary"/>
            <Tabs.Screen name="graph"/>
            <Tabs.Screen name="profile"/>
        </Tabs>
    )
}