import { Component, } from '@angular/core';
import { NgbAccordionConfig, } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html'
})
export class EstadisticasComponent {

  constructor(accordionConfig: NgbAccordionConfig) {
    accordionConfig.type = 'dark';
  }

}
