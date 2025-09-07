import { DestroyRef, Directive, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, Observable, Subject, throwError, debounceTime } from 'rxjs';
import { catchError, retry, switchMap, tap } from 'rxjs/operators';

import { ControlsOf } from '../models/controls-of';

@Directive()
export abstract class FilteredAbstractComponent<D, F extends Record<string, unknown> = Record<string, never>>
  implements OnInit
{
  protected filterFormGroup: FormGroup<ControlsOf<F>>;
  private readonly dataUpdateRequested$ = new Subject<void>();

  protected readonly isLoading = signal<boolean>(false);
  protected readonly data = signal<D>(null);

  protected readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected createFilters(): FormGroup<ControlsOf<F>> {
    return new FormGroup<ControlsOf<F>>({} as ControlsOf<F>);
  }

  protected abstract loadData(): Observable<D>;

  // URL synchronization methods
  protected abstract getUrlParamKey(formControlName: string): string;
  protected abstract deserializeUrlParam(key: string, value: string): any;
  protected serializeUrlParam(key: string, value: any): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    if (value instanceof Date) {
      // Preserve local date without timezone conversion
      // Format: YYYY-MM-DD for date-only parameters
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    if (Array.isArray(value)) {
      return value.join(',');
    }
    return String(value);
  }

  ngOnInit(): void {
    this.filterFormGroup = this.createFilters();
    
    // Load initial state from URL
    this.loadFromUrl();

    this.dataUpdateRequested$
      .asObservable()
      .pipe(
        tap(() => this.isLoading.set(true)),
        switchMap(() => this.loadData()),
        catchError((error) => {
          this.isLoading.set(false);
          return throwError(() => error);
        }),
        tap(() => this.isLoading.set(false)),
        retry({ count: 3 }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => {
        this.data.set(data);
      });

    this.filterFormGroup.valueChanges
      .pipe(
        // Remove the valid filter to allow URL updates even with invalid forms
        // filter(() => this.filterFormGroup.valid),
        distinctUntilChanged(),
        debounceTime(300), // Prevent excessive URL updates
        retry({ count: 3 }), // Limited retries
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        console.log('Form value changed:', this.filterFormGroup.value); // Debug log
        this.updateUrl();
        // Only load data if form is valid
        if (this.filterFormGroup.valid) {
          this.dataUpdateRequested$.next(void 0);
        }
      });
      
    // Subscribe to URL changes
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => this.updateFormFromUrl(params));

    // перше завантаження даних
    this.dataUpdateRequested$.next(void 0);
  }

  private loadFromUrl(): void {
    const params = this.route.snapshot.queryParams;
    this.updateFormFromUrl(params);
  }

  private updateUrl(): void {
    const formValue = this.filterFormGroup.value;
    const queryParams: Record<string, string> = {};

    console.log('Updating URL with form value:', formValue); // Debug log

    Object.keys(formValue).forEach(key => {
      const value = formValue[key];
      const urlKey = this.getUrlParamKey(key);
      const serialized = this.serializeUrlParam(urlKey, value);
      
      console.log(`Key: ${key}, Value:`, value, 'Serialized:', serialized); // Debug log
      
      if (serialized !== null) {
        queryParams[urlKey] = serialized;
      }
    });

    console.log('Final query params:', queryParams); // Debug log

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'replace', // Changed from 'merge' to 'replace'
      replaceUrl: true
    });
  }

  private updateFormFromUrl(params: Record<string, string>): void {
    const formValue: Partial<F> = {};
    let hasChanges = false;

    console.log('=== URL → Form Update ===');
    console.log('URL params received:', params);
    console.log('Available form controls:', Object.keys(this.filterFormGroup.controls));

    Object.keys(params).forEach(urlKey => {
      const value = params[urlKey];
      if (value) {
        try {
          const formKey = this.getFormControlKey(urlKey);
          console.log(`URL key: ${urlKey} → Form key: ${formKey}`);
          
          if (formKey && this.filterFormGroup.get(formKey)) {
            const deserializedValue = this.deserializeUrlParam(urlKey, value);
            console.log(`Deserializing ${urlKey}="${value}" → ${formKey}:`, deserializedValue);
            formValue[formKey as keyof F] = deserializedValue;
            hasChanges = true;
          } else {
            console.warn(`No form control found for URL key: ${urlKey} (mapped to: ${formKey})`);
          }
        } catch (error) {
          console.warn(`Failed to deserialize URL param ${urlKey}:`, error);
        }
      }
    });

    console.log('Form value to patch:', formValue);
    console.log('Has changes:', hasChanges);

    if (hasChanges) {
      // Use type assertion to satisfy Angular's FormGroup typing requirements
      // Note: 'any' is required here - 'unknown' won't work due to Angular's complex FormGroup typing
      // Runtime safety guaranteed: formValue structure is validated by deserializeUrlParam() logic
      this.filterFormGroup.patchValue(formValue as any, { emitEvent: false });
      console.log('Form patched successfully');
    }
  }

  private getFormControlKey(urlKey: string): string | null {
    // Find form control key by matching URL key
    const formKeys = Object.keys(this.filterFormGroup.controls);
    return formKeys.find(key => this.getUrlParamKey(key) === urlKey) || null;
  }
}
