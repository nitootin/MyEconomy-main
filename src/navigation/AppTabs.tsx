import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ExpensesScreen from "../screens/app/ExpensesScreen";
import HomeScreen from "../screens/app/HomeScreen";
import LimitScreen from "../screens/app/LimitScreen";
import ProfileScreen from "../screens/app/ProfileScreen";

export type AppTabParamList = {
  Home: undefined;
  Expenses: undefined;
  Limit: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#059669",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          borderTopColor: "#e2e8f0",
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: "home-outline",
            Expenses: "card-outline",
            Limit: "speedometer-outline",
            Profile: "person-circle-outline",
          } as const;

          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{ title: "Despesas" }}
      />
      <Tab.Screen
        name="Limit"
        component={LimitScreen}
        options={{ title: "Limite" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Meus Dados" }}
      />
    </Tab.Navigator>
  );
}
