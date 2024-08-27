import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartSalesStatisticsYearComponent } from './chart-sales-statistics-year.component';

describe('ChartSalesStatisticsYearComponent', () => {
  let component: ChartSalesStatisticsYearComponent;
  let fixture: ComponentFixture<ChartSalesStatisticsYearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartSalesStatisticsYearComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartSalesStatisticsYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
