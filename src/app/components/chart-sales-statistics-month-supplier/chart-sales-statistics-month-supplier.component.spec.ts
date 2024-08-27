import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartSalesStatisticsMonthSupplierComponent } from './chart-sales-statistics-month-supplier.component';

describe('ChartSalesStatisticsMonthSupplierComponent', () => {
  let component: ChartSalesStatisticsMonthSupplierComponent;
  let fixture: ComponentFixture<ChartSalesStatisticsMonthSupplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartSalesStatisticsMonthSupplierComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartSalesStatisticsMonthSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
