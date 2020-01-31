import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FacturasService } from '../../services/facturas.service';
import { HelperService } from '../../services/helper.service';
import { NgbAccordionConfig, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { Cliente } from '../../models/cliente';
import { ClientesService } from '../../services/clientes.service';
import { MensajeService } from '../../services/mensaje.service';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-factura-venta',
  templateUrl: './factura-venta.component.html',
  styleUrls: ['./factura-venta.component.scss']
})
export class FacturaVentaComponent implements OnInit {
  title = '';
  form: FormGroup;

  helper = HelperService;

  localStorageKey = 'nuevaFactura';

  clientePredeterminado: Cliente = null;
  clientePredeterminadoLoading = false;

  constructor(private fb: FormBuilder,
              modalConfig: NgbModalConfig,
              private modalService: NgbModal,
              accordionConfig: NgbAccordionConfig,
              private facturasService: FacturasService,
              private route: ActivatedRoute,
              private location: Location,
              private clientesService: ClientesService,
              private mensajeService: MensajeService) {
    accordionConfig.type = 'dark';
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
  }

  ngOnInit() {
    this.createFrom();
    this.handleClientePredeterminado();
  }

  handleClientePredeterminado() {
    this.clientePredeterminadoLoading = true;
    this.clientesService.existeClientePredetermiando()
      .subscribe(
        v => {
          if (v) {
            this.clientesService.getClientePredeterminado()
              .pipe(finalize(() => this.clientePredeterminadoLoading = false))
              .subscribe(
                c => this.clientePredeterminado = c,
                e => this.mensajeService.msg(e.error, MensajeModalType.ERROR),
              )
            ;
          } else {
            this.clientePredeterminadoLoading = false;
          }
        },
        e => {
          this.clientePredeterminadoLoading = false;
          this.mensajeService.msg(e.error, MensajeModalType.ERROR);
        }
      )
    ;
  }

  createFrom() {
    this.form = this.fb.group({
      cliente: null,
      renglones: []
    });
  }

  submit() {
    if (this.form.valid) {}
  }

  handleSelectCliente(c: Cliente) {
    console.log(c);
  }

  volverAlListado() {
    this.location.back();
  }
}
