
import {
  AfterViewInit,
  Component,
  inject,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { applications } from '../../../mock-data/app-mock';
import { AuthService } from '../../../core/auth/auth.service';
import { MerchantApplication } from './application-review.model';

@Component({
  selector: 'app-merchant-applications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './application-review.html',
  styleUrl: './application-review.scss',
})
export class ApplicationReview implements AfterViewInit {
  displayedColumns: string[] = [
    'id',
    'name',
    'email',
    'status',
    'address',
    'actions',
  ];

  searchText = '';
  selectedStatus = 'ALL';

  statuses = [
    'ALL',
    'UNASSIGNED',
    'APPROVED',
    'REJECTED',
    'UNDER_REVIEW',
  ];

  public auth = inject(AuthService);

  applications = this.getApplicationsForCurrentUser();
  dataSource = new MatTableDataSource<MerchantApplication>(
    this.applications
  );

  private getApplicationsForCurrentUser(): MerchantApplication[] {
    const user = this.auth.currentUser;

    if (!user) {
      return [];
    }

    switch (user.role) {
      case 'sales':
        return applications.filter(
          app => app.reviewer === null && app.createdBy === user.id
        );

      case 'reviewer':
        return applications.filter(app => app.reviewer === user.id);

      case 'admin':
      default:
        return [...applications];
    }
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private dialog: MatDialog
  ) {
    this.dataSource.filterPredicate = (application, filter) => {
      const criteria = JSON.parse(filter) as {
        search: string;
        status: string;
      };

      const searchableText = [
        application.id,
        application.name,
        application.email,
        application.status,
        application.address,
      ].join(' ').toLowerCase();

      const matchesSearch = searchableText.includes(criteria.search);

      let matchesStatus = true;

      if (criteria.status === 'UNASSIGNED') {
        matchesStatus = application.reviewer === null;
      } else if (criteria.status === 'ALL') {
        matchesStatus = true;
      } else {
        // Only match the actual application status.
        matchesStatus =
          application.status === criteria.status &&
          application.reviewer !== null;
      }

      return matchesSearch && matchesStatus;
    };

    this.dataSource.sortingDataAccessor = (application, property) => {
      const value =
        application[property as keyof MerchantApplication];

      if (value == null) {
        return '';
      }

      return typeof value === 'string'
        ? value.toLowerCase()
        : value;
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilters(): void {
    this.dataSource.filter = JSON.stringify({
      search: this.searchText.trim().toLowerCase(),
      status: this.selectedStatus,
    });

    this.paginator?.firstPage();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = 'ALL';
    this.applyFilters();
  }

  get filteredApplications(): number {
    return this.dataSource.filteredData.length;
  }

  createApplication(): void {
    this.router.navigate(['/merchant-applications', 'new']);
  }

  editApplication(application: MerchantApplication): void {
    this.router.navigate([
      '/merchant-applications',
      application.id,
      'edit',
    ]);
  }

  reviewApplication(application: MerchantApplication): void {
    this.router.navigate([
      '/merchant-applications',
      application.id,
      'review',
    ]);
  }

  deleteApplication(application: MerchantApplication): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${application.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.applications = this.applications.filter(
      item => item.id !== application.id
    );

    this.dataSource.data = [...this.applications];
    this.paginator?.firstPage();
  }
}
