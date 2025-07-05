import { Directive, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SucursalesService } from '../services/sucursales.service';
import { ChartDirective } from './chart.directive';

@Directive()
export abstract class TableChartDirective extends ChartDirective implements OnInit, OnDestroy {

  sucursalesService = inject(SucursalesService);
  sucursalSeleccionadaSubscription: Subscription;
  years: number[] = this.generateYears();
  months: { value: number, name: string }[] = this.generateMonths();
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

  updateChart(data: { value: number, name: string }[]): void {
    this.tableChartData = data;
  }
}
