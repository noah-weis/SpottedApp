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
    color: colors.SKY_BLUE,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 24,
    color: colors.PAPER_YELLOW,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  button: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.SPIRIT_GREEN,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.FALL_YELLOW,
    fontSize: 24,
    fontWeight: '600',
  },
  divider: {
    height: 3,
    backgroundColor: colors.SKY_BLUE,
    marginVertical: spacing.md,
    width: '95%',
    alignSelf: 'center',
  },
});