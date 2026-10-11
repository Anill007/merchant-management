
import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { AuthService } from '../../../core/auth/auth.service';
import { MerchantApplication } from '../application-review/application-review.model';
import { applications } from '../../../mock-data/app-mock';

export type PageMode = 'create' | 'edit' | 'review';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_DOC_EXTS = ['.pdf', '.txt'];
const ALLOWED_DOC_TYPES = ['application/pdf', 'text/plain'];
const SIMULATE_UPLOAD_MS = 1800;

@Component({
  selector: 'app-application-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
  ],
  templateUrl: './application-create.html',
  styleUrl: './application-create.scss',
})
export class ApplicationCreate implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  private fb     = inject(FormBuilder);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  auth           = inject(AuthService);

  // ── Mode ─────────────────────────────────────────────────────────────────
  mode       = signal<PageMode>('create');
  existingApp = signal<MerchantApplication | null>(null);

  readonly isCreate = computed(() => this.mode() === 'create');
  readonly isEdit   = computed(() => this.mode() === 'edit');
  readonly isReview = computed(() => this.mode() === 'review');

  /** Whether all fields should be read-only (review mode) */
  readonly readonly = computed(() => this.mode() === 'review');

  pageTitle = computed(() => {
    switch (this.mode()) {
      case 'edit':   return 'Edit Application';
      case 'review': return 'Review Application';
      default:       return 'New Merchant Application';
    }
  });

  pageSubtitle = computed(() => {
    switch (this.mode()) {
      case 'edit':   return 'Update the merchant application details.';
      case 'review': return 'Review all details and accept or reject.';
      default:       return 'Complete all three steps to submit.';
    }
  });

  // ── Forms ─────────────────────────────────────────────────────────────────
  merchantForm = this.fb.group({
    name:       ['', [Validators.required, Validators.minLength(2)]],
    phone:      ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-()]{7,20}$/)]],
    email:      ['', [Validators.required, Validators.email]],
    postalCode: ['', [Validators.required, Validators.pattern(/^\d{4,10}$/)]],
    city:       ['', [Validators.required, Validators.minLength(2)]],
    state:      ['', [Validators.required, Validators.minLength(2)]],
    country:    ['', [Validators.required, Validators.minLength(2)]],
  });

  ownerForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    dob:       [null as Date | null, Validators.required],
    contact:   ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-()]{7,20}$/)]],
    email:     ['', [Validators.required, Validators.email]],
  });

  // ── Upload state ──────────────────────────────────────────────────────────
  docFile     = signal<File | null>(null);
  docError    = signal<string>('');
  docProgress = signal<number>(0);
  docDone     = signal<boolean>(false);

  imageFile     = signal<File | null>(null);
  imageError    = signal<string>('');
  imageProgress = signal<number>(0);
  imageDone     = signal<boolean>(false);
  imagePreview  = signal<string>('');

  // existing paths (edit / review)
  existingDocPath   = signal<string>('');
  existingImagePath = signal<string>('');

  submitted     = signal<boolean>(false);
  reviewDone    = signal<false | 'APPROVED' | 'REJECTED'>(false);

  today  = new Date();
  maxDob = new Date(
    this.today.getFullYear() - 18,
    this.today.getMonth(),
    this.today.getDate()
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const id  = this.route.snapshot.paramMap.get('id');
    const seg = this.route.snapshot.url.map(s => s.path);
    const lastSeg = seg[seg.length - 1];

    if (lastSeg === 'edit')   this.mode.set('edit');
    if (lastSeg === 'review') this.mode.set('review');

    if (id) {
      const app = applications.find(a => a.id === id) ?? null;
      this.existingApp.set(app);
      if (app) this.populateForms(app);
    }

    if (this.readonly()) {
      this.merchantForm.disable();
      this.ownerForm.disable();
    }
  }

  private populateForms(app: MerchantApplication): void {
    this.merchantForm.patchValue({
      name:       app.name,
      phone:      app.phone,
      email:      app.email,
      postalCode: app.postalCode,
      city:       app.city,
      state:      app.state,
      country:    app.country,
    });

    this.ownerForm.patchValue({
      firstName: app.ownerFirstName,
      lastName:  app.ownerLastName,
      dob:       app.ownerDob ? new Date(app.ownerDob) : null,
      contact:   app.ownerContact,
      email:     app.ownerEmail,
    });

    if (app.documentPath) this.existingDocPath.set(app.documentPath);
    if (app.imagePath)    this.existingImagePath.set(app.imagePath);
  }

  // ── Upload valid check ────────────────────────────────────────────────────
  get uploadsValid(): boolean {
    if (this.isReview()) return true;
    // In edit mode, existing paths count as uploaded
    const docOk  = this.docDone()  || (this.isEdit() && !!this.existingDocPath());
    const imgOk  = this.imageDone() || (this.isEdit() && !!this.existingImagePath());
    return docOk && imgOk;
  }

  // ── Upload handlers ───────────────────────────────────────────────────────
  onDocSelected(event: Event): void {
    if (this.readonly()) return;
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0] ?? null;
    this.docError.set('');
    this.docProgress.set(0);
    this.docDone.set(false);
    this.docFile.set(null);
    if (!file) return;

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_DOC_EXTS.includes(ext) && !ALLOWED_DOC_TYPES.includes(file.type)) {
      this.docError.set('Only PDF and TXT files are allowed.');
      input.value = '';
      return;
    }
    this.docFile.set(file);
    this.simulateUpload('doc');
  }

  onImageSelected(event: Event): void {
    if (this.readonly()) return;
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0] ?? null;
    this.imageError.set('');
    this.imageProgress.set(0);
    this.imageDone.set(false);
    this.imageFile.set(null);
    this.imagePreview.set('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.imageError.set('Only image files are allowed.');
      input.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      this.imageError.set('Image must be smaller than 5 MB.');
      input.value = '';
      return;
    }
    this.imageFile.set(file);
    const reader = new FileReader();
    reader.onload = e => this.imagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
    this.simulateUpload('image');
  }

  private simulateUpload(type: 'doc' | 'image'): void {
    const setProgress = type === 'doc'
      ? (v: number) => this.docProgress.set(v)
      : (v: number) => this.imageProgress.set(v);
    const setDone = type === 'doc'
      ? () => this.docDone.set(true)
      : () => this.imageDone.set(true);

    const steps = 20;
    const intervalMs = SIMULATE_UPLOAD_MS / steps;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProgress(Math.round((step / steps) * 100));
      if (step >= steps) { clearInterval(interval); setDone(); }
    }, intervalMs);
  }

  removeDoc(): void {
    if (this.readonly()) return;
    this.docFile.set(null);
    this.docProgress.set(0);
    this.docDone.set(false);
    this.docError.set('');
  }

  removeImage(): void {
    if (this.readonly()) return;
    this.imageFile.set(null);
    this.imageProgress.set(0);
    this.imageDone.set(false);
    this.imageError.set('');
    this.imagePreview.set('');
  }

  // ── Create / Edit submit ──────────────────────────────────────────────────
  submit(): void {
    if (!this.uploadsValid) return;
    const m    = this.merchantForm.value;
    const o    = this.ownerForm.value;
    const user = this.auth.currentUser;

    if (this.isEdit()) {
      const app = this.existingApp();
      if (!app) return;
      const idx = applications.findIndex(a => a.id === app.id);
      if (idx === -1) return;

      applications[idx] = {
        ...applications[idx],
        name:       m.name!,
        email:      m.email!,
        phone:      m.phone!,
        postalCode: m.postalCode!,
        city:       m.city!,
        state:      m.state!,
        country:    m.country!,
        address:    `${m.city}, ${m.country}`,
        ownerFirstName: o.firstName!,
        ownerLastName:  o.lastName!,
        ownerDob: (o.dob as Date | null)?.toISOString().split('T')[0] ?? '',
        ownerContact:   o.contact!,
        ownerEmail:     o.email!,
        documentPath: this.docDone()  ? 'example.txt' : (applications[idx].documentPath ?? 'example.txt'),
        imagePath:    this.imageDone() ? 'example.png' : (applications[idx].imagePath    ?? 'example.png'),
      };
    } else {
      applications.push({
        id: `APP-${1000 + applications.length + 1}`,
        status: 'UNDER_REVIEW',
        reviewer: null,
        createdBy: user?.id ?? 0,
        name:       m.name!,
        email:      m.email!,
        phone:      m.phone!,
        postalCode: m.postalCode!,
        city:       m.city!,
        state:      m.state!,
        country:    m.country!,
        address:    `${m.city}, ${m.country}`,
        ownerFirstName: o.firstName!,
        ownerLastName:  o.lastName!,
        ownerDob: (o.dob as Date | null)?.toISOString().split('T')[0] ?? '',
        ownerContact:   o.contact!,
        ownerEmail:     o.email!,
        documentPath: 'example.txt',
        imagePath:    'example.png',
      });
    }
    this.submitted.set(true);
  }

  // ── Review actions ────────────────────────────────────────────────────────
  approveApplication(): void {
    this.changeStatus('APPROVED');
  }

  rejectApplication(): void {
    this.changeStatus('REJECTED');
  }

  private changeStatus(status: 'APPROVED' | 'REJECTED'): void {
    const app = this.existingApp();
    if (!app) return;
    const idx = applications.findIndex(a => a.id === app.id);
    if (idx === -1) return;
    const user = this.auth.currentUser;
    applications[idx] = {
      ...applications[idx],
      status,
      reviewer: user?.id ?? applications[idx].reviewer,
    };
    this.reviewDone.set(status);
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  goBack(): void {
    this.router.navigate(['/application-review']);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  fieldError(form: AbstractControl | null, field: string): string {
    if (this.readonly()) return '';
    const ctrl = (form as any)?.get(field);
    if (!ctrl || !ctrl.invalid || !ctrl.touched) return '';
    if (ctrl.errors?.['required'])  return 'This field is required.';
    if (ctrl.errors?.['email'])     return 'Enter a valid email address.';
    if (ctrl.errors?.['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    if (ctrl.errors?.['pattern'])   return 'Invalid format.';
    return 'Invalid value.';
  }

  formatBytes(bytes: number): string {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  get statusClass(): string {
    const app = this.existingApp();
    return app ? 'status-' + app.status.toLowerCase() : '';
  }
}
