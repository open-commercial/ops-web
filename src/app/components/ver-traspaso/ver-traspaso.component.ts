import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingOverlayService } from '../../services/loading-overlay.service';
import { TraspasosService } from '../../services/traspasos.service';
import { combineLatest } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Traspaso } from '../../models/traspaso';
import { RenglonTraspaso } from '../../models/renglon-traspaso';
import { MensajeService } from '../../services/mensaje.service';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-ver-traspaso',
  templateUrl: './ver-traspaso.component.html',
  styleUrls: ['./ver-traspaso.component.scss']
})
export class VerTraspasoComponent implements OnInit {
  traspaso: Traspaso;
  renglones: RenglonTraspaso[] = [];

  constructor(private route: ActivatedRoute,
              private router: Router,
              private loadingOverlayService: LoadingOverlayService,
              private traspasosService: TraspasosService,
              private mensajeService: MensajeService,
              private location: Location) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadingOverlayService.activate();

    combineLatest([
      this.traspasosService.getTraspaso(id),
      this.traspasosService.getRenglonesDeTraspaso(id),
    ])
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (data: [Traspaso, RenglonTraspaso[]]) => {
          this.traspaso = data[0];
          this.renglones = data[1];
        },
        err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          this.volverAlListado();
        }
      )
    ;
  }

  volverAlListado() {
    this.location.back();
  }

}
