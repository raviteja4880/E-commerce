/**
 * Hash function for string to seed
 */
export function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/**
 * Mulberry32 PRNG - generates deterministic random numbers from a seed
 */
export function mulberry32(a) {
  return function () {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Shuffle an array using a seeded random number generator
 */
export function seededShuffle(array, seed) {
  let result = [...array];
  let rand = mulberry32(hashCode(seed));

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get a stable user key for personalized features
 * - Returns user ID/email for logged in users
 * - Returns or generates a guest ID for anonymous users
 */
export function getStableUserKey() {
  const userInfo = localStorage.getItem("userInfo");

  if (userInfo) {
    try {
      const user = JSON.parse(userInfo);
      return (
        user._id ||
        user.userId ||
        user.email ||
        `token-${user.token?.slice(0, 10)}`
      );
    } catch {
      return "guest";
    }
  }

  let guestId = localStorage.getItem("guestId");
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guestId", guestId);
  }
  return guestId;
}

/**
 * Format price in Indian Rupees
 */
export function formatPrice(price) {
  return `₹${price.toLocaleString("en-IN")}`;
}
