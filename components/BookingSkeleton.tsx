import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '@/constants/theme';
import { useEffect, useRef } from 'react';

export function BookingSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.photo, { opacity }]} />
      <View style={styles.content}>
        <Animated.View style={[styles.line, styles.lineTitle, { opacity }]} />
        <Animated.View style={[styles.line, styles.lineSubtitle, { opacity }]} />
        <Animated.View style={[styles.line, styles.lineMeta, { opacity }]} />
      </View>
      <View style={styles.right}>
        <Animated.View style={[styles.badge, { opacity }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  photo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.border,
    marginRight: 12,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  line: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
  },
  lineTitle: {
    width: '60%',
  },
  lineSubtitle: {
    width: '45%',
  },
  lineMeta: {
    width: '70%',
  },
  right: {
    marginLeft: 12,
  },
  badge: {
    width: 80,
    height: 24,
    backgroundColor: colors.border,
    borderRadius: 12,
  },
});
