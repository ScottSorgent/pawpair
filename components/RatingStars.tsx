import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 20,
  onRate,
  readonly = false,
}: RatingStarsProps) {
  const handlePress = (index: number) => {
    if (!readonly && onRate) {
      onRate(index + 1);
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const filled = index < Math.floor(rating);
        const Container = readonly ? View : TouchableOpacity;

        return (
          <Container
            key={index}
            onPress={() => handlePress(index)}
            activeOpacity={0.7}
            disabled={readonly}
          >
            <Star
              size={size}
              color={filled ? colors.warning : colors.border}
              fill={filled ? colors.warning : 'transparent'}
              strokeWidth={2}
            />
          </Container>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
