import { Stack, Tabs } from "expo-router"
import MyTabBar from "../../components/MyTabBar"

export default function TabsLayout() {
    return (
        <Tabs tabBar={props => <MyTabBar {...props}/>}>
            <Tabs.Screen name="index" options={{headerShown: false, title: "Home"}}/>
            <Tabs.Screen name="diary" options={{headerShown: false, title: "Diary"}}/>
            <Tabs.Screen name="graph" options={{headerShown: false, title: "Graph"}}/>
            <Tabs.Screen name="profile" options={{headerShown: false, title: "Profile"}}/>
        </Tabs>
    )
}