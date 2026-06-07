import { COLORS } from '@/constants/colors';
import React, { memo, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

interface QuantitySelectorProps {
    quantity: number;
    unitPrice: number;
    minQuantity?: number;
    maxQuantity?: number;
    onIncrement: () => void;
    onDecrement: () => void;
}

const QuantitySelector = ({
    quantity,
    unitPrice,
    minQuantity = 1,
    maxQuantity,
    onIncrement,
    onDecrement,
}: QuantitySelectorProps) => {
    const totalPrice = useMemo(
        () => quantity * unitPrice,
        [quantity, unitPrice],
    );

    const isDecrementDisabled = quantity <= minQuantity;
    const isIncrementDisabled =
        maxQuantity !== undefined && quantity >= maxQuantity;

    return (
        <View style={styles.container}>
            <View style={styles.stepperContainer}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isDecrementDisabled}
                    onPress={onDecrement}
                    style={[
                        styles.iconButton,
                        styles.minusButton,
                        isDecrementDisabled && styles.disabledButton,
                    ]}>
                    <Text style={styles.minusText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.quantity}>{quantity}</Text>

                <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isIncrementDisabled}
                    onPress={onIncrement}
                    style={[
                        styles.iconButton,
                        styles.plusButton,
                        isIncrementDisabled && styles.disabledButton,
                    ]}>
                    <Text style={styles.plusText}>+</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.price}>
                ₹{totalPrice.toLocaleString('en-IN')}
            </Text>
        </View>
    );
};

export default memo(QuantitySelector);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.grayLight,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },

    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },

    iconButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },

    minusButton: {
        backgroundColor: COLORS.grayLight,
    },

    plusButton: {
        backgroundColor: COLORS.primary,
    },

    disabledButton: {
        opacity: 0.5,
    },

    minusText: {
        fontSize: 34,
        fontWeight: '500',
        color: COLORS.grayHeavvy,
        lineHeight: 38,
    },

    plusText: {
        fontSize: 38,
        fontWeight: '400',
        color: COLORS.white,
        lineHeight: 42,
    },

    quantity: {
        fontSize: 36,
        fontFamily: 'Montserrat-SemiBold',
        color: COLORS.black,
    },

    price: {
        fontSize: 34,
        fontFamily: 'Montserrat-Bold',
        color: COLORS.primary,
    },
});