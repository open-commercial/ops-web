import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartSalesStatisticsMonthComponent } from './chart-sales-statistics-month.component';

describe('ChartSalesStatisticsMonthComponent', () => {
  let component: ChartSalesStatisticsMonthComponent;
  let fixture: ComponentFixture<ChartSalesStatisticsMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartSalesStatisticsMonthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartSalesStatisticsMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
