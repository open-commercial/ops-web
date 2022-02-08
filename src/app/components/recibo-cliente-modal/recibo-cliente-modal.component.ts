import {Component, OnInit} from '@angular/core';
import {ReciboModalDirective} from '../../directives/recibo-modal.directive';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {FormasDePagoService} from '../../services/formas-de-pago.service';
import {Recibo} from '../../models/recibo';
import {Cliente} from '../../models/cliente';
import {SucursalesService} from '../../services/sucursales.service';
import {Observable} from 'rxjs';
import {RecibosService} from '../../services/recibos.service';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-recibo-cliente-modal',
  templateUrl: '../recibo-modal/recibo-modal.component.html',
})
export class ReciboClienteModalComponent extends ReciboModalDirective implements OnInit {
  cliente: Cliente;
  constructor(public activeModal: NgbActiveModal,
              protected fb: FormBuilder,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              protected formasDePagoService: FormasDePagoService,
              protected authService: AuthService,
              protected recibosService: RecibosService,
              private sucursalesService: SucursalesService) {
    super(activeModal, fb, loadingOverlayService, mensajeService, formasDePagoService, authService);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  getTitle(): string {
    return 'Nuevo Recibo de Cliente';
  }

  getReciboObject(): Recibo {
    const formValues = this.form.value;
    return {
      idCliente: this.cliente.idCliente,
      idSucursal: this.sucursalesService.getIdSucursal(),
      idFormaDePago: Number(formValues.idFormaDePago),
      monto: formValues.monto,
      concepto: formValues.concepto,
    };
  }

  getSubmitObservable(recibo: Recibo): Observable<Recibo> {
    return this.recibosService.guardarReciboCliente(recibo);
  }
}
