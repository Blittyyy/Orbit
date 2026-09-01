import { StyleSheet } from 'react-native';

export const upgradeCardStyles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    backgroundColor: 'rgba(12, 8, 32, 0.72)',
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 340,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#60a5fa',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    width: '92%',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: '#e8edff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  levelBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderColor: 'rgba(125, 211, 252, 0.35)',
    borderRadius: 999,
    borderWidth: 1,
    color: '#bfdbfe',
    fontSize: 11,
    fontWeight: '600',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  statBlock: {
    flex: 1,
  },
  statLabel: {
    color: '#8b9cd9',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#c7d7ff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 1,
  },
  bonusValue: {
    color: '#7dd3fc',
  },
  costValue: {
    color: '#a5b4fc',
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    borderColor: 'rgba(125, 211, 252, 0.45)',
    borderRadius: 11,
    borderWidth: 1,
    marginTop: 8,
    minHeight: 42,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: 'rgba(59, 130, 246, 0.98)',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderColor: 'rgba(71, 85, 105, 0.5)',
  },
  buttonText: {
    color: '#f8fbff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonTextDisabled: {
    color: '#7c8aa5',
  },
});
