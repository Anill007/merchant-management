import {
  Directive,
  Input,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  inject
} from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from '../core/auth/auth.service';

@Directive({
  selector: '[appElementHasPermission]',
  standalone: true
})
export class ElementHasPermission implements OnDestroy {
  private readonly templateRef = inject(
    TemplateRef<unknown>
  );

  private readonly viewContainer = inject(
    ViewContainerRef
  );

  private readonly authService = inject(AuthService);

  private requiredPermissions: string[] = [];
  private requireAll = true;
  private hasView = false;

  private readonly subscription: Subscription;

  constructor() {
    this.subscription =
      this.authService.permissions$.subscribe(() => {
        this.updateView();
      });
  }

  @Input()
  set appHasPermission(
    value: string | string[] | null | undefined
  ) {
    this.requiredPermissions = Array.isArray(value)
      ? value
      : value
        ? [value]
        : [];

    this.updateView();
  }

  @Input()
  set appElementHasPermissionMode(value: 'all' | 'any') {
    this.requireAll = value !== 'any';
    this.updateView();
  }

  private updateView(): void {
    const allowed =
      this.requiredPermissions.length > 0 &&
      (this.requireAll
        ? this.authService.hasAllPermissions(
          this.requiredPermissions
        )
        : this.authService.hasAnyPermission(
          this.requiredPermissions
        ));

    if (allowed && !this.hasView) {
      this.viewContainer.createEmbeddedView(
        this.templateRef
      );

      this.hasView = true;
    } else if (!allowed && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}