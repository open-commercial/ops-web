import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-purchase-statistics-year-supplier',
  templateUrl: './chart-purchase-statistics-year-supplier.component.html',
  styleUrls: ['./chart-purchase-statistics-year-supplier.component.scss']
})
export class ChartPurchaseStatisticsYearSupplierComponent implements OnInit {

  constructor(private chartData: ChartService) { }


  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: '' }
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
        labels: {
          color: 'rgb(0,0, 0)'
        }
      }
    }
  }

  ngOnInit(): void {
    this.loadChartDataAnnualSupplier();
  }

  loadChartDataAnnualSupplier(): void {
    this.chartData.getChartDataAnnualSupplier().subscribe(data => {
      this.barChartData = {
        ...this.barChartData, labels: data.labels,
        datasets: [
          {
            ...data.datasets[0],
            backgroundColor: '#f0c71b',
            borderColor: '#f0c71b',
            borderWidth: 1
          }
        ]
      };
      console.log(data)
    })
  }
}
