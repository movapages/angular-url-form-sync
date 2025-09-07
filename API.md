# API Documentation

## 🧩 Component APIs

### FilteredAbstractComponent<D, F>

The core abstract component that provides filtering functionality across all feature components.

#### Generic Parameters
- **`D`**: Data type returned by `loadData()` (e.g., `StatsModel[]`)
- **`F`**: Filter model type extending `Record<string, unknown>` (e.g., `StatsFiltersModel`)

#### Abstract Methods

```typescript
protected abstract createFilters(): FormGroup<ControlsOf<F>>
```
**Purpose**: Define the structure and default values for filter form controls.
**Returns**: Strongly-typed FormGroup matching the filter model.
**Example**:
```typescript
protected createFilters(): FormGroup<ControlsOf<StatsFiltersModel>> {
  return this.fb.group<ControlsOf<StatsFiltersModel>>({
    dateFrom: this.fb.control<Date>(new Date(), Validators.required),
    dateTo: this.fb.control<Date>(new Date(), Validators.required),
  });
}
```

```typescript
protected abstract loadData(): Observable<D>
```
**Purpose**: Load data based on current filter values.
**Returns**: Observable of data matching the generic type `D`.
**Access**: Current filter values via `this.filterFormGroup.value`
**Example**:
```typescript
protected loadData(): Observable<StatsModel[]> {
  const filters = this.filterFormGroup.value;
  return this.statsService.getStats(filters);
}
```

#### Protected Properties

```typescript
protected filterFormGroup: FormGroup<ControlsOf<F>>
```
**Purpose**: Reactive form group for filter controls.
**Usage**: Access in templates and component methods.
**Auto-initialized**: Set up automatically in `ngOnInit()`.

```typescript
protected readonly isLoading = signal<boolean>(false)
```
**Purpose**: Loading state indicator.
**Usage**: Show/hide loading spinners in templates.
**Auto-managed**: Automatically set during data loading.

```typescript
protected readonly data = signal<D>(null)
```
**Purpose**: Current loaded data.
**Usage**: Display data in templates, access in component methods.
**Auto-updated**: Set automatically when `loadData()` completes.

```typescript
protected readonly destroyRef = inject(DestroyRef)
```
**Purpose**: Automatic subscription cleanup.
**Usage**: Use with `takeUntilDestroyed()` for memory management.
**Auto-injected**: Available for use in extending components.

#### Lifecycle Behavior

1. **`ngOnInit()`**: 
   - Calls `createFilters()` to initialize form
   - Sets up form value change subscriptions
   - Triggers initial data load
   - Manages loading state automatically

2. **Form Changes**:
   - Validates form before triggering data load
   - Uses `distinctUntilChanged()` to prevent duplicate requests
   - Automatically retries on errors (⚠️ unlimited - needs fixing)

3. **Data Loading**:
   - Sets `isLoading(true)` before calling `loadData()`
   - Sets `isLoading(false)` after completion/error
   - Updates `data()` signal with results
   - Handles errors with retry logic

## 🎛️ Custom Directives

### UiToggleGroupSingleDirective

Enhances `mat-button-toggle-group` to allow deselection of active toggle.

#### Usage
```html
<mat-button-toggle-group uiSingle>
  <mat-button-toggle value="option1">Option 1</mat-button-toggle>
  <mat-button-toggle value="option2">Option 2</mat-button-toggle>
</mat-button-toggle-group>
```

#### Behavior
- **Standard**: Once selected, toggle buttons cannot be deselected
- **With directive**: Clicking active toggle deselects it (value becomes `undefined`)
- **Implementation**: Listens to individual button change events and manages group state

#### API

```typescript
@Directive({ selector: '[uiSingle]' })
export class UiToggleGroupSingleDirective
```

**Host Element**: Must be applied to `mat-button-toggle-group`
**Dependencies**: Injects `MatButtonToggleGroup` and queries `MatButtonToggle` children
**Memory Management**: Uses `DestroyRef` for automatic cleanup

## 🔧 Utility Types

### ControlsOf<T>

Creates a type-safe mapping from a model to FormControl structure.

```typescript
export type ControlsOf<T> = { 
  [Property in keyof T]: FormControl<T[Property]> 
};
```

