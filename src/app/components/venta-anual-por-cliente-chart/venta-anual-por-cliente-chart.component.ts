import { Component, inject, OnInit } from '@angular/core';
import { TableChartDirective } from 'src/app/directives/table-chart.directive';
import { EstadisticasService } from 'src/app/services/estadisticas.service';

@Component({
  selector: 'app-venta-anual-por-cliente-chart',
  templateUrl: './venta-anual-por-cliente-chart.component.html',
  styleUrls: ['./venta-anual-por-cliente-chart.component.scss']
})
export class VentaAnualPorClienteChartComponent extends TableChartDirective implements OnInit {

  selectedYear: number = this.years[0];
  estadisticasService: EstadisticasService = inject(EstadisticasService);

  ngOnInit(): void {
    super.ngOnInit();
    this.loadChartData();
  }

  override loadChartData(): void {
    this.loadingData = true;
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
