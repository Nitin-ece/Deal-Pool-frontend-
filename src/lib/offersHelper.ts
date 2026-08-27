/** Helper to store and retrieve submitted offers in localStorage */

const STORAGE_KEY = "dealpool_submitted_offer_deal_ids";

export function saveSubmittedOfferDealId(dealId: string) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const dealIds: string[] = stored ? JSON.parse(stored) : [];
    if (!dealIds.includes(dealId)) {
      dealIds.push(dealId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dealIds));
    }
  } catch (e) {
    console.error("Failed to save offer dealId to localStorage", e);
  }
}

export function getSubmittedOfferDealIds(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to read offer dealIds from localStorage", e);
    return [];
  }
}

export function removeSubmittedOfferDealId(dealId: string) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    let dealIds: string[] = JSON.parse(stored);
    dealIds = dealIds.filter((id) => id !== dealId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dealIds));
  } catch (e) {
    console.error("Failed to remove offer dealId from localStorage", e);
  }
}
