import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-page-404',
  styleUrl: './page-404.scss',
  templateUrl: './page-404.html',
})
export class Page404 {
  constructor(private router: Router) { }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
