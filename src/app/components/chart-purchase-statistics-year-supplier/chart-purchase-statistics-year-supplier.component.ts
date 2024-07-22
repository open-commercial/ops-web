import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
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
  proveedores: ChartInterface[] = [];

  constructor(private chartData: ChartService) { }


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

  ngOnInit(): void {
    this.years = this.generateYearsData_2();
    this.loadChartDataAnnualSupplier(this.selectedYearSupplier);
  }

  loadChartDataAnnualSupplier(year: number): void {
    this.chartData.getChartDataAnnualSupplier(year).subscribe(data => {
      this.proveedores = data.datasets[0].data.map((monto, index) =>({
        entidad: data.labels[index],
        monto: monto
      }));
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
