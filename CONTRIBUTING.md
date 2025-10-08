# Contributing to Webler Client Portal

Thank you for your interest in contributing to the Webler Client Portal! This document provides guidelines for development, code style, and the contribution process.

## Table of Contents

- [Development Setup](#development-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Component Development](#component-development)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Architecture Principles](#architecture-principles)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Development Setup

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** - Comes with Node.js
- **Git** - Version control

### Initial Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/client-portal.git
   cd client-portal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Verify setup:**
   - Visit `http://localhost:4321`
   - Check `/api-demo` page for API testing
   - Test form validation and error states

### Environment Configuration

#### Required Environment Variables
```bash
# Backend API endpoint
PUBLIC_API_URL=http://localhost:3000

# App branding
PUBLIC_APP_NAME=Webler
PUBLIC_APP_URL=http://localhost:4321
```

#### Optional Configuration
```bash
# TanStack Query settings
PUBLIC_QUERY_STALE_TIME=300000      # 5 minutes
PUBLIC_QUERY_CACHE_TIME=600000      # 10 minutes
PUBLIC_STATUS_POLL_INTERVAL=5000    # 5 seconds

# Feature flags
PUBLIC_ENABLE_ANALYTICS=false
PUBLIC_ENABLE_FEEDBACK=true
PUBLIC_ENABLE_DEBUG=false
```

## Code Style Guidelines

### TypeScript Standards

#### Strict Type Safety
```typescript
// ✅ Good: Explicit types
interface GeneratorFormData {
  businessName: string;
  industry: string;
  description: string;
  features: string[];
}

// ❌ Bad: Any types
const formData: any = {...};
```

#### Interface vs Type
```typescript
// ✅ Use interfaces for object shapes
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
}

// ✅ Use types for unions and computed types
type ToastType = 'error' | 'warning' | 'success' | 'info';
type ComponentState = 'idle' | 'loading' | 'success' | 'error';
```

#### Generic Components
```typescript
// ✅ Good: Generic types for reusability
interface LoadingButtonProps<T = unknown> {
  onClick: () => Promise<T>;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const LoadingButton = <T,>({ onClick, children }: LoadingButtonProps<T>) => {
  // Implementation
};
```

### React Component Patterns

#### Component Structure
```typescript
// ✅ Standard component structure
import React, { useState, useCallback } from 'react';
import { SomeIcon } from 'lucide-react';

interface ComponentProps {
  // Props interface
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // State declarations
  const [state, setState] = useState('');

  // Event handlers (useCallback for optimization)
  const handleClick = useCallback(() => {
    // Handler logic
  }, [dependencies]);

  // Render
  return (
    <div className="component-class">
      {/* JSX content */}
    </div>
  );
};

export default Component;
```

#### Hook Usage
```typescript
// ✅ Custom hooks for API logic
export const useWebsiteGenerator = () => {
  return useMutation({
    mutationFn: (data: GeneratorFormData) =>
      apiClient.post('/generate', data),
    onSuccess: (response) => {
      showToast('Website generation started!', 'success');
    },
    onError: (error) => {
      showToast(error.message, 'error');
    }
  });
};

// ✅ Component usage
const GeneratorForm = () => {
  const { mutate: generateWebsite, isLoading } = useWebsiteGenerator();

  const handleSubmit = (data: GeneratorFormData) => {
    generateWebsite(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
    </form>
  );
};
```

### Astro Component Guidelines

#### Component Structure
```astro
---
// ✅ Component script (runs at build time)
export interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<!-- ✅ Component template -->
<section class="component-section">
  <h2>{title}</h2>
  {description && <p>{description}</p>}
</section>

<style>
  /* ✅ Scoped styles */
  .component-section {
    @apply p-6 bg-white rounded-lg shadow-sm;
  }
</style>
```

#### Island Components
```astro
---
// ✅ Import React components for islands
import GeneratorForm from '../components/react/GeneratorForm.tsx';
import ErrorBoundary from '../components/react/ErrorBoundary.tsx';
---

<Layout title="Generate Website">
  <main>
    <!-- Static content -->
    <h1>Generate Your Website</h1>

    <!-- Interactive island -->
    <ErrorBoundary client:load>
      <GeneratorForm client:load />
    </ErrorBoundary>
  </main>
</Layout>
```

### CSS and Styling

#### Tailwind CSS Conventions
```typescript
// ✅ Responsive design patterns
const responsiveClasses = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";

// ✅ Component variants
const buttonVariants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  danger: "bg-red-600 text-white hover:bg-red-700"
};

// ✅ State-based styling
const getLoadingClasses = (isLoading: boolean) =>
  `btn ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`;
```

#### Accessibility Requirements
```typescript
// ✅ Semantic HTML and ARIA attributes
<button
  type="submit"
  disabled={isLoading}
  aria-label={isLoading ? 'Generating website...' : 'Generate website'}
  className="btn-primary"
>
  {isLoading ? <LoadingSpinner /> : 'Generate'}
</button>

// ✅ Focus management
<div role="alert" aria-live="polite">
  {errorMessage}
</div>
```

## Component Development

### Creating New Components

#### React Components (Interactive)
```bash
# Create in src/components/react/
touch src/components/react/NewComponent.tsx
```

```typescript
// Template for new React components
import React from 'react';

interface NewComponentProps {
  // Define props
}

const NewComponent: React.FC<NewComponentProps> = ({
  // Destructure props
}) => {
  // Component logic

  return (
    <div className="new-component">
      {/* Component JSX */}
    </div>
  );
};

export default NewComponent;
```

#### Astro Components (Static)
```bash
# Create in src/components/astro/
touch src/components/astro/NewComponent.astro
```

```astro
---
export interface Props {
  // Define props
}

const { /* destructure props */ } = Astro.props;
---

<div class="new-component">
  <!-- Component content -->
</div>

<style>
  .new-component {
    /* Scoped styles */
  }
</style>
```

### Component Checklist

Before submitting a new component:

- [ ] **TypeScript**: Proper interfaces and type safety
- [ ] **Accessibility**: ARIA attributes, semantic HTML, keyboard navigation
- [ ] **Responsive**: Mobile-first design with appropriate breakpoints
- [ ] **Error Handling**: Graceful error states and user feedback
- [ ] **Loading States**: Appropriate loading indicators and skeleton screens
- [ ] **Testing**: Component tests for critical functionality
- [ ] **Documentation**: JSDoc comments for complex components

### Error Handling Patterns

#### Component Error Boundaries
```typescript
// ✅ Wrap interactive components
<ErrorBoundary fallback={<ComponentErrorFallback />}>
  <InteractiveComponent />
</ErrorBoundary>
```

#### API Error Handling
```typescript
// ✅ Consistent error handling
const { mutate, isLoading, error } = useMutation({
  mutationFn: apiCall,
  onError: (error) => {
    // Log error for debugging
    console.error('API Error:', error);

    // Show user-friendly message
    showToast(
      error.message || 'Something went wrong. Please try again.',
      'error'
    );
  }
});
```

#### Form Validation
```typescript
// ✅ Validation with user feedback
const validateForm = (data: FormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.businessName.trim()) {
    errors.businessName = 'Business name is required';
  }

  if (data.businessName.length > 100) {
    errors.businessName = 'Business name must be 100 characters or less';
  }

  return errors;
};
```

## Testing Guidelines

### Component Testing
```typescript
// ✅ React Testing Library patterns
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import GeneratorForm from './GeneratorForm';

describe('GeneratorForm', () => {
  it('submits form with valid data', async () => {
    const onSubmit = vi.fn();
    render(<GeneratorForm onSubmit={onSubmit} />);

    // Fill form
    fireEvent.change(screen.getByLabelText(/business name/i), {
      target: { value: 'Test Business' }
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    // Assert
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        businessName: 'Test Business'
      });
    });
  });
});
```

### API Testing
```typescript
// ✅ Mock API responses
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.post('/api/generate', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ jobId: 'test-job-id' })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Accessibility Testing
```typescript
// ✅ Accessibility validation
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should not have accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Pull Request Process

### Branch Naming
```bash
# Feature branches
feature/issue-number-description
feature/15-documentation-readme

# Bug fixes
fix/issue-number-description
fix/23-form-validation-error

# Hot fixes
hotfix/critical-issue-description
hotfix/api-timeout-fix
```

### Commit Messages
```bash
# Format: type(scope): description

# Features
feat(forms): add multi-step form validation
feat(api): implement status polling with TanStack Query

# Fixes
fix(ui): resolve loading spinner alignment issue
fix(api): handle timeout errors gracefully

# Documentation
docs(readme): update installation instructions
docs(arch): add component architecture diagrams

# Refactoring
refactor(components): extract common button variants
refactor(hooks): simplify API client implementation
```

### Pull Request Template
```markdown
## Summary
Brief description of changes and motivation.

## Changes Made
- [ ] Added new component: ComponentName
- [ ] Updated existing functionality: describe changes
- [ ] Fixed bug: describe the issue and solution

## Testing
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Manual testing completed
- [ ] Accessibility testing passed

## Breaking Changes
List any breaking changes and migration steps.

## Screenshots
Include screenshots for UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors in development
```

### Review Criteria

#### Code Quality
- [ ] **Type Safety**: Proper TypeScript usage
- [ ] **Performance**: No unnecessary re-renders or API calls
- [ ] **Accessibility**: WCAG 2.1 AA compliance
- [ ] **Error Handling**: Graceful error states
- [ ] **Testing**: Adequate test coverage

#### User Experience
- [ ] **Responsive Design**: Works on all device sizes
- [ ] **Loading States**: Appropriate loading indicators
- [ ] **Error Feedback**: User-friendly error messages
- [ ] **Performance**: Fast loading and smooth interactions

## Architecture Principles

### Component Design
- **Single Responsibility**: Each component has one clear purpose
- **Composition**: Prefer composition over inheritance
- **Reusability**: Design components for multiple use cases
- **Predictability**: Components behave consistently

### State Management
- **Server State**: TanStack Query for API data
- **UI State**: React hooks for component state
- **Global State**: React Context for shared state
- **Form State**: Controlled components with validation

### Performance
- **Bundle Size**: Keep components under 50KB
- **Loading**: Implement skeleton screens and loading states
- **Caching**: Leverage TanStack Query caching
- **Optimization**: Use React.memo and useCallback judiciously

### Security
- **Input Validation**: Validate all user inputs
- **XSS Prevention**: Sanitize dynamic content
- **API Security**: Never expose sensitive data
- **Environment Variables**: Secure configuration management

## Common Patterns

### API Integration
```typescript
// ✅ Standard API hook pattern
export const useFeature = () => {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (data: FeatureData) => apiClient.post('/feature', data),
    onSuccess: () => showToast('Success!', 'success'),
    onError: (error) => showToast(error.message, 'error')
  });
};
```

### Form Handling
```typescript
// ✅ Standard form pattern
const FormComponent = () => {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const { mutate: submitForm, isLoading } = useFormSubmission();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    submitForm(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with error handling */}
    </form>
  );
};
```

### Loading States
```typescript
// ✅ Consistent loading pattern
const ComponentWithLoading = () => {
  const { data, isLoading, error } = useQuery('data', fetchData);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;

  return <DataDisplay data={data} />;
};
```

## Troubleshooting

### Common Issues

#### Development Server
```bash
# Clear cache and restart
rm -rf node_modules/.astro
npm run dev

# Check port conflicts
lsof -ti:4321
```

#### TypeScript Errors
```bash
# Restart TypeScript service
# In VSCode: Cmd+Shift+P → "TypeScript: Restart TS Server"

# Check TypeScript configuration
npx tsc --noEmit
```

#### Build Issues
```bash
# Clean build
rm -rf dist/
npm run build

# Check for missing dependencies
npm audit
npm update
```

#### API Integration
```bash
# Verify environment variables
echo $PUBLIC_API_URL

# Test API endpoints
curl -X GET http://localhost:3000/health
```

### Performance Debugging
```typescript
// ✅ Performance monitoring
import { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration) => {
  console.log('Component:', id, 'Phase:', phase, 'Duration:', actualDuration);
};

<Profiler id="ComponentName" onRender={onRenderCallback}>
  <ComponentName />
</Profiler>
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx astro-bundle-analyzer dist/
```

## Resources

### Documentation
- [Astro Documentation](https://docs.astro.build/)
- [React Documentation](https://react.dev/)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Tools
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Community
- [GitHub Issues](https://github.com/WebAsAService/client-portal/issues)
- [Discussions](https://github.com/WebAsAService/client-portal/discussions)

---

Thank you for contributing to the Webler Client Portal! Your contributions help make the platform better for everyone.