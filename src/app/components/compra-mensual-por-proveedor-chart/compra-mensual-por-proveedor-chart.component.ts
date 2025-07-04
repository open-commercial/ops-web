import { Component, inject, OnInit } from '@angular/core';
import { TableChartDirective } from 'src/app/directives/table-chart.directive';
import { EstadisticasService } from 'src/app/services/estadisticas.service';

@Component({
  selector: 'app-compra-mensual-por-proveedor-chart',
  templateUrl: './compra-mensual-por-proveedor-chart.component.html',
  styleUrls: ['./compra-mensual-por-proveedor-chart.component.scss']
})
export class CompraMensualPorProveedorChartComponent extends TableChartDirective implements OnInit {

  selectedYear: number = this.years[0];
  selectedMonth: number = this.months[0].value;
  estadisticasService: EstadisticasService = inject(EstadisticasService);

  ngOnInit(): void {
    super.ngOnInit();
    this.loadChartData();
  }

  override loadChartData(): void {
    this.loadingData = true;
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
}
