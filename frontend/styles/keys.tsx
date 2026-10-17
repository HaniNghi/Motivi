import colors from "./colors";

const keys = {
  primaryButton: {
    height: 56,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
  },
  primaryButtonText: {
    color: colors.textWhite,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 17,
    fontWeight: 700 as const,
  },
  secondaryButton: {
    height: 56,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    color: '#6366f1',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    fontWeight: '700',
  },
  pillButton: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
    color: '#6366f1',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '700',
  },
  quickAction: {
    minHeight: 96,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    color: '#ffffff',
    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.2)',
  },
  card: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.12)',
    boxShadow: '0 4px 24px rgba(99, 102, 241, 0.1)',
  },
  heroCard: {
    padding: 16,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.12)',
    boxShadow: '0 8px 40px rgba(99, 102, 241, 0.16)',
  },
  imageCard: {
    height: 100,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 24px rgba(99, 102, 241, 0.1)',
  },
};

export default keys;