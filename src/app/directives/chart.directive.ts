import { Directive, OnInit } from '@angular/core';
import { ChartInterface } from '../models/chart-interface';
import { ChartConfiguration } from 'chart.js';

@Directive()
export abstract class ChartDirective implements OnInit {
  years: number[] = []
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number | null = new Date().getMonth() + 1;
  months: { value: number, name: string }[] = [];
  suppliers: ChartInterface[] = [];

  protected loadingData: boolean = false;
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
    scales: {
      y: {
        ticks: {
          callback: function (value: number) {
            return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        align: 'start',
        labels: {
          color: 'rgb(0,0, 0)',
        }
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(tooltipItem.raw as number);
          }
        }
      }
    }
  };

  ngOnInit(): void {
    this.years = this.generateYearData();
    this.months = this.generateMonthsData();

    this.selectedYear = this.selectedYear || new Date().getFullYear();
    this.selectedMonth = this.selectedMonth || (new Date().getMonth() + 1);

    if (this.selectedYear && (this.selectedMonth)) {
      this.loadChartData(this.selectedYear, this.selectedMonth);
    }
  }

  abstract loadChartData(year: number, month?: number | null): void;

  protected setLoadingState(isloading: boolean): void {
    this.loadingData = isloading;
  }

  onYearChange(year: number | Event): void {
    const parsedYear = this.parseInputToNumber(year);
    if (Number.isInteger(parsedYear) && parsedYear !== this.selectedYear) {
      this.selectedYear = parsedYear;
      this.loadChartData(this.selectedYear, this.selectedMonth);
    }
  }
  
  onMonthChange(month: number | Event): void {
    const parsedMonth = this.parseInputToNumber(month);
    if (Number.isInteger(parsedMonth) && parsedMonth !== this.selectedMonth) {
      this.selectedMonth = parsedMonth;
  
      if (this.selectedYear) {
        this.loadChartData(this.selectedYear, this.selectedMonth);
      } else {
        console.error("Error: No se puede seleccionar un mes sin un año válido.");
      }
    }
  }
  
  private parseInputToNumber(input: number | Event): number | null {
    if (typeof input === 'number') {
      return input;
    } else if (input instanceof Event) {
      const target = input.target as HTMLSelectElement;
      const value = parseInt(target?.value, 10);
      return Number.isNaN(value) ? null : value;
    }
    return null;
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
    if (data?.labels && data?.datasets.length > 0) {
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
