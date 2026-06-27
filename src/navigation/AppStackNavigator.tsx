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
import ReportScreen from '@/screens/others/ReportScreen';
import MyListingsScreen from '@/screens/others/MyListingsScreen';
import SoldBooksScreen from '@/screens/others/SoldBooksScreen';
import MyActiveListingsScreen from '@/screens/others/MyActiveListingsScreen';
import BoostListingScreen from '@/screens/others/BoostListingScreen';
import PublicProfileScreen from '@/screens/others/PublicProfileScreen';
import CollegeInsightsScreen from '@/screens/others/CollegeInsightsScreen';
import ContactScreen from '@/screens/others/ContactScreen';

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
    Report: { initialTab?: 'Listing' | 'User'; targetId?: string };
    MyListings: undefined;
    SoldBooks: undefined;
    MyActiveListings: undefined;
    BoostListing: undefined;
    PublicProfile: undefined;
    CollegeInsights: undefined;
    Contacts: undefined;
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
            <Stack.Screen name="Report" component={ReportScreen} />
            <Stack.Screen name="MyListings" component={MyListingsScreen} />
            <Stack.Screen name="SoldBooks" component={SoldBooksScreen} />
            <Stack.Screen name="MyActiveListings" component={MyActiveListingsScreen} />
            <Stack.Screen name="BoostListing" component={BoostListingScreen} />
            <Stack.Screen name="PublicProfile" component={PublicProfileScreen} />
            <Stack.Screen name="CollegeInsights" component={CollegeInsightsScreen} />
            <Stack.Screen name="Contacts" component={ContactScreen} />
        </Stack.Navigator>
    );
}
