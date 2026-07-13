import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const FAQsScreen = () => {
    const navigation = useNavigation<any>();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>F AQ s</Text>
            </View>
            <View style={styles.content}>
                <Ionicons name="construct-outline" size={64} color={COLORS.grayLight} style={{marginBottom: 16}} />
                <Text style={styles.title}>Coming Soon</Text>
                <Text style={styles.subtitle}>We're working hard to bring you this feature.</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
    backButton: { padding: SPACING.xs, marginRight: SPACING.sm },
    headerTitle: { fontSize: rf(18), fontFamily: FONTS.montserrat.bold, color: COLORS.black },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
    title: { fontSize: rf(20), fontFamily: FONTS.montserrat.bold, color: COLORS.black, marginBottom: SPACING.xs },
    subtitle: { fontSize: rf(14), fontFamily: FONTS.manrope.medium, color: COLORS.textMuted, textAlign: 'center' },
});

export default FAQsScreen;
