import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-sales-statistics-year',
  templateUrl: './chart-sales-statistics-year.component.html',
  styleUrls: ['./chart-sales-statistics-year.component.scss']
})
export class ChartSalesStatisticsYearComponent implements OnInit {

  constructor(private chartData: ChartService) { }

  ngOnInit(): void {
    this.loadChartSalesYear();
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
  };


  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1.5,
    plugins: {
      legend: {
        position: 'bottom',
        align: 'start',
        labels: {
          color: 'rgb(0,0, 0)'
        }
      }
    }
  };

  loadChartSalesYear(){
    this.chartData.getChartDataSalesAnnual().subscribe(data => {
      let labels = this.generateYearsFilter();

      this.barChartData = {
        ...this.barChartData,
        labels: labels,
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
      }
    })
  }

  generateYearsFilter(){
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 4 + 1;
    return Array.from({ length: 4 }, (_, i) => startYear + i);
  }
}
