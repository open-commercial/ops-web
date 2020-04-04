import { Component, OnInit } from '@angular/core';
import { LoadingOverlayService } from '../../services/loading-overlay.service';

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.scss']
})
export class LoadingOverlayComponent implements OnInit {
  loading = false;

  constructor(public loadingOverlayService: LoadingOverlayService) { }

  ngOnInit() {
    this.loadingOverlayService.getValue()
      .subscribe(value => this.loading = value)
    ;
  }
}
