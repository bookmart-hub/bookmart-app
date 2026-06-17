import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BusinessScreen from '@/screens/others/BusinessScreen';
import BiographyScreen from '@/screens/others/BiographyScreen';
import ScinceFinctionScreen from '@/screens/others/ScinceFinctionScreen';
import SelfHelpScreen from '@/screens/others/SelfHelpScreen';
import RomanceScreen from '@/screens/others/RomanceScreen';
import EngineeringScreen from '@/screens/others/EngineeringScreen';
import MedicalScreen from '@/screens/others/MedicalScreen';
import LawScreen from '@/screens/others/LawScreen';
import CompetitiveExamsScreen from '@/screens/others/CompetitiveExamsScreen';

import BookDetailsScreen from '@/screens/others/BookDetailsScreen';
import CartScreen from '@/screens/others/CartScreen';
import AuthorListScreen from '@/screens/others/AuthorListScreen';
import AuthorDetailsScreen from '@/screens/others/AuthorDetailsScreen';
import NearestBooksScreen from '@/screens/others/NearestBooksScreen';
import NearestBooksMapScreen from '@/screens/others/NearestBooksMapScreen';
import RequestPostScreen from '@/screens/others/RequestPostScreen';
import EditProfileScreen from '@/screens/others/EditProfileScreen';
import FavouritesScreen from '@/screens/others/FavouritesScreen';
import SearchScreen from '@/screens/others/SearchScreen';

export type AppStackParamList = {
    Business: undefined;
    Biography: undefined;
    ScinceFinction: undefined;
    SelfHelp: undefined;
    Romance: undefined;
    Engineering: undefined;
    Medical: undefined;
    Law: undefined;
    CompetitiveExams: undefined;
    BookDetails: undefined;
    Cart: undefined;
    AuthorList: undefined;
    AuthorDetails: undefined;
    NearestBooks: undefined;
    NearestBooksMap: undefined;
    Search: undefined;
    RequestPost: undefined;
    EditProfile: undefined;
    Favourites: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStackNavigator() {
    return (
        <Stack.Navigator
            id="AppStack"
            screenOptions={{
                headerShown: false,
                animation: 'default'
            }}
        >
            <Stack.Screen name="Business" component={BusinessScreen} />
            <Stack.Screen name="Biography" component={BiographyScreen} />
            <Stack.Screen name="ScinceFinction" component={ScinceFinctionScreen} />
            <Stack.Screen name="SelfHelp" component={SelfHelpScreen} />
            <Stack.Screen name="Romance" component={RomanceScreen} />
            <Stack.Screen name="Engineering" component={EngineeringScreen} />
            <Stack.Screen name="Medical" component={MedicalScreen} />
            <Stack.Screen name="Law" component={LawScreen} />
            <Stack.Screen name="CompetitiveExams" component={CompetitiveExamsScreen} />
            <Stack.Screen name="BookDetails" component={BookDetailsScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="AuthorList" component={AuthorListScreen} />
            <Stack.Screen name="AuthorDetails" component={AuthorDetailsScreen} />
            <Stack.Screen name="NearestBooks" component={NearestBooksScreen} />
            <Stack.Screen name="NearestBooksMap" component={NearestBooksMapScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="RequestPost" component={RequestPostScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Favourites" component={FavouritesScreen} />
        </Stack.Navigator>
    );
}
