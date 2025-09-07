# URL Synchronization Testing Guide

## 🎯 Purpose
Manual testing guide for URL synchronization feature with E2E testing considerations.

## 🚀 Setup
1. Ensure development server is running: `npm start`
2. Open browser at `http://localhost:4200`
3. Open Developer Console (F12) to monitor logs
4. Have this testing guide ready for systematic verification

---

## 📋 Manual Testing Scenarios

### **Test 1: Form → URL Synchronization**

#### **1.1 Stats Component - Basic Date Range**
**URL**: `http://localhost:4200/stats`

**Steps**:
1. Navigate to Stats page
2. Click on date range picker
3. Select new "From" date (e.g., 2024-02-01)
4. Select new "To" date (e.g., 2024-02-28)
5. Click "Застосувати" (Apply)

**Expected Results**:
- ✅ Console logs: `StatsComponent form value changed:`
- ✅ Console logs: `Form value changed:`
- ✅ Console logs: `Updating URL with form value:`
- ✅ URL updates to: `http://localhost:4200/stats?dateFrom=2024-02-01T00:00:00.000Z&dateTo=2024-02-28T23:59:59.999Z`
- ✅ No JavaScript errors in console

#### **1.2 Stats Component - Compare Mode**
**URL**: `http://localhost:4200/stats`

**Steps**:
1. Click "Порівняти" (Compare) button
2. Second date picker appears
3. Select comparison dates
4. Click "Застосувати" on comparison picker

**Expected Results**:
- ✅ URL includes: `compareDateFrom` and `compareDateTo` parameters
- ✅ Example: `http://localhost:4200/stats?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T23:59:59.999Z&compareDateFrom=2023-12-01T00:00:00.000Z&compareDateTo=2023-12-31T23:59:59.999Z`

#### **1.3 Logger Component - Multiple Filter Types**
**URL**: `http://localhost:4200/logger`

**Steps**:
1. Navigate to Logger page
2. Enter Account ID: `123`
3. Enter title: `test error`
4. Click "Не оброблено" (Not processed) toggle
5. Select error levels: `error`, `warning`
6. Set date range

**Expected Results**:
- ✅ URL updates with all parameters
- ✅ Example: `http://localhost:4200/logger?accountId=123&title=test%20error&needToFix=true&level=error,warning&createdDateFrom=2024-01-01T00:00:00.000Z&createdDateTo=2024-01-31T23:59:59.999Z`

#### **1.4 Payment Component - Enum and Number Types**
**URL**: `http://localhost:4200/payment`

**Steps**:
1. Navigate to Payment page
2. Select payment type: `ep`
3. Enter Account ID: `456`
4. Enter User ID: `789`
5. Set date range

**Expected Results**:
- ✅ URL updates: `http://localhost:4200/payment?type=ep&accountId=456&userId=789&startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.999Z`

---

### **Test 2: URL → Form Synchronization**

#### **2.1 Direct URL Navigation**
**Steps**:
1. Navigate directly to: `http://localhost:4200/stats?dateFrom=2024-03-01T00:00:00.000Z&dateTo=2024-03-31T23:59:59.999Z`
2. Check form controls populate correctly
3. Navigate to: `http://localhost:4200/logger?accountId=999&needToFix=true&level=error`
4. Verify form fields are populated

**Expected Results**:
- ✅ Date pickers show correct dates
- ✅ Input fields show correct values
- ✅ Toggles/selects show correct state
- ✅ No console errors

#### **2.2 Browser Back/Forward**
**Steps**:
1. Change filters on Stats page
2. Navigate to Logger page
3. Change filters on Logger page
4. Use browser Back button
5. Use browser Forward button

**Expected Results**:
- ✅ Forms restore to previous state
- ✅ URLs match form state
- ✅ No broken navigation

#### **2.3 Page Refresh with Parameters**
**Steps**:
1. Set filters on any page
2. Copy URL from address bar
3. Refresh page (F5 or Ctrl+R)
4. Verify form state restored

**Expected Results**:
- ✅ Form fields populated from URL
- ✅ All filter states preserved
- ✅ Data loading triggered with correct filters

---

### **Test 3: Edge Cases & Error Handling**

#### **3.1 Invalid URL Parameters**
**Steps**:
1. Navigate to: `http://localhost:4200/stats?dateFrom=invalid-date&accountId=not-a-number`
2. Check console for warnings
3. Verify form doesn't break

**Expected Results**:
- ✅ Console warning: `Failed to deserialize URL param`
- ✅ Form remains functional
- ✅ Invalid parameters ignored gracefully

#### **3.2 Empty/Null Values**
**Steps**:
1. Set filters with values
2. Clear all filter values
3. Verify URL updates correctly

**Expected Results**:
- ✅ URL parameters removed when values cleared
- ✅ Clean URL without empty parameters

#### **3.3 Special Characters**
**Steps**:
1. In Logger, enter title: `Error: "Special" & <Characters>`
2. Verify URL encoding

**Expected Results**:
- ✅ Special characters properly URL encoded
- ✅ Characters decode correctly when loading from URL

---

## 🤖 E2E Testing Considerations

### **Automated Test Scenarios**

#### **Critical E2E Test Cases**:
1. **Form-to-URL sync verification**
2. **URL-to-form sync verification**  
3. **Cross-component navigation state preservation**
4. **Deep linking functionality**
5. **Parameter validation and error handling**

