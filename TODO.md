# E-Commerce Frontend Refactoring Plan

## Phase 1: Structure Improvements (Move CSS files)
- [ ] Move scrollMessage.css to src/styles/
- [ ] Move AuthLanding.css to src/styles/

## Phase 2: Create Shared Components & Utils
- [ ] Create src/components/common/Rupee.jsx (shared component)
- [ ] Create src/utils/helpers.js (hashCode, seededShuffle, getStableUserKey)
- [ ] Create src/hooks/useAuth.js (authentication logic)

## Phase 3: Fix Bugs
- [ ] Fix duplicate ProductCard import in Home.jsx
- [ ] Fix Navbar.jsx - remove ProductCard.css import, add proper styling
- [ ] Fix getStableUserKey location in Home.jsx (move outside fetchProducts)
- [ ] Add useCallback to handleQuantityChange in Cart.jsx
- [ ] Add sessionStorage cleanup for recommendations in Cart.jsx

## Phase 4: Create Proper CSS for Components
- [ ] Create ProductCard.css with proper styles (replace inline styles)
- [ ] Create SkeletonProductCard.css
- [ ] Update imports in all affected files
