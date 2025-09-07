# Task Requirements: Cross-Component Filter Synchronization

## 📋 Original Assignment

**Objective**: Implement cross-component filter synchronization between forms and URL parameters.

**Key Requirements**:
1. Filter values should be reflected in the URL
2. URL changes should update form controls
3. Bidirectional synchronization must work consistently
4. Implementation should work across all 3 modules (Stats, Logger, Payment)

## 🎯 Expected Behavior

### 1. Form → URL Synchronization
When user changes filter values:
```
Initial state: http://localhost:4200/stats
User selects date range → http://localhost:4200/stats?dateFrom=2024-01-01&dateTo=2024-01-15
User enables compare mode → http://localhost:4200/stats?dateFrom=2024-01-01&dateTo=2024-01-15&compareDateFrom=2023-12-01&compareDateTo=2023-12-15
```

### 2. URL → Form Synchronization  
When user navigates with URL parameters:
```
User visits: http://localhost:4200/logger?accountId=123&needToFix=true
Result: Form controls are populated with accountId=123, needToFix checkbox checked
```

### 3. Cross-Component Consistency
Filter state should be maintained when navigating between components:
```
Stats (with filters) → Logger → Back to Stats = filters preserved
```

## 🔧 Technical Implementation Strategy

### URL Parameter Mapping

#### Stats Component (`/stats`)
```typescript
interface StatsUrlParams {
  dateFrom?: string;        // ISO date string
  dateTo?: string;          // ISO date string  
  compareDateFrom?: string; // ISO date string
  compareDateTo?: string;   // ISO date string
}
```

#### Logger Component (`/logger`)
```typescript
interface LoggerUrlParams {
  accountId?: string;       // number as string
  needToFix?: string;       // 'true'|'false'
  level?: string;           // comma-separated array
  title?: string;           // string
  createdDateFrom?: string; // ISO date string
  createdDateTo?: string;   // ISO date string
}
```

#### Payment Component (`/payment`)
```typescript
interface PaymentUrlParams {
  type?: string;            // PaymentType enum value
  startDate?: string;       // ISO date string
  endDate?: string;         // ISO date string
  accountId?: string;       // number as string
  userId?: string;          // number as string
}
```

## 🏗️ Implementation Approach

### 1. Extend FilteredAbstractComponent
Add URL synchronization capabilities to the base class:
- Inject `Router` and `ActivatedRoute`
- Add methods for URL param serialization/deserialization
- Handle form ↔ URL bidirectional sync

### 2. Type-Safe Parameter Handling
```typescript
// Add to each component
protected serializeFilters(filters: StatsFiltersModel): Record<string, string>
protected deserializeFilters(params: Record<string, string>): Partial<StatsFiltersModel>
```

### 3. Navigation Strategy
- Use `Router.navigate()` with `queryParams`
- Preserve existing parameters when possible
- Handle parameter validation and sanitization

## ✅ Acceptance Criteria

### Functional Requirements
- [ ] Form changes immediately reflect in URL
- [ ] URL changes immediately update form controls
- [ ] Invalid URL parameters are handled gracefully
- [ ] Navigation preserves filter state where appropriate
- [ ] All three components support URL synchronization

### Technical Requirements  
- [ ] Type-safe parameter handling
- [ ] Proper error handling for invalid parameters
- [ ] No memory leaks in subscriptions
- [ ] Consistent parameter naming conventions
- [ ] URL parameters are human-readable

### E2E Testing Requirements
- [ ] Form controls have stable `formControlName` attributes
- [ ] Components have consistent selectors
- [ ] URL changes trigger proper form updates
- [ ] Deep linking works from fresh page loads

## 🧪 Testing Scenarios

### Manual Testing Checklist
1. **Form to URL**: Change filters → verify URL updates
2. **URL to Form**: Paste URL with params → verify form populates  
3. **Navigation**: Switch between components → verify state preservation
4. **Edge Cases**: Invalid parameters → verify graceful handling
5. **Deep Linking**: Fresh page load with URL params → verify form state

### E2E Test Preparation
- Ensure form controls have consistent naming
- Add data-testid attributes where needed
- Verify component selectors are stable
- Test URL parameter validation

## 📝 Implementation Notes

- Use `formControlName` as the basis for URL parameter names
- Handle date serialization consistently (ISO strings)
- Consider debouncing form changes to avoid excessive URL updates
- Maintain backward compatibility with existing component APIs
- Follow existing code patterns and conventions
