import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { Author } from '@/data/authorMockData';

const AuthorDetailsScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute<any>();
    const author: Author | undefined = route.params?.author;

    if (!author) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.errorText}>Author not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: COLORS.primary, fontFamily: FONTS.montserrat.semibold }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
            <View style={styles.content}>
                <Image source={{ uri: author.imageUri }} style={styles.image} contentFit="cover" />
                <Text style={styles.name}>{author.name}</Text>
                <Text style={styles.bio}>{author.bio}</Text>
            </View>
        </View>
    );
};

export default AuthorDetailsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        marginBottom: SPACING.lg,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: SPACING.md,
    },
    name: {
        fontSize: rf(24),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: SPACING.sm,
    },
    bio: {
        fontSize: rf(16),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        textAlign: 'center',
    },
    errorText: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.medium,
        color: COLORS.text,
    },
});
