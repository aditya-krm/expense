import React, { useEffect, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, Text, Dimensions, Animated } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import theme from "../styles/theme";

interface TransactionMenuProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  position?: { x: number; y: number };
}

const TransactionMenu = ({ visible, onClose, onEdit, onDelete, position }: TransactionMenuProps) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const menuRef = useRef<View>(null);

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const menuWidth = 200; // Approximate menu width
  const menuHeight = 120; // Approximate menu height

  // Calculate menu position
  const x = position ? Math.min(position.x, screenWidth - menuWidth - 20) : screenWidth / 2;
  const y = position ? Math.min(position.y, screenHeight - menuHeight - 20) : screenHeight / 2;

  return (
    <TouchableOpacity
      style={styles.overlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <Animated.View
        ref={menuRef}
        style={[
          styles.menuContainer,
          {
            position: 'absolute',
            left: x,
            top: y,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <TouchableOpacity style={styles.menuItem} onPress={onEdit}>
          <MaterialCommunityIcons name="pencil" size={24} color={theme.colors.primary} />
          <Text style={styles.menuText}>Edit</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.menuItem} onPress={onDelete}>
          <MaterialCommunityIcons name="delete" size={24} color={theme.colors.error} />
          <Text style={[styles.menuText, { color: theme.colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    backgroundColor: "#000000aa",
    borderRadius: 12,
    minWidth: 200,
    padding: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    margin: 'auto',
  },
  menuText: {
    fontSize: 16,
    color: theme.colors.primary,
    alignSelf: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: "#ffffff48",
    marginHorizontal: 8,
  },
});

export default TransactionMenu;
