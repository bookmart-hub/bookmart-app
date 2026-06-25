import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
    Platform,
    ToastAndroid
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import Header from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusBar } from 'expo-status-bar';

const SectionCard = ({ children, style }: any) => (
    <View style={[styles.sectionCard, style]}>{children}</View>
);

const SectionHeader = ({ icon, title, showInfo = false, iconColor = COLORS.primary, customIcon }: any) => (
    <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
            <View style={[styles.iconWrapper, { backgroundColor: iconColor + '15' }]}>
                {customIcon ? customIcon : <Ionicons name={icon} size={20} color={iconColor} />}
            </View>
            <Text style={[styles.sectionTitle, { color: COLORS.black }]}>{title}</Text>
        </View>
        {showInfo && <Ionicons name="help-circle-outline" size={22} color={COLORS.primary} />}
    </View>
);

const RadioOption = ({ label, selected, onPress }: any) => (
    <TouchableOpacity style={styles.radioContainer} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
            {selected && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
);

const MyListingsScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const [condition, setCondition] = useState('Good');
    const [visibility, setVisibility] = useState('My College Only');
    const [status, setStatus] = useState('Active');
    const [description, setDescription] = useState('This book is in good condition.\nNo pages missing.\nMinimal highlighting.');

    const renderPhotosSection = () => {
        return (
            <View style={styles.photosSection}>
                <View style={styles.photoGrid}>
                    <View style={styles.photoBlock}>
                        <Image
                            source={{ uri: 'https://m.media-amazon.com/images/I/91bYsX41DVL.jpg' }}
                            style={styles.bookPhoto}
                            resizeMode='contain'
                        />
                        <TouchableOpacity style={styles.removePhotoBtn}>
                            <Ionicons name="close" size={14} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    {[1, 2, 3, 4, 5].map((item) => (
                        <TouchableOpacity key={item} style={styles.emptyPhotoBlock}>
                            <Feather name="plus" size={24} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.dragReorder}>
                    <Ionicons name="swap-vertical" size={16} color={COLORS.textMuted} />
                    <Text style={styles.dragText}>Drag to reorder photos</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            <Header
                title="Edit Listing"
                backButton
                rightElement={
                    <TouchableOpacity onPress={() => ToastAndroid.show('Preview version', ToastAndroid.SHORT)}>
                        <Ionicons name="eye-outline" size={25} color={COLORS.primary} />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {renderPhotosSection()}

                <SectionCard>
                    <SectionHeader icon="information-circle-outline" title="Basic Information" />
                    <View style={styles.row}>
                        <View style={{ flex: 1, paddingRight: SPACING.xs }}>
                            <Input label="Book Title *" value="Atomic Habits" placeholder="Enter title" />
                        </View>
                        <View style={{ flex: 1, paddingLeft: SPACING.xs }}>
                            <Input label="Author *" value="James Clear" placeholder="Enter author" />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={{ flex: 1, paddingRight: SPACING.xs }}>
                            <TouchableOpacity activeOpacity={0.8}>
                                <View pointerEvents="none">
                                    <Input
                                        label="Category *"
                                        value="Self Help"
                                        placeholder="Select category"
                                    />
                                    <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} style={styles.dropdownIcon} />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, paddingLeft: SPACING.xs }}>
                            <Input label="ISBN (Optional)" value="9781847941831" placeholder="Enter ISBN" />
                        </View>
                    </View>
                </SectionCard>

                <View style={styles.row}>
                    <SectionCard style={{ flex: 1, marginRight: SPACING.xs }}>
                        <SectionHeader icon="shield-checkmark-outline" title="Condition" showInfo />
                        <View style={styles.conditionGrid}>
                            {['Like New', 'Good', 'Fair', 'Poor'].map((cond) => {
                                const isSelected = condition === cond;
                                return (
                                    <TouchableOpacity
                                        key={cond}
                                        style={[styles.conditionBtn, isSelected && styles.conditionBtnSelected]}
                                        onPress={() => setCondition(cond)}
                                    >
                                        <Text style={[styles.conditionText, isSelected && styles.conditionTextSelected]}>{cond}</Text>
                                        {isSelected && <Ionicons name="checkmark-circle" size={16} color={COLORS.white} style={{ marginLeft: 4 }} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </SectionCard>

                    <SectionCard style={{ flex: 1, marginLeft: SPACING.xs }}>
                        <SectionHeader icon="pricetag-outline" title="Pricing" />
                        <Input label="Selling Price *" value="₹350" placeholder="₹0" />
                        <Input label="Original Price (Optional)" value="₹699" placeholder="₹0" />
                    </SectionCard>
                </View>

                <SectionCard>
                    <SectionHeader icon="list-outline" title="Description" />
                    <View style={styles.descriptionContainer}>
                        <Input
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe your book's condition..."
                            style={styles.descriptionInput}
                            containerStyle={{ marginVertical: 0 }}
                        />
                        <Text style={styles.charCount}>{description.length} / 500</Text>
                    </View>
                </SectionCard>

                <View style={styles.row}>
                    <SectionCard style={{ flex: 1, marginRight: SPACING.xs }}>
                        <SectionHeader icon="eye-outline" title="Visibility" showInfo />
                        <View style={styles.radioGroup}>
                            <RadioOption label="Everyone" selected={visibility === 'Everyone'} onPress={() => setVisibility('Everyone')} />
                            <RadioOption label="My College Only" selected={visibility === 'My College Only'} onPress={() => setVisibility('My College Only')} />
                        </View>
                        <View style={styles.collegeInfoBox}>
                            <View style={styles.collegeNameRow}>
                                <Ionicons name="school" size={16} color={COLORS.primary} />
                                <Text style={styles.collegeName} numberOfLines={1}>Shri Ram College of Commerce</Text>
                            </View>
                            <TouchableOpacity>
                                <Text style={styles.changeText}>Change</Text>
                            </TouchableOpacity>
                        </View>
                    </SectionCard>

                    <SectionCard style={styles.performanceSection}>
                        <SectionHeader icon="bar-chart-outline" title="Listing Performance" showInfo />
                        <View style={styles.performanceGrid}>
                            <View style={styles.perfItem}>
                                <Ionicons name="eye" size={20} color={COLORS.primary} />
                                <Text style={styles.perfValue}>152</Text>
                                <Text style={styles.perfLabel}>Views</Text>
                            </View>
                            <View style={styles.perfDivider} />
                            <View style={styles.perfItem}>
                                <Ionicons name="heart-outline" size={20} color={COLORS.primary} />
                                <Text style={styles.perfValue}>22</Text>
                                <Text style={styles.perfLabel}>Interested</Text>
                            </View>
                            <View style={styles.perfDivider} />
                            <View style={styles.perfItem}>
                                <Ionicons name="logo-whatsapp" size={20} color={COLORS.primary} />
                                <Text style={styles.perfValue}>8</Text>
                                <Text style={styles.perfLabel}>WhatsApp Clicks</Text>
                            </View>
                        </View>
                        <Text style={styles.listedDate}>Listed on 12 May 2024</Text>
                    </SectionCard>
                </View>

                <View style={styles.row}>
                    <SectionCard style={{ flex: 1, marginRight: SPACING.xs }}>
                        <SectionHeader icon="flag-outline" title="Listing Status" showInfo />
                        <View style={styles.radioGroup}>
                            <RadioOption label="Active" selected={status === 'Active'} onPress={() => setStatus('Active')} />
                            <RadioOption label="Pause Listing" selected={status === 'Pause Listing'} onPress={() => setStatus('Pause Listing')} />
                            <RadioOption label="Mark as Sold" selected={status === 'Mark as Sold'} onPress={() => setStatus('Mark as Sold')} />
                        </View>
                    </SectionCard>

                    <SectionCard style={{ flex: 1, backgroundColor: COLORS.secondary, elevation: -10 }}>
                        <SectionHeader icon="rocket-outline" title="Boost Listing" iconColor={COLORS.primary} />
                        <View style={styles.boostContent}>
                            <Text style={styles.boostSub}>Current Position</Text>
                            <Text style={styles.boostPosition}>#14 in Self Help</Text>
                            <Text style={styles.boostDesc}>Boosted listings get more visibility.</Text>
                            <Button
                                title="Boost Now"
                                style={styles.boostBtn}
                                textStyle={styles.boostBtnText}
                                onPress={() => navigation.navigate('AppStack', { screen: 'BoostListing' })}
                            />
                        </View>
                    </SectionCard>
                </View>

                <View style={styles.dangerSection}>
                    <View style={styles.dangerHeader}>
                        <View style={styles.dangerIconWrap}>
                            <Ionicons name="trash-outline" size={20} color={COLORS.red} />
                        </View>
                        <View>
                            <Text style={styles.dangerTitle}>Delete Listing</Text>
                            <Text style={styles.dangerSub}>This action cannot be undone.</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>

            <View style={[styles.bottomBar, { paddingBottom: insets.bottom || SPACING.md }]}>
                <View style={styles.bottomBarRow}>
                    <Button
                        title="Cancel"
                        variant="outline"
                        style={styles.cancelBtn}
                        onPress={() => navigation.goBack()}
                    />
                    <Button
                        title="Save Changes"
                        style={styles.saveBtn}
                    />
                </View>
            </View>
        </View>
    );
};

export default MyListingsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    previewText: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.primary,
    },
    performanceSection: {
        flex: 1,
        marginLeft: SPACING.xs
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
    },
    photosSection: {
        marginBottom: SPACING.xl,
    },
    photosScroll: {
        gap: SPACING.md,
        paddingRight: SPACING.lg,
    },
    photoGrid: {
        display: 'flex',
        gap: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'stretch',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        borderRadius: rf(18),
        padding: rf(18)
    },
    photoBlock: {
        width: 80,
        height: 100,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    bookPhoto: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removePhotoBtn: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyPhotoBlock: {
        width: 80,
        height: 100,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
    },
    dragReorder: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.md,
        gap: 6,
    },
    dragText: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    sectionCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: rf(15),
        fontFamily: FONTS.montserrat.bold,
    },
    row: {
        flexDirection: 'column',
        marginBottom: 0,
    },
    dropdownIcon: {
        position: 'absolute',
        right: 12,
        top: 45,
    },
    conditionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.xs,
        marginTop: SPACING.xs,
    },
    conditionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        borderRadius: 8,
        paddingVertical: 8,
        width: '47%',
    },
    conditionBtnSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    conditionText: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.text,
    },
    conditionTextSelected: {
        color: COLORS.white,
    },
    descriptionContainer: {
        position: 'relative',
    },
    descriptionInput: {
        height: 100,
    },
    charCount: {
        position: 'absolute',
        bottom: -20,
        right: 0,
        fontSize: rf(11),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.textMuted,
    },
    radioGroup: {
        gap: SPACING.sm,
        marginTop: SPACING.xs,
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.grayHeavvy,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderColor: COLORS.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    radioLabel: {
        fontSize: rf(13),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.text,
    },
    collegeInfoBox: {
        marginTop: SPACING.md,
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
        padding: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    collegeNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        paddingRight: SPACING.sm,
    },
    collegeName: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.primary,
        flexShrink: 1,
    },
    changeText: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.primary,
    },
    performanceGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SPACING.xs,
    },
    perfItem: {
        alignItems: 'center',
        flex: 1,
    },
    perfValue: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
        marginTop: 4,
    },
    perfLabel: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        textAlign: 'center',
    },
    perfDivider: {
        width: 1,
        height: 30,
        backgroundColor: COLORS.grayHeavvy,
    },
    listedDate: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginTop: SPACING.md,
        textAlign: 'center',
    },
    boostContent: {
        marginTop: SPACING.xs,
    },
    boostSub: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    boostPosition: {
        fontSize: rf(14),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary,
        marginVertical: 4,
    },
    boostDesc: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    boostBtn: {
        height: 40,
    },
    boostBtnText: {
        fontSize: rf(13),
    },
    dangerSection: {
        backgroundColor: COLORS.redLight,
        borderRadius: 16,
        padding: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        marginBottom: SPACING.xl,
    },
    dangerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        flex: 1,
    },
    dangerIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dangerTitle: {
        fontSize: rf(14),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.red,
    },
    dangerSub: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    deleteBtn: {
        height: 36,
        width: 100,
        borderColor: COLORS.red,
        marginVertical: 0,
    },
    deleteBtnText: {
        color: COLORS.red,
        fontSize: rf(12),
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.grayHeavvy,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 10,
    },
    bottomBarRow: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    cancelBtn: {
        flex: 1,
        height: rf(50),
    },
    saveBtn: {
        flex: 1,
        height: rf(50),
    }
});