#### **E2E Test Selectors Required**:
```typescript
// Recommended data-testid attributes for E2E tests
const E2E_SELECTORS = {
  // Stats Component
  STATS_DATE_FROM: '[data-testid="stats-date-from"]',
  STATS_DATE_TO: '[data-testid="stats-date-to"]',
  STATS_COMPARE_TOGGLE: '[data-testid="stats-compare-toggle"]',
  STATS_COMPARE_DATE_FROM: '[data-testid="stats-compare-date-from"]',
  STATS_COMPARE_DATE_TO: '[data-testid="stats-compare-date-to"]',
  
  // Logger Component  
  LOGGER_ACCOUNT_ID: '[data-testid="logger-account-id"]',
  LOGGER_TITLE: '[data-testid="logger-title"]',
  LOGGER_NEED_FIX_TOGGLE: '[data-testid="logger-need-fix-toggle"]',
  LOGGER_LEVEL_TOGGLES: '[data-testid="logger-level-toggle"]',
  LOGGER_DATE_FROM: '[data-testid="logger-date-from"]',
  LOGGER_DATE_TO: '[data-testid="logger-date-to"]',
  
  // Payment Component
  PAYMENT_TYPE_SELECT: '[data-testid="payment-type-select"]',
  PAYMENT_ACCOUNT_ID: '[data-testid="payment-account-id"]',
  PAYMENT_USER_ID: '[data-testid="payment-user-id"]',
  PAYMENT_START_DATE: '[data-testid="payment-start-date"]',
  PAYMENT_END_DATE: '[data-testid="payment-end-date"]',
  
  // Navigation
  NAV_STATS: '[data-testid="nav-stats"]',
  NAV_LOGGER: '[data-testid="nav-logger"]',
  NAV_PAYMENT: '[data-testid="nav-payment"]',
};
```

#### **Sample E2E Test Structure**:
```typescript
describe('URL Synchronization E2E Tests', () => {
  it('should sync form changes to URL parameters', async () => {
    // Navigate to stats page
    await page.goto('/stats');
    
    // Change date range
    await page.click(E2E_SELECTORS.STATS_DATE_FROM);
    await page.fill(E2E_SELECTORS.STATS_DATE_FROM, '2024-01-01');
    await page.click(E2E_SELECTORS.STATS_DATE_TO);
    await page.fill(E2E_SELECTORS.STATS_DATE_TO, '2024-01-31');
    await page.click('[data-testid="date-picker-apply"]');
    
    // Verify URL updated
    await expect(page).toHaveURL(/dateFrom=2024-01-01/);
    await expect(page).toHaveURL(/dateTo=2024-01-31/);
  });
  
  it('should populate form from URL parameters', async () => {
    // Navigate with parameters
    await page.goto('/logger?accountId=123&needToFix=true&level=error,warning');
    
    // Verify form populated
    await expect(page.locator(E2E_SELECTORS.LOGGER_ACCOUNT_ID)).toHaveValue('123');
    await expect(page.locator(E2E_SELECTORS.LOGGER_NEED_FIX_TOGGLE)).toBeChecked();
    // ... verify level toggles
  });
});
```

---

## ✅ Success Criteria Checklist

### **Functional Requirements**
- [ ] Form changes immediately reflect in URL (with 300ms debounce)
- [ ] URL changes immediately update form controls
- [ ] Navigation between components preserves filter state
- [ ] Fresh page loads with URL parameters populate forms correctly
- [ ] Invalid URL parameters handled gracefully (console warnings, no crashes)
- [ ] All data types serialize/deserialize correctly:
  - [ ] Dates (ISO strings)
  - [ ] Numbers (string conversion)
  - [ ] Booleans ('true'/'false' strings)
  - [ ] Arrays (comma-separated strings)
  - [ ] Enums (string values)

### **Technical Requirements**
- [ ] No JavaScript errors in console
- [ ] No memory leaks (subscriptions properly cleaned up)
- [ ] TypeScript compilation without errors
- [ ] Consistent parameter naming across components
- [ ] Proper URL encoding/decoding
- [ ] Console debugging logs present and helpful

### **User Experience Requirements**
- [ ] URL parameters are human-readable
- [ ] Deep linking works from fresh page loads
- [ ] Browser back/forward navigation works correctly
- [ ] Form validation doesn't interfere with URL sync
- [ ] Loading states properly managed during navigation

### **E2E Testing Readiness**
- [ ] Stable component selectors available
- [ ] Form controls have consistent naming
- [ ] URL patterns are predictable and testable
- [ ] Error scenarios can be automated
- [ ] Cross-component workflows are testable

---

## 🐛 Common Issues & Troubleshooting

### **Issue: URL not updating when form changes**
**Check**:
- Console logs for form value changes
- Form validation state (invalid forms don't trigger URL updates)
- Debounce timing (300ms delay)

### **Issue: Form not populating from URL**
**Check**:
- URL parameter format matches expected types
- Console warnings for deserialization errors
- Form control names match URL parameter keys

### **Issue: Navigation state not preserved**
**Check**:
- Router configuration
- Query parameter handling mode ('replace' vs 'merge')
- Component lifecycle and initialization order

---

**Testing Status**: Ready for comprehensive manual and automated testing ✅  
**E2E Compatibility**: Prepared for automated test suite integration ✅
