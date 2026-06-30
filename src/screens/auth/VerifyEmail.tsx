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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { Button } from '@/components/ui/Button';
import { AuthStackParamList } from '@/navigation/AuthNavigator';

type VerifyEmailNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'VerifyEmail'>;

const VerifyEmail = () => {
    const navigation = useNavigation<VerifyEmailNavigationProp>();
    const [otp, setOtp] = useState(['', '', '', '']);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
    const inputRefs = useRef<Array<TextInput | null>>([]);
    const [timer, setTimer] = useState(55);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleOtpChange = (value: string, index: number) => {
        // Only take the last character in case of quick typing or auto-fill
        const newValue = value.slice(-1);
        const newOtp = [...otp];
        newOtp[index] = newValue;
        setOtp(newOtp);

        // Auto-advance
        if (newValue !== '' && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
            // Focus previous input on backspace if current is empty
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        navigation.navigate('Personalization');
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
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
                        <Text style={styles.headingText}>Verify phone number</Text>
                        <Text style={styles.subHeadingText}>
                            Which part of country that you call home?
                        </Text>
                    </View>

                    {/* OTP Inputs */}
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputRefs.current[index] = ref; }}
                                style={[
                                    styles.otpInput,
                                    focusedIndex === index && styles.otpInputFocused,
                                ]}
                                value={digit}
                                onChangeText={(value) => handleOtpChange(value, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
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
                            Resend code in {timer} s
                        </Text>
                    </View>

                    {/* Verify Button */}
                    <View style={styles.buttonContainer}>
                        <Button
                            title="verify"
                            onPress={handleVerify}
                        />
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
        fontSize: rf(25),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        lineHeight: 34,
        marginBottom: SPACING.sm,
    },
    subHeadingText: {
        fontSize: rf(12),
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
        width: rf(64),
        height: rf(68),
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: COLORS.white,
        textAlign: 'center',
        fontSize: rf(24),
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
        fontSize: rf(15),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.black,
    },
    buttonContainer: {
        width: '100%',
    },
});