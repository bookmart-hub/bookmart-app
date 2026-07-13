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
import ManageListingsScreen from '@/screens/others/ManageListingsScreen';
import BoostListingScreen from '@/screens/others/BoostListingScreen';
import PublicProfileScreen from '@/screens/others/PublicProfileScreen';
import CollegeInsightsScreen from '@/screens/others/CollegeInsightsScreen';
import ContactScreen from '@/screens/others/ContactScreen';
import MyOrdersScreen from '@/screens/others/MyOrdersScreen';
import SavedAddressesScreen from '@/screens/others/SavedAddressesScreen';
import NotificationsScreen from '@/screens/others/NotificationsScreen';
import PaymentMethodsScreen from '@/screens/others/PaymentMethodsScreen';
import PrivacyPolicyScreen from '@/screens/others/PrivacyPolicyScreen';
import TermsConditionsScreen from '@/screens/others/TermsConditionsScreen';
import HelpSupportScreen from '@/screens/others/HelpSupportScreen';
import FAQsScreen from '@/screens/others/FAQsScreen';
import AboutScreen from '@/screens/others/AboutScreen';

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
    ManageListings: undefined;
    BoostListing: undefined;
    PublicProfile: undefined;
    CollegeInsights: undefined;
    Contacts: undefined;
    MyOrders: undefined;
    SavedAddresses: undefined;
    Notifications: undefined;
    PaymentMethods: undefined;
    PrivacyPolicy: undefined;
    TermsConditions: undefined;
    HelpSupport: undefined;
    FAQs: undefined;
    About: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStackNavigator() {
    return (
        <Stack.Navigator
            id="AppStack"
            screenOptions={{
                headerShown: false,
                animation: 'fade'
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
            <Stack.Screen name="ManageListings" component={ManageListingsScreen} />
            <Stack.Screen name="BoostListing" component={BoostListingScreen} />
            <Stack.Screen name="PublicProfile" component={PublicProfileScreen} />
            <Stack.Screen name="CollegeInsights" component={CollegeInsightsScreen} />
            <Stack.Screen name="Contacts" component={ContactScreen} />
            <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
            <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
            <Stack.Screen name="FAQs" component={FAQsScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
        </Stack.Navigator>
    );
}
