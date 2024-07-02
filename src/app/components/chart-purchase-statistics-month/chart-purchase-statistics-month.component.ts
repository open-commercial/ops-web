import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-purchase-statistics-month',
  templateUrl: './chart-purchase-statistics-month.component.html',
  styleUrls: ['./chart-purchase-statistics-month.component.scss']
})
export class ChartPurchaseStatisticsMonthComponent implements OnInit {

  years: number[] = [];
  selectedYear: number = new Date().getFullYear();

  constructor(private chartData: ChartService,
              private changeDetectorRef: ChangeDetectorRef) { }

  
  ngOnInit(): void {
    this.years = this.generateYearsData();
    this.loadChartDataMonth(this.selectedYear);
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
        labels: {
          color: 'rgb(0,0, 0)'
        }
      }
    }
  };

  loadChartDataMonth(year: number):void {
    this.chartData.getChartDataMonth(year).subscribe(data => {
      console.log(data)
      this.barChartData = {
        labels: data.labels,
        datasets: [
          {
            data: data.datasets[0].data,
            label: data.datasets[0].label,
            backgroundColor: '#f0c71b',
            borderColor: '#f0c71b',
            hoverBackgroundColor: '#f0c71b',
            hoverBorderColor: '#f0c71b',
            borderWidth: 1
          }
        ]
      };
      this.changeDetectorRef.detectChanges();
    })
  }

  onYearChange($event) {
    this.selectedYear = $event.target.value;
    this.loadChartDataMonth(this.selectedYear);
  }

  generateYearsData(): number[] {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10;
    const yearsData = [];
    for (let i = startYear; i <= currentYear; i++) {
      yearsData.push(i);  
    }
    return yearsData;
  }
}
