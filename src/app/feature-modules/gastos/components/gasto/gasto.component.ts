import {Component, OnInit, ViewChild} from '@angular/core';
import {Gasto} from '../../../../models/gasto';
import {GastoFormComponent} from '../../../../components/gasto-form/gasto-form.component';
import {CajasService} from '../../../../services/cajas.service';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {finalize} from 'rxjs/operators';
import {MensajeService} from '../../../../services/mensaje.service';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';
import {Location} from '@angular/common';

@Component({
  selector: 'app-gasto',
  templateUrl: './gasto.component.html'
})
export class GastoComponent implements OnInit {

  @ViewChild('gastoForm') gastoForm: GastoFormComponent;

  constructor(private location: Location,
              private cajasService: CajasService,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService) { }

  ngOnInit() {
    this.loadingOverlayService.activate();
    this.cajasService.estaAbiertaLaCaja()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: value => { if (!value) {
          this.mensajeService.msg(
            'La operación solicitada no se puede realizar. La caja se encuentra cerrada', MensajeModalType.ERROR
          );
          this.volverAlListado();
        }},
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }

  submit() {
    this.gastoForm.submit();
  }

  volverAlListado() {
    this.location.back();
  }

  onGastoSaved() {
    this.volverAlListado();
  }
}
