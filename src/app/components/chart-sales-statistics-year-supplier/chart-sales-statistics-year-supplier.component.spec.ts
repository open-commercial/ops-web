import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartSalesStatisticsYearSupplierComponent } from './chart-sales-statistics-year-supplier.component';

describe('ChartSalesStatisticsYearSupplierComponent', () => {
  let component: ChartSalesStatisticsYearSupplierComponent;
  let fixture: ComponentFixture<ChartSalesStatisticsYearSupplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartSalesStatisticsYearSupplierComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartSalesStatisticsYearSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
