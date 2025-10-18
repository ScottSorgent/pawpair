import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { Calendar, Star } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Slide {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Book short visits safely',
    description: 'Schedule in-person visits at your convenience with secure booking and shelter coordination.',
    icon: <Calendar size={80} color={colors.primary} />,
  },
  {
    id: 2,
    title: 'Your feedback helps adoptions',
    description: 'Share your experience to help pets find their perfect forever homes.',
    icon: <Star size={80} color={colors.primary} fill={colors.primary} />,
  },
];

interface OnboardingCarouselProps {
  onSlideChange?: (index: number) => void;
}

export function OnboardingCarousel({ onSlideChange }: OnboardingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);

    if (index !== currentIndex) {
      setCurrentIndex(index);
      onSlideChange?.(index);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.iconContainer}>{slide.icon}</View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  description: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 24,
  },
});
