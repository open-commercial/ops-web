import { Component, inject, OnInit } from '@angular/core';
import { BarChartDirective } from 'src/app/directives/bar-chart.directive';
import { EstadisticasService } from 'src/app/services/estadisticas.service';

@Component({
  selector: 'app-compra-mensual-chart',
  templateUrl: './compra-mensual-chart.component.html',
  styleUrls: ['./compra-mensual-chart.component.scss']
})
export class CompraMensualChartComponent extends BarChartDirective implements OnInit {

  selectedYear: number = this.years[0];
  estadisticasService: EstadisticasService = inject(EstadisticasService);

  ngOnInit(): void {
    super.ngOnInit();
    this.loadChartData();
  }

  override loadChartData(): void {
    this.loadingData = true;
    this.estadisticasService.getMontoNetoCompradoMensual(this.selectedYear).subscribe(data => {
      const monthsAsString = this.convertPeriodosToMonthsAsString(data.map(i => i.periodo));
      const montos = data.map(i => i.monto);
      this.updateChart(monthsAsString, [{ data: montos, label: 'Monto neto' }]);
      this.loadingData = false;
    });
  }

}
