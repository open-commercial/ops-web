import { Component, OnInit } from '@angular/core';
import { ChartInterface } from 'src/app/models/chart-interface';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-purchase-statistics-month-supplier',
  templateUrl: './chart-purchase-statistics-month-supplier.component.html',
  styleUrls: ['./chart-purchase-statistics-month-supplier.component.scss']
})
export class ChartPurchaseStatisticsMonthSupplierComponent implements OnInit {
  years: number[] = [];
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number | null = new Date().getMonth() + 1;
  months: { value: number, name: string }[] = [];
  suppliers: ChartInterface[] = [];

  constructor(private chartData: ChartService) { }

  ngOnInit(): void {
    this.years = this.generateYearData_1();
    this.months = this.generateMonthsSupplierData();
    if (this.selectedYear && this.selectedMonth) {
      this.loadChartDataMonthSupplier(this.selectedYear, this.selectedMonth);
    }
  }

  loadChartDataMonthSupplier(year: number, month: number): void {
    this.chartData.getChartDataMonthSupplier(year, month).subscribe(
      data => {
        if (data && data.labels && data.datasets && data.datasets.length > 0) {
          const labels = data.labels;
          const datasetData = data.datasets[0].data;

          if (labels.length === datasetData.length) {
            this.suppliers = labels.map((label, index) => ({
              entidad: label,
              monto: datasetData[index],
            }));
          } else {
            console.error('Desajuste en la longitud de los datos');
            this.suppliers = [];
          }
        } else {
          this.suppliers = [];
        }
      },
      error => {
        console.error('Error al cargar los datos', error);
        this.suppliers = [];
      }
    );
  }


  onYearChange($event: Event): void {
    const year = parseInt(($event.target as HTMLSelectElement).value, 10);
    this.selectedYear = year;
    this.selectedMonth = new Date().getMonth() + 1;
    if (this.selectedYear && this.selectedMonth) {
      this.loadChartDataMonthSupplier(this.selectedYear, this.selectedMonth);
    }
  }

  onMonthChange($event: Event): void {
    const month = parseInt(($event.target as HTMLSelectElement).value, 10);
    this.selectedMonth = month;
    if (this.selectedYear !== null) {
      this.loadChartDataMonthSupplier(this.selectedYear, this.selectedMonth);
    }
  }
  generateYearData_1(): number[] {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10;
    const yearsData = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);
    return yearsData;
  }

  generateMonthsSupplierData(): { value: number, name: string }[] {
    const monthsSupplierNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    return monthsSupplierNames.map((name, index) => ({
      value: index + 1, name
    }))
  }

}
