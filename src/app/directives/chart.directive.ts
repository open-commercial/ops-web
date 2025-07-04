import { Directive } from '@angular/core';

@Directive()
export abstract class ChartDirective {

  generateYears(): number[] {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10;
    return Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);
  }

  generateMonths(): { value: number, name: string }[] {
    const monthsNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return monthsNames.map((name, index) => ({
      value: index + 1, name
    }))
  }

  convertPeriodosToMonthsAsString(periodos: number[]): string[] {
    return this.generateMonths()
      .filter(m => periodos.some(i => i === m.value))
      .map(m => m.name);
  }

}
