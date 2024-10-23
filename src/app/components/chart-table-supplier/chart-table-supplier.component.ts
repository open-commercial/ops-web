import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChartInterface } from 'src/app/models/chart-interface';


@Component({
  selector: 'app-chart-table-supplier',
  templateUrl: './chart-table-supplier.component.html',
  styleUrls: ['./chart-table-supplier.component.scss']
})
export class ChartTableSupplierComponent {
  @Input() title: string = '';
  @Input() suppliers: ChartInterface[] = [];
  @Input() years: number[] = [];
  @Input() months: {value: number, name: string}[] = [];
  @Input() selectedYear: number | null = null;
  @Input() selectedMonth: number | null = null;
  @Input() showMonthSelector: boolean = true;

  @Output() yearChange = new EventEmitter<number>();
  @Output() monthChange = new EventEmitter<number>();

onYearChange($event: Event): void {
    const target = $event.target as HTMLSelectElement;
    const year = parseInt(target?.value ?? '', 10); 
    if (!isNaN(year)) {
        this.yearChange.emit(year);
    } else {
        console.error("Error: El evento no tiene un valor válido", $event);
    }
}

onMonthChange($event: Event): void {
    const target = $event.target as HTMLSelectElement;
    const month = parseInt(target?.value ?? '', 10); 
    if (!isNaN(month)) {
        this.monthChange.emit(month);
    } else {
        console.error("Error: El evento no tiene un valor válido", $event);
    }
}

}
