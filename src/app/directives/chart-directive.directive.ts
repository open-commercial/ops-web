import { Directive, OnInit } from '@angular/core';
import { ChartInterface } from '../models/chart-interface';
import { ChartService } from '../services/chart.service';

@Directive({
  selector: '[appChartDirective]'
})
export abstract class ChartDirectiveDirective implements OnInit {

  years: number[] = []
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number | null = new Date().getMonth() + 1;
  months: { value: number, name: string }[] = [];
  suppliers: ChartInterface[] = [];


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

}
