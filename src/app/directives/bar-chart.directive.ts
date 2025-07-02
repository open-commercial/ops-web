import { Directive, inject, OnDestroy, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { Subscription } from 'rxjs';
import { SucursalesService } from '../services/sucursales.service';

@Directive()
export abstract class BarChartDirective implements OnInit, OnDestroy {

  sucursalesService = inject(SucursalesService);
  sucursalSeleccionadaSubscription: Subscription;
  years: number[] = this.generateYearsData();
  months: { value: number, name: string }[] = this.generateMonthsData();
  loadingData: boolean = false;
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1.5,
    scales: {
      y: {
        ticks: {
          callback: function (value: number) {
            return new Intl.NumberFormat('es-AR',
              { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 })
              .format(Number(value));
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return new Intl.NumberFormat('es-AR',
              { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 })
              .format(tooltipItem.raw as number);
          }
        }
      }
    }
  };

  abstract loadChartData(): void;

  ngOnInit(): void {
    this.sucursalSeleccionadaSubscription = this.sucursalesService.sucursalSeleccionada$.subscribe(s => {
      this.loadChartData();
    });
  }

  ngOnDestroy(): void {
    this.sucursalSeleccionadaSubscription.unsubscribe();
  }

  generateYearsData(): number[] {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10;
    return Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);
  }

  generateMonthsData(): { value: number, name: string }[] {
    const monthsNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return monthsNames.map((name, index) => ({
      value: index + 1, name
    }))
  }

  updateChart(labels: string[], datasets: { data: any, label: string, color?: string }[]): void {
    this.barChartData = {
      labels: labels,
      datasets: datasets.map(ds => {
        const color = ds.color || '#F2DC47';
        return {
          data: ds.data,
          label: ds.label,
          backgroundColor: color,
          borderColor: color,
          hoverBackgroundColor: color,
          hoverBorderColor: color,
          borderWidth: 1
        };
      })
    };
  }

}
