import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-disponibilidad-stock-modal',
  templateUrl: './disponibilidad-stock-modal.component.html',
  styleUrls: ['./disponibilidad-stock-modal.component.scss']
})
export class DisponibilidadStockModalComponent implements OnInit {
  data = [];

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
  }
}
