import { Component, inject, OnInit } from '@angular/core';
import { TableChartDirective } from 'src/app/directives/table-chart.directive';
import { EstadisticasService } from 'src/app/services/estadisticas.service';

@Component({
  selector: 'app-compra-anual-por-proveedor-chart',
  templateUrl: './compra-anual-por-proveedor-chart.component.html',
  styleUrls: ['./compra-anual-por-proveedor-chart.component.scss']
})
export class CompraAnualPorProveedorChartComponent extends TableChartDirective implements OnInit {

  selectedYear: number = this.years[0];
  estadisticasService: EstadisticasService = inject(EstadisticasService);

  ngOnInit(): void {
    super.ngOnInit();
    this.loadChartData();
  }

  override loadChartData(): void {
    this.loadingData = true;
    this.estadisticasService.getMontoNetoCompradoAnualPorProveedor(this.selectedYear).subscribe(data => {
      this.updateChart(
        data.map(item => ({
          value: item.monto,
          name: item.entidad
        })));
      this.loadingData = false;
    });
  }
}
