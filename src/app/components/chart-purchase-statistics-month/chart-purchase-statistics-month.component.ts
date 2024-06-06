import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-purchase-statistics-month',
  templateUrl: './chart-purchase-statistics-month.component.html',
  styleUrls: ['./chart-purchase-statistics-month.component.scss']
})
export class ChartPurchaseStatisticsMonthComponent implements OnInit {

  constructor(private chartData: ChartService) { }

  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: '' }
    ]
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1.5,
    plugins: {
      legend: {
        labels: {
          color: 'rgb(0,0, 0)'
        }
      }
    }
  };

  ngOnInit(): void {
    this.loadChartDataMonth();
  }
  loadChartDataMonth() {
    this.chartData.getChartDataMonth().subscribe(data => {
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
