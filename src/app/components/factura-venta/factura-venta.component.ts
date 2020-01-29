import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FacturasService } from '../../services/facturas.service';
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
