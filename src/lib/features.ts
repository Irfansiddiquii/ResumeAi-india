/**
 * Central feature-flag map for ResumeAI India.
 *
 * The product is "free-first": the core ATS analysis flow never requires
 * login or payment. Monetization-related surfaces stay in the codebase but
 * are hidden from the UI until a later phase by flipping these flags.
 *
 * Nothing here is deleted — it is simply not rendered while the flag is off.
 */
export const FEATURES = {
  /** Optional account creation, dashboard, saved history (Phase 3). */
  ACCOUNTS_ENABLED: false,

  /** Subscriptions, billing, Razorpay, upgrade modals, premium locks. */
  PREMIUM_ENABLED: false,

  /** Ads / sponsored placements (future Phase 2 monetization). */
  ADS_ENABLED: false,

  /** Show shareable public result URLs. */
  SHAREABLE_RESULTS: true,

  /** Allow downloading the analysis report (PDF + HTML) without an account. */
  FREE_DOWNLOAD: true,
} as const;

export type FeatureKey = keyof typeof FEATURES;

export function isEnabled(flag: FeatureKey): boolean {
  return FEATURES[flag];
}
