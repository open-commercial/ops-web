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

    this.selectedMonth = this.selectedMonth || (new Date().getMonth() + 1);

    if (this.selectedYear && (this.selectedMonth || this.isMonthOptional())) {
      this.loadChartData(this.selectedYear, this.selectedMonth);
    }
  }

  abstract loadChartData(year: number, month?: number | null): void;

  isMonthOptional(): boolean {
    return true;
  }

  onYearChange(year: number | Event): void {
    if (typeof year === 'number') {
      this.selectedYear = year;
      this.selectedMonth = this.selectedMonth || new Date().getMonth() + 1;
      if (this.selectedYear && this.selectedMonth) {
        this.loadChartData(this.selectedYear, this.selectedMonth!);
      }
    } else if (year instanceof Event) {
      const target = (year.target as HTMLSelectElement);
      if (target && target.value) {
        const parsedYear = parseInt(target.value, 10);
        this.selectedYear = parsedYear;
        this.selectedMonth = this.selectedMonth || new Date().getMonth() + 1;
        if (this.selectedYear && this.selectedMonth) {
          this.loadChartData(this.selectedYear, this.selectedMonth!);
        }
      } else {
        console.error("Error: El evento no tiene un valor válido", year);
      }
    } else {
      console.error("Error: Tipo inesperado de parámetro en onYearChange", year);
    }
  }

  onMonthChange(month: number | Event): void {
    if (typeof month === 'number') {
      this.selectedMonth = month;
    } else if (month instanceof Event) {
      const target = (month.target as HTMLSelectElement);
      if (target && target.value) {
        this.selectedMonth = parseInt(target.value, 10);
      }
    }
    this.selectedMonth = this.selectedMonth || new Date().getMonth() + 1;

    if (this.selectedYear && this.selectedMonth) {
      this.loadChartData(this.selectedYear, this.selectedMonth);
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

  protected handleChartData(data: any): void {
    if (data && data.labels && data.datasets && data.datasets.length > 0) {
      const labels = data.labels;
      const datasetData = data.datasets[0].data;

      if (labels.length === datasetData.length) {
        this.suppliers = labels.map((label, index) => ({
          entidad: label,
          monto: datasetData[index],
        }));
        this.updateChart(data, labels);
      } else {
        console.log('Desajuste en la longitud de los datos');
        this.suppliers = [];
      }
    }
  }

}
