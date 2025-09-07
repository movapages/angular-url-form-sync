# TAXER Admin Panel

Angular 20 admin panel application for tax management with cross-component filter synchronization.

## 🎯 Task Objective

Implement **cross-component filter synchronization via URL parameters** to enable:
- Bidirectional sync between form controls and URL state
- Deep linking support for filtered views
- Filter state persistence across navigation
- E2E testing compatibility

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

Navigate to `http://localhost:4200/` - the app will redirect to `/stats`.

## 🏗️ Tech Stack

- **Angular 20** - Latest Angular with standalone components
- **Angular Material** - UI component library
- **RxJS 7.8** - Reactive programming
- **TypeScript 5.8** - Strong typing
- **SCSS** - Styling

## 📁 Project Structure

```
src/app/
├── modules/
│   ├── stats/          # Statistics with date range & comparison
│   ├── logger/         # Logging with filtering & badges  
│   └── payment/        # Payment processing filters
├── shared/
│   ├── components/     # FilteredAbstractComponent base class
│   ├── directives/     # UiToggleGroupSingleDirective
│   └── models/         # ControlsOf<T> type utilities
└── app.component.*     # Main shell with navigation
```

## 🎨 Features

### Current Implementation
- ✅ Modern Angular patterns (signals, standalone components)
- ✅ Reactive forms with strong typing
- ✅ Abstract filtering component pattern
- ✅ Material Design UI
- ✅ OnPush change detection strategy

### To Be Implemented
- 🔄 URL parameter synchronization
- 🔄 Deep linking support
- 🔄 Cross-component filter state sharing
- 🔄 E2E testing preparation

## 🧭 Navigation

- **`/stats`** - Statistics with date range filters and comparison mode
- **`/logger`** - Log entries with account, level, and date filters  
- **`/payment`** - Payment records with type, date, and ID filters

## 📚 Documentation

- [Architecture Overview](./ARCHITECTURE.md) - Technical architecture and patterns
- [Task Requirements](./TASK_REQUIREMENTS.md) - Implementation specifications
- [Code Review](./CODE_REVIEW.md) - Quality assessment and recommendations
- [Development Guide](./DEVELOPMENT.md) - Developer setup and guidelines

## 🧪 Testing

E2E tests will be automated and will focus on:
- Filter form interactions
- URL parameter synchronization
- Cross-component state consistency
- Deep linking functionality

---

**Language**: Ukrainian (UK-UA locale)  
**Currency**: Ukrainian Hryvnia (₴)
