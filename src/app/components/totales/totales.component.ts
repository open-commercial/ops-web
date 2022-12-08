import { Component, Input } from '@angular/core';

export interface TotalData {
  label: string;
  data: number;
  hasRole?: boolean;
}

@Component({
  selector: 'app-totales',
  templateUrl: './totales.component.html'
})
export class TotalesComponent {
  private pLoading = false;
  @Input() set loading(value: boolean) { this.pLoading = value; }
  get loading(): boolean { return this.pLoading; }

  private pData: TotalData[] = [];
  @Input() set data(value: TotalData[]) { this.pData = value; }
  get data(): TotalData[] { return this.pData; }
}
