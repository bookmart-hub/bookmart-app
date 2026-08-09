import { api } from "@/api/clients";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  ToastAndroid,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const showToastOrAlert = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("Success", message);
  }
};

const SavedAddressesScreen = () => {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [addressInput, setAddressInput] = useState("");

  // Fetch User Profile for saved city_location
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await api.get("/api/v1/core/profile/me/");
      return response.data;
    },
  });

  const address = userProfile?.city_location;

  // Address Mutation (updates city_location)
  const addressMutation = useMutation({
    mutationFn: async (newAddress: string | null) => {
      const response = await api.patch("/api/v1/core/profile/me/", {
        city_location: newAddress,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      showToastOrAlert(
        data.city_location ? "Address updated successfully" : "Address removed successfully"
      );
      setModalVisible(false);
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to update address");
    },
  });

  const handleSave = () => {
    if (!addressInput.trim()) {
      Alert.alert("Validation", "Please enter a valid address");
      return;
    }
    addressMutation.mutate(addressInput.trim());
  };

  const handleDelete = () => {
    Alert.alert("Delete Address", "Are you sure you want to remove your saved address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => addressMutation.mutate(null),
      },
    ]);
  };

  const openAddEditModal = () => {
    setAddressInput(address || "");
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
      </View>

      {/* Main Content */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : address ? (
        <View style={styles.contentContainer}>
          <Text style={styles.sectionLabel}>Primary Address</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <View style={styles.badge}>
                <Ionicons name="home-outline" size={14} color={COLORS.primary} />
                <Text style={styles.badgeText}>Primary</Text>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity onPress={openAddEditModal} style={styles.actionBtn} activeOpacity={0.7}>
                  <Ionicons name="pencil" size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={styles.actionBtn} activeOpacity={0.7}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.red} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.addressText}>{address}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="location-outline" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Addresses Saved</Text>
          <Text style={styles.emptySubtitle}>
            Please add your location to view nearby listings and get quick deliveries.
          </Text>
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.8} onPress={openAddEditModal}>
            <Ionicons name="add" size={20} color={COLORS.white} style={{ marginRight: 6 }} />
            <Text style={styles.addBtnText}>Add Address</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{address ? "Edit Address" : "Add Address"}</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="location-sharp" size={18} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your city / delivery address..."
                placeholderTextColor={COLORS.textMuted}
                value={addressInput}
                onChangeText={setAddressInput}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalBtn, styles.cancelBtn]}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.modalBtn, styles.saveBtn]}
                activeOpacity={0.8}
                disabled={addressMutation.isPending}
              >
                {addressMutation.isPending ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
    backgroundColor: COLORS.white,
  },
  backButton: { padding: SPACING.xs, marginRight: SPACING.sm },
  headerTitle: { fontSize: rem(1.125), fontFamily: FONTS.montserrat.bold, color: COLORS.black },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  contentContainer: { flex: 1, padding: SPACING.lg },
  sectionLabel: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 128, 128, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
  actionRow: { flexDirection: "row", gap: SPACING.sm },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  addressText: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.black,
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 128, 128, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: rem(1.25),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  addBtnText: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: rem(1.125),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(0,0,0,0.02)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  inputIcon: { marginTop: 4, marginRight: 8 },
  textInput: {
    flex: 1,
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.black,
    textAlignVertical: "top",
    minHeight: 60,
    padding: 0,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: SPACING.sm },
  modalBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm - 2,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  cancelBtn: { backgroundColor: "rgba(0,0,0,0.04)" },
  cancelBtnText: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.textMuted,
  },
  saveBtn: { backgroundColor: COLORS.primary },
  saveBtnText: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.white,
  },
});

export default SavedAddressesScreen;
