import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    NativeSyntheticEvent,
    TextInputKeyPressEventData,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, ToastAndroid } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { verifyRegisterOtp } from '@/types/auth';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rem } from '@/utils/responsive';
import { Button } from '@/components/ui/Button';
import { AuthStackParamList } from '@/navigation/AuthNavigator';

type VerifyEmailNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'VerifyEmail'>;
type VerifyEmailRouteProp = RouteProp<AuthStackParamList, 'VerifyEmail'>;

const VerifyEmail = () => {
    const navigation = useNavigation<VerifyEmailNavigationProp>();
    const route = useRoute<VerifyEmailRouteProp>();
    const { email } = route.params;
    const [otp, setOtp] = useState(['', '', '', '']);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    // 5 minutes = 300 seconds
    const [timer, setTimer] = useState(5 * 60);

    // Countdown timer
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Format timer as MM:SS
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    const formattedTime = `${minutes}:${seconds
        .toString()
        .padStart(2, '0')}`;

    const handleOtpChange = (value: string, index: number) => {
        // Only take the last character
        const newValue = value.slice(-1);
        const newOtp = [...otp];
        newOtp[index] = newValue;
        setOtp(newOtp);

        // Auto-advance
        if (newValue !== '' && index < otp.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (
        e: NativeSyntheticEvent<TextInputKeyPressEventData>,
        index: number
    ) => {
        if (
            e.nativeEvent.key === 'Backspace' &&
            otp[index] === '' &&
            index > 0
        ) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const verifyMutation = useMutation({
        mutationFn: verifyRegisterOtp,
        onSuccess: async (data) => {
            ToastAndroid.show('Email verified successfully!', ToastAndroid.SHORT);
            
            // Save tokens to SecureStore
            if (data?.tokens?.access && data?.tokens?.refresh) {
                await SecureStore.setItemAsync('accessToken', data.tokens.access);
                await SecureStore.setItemAsync('refreshToken', data.tokens.refresh);
            }
            
            // Mark user as fully onboarded/logged in
            await AsyncStorage.setItem('@bookmart:is_logged_in', 'true');

            navigation.reset({
                index: 0,
                routes: [{ name: 'Tab' as never }],
            });
        },
        onError: (error: any) => {
            const message = error?.response?.data?.detail || 'Verification failed. Please check your OTP.';
            if (Platform.OS === 'android') {
                ToastAndroid.show(message, ToastAndroid.LONG);
            } else {
                Alert.alert('Error', message);
            }
        }
    });

    const handleVerify = () => {
        const otpValue = otp.join('');
        if (otpValue.length < 4) {
            if (Platform.OS === 'android') {
                ToastAndroid.show('Please enter the complete 4-digit OTP', ToastAndroid.SHORT);
            } else {
                Alert.alert('Validation', 'Please enter the complete 4-digit OTP');
            }
            return;
        }
        
        verifyMutation.mutate({
            email,
            otp: otpValue
        });
    };

    return (
        <SafeAreaView
            style={styles.safeArea}
            edges={['top', 'bottom', 'left', 'right']}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header Section */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.headingText}>
                            Verify phone number
                        </Text>
                        <Text style={styles.subHeadingText}>
                            Which part of country that you call home?
                        </Text>
                    </View>

                    {/* OTP Inputs */}
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => {
                                    inputRefs.current[index] = ref;
                                }}
                                style={[
                                    styles.otpInput,
                                    focusedIndex === index &&
                                    styles.otpInputFocused,
                                ]}
                                value={digit}
                                onChangeText={(value) =>
                                    handleOtpChange(value, index)
                                }
                                onKeyPress={(e) =>
                                    handleKeyPress(e, index)
                                }
                                keyboardType="number-pad"
                                maxLength={1}
                                onFocus={() => setFocusedIndex(index)}
                                onBlur={() => setFocusedIndex(null)}
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    {/* Resend Timer */}
                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>
                            Resend code in {formattedTime}
                        </Text>
                    </View>

                    {/* Verify Button */}
                    <View style={styles.buttonContainer}>
                        {verifyMutation.isPending ? (
                            <Button
                                title="Verifying..."
                                onPress={handleVerify}
                                variant="primary"
                            />
                        ) : (
                            <Button
                                title="Verify"
                                onPress={handleVerify}
                            />
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default VerifyEmail;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        paddingBottom: SPACING.lg,
    },
    headerContainer: {
        marginBottom: 40,
    },
    headingText: {
        fontSize: rem(1.5625),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        lineHeight: 34,
        marginBottom: SPACING.sm,
    },
    subHeadingText: {
        fontSize: rem(0.75),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.completeTransparency,
        lineHeight: 20,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: SPACING.md,
        marginBottom: 40,
    },
    otpInput: {
        width: rem(4),
        height: rem(4.25),
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: COLORS.white,
        textAlign: 'center',
        fontSize: rem(1.5),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.black,
        // Soft shadow for inputs
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    otpInputFocused: {
        borderColor: COLORS.primary,
    },
    resendContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    resendText: {
        fontSize: rem(0.9375),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.black,
    },
    buttonContainer: {
        width: '100%',
    },
});