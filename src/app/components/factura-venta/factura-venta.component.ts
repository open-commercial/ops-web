import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FacturasService } from '../../services/facturas.service';
import { FacturaVenta } from '../../models/factura-venta';
import { HelperService } from '../../services/helper.service';
import { NgbAccordionConfig, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-factura-venta',
  templateUrl: './factura-venta.component.html',
  styleUrls: ['./factura-venta.component.scss']
})
export class FacturaVentaComponent implements OnInit {
  title = '';
  form: FormGroup;
  datosParaEdicion = {
    factura: null,
  };

  helper = HelperService;

  localStorageKey = 'nuevaFactura';

  constructor(private fb: FormBuilder,
              modalConfig: NgbModalConfig,
              private modalService: NgbModal,
              accordionConfig: NgbAccordionConfig,
              private facturasService: FacturasService,
              private route: ActivatedRoute) {
    accordionConfig.type = 'dark';
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
  }

  ngOnInit() {
    this.createFrom();

    if (this.route.snapshot.paramMap.has('id')) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.getDatosParaEditar(id);
    } else {
      this.title = 'Nueva Factura de Venta';
    }
  }

  getDatosParaEditar(id: number) {
    this.facturasService.getFactura(Number(id))
      .subscribe((f: FacturaVenta) => {
        console.log(f);
        this.datosParaEdicion.factura = f;
        this.title = 'Editar Factura de Venta #' +
          (this.datosParaEdicion.factura.numSerieAfip
            ? this.helper.formatNumFactura(this.datosParaEdicion.factura.numSerieAfip, this.datosParaEdicion.factura.numFacturaAfip)
            : this.helper.formatNumFactura(this.datosParaEdicion.factura.numSerie, this.datosParaEdicion.factura.numFactura)
          )
        ;
      })
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

}
