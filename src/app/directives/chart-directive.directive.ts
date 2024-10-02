import { Directive, OnInit } from '@angular/core';
import { ChartInterface } from '../models/chart-interface';
import { ChartService } from '../services/chart.service';
import { ChartConfiguration } from 'chart.js';

@Directive({
  selector: '[appChartDirective]'
})
export abstract class ChartDirectiveDirective implements OnInit {

  years: number[] = []
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number | null = new Date().getMonth() + 1;
  months: { value: number, name: string }[] = [];
  suppliers: ChartInterface[] = [];

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
          color: 'rgb(0,0, 0)',

        }
      }
    }
  }

  constructor(protected chartData: ChartService) { }

  ngOnInit(): void {
    
    this.years = this.generateYearData();
    this.months = this.generateMonthsData();
    if (this.selectedYear && this.selectedMonth) {
      this.loadChartData(this.selectedYear, this.selectedMonth!);
    }
  }

  abstract loadChartData(year: number, month: number): void;

  onYearChange($event: Event): void {
    const year = parseInt(($event.target as HTMLSelectElement).value, 10);
    this.selectedYear = year;
    this.selectedMonth = new Date().getMonth() + 1;
    if (this.selectedYear && this.selectedMonth) {
      this.loadChartData(this.selectedYear, this.selectedMonth!);
    }
  }

  OnMonthChange($event: Event): void {
    const month = parseInt(($event.target as HTMLSelectElement).value, 10);
    this.selectedMonth = month;
    if (this.selectedYear && this.selectedMonth) {
      this.loadChartData(this.selectedYear, this.selectedMonth!);
    }
  }

  generateYearData(): number[] {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10;
    return Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);
  }

  generateMonthsData(): { value: number, name: string }[] {
    const monthsNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return monthsNames.map((name, index) => ({
      value: index + 1, name
    }))
  }

  updateChart(data: any, labels: string[]): void {
    this.barChartData = {
      labels: labels,
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
  }

}
