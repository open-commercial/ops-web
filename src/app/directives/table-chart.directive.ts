import { Directive, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SucursalesService } from '../services/sucursales.service';

@Directive()
export abstract class TableChartDirective implements OnInit, OnDestroy {

  sucursalesService = inject(SucursalesService);
  sucursalSeleccionadaSubscription: Subscription;
  years: number[] = this.generateYearsData();
  months: { value: number, name: string }[] = this.generateMonthsData();
  loadingData: boolean = false;
  tableChartData: { value: number, name: string }[];

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

  updateChart(data: { value: number, name: string }[]): void {
    this.tableChartData = data;
  }
}
