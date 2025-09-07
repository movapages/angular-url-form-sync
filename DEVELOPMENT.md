# Development Guide

## 🛠️ Development Environment Setup

### Prerequisites
- **Node.js**: 18+ LTS recommended
- **npm**: 9+ (comes with Node.js)
- **Angular CLI**: 20+ (`npm install -g @angular/cli`)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ngTaxer

# Install dependencies
npm install

# Start development server
npm start
# or
ng serve

# Application will be available at http://localhost:4200
```

### Build Commands
```bash
# Development build
npm run build
# or
ng build

# Production build
ng build --configuration production

# Serve production build locally
ng serve --configuration production
```

## 📝 Coding Standards

### 1. **TypeScript Configuration**

Use strict TypeScript settings:
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true
  }
}
```

### 2. **Component Guidelines**

#### Component Structure
```typescript
@Component({
  selector: 'app-feature-name',           // kebab-case with prefix
  templateUrl: './feature-name.component.html',
  styleUrls: ['./feature-name.component.scss'], // Note: styleUrls (plural)
  changeDetection: ChangeDetectionStrategy.OnPush, // Always use OnPush
  imports: [...] // Standalone component imports
})
export class FeatureNameComponent implements OnInit {
  // 1. Signals first
  protected readonly isLoading = signal<boolean>(false);
  
  // 2. Injected dependencies
  private readonly fb = inject(FormBuilder);
  
  // 3. Component properties
  protected filterFormGroup: FormGroup;
  
  // 4. Lifecycle methods
  ngOnInit(): void { }
  
  // 5. Protected methods (template accessible)
  protected onSubmit(): void { }
  
  // 6. Private methods (internal logic)
  private setupSubscriptions(): void { }
}
```

#### Extending FilteredAbstractComponent
```typescript
export class YourComponent 
  extends FilteredAbstractComponent<DataModel[], FiltersModel> 
  implements OnInit 
{
  // Required: Define filter form structure
  protected createFilters(): FormGroup<ControlsOf<FiltersModel>> {
    return this.fb.group<ControlsOf<FiltersModel>>({
      field1: this.fb.control<Type1>(defaultValue, validators),
      field2: this.fb.control<Type2>(defaultValue, validators),
    });
  }
  
  // Required: Define data loading logic
  protected loadData(): Observable<DataModel[]> {
    // TODO: Replace with actual service call
    return this.dataService.loadData(this.filterFormGroup.value);
  }
}
```

### 3. **Form Validation Patterns**

#### Validation Setup
```typescript
// In createFilters()
return this.fb.group<ControlsOf<FiltersModel>>({
  accountId: this.fb.control<number>(
    null, 
    [Validators.required, Validators.min(1)]
  ),
  dateRange: this.fb.control<Date>(
    null,
    [Validators.required, this.customDateValidator()]
  ),
});
```

#### Template Error Display
```html
<mat-form-field>
  <mat-label>Account ID</mat-label>
  <input matInput type="number" formControlName="accountId" />
  
  <!-- Always provide error feedback -->
  <mat-error *ngIf="filterFormGroup.get('accountId')?.hasError('required')">
    Account ID is required
  </mat-error>
  <mat-error *ngIf="filterFormGroup.get('accountId')?.hasError('min')">
    Account ID must be greater than 0
  </mat-error>
</mat-form-field>
```

### 4. **Error Handling Standards**

#### Service Error Handling
```typescript
// ❌ DON'T: Unlimited retries
retry()

// ✅ DO: Limited retries with backoff
retry({
  count: 3,
  delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000)
})

// ✅ DO: Proper error transformation
catchError((error: HttpErrorResponse) => {
  console.error('Data loading failed:', error);
  // Show user-friendly message
  this.errorMessage.set('Unable to load data. Please try again.');
  return of([]); // Return empty array as fallback
})
```

#### Component Error States
```typescript
// Add error signal to components
protected readonly errorMessage = signal<string | null>(null);
protected readonly hasError = computed(() => !!this.errorMessage());

// Clear errors on retry
protected retryLoad(): void {
  this.errorMessage.set(null);
  this.dataUpdateRequested$.next();
}
```

