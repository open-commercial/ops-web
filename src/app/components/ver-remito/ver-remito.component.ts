import {Component, OnDestroy, OnInit} from '@angular/core';
import {combineLatest, Subscription} from 'rxjs';
import {RemitosService} from '../../services/remitos.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {ActivatedRoute} from '@angular/router';
import {finalize} from 'rxjs/operators';
import {RenglonRemito} from '../../models/renglon-remito';
import {Remito} from '../../models/remito';
import {MensajeService} from '../../services/mensaje.service';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {Location} from '@angular/common';
import {saveAs} from 'file-saver';
import {HelperService} from '../../services/helper.service';
import {SucursalesService} from '../../services/sucursales.service';

@Component({
  selector: 'app-ver-remito',
  templateUrl: './ver-remito.component.html',
  styleUrls: ['./ver-remito.component.scss']
})
export class VerRemitoComponent implements OnInit, OnDestroy {
  remito: Remito;
  renglones: RenglonRemito[] = [];

  helper = HelperService;

  subscription: Subscription;

  constructor(private remitosService: RemitosService,
              private route: ActivatedRoute,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private location: Location,
              private sucursalesService: SucursalesService) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadingOverlayService.activate();

    combineLatest([
      this.remitosService.getRemito(id),
      this.remitosService.getRenglonesDeRemito(id),
    ])
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (data: [Remito, RenglonRemito[]]) => {
          this.remito = data[0];
          this.renglones = data[1];
        },
        err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          this.volverAlListado();
        }
      )
    ;

    this.subscription.add(this.sucursalesService.sucursal$.subscribe(() => this.volverAlListado()));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  volverAlListado() {
    this.location.back();
  }

  downloadRemitoPdf() {
    this.loadingOverlayService.activate();
    this.remitosService.getRemitoPdf(this.remito.idRemito)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (res) => {
          const file = new Blob([res], {type: 'application/pdf'});
          saveAs(file, `Remito_${this.remito.serie}-${this.remito.nroRemito}.pdf`);
        },
        () => this.mensajeService.msg('Error al generar el reporte', MensajeModalType.ERROR),
      )
    ;
  }
}
