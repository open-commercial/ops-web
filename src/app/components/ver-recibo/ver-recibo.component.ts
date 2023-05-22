import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {RecibosService} from '../../services/recibos.service';
import {finalize} from 'rxjs/operators';
import {Recibo} from '../../models/recibo';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {HelperService} from '../../services/helper.service';

@Component({
  selector: 'app-ver-recibo',
  templateUrl: './ver-recibo.component.html',
  styleUrls: ['./ver-recibo.component.scss']
})
export class VerReciboComponent implements OnInit {
  recibo: Recibo;
  helper = HelperService;
  constructor(private route: ActivatedRoute,
              private location: Location,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private recibosService: RecibosService) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadingOverlayService.activate();
    this.recibosService.getRecibo(id)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: (r) => this.recibo = r,
        error: err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          this.volverAlListado();
        }
      })
    ;
  }

  volverAlListado() {
    this.location.back();
  }
}