#### Usage Example
```typescript
// Model definition
interface UserFilters {
  name: string;
  age: number;
  active: boolean;
}

// Form group type
FormGroup<ControlsOf<UserFilters>>

// Equivalent to:
FormGroup<{
  name: FormControl<string>;
  age: FormControl<number>;
  active: FormControl<boolean>;
}>
```

#### Benefits
- **Type Safety**: Compile-time validation of form structure
- **IntelliSense**: Auto-completion for form control names
- **Refactoring Safety**: Changes to model automatically update form types
- **Error Prevention**: Prevents typos in form control names

## 📋 Component-Specific APIs

### StatsComponent

#### Filter Model
```typescript
export type StatsFiltersModel = Partial<{
  dateFrom: Date;
  dateTo: Date;
  compareDateFrom: Date;
  compareDateTo: Date;
}>;
```

#### Additional Properties
```typescript
protected isCompareMode = signal<boolean>(false);
```

#### Methods
```typescript
protected toggleCompare(): void
```
**Purpose**: Toggle comparison mode and enable/disable comparison date controls.
**Side Effects**: 
- Updates `isCompareMode` signal
- Enables/disables comparison form controls
- Clears comparison values when disabling

### PaymentsComponent

#### Filter Model
```typescript
export type PaymentFiltersModel = Partial<PaymentModel>;

export type PaymentModel = {
  type: PaymentType;
  startDate: Date;
  endDate: Date;
  userId: number;
  accountId: number;
};

export enum PaymentType {
  Ep = 'ep',
  Epu = 'epu', 
  Esv = 'esv',
}
```

#### Additional Properties
```typescript
protected readonly PaymentType = PaymentType;
```
**Purpose**: Expose enum to template for dropdown options.

### LoggerComponent

#### Filter Model
```typescript
export type LoggerFiltersModel = Partial<
  Omit<LoggerModel, 'datetime'> & {
    createdDateFrom: Date;
    createdDateTo: Date;
  }
>;

export type LoggerModel = {
  accountId: number;
  needToFix: boolean;
  level: string[];
  title: string;
  datetime: Date;
};
```

#### Additional Properties
```typescript
protected needFixCount = signal<number>(1);
```
**Purpose**: Display count of items needing attention in UI badge.

## 🔌 Service Integration (To Be Implemented)

### Expected Service Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private http: HttpClient) {}
  
  getStats(filters: StatsFiltersModel): Observable<StatsModel[]> {
    const params = this.buildHttpParams(filters);
    return this.http.get<StatsModel[]>('/api/stats', { params });
  }
  
  private buildHttpParams(filters: StatsFiltersModel): HttpParams {
    let params = new HttpParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params = params.set(key, value.toString());
      }
    });
    
    return params;
  }
}
```

### Integration with Components

```typescript
// In component
constructor(private statsService: StatsService) {
  super();
}

protected loadData(): Observable<StatsModel[]> {
  return this.statsService.getStats(this.filterFormGroup.value);
}
```

## 🧪 Testing APIs

### Component Testing

```typescript
// Test FilteredAbstractComponent behavior
it('should load data when form is valid', () => {
  component.filterFormGroup.patchValue({
    dateFrom: new Date('2024-01-01'),
    dateTo: new Date('2024-01-31')
  });
  
  expect(component.isLoading()).toBe(true);
  // Verify loadData was called
});

// Test form validation
it('should not load data when form is invalid', () => {
  component.filterFormGroup.patchValue({
    dateFrom: null, // Invalid - required field
    dateTo: new Date('2024-01-31')
  });
  
  expect(component.isLoading()).toBe(false);
});
```

### E2E Testing Selectors

```typescript
// Recommended data-testid attributes
const SELECTORS = {
  STATS_COMPONENT: '[data-testid="stats-component"]',
  DATE_FROM_INPUT: '[data-testid="date-from-input"]',
  DATE_TO_INPUT: '[data-testid="date-to-input"]',
  COMPARE_TOGGLE: '[data-testid="compare-toggle"]',
  LOADING_INDICATOR: '[data-testid="loading-indicator"]',
  SUBMIT_BUTTON: '[data-testid="submit-button"]',
};
```

---

## 🔮 Future API Extensions

### Planned Enhancements
- **URL Synchronization**: Methods for serializing/deserializing filters to/from URL params
- **Validation Messages**: Standardized error message API
- **Caching**: Built-in data caching with cache invalidation
- **Optimistic Updates**: Support for immediate UI updates with rollback
- **Infinite Scrolling**: Pagination support in abstract component
