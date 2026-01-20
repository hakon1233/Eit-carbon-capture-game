# Alliance System Bug Fix Plan

## Summary of Testing

Testing was performed on the alliance negotiation system, terms compliance tracking, and edge cases. The following bugs and issues were identified.

---

## Critical Bug: Initial Negotiation Probability Shows Wrong Value

### Description
When the negotiation popup opens, the success probability displays a hardcoded "90%" instead of the actual calculated probability based on the region's interest level and other factors.

**Example:** For a region with 51% interest, the actual probability should be ~37%, but "90%" is displayed.

### Root Cause
Two issues at lines 7142-7153 in `public/game.js`:

1. **Hardcoded HTML**: Line 7142 contains:
   ```html
   <span id="negotiation-probability" class="probability-value high">90%</span>
   ```
   The "90%" and "high" class are hardcoded in the template.

2. **Missing function call**: The `showNegotiationPopup()` function ends at line 7153 without calling `updateNegotiationProbability()` to calculate and display the correct value.

### Fix Required
Add `updateNegotiationProbability();` call at the end of `showNegotiationPopup()`.

**Location:** `public/game.js` line 7152-7153

**Current code:**
```javascript
  document.body.appendChild(overlay);
}
```

**Fixed code:**
```javascript
  document.body.appendChild(overlay);

  // Calculate and display the actual probability
  updateNegotiationProbability();
}
```

### Impact
- **Severity:** Critical
- **User impact:** Players see misleading 90% success rate for all negotiations
- **Risk:** Low (simple addition, no side effects)

---

## Verified Working Features

The following features were tested and confirmed working correctly:

### 1. Slider Value Updates
- `updateTermValue()` correctly updates slider displays
- Values update in real-time as sliders are moved
- Above-default values get highlighted styling

### 2. Probability Recalculation on Slider Change
- When sliders are adjusted, `updateNegotiationProbability()` is called
- Probability penalties correctly apply:
  - Carbon Reduction: -8 per step above default
  - Renewable Target: -5 per step above default
  - CCS Requirement: -10 per step above default
  - Carbon Tax: -3 per step above default

### 3. Terms Compliance Display
- Alliance status HTML correctly shows term compliance details
- All 4 terms displayed with current vs. target values
- Visual indicators (checkmarks/crosses) work correctly
- Compliance is checked monthly via `checkTermCompliance(regionId, alliance)`

### 4. Hostile Cooldown System
- Failed negotiations set region hostile for 3 months
- Regions leaving alliance become hostile for 6 months (`HOSTILE_COOLDOWN_MONTHS`)
- Cooldown countdown displays correctly in region panel
- `isRegionHostile()` correctly blocks negotiation during cooldown

### 5. Multiple Alliance Handling
- Each region has independent alliance state
- Domino effect works (other allies lose -10 happiness when one leaves)
- Alliance average calculations work with multiple regions

---

## Edge Cases Verified

| Edge Case | Status | Notes |
|-----------|--------|-------|
| Hostile region negotiation blocked | Working | Shows appropriate message |
| Negotiation cooldown respected | Working | Shows months remaining |
| Insufficient funds check | Working | Prevents negotiation if funds too low |
| Already allied region | Working | Shows "already part of alliance" message |
| Region leaving alliance | Working | Sets to hostile, triggers domino effect |
| Low satisfaction threshold | Working | 70% chance to leave at <10 happiness |

---

## Files to Modify

| File | Line | Change |
|------|------|--------|
| `public/game.js` | 7152 | Add `updateNegotiationProbability();` after `document.body.appendChild(overlay);` |

---

## Implementation Steps

1. Open `public/game.js`
2. Navigate to line 7152 (end of `showNegotiationPopup()` function)
3. Add `updateNegotiationProbability();` before the closing brace
4. Test by opening negotiation popup - verify probability shows calculated value, not 90%

---

## Testing After Fix

1. Start a new game
2. Open negotiation with any region (e.g., Asia with 51% interest)
3. Verify initial probability is NOT 90% (should be ~37% for 51% interest)
4. Move sliders and verify probability updates correctly
5. Test with regions of different interest levels

---

*Document created: January 2026*
