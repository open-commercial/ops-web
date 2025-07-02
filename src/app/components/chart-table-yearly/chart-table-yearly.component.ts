import { Component, Input, OnInit, inject } from '@angular/core';
import { TableChartDirective } from 'src/app/directives/table-chart.directive';
import { EstadisticasService } from 'src/app/services/estadisticas.service';

@Component({
  selector: 'app-chart-table-yearly',
  templateUrl: './chart-table-yearly.component.html',
  styleUrls: ['./chart-table-yearly.component.scss']
})
export class ChartTableYearlyComponent extends TableChartDirective implements OnInit {

  @Input() title: string;
  @Input() chartType: 'compras' | 'ventas';
  selectedYear: number = this.years[0];
  estadisticasService: EstadisticasService = inject(EstadisticasService);

  ngOnInit(): void {
    super.ngOnInit();
    this.loadChartData();
  }

  override loadChartData(): void {
    this.loadingData = true;
    if (this.chartType === 'compras') {
      this.estadisticasService.getMontoNetoCompradoAnualPorProveedor(this.selectedYear).subscribe(data => {
        this.updateChart(
          data.map(item => ({
            value: item.monto,
            name: item.entidad
          })));
        this.loadingData = false;
      });
    }
    if (this.chartType === 'ventas') {
      this.estadisticasService.getMontoNetoVendidoPorClienteAnual(this.selectedYear).subscribe(data => {
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
