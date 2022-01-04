import {Component, ViewChild} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Gasto} from '../../models/gasto';
import {GastoFormComponent} from '../gasto-form/gasto-form.component';

@Component({
  selector: 'app-nuevo-gasto-modal',
  templateUrl: './nuevo-gasto-modal.component.html',
  styleUrls: ['./nuevo-gasto-modal.component.scss']
})
export class NuevoGastoModalComponent {
  constructor(public activeModal: NgbActiveModal) { }

  @ViewChild('gastoForm') gastoForm: GastoFormComponent;

  submit() {
    this.gastoForm.submit();
  }

  onGastoSaved(gasto: Gasto) {
    this.activeModal.close(gasto);
  }
}
