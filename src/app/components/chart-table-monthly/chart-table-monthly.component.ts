import { Component, inject, Input, OnInit } from '@angular/core';
import { TableChartDirective } from 'src/app/directives/table-chart.directive';
import { EstadisticasService } from 'src/app/services/estadisticas.service';

@Component({
  selector: 'app-chart-table-monthly',
  templateUrl: './chart-table-monthly.component.html',
  styleUrls: ['./chart-table-monthly.component.scss']
})
export class ChartTableMonthlyComponent extends TableChartDirective implements OnInit {

  @Input() title: string;
  @Input() chartType: 'compras' | 'ventas';
  selectedYear: number = this.years[0];
  selectedMonth: number = this.months[0].value;
  estadisticasService: EstadisticasService = inject(EstadisticasService);

  ngOnInit(): void {
    super.ngOnInit();
    this.loadChartData();
  }

  override loadChartData(): void {
    this.loadingData = true;
    if (this.chartType === 'compras') {
      this.estadisticasService.getMontoNetoCompradoPorProveedorMensual(this.selectedYear, this.selectedMonth).subscribe(data => {
        this.updateChart(
          data.map(item => ({
            value: item.monto,
            name: item.entidad
          }))
        );
        this.loadingData = false;
      });
    }
    if (this.chartType === 'ventas') {
      this.estadisticasService.getMontoNetoVendidoPorClienteMensual(this.selectedYear, this.selectedMonth).subscribe(data => {
        this.updateChart(
          data.map(item => ({
            value: item.monto,
            name: item.entidad
          })));
        this.loadingData = false;
      });
    }
  }

}
