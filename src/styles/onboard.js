import { StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from '../theme';

export const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.TREE_GREEN,
    justifyContent: 'space-between',
    paddingBottom: 2*spacing.xl, 
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    color: colors.SKY_BLUE,
  },
  subtitle: {
    fontSize: 24,
    color: colors.PAPER_YELLOW,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: spacing.lg,
  },
  button: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.SPIRIT_GREEN,
  },
  buttonText: {
    color: colors.FALL_YELLOW,
    fontSize: 24,
    fontWeight: '600',
  },
});