### 5. **Naming Conventions**

#### Files and Directories
```
feature-name.component.ts     // kebab-case
FeatureNameComponent          // PascalCase class names
featureNameProperty           // camelCase properties
FEATURE_NAME_CONSTANT         // SCREAMING_SNAKE_CASE constants
```

#### Form Control Names
```typescript
// Use descriptive, consistent names
formControlName="accountId"     // ✅ Clear and specific
formControlName="userId"        // ✅ Clear and specific
formControlName="dateFrom"      // ✅ Clear and specific

// Avoid generic names
formControlName="id"            // ❌ Too generic
formControlName="date"          // ❌ Too generic
formControlName="value"         // ❌ Too generic
```

## 🧪 Testing Guidelines

### Component Testing Setup
```typescript
describe('FeatureNameComponent', () => {
  let component: FeatureNameComponent;
  let fixture: ComponentFixture<FeatureNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureNameComponent, NoopAnimationsModule],
      providers: [
        { provide: DataService, useValue: mockDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureNameComponent);
    component = fixture.componentInstance;
  });
});
```

### E2E Testing Preparation
```html
<!-- Add data-testid for stable E2E selectors -->
<mat-form-field data-testid="account-id-field">
  <input 
    matInput 
    formControlName="accountId" 
    data-testid="account-id-input"
  />
</mat-form-field>

<button 
  mat-raised-button 
  (click)="onSubmit()" 
  data-testid="submit-button"
>
  Submit
</button>
```

## 🎨 SCSS Guidelines

### Component Styles
```scss
// Use :host for component root styling
:host {
  display: block;
  padding: 16px;
}

// Use BEM methodology for classes
.feature-name {
  &__header {
    margin-bottom: 16px;
  }
  
  &__content {
    display: flex;
    gap: 16px;
  }
  
  &__item {
    flex: 1;
    
    &--active {
      background-color: var(--primary-color);
    }
  }
}

// Use Angular Material theming
.mat-mdc-form-field {
  width: 100%;
  margin-bottom: 16px;
}
```

## 🔧 Development Tools

### VS Code Extensions
- **Angular Language Service** - Angular template support
- **Prettier** - Code formatting (configured in package.json)
- **ESLint** - Linting (if configured)
- **Angular Snippets** - Code snippets
- **Auto Rename Tag** - HTML tag management

### Prettier Configuration
Already configured in `package.json`:
```json
{
  "prettier": {
    "printWidth": 120,
    "tabWidth": 2,
    "useTabs": false,
    "semi": true,
    "singleQuote": true,
    "trailingComma": "all"
  }
}
```

### Git Hooks (Recommended)
```bash
# Install husky for git hooks
npm install --save-dev husky

# Add pre-commit formatting
npx husky add .husky/pre-commit "npm run format"
```

## 🚀 Performance Best Practices

### Change Detection
- Always use `OnPush` change detection strategy
- Use signals for reactive state management
- Minimize component re-renders with `trackBy` functions

### Bundle Optimization
- Use lazy loading for feature modules
- Import only needed Material components
- Avoid importing entire libraries

### Memory Management
```typescript
// Use takeUntilDestroyed for automatic cleanup
private readonly destroyRef = inject(DestroyRef);

ngOnInit(): void {
  this.subscription$ = this.observable$
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(data => {
      // Handle data
    });
}
```

## 🔍 Code Review Checklist

### Before Submitting PR
- [ ] All TypeScript errors resolved
- [ ] Prettier formatting applied
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] Form validation with user feedback
- [ ] Component follows established patterns
- [ ] E2E testing attributes added
- [ ] Performance considerations addressed

### Review Focus Areas
- [ ] Type safety compliance
- [ ] Error boundary implementation
- [ ] User experience completeness
- [ ] Consistent naming conventions
- [ ] Memory leak prevention
- [ ] Accessibility considerations

---

**Happy coding! 🎉**
