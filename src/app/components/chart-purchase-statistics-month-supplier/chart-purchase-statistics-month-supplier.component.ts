import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
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
  months: { value: number, name: string } [] = [];
  
  constructor(private chartData: ChartService) { }

  ngOnInit(): void {
    this.years = this.generateYearData_1();
    this.months = this.generateMonthsSupplierData();
  }

  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: '',
        backgroundColor: 'rgb(242, 220, 71)',
        borderColor: 'rgb(242, 220, 71)',
        borderWidth: 0.5
      }
    ]
  }

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1.5,
    scales: {
      x: {
        ticks: {
          callback: function (value) {
            const label = this.getLabelForValue(value as number);
            return label.length > 10 ? label.substring(0, 10) + '...' : label;
          }
        },
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        align: 'start',
        labels: {
          color: 'rgb(0,0, 0)'
        }
      }
    }
  }

  loadChartDataMonthSupplier(year: number, month: number): void {
    this.chartData.getChartDataMonthSupplier(year, month).subscribe(data => {
      this.barChartData = {
        ...this.barChartData, 
        labels: data.labels,
        datasets: [
          {
            ...data.datasets[0],
            backgroundColor: '#f0c71b',
            borderColor: '#f0c71b',
            hoverBackgroundColor: '#f0c71b',
            hoverBorderColor: '#f0c71b',
            borderWidth: 1
          }
        ]
      };
    })
  }
  onYearChange($event: Event): void {
    const year = parseInt(($event.target as HTMLSelectElement).value, 10);
    this.selectedYear = year;
    this.selectedMonth = null;
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
    const yearsData = Array.from({length: currentYear - startYear + 1}, (_, i)=> currentYear - i);
    return yearsData;
  } 

  generateMonthsSupplierData(): { value: number, name: string }[] {
    const monthsSupplierNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    console.log('Meses generados',monthsSupplierNames);
    return monthsSupplierNames.map((name, index) => ({
      value: index + 1, name }))
  }

}
