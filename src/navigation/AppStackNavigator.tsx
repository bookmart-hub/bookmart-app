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

import BookDetailsScreen from '@/screens/main/BookDetailsScreen';
import CartScreen from '@/screens/others/CartScreen';

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
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
            animation: 'default'
        }}>
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
        </Stack.Navigator>
    );
}
