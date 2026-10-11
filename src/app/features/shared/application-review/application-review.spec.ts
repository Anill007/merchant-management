import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationReview } from './application-review';

describe('ApplicationReview', () => {
  let component: ApplicationReview;
  let fixture: ComponentFixture<ApplicationReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationReview],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationReview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
