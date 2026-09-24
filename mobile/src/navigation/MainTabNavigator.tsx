import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

import Home from '../screens/Home';
import DailyVerse from '../screens/DailyVerse';
import QuranList from '../screens/QuranList';
import Reading from '../screens/Reading';
import Search from '../screens/Search';
import Bookmarks from '../screens/Bookmarks';
import Profile from '../screens/Profile';
import Settings from '../screens/Settings';
import History from '../screens/History';
import SurahLessons from '../screens/SurahLessons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={Home} />
      <Stack.Screen name="DailyVerse" component={DailyVerse} />
    </Stack.Navigator>
  );
};

const QuranStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="QuranList" component={QuranList} />
      <Stack.Screen name="Reading" component={Reading} />
      <Stack.Screen name="SurahLessons" component={SurahLessons} />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={Profile} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="History" component={History} />
    </Stack.Navigator>
  );
};

const MainTabNavigator = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Quran') iconName = focused ? 'book' : 'book-outline';
          else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Bookmarks') iconName = focused ? 'bookmark' : 'bookmark-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.family.primaryMedium,
          fontSize: theme.typography.size.caption,
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Quran" component={QuranStack} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="Bookmarks" component={Bookmarks} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
