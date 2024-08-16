import { Component, OnInit } from '@angular/core';
import { ChartInterface } from 'src/app/models/chart-interface';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-purchase-statistics-year-supplier',
  templateUrl: './chart-purchase-statistics-year-supplier.component.html',
  styleUrls: ['./chart-purchase-statistics-year-supplier.component.scss']
})
export class ChartPurchaseStatisticsYearSupplierComponent implements OnInit {
  years: number[] = [];
  selectedYearSupplier: number = new Date().getFullYear();
  suppliers: ChartInterface[] = [];

  constructor(private chartData: ChartService) { }
  ngOnInit(): void {
    this.years = this.generateYearsData_2();
    this.loadChartDataAnnualSupplier(this.selectedYearSupplier);
  }

  loadChartDataAnnualSupplier(year: number): void {
    this.chartData.getChartDataAnnualSupplier(year).subscribe(data => {
      this.suppliers = data.datasets[0].data.map((monto, index) =>({
        entidad: data.labels[index],
        monto: monto
      })) || [];
    })
  }

  onYearSupplierChange($event: Event): void {
    const year = parseInt(($event.target as HTMLSelectElement).value, 10);
    this.selectedYearSupplier = year;
    this.loadChartDataAnnualSupplier(this.selectedYearSupplier);
  }

  generateYearsData_2():number[]{
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10;
    const yearsData = Array.from({length: currentYear - startYear + 1}, (_, i)=> currentYear - i);
    return yearsData;
  }
